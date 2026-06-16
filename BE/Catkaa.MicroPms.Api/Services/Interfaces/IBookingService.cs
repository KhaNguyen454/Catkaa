using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using Catkaa.MicroPms.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Services.Interfaces
{
    public interface IBookingService
    {
        Task<Booking?> GetConfirmedBookingByCccdAsync(string cccd);
        Task<ServiceResult<List<object>>> GetActiveRoomsByCccdAsync(string cccd);
        Task UpdateBookingStatusAsync(Booking booking, string status);
        Task<ServiceResult<BookingResponseDto>> CreateBookingAsync(int hotelId, int roomId, int? currentUserId, BookingCreateDto request);
        Task<ServiceResult<List<BookingResponseDto>>> GetAllBookingsAsync(string role, int? currentUserId, int? filterHotelId = null);
        Task<ServiceResult<List<BookingResponseDto>>> GetBookingHistoryAsync(int userId);
        Task<ServiceResult<object>> UpdateBookingAsync(int id, BookingUpdateDto request, string role, int? currentUserId);
        Task<ServiceResult<object>> DeleteBookingAsync(int id, string role, int? currentUserId);
        Task<ServiceResult<object>> CheckoutAsync(int id, string role, int? currentUserId);
    }
}
