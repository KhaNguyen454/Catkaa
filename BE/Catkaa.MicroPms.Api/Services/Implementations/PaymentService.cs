using Catkaa.MicroPms.Api.Data;
using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using Catkaa.MicroPms.Api.Models;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly VnPaySettings _vnpSettings;

        public PaymentService(ApplicationDbContext context, IConfiguration configuration, IOptions<VnPaySettings> vnpSettings)
        {
            _context = context;
            _configuration = configuration;
            _vnpSettings = vnpSettings.Value;
        }

        public async Task<ServiceResult<string>> CreatePaymentUrlAsync(int bookingId, int? currentUserId, HttpContext context)
        {
            var booking = await _context.Bookings
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null) return ServiceResult<string>.Fail("Booking not found");

            // IDOR check: bỏ qua nếu currentUserId null (kiosk/anonymous)
            if (currentUserId != null && booking.UserId != currentUserId && booking.UserId != null)
                return ServiceResult<string>.Fail("Unauthorized Access");

            // Cho phép Pending (chưa check-in), AwaitingPayment (OCR xong), và CheckedIn
            if (booking.Status == "CheckIn" || booking.Status == "CheckOut" || booking.Status == "Cancelled")
                return ServiceResult<string>.Fail("Booking không thể thanh toán ở trạng thái hiện tại");

            // Kiểm tra đã thanh toán thành công chưa
            var existingPaid = await _context.Payments
                .AnyAsync(p => p.BookingId == bookingId && p.Status == "Success");
            if (existingPaid)
                return ServiceResult<string>.Fail("Booking này đã được thanh toán");

            var days = (booking.CheckOutDate.Date - booking.CheckInDate.Date).Days;
            if (days <= 0) days = 1;

            decimal totalAmount = days * (booking.Room?.Price ?? 0);
            if (totalAmount <= 0)
                return ServiceResult<string>.Fail("Invalid booking amount");

            var timeNow = DateTime.Now;
            var vnpay = new VnPayLibrary();

            Console.WriteLine($"\n[VNPAY_DEBUG_CONFIG] TmnCode='{_vnpSettings.TmnCode}', HashSecretLength={_vnpSettings.HashSecret?.Length}\n");

            vnpay.AddRequestData("vnp_Version", _vnpSettings.Version);
            vnpay.AddRequestData("vnp_Command", _vnpSettings.Command);
            vnpay.AddRequestData("vnp_TmnCode", _vnpSettings.TmnCode);
            vnpay.AddRequestData("vnp_Amount", (totalAmount * 100).ToString("0"));
            vnpay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_IpAddr", vnpay.GetIpAddress(context));
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toan booking {booking.BookingCode}");
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ReturnUrl", _vnpSettings.ReturnUrl);
            vnpay.AddRequestData("vnp_TxnRef", booking.Id.ToString() + "_" + timeNow.Ticks.ToString());

            var paymentUrl = vnpay.CreateRequestUrl(_vnpSettings.BaseUrl, _vnpSettings.HashSecret);
            Console.WriteLine($"\n[FINAL_URL] {paymentUrl}\n");
            return ServiceResult<string>.Ok("Success", paymentUrl);
        }

        public async Task<ServiceResult<object>> DebugSignAsync(int bookingId, HttpContext context)
        {
            var booking = await _context.Bookings
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null) return ServiceResult<object>.Fail("Booking not found");

            var days = (booking.CheckOutDate.Date - booking.CheckInDate.Date).Days;
            if (days <= 0) days = 1;
            decimal totalAmount = days * (booking.Room?.Price ?? 0);

            var timeNow = DateTime.Now;
            var vnpay = new VnPayLibrary();
            var hashSecret = _vnpSettings.HashSecret.Trim();

            vnpay.AddRequestData("vnp_Version",   _vnpSettings.Version);
            vnpay.AddRequestData("vnp_Command",   _vnpSettings.Command);
            vnpay.AddRequestData("vnp_TmnCode",   _vnpSettings.TmnCode);
            vnpay.AddRequestData("vnp_Amount",    (totalAmount * 100).ToString("0"));
            vnpay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode",  "VND");
            vnpay.AddRequestData("vnp_IpAddr",    vnpay.GetIpAddress(context));
            vnpay.AddRequestData("vnp_Locale",    "vn");
            vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toan booking {booking.BookingCode}");
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ReturnUrl", _vnpSettings.ReturnUrl);
            vnpay.AddRequestData("vnp_TxnRef",    booking.Id.ToString() + "_" + timeNow.Ticks.ToString());

            var (url, rawSignData) = vnpay.CreateRequestUrlWithDebug(_vnpSettings.BaseUrl, hashSecret);

            return ServiceResult<object>.Ok("Debug info", new
            {
                tmnCode          = _vnpSettings.TmnCode,
                hashSecretLength = hashSecret.Length,
                hashSecretFirst4 = hashSecret.Length >= 4 ? hashSecret[..4] : hashSecret,
                hashSecretLast4  = hashSecret.Length >= 4 ? hashSecret[^4..] : hashSecret,
                rawSignData      = rawSignData,
                paymentUrl       = url
            });
        }

        public async Task<ServiceResult<object>> PaymentExecuteIpnAsync(IQueryCollection collections)
        {
            var vnpay = new VnPayLibrary();
            foreach (var (key, value) in collections)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                    vnpay.AddResponseData(key, value.ToString());
            }

            var vnp_orderIdStr = vnpay.GetResponseData("vnp_TxnRef");
            var vnp_SecureHash = collections["vnp_SecureHash"].ToString();
            var vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
            var vnp_TransactionNo = vnpay.GetResponseData("vnp_TransactionNo");
            var vnp_AmountStr = vnpay.GetResponseData("vnp_Amount");

            bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, _vnpSettings.HashSecret);

            if (!checkSignature)
                return ServiceResult<object>.Fail("Invalid signature");

            var bookingIdStr = vnp_orderIdStr.Split('_')[0];
            if (!int.TryParse(bookingIdStr, out int bookingId))
                return ServiceResult<object>.Fail("Invalid order ID");

            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null)
                return ServiceResult<object>.Fail("Booking not found");

            // Idempotency: đã xử lý thanh toán thành công rồi thì bỏ qua
            var alreadyPaid = await _context.Payments
                .AnyAsync(p => p.BookingId == bookingId && p.Status == "Success");
            if (alreadyPaid)
                return ServiceResult<object>.Ok("Order already confirmed");

            decimal amount = 0;
            if (decimal.TryParse(vnp_AmountStr, out decimal rawAmount))
                amount = rawAmount / 100;

            if (vnp_ResponseCode == "00")
            {
                booking.Status = "Confirmed";
                _context.Payments.Add(new Payment
                {
                    BookingId = booking.Id,
                    TransactionId = vnp_TransactionNo,
                    Amount = amount,
                    Status = "Success",
                    PaymentDate = DateTime.Now,
                    PaymentMethod = "VNPay"
                });
            }
            else
            {
                _context.Payments.Add(new Payment
                {
                    BookingId = booking.Id,
                    TransactionId = vnp_TransactionNo,
                    Amount = amount,
                    Status = "Failed",
                    PaymentDate = DateTime.Now,
                    PaymentMethod = "VNPay"
                });
            }

            await _context.SaveChangesAsync();
            return ServiceResult<object>.Ok("IPN Handled");
        }

        public async Task<ServiceResult<List<PaymentResponseDto>>> GetPaymentsAsync(string role, int? currentUserId, int? filterHotelId)
        {
            var query = _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b!.Hotel)
                .Include(p => p.Booking)
                    .ThenInclude(b => b!.Room)
                .AsQueryable();

            // Host chỉ thấy payment của khách sạn mình quản lý
            if (role != "Admin")
            {
                if (currentUserId == null)
                    return ServiceResult<List<PaymentResponseDto>>.Fail("Unauthorized");
                query = query.Where(p => p.Booking != null && p.Booking.Hotel != null && p.Booking.Hotel.HostId == currentUserId);
            }

            if (filterHotelId.HasValue)
                query = query.Where(p => p.Booking != null && p.Booking.HotelId == filterHotelId.Value);

            var payments = await query
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentResponseDto
                {
                    Id = p.Id,
                    BookingId = p.BookingId,
                    BookingCode = p.Booking!.BookingCode,
                    GuestName = p.Booking.GuestName,
                    HotelId = p.Booking.HotelId,
                    HotelName = p.Booking.Hotel != null ? p.Booking.Hotel.Name : null,
                    RoomId = p.Booking.RoomId,
                    RoomNumber = p.Booking.Room != null ? p.Booking.Room.RoomNumber : null,
                    TransactionId = p.TransactionId,
                    Amount = p.Amount,
                    Status = p.Status,
                    PaymentDate = p.PaymentDate,
                    PaymentMethod = p.PaymentMethod
                })
                .ToListAsync();

            return ServiceResult<List<PaymentResponseDto>>.Ok("Success", payments);
        }

        public async Task<ServiceResult<List<PaymentResponseDto>>> GetMyPaymentsAsync(int userId)
        {
            var payments = await _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b!.Hotel)
                .Include(p => p.Booking)
                    .ThenInclude(b => b!.Room)
                .Where(p => p.Booking != null && p.Booking.UserId == userId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentResponseDto
                {
                    Id = p.Id,
                    BookingId = p.BookingId,
                    BookingCode = p.Booking!.BookingCode,
                    GuestName = p.Booking.GuestName,
                    HotelId = p.Booking.HotelId,
                    HotelName = p.Booking.Hotel != null ? p.Booking.Hotel.Name : null,
                    RoomId = p.Booking.RoomId,
                    RoomNumber = p.Booking.Room != null ? p.Booking.Room.RoomNumber : null,
                    TransactionId = p.TransactionId,
                    Amount = p.Amount,
                    Status = p.Status,
                    PaymentDate = p.PaymentDate,
                    PaymentMethod = p.PaymentMethod
                })
                .ToListAsync();

            return ServiceResult<List<PaymentResponseDto>>.Ok("Success", payments);
        }

        public async Task<ServiceResult<PaymentResponseDto>> GetPaymentByBookingAsync(int bookingId, string role, int? currentUserId)
        {
            var query = _context.Payments
                .Include(p => p.Booking)
                    .ThenInclude(b => b!.Hotel)
                .Include(p => p.Booking)
                    .ThenInclude(b => b!.Room)
                .Where(p => p.BookingId == bookingId)
                .AsQueryable();

            if (role != "Admin")
            {
                if (currentUserId == null)
                    return ServiceResult<PaymentResponseDto>.Fail("Unauthorized");
                query = query.Where(p => p.Booking != null && p.Booking.Hotel != null && p.Booking.Hotel.HostId == currentUserId);
            }

            // Lấy payment thành công trước, nếu không có thì lấy cái mới nhất
            var payment = await query
                .OrderByDescending(p => p.Status == "Success")
                .ThenByDescending(p => p.PaymentDate)
                .Select(p => new PaymentResponseDto
                {
                    Id = p.Id,
                    BookingId = p.BookingId,
                    BookingCode = p.Booking!.BookingCode,
                    GuestName = p.Booking.GuestName,
                    HotelId = p.Booking.HotelId,
                    HotelName = p.Booking.Hotel != null ? p.Booking.Hotel.Name : null,
                    RoomId = p.Booking.RoomId,
                    RoomNumber = p.Booking.Room != null ? p.Booking.Room.RoomNumber : null,
                    TransactionId = p.TransactionId,
                    Amount = p.Amount,
                    Status = p.Status,
                    PaymentDate = p.PaymentDate,
                    PaymentMethod = p.PaymentMethod
                })
                .FirstOrDefaultAsync();

            if (payment == null)
                return ServiceResult<PaymentResponseDto>.Fail("Không tìm thấy thông tin thanh toán cho booking này");

            return ServiceResult<PaymentResponseDto>.Ok("Success", payment);
        }

        public async Task<ServiceResult<object>> MockPaymentAsync(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null) return ServiceResult<object>.Fail("Booking not found");

            var alreadyPaid = await _context.Payments
                .AnyAsync(p => p.BookingId == bookingId && p.Status == "Success");
            
            if (alreadyPaid)
                return ServiceResult<object>.Ok("Order already confirmed");

            var days = (booking.CheckOutDate.Date - booking.CheckInDate.Date).Days;
            if (days <= 0) days = 1;

            decimal totalAmount = days * (booking.Room?.Price ?? 0);

            booking.Status = "CheckIn";
            _context.Payments.Add(new Payment
            {
                BookingId = booking.Id,
                TransactionId = "MOCK_" + DateTime.Now.Ticks.ToString(),
                Amount = totalAmount,
                Status = "Success",
                PaymentDate = DateTime.Now,
                PaymentMethod = "Mock"
            });

            await _context.SaveChangesAsync();
            return ServiceResult<object>.Ok("Mock Payment Successful");
        }
    }
}
