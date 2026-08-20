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
                // LÆ°u Ã½: TÃ­nh toÃ¡n tuáº§n tá»± vÃ¬ EF Core DbContext khÃ´ng cho phÃ©p gá»i nhiá»u thao tÃ¡c async song song (Task.WhenAll)
                var totalUsers = await _context.Users.CountAsync();
                
                var totalHotels = await _context.Hotels.CountAsync();
                
                var totalSupportRequests = await _context.ContactRequests.CountAsync();

                // 1. Doanh thu tá»« báº£ng Payments (GÃ³i dá»‹ch vá»¥ hoáº·c thanh toÃ¡n online)
                var paymentRevenue = await _context.Payments
                    .Where(p => p.Status == "Completed" || p.Status == "ThÃ nh cÃ´ng")
                    .SumAsync(p => p.Amount);

                // 2. Doanh thu tá»« báº£ng Bookings (VÃ¬ CSDL khÃ´ng lÆ°u cá»™t TotalPrice, cáº§n tá»± tÃ­nh toÃ¡n: Sá»‘ Ä‘Ãªm * GiÃ¡ phÃ²ng)
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

                // Gom 2 nguá»“n doanh thu láº¡i thÃ nh 1
                var totalSystemRevenue = paymentRevenue + bookingRevenue;

                // 3. Biá»ƒu Ä‘á»“ thá»‘ng kÃª loáº¡i tÃ i khoáº£n (Admin Pie Chart)
                var normalUsersCount = await _context.Users.CountAsync(u => u.Role == "User" || u.Role == "Customer" || string.IsNullOrEmpty(u.Role));
                var hostsCount = await _context.Users.CountAsync(u => u.Role == "Host");

                var adminChartData = new System.Collections.Generic.List<RoomStatusChartDto>
                {
                    new RoomStatusChartDto { Name = "NgÆ°á»i dÃ¹ng thÆ°á»ng", Value = normalUsersCount, Color = "#1686cb" },
                    new RoomStatusChartDto { Name = "Chá»§ khÃ¡ch sáº¡n", Value = hostsCount, Color = "#10b981" }
                };

                var adminSummary = new DashboardSummaryDto
                {
                    TotalUsers = totalUsers,
                    TotalHotels = totalHotels,
                    TotalSystemRevenue = $"{totalSystemRevenue:N0} â‚«",
                    TotalSupportRequests = totalSupportRequests,
                    RoomStatusChart = adminChartData
                };
                return Ok(ServiceResult<DashboardSummaryDto>.Ok("Success", adminSummary));
            }

            // Láº¥y danh sÃ¡ch HotelId cá»§a Host hiá»‡n táº¡i
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

            // KPI: Today revenue (tá»« Bookings Checkout hÃ´m nay cá»§a cÃ¡c KS thuá»™c Host)
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

            // KPI: Support requests count (chá»‰ láº¥y request cá»§a User nÃ y? Hoáº·c Host khÃ´ng cÃ³ support, láº¥y 0. Hoáº·c láº¥y tá»« ContactRequests cá»§a Host? Giá»¯ nguyÃªn láº¥y all náº¿u chÆ°a cÃ³ UserId trong ContactRequest)
            var unresolvedSupportRequests = await _context.ContactRequests.CountAsync(c => !c.IsResolved); // Máº·c Ä‘á»‹nh

            // BIá»‚U Äá»’: Room status chart (Host Pie Chart)
            var roomStatuses = await _context.Rooms
                .Where(r => hostHotels.Contains(r.HotelId))
                .GroupBy(r => r.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var chartData = new System.Collections.Generic.List<RoomStatusChartDto>
            {
                new RoomStatusChartDto { Name = "Äang cÃ³ khÃ¡ch", Value = roomStatuses.FirstOrDefault(r => r.Status == "Occupied")?.Count ?? 0, Color = "#1686cb" },
                new RoomStatusChartDto { Name = "PhÃ²ng trá»‘ng", Value = roomStatuses.FirstOrDefault(r => r.Status == "Available")?.Count ?? 0, Color = "#10b981" },
                new RoomStatusChartDto { Name = "Äang dá»n", Value = roomStatuses.FirstOrDefault(r => r.Status == "Cleaning" || r.Status == "Maintenance")?.Count ?? 0, Color = "#f59e0b" }
            };

            var summary = new DashboardSummaryDto
            {
                RoomOccupancyRate = $"{occupancyRate:F1}%",
                TotalGuestsThisMonth = guestsThisMonth,
                TodayRevenue = $"{todayRevenue:N0} â‚«",
                SupportRequestsCount = unresolvedSupportRequests,
                RoomStatusChart = chartData
            };

            return Ok(ServiceResult<DashboardSummaryDto>.Ok("Success", summary));
        }

        [HttpGet("current-guests")]
        public async Task<IActionResult> GetCurrentGuests([FromQuery] int? day, [FromQuery] int? month, [FromQuery] int? year)
        {
            var query = _context.Bookings
                .Include(b => b.Room)
                .Where(b => b.Status == "CheckedIn")
                .AsQueryable();

            if (year.HasValue)
                query = query.Where(b => b.CheckInDate.Year == year.Value || b.CheckOutDate.Year == year.Value);
            if (month.HasValue)
                query = query.Where(b => b.CheckInDate.Month == month.Value || b.CheckOutDate.Month == month.Value);
            if (day.HasValue)
                query = query.Where(b => b.CheckInDate.Day == day.Value || b.CheckOutDate.Day == day.Value);

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
        public async Task<IActionResult> ExportGuests([FromQuery] int? day, [FromQuery] int? month, [FromQuery] int? year)
        {
            var query = _context.Bookings
                .Include(b => b.Room)
                .Where(b => b.Status == "CheckedIn")
                .AsQueryable();

            if (year.HasValue)
                query = query.Where(b => b.CheckInDate.Year == year.Value || b.CheckOutDate.Year == year.Value);
            if (month.HasValue)
                query = query.Where(b => b.CheckInDate.Month == month.Value || b.CheckOutDate.Month == month.Value);
            if (day.HasValue)
                query = query.Where(b => b.CheckInDate.Day == day.Value || b.CheckOutDate.Day == day.Value);

            var guests = await query
                .OrderByDescending(b => b.CheckInDate)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("KhÃ¡ch Äang LÆ°u TrÃº");
            var currentRow = 1;

            worksheet.Cell(currentRow, 1).Value = "MÃ£ Äáº·t PhÃ²ng";
            worksheet.Cell(currentRow, 2).Value = "TÃªn KhÃ¡ch";
            worksheet.Cell(currentRow, 3).Value = "SÄT KhÃ¡ch";
            worksheet.Cell(currentRow, 4).Value = "PhÃ²ng";
            worksheet.Cell(currentRow, 5).Value = "Loáº¡i PhÃ²ng";
            worksheet.Cell(currentRow, 6).Value = "NgÃ y Nháº­n";
            worksheet.Cell(currentRow, 7).Value = "NgÃ y Tráº£";

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
