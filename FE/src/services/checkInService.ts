import { API_BASE_URL, getAuthToken } from './authService';

export interface CheckInRecordCreateDto {
  fullName: string;
  identityNumber: string;
  dateOfBirth?: string; // ISO 8601 format
  imageUrl?: string;
}

export interface OcrCheckInDto {
  fullName: string;
  idNumber: string;
  dateOfBirth?: string; // ISO 8601 format
  imageUrl?: string;
}

// Dùng cho GET /api/checkinrecords (danh sách lịch sử)
export interface CheckInRecordResponse {
  id: number;
  fullName: string;
  identityNumber: string;
  dateOfBirth?: string;
  imageUrl?: string;
  bookingId: number;
  hotelId: number;
  roomId: number;
  checkInTime: string;
}

// Dùng cho POST /api/hotels/{hotelId}/checkin-ocr (kết quả OCR check-in)
export interface OcrCheckInResult {
  checkInRecordId: number;
  bookingCode: string;
  guestName: string;
  hotelId: number;
  roomId: number;
  checkInTime: string;
}

export interface OcrCheckInResponse {
  message: string;
  data: OcrCheckInResult;
  ocrRaw: OcrCheckInDto;
}

class CheckInService {
  /**
   * Get all check-in records (Admin/Host only)
   */
  static async getAllCheckInRecords(filterHotelId?: number): Promise<CheckInRecordResponse[]> {
    const params = new URLSearchParams();
    if (filterHotelId) {
      params.append('filterHotelId', filterHotelId.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/checkinrecords?${params}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch check-in records');
    }

    return await response.json();
  }

  /**
   * Get a specific check-in record
   */
  static async getCheckInRecordById(id: number): Promise<CheckInRecordResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/checkinrecords/${id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch check-in record');
    }

    return await response.json();
  }

  /**
   * Create a manual check-in record
   */
  static async createCheckInRecord(
    hotelId: number,
    checkInData: CheckInRecordCreateDto
  ): Promise<CheckInRecordResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/hotels/${hotelId}/checkinrecords`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(checkInData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create check-in record');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Process OCR check-in (automatic booking detection from ID card)
   */
  static async ocrCheckIn(
    hotelId: number,
    imageFile: File
  ): Promise<OcrCheckInResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(
      `${API_BASE_URL}/api/hotels/${hotelId}/checkin-ocr`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process OCR check-in');
    }

    return await response.json();
  }

  /**
   * Update a check-in record
   */
  static async updateCheckInRecord(
    id: number,
    checkInData: Partial<CheckInRecordCreateDto>
  ): Promise<CheckInRecordResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/checkinrecords/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(checkInData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update check-in record');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Delete a check-in record
   */
  static async deleteCheckInRecord(id: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/checkinrecords/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete check-in record');
    }
  }
}

export default CheckInService;
