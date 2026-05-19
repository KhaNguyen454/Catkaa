import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, BedDouble, CalendarDays, User2, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { getHotels, Hotel } from "../services/hotelService";
import { getRooms, RoomRecord } from "../services/roomService";
import BookingService, { BookingResponse } from "../services/bookingService";

const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

function nightCount(checkIn: string, checkOut: string) {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(diff / 86400000));
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

export default function TestBooking() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomRecord | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestCccd, setGuestCccd] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getHotels()
      .then(setHotels)
      .catch(() => setHotels([]))
      .finally(() => setLoadingHotels(false));
  }, []);

  const handleHotelChange = async (hotelId: number) => {
    const hotel = hotels.find((h) => h.id === hotelId) ?? null;
    setSelectedHotel(hotel);
    setSelectedRoom(null);
    setRooms([]);
    if (!hotel) return;
    setLoadingRooms(true);
    try {
      const data = await getRooms(hotelId);
      setRooms(data);
    } catch {
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotel || !selectedRoom) return;
    setError("");
    setSubmitting(true);
    try {
      const booking = await BookingService.createBooking(selectedHotel.id, selectedRoom.id, {
        guestName,
        guestCccd,
        guestEmail: guestEmail || undefined,
        checkInDate: new Date(checkInDate).toISOString(),
        checkOutDate: new Date(checkOutDate).toISOString(),
      });
      setResult(booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const nights = nightCount(checkInDate, checkOutDate);
  const totalPrice = selectedRoom ? selectedRoom.price * nights : 0;

  return (
    <section className="pt-80 pb-80 auto-container">
      <div className="sec-title mb-5">
        <div className="subtitle"><span className="dot"></span> ĐẶT PHÒNG</div>
        <h2 className="fw-900 text-dark" style={{ fontSize: "36px" }}>Tạo đặt phòng mới</h2>
        <p className="text-muted">Điền thông tin bên dưới để tạo booking, sau đó tiến hành check-in.</p>
      </div>

      {result ? (
        /* ── SUCCESS STATE ── */
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="bg-white rounded-4 shadow-sm border p-5 text-center">
              <div className="d-inline-flex bg-success bg-opacity-10 rounded-circle p-3 mb-4">
                <CheckCircle2 size={48} className="text-success" />
              </div>
              <h4 className="fw-bold text-dark mb-1">Đặt phòng thành công!</h4>
              <p className="text-muted small mb-4">Mã đặt phòng #{result.id}</p>

              <div className="text-start bg-light rounded-3 p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">Khách sạn</span>
                  <span className="fw-bold text-dark small">{selectedHotel?.name}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">Phòng</span>
                  <span className="fw-bold text-dark small">
                    {selectedRoom?.roomNumber} · {selectedRoom?.roomType}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">Khách</span>
                  <span className="fw-bold text-dark small">{result.guestName}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">CCCD</span>
                  <span className="fw-bold text-dark small">{result.guestCccd}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">Check-in</span>
                  <span className="fw-bold text-dark small">{formatDate(result.checkInDate)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">Check-out</span>
                  <span className="fw-bold text-dark small">{formatDate(result.checkOutDate)}</span>
                </div>
                <hr className="my-3" />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Tổng tiền ({nights} đêm)</span>
                  <span className="fw-bold text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="d-flex gap-3">
                <button
                  onClick={() => { setResult(null); setGuestName(""); setGuestCccd(""); setGuestEmail(""); }}
                  className="btn btn-outline-secondary rounded-pill fw-bold flex-grow-1"
                >
                  Tạo booking khác
                </button>
                <Link
                  to="/check-in"
                  className="btn rounded-pill fw-bold text-white flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                  style={{ background: "#16309F" }}
                >
                  Check-in ngay <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── FORM STATE ── */
        <div className="row g-4">
          {/* Cột form */}
          <div className="col-lg-7">
            <form onSubmit={handleSubmit}>
              {/* Chọn khách sạn */}
              <div className="bg-white rounded-4 shadow-sm border p-4 mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Building2 size={18} className="text-primary" />
                  <span className="fw-bold text-dark">Khách sạn</span>
                </div>
                {loadingHotels ? (
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <Loader2 size={16} className="spin" /> Đang tải danh sách...
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={selectedHotel?.id ?? ""}
                    onChange={(e) => handleHotelChange(Number(e.target.value))}
                    required
                  >
                    <option value="">-- Chọn khách sạn --</option>
                    {hotels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} · {h.address}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Chọn phòng */}
              <div className="bg-white rounded-4 shadow-sm border p-4 mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <BedDouble size={18} className="text-primary" />
                  <span className="fw-bold text-dark">Phòng</span>
                </div>
                {loadingRooms ? (
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <Loader2 size={16} className="spin" /> Đang tải danh sách phòng...
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={selectedRoom?.id ?? ""}
                    onChange={(e) => setSelectedRoom(rooms.find((r) => r.id === Number(e.target.value)) ?? null)}
                    required
                    disabled={!selectedHotel || rooms.length === 0}
                  >
                    <option value="">
                      {!selectedHotel ? "Chọn khách sạn trước" : rooms.length === 0 ? "Không có phòng" : "-- Chọn phòng --"}
                    </option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Phòng {r.roomNumber} · {r.roomType} · {formatPrice(r.price)}/đêm
                        {!r.isAvailable ? " (Không trống)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Thông tin khách */}
              <div className="bg-white rounded-4 shadow-sm border p-4 mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <User2 size={18} className="text-primary" />
                  <span className="fw-bold text-dark">Thông tin khách</span>
                </div>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nguyễn Văn An"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Số CCCD</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="012345678901"
                      value={guestCccd}
                      onChange={(e) => setGuestCccd(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">
                      Email <span className="fw-normal">(tuỳ chọn)</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="guest@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Ngày */}
              <div className="bg-white rounded-4 shadow-sm border p-4 mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <CalendarDays size={18} className="text-primary" />
                  <span className="fw-bold text-dark">Thời gian lưu trú</span>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Ngày nhận phòng</label>
                    <input
                      type="date"
                      className="form-control"
                      value={checkInDate}
                      min={today}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Ngày trả phòng</label>
                    <input
                      type="date"
                      className="form-control"
                      value={checkOutDate}
                      min={checkInDate || today}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger rounded-3 small py-2">{error}</div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedHotel || !selectedRoom}
                className="btn w-100 rounded-pill fw-bold py-3 text-white d-flex align-items-center justify-content-center gap-2"
                style={{ background: submitting || !selectedHotel || !selectedRoom ? "#aaa" : "#16309F", fontSize: "15px" }}
              >
                {submitting ? (
                  <><Loader2 size={18} className="spin" /> Đang xử lý...</>
                ) : (
                  <>Xác nhận đặt phòng <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          </div>

          {/* Cột tóm tắt */}
          <div className="col-lg-5">
            <div className="bg-white rounded-4 shadow-sm border p-4 position-sticky" style={{ top: "100px" }}>
              <h6 className="fw-bold text-dark mb-4">Tóm tắt đặt phòng</h6>

              {selectedHotel ? (
                <div className="mb-3 p-3 rounded-3" style={{ background: "#f8faff", border: "1px solid #e0eaff" }}>
                  <div className="small text-muted mb-1">Khách sạn</div>
                  <div className="fw-bold text-dark">{selectedHotel.name}</div>
                  <div className="small text-muted">{selectedHotel.address}</div>
                </div>
              ) : (
                <div className="mb-3 p-3 rounded-3 text-center text-muted small" style={{ background: "#f5f5f5", border: "1px dashed #ddd" }}>
                  Chưa chọn khách sạn
                </div>
              )}

              {selectedRoom ? (
                <div className="mb-3 p-3 rounded-3" style={{ background: "#f8faff", border: "1px solid #e0eaff" }}>
                  <div className="small text-muted mb-1">Phòng</div>
                  <div className="fw-bold text-dark">Phòng {selectedRoom.roomNumber}</div>
                  <div className="small text-muted">{selectedRoom.roomType} · {formatPrice(selectedRoom.price)}/đêm</div>
                </div>
              ) : (
                <div className="mb-3 p-3 rounded-3 text-center text-muted small" style={{ background: "#f5f5f5", border: "1px dashed #ddd" }}>
                  Chưa chọn phòng
                </div>
              )}

              {guestName && (
                <div className="mb-3 p-3 rounded-3" style={{ background: "#f8faff", border: "1px solid #e0eaff" }}>
                  <div className="small text-muted mb-1">Khách</div>
                  <div className="fw-bold text-dark">{guestName}</div>
                  {guestCccd && <div className="small text-muted">CCCD: {guestCccd}</div>}
                </div>
              )}

              <div className="mb-4 p-3 rounded-3" style={{ background: "#f8faff", border: "1px solid #e0eaff" }}>
                <div className="small text-muted mb-2">Thời gian</div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="small text-muted">Nhận phòng</span>
                  <span className="small fw-bold">{formatDate(checkInDate)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="small text-muted">Trả phòng</span>
                  <span className="small fw-bold">{formatDate(checkOutDate)}</span>
                </div>
              </div>

              <div className="border-top pt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">{nights} đêm × {selectedRoom ? formatPrice(selectedRoom.price) : "—"}</span>
                  <span className="fw-bold text-primary" style={{ fontSize: "18px" }}>
                    {selectedRoom ? formatPrice(totalPrice) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .form-select:disabled { background-color: #f5f5f5; color: #aaa; cursor: not-allowed; }
      `}</style>
    </section>
  );
}
