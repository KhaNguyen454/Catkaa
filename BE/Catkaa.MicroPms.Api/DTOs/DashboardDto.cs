using System;
using System.Collections.Generic;

namespace Catkaa.MicroPms.Api.DTOs
{
    public class DashboardSummaryDto
    {
        public string RoomOccupancyRate { get; set; } = "0%";
        public int TotalGuestsThisMonth { get; set; } = 0;
        public string TodayRevenue { get; set; } = "0 ₫";
        public int SupportRequestsCount { get; set; } = 0;
        public List<RoomStatusChartDto> RoomStatusChart { get; set; } = new List<RoomStatusChartDto>();
    }

    public class RoomStatusChartDto
    {
        public string Name { get; set; } = string.Empty;
        public int Value { get; set; } = 0;
        public string Color { get; set; } = string.Empty;
    }

    public class CurrentGuestDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string Checkin { get; set; } = string.Empty;
        public string Checkout { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }
}
