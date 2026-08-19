using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Catkaa.MicroPms.Api.Data;
using System.Linq;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet]
        public async Task<IActionResult> GetContactRequests()
        {
            var requests = await _context.ContactRequests
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new ContactRequestDto
                {
                    Id = c.Id,
                    SenderName = c.SenderName,
                    Email = c.Email,
                    Message = c.Message,
                    IsResolved = c.IsResolved,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(ServiceResult<System.Collections.Generic.List<ContactRequestDto>>.Ok("Success", requests));
        }

        public class UpdateContactStatusDto
        {
            public bool IsResolved { get; set; }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateContactStatus(int id, [FromBody] UpdateContactStatusDto dto)
        {
            var request = await _context.ContactRequests.FindAsync(id);
            if (request == null)
            {
                return NotFound(ServiceResult<object>.Fail("Không tìm thấy yêu cầu hỗ trợ"));
            }

            request.IsResolved = dto.IsResolved;
            await _context.SaveChangesAsync();

            return Ok(ServiceResult<object>.Ok("Đã cập nhật trạng thái thành công"));
        }
    }
}
