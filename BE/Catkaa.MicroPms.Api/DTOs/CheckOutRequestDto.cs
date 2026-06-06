using System.ComponentModel.DataAnnotations;

namespace Catkaa.MicroPms.Api.DTOs
{
    public class CheckOutRequestDto
    {
        [Required(ErrorMessage = "Mã booking là bắt buộc")]
        public string BookingCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số CCCD/CMND là bắt buộc")]
        public string GuestCccd { get; set; } = string.Empty;
    }
}
