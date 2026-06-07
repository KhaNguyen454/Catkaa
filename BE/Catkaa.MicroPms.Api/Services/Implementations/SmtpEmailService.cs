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
            var body = $@"
                <h3>Khách hàng vừa đăng ký gói dịch vụ mới!</h3>
                <p><strong>Tên:</strong> {dto.Name}</p>
                <p><strong>Số điện thoại:</strong> {dto.Phone}</p>
                <p><strong>Email:</strong> {dto.Email}</p>
                <p><strong>Gói đăng ký:</strong> {dto.PackageName}</p>
                <p><strong>Lời nhắn:</strong> {dto.Message}</p>
                <p>Vui lòng liên hệ để hỗ trợ và giao phần cứng.</p>
            ";
            await SendEmailAsync(adminEmail, subject, body);
        }

        public async Task SendEmailAsync(string email, string subject, string body)
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
                UseDefaultCredentials = false
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail!, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(email);

            await client.SendMailAsync(mailMessage);
        }
    }
}
