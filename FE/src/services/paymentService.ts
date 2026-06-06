import { API_BASE_URL } from '../config/apiConfig';
import { getAuthToken } from './authService';

export interface PaymentRecord {
  id: number;
  bookingId: number;
  bookingCode: string;
  guestName?: string;
  hotelId: number;
  hotelName?: string;
  roomId: number;
  roomNumber?: string;
  transactionId: string;
  amount: number;
  status: string;
  paymentDate: string;
  paymentMethod: string;
}

class PaymentService {
  static async getPayments(filterHotelId?: number): Promise<PaymentRecord[]> {
    const params = new URLSearchParams();
    if (filterHotelId) params.append('filterHotelId', filterHotelId.toString());

    const response = await fetch(`${API_BASE_URL}/api/payments?${params}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không tải được danh sách thanh toán');
    }

    return await response.json();
  }

  static async getPaymentByBooking(bookingId: number): Promise<PaymentRecord> {
    const response = await fetch(`${API_BASE_URL}/api/payments/booking/${bookingId}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không tìm thấy thông tin thanh toán');
    }

    return await response.json();
  }

  static async mockPayment(bookingId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/payments/${bookingId}/mock-pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Thanh toán giả lập thất bại');
    }
  }
}

export default PaymentService;
