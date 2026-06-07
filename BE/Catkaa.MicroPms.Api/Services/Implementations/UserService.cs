using Catkaa.MicroPms.Api.Data;
using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using Catkaa.MicroPms.Api.Models;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public UserService(ApplicationDbContext context, IEmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<ServiceResult<List<UserResponseDto>>> GetAllUsersAsync(string role, int? currentUserId)
        {
            if (role != "Admin" && role != "Host")
                return ServiceResult<List<UserResponseDto>>.Fail("Unauthorized Access");

            var query = _context.Users.Include(u => u.Hotels).AsQueryable();
            if (role == "Host")
                query = query.Where(u => u.Role == "Guest");

            var users = await query.Select(u => new UserResponseDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role,
                Hotels = u.Hotels.Select(h => new HotelDto
                {
                    Id = h.Id,
                    Name = h.Name,
                    Address = h.Address
                }).ToList()
            }).ToListAsync();

            return ServiceResult<List<UserResponseDto>>.Ok("Success", users);
        }

        public async Task<ServiceResult<UserResponseDto>> GetUserByIdAsync(int id, string role, int? currentUserId)
        {
            if (role != "Admin" && role != "Host")
                return ServiceResult<UserResponseDto>.Fail("Unauthorized Access");

            var u = await _context.Users
                .Include(u => u.Hotels)
                .FirstOrDefaultAsync(u => u.Id == id);
            if (u == null) return ServiceResult<UserResponseDto>.Fail("User not found");
            if (role == "Host" && u.Role != "Guest")
                return ServiceResult<UserResponseDto>.Fail("Unauthorized Access");

            return ServiceResult<UserResponseDto>.Ok("Success", new UserResponseDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role,
                Hotels = u.Hotels.Select(h => new HotelDto
                {
                    Id = h.Id,
                    Name = h.Name,
                    Address = h.Address
                }).ToList()
            });
        }

        public async Task<ServiceResult<UserResponseDto>> CreateUserAsync(UserCreateDto dto, string role)
        {
            if (role != "Admin" && role != "Host")
                return ServiceResult<UserResponseDto>.Fail("Unauthorized Access");
            if (role == "Host" && dto.Role != "Guest")
                return ServiceResult<UserResponseDto>.Fail("Host chỉ được tạo tài khoản Guest");

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = dto.Password,
                Email = dto.Email,
                Role = dto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Load hotels
            var hotels = await _context.Hotels
                .Where(h => h.HostId == user.Id)
                .ToListAsync();

            return ServiceResult<UserResponseDto>.Ok("Created", new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Hotels = hotels.Select(h => new HotelDto 
                { 
                    Id = h.Id, 
                    Name = h.Name, 
                    Address = h.Address 
                }).ToList()
            });
        }

        public async Task<ServiceResult<object>> UpdateUserAsync(int id, UserUpdateDto dto, string role, int? currentUserId)
        {
            if (role != "Admin" && role != "Host")
                return ServiceResult<object>.Fail("Unauthorized Access");

            var user = await _context.Users.FindAsync(id);
            if (user == null) return ServiceResult<object>.Fail("User not found");
            if (role == "Host" && user.Role != "Guest")
                return ServiceResult<object>.Fail("Unauthorized Access");

            user.Username = dto.Username;
            user.Email = dto.Email;
            user.Role = dto.Role;

            if (!string.IsNullOrEmpty(dto.Password))
            {
                user.PasswordHash = dto.Password;
            }

            await _context.SaveChangesAsync();
            return ServiceResult<object>.Ok("Updated");
        }

        public async Task<ServiceResult<object>> DeleteUserAsync(int id, string role, int? currentUserId)
        {
            if (role != "Admin" && role != "Host")
                return ServiceResult<object>.Fail("Unauthorized Access");

            var user = await _context.Users.FindAsync(id);
            if (user == null) return ServiceResult<object>.Fail("User not found");
            if (role == "Host" && user.Role != "Guest")
                return ServiceResult<object>.Fail("Unauthorized Access");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return ServiceResult<object>.Ok("Deleted");
        }

        public async Task<ServiceResult<UpgradeResponseDto>> UpgradeToHostAsync(int userId, int planId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return ServiceResult<UpgradeResponseDto>.Fail("User not found");
            }

            var plan = await _context.PricingPlans.FindAsync(planId);
            if (plan == null || !plan.IsActive)
            {
                return ServiceResult<UpgradeResponseDto>.Fail("Invalid or inactive pricing plan");
            }

            if (user.Role != "Admin")
            {
                user.Role = "Host";
            }
            await _context.SaveChangesAsync();

            try
            {
                var adminEmail = _configuration["SmtpSettings:SenderEmail"] ?? "catkaofficial@gmail.com";
                var subject = $"Thông báo: Nâng cấp Host - {plan.Name} - {user.Username}";
                var body = $@"
                    <h3>Hệ thống vừa có một người dùng đăng ký gói dịch vụ mới!</h3>
                    <p><strong>Tài khoản:</strong> {user.Username}</p>
                    <p><strong>Email đăng ký:</strong> {user.Email}</p>
                    <p><strong>Gói dịch vụ đã chọn:</strong> {plan.Name} ({plan.Price})</p>
                    <p>Hệ thống đã tự động nâng cấp quyền Host cho tài khoản này.</p>
                    <p>Vui lòng liên hệ với người dùng thông qua Email hoặc chờ thông tin chi tiết từ Form Liên hệ để hỗ trợ cài đặt và bàn giao phần cứng.</p>
                ";
                await _emailService.SendEmailAsync(adminEmail, subject, body);
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"Failed to send upgrade email: {ex.Message}");
            }

            return ServiceResult<UpgradeResponseDto>.Ok("Success", new UpgradeResponseDto
            {
                Message = "Chúc mừng bạn đã nâng cấp thành công, vui lòng đăng nhập lại để bắt đầu sử dụng quyền của Host.",
                NewToken = "" // The frontend will require relogin
            });
        }
    }
}
