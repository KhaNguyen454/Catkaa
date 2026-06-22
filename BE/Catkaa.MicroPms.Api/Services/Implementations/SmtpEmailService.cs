using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Services.Implementations
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public SmtpEmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendBookingInfoAsync(string email, string bookingCode)
        {
            var subject = "Xác nhận Booking - CATKAA";
            var body = $"Mã Booking của bạn là: {bookingCode}";
            await SendEmailAsync(email, subject, body);
        }

        public async Task SendContactEmailAsync(Catkaa.MicroPms.Api.DTOs.ContactSubmitDto dto)
        {
            var adminEmail = _configuration["SmtpSettings:SenderEmail"] ?? "catkaofficial@gmail.com";
            var subject = $"Đăng Ký Dịch Vụ - {dto.PackageName} - {dto.Name}";
            var templatePath = System.IO.Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "EmailTemplates", "ContactTemplate.html");
            var body = await System.IO.File.ReadAllTextAsync(templatePath);
            
            body = body.Replace("{{Name}}", dto.Name);
            body = body.Replace("{{Phone}}", dto.Phone);
            body = body.Replace("{{Email}}", dto.Email);
            body = body.Replace("{{PackageName}}", string.IsNullOrEmpty(dto.PackageName) ? "Không xác định" : dto.PackageName);
            body = body.Replace("{{Message}}", string.IsNullOrEmpty(dto.Message) ? "(Không có lời nhắn)" : dto.Message);
            await SendEmailAsync(adminEmail, subject, body);
        }

        public async Task SendEmailAsync(string email, string subject, string body)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                
                var host = smtpSettings["Server"];
                var port = int.Parse(smtpSettings["Port"] ?? "587");
                var senderEmail = smtpSettings["SenderEmail"];
                var senderName = smtpSettings["SenderName"];
                var password = smtpSettings["Password"];

                using var client = new SmtpClient(host, port)
                {
                    Credentials = new NetworkCredential(senderEmail, password),
                    EnableSsl = true,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Timeout = 5000 // 5 seconds timeout (bắt buộc cho Cloud)
                };

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail!, senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);

                // Quan trọng: Phải dùng client.Send() trong Task.Run thay vì SendMailAsync()
                // Vì SmtpClient.Timeout KHÔNG CÓ TÁC DỤNG với SendMailAsync()
                await Task.Run(() => client.Send(mailMessage));
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"[Email Error] Failed to send email to {email}: {ex.Message}");
            }
        }
    }
}
