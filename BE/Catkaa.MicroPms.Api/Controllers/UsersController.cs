using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Controllers
{
    [Route("api/users")]
    [Microsoft.AspNetCore.Http.Tags("6. Users (Quản lý tài khoản chủ khách sạn)")]
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin, Host")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _userService.GetAllUsersAsync(CurrentUserRole, CurrentUserId);
                if (!result.Success) return Unauthorized(new { message = result.Message });
                return Ok(result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, Host")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _userService.GetUserByIdAsync(id, CurrentUserRole, CurrentUserId);
                if (!result.Success) return NotFound(new { message = result.Message });
                return Ok(result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Host")]
        public async Task<IActionResult> Create([FromBody] UserCreateDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _userService.CreateUserAsync(request, CurrentUserRole);
                if (!result.Success) return Unauthorized(new { message = result.Message });

                return Ok(new { message = result.Message, data = result.Data });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Host")]
        public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _userService.UpdateUserAsync(id, request, CurrentUserRole, CurrentUserId);
                if (!result.Success) return Unauthorized(new { message = result.Message });

                return Ok(new { message = result.Message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Host")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _userService.DeleteUserAsync(id, CurrentUserRole, CurrentUserId);
                if (!result.Success) return Unauthorized(new { message = result.Message });

                return Ok(new { message = result.Message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPost("upgrade-to-host")]
        [Authorize(Roles = "Guest")]
        public async Task<IActionResult> UpgradeToHost([FromBody] UpgradeHostDto request)
        {
            if (!CurrentUserId.HasValue) return Unauthorized();

            try
            {
                var result = await _userService.UpgradeToHostAsync(CurrentUserId.Value, request.PlanId);
                if (!result.Success) return BadRequest(new { message = result.Message });

                return Ok(new { message = result.Data.Message, newToken = result.Data.NewToken });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }
    }
}
