import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Check, Loader2, LogOut, Search, KeyRound } from "lucide-react";
import BookingService, { ActiveRoomResponse } from "../services/bookingService";
import CheckInService from "../services/checkInService";
import { useNotification } from "../components/NotificationContext";

const Checkout: React.FC = () => {
  const [cccd, setCccd] = useState("");
  const [rooms, setRooms] = useState<ActiveRoomResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Checkout Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ActiveRoomResponse | null>(null);
  const [roomPassword, setRoomPassword] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { addNotification } = useNotification();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cccd.trim()) {
      addNotification("warning", "Vui lòng nhập số CCCD / CMND");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await BookingService.getActiveRoomsByCccd(cccd);
      setRooms(data);
    } catch (err: any) {
      addNotification("error", err.message || "Không tìm thấy thông tin phòng!");
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCheckoutModal = (room: ActiveRoomResponse) => {
    setSelectedRoom(room);
    setRoomPassword("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    setRoomPassword("");
  };

  const handleConfirmCheckout = async () => {
    if (!selectedRoom) return;
    if (!roomPassword.trim()) {
      addNotification("warning", "Vui lòng nhập mật khẩu phòng");
      return;
    }

    setCheckoutLoading(true);
    try {
      await CheckInService.checkout(selectedRoom.bookingCode, cccd, roomPassword);
      addNotification("success", "Trả phòng thành công!");
      handleCloseModal();
      setSuccess(true);
      // Xóa form search
      setRooms([]);
      setHasSearched(false);
      setCccd("");
    } catch (err: any) {
      addNotification("error", err.message || "Trả phòng thất bại");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="demo-wrapper pt-120 pb-120">
      <div className="auto-container d-flex justify-content-center position-relative">
        <div className="phone-mockup" style={{ width: "100%", maxWidth: "400px" }}>
          <div className="phone-notch-top"></div>
          <div className="h-100 bg-white overflow-hidden d-flex flex-column phone-screen-content">
            
            {/* Header */}
            <div className="px-3 py-3 text-white d-flex align-items-center gap-2" style={{ background: "linear-gradient(135deg, #16309F, #1686cb)" }}>
              <LogOut size={16} />
              <span className="fw-bold" style={{ fontSize: "14px" }}>Trả Phòng Nhanh</span>
            </div>

            <div className="flex-grow-1 p-3 p-md-4 d-flex flex-column" style={{ background: "#F0F4F8", overflowY: "auto" }}>
              {success ? (
                <div className="text-center bg-white p-4 rounded-4 shadow-sm border border-success mt-auto mb-auto">
                  <div className="bg-success text-white rounded-circle d-inline-flex p-3 shadow mb-3">
                    <Check size={34} />
                  </div>
                  <h5 className="fw-bold text-success mb-2">Trả phòng thành công!</h5>
                  <p className="text-muted small mb-4">Cảm ơn bạn đã lựa chọn dịch vụ của CATKA. Hẹn gặp lại bạn lần sau.</p>
                  
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
                <>
                  <div className="bg-white p-4 rounded-4 shadow-sm mb-4 flex-shrink-0">
                    <div className="text-center mb-4">
                      <div className="bg-light d-inline-flex p-3 rounded-circle mb-3 border">
                        <Building2 size={28} className="text-primary" />
                      </div>
                      <p className="small text-muted mb-0">Điền số CCCD để thực hiện trả phòng tự động.</p>
                    </div>

                    <form onSubmit={handleSearch}>
                      <div className="mb-4">
                        <label className="form-label fw-bold text-muted" style={{ fontSize: "11px" }}>SỐ CCCD / CMND</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Nhập số CCCD..."
                          value={cccd}
                          onChange={(e) => setCccd(e.target.value)}
                          disabled={isLoading}
                          style={{ fontSize: "13px" }}
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={isLoading || !cccd.trim()}
                        className="btn w-100 rounded-pill text-white fw-bold py-2 shadow-sm d-flex justify-content-center align-items-center"
                        style={{ background: "linear-gradient(135deg, #16309F, #1686cb)", fontSize: "13px" }}
                      >
                        {isLoading ? <Loader2 size={16} className="spin me-2" /> : <Search size={16} className="me-2" />}
                        {isLoading ? "Đang tìm kiếm..." : "Tìm phòng"}
                      </button>
                    </form>
                  </div>

                  {hasSearched && !isLoading && (
                    <div className="search-results pb-4 flex-shrink-0">
                      {rooms.length === 0 ? (
                        <div className="text-center p-4 bg-white rounded-4 shadow-sm border border-light">
                          <p className="text-muted small mb-0">Không tìm thấy phòng nào đang ở với CCCD này trong hôm nay.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="small text-muted fw-bold mb-2 ps-1">TÌM THẤY {rooms.length} PHÒNG</p>
                          <div className="d-flex flex-column gap-3">
                            {rooms.map((room) => (
                              <div className="bg-white rounded-4 shadow-sm border border-light overflow-hidden" key={room.bookingCode}>
                                <div className="p-3">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="fw-bold mb-0 text-primary" style={{ fontSize: "14px" }}>
                                      P. {room.roomNumber}
                                    </h6>
                                    <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: "10px" }}>
                                      Đang ở
                                    </span>
                                  </div>
                                  <div className="text-muted mb-3" style={{ fontSize: "12px" }}>
                                    <div className="mb-1 text-truncate"><strong>Khách sạn:</strong> {room.hotelName}</div>
                                    <div><strong>Loại phòng:</strong> {room.roomType}</div>
                                  </div>
                                  <button 
                                    className="btn btn-outline-danger w-100 py-1"
                                    style={{ fontSize: "12px", fontWeight: "bold" }}
                                    onClick={() => handleOpenCheckoutModal(room)}
                                  >
                                    Trả phòng ngay
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Xác thực Mật khẩu (Overlay over the phone mockup) */}
            {isModalOpen && selectedRoom && (
              <div 
                className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
                style={{ background: "rgba(0,0,0,0.6)", zIndex: 1000, borderRadius: "2rem" }}
                onClick={handleCloseModal}
              >
                <div 
                  className="bg-white m-3 p-4 rounded-4 shadow w-100" 
                  style={{ animation: "slideUp 0.3s ease-out" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="text-center mb-3">
                    <div className="bg-danger bg-opacity-10 d-inline-flex p-3 rounded-circle mb-2">
                      <KeyRound size={24} className="text-danger" />
                    </div>
                    <h6 className="fw-bold mb-1">Xác thực trả phòng</h6>
                    <p className="text-muted" style={{ fontSize: "12px" }}>
                      P. {selectedRoom.roomNumber} - {selectedRoom.hotelName}
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted fw-bold" style={{ fontSize: "11px" }}>MẬT KHẨU PHÒNG</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Nhập mật khẩu để xác nhận..."
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmCheckout(); }}
                      disabled={checkoutLoading}
                      style={{ fontSize: "13px" }}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-light w-50 fw-bold" 
                      style={{ fontSize: "13px" }}
                      onClick={handleCloseModal}
                      disabled={checkoutLoading}
                    >
                      Hủy
                    </button>
                    <button 
                      className="btn btn-danger w-50 fw-bold d-flex align-items-center justify-content-center" 
                      style={{ fontSize: "13px" }}
                      onClick={handleConfirmCheckout}
                      disabled={checkoutLoading || !roomPassword.trim()}
                    >
                      {checkoutLoading ? <Loader2 size={14} className="spin" /> : "Xác nhận"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Checkout;
