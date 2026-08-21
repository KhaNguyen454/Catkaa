using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Controllers
{
    [Route("api/rooms")]
    [Microsoft.AspNetCore.Http.Tags("8. Rooms (Quản lý phòng)")]
    [Authorize(Roles = "Admin, Host")]
    public class RoomsController : BaseApiController
    {
        private readonly IRoomService _roomService;

        public RoomsController(IRoomService roomService)
        {
            _roomService = roomService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] int? filterHotelId = null)
        {
            try
            {
                var result = await _roomService.GetAllRoomsAsync(CurrentUserRole, CurrentUserId, filterHotelId);
                if (!result.Success) return Unauthorized(new { message = result.Message });
                return Ok(result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.InnerException != null ? ex.InnerException.Message : ex.Message });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _roomService.GetRoomByIdAsync(id, CurrentUserRole, CurrentUserId);
                if (!result.Success) return NotFound(new { message = result.Message });
                return Ok(result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.InnerException != null ? ex.InnerException.Message : ex.Message });
            }
        }

        [HttpPost("hotel/{hotelId}")]
        public async Task<IActionResult> Create(int hotelId, [FromBody] RoomCreateDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (CurrentUserId == null) return Unauthorized(new { message = "Invalid token: missing user identity" });

            try
            {
                var result = await _roomService.CreateRoomAsync(hotelId, request, CurrentUserId.Value);
                if (!result.Success) return Unauthorized(new { message = result.Message });

                return Ok(new { message = result.Message, data = result.Data });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.InnerException != null ? ex.InnerException.Message : ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] RoomUpdateDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _roomService.UpdateRoomAsync(id, request, CurrentUserRole, CurrentUserId);
                if (!result.Success) return Unauthorized(new { message = result.Message });

                return Ok(new { message = result.Message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.InnerException != null ? ex.InnerException.Message : ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _roomService.DeleteRoomAsync(id, CurrentUserRole, CurrentUserId);
                if (!result.Success) return Unauthorized(new { message = result.Message });

                return Ok(new { message = result.Message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.InnerException != null ? ex.InnerException.Message : ex.Message });
            }
        }
    }
}
