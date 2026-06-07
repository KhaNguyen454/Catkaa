using System.Collections.Generic;

namespace Catkaa.MicroPms.Api.DTOs
{
    public class PricingPlanDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string Price { get; set; } = string.Empty;
        public List<object> Features { get; set; } = new();
        public string BtnText { get; set; } = string.Empty;
        public bool IsPopular { get; set; }
    }

    public class UpgradeHostDto
    {
        public int PlanId { get; set; }
    }

    public class UpgradeResponseDto
    {
        public string Message { get; set; } = string.Empty;
        public string NewToken { get; set; } = string.Empty;
    }
}
