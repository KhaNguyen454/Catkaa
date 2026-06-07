using Catkaa.MicroPms.Api.Data;
using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Controllers
{
    [Route("api/pricing-plans")]
    public class PricingPlansController : BaseApiController
    {
        private readonly ApplicationDbContext _context;

        public PricingPlansController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPricingPlans()
        {
            var plans = await _context.PricingPlans
                .Where(p => p.IsActive)
                .Select(p => new PricingPlanDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Subtitle = p.Subtitle,
                    Price = p.Price,
                    BtnText = p.BtnText,
                    IsPopular = p.IsPopular,
                    Features = JsonSerializer.Deserialize<System.Collections.Generic.List<object>>(p.FeaturesJson, (JsonSerializerOptions)null!)
                })
                .ToListAsync();

            return Ok(ServiceResult<object>.Ok("Success", plans));
        }
    }
}
