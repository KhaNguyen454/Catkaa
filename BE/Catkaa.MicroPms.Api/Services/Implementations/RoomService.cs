using Catkaa.MicroPms.Api.Data;
using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using Catkaa.MicroPms.Api.Models;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Services.Implementations
{
    public class RoomService : IRoomService
    {
        private readonly ApplicationDbContext _context;

        public RoomService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<List<RoomResponseDto>>> GetAllRoomsAsync(string role, int? currentUserId, int? filterHotelId = null)
        {
            var query = _context.Rooms.Include(r => r.Hotel).AsQueryable();

            if (role == "Host")
            {
                if (currentUserId == null) return ServiceResult<List<RoomResponseDto>>.Fail("Unauthorized Access");
                query = query.Where(r => r.Hotel != null && r.Hotel.HostId == currentUserId);
            }

            if (filterHotelId.HasValue)
                query = query.Where(r => r.HotelId == filterHotelId.Value);

            var rooms = await query.ToListAsync();

            var response = rooms.Select(r => new RoomResponseDto
            {
                Id = r.Id,
                HotelId = r.HotelId,
                RoomNumber = r.RoomNumber,
                RoomType = r.RoomType,
                Price = r.Price,
                Status = r.Status,
                Description = r.Description,
                MainImageUrl = r.MainImageUrl,
                ImageGallery = r.ImageGallery != null ? JsonSerializer.Deserialize<List<string>>(r.ImageGallery) : new List<string>(),
                RoomPassword = r.RoomPassword
            }).ToList();

            return ServiceResult<List<RoomResponseDto>>.Ok("Success", response);
        }

        public async Task<ServiceResult<RoomResponseDto>> GetRoomByIdAsync(int id, string role, int? currentUserId)
        {
            var r = await _context.Rooms.Include(x => x.Hotel).FirstOrDefaultAsync(x => x.Id == id);
            if (r == null) return ServiceResult<RoomResponseDto>.Fail("Room not found");

            if (role == "Host" && currentUserId != r.Hotel?.HostId) 
                return ServiceResult<RoomResponseDto>.Fail("Unauthorized Access");

            return ServiceResult<RoomResponseDto>.Ok("Success", new RoomResponseDto
            {
                Id = r.Id,
                HotelId = r.HotelId,
                RoomNumber = r.RoomNumber,
                RoomType = r.RoomType,
                Price = r.Price,
                Status = r.Status,
                Description = r.Description,
                MainImageUrl = r.MainImageUrl,
                ImageGallery = r.ImageGallery != null ? JsonSerializer.Deserialize<List<string>>(r.ImageGallery) : new List<string>(),
                RoomPassword = r.RoomPassword
            });
        }

        public async Task<ServiceResult<RoomResponseDto>> CreateRoomAsync(int hotelId, RoomCreateDto dto, int currentUserId)
        {
            var hotel = await _context.Hotels.FindAsync(hotelId);
            if (hotel == null) return ServiceResult<RoomResponseDto>.Fail("Hotel not found");
            if (hotel.HostId != currentUserId) return ServiceResult<RoomResponseDto>.Fail("Unauthorized Access");

            var room = new Room
            {
                HotelId = hotelId,
                RoomNumber = dto.RoomNumber,
                RoomType = dto.RoomType,
                Price = dto.Price,
                Status = dto.Status,
                Description = dto.Description,
                MainImageUrl = dto.MainImageUrl,
                ImageGallery = dto.ImageGallery != null ? JsonSerializer.Serialize(dto.ImageGallery) : null
            };
            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return ServiceResult<RoomResponseDto>.Ok("Created", new RoomResponseDto
            {
                Id = room.Id,
                HotelId = room.HotelId,
                RoomNumber = room.RoomNumber,
                RoomType = room.RoomType,
                Price = room.Price,
                Status = room.Status
            });
        }

        public async Task<ServiceResult<object>> UpdateRoomAsync(int id, RoomUpdateDto dto, string role, int? currentUserId)
        {
            var room = await _context.Rooms.Include(x => x.Hotel).FirstOrDefaultAsync(x => x.Id == id);
            if (room == null) return ServiceResult<object>.Fail("Room not found");

            if (role != "Admin" && currentUserId != room.Hotel?.HostId) 
                return ServiceResult<object>.Fail("Unauthorized Access");

            room.RoomNumber = dto.RoomNumber;
            room.RoomType = dto.RoomType;
            room.Price = dto.Price;
            room.Status = dto.Status;
            room.Description = dto.Description;
            room.MainImageUrl = dto.MainImageUrl;
            room.ImageGallery = dto.ImageGallery != null ? JsonSerializer.Serialize(dto.ImageGallery) : null;

            await _context.SaveChangesAsync();
            return ServiceResult<object>.Ok("Updated");
        }

        public async Task<ServiceResult<object>> DeleteRoomAsync(int id, string role, int? currentUserId)
        {
            var room = await _context.Rooms.Include(x => x.Hotel).FirstOrDefaultAsync(x => x.Id == id);
            if (room == null) return ServiceResult<object>.Fail("Room not found");

            if (role != "Admin" && currentUserId != room.Hotel?.HostId) 
                return ServiceResult<object>.Fail("Unauthorized Access");

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
            return ServiceResult<object>.Ok("Deleted");
        }
    }
}
