using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendBookingInfoAsync(string email, string bookingCode);
        Task SendEmailAsync(string email, string subject, string body);
        Task SendContactEmailAsync(Catkaa.MicroPms.Api.DTOs.ContactSubmitDto dto);
    }
}
