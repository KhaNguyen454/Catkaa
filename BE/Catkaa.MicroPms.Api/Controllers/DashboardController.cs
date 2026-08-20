using Catkaa.MicroPms.Api.Data;
using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace Catkaa.MicroPms.Api.Controllers
{
    [Route("api/dashboard")]
    [Authorize]
    public class DashboardController : BaseApiController
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var today = now.Date;

            if (CurrentUserRole == "Admin")
            {
                // Lưu ý: Tính toán tuần tự vì EF Core DbContext không cho phép gọi nhiều thao tác async song song (Task.WhenAll)
                var totalUsers = await _context.Users.CountAsync();
                
                var totalHotels = await _context.Hotels.CountAsync();
                
                var totalSupportRequests = await _context.ContactRequests.CountAsync();

                // 1. Doanh thu từ bảng Payments (Gói dịch vụ hoặc thanh toán online)
                var paymentRevenue = await _context.Payments
                    .Where(p => p.Status == "Completed" || p.Status == "Thành công")
                    .SumAsync(p => p.Amount);

                // 2. Doanh thu từ bảng Bookings (Vì CSDL không lưu cột TotalPrice, cần tự tính toán: Số đêm * Giá phòng)
                var completedBookings = await _context.Bookings
                    .Include(b => b.Room)
                    .Where(b => b.Status == "CheckOut" || b.Status == "Completed")
                    .Select(b => new { b.CheckInDate, b.CheckOutDate, Price = b.Room != null ? b.Room.Price : 0 })
                    .ToListAsync();

                var bookingRevenue = completedBookings.Sum(b => 
                {
                    var nights = (b.CheckOutDate.Date - b.CheckInDate.Date).Days;
                    if (nights <= 0) nights = 1;
                    return nights * b.Price;
                });

                // Gom 2 nguồn doanh thu lại thành 1
                var totalSystemRevenue = paymentRevenue + bookingRevenue;

                // 3. Biểu đồ thống kê loại tài khoản (Admin Pie Chart)
                var hostsCount = await _context.Users.CountAsync(u => u.Role == "Host");
                // Gom tất cả các role còn lại (Guest, User, Customer, Admin) vào chung một nhãn để tổng cộng bằng đúng TotalUsers
                var normalUsersCount = totalUsers - hostsCount;

                var adminChartData = new System.Collections.Generic.List<RoomStatusChartDto>
                {
                    new RoomStatusChartDto { Label = "Người dùng thường", Value = normalUsersCount, Color = "#1686cb" },
                    new RoomStatusChartDto { Label = "Chủ khách sạn", Value = hostsCount, Color = "#10b981" }
                };

                var adminSummary = new DashboardSummaryDto
                {
                    TotalUsers = totalUsers,
                    TotalHotels = totalHotels,
                    TotalSystemRevenue = $"{totalSystemRevenue:N0} ₫",
                    TotalSupportRequests = totalSupportRequests,
                    RoomStatusChart = adminChartData
                };
                return Ok(ServiceResult<DashboardSummaryDto>.Ok("Success", adminSummary));
            }

            // Lấy danh sách HotelId của Host hiện tại
            var hostHotels = await _context.Hotels
                .Where(h => h.HostId == CurrentUserId)
                .Select(h => h.Id)
                .ToListAsync();

            // KPI: Room occupancy
            var totalRooms = await _context.Rooms.Where(r => hostHotels.Contains(r.HotelId)).CountAsync();
            var occupiedRooms = await _context.Rooms.Where(r => hostHotels.Contains(r.HotelId) && r.Status == "Occupied").CountAsync();
            var occupancyRate = totalRooms > 0 ? (occupiedRooms * 100.0 / totalRooms) : 0;
            
            // KPI: Guests this month
            var guestsThisMonth = await _context.Bookings
                .Where(b => hostHotels.Contains(b.HotelId) && b.CheckInDate >= startOfMonth)
                .CountAsync();

            // KPI: Today revenue (từ Bookings Checkout hôm nay của các KS thuộc Host)
            var completedTodayBookings = await _context.Bookings
                .Include(b => b.Room)
                .Where(b => hostHotels.Contains(b.HotelId) && b.CheckOutDate.Date == today && (b.Status == "CheckOut" || b.Status == "Completed"))
                .Select(b => new { b.CheckInDate, b.CheckOutDate, Price = b.Room != null ? b.Room.Price : 0 })
                .ToListAsync();

            var todayRevenue = completedTodayBookings.Sum(b => 
            {
                var nights = (b.CheckOutDate.Date - b.CheckInDate.Date).Days;
                if (nights <= 0) nights = 1;
                return nights * b.Price;
            });

            // KPI: Support requests count (chỉ lấy request của User này? Hoặc Host không có support, lấy 0. Hoặc lấy từ ContactRequests của Host? Giữ nguyên lấy all nếu chưa có UserId trong ContactRequest)
            var unresolvedSupportRequests = await _context.ContactRequests.CountAsync(c => !c.IsResolved); // Mặc định

            // BIỂU ĐỒ: Room status chart (Host Pie Chart)
            var roomStatuses = await _context.Rooms
                .Where(r => hostHotels.Contains(r.HotelId))
                .GroupBy(r => r.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var chartData = new System.Collections.Generic.List<RoomStatusChartDto>
            {
                new RoomStatusChartDto { Label = "Đang có khách", Value = roomStatuses.FirstOrDefault(r => r.Status == "Occupied")?.Count ?? 0, Color = "#1686cb" },
                new RoomStatusChartDto { Label = "Phòng trống", Value = roomStatuses.FirstOrDefault(r => r.Status == "Available")?.Count ?? 0, Color = "#10b981" },
                new RoomStatusChartDto { Label = "Đang dọn", Value = roomStatuses.FirstOrDefault(r => r.Status == "Cleaning" || r.Status == "Maintenance")?.Count ?? 0, Color = "#f59e0b" }
            };

            var summary = new DashboardSummaryDto
            {
                RoomOccupancyRate = $"{occupancyRate:F1}%",
                TotalGuestsThisMonth = guestsThisMonth,
                TodayRevenue = $"{todayRevenue:N0} ₫",
                SupportRequestsCount = unresolvedSupportRequests,
                RoomStatusChart = chartData
            };

            return Ok(ServiceResult<DashboardSummaryDto>.Ok("Success", summary));
        }

        [HttpGet("current-guests")]
        public async Task<IActionResult> GetCurrentGuests([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var query = _context.Bookings
                .Include(b => b.Room)
                .AsQueryable();

            query = query.Where(b => (!startDate.HasValue || b.CheckInDate >= startDate.Value) && (!endDate.HasValue || b.CheckInDate <= endDate.Value));

            var activeBookings = await query
                .Select(b => new CurrentGuestDto
                {
                    Id = b.Id,
                    Name = b.GuestName,
                    Room = b.Room.RoomNumber,
                    Checkin = b.CheckInDate.ToString("dd/MM/yyyy"),
                    Checkout = b.CheckOutDate.ToString("dd/MM/yyyy"),
                    Status = b.Status,
                    Type = b.Room.RoomType
                })
                .ToListAsync();

            return Ok(ServiceResult<System.Collections.Generic.List<CurrentGuestDto>>.Ok("Success", activeBookings));
        }

        [HttpGet("export-guests")]
        public async Task<IActionResult> ExportGuests([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var query = _context.Bookings
                .Include(b => b.Room)
                .AsQueryable();

            query = query.Where(b => (!startDate.HasValue || b.CheckInDate >= startDate.Value) && (!endDate.HasValue || b.CheckInDate <= endDate.Value));

            var guests = await query
                .OrderByDescending(b => b.CheckInDate)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Khách Đang Lưu Trú");
            var currentRow = 1;

            worksheet.Cell(currentRow, 1).Value = "Mã Đặt Phòng";
            worksheet.Cell(currentRow, 2).Value = "Tên Khách";
            worksheet.Cell(currentRow, 3).Value = "SĐT Khách";
            worksheet.Cell(currentRow, 4).Value = "Phòng";
            worksheet.Cell(currentRow, 5).Value = "Loại Phòng";
            worksheet.Cell(currentRow, 6).Value = "Ngày Nhận";
            worksheet.Cell(currentRow, 7).Value = "Ngày Trả";

            // Header style
            worksheet.Range("A1:G1").Style.Font.Bold = true;
            worksheet.Range("A1:G1").Style.Fill.BackgroundColor = XLColor.LightBlue;

            foreach (var guest in guests)
            {
                currentRow++;
                worksheet.Cell(currentRow, 1).Value = guest.BookingCode;
                worksheet.Cell(currentRow, 2).Value = guest.GuestName;
                worksheet.Cell(currentRow, 3).Value = guest.GuestEmail ?? guest.GuestCccd ?? "";
                worksheet.Cell(currentRow, 4).Value = guest.Room?.RoomNumber ?? "";
                worksheet.Cell(currentRow, 5).Value = guest.Room?.RoomType ?? "";
                worksheet.Cell(currentRow, 6).Value = guest.CheckInDate.ToString("dd/MM/yyyy HH:mm");
                worksheet.Cell(currentRow, 7).Value = guest.CheckOutDate.ToString("dd/MM/yyyy HH:mm");
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            var content = stream.ToArray();

            return File(
                content,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"KhachDangLuuTru_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
        }
    }
}
