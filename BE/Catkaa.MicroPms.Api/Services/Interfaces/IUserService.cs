using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<ServiceResult<List<UserResponseDto>>> GetAllUsersAsync(string role, int? currentUserId);
        Task<ServiceResult<UserResponseDto>> GetUserByIdAsync(int id, string role, int? currentUserId);
        Task<ServiceResult<UserResponseDto>> CreateUserAsync(UserCreateDto dto, string role);
        Task<ServiceResult<object>> UpdateUserAsync(int id, UserUpdateDto dto, string role, int? currentUserId);
        Task<ServiceResult<object>> DeleteUserAsync(int id, string role, int? currentUserId);
        Task<ServiceResult<UpgradeResponseDto>> UpgradeToHostAsync(int userId, int planId);
    }
}
