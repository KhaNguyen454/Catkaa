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
    public class CheckInRecordService : ICheckInRecordService
    {
        private readonly ApplicationDbContext _context;

        public CheckInRecordService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<List<CheckInRecordResponseDto>>> GetAllAsync(string role, int? currentUserId, int? filterHotelId = null)
        {
            var query = _context.CheckInRecords.Include(c => c.Hotel).AsQueryable();

            // Bước 1: Bảo mật - chỉ lấy record thuộc Hotels mà Host sở hữu
            if (role != "Admin")
            {
                if (currentUserId == null) return ServiceResult<List<CheckInRecordResponseDto>>.Fail("Unauthorized: Missing User Context");
                query = query.Where(x => x.Hotel != null && x.Hotel.HostId == currentUserId);
            }

            // Bước 2: UX Filter - lọc theo chi nhánh cụ thể
            if (filterHotelId.HasValue)
            {
                query = query.Where(x => x.HotelId == filterHotelId.Value);
            }

            var records = await query.Select(x => new CheckInRecordResponseDto
            {
                Id = x.Id,
                FullName = x.FullName,
                IdentityNumber = x.IdentityNumber,
                DateOfBirth = x.DateOfBirth,
                HotelId = x.HotelId,
                RoomId = x.RoomId,
                CheckInTime = x.CheckInTime,
                ImageUrl = x.ImageUrl,
                BookingId = x.BookingId
            }).ToListAsync();

            return ServiceResult<List<CheckInRecordResponseDto>>.Ok("Success", records);
        }

        public async Task<ServiceResult<CheckInRecordResponseDto>> GetByIdAsync(int id, string role, int? currentUserId)
        {
            var query = _context.CheckInRecords.Include(c => c.Hotel).AsQueryable();

            if (role != "Admin")
            {
                if (currentUserId == null) return ServiceResult<CheckInRecordResponseDto>.Fail("Unauthorized: Missing User Context");
                query = query.Where(x => x.Hotel != null && x.Hotel.HostId == currentUserId);
            }

            var record = await query.FirstOrDefaultAsync(x => x.Id == id);
            if (record == null) return ServiceResult<CheckInRecordResponseDto>.Fail("Record not found or Unauthorized Access");

            return ServiceResult<CheckInRecordResponseDto>.Ok("Success", new CheckInRecordResponseDto
            {
                Id = record.Id,
                FullName = record.FullName,
                IdentityNumber = record.IdentityNumber,
                DateOfBirth = record.DateOfBirth,
                HotelId = record.HotelId,
                RoomId = record.RoomId,
                CheckInTime = record.CheckInTime,
                ImageUrl = record.ImageUrl,
                BookingId = record.BookingId
            });
        }

        public async Task<ServiceResult<CheckInRecordResponseDto>> CreateAsync(int hotelId, CheckInRecordCreateDto dto, int currentUserId)
        {
            // IDOR Check: Hotel phải thuộc về Host đang đăng nhập
            var hotel = await _context.Hotels.FindAsync(hotelId);
            if (hotel == null) return ServiceResult<CheckInRecordResponseDto>.Fail("Hotel not found");
            if (hotel.HostId != currentUserId)
                return ServiceResult<CheckInRecordResponseDto>.Fail("Unauthorized: This hotel does not belong to you");

            var record = new CheckInRecord
            {
                FullName = dto.FullName,
                IdentityNumber = dto.IdentityNumber,
                DateOfBirth = dto.DateOfBirth,
                HotelId = hotelId,   // Lấy từ Route
                RoomId = null,       // Walk-in: chưa có phòng cụ thể
                CheckInTime = DateTime.UtcNow,
                ImageUrl = dto.ImageUrl,
                BookingId = null
            };

            _context.CheckInRecords.Add(record);
            await _context.SaveChangesAsync();

            return ServiceResult<CheckInRecordResponseDto>.Ok("Created", new CheckInRecordResponseDto
            {
                Id = record.Id,
                FullName = record.FullName,
                IdentityNumber = record.IdentityNumber,
                DateOfBirth = record.DateOfBirth,
                HotelId = record.HotelId,
                RoomId = record.RoomId,
                CheckInTime = record.CheckInTime,
                ImageUrl = record.ImageUrl,
                BookingId = record.BookingId
            });
        }

        public async Task<ServiceResult<OcrCheckInResponseDto>> ProcessOcrCheckInAsync(int hotelId, OcrCheckInDto request, int currentUserId)
        {
            // KHÔNG CHECK IDOR (HostId) vì Kiosk IoT là người gọi (Guest/unauthenticated)
            // Bảo mật dựa vào CCCD vật lý trùng khớp với GuestCccd đã đặt từ trước.
            var hotel = await _context.Hotels.FindAsync(hotelId);
            if (hotel == null) return ServiceResult<OcrCheckInResponseDto>.Fail("Hotel not found.");

            var today = DateTime.Now.Date;
            var booking = await _context.Bookings.FirstOrDefaultAsync(b =>
                b.HotelId == hotelId &&
                b.GuestCccd == request.IdNumber &&
                b.CheckInDate.Date <= today &&
                b.CheckOutDate.Date >= today &&
                b.Status != "Cancelled" &&
                b.Status != "CheckIn" && 
                b.Status != "CheckOut");

            if (booking == null)
                return ServiceResult<OcrCheckInResponseDto>.Fail(
                    $"Không tìm thấy Booking hợp lệ cho khách có CCCD [{request.IdNumber}] tại khách sạn này hôm nay. " +
                    $"Vui lòng kiểm tra lại ngày check-in hoặc trạng thái đặt phòng.");

            var roomId = booking.RoomId;
            var room = await _context.Rooms.FindAsync(roomId);

            var checkinRecord = new CheckInRecord
            {
                FullName = booking.GuestName ?? request.FullName,
                IdentityNumber = request.IdNumber,
                DateOfBirth = request.DateOfBirth,
                HotelId = hotelId,
                RoomId = roomId.ToString(),
                CheckInTime = DateTime.UtcNow,
                ImageUrl = request.ImageUrl,
                BookingId = booking.Id
            };

            _context.CheckInRecords.Add(checkinRecord);

            booking.Status = "AwaitingPayment";
            _context.Bookings.Update(booking);

            await _context.SaveChangesAsync();

            return ServiceResult<OcrCheckInResponseDto>.Ok("Check-in thành công via OCR", new OcrCheckInResponseDto
            {
                CheckInRecordId = checkinRecord.Id,
                BookingId = booking.Id,
                BookingCode = booking.BookingCode,
                GuestName = checkinRecord.FullName,
                HotelId = hotelId,
                RoomId = roomId,
                CheckInTime = checkinRecord.CheckInTime,
                RoomPassword = room?.RoomPassword
            });
        }

        public async Task<ServiceResult<object>> UpdateAsync(int id, CheckInRecordUpdateDto dto, string role, int? currentUserId)
        {
            var query = _context.CheckInRecords.Include(c => c.Hotel).AsQueryable();

            if (role != "Admin")
            {
                if (currentUserId == null) return ServiceResult<object>.Fail("Unauthorized: Missing User Context");
                query = query.Where(x => x.Hotel != null && x.Hotel.HostId == currentUserId);
            }

            var record = await query.FirstOrDefaultAsync(x => x.Id == id);
            if (record == null) return ServiceResult<object>.Fail("Record not found or Unauthorized Access");

            record.FullName = dto.FullName;
            record.IdentityNumber = dto.IdentityNumber;
            record.DateOfBirth = dto.DateOfBirth;
            record.RoomId = dto.RoomId;
            record.ImageUrl = dto.ImageUrl;
            record.BookingId = dto.BookingId;

            await _context.SaveChangesAsync();
            return ServiceResult<object>.Ok("Updated");
        }

        public async Task<ServiceResult<object>> DeleteAsync(int id, string role, int? currentUserId)
        {
            var query = _context.CheckInRecords.Include(c => c.Hotel).AsQueryable();

            if (role != "Admin")
            {
                if (currentUserId == null) return ServiceResult<object>.Fail("Unauthorized: Missing User Context");
                query = query.Where(x => x.Hotel != null && x.Hotel.HostId == currentUserId);
            }

            var record = await query.FirstOrDefaultAsync(x => x.Id == id);
            if (record == null) return ServiceResult<object>.Fail("Record not found or Unauthorized Access");

            _context.CheckInRecords.Remove(record);
            await _context.SaveChangesAsync();

            return ServiceResult<object>.Ok("Success");
        }

        public async Task<ServiceResult<object>> CheckOutAsync(CheckOutRequestDto request)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.BookingCode == request.BookingCode && b.GuestCccd == request.GuestCccd && b.Status == "CheckIn");

            if (booking == null) return ServiceResult<object>.Fail("Không tìm thấy Booking hoặc Booking chưa được Check-in.");

            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.Id == booking.RoomId);
            
            // Xác thực Mật khẩu phòng
            if (string.IsNullOrWhiteSpace(request.RoomPassword) || room?.RoomPassword != request.RoomPassword)
            {
                return ServiceResult<object>.Fail("Mật khẩu phòng không chính xác.");
            }

            if (room != null)
            {
                room.Status = "Cleaning";
                room.LastCleanedAt = DateTime.Now;
            }

            booking.Status = "CheckOut";

            var record = await _context.CheckInRecords.FirstOrDefaultAsync(r => r.BookingId == booking.Id);
            if (record != null)
            {
                record.CheckOutTime = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return ServiceResult<object>.Ok("Trả phòng thành công");
        }
    }
}
