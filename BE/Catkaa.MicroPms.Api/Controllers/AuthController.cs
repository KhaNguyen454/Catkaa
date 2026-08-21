using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    [Microsoft.AspNetCore.Http.Tags("1. Authentication (Đăng nhập & Đăng ký)")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _authService.LoginAsync(request);
                
                if (!result.Success)
                    return Unauthorized(new { message = result.Message });

                return Ok(new 
                { 
                    status = "success", 
                    message = result.Message,
                    token = result.Data 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _authService.RegisterAsync(request);

                if (!result.Success)
                    return BadRequest(new { message = result.Message });

                return Ok(new 
                { 
                    status = "success", 
                    message = result.Message,
                    user = result.Data 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi Database", details = ex.InnerException != null ? ex.InnerException.Message : ex.Message });
            }
        }
    }
}
