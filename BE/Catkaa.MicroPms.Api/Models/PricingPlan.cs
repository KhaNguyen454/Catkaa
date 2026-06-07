using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Catkaa.MicroPms.Api.Models
{
    public class PricingPlan
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Subtitle { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Price { get; set; } = string.Empty;

        [Required]
        public string FeaturesJson { get; set; } = "[]";

        [Required]
        [MaxLength(50)]
        public string BtnText { get; set; } = string.Empty;

        public bool IsPopular { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
