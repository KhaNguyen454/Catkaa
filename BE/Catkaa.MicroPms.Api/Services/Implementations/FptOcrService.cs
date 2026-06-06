using Catkaa.MicroPms.Api.DTOs;
using Catkaa.MicroPms.Api.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Globalization;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

namespace Catkaa.MicroPms.Api.Services.Implementations
{
    public class FptOcrService : IFptOcrService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<FptOcrService> _logger;
        private readonly IMemoryCache _cache;

        public FptOcrService(HttpClient httpClient, IConfiguration configuration, ILogger<FptOcrService> logger, IMemoryCache cache)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _cache = cache;
            
            // Lấy URL và API Key từ config nếu HttpClient chưa được configure default header (Phòng hờ)
            // Tốt nhất là cấu hình ở Program.cs
        }

        public async Task<OcrCheckInDto?> ExtractIdInfoAsync(IFormFile image)
        {
            if (image == null || image.Length == 0) return null;

            try
            {
                // Generate Cache Key using SHA256 hash of the image
                string cacheKey;
                using (var ms = new System.IO.MemoryStream())
                {
                    await image.CopyToAsync(ms);
                    ms.Position = 0;
                    using (var sha256 = System.Security.Cryptography.SHA256.Create())
                    {
                        var hashBytes = sha256.ComputeHash(ms);
                        cacheKey = "FPT_OCR_" + BitConverter.ToString(hashBytes).Replace("-", "");
                    }
                }

                if (_cache.TryGetValue(cacheKey, out OcrCheckInDto? cachedResult) && cachedResult != null)
                {
                    _logger.LogInformation($"[FPT_OCR_CACHE] Returning cached OCR result for image hash: {cacheKey}");
                    return cachedResult;
                }

                using var content = new MultipartFormDataContent();
                using var stream = image.OpenReadStream();
                using var streamContent = new StreamContent(stream);
                
                streamContent.Headers.ContentType = new MediaTypeHeaderValue(image.ContentType);
                content.Add(streamContent, "image", image.FileName);

                var response = await _httpClient.PostAsync("", content); // BaseAddress is set in Program.cs
                response.EnsureSuccessStatusCode();

                var responseString = await response.Content.ReadAsStringAsync();
                
                // Bật Log Debug: In chuỗi raw JSON ra Console
                _logger.LogInformation($"[FPT_OCR_RAW_RESPONSE]: {responseString}");

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var fptResponse = JsonSerializer.Deserialize<FptOcrResponseDto>(responseString, options);

                if (fptResponse == null)
                {
                    throw new Exception($"Lỗi Deserialize JSON từ FPT.AI. Raw JSON: {responseString}");
                }

                if (fptResponse.ErrorCode != 0)
                {
                    throw new Exception($"FPT.AI trả về lỗi (ErrorCode: {fptResponse.ErrorCode}). Raw JSON: {responseString}");
                }

                if (fptResponse.Data == null || fptResponse.Data.Count == 0)
                {
                    throw new Exception($"FPT.AI không bóc tách được dữ liệu (Data rỗng). Raw JSON: {responseString}");
                }

                var data = fptResponse.Data[0];
                
                DateTime dob = DateTime.MinValue;
                if (!string.IsNullOrEmpty(data.Dob))
                {
                    DateTime.TryParseExact(data.Dob, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out dob);
                }

                var resultDto = new OcrCheckInDto
                {
                    IdNumber = data.Id,
                    FullName = data.Name,
                    DateOfBirth = dob,
                    ImageUrl = "" // Xử lý upload ảnh riêng nếu cần
                };

                // Cache the result for 30 minutes
                _cache.Set(cacheKey, resultDto, TimeSpan.FromMinutes(30));

                return resultDto;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Exception during FPT OCR request: {ex.Message}");
                throw; // Rethrow để Controller bắt được và in ra Postman/Swagger
            }
        }
    }
}
