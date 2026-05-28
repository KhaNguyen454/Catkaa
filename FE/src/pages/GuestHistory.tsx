import React, { useEffect, useState } from "react";
import { History, CreditCard, User, AlertCircle, Inbox } from "lucide-react";
import { API_BASE_URL } from "../config/apiConfig";
import {
  getAuthToken,
  getAuthUsername,
} from "../services/authService";

/* ── Types ─────────────────────────────────────────── */
interface BookingResponse {
  id: number;
  bookingCode: string;
  guestName: string;
  hotelId: number;
  hotelName?: string;
  roomId: number;
  roomNumber?: string;
  roomType?: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
}

interface PaymentRecord {
  id: number;
  bookingId: number;
  bookingCode: string;
  guestName: string;
  hotelId: number;
  hotelName: string;
  roomId: number;
  roomNumber: string;
  transactionId: string;
  amount: number;
  status: string;
  paymentDate: string;
  paymentMethod: string;
}

/* ── Status helpers ─────────────────────────────────── */
const BOOKING_STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  Pending:    { label: "Chờ xác nhận", bg: "#fff3cd", color: "#856404" },
  Confirmed:  { label: "Đã xác nhận",  bg: "#cce5ff", color: "#004085" },
  CheckedIn:  { label: "Đang ở",       bg: "#d4edda", color: "#155724" },
  Completed:  { label: "Đã trả phòng", bg: "#e2e3e5", color: "#383d41" },
  Cancelled:  { label: "Đã hủy",       bg: "#f8d7da", color: "#721c24" },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  Success: { label: "Thành công", bg: "#d4edda", color: "#155724" },
  Failed:  { label: "Thất bại",   bg: "#f8d7da", color: "#721c24" },
  Pending: { label: "Chờ xử lý", bg: "#fff3cd", color: "#856404" },
};

function BookingBadge({ status }: { status: string }) {
  const cfg = BOOKING_STATUS_MAP[status] ?? { label: status, bg: "#e2e3e5", color: "#383d41" };
  return (
    <span
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const cfg = PAYMENT_STATUS_MAP[status] ?? { label: status, bg: "#e2e3e5", color: "#383d41" };
  return (
    <span
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

/* ── Helpers ─────────────────────────────────────────── */
function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

/* ── Sub-components ─────────────────────────────────── */
function LoadingState() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: "2rem", height: "2rem" }}>
        <span className="visually-hidden">Đang tải...</span>
      </div>
      <p className="mb-0" style={{ fontSize: "14px" }}>Đang tải dữ liệu...</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <AlertCircle size={40} color="#e53e3e" strokeWidth={1.5} />
      <p className="mt-3 mb-0 text-danger fw-semibold" style={{ fontSize: "14px" }}>
        {message}
      </p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
      <Inbox size={48} strokeWidth={1.2} />
      <p className="mt-3 mb-0" style={{ fontSize: "14px" }}>{label}</p>
    </div>
  );
}

/* ── Main component ─────────────────────────────────── */
const GuestHistory: React.FC = () => {
  const username = getAuthUsername();
  const [activeTab, setActiveTab] = useState<"bookings" | "payments">("bookings");

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    // Fetch bookings
    setBookingLoading(true);
    setBookingError(null);
    fetch(`${API_BASE_URL}/api/bookings/history`, { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Lỗi ${res.status}: Không thể tải lịch sử đặt phòng`);
        return res.json();
      })
      .then((data: BookingResponse[]) => setBookings(data))
      .catch((err: Error) => setBookingError(err.message))
      .finally(() => setBookingLoading(false));

    // Fetch payments
    setPaymentLoading(true);
    setPaymentError(null);
    fetch(`${API_BASE_URL}/api/payments/my`, { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Lỗi ${res.status}: Không thể tải lịch sử thanh toán`);
        return res.json();
      })
      .then((data: PaymentRecord[]) => setPayments(data))
      .catch((err: Error) => setPaymentError(err.message))
      .finally(() => setPaymentLoading(false));
  }, []);

  return (
    <section className="pt-80 pb-80 auto-container" style={{ minHeight: "60vh" }}>
      {/* ── Page header ── */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#eef6fd",
            border: "2px solid #1686cb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <User size={24} color="#1686cb" />
        </div>
        <div>
          <h1 className="mb-0" style={{ fontSize: "22px", fontWeight: 800, color: "#1686cb" }}>
            Lịch sử của tôi
          </h1>
          {username && (
            <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>
              {username}
            </p>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className="d-flex gap-2 mb-4"
        style={{ borderBottom: "2px solid #e9ecef", paddingBottom: "0" }}
      >
        <button
          onClick={() => setActiveTab("bookings")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "transparent",
            fontWeight: 700,
            fontSize: "14px",
            color: activeTab === "bookings" ? "#1686cb" : "#6c757d",
            borderBottom: activeTab === "bookings" ? "2px solid #1686cb" : "2px solid transparent",
            marginBottom: "-2px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "color 0.2s",
          }}
        >
          <History size={15} />
          Đặt phòng
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          style={{
            padding: "10px 20px",
            border: "none",
            background: "transparent",
            fontWeight: 700,
            fontSize: "14px",
            color: activeTab === "payments" ? "#1686cb" : "#6c757d",
            borderBottom: activeTab === "payments" ? "2px solid #1686cb" : "2px solid transparent",
            marginBottom: "-2px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "color 0.2s",
          }}
        >
          <CreditCard size={15} />
          Thanh toán
        </button>
      </div>

      {/* ── Bookings tab ── */}
      {activeTab === "bookings" && (
        <div>
          {bookingLoading ? (
            <LoadingState />
          ) : bookingError ? (
            <ErrorState message={bookingError} />
          ) : bookings.length === 0 ? (
            <EmptyState label="Bạn chưa có lịch sử đặt phòng nào." />
          ) : (
            <div className="table-responsive rounded-3 shadow-sm" style={{ border: "1px solid #e9ecef" }}>
              <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
                <thead style={{ background: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 ps-3" style={{ fontWeight: 700, color: "#495057", whiteSpace: "nowrap" }}>Mã booking</th>
                    <th className="py-3" style={{ fontWeight: 700, color: "#495057", whiteSpace: "nowrap" }}>Khách sạn</th>
                    <th className="py-3" style={{ fontWeight: 700, color: "#495057", whiteSpace: "nowrap" }}>Phòng</th>
                    <th className="py-3" style={{ fontWeight: 700, color: "#495057", whiteSpace: "nowrap" }}>Check-in</th>
                    <th className="py-3" style={{ fontWeight: 700, color: "#495057", whiteSpace: "nowrap" }}>Check-out</th>
                    <th className="py-3 pe-3" style={{ fontWeight: 700, color: "#495057", whiteSpace: "nowrap" }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="py-3 ps-3 fw-semibold" style={{ color: "#1686cb" }}>{b.bookingCode}</td>
                      <td className="py-3">{b.hotelName ?? `#${b.hotelId}`}</td>
                      <td className="py-3">{b.roomNumber ? `${b.roomNumber}${b.roomType ? ` (${b.roomType})` : ""}` : `#${b.roomId}`}</td>
                      <td className="py-3">{formatDate(b.checkInDate)}</td>
                      <td className="py-3">{formatDate(b.checkOutDate)}</td>
                      <td className="py-3 pe-3">
                        <BookingBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Payments tab ── */}
      {activeTab === "payments" && (
        <div>
          {paymentLoading ? (
            <LoadingState />
          ) : paymentError ? (
            <ErrorState message={paymentError} />
          ) : payments.length === 0 ? (
            <EmptyState label="Bạn chưa có lịch sử thanh toán nào." />
          ) : (
            <div className="table-responsive rounded-3 shadow-sm" style={{ border: "1px solid #e9ecef" }}>
              <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
                <thead style={{ background: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 ps-3" style={{ fontWeight: 700, color: "#495057", whiteSpace: "nowrap" }}>Mã booking</th>
                    <th className="py-3" style={{ fontWeight: 700, color: "#495057", whiteSpace: "nowrap" }}>Số tiền</th>
                    <th className="py-3" style={{ fontWeight: 700, color: "#495057", whiteSpace: "nowrap" }}>Ngày TT</th>
                    <th className="py-3" style={{ fontWeight: 700, color: "#495057", whiteSpace: "nowrap" }}>Trạng thái</th>
                    <th className="py-3 pe-3" style={{ fontWeight: 700, color: "#495057", whiteSpace: "nowrap" }}>Phương thức</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 ps-3 fw-semibold" style={{ color: "#1686cb" }}>{p.bookingCode}</td>
                      <td className="py-3 fw-semibold">{formatAmount(p.amount)}</td>
                      <td className="py-3">{formatDate(p.paymentDate)}</td>
                      <td className="py-3">
                        <PaymentBadge status={p.status} />
                      </td>
                      <td className="py-3 pe-3">{p.paymentMethod ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default GuestHistory;
