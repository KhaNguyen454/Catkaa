import { API_BASE_URL } from '../config/apiConfig';
import { getAuthToken } from './authService';

export interface PaymentRecord {
  id: number;
  type: string;
  bookingId?: number;
  bookingCode?: string;
  guestName?: string;
  hotelId?: number;
  hotelName?: string;
  roomId?: number;
  roomNumber?: string;
  pricingPlanId?: number;
  planName?: string;
  userId?: number;
  username?: string;
  transactionId: string;
  amount: number;
  status: string;
  paymentDate: string;
  paymentMethod: string;
}

class PaymentService {
  static async getPayments(filterHotelId?: number, type?: string): Promise<PaymentRecord[]> {
    const params = new URLSearchParams();
    if (filterHotelId) params.append('filterHotelId', filterHotelId.toString());
    if (type) params.append('type', type);

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

  static async qrPayment(bookingId: number): Promise<{ roomPassword?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/payments/${bookingId}/qr-pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Thanh toán chuyển khoản QR thất bại');
    }
    
    const result = await response.json();
    return result.data || {};
  }

  static async qrPlanPayment(planId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/payments/qr-plan-payment/${planId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Thanh toán chuyển khoản QR thất bại');
    }
    
    return await response.json();
  }

  static async confirmPayment(paymentId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/confirm`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Xác nhận thanh toán thất bại');
    }
    
    return await response.json();
  }
}

export default PaymentService;
