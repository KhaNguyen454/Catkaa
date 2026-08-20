using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<ServiceResult<string>> CreatePaymentUrlAsync(int bookingId, int? currentUserId, HttpContext context);
        Task<ServiceResult<object>> DebugSignAsync(int bookingId, HttpContext context);
        Task<ServiceResult<object>> PaymentExecuteIpnAsync(IQueryCollection collections);
        Task<ServiceResult<List<PaymentResponseDto>>> GetPaymentsAsync(string? type, string role, int? currentUserId, int? filterHotelId);
        Task<ServiceResult<PaymentResponseDto>> GetPaymentByBookingAsync(int bookingId, string role, int? currentUserId);
        Task<ServiceResult<List<PaymentResponseDto>>> GetMyPaymentsAsync(int userId, string? type);
        Task<ServiceResult<object>> QrPaymentAsync(int bookingId);
        Task<ServiceResult<object>> QrPlanPaymentAsync(int planId, int userId);
        Task<ServiceResult<object>> ConfirmPaymentAsync(int paymentId, string role);
    }
}
