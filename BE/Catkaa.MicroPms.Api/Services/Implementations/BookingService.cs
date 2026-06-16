using Catkaa.MicroPms.Api.Data;
using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using Catkaa.MicroPms.Api.Models;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Services.Implementations
{
    public class BookingService : IBookingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public BookingService(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<Booking?> GetConfirmedBookingByCccdAsync(string cccd)
        {
            return await _context.Bookings
                .FirstOrDefaultAsync(b => b.GuestCccd == cccd && b.Status == "Confirmed");
        }

        public async Task<ServiceResult<List<object>>> GetActiveRoomsByCccdAsync(string cccd)
        {
            var activeRooms = await _context.Bookings
                .Include(b => b.Hotel)
                .Include(b => b.Room)
                .Where(b => b.GuestCccd == cccd 
                            && b.Status == "CheckIn" 
                            && b.CheckInDate.Date <= DateTime.UtcNow.Date 
                            && b.CheckOutDate.Date >= DateTime.UtcNow.Date)
                .Select(b => new
                {
                    BookingCode = b.BookingCode,
                    RoomNumber = b.Room != null ? b.Room.RoomNumber : null,
                    RoomType = b.Room != null ? b.Room.RoomType : null,
                    HotelName = b.Hotel != null ? b.Hotel.Name : null,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate
                })
                .Cast<object>()
                .ToListAsync();

            return ServiceResult<List<object>>.Ok("Success", activeRooms);
        }

        public async Task UpdateBookingStatusAsync(Booking booking, string status)
        {
            booking.Status = status;
            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();
        }

        public async Task<ServiceResult<BookingResponseDto>> CreateBookingAsync(int hotelId, int roomId, int? currentUserId, BookingCreateDto request)
        {
            // Kiểm tra Data Integrity: Room phải thực sự thuộc Hotel được truyền vào
            var room = await _context.Rooms.Include(r => r.Hotel)
                .FirstOrDefaultAsync(r => r.Id == roomId && r.HotelId == hotelId);
            if (room == null)
                return ServiceResult<BookingResponseDto>.Fail("Room not found or does not belong to the specified hotel.");

            if (request.CheckInDate >= request.CheckOutDate)
                return ServiceResult<BookingResponseDto>.Fail("Check-out date must be after check-in date.");

            var isOverlapping = await _context.Bookings.AnyAsync(b => 
                b.RoomId == roomId &&
                b.Status != "Cancelled" &&
                request.CheckInDate < b.CheckOutDate && 
                request.CheckOutDate > b.CheckInDate);

            if (isOverlapping)
                return ServiceResult<BookingResponseDto>.Fail("Phòng đã có người đặt trong thời gian này.");

            var datePart = DateTime.UtcNow.ToString("yyMMdd");
            var randomPart = new string(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 4)
                .Select(s => s[new Random().Next(s.Length)]).ToArray());
            var bookingCode = $"CATKAA-{datePart}-{randomPart}";

            var booking = new Booking
            {
                BookingCode = bookingCode,
                UserId = currentUserId,          // Lấy từ JWT Token
                GuestName = request.GuestName,
                GuestCccd = request.GuestCccd,
                GuestEmail = request.GuestEmail,
                HotelId = hotelId,               // Lấy từ Route
                RoomId = roomId,                 // Lấy từ Route
                CheckInDate = request.CheckInDate,
                CheckOutDate = request.CheckOutDate,
                Status = "Pending"
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            
            if (!string.IsNullOrEmpty(request.GuestEmail))
            {
                int totalNights = (request.CheckOutDate.Date - request.CheckInDate.Date).Days;
                if (totalNights <= 0) totalNights = 1;
                decimal totalPrice = totalNights * room.Price;

                var templatePath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "EmailTemplates", "BookingReceipt.html");
                var emailBody = await System.IO.File.ReadAllTextAsync(templatePath);

                emailBody = emailBody.Replace("{{HotelName}}", room.Hotel?.Name ?? "")
                                     .Replace("{{HotelAddress}}", room.Hotel?.Address ?? "")
                                     .Replace("{{RoomNumber}}", room.RoomNumber ?? roomId.ToString())
                                     .Replace("{{RoomType}}", room.RoomType ?? "")
                                     .Replace("{{RoomPrice}}", room.Price.ToString("N0"))
                                     .Replace("{{GuestName}}", request.GuestName ?? "")
                                     .Replace("{{GuestCccd}}", request.GuestCccd ?? "")
                                     .Replace("{{CheckInDate}}", request.CheckInDate.ToString("dd/MM/yyyy"))
                                     .Replace("{{CheckOutDate}}", request.CheckOutDate.ToString("dd/MM/yyyy"))
                                     .Replace("{{TotalNights}}", totalNights.ToString())
                                     .Replace("{{TotalPrice}}", totalPrice.ToString("N0"))
                                     .Replace("{{BookingCode}}", bookingCode);

                await _emailService.SendEmailAsync(request.GuestEmail, "Xác nhận đặt phòng thành công - CATKAA", emailBody);
            }

            var responseDto = new BookingResponseDto
            {
                Id = booking.Id,
                BookingCode = booking.BookingCode,
                GuestName = booking.GuestName ?? string.Empty,
                HotelId = booking.HotelId,
                RoomId = booking.RoomId,
                CheckInDate = booking.CheckInDate,
                CheckOutDate = booking.CheckOutDate,
                Status = booking.Status
            };

            return ServiceResult<BookingResponseDto>.Ok("Booking created successfully", responseDto);
        }

        public async Task<ServiceResult<List<BookingResponseDto>>> GetBookingHistoryAsync(int userId)
        {
            var bookings = await _context.Bookings
                .Include(b => b.Hotel)
                .Include(b => b.Room)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CheckInDate)
                .Select(b => new BookingResponseDto
                {
                    Id = b.Id,
                    BookingCode = b.BookingCode,
                    GuestName = b.GuestName ?? string.Empty,
                    HotelId = b.HotelId,
                    HotelName = b.Hotel != null ? b.Hotel.Name : null,
                    RoomId = b.RoomId,
                    RoomNumber = b.Room != null ? b.Room.RoomNumber : null,
                    RoomType = b.Room != null ? b.Room.RoomType : null,
                    RoomPassword = b.Room != null ? b.Room.RoomPassword : null,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    Status = b.Status
                })
                .ToListAsync();

            return ServiceResult<List<BookingResponseDto>>.Ok("Success", bookings);
        }

        public async Task<ServiceResult<List<BookingResponseDto>>> GetAllBookingsAsync(string role, int? currentUserId, int? filterHotelId = null)
        {
            var query = _context.Bookings.Include(b => b.Hotel).AsQueryable();

            // Bước 1: Bảo mật - chỉ lấy booking thuộc Hotels mà Host sở hữu
            if (role != "Admin")
            {
                if (currentUserId == null) return ServiceResult<List<BookingResponseDto>>.Fail("Unauthorized Access");
                query = query.Where(b => b.Hotel != null && b.Hotel.HostId == currentUserId);
            }

            // Bước 2: UX Filter - lọc theo chi nhánh cụ thể
            if (filterHotelId.HasValue)
            {
                query = query.Where(b => b.HotelId == filterHotelId.Value);
            }

            var bookings = await query
                .Select(b => new BookingResponseDto
                {
                    Id = b.Id,
                    BookingCode = b.BookingCode,
                    GuestName = b.GuestName ?? string.Empty,
                    GuestCccd = b.GuestCccd ?? string.Empty,
                    HotelId = b.HotelId,
                    RoomId = b.RoomId,
                    CheckInDate = b.CheckInDate,
                    CheckOutDate = b.CheckOutDate,
                    Status = b.Status
                })
                .ToListAsync();

            return ServiceResult<List<BookingResponseDto>>.Ok("Success", bookings);
        }

        public async Task<ServiceResult<object>> UpdateBookingAsync(int id, BookingUpdateDto request, string role, int? currentUserId)
        {
            var booking = await _context.Bookings.Include(b => b.Hotel).FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null) return ServiceResult<object>.Fail("Booking not found");

            if (role != "Admin" && currentUserId != booking.Hotel?.HostId)
            {
                return ServiceResult<object>.Fail("Unauthorized Access");
            }
            
            if (request.CheckInDate >= request.CheckOutDate)
            {
                return ServiceResult<object>.Fail("Check-out date must be after check-in date.");
            }

            var isOverlapping = await _context.Bookings.AnyAsync(b => 
                b.Id != id &&
                b.RoomId == request.RoomId &&
                b.Status != "Cancelled" &&
                request.CheckInDate < b.CheckOutDate && 
                request.CheckOutDate > b.CheckInDate);

            if (isOverlapping)
            {
                return ServiceResult<object>.Fail("Phòng đã có người đặt trong thời gian này.");
            }

            booking.Status = request.Status;
            booking.CheckInDate = request.CheckInDate;
            booking.CheckOutDate = request.CheckOutDate;
            booking.RoomId = request.RoomId;

            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();

            return ServiceResult<object>.Ok("Updated successfully");
        }

        public async Task<ServiceResult<object>> DeleteBookingAsync(int id, string role, int? currentUserId)
        {
            var booking = await _context.Bookings.Include(b => b.Hotel).FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null) return ServiceResult<object>.Fail("Booking not found");

            if (role != "Admin" && currentUserId != booking.Hotel?.HostId)
            {
                return ServiceResult<object>.Fail("Unauthorized Access");
            }

            // Xóa các record liên quan trước để tránh foreign key constraint
            var checkInRecords = await _context.CheckInRecords.Where(c => c.BookingId == id).ToListAsync();
            if (checkInRecords.Any())
                _context.CheckInRecords.RemoveRange(checkInRecords);

            var payments = await _context.Payments.Where(p => p.BookingId == id).ToListAsync();
            if (payments.Any())
                _context.Payments.RemoveRange(payments);

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return ServiceResult<object>.Ok("Deleted successfully");
        }

        public async Task<ServiceResult<object>> CheckoutAsync(int id, string role, int? currentUserId)
        {
            var booking = await _context.Bookings.Include(b => b.Hotel).FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null) return ServiceResult<object>.Fail("Booking not found");

            if (role != "Admin" && currentUserId != booking.Hotel?.HostId && currentUserId != booking.UserId)
            {
                return ServiceResult<object>.Fail("Unauthorized Access");
            }

            booking.Status = "CheckOut";
            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();

            return ServiceResult<object>.Ok("Checkout successful");
        }
    }
}
