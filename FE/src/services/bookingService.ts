import { API_BASE_URL } from '../config/apiConfig';
import { getAuthToken } from './authService';

export interface BookingCreateDto {
  guestName: string;
  guestCccd: string;
  guestEmail?: string;
  checkInDate: string; // ISO 8601 format
  checkOutDate: string; // ISO 8601 format
}

export interface BookingResponse {
  id: number;
  bookingCode: string;
  guestName: string;
  guestCccd: string;
  checkInDate: string;
  checkOutDate: string;
  roomId: number;
  hotelId: number;
  status: string;
}

export interface BookingHistoryResponse {
  id: number;
  guestName: string;
  hotelName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
}

export interface ActiveRoomResponse {
  bookingCode: string;
  roomNumber: string;
  roomType: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
}

class BookingService {
  /**
   * Create a booking for a specific room
   */
  static async createBooking(
    hotelId: number,
    roomId: number,
    bookingData: BookingCreateDto
  ): Promise<BookingResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/hotels/${hotelId}/rooms/${roomId}/bookings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(bookingData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create booking');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get all bookings (for Admin/Host)
   */
  static async getAllBookings(filterHotelId?: number): Promise<BookingResponse[]> {
    const params = new URLSearchParams();
    if (filterHotelId) {
      params.append('filterHotelId', filterHotelId.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/bookings?${params}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch bookings');
    }

    return await response.json();
  }

  /**
   * Get booking history for current user
   */
  static async getBookingHistory(): Promise<BookingHistoryResponse[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/bookings/history`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch booking history');
    }

    return await response.json();
  }

  /**
   * Update a booking
   */
  static async updateBooking(
    id: number,
    bookingData: Partial<BookingCreateDto>
  ): Promise<BookingResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/bookings/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(bookingData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update booking');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Delete a booking
   */
  static async deleteBooking(id: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/bookings/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete booking');
    }
  }

  /**
   * Get active rooms for auto checkout by CCCD
   */
  static async getActiveRoomsByCccd(cccd: string): Promise<ActiveRoomResponse[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/bookings/active-rooms?cccd=${cccd}`,
      {
        method: 'GET'
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch active rooms');
    }

    const result = await response.json();
    return result.data;
  }
}

export default BookingService;
