using System.Collections.Generic;

namespace Catkaa.MicroPms.Api.DTOs
{
    public class RoomResponseDto
    {
        public int Id { get; set; }
        public int HotelId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string RoomType { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Status { get; set; } = "Available";
        public string? Description { get; set; }
        public string? MainImageUrl { get; set; }
        public List<string>? ImageGallery { get; set; }
        public string? RoomPassword { get; set; }
    }
}
