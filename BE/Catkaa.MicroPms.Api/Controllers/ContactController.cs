using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Controllers
{
    [Route("api/contact")]
    public class ContactController : BaseApiController
    {
        private readonly IEmailService _emailService;

        public ContactController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitContact([FromBody] ContactSubmitDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResult<object>.Fail("Invalid Data"));
            }

            await _emailService.SendContactEmailAsync(dto);
            
            return Ok(ServiceResult<object>.Ok("Thông tin của bạn đã được gửi. Chúng tôi sẽ liên hệ sớm nhất!"));
        }
    }
}
