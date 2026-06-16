using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Controllers
{
    [Route("api/bookings")]
    [Microsoft.AspNetCore.Http.Tags("7. Bookings (Quản lý Đặt phòng)")]
    public class BookingsController : BaseApiController
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin, Host")]
        public async Task<IActionResult> GetAll([FromQuery] int? filterHotelId = null)
        {
            try
            {
                var result = await _bookingService.GetAllBookingsAsync(CurrentUserRole, CurrentUserId, filterHotelId);
                if (!result.Success) return Unauthorized(new { message = result.Message });
                return Ok(result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpGet("active-rooms")]
        public async Task<IActionResult> GetActiveRoomsByCccd([FromQuery] string cccd)
        {
            if (string.IsNullOrWhiteSpace(cccd))
            {
                return BadRequest(new { message = "CCCD is required." });
            }

            try
            {
                var result = await _bookingService.GetActiveRoomsByCccdAsync(cccd);
                if (!result.Success) return BadRequest(new { message = result.Message });
                
                return Ok(new { message = "Success", data = result.Data });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPost("/api/hotels/{hotelId}/rooms/{roomId}/bookings")]
        public async Task<IActionResult> CreateBooking(int hotelId, int roomId, [FromBody] BookingCreateDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _bookingService.CreateBookingAsync(hotelId, roomId, CurrentUserId, request);

                if (!result.Success)
                    return BadRequest(new { message = result.Message });

                return Ok(new { message = result.Message, data = result.Data });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpGet("history")]
        [Authorize]
        public async Task<IActionResult> GetBookingHistory()
        {
            if (CurrentUserId == null)
            {
                return Unauthorized(new { message = "User not logged in or invalid token" });
            }

            try
            {
                var result = await _bookingService.GetBookingHistoryAsync(CurrentUserId.Value);
                if (!result.Success) return BadRequest(new { message = result.Message });

                return Ok(result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Host")]
        public async Task<IActionResult> UpdateBooking(int id, [FromBody] BookingUpdateDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _bookingService.UpdateBookingAsync(id, request, CurrentUserRole, CurrentUserId);
                if (!result.Success) return BadRequest(new { message = result.Message });

                return Ok(new { message = result.Message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Host")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            try
            {
                var result = await _bookingService.DeleteBookingAsync(id, CurrentUserRole, CurrentUserId);
                if (!result.Success) return BadRequest(new { message = result.Message });

                return Ok(new { message = result.Message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPut("{id}/checkout")]
        [Authorize]
        public async Task<IActionResult> Checkout(int id)
        {
            try
            {
                var result = await _bookingService.CheckoutAsync(id, CurrentUserRole, CurrentUserId);
                if (!result.Success) return BadRequest(new { message = result.Message });

                return Ok(new { message = result.Message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }
    }
}
