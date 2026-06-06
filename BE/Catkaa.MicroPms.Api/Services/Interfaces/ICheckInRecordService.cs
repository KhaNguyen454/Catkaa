using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Helpers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Services.Interfaces
{
    public interface ICheckInRecordService
    {
        Task<ServiceResult<List<CheckInRecordResponseDto>>> GetAllAsync(string role, int? currentUserId, int? filterHotelId = null);
        Task<ServiceResult<CheckInRecordResponseDto>> GetByIdAsync(int id, string role, int? currentUserId);
        Task<ServiceResult<CheckInRecordResponseDto>> CreateAsync(int hotelId, CheckInRecordCreateDto dto, int currentUserId);
        Task<ServiceResult<OcrCheckInResponseDto>> ProcessOcrCheckInAsync(int hotelId, OcrCheckInDto request, int currentUserId);
        Task<ServiceResult<object>> UpdateAsync(int id, CheckInRecordUpdateDto dto, string role, int? currentUserId);
        Task<ServiceResult<object>> DeleteAsync(int id, string role, int? currentUserId);
        Task<ServiceResult<object>> CheckOutAsync(CheckOutRequestDto request);
    }
}
