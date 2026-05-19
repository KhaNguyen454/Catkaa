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

        public async Task<ServiceResult<object>> ProcessOcrCheckInAsync(int hotelId, OcrCheckInDto request, int currentUserId)
        {
            // Bước 1: Smart Lookup - Tìm Booking bằng CCCD + HotelId + CheckInDate hôm nay
            // KHÔNG CHECK IDOR (HostId) vì Kiosk IoT là người gọi API này (Guest hoặc máy unauthenticated)
            // Bảo mật dựa vào việc CCCD vật lý trùng khớp với GuestCccd đã đặt từ trước.
            var hotel = await _context.Hotels.FindAsync(hotelId);
            if (hotel == null) return ServiceResult<object>.Fail("Hotel not found.");

            // Bước 2: Smart Lookup - Tìm Booking bằng CCCD + HotelId + CheckInDate hôm nay
            var today = DateTime.Now.Date; // Dùng local time để tránh lệch múi giờ UTC+7
            var booking = await _context.Bookings.FirstOrDefaultAsync(b =>
                b.HotelId == hotelId &&
                b.GuestCccd == request.IdNumber &&
                b.CheckInDate.Date <= today &&
                b.CheckOutDate.Date >= today &&
                b.Status != "Cancelled" &&
                b.Status != "CheckedIn");

            if (booking == null)
                return ServiceResult<object>.Fail(
                    $"Không tìm thấy Booking hợp lệ cho khách có CCCD [{request.IdNumber}] tại khách sạn này hôm nay. " +
                    $"Vui lòng kiểm tra lại ngày check-in hoặc trạng thái đặt phòng.");

            // Bước 3: Trích xuất RoomId từ Booking - không cho client tự truyền
            var roomId = booking.RoomId;

            // Bước 4: Tạo CheckInRecord với thông tin OCR
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

            // Bước 5: Cập nhật trạng thái Booking
            booking.Status = "CheckedIn";
            _context.Bookings.Update(booking);

            await _context.SaveChangesAsync();

            return ServiceResult<object>.Ok("Check-in thành công via OCR", new
            {
                checkInRecordId = checkinRecord.Id,
                bookingCode = booking.BookingCode,
                guestName = checkinRecord.FullName,
                hotelId = hotelId,
                roomId = roomId,
                checkInTime = checkinRecord.CheckInTime
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
            return ServiceResult<object>.Ok("Deleted");
        }
    }
}
