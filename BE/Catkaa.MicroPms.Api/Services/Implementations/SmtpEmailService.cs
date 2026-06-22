using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
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

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(senderName, senderEmail));
                message.To.Add(new MailboxAddress("", email));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder { HtmlBody = body };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                client.Timeout = 5000; // 5 seconds timeout (bắt buộc cho Cloud)

                // Cấu hình SSL dựa trên port (465 = SslOnConnect, 587 = StartTls)
                var secureSocketOptions = port == 465 
                    ? SecureSocketOptions.SslOnConnect 
                    : SecureSocketOptions.StartTls;

                await client.ConnectAsync(host, port, secureSocketOptions);
                await client.AuthenticateAsync(senderEmail, password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"[Email Error] Failed to send email to {email}: {ex.Message}");
            }
        }
    }
}
