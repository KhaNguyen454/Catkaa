using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Controllers
{
    [Route("api/payments")]
    [Microsoft.AspNetCore.Http.Tags("9. Payments (Thanh toán VNPay)")]
    public class PaymentsController : BaseApiController
    {
        private readonly IPaymentService _paymentService;
        private readonly IConfiguration _configuration;

        public PaymentsController(IPaymentService paymentService, IConfiguration configuration)
        {
            _paymentService = paymentService;
            _configuration = configuration;
        }

        /// <summary>
        /// [Host/Guest] Tạo link thanh toán VNPay cho booking.
        /// Booking phải ở trạng thái Pending hoặc CheckedIn.
        /// </summary>
        [HttpPost("create-url/{bookingId}")]
        [Authorize]
        public async Task<IActionResult> CreatePaymentUrl(int bookingId)
        {
            try
            {
                var result = await _paymentService.CreatePaymentUrlAsync(bookingId, CurrentUserId, HttpContext);
                if (!result.Success) return BadRequest(new { message = result.Message });
                return Ok(new { paymentUrl = result.Data });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        /// <summary>
        /// [Admin/Host] Lấy danh sách tất cả payment.
        /// Host chỉ thấy payment thuộc khách sạn mình. Có thể filter theo hotelId.
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin, Host")]
        public async Task<IActionResult> GetPayments([FromQuery] string? type = null, [FromQuery] int? filterHotelId = null)
        {
            try
            {
                var result = await _paymentService.GetPaymentsAsync(type, CurrentUserRole, CurrentUserId, filterHotelId);
                if (!result.Success) return Unauthorized(new { message = result.Message });
                return Ok(result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        /// <summary>
        /// [Admin/Host] Lấy thông tin thanh toán theo bookingId.
        /// Trả về payment thành công nếu có, ngược lại trả về payment mới nhất.
        /// </summary>
        [HttpGet("booking/{bookingId}")]
        [Authorize(Roles = "Admin, Host")]
        public async Task<IActionResult> GetPaymentByBooking(int bookingId)
        {
            try
            {
                var result = await _paymentService.GetPaymentByBookingAsync(bookingId, CurrentUserRole, CurrentUserId);
                if (!result.Success) return NotFound(new { message = result.Message });
                return Ok(result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        /// <summary>
        /// [Guest/Host/Admin] Lấy lịch sử thanh toán của chính mình.
        /// </summary>
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyPayments([FromQuery] string? type = null)
        {
            if (CurrentUserId == null)
                return Unauthorized(new { message = "Chưa đăng nhập" });
            try
            {
                var result = await _paymentService.GetMyPaymentsAsync(CurrentUserId.Value, type);
                return Ok(result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        /// <summary>
        /// [DEBUG] Xem raw sign data và hash để kiểm tra chữ ký VNPay.
        /// XÓA endpoint này trước khi deploy production.
        /// </summary>
        [HttpGet("debug-sign/{bookingId}")]
        [AllowAnonymous]
        public async Task<IActionResult> DebugSign(int bookingId)
        {
            try
            {
                var result = await _paymentService.DebugSignAsync(bookingId, HttpContext);
                if (!result.Success) return BadRequest(new { message = result.Message });
                return Ok(result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// [VNPay IPN] Server-to-server callback từ VNPay sau khi thanh toán.
        /// Tự động cập nhật trạng thái booking và lưu payment record.
        /// </summary>
        [HttpGet("vnpay-ipn")]
        [AllowAnonymous]
        public async Task<IActionResult> PaymentExecuteIpn()
        {
            try
            {
                var result = await _paymentService.PaymentExecuteIpnAsync(Request.Query);
                if (result.Success)
                    return Ok(new { RspCode = "00", Message = "Confirm Success" });
                else
                    return Ok(new { RspCode = "97", Message = "Invalid signature or failed" });
            }
            catch (System.Exception)
            {
                return Ok(new { RspCode = "99", Message = "Unknown error" });
            }
        }

        /// <summary>
        /// [VNPay Return] Browser redirect sau khi khách hoàn tất thanh toán trên VNPay.
        /// Cũng tự record payment nếu IPN chưa xử lý (fallback).
        /// </summary>
        [HttpGet("vnpay-return")]
        [AllowAnonymous]
        public async Task<IActionResult> PaymentReturn()
        {
            var vnp_ResponseCode = Request.Query["vnp_ResponseCode"];
            var vnp_TxnRef = Request.Query["vnp_TxnRef"];
            var success = vnp_ResponseCode == "00";

            // Fallback: process payment nếu IPN chưa tới
            try { await _paymentService.PaymentExecuteIpnAsync(Request.Query); } catch { /* bỏ qua nếu lỗi */ }

            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            return Redirect($"{frontendUrl}/payment-result?success={success.ToString().ToLower()}&ref={vnp_TxnRef}");
        }

        /// <summary>
        /// [Mock] API giả lập thanh toán thành công để bypass VNPay khi môi trường test lỗi.
        /// </summary>
        [HttpPost("{bookingId}/mock-pay")]
        [AllowAnonymous]
        public async Task<IActionResult> MockPay(int bookingId)
        {
            try
            {
                var result = await _paymentService.MockPaymentAsync(bookingId);
                if (!result.Success) return BadRequest(new { message = result.Message });
                return Ok(new { message = "Thanh toán giả lập thành công" });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }

        /// <summary>
        /// [Mock] API giả lập thanh toán thành công mua gói dịch vụ để nâng cấp Host.
        /// </summary>
        [HttpPost("mock-plan-payment/{planId}")]
        [Authorize]
        public async Task<IActionResult> MockPlanPay(int planId)
        {
            if (CurrentUserId == null)
                return Unauthorized(new { message = "Chưa đăng nhập" });
                
            try
            {
                var result = await _paymentService.MockPlanPaymentAsync(planId, CurrentUserId.Value);
                if (!result.Success) return BadRequest(new { message = result.Message });
                return Ok(result.Data);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", details = ex.Message });
            }
        }
    }
}
