import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Check, ArrowLeft, Loader2, LogOut } from "lucide-react";
import CheckInService from "../services/checkInService";

const Checkout: React.FC = () => {
  const [bookingCode, setBookingCode] = useState("");
  const [guestCccd, setGuestCccd] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim() || !guestCccd.trim()) {
      setError("Vui lòng nhập đầy đủ Mã Booking và Số CCCD");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await CheckInService.checkout(bookingCode.trim(), guestCccd.trim());
      setSuccess(true);
      setBookingCode("");
      setGuestCccd("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="demo-wrapper pt-120 pb-120">
      <div className="auto-container d-flex justify-content-center">
        <div className="phone-mockup" style={{ width: "100%", maxWidth: "400px" }}>
          <div className="phone-notch-top"></div>
          <div className="h-100 bg-white overflow-hidden d-flex flex-column phone-screen-content">
            
            {/* Header */}
            <div className="px-3 py-3 text-white d-flex align-items-center gap-2" style={{ background: "linear-gradient(135deg, #16309F, #1686cb)" }}>
              <LogOut size={16} />
              <span className="fw-bold" style={{ fontSize: "14px" }}>Trả Phòng Nhanh</span>
            </div>

            <div className="flex-grow-1 p-4 d-flex flex-column justify-content-center" style={{ background: "#F0F4F8" }}>
              {success ? (
                <div className="text-center bg-white p-4 rounded-4 shadow-sm border border-success">
                  <div className="bg-success text-white rounded-circle d-inline-flex p-3 shadow mb-3">
                    <Check size={34} />
                  </div>
                  <h5 className="fw-bold text-success mb-2">Trả phòng thành công!</h5>
                  <p className="text-muted small mb-4">Cảm ơn bạn đã lựa chọn dịch vụ của CATKAA. Hẹn gặp lại bạn lần sau.</p>
                  
                  <button 
                    className="btn w-100 rounded-pill text-white fw-bold py-2 shadow-sm"
                    style={{ background: "#1686cb", fontSize: "13px" }}
                    onClick={() => setSuccess(false)}
                  >
                    Trả phòng cho booking khác
                  </button>
                  <Link 
                    to="/" 
                    className="btn btn-outline-secondary w-100 rounded-pill fw-bold mt-2"
                    style={{ fontSize: "13px" }}
                  >
                    Về trang chủ
                  </Link>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-4 shadow-sm">
                  <div className="text-center mb-4">
                    <div className="bg-light d-inline-flex p-3 rounded-circle mb-3 border">
                      <Building2 size={28} className="text-primary" />
                    </div>
                    <p className="small text-muted mb-0">Điền thông tin để thực hiện trả phòng tự động.</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger p-2 text-center" style={{ fontSize: "12px" }}>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleCheckout}>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted" style={{ fontSize: "11px" }}>MÃ BOOKING</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Ví dụ: BKG-1234"
                        value={bookingCode}
                        onChange={(e) => setBookingCode(e.target.value)}
                        style={{ fontSize: "13px" }}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label fw-bold text-muted" style={{ fontSize: "11px" }}>SỐ CCCD / CMND</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Nhập số CCCD"
                        value={guestCccd}
                        onChange={(e) => setGuestCccd(e.target.value)}
                        style={{ fontSize: "13px" }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="btn w-100 rounded-pill text-white fw-bold py-2 shadow-sm d-flex justify-content-center align-items-center"
                      style={{ background: "linear-gradient(135deg, #16309F, #1686cb)", fontSize: "13px" }}
                    >
                      {isLoading ? <Loader2 size={16} className="spin me-2" /> : null}
                      {isLoading ? "Đang xử lý..." : "Trả phòng ngay"}
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Checkout;
