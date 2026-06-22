import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  Search,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ChevronLeft,
  Star,
  Coffee,
  Wifi,
  Wind,
  Tv,
  Users,
  User2
} from "lucide-react";
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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Data
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Search State
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [searchQuery, setSearchQuery] = useState("");

  // Selections
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomRecord | null>(null);

  // Guest Form
  const [guestName, setGuestName] = useState("");
  const [guestCccd, setGuestCccd] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // Booking Result
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getHotels()
      .then(setHotels)
      .catch(() => setHotels([]))
      .finally(() => setLoadingHotels(false));
  }, []);

  const handleSelectHotel = async (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setStep(2);
    window.scrollTo(0, 0);
    setLoadingRooms(true);
    try {
      const data = await getRooms(hotel.id);
      setRooms(data);
    } catch {
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSelectRoom = (room: RoomRecord) => {
    setSelectedRoom(room);
    setStep(3);
    window.scrollTo(0, 0);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
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
      setStep(4);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra trong quá trình đặt phòng");
    } finally {
      setSubmitting(false);
    }
  };

  const nights = nightCount(checkInDate, checkOutDate);
  const totalPrice = selectedRoom ? selectedRoom.price * nights : 0;

  const safeHotels = Array.isArray(hotels) ? hotels : [];
  const filteredHotels = safeHotels.filter((h) => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="booking-page" style={{ background: "#f5f7fa", minHeight: "100vh", paddingBottom: "80px", paddingTop: "80px" }}>
      {/* ── HEADER ── */}
      <div className="bg-primary pt-5 pb-5 mb-4" style={{ background: "linear-gradient(135deg, #16309F 0%, #0f5fa8 100%)" }}>
        <div className="container">
          <h2 className="text-white fw-bold mb-4">Tìm và đặt phòng dễ dàng</h2>
          
          {/* OTA Search Bar (Only shown or editable in Step 1) */}
          <div className="bg-white p-3 rounded-4 shadow-lg d-flex flex-wrap gap-3 align-items-center">
            <div className="flex-grow-1 position-relative" style={{ minWidth: "250px" }}>
              <Search className="position-absolute text-muted" style={{ top: "16px", left: "15px" }} size={20} />
              <input 
                type="text" 
                className="form-control form-control-lg border-0 bg-light rounded-3" 
                placeholder="Thành phố, địa điểm hoặc tên khách sạn" 
                style={{ paddingLeft: "45px", fontSize: "15px", height: "54px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={step !== 1}
              />
            </div>
            
            <div className="d-flex align-items-center bg-light rounded-3 px-3 py-1 border-0" style={{ minWidth: "300px", height: "54px" }}>
              <CalendarDays className="text-muted me-2" size={20} />
              <div className="d-flex flex-column flex-grow-1 position-relative">
                <span style={{ fontSize: "11px", color: "#6c757d", fontWeight: 600 }}>NHẬN PHÒNG</span>
                <input 
                  type="date" 
                  className="bg-transparent border-0 p-0 text-dark fw-bold position-relative" 
                  style={{ fontSize: "14px", outline: "none", zIndex: 2 }}
                  value={checkInDate}
                  min={today}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  disabled={step !== 1}
                />
              </div>
              <div className="mx-2 text-muted" style={{ height: "30px", borderLeft: "1px solid #dee2e6" }}></div>
              <div className="d-flex flex-column flex-grow-1 position-relative">
                <span style={{ fontSize: "11px", color: "#6c757d", fontWeight: 600 }}>TRẢ PHÒNG</span>
                <input 
                  type="date" 
                  className="bg-transparent border-0 p-0 text-dark fw-bold position-relative" 
                  style={{ fontSize: "14px", outline: "none", zIndex: 2 }}
                  value={checkOutDate}
                  min={checkInDate || today}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  disabled={step !== 1}
                />
              </div>
            </div>

            <div className="d-flex align-items-center bg-light rounded-3 px-3 py-1 border-0" style={{ minWidth: "150px", height: "54px" }}>
              <Users className="text-muted me-2" size={20} />
              <div className="d-flex flex-column">
                <span style={{ fontSize: "11px", color: "#6c757d", fontWeight: 600 }}>KHÁCH</span>
                <span className="text-dark fw-bold" style={{ fontSize: "14px" }}>2 người lớn</span>
              </div>
            </div>

            {step === 1 && (
              <button className="btn btn-primary btn-lg rounded-3 fw-bold px-4 shadow-sm" style={{ background: "#f97316", border: "none", height: "54px" }}>
                Tìm kiếm
              </button>
            )}
            {step > 1 && (
              <button onClick={() => {setStep(1); setSelectedHotel(null); setSelectedRoom(null);}} className="btn btn-outline-primary btn-lg rounded-3 fw-bold px-4" style={{ height: "54px" }}>
                Thay đổi
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {/* ── STEP 1: HOTEL LISTING ── */}
        {step === 1 && (
          <div className="row">
            <div className="col-lg-3 d-none d-lg-block">
              <div className="bg-white rounded-4 shadow-sm p-4 sticky-top" style={{ top: "100px" }}>
                <h5 className="fw-bold mb-3">Bộ lọc phổ biến</h5>
                
                <div className="mb-4">
                  <h6 className="fw-bold fs-6 mb-2 mt-3">Sắp xếp kết quả</h6>
                  <div className="form-check mb-2">
                    <input className="form-check-input cursor-pointer" type="radio" name="sort" id="sort1" defaultChecked />
                    <label className="form-check-label text-muted cursor-pointer" htmlFor="sort1">Giá thấp nhất trước</label>
                  </div>
                  <div className="form-check mb-2">
                    <input className="form-check-input cursor-pointer" type="radio" name="sort" id="sort2" />
                    <label className="form-check-label text-muted cursor-pointer" htmlFor="sort2">Đánh giá cao nhất</label>
                  </div>
                </div>

                <div className="mb-4 border-top pt-3">
                  <h6 className="fw-bold fs-6 mb-2">Hạng sao</h6>
                  {[5, 4, 3, 2, 1].map(star => (
                    <div className="form-check mb-2" key={star}>
                      <input className="form-check-input cursor-pointer" type="checkbox" id={`star${star}`} />
                      <label className="form-check-label text-muted d-flex align-items-center gap-1 cursor-pointer" htmlFor={`star${star}`}>
                        {Array(star).fill(0).map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-9">
              <h5 className="fw-bold mb-3">
                {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : "Các chỗ nghỉ nổi bật"} 
                <span className="text-muted fw-normal ms-2">({filteredHotels.length} chỗ nghỉ)</span>
              </h5>

              {loadingHotels ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                  <Loader2 size={40} className="spin text-primary mb-3" />
                  <p className="text-muted">Đang tìm kiếm chỗ nghỉ tốt nhất...</p>
                </div>
              ) : filteredHotels.length === 0 ? (
                <div className="bg-white rounded-4 shadow-sm p-5 text-center">
                  <img src="https://cdn-icons-png.flaticon.com/512/7486/7486831.png" alt="No results" width="120" className="mb-3 opacity-50 mx-auto" />
                  <h5 className="fw-bold text-dark">Không tìm thấy chỗ nghỉ</h5>
                  <p className="text-muted">Vui lòng thử thay đổi từ khóa tìm kiếm của bạn.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3 animation-fade-in">
                  {filteredHotels.map(hotel => (
                    <div key={hotel.id} className="bg-white rounded-4 shadow-sm border-0 overflow-hidden hotel-card">
                      <div className="row g-0">
                        <div className="col-md-4 position-relative">
                          <img 
                            src={hotel.mainImageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"} 
                            alt={hotel.name}
                            className="img-fluid h-100 w-100 object-fit-cover"
                            style={{ minHeight: "240px", maxHeight: "240px" }}
                          />
                        </div>
                        <div className="col-md-8">
                          <div className="card-body p-4 d-flex flex-column h-100">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <div className="d-flex align-items-center gap-1 mb-1">
                                  <span className="badge bg-primary rounded-pill me-1">Homestay</span>
                                  {Array(4).fill(0).map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
                                </div>
                                <h4 className="fw-bold text-dark mb-1">{hotel.name}</h4>
                                <div className="d-flex align-items-center text-primary small cursor-pointer">
                                  <MapPin size={14} className="me-1" />
                                  <span className="text-truncate text-decoration-underline" style={{ maxWidth: "250px" }}>{hotel.address}</span>
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="d-flex align-items-center justify-content-end gap-2 mb-1">
                                  <div className="text-end">
                                    <div className="fw-bold text-dark">Tuyệt vời</div>
                                    <div className="text-muted small">128 đánh giá</div>
                                  </div>
                                  <div className="bg-primary text-white fw-bold rounded-2 d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px", fontSize: "16px" }}>
                                    8.9
                                  </div>
                                </div>
                              </div>
                            </div>

                            <p className="text-muted mt-2 mb-3" style={{ fontSize: "14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {hotel.description || "Nằm ở vị trí thuận tiện, chỗ nghỉ này cung cấp phòng ốc sạch sẽ, tiện nghi hiện đại cùng dịch vụ chu đáo. Rất phù hợp cho các cặp đôi hoặc gia đình nhỏ."}
                            </p>

                            <div className="mt-auto d-flex justify-content-between align-items-end pt-3">
                              <div className="text-success small fw-bold d-flex flex-column gap-1">
                                <span className="d-flex align-items-center gap-1"><CheckCircle2 size={14} /> Miễn phí hủy phòng</span>
                                <span className="d-flex align-items-center gap-1 text-success opacity-75"><Coffee size={14} /> Bao gồm bữa sáng</span>
                              </div>
                              <div className="text-end">
                                <button 
                                  onClick={() => handleSelectHotel(hotel)}
                                  className="btn btn-primary fw-bold px-4 py-2 shadow-sm d-flex align-items-center gap-2"
                                >
                                  Xem phòng <ArrowRight size={16}/>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: ROOM SELECTION ── */}
        {step === 2 && selectedHotel && (
          <div className="animation-fade-in">
            <button onClick={() => {setStep(1); setSelectedHotel(null);}} className="btn btn-link text-decoration-none text-primary p-0 mb-4 d-flex align-items-center gap-1 fw-bold">
              <ChevronLeft size={20} /> Tất cả chỗ nghỉ
            </button>

            <div className="bg-white rounded-4 shadow-sm p-4 mb-4 border-0 position-relative overflow-hidden">
              <div className="position-absolute top-0 end-0 bg-success text-white fw-bold px-4 py-1" style={{ borderBottomLeftRadius: "16px" }}>Bán chạy nhất</div>
              <div className="row">
                <div className="col-md-8">
                  <h3 className="fw-bold mb-2">{selectedHotel.name}</h3>
                  <div className="d-flex align-items-center text-primary mb-3">
                    <MapPin size={16} className="me-1" />
                    <span className="text-decoration-underline cursor-pointer">{selectedHotel.address}</span>
                  </div>
                  <p className="text-muted mb-0 lh-lg">{selectedHotel.description || "Chỗ nghỉ này cung cấp phòng ốc tuyệt vời, dịch vụ đỉnh cao và các tiện nghi không thể thiếu cho kỳ nghỉ của bạn."}</p>
                </div>
                <div className="col-md-4 d-flex align-items-center justify-content-end border-start">
                  <div className="bg-light rounded-4 p-3 w-100 text-center">
                    <div className="small text-muted mb-1 text-uppercase fw-bold">Đang tìm phòng cho</div>
                    <div className="fw-bold text-primary fs-5">{nights} đêm</div>
                    <div className="small text-muted mt-1">{formatDate(checkInDate)} — {formatDate(checkOutDate)}</div>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="fw-bold mb-4">Các phòng trống tại chỗ nghỉ này</h4>

            {loadingRooms ? (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                <Loader2 size={40} className="spin text-primary mb-3" />
                <p className="text-muted">Đang tải danh sách phòng...</p>
              </div>
            ) : (Array.isArray(rooms) ? rooms : []).length === 0 ? (
              <div className="bg-white rounded-4 shadow-sm p-5 text-center border-0">
                <h5 className="fw-bold text-dark">Chưa có phòng nào trống</h5>
                <p className="text-muted">Vui lòng chọn ngày khác hoặc quay lại chọn chỗ nghỉ khác.</p>
                <button onClick={() => setStep(1)} className="btn btn-outline-primary mt-3 px-4 rounded-pill">Đổi chỗ nghỉ</button>
              </div>
            ) : (
              <div className="row g-4">
                {(Array.isArray(rooms) ? rooms : []).map(room => {
                  const isAvailable = room.status === "Available";
                  return (
                    <div key={room.id} className="col-md-6 col-lg-4">
                      <div className="card h-100 border-0 rounded-4 shadow-sm overflow-hidden room-card position-relative">
                        {!isAvailable && (
                          <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ background: "rgba(255,255,255,0.75)", zIndex: 10, backdropFilter: "blur(2px)" }}>
                            <div className="bg-secondary text-white fw-bold px-3 py-1 rounded-pill mb-2">Hết phòng</div>
                            <span className="small fw-bold text-secondary">Rất tiếc, phòng này đã được đặt.</span>
                          </div>
                        )}
                        <img 
                          src={room.mainImageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600"} 
                          alt={room.roomType} 
                          className="card-img-top object-fit-cover"
                          style={{ height: "220px" }}
                        />
                        <div className="card-body p-4 d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="fw-bold mb-0">{room.roomType}</h5>
                            <span className="badge bg-light text-dark border">Phòng {room.roomNumber}</span>
                          </div>
                          
                          <p className="text-muted small mb-3 lh-base">{room.description || "Phòng nghỉ được trang bị đầy đủ tiện nghi với view nhìn ra trung tâm thành phố."}</p>

                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <span className="badge bg-light text-dark fw-normal border px-2 py-1"><Wind size={12} className="me-1"/>Điều hòa</span>
                            <span className="badge bg-light text-dark fw-normal border px-2 py-1"><Wifi size={12} className="me-1"/>Wifi</span>
                            <span className="badge bg-light text-dark fw-normal border px-2 py-1"><Tv size={12} className="me-1"/>Smart TV</span>
                            <span className="badge bg-light text-dark fw-normal border px-2 py-1"><Coffee size={12} className="me-1"/>Bữa sáng</span>
                          </div>

                          <div className="text-success small fw-bold mb-3 d-flex align-items-center gap-1 bg-success bg-opacity-10 p-2 rounded-3 w-100">
                            <CheckCircle2 size={14} className="flex-shrink-0" /> Không cần thanh toán trước. Trả tại chỗ nghỉ!
                          </div>

                          <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-end">
                            <div>
                              <div className="text-muted small">Giá mỗi đêm</div>
                              <h4 className="fw-bold text-danger mb-0">{formatPrice(room.price)}</h4>
                            </div>
                            <button 
                              onClick={() => handleSelectRoom(room)}
                              disabled={!isAvailable}
                              className={`btn fw-bold px-4 py-2 rounded-3 shadow-sm ${isAvailable ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ zIndex: 20 }}
                            >
                              Chọn phòng
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: CHECKOUT FORM ── */}
        {step === 3 && selectedHotel && selectedRoom && (
          <div className="animation-fade-in">
            <button onClick={() => {setStep(2); setSelectedRoom(null);}} className="btn btn-link text-decoration-none text-primary p-0 mb-4 d-flex align-items-center gap-1 fw-bold">
              <ChevronLeft size={20} /> Thay đổi phòng
            </button>

            <div className="row g-4">
              <div className="col-lg-8">
                <div className="bg-white rounded-4 shadow-sm p-5 mb-4 border-0">
                  <h4 className="fw-bold mb-4">Nhập thông tin chi tiết của bạn</h4>
                  <div className="alert bg-primary bg-opacity-10 text-primary border-0 rounded-3 d-flex gap-3 align-items-center mb-4 p-3">
                    <User2 size={24} className="flex-shrink-0" />
                    <div>
                      <span className="fw-bold d-block">Sắp xong rồi!</span>
                      <span className="small">Vui lòng điền thông tin bằng tiếng Việt hoặc tiếng Anh để chỗ nghỉ chuẩn bị đón tiếp tốt nhất.</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitBooking} id="checkout-form">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label fw-bold small text-dark">Họ và tên <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control form-control-lg bg-light"
                          placeholder="VD: Nguyễn Văn A"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          required
                          style={{ fontSize: "15px" }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold small text-dark">Số CCCD / Hộ chiếu <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control form-control-lg bg-light"
                          placeholder="Nhập 12 số CCCD"
                          value={guestCccd}
                          onChange={(e) => setGuestCccd(e.target.value)}
                          required
                          style={{ fontSize: "15px" }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold small text-dark">Email liên hệ <span className="text-muted fw-normal">(Tùy chọn)</span></label>
                        <input
                          type="email"
                          className="form-control form-control-lg bg-light"
                          placeholder="email@example.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          style={{ fontSize: "15px" }}
                        />
                        <div className="form-text small mt-2">Chúng tôi sẽ gửi email xác nhận đặt phòng tới địa chỉ này.</div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold small text-dark">Số điện thoại liên hệ</label>
                        <input
                          type="text"
                          className="form-control form-control-lg bg-light"
                          placeholder="+84 90 123 4567"
                          style={{ fontSize: "15px" }}
                        />
                      </div>
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-4 shadow-sm p-4 mb-4 border-0">
                  <h5 className="fw-bold mb-3">Yêu cầu đặc biệt</h5>
                  <p className="text-muted small mb-3 lh-base">Các yêu cầu đặc biệt không được đảm bảo, nhưng chỗ nghỉ sẽ cố gắng hết sức để đáp ứng. Bạn luôn có thể yêu cầu thêm sau khi hoàn tất đặt phòng!</p>
                  <textarea 
                    className="form-control bg-light" 
                    rows={3} 
                    placeholder="Vui lòng viết yêu cầu của bạn bằng tiếng Việt hoặc tiếng Anh. (VD: Tôi muốn phòng có cửa sổ lớn, ...)"
                    style={{ fontSize: "14px" }}
                  ></textarea>
                </div>

                {error && (
                  <div className="alert alert-danger rounded-3 py-3 mb-4 d-flex align-items-center gap-2 border-0 fw-bold">
                    Lỗi: {error}
                  </div>
                )}
              </div>

              <div className="col-lg-4">
                <div className="bg-white rounded-4 shadow-sm border-0 overflow-hidden sticky-top" style={{ top: "100px" }}>
                  <div className="p-4 border-bottom">
                    <div className="d-flex gap-3">
                      <img src={selectedHotel.mainImageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"} alt="Hotel" className="rounded-3 object-fit-cover flex-shrink-0" style={{ width: "80px", height: "80px" }} />
                      <div>
                        <div className="d-flex align-items-center gap-1 mb-1">
                          {Array(4).fill(0).map((_, i) => <Star key={i} size={12} fill="#fbbf24" color="#fbbf24" />)}
                        </div>
                        <h6 className="fw-bold mb-1">{selectedHotel.name}</h6>
                        <div className="text-muted small"><MapPin size={10} className="me-1"/>{selectedHotel.address}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-light bg-opacity-50">
                    <h6 className="fw-bold mb-3">Chi tiết đặt phòng của bạn</h6>
                    <div className="row mb-3">
                      <div className="col-6 border-end">
                        <div className="small text-muted fw-bold mb-1">Nhận phòng</div>
                        <div className="fw-bold text-dark">{formatDate(checkInDate)}</div>
                        <div className="small text-muted">Từ 14:00</div>
                      </div>
                      <div className="col-6 ps-3">
                        <div className="small text-muted fw-bold mb-1">Trả phòng</div>
                        <div className="fw-bold text-dark">{formatDate(checkOutDate)}</div>
                        <div className="small text-muted">Đến 12:00</div>
                      </div>
                    </div>
                    <div className="small text-muted">
                      Tổng thời gian lưu trú: <span className="fw-bold text-dark">{nights} đêm</span>
                    </div>
                  </div>

                  <div className="p-4 border-top">
                    <h6 className="fw-bold mb-3">Phòng đã chọn</h6>
                    <div className="fw-bold text-dark mb-1">{selectedRoom.roomType}</div>
                    <div className="text-muted small mb-3">2 người lớn · 1 giường đôi lớn</div>
                    <div className="text-success small fw-bold mb-1 d-flex gap-2"><Coffee size={14}/> Bữa sáng đã bao gồm</div>
                    <div className="text-success small fw-bold mb-3 d-flex gap-2"><CheckCircle2 size={14}/> Hủy miễn phí</div>
                  </div>

                  <div className="p-4 bg-primary bg-opacity-10 border-top">
                    <div className="d-flex justify-content-between align-items-end mb-1">
                      <span className="fw-bold fs-5 text-dark">Tổng cộng</span>
                      <span className="fw-bold fs-3 text-danger">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="text-end small text-muted">Đã bao gồm thuế và phí</div>
                  </div>

                  <div className="p-4 border-top bg-white">
                    <button 
                      type="submit" 
                      form="checkout-form"
                      disabled={submitting}
                      className="btn btn-primary w-100 rounded-3 py-3 fw-bold fs-6 d-flex justify-content-center align-items-center gap-2 shadow"
                    >
                      {submitting ? <><Loader2 size={20} className="spin" /> Đang xử lý...</> : 'Hoàn tất đặt phòng'}
                    </button>
                    <div className="text-center mt-3 text-muted" style={{ fontSize: "12px" }}>
                      Bằng cách tiếp tục, bạn đồng ý với Điều khoản và Điều kiện của chúng tôi.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: SUCCESS ── */}
        {step === 4 && result && (
          <div className="row justify-content-center animation-fade-in py-5">
            <div className="col-lg-7">
              <div className="bg-white rounded-4 shadow-sm border p-5 text-center">
                <div className="d-inline-flex bg-success rounded-circle p-4 mb-4 shadow-sm" style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}>
                  <CheckCircle2 size={64} className="text-white" />
                </div>
                <h2 className="fw-bold text-dark mb-2">Đặt phòng thành công!</h2>
                <p className="text-muted mb-4 fs-5">Mã xác nhận của bạn là <span className="fw-bold text-primary">#{result.id}</span></p>

                <div className="text-start bg-light border-0 rounded-4 p-4 mb-5 shadow-sm">
                  <div className="row mb-3 pb-3 border-bottom border-white">
                    <div className="col-5 text-muted">Khách sạn</div>
                    <div className="col-7 text-end fw-bold text-dark">{selectedHotel?.name}</div>
                  </div>
                  <div className="row mb-3 pb-3 border-bottom border-white">
                    <div className="col-5 text-muted">Loại phòng</div>
                    <div className="col-7 text-end fw-bold text-dark">{selectedRoom?.roomType} <span className="text-muted fw-normal">(P.{selectedRoom?.roomNumber})</span></div>
                  </div>
                  <div className="row mb-3 pb-3 border-bottom border-white">
                    <div className="col-5 text-muted">Khách hàng</div>
                    <div className="col-7 text-end fw-bold text-dark">{result.guestName}</div>
                  </div>
                  <div className="row mb-3 pb-3 border-bottom border-white">
                    <div className="col-5 text-muted">Ngày nhận / Trả phòng</div>
                    <div className="col-7 text-end fw-bold text-dark">{formatDate(result.checkInDate)} — {formatDate(result.checkOutDate)}</div>
                  </div>
                  <div className="row align-items-center pt-2">
                    <div className="col-5 text-muted fw-bold">Tổng thanh toán</div>
                    <div className="col-7 text-end fw-bold text-danger fs-4">{formatPrice(totalPrice)}</div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3">
                  <Link
                    to="/check-in"
                    className="btn btn-primary btn-lg rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                  >
                    Làm thủ tục Check-in ngay <ArrowRight size={20} />
                  </Link>
                  <button
                    onClick={() => { 
                      setStep(1); 
                      setSelectedHotel(null); 
                      setSelectedRoom(null); 
                      setResult(null); 
                      setGuestName(""); 
                      setGuestCccd(""); 
                      setGuestEmail(""); 
                      window.scrollTo(0,0);
                    }}
                    className="btn btn-light btn-lg border rounded-3 fw-bold text-dark"
                  >
                    Về trang chủ tìm kiếm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .animation-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cursor-pointer { cursor: pointer; }
        
        .hotel-card { transition: all 0.2s ease; border: 1px solid transparent !important; }
        .hotel-card:hover { border-color: #dee2e6 !important; transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.08) !important; }

        .room-card { transition: all 0.2s ease; border: 1px solid #f0f0f0 !important; }
        .room-card:hover { border-color: #1686cb !important; box-shadow: 0 12px 24px rgba(22,134,203,0.12) !important; transform: translateY(-4px); }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .form-control::placeholder {
          color: #adb5bd !important;
          opacity: 0.4 !important;
        }
      `}</style>
    </div>
  );
}
