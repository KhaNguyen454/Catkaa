using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Controllers
{
    [Route("api/hotels")]
    [Microsoft.AspNetCore.Http.Tags("5. Hotels (Quản lý khách sạn)")]
    [Authorize(Roles = "Admin, Host")]
    public class HotelsController : BaseApiController
    {
        private readonly IHotelService _hotelService;

        public HotelsController(IHotelService hotelService)
        {
            _hotelService = hotelService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _hotelService.GetAllHotelsAsync(CurrentUserRole, CurrentUserId);
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
                var result = await _hotelService.GetHotelByIdAsync(id, CurrentUserRole, CurrentUserId);
                if (!result.Success) return NotFound(new { message = result.Message });
                return Ok(result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.InnerException != null ? ex.InnerException.Message : ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Host")]
        public async Task<IActionResult> Create([FromBody] HotelCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (CurrentUserId == null) return Unauthorized(new { message = "Invalid token: missing user identity" });

            try
            {
                var result = await _hotelService.CreateHotelAsync(dto, CurrentUserId.Value);
                if (!result.Success) return Unauthorized(new { message = result.Message });
                return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.InnerException != null ? ex.InnerException.Message : ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] HotelUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _hotelService.UpdateHotelAsync(id, dto, CurrentUserRole, CurrentUserId);
                if (!result.Success) return NotFound(new { message = result.Message });
                return NoContent();
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
                var result = await _hotelService.DeleteHotelAsync(id, CurrentUserRole, CurrentUserId);
                if (!result.Success) return NotFound(new { message = result.Message });
                return NoContent();
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.InnerException != null ? ex.InnerException.Message : ex.Message });
            }
        }
    }
}
