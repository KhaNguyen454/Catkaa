using System;

namespace Catkaa.MicroPms.Api.DTOs
{
    public class BookingResponseDto
    {
        public int Id { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string GuestName { get; set; } = string.Empty;
        public string GuestCccd { get; set; } = string.Empty;
        public int HotelId { get; set; }
        public int RoomId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
