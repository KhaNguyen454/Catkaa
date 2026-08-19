using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Catkaa.MicroPms.Api.Data;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Controllers
{
    [Route("api/contact")]
    public class ContactController : BaseApiController
    {
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;

        public ContactController(IEmailService emailService, ApplicationDbContext context)
        {
            _emailService = emailService;
            _context = context;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitContact([FromBody] ContactSubmitDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResult<object>.Fail("Invalid Data"));
            }

            try
            {
                var contactRequest = new Models.ContactRequest
                {
                    SenderName = dto.Name,
                    Email = dto.Email,
                    Message = dto.Message,
                    CreatedAt = System.DateTime.UtcNow,
                    IsResolved = false
                };
                
                _context.ContactRequests.Add(contactRequest);
                await _context.SaveChangesAsync();

                await _emailService.SendContactEmailAsync(dto);
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"[ContactController] Gửi email thất bại: {ex.Message}");
                // Không throw lỗi, vẫn trả về OK để Frontend hiển thị thành công
            }
            
            return Ok(ServiceResult<object>.Ok("Thông tin của bạn đã được gửi. Chúng tôi sẽ liên hệ sớm nhất!"));
        }
    }
}
