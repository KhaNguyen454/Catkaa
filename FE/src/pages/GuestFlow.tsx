import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ScanLine, KeyRound,
  MessageSquare, Building2, Check, ShieldCheck,
  CreditCard, Loader2, Phone, ExternalLink, Ban,
  Camera, UploadCloud,
} from "lucide-react";
import CheckInService, { OcrCheckInResult, OcrCheckInResponse } from "../services/checkInService";
import { getHotels, Hotel } from "../services/hotelService";
import { getRoomById, RoomRecord } from "../services/roomService";
import PaymentService from "../services/paymentService";

/* ─────────────────────────────────────────────────
   BƯỚC 0 — Chào mừng & chọn khách sạn
───────────────────────────────────────────────── */
const StepWelcome = ({
  hotels,
  loadingHotels,
  selectedHotel,
  onHotelSelect,
  onNext,
}: {
  hotels: Hotel[];
  loadingHotels: boolean;
  selectedHotel: Hotel | null;
  onHotelSelect: (h: Hotel | null) => void;
  onNext: () => void;
}) => (
  <div className="phone-screen-content d-flex flex-column h-100">
    <div className="px-3 py-2 text-white d-flex align-items-center gap-2" style={{ background: "#1686cb" }}>
      <Building2 size={14} />
      <span className="fw-bold text-truncate" style={{ fontSize: "11px", maxWidth: 140 }}>
        {selectedHotel?.name ?? "CATKAA Check-in"}
      </span>
      <div className="ms-auto opacity-50"><Phone size={12} /></div>
    </div>

    <div className="flex-grow-1 p-3 overflow-auto" style={{ background: "#F0F4F8" }}>
      <div className="bg-white p-3 rounded-4 shadow-sm mb-3" style={{ fontSize: "12px", borderLeft: "3px solid #16309F" }}>
        Xin chào! 👋<br />
        <span className="text-muted">Chọn khách sạn để bắt đầu làm thủ tục nhận phòng.</span>
      </div>

      <div className="bg-white p-3 rounded-4 shadow-sm">
        <p className="small fw-bold text-muted mb-2" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
          KHÁCH SẠN CỦA BẠN
        </p>
        {loadingHotels ? (
          <div className="d-flex align-items-center gap-2 text-muted small">
            <Loader2 size={14} className="spin" /> Đang tải...
          </div>
        ) : (
          <select
            className="form-select form-select-sm"
            style={{ fontSize: "12px" }}
            value={selectedHotel?.id ?? ""}
            onChange={(e) => {
              const hotel = hotels.find((h) => h.id === Number(e.target.value)) ?? null;
              onHotelSelect(hotel);
            }}
          >
            <option value="">-- Chọn khách sạn --</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        )}
        {selectedHotel && (
          <p className="small text-muted mt-2 mb-0" style={{ fontSize: "10px" }}>
            📍 {selectedHotel.address}
          </p>
        )}
      </div>

      <div className="rounded-4 overflow-hidden shadow-sm mt-3">
        <div className="p-3 text-white" style={{ background: "linear-gradient(135deg, #16309F, #38BDF8)" }}>
          <div className="fw-bold" style={{ fontSize: "11px" }}>LÀM THỦ TỤC ONLINE</div>
          <div className="opacity-75" style={{ fontSize: "9px" }}>Quét CCCD — Xác thực — Thanh toán</div>
        </div>
        <div className="bg-white p-2 d-flex justify-content-around border-top" style={{ fontSize: "9px", fontWeight: "bold" }}>
          <span>✓ CCCD</span>
          <span>✓ Booking</span>
          <span>✓ Check-in</span>
          <span>✓ VNPay</span>
        </div>
      </div>
    </div>

    <div className="p-3 bg-white border-top">
      <button
        onClick={onNext}
        disabled={!selectedHotel}
        className="btn w-100 rounded-pill text-white fw-bold py-2 shadow-sm"
        style={{ background: selectedHotel ? "#1686cb" : "#ccc", fontSize: "13px", transition: "background 0.3s" }}
      >
        Bắt đầu làm thủ tục
      </button>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────
   BƯỚC 1 — Quét CCCD
───────────────────────────────────────────────── */
const StepScan = ({
  hotelId,
  onCheckInComplete,
}: {
  hotelId: number;
  onCheckInComplete: (response: OcrCheckInResponse) => void;
}) => {
  const [phase, setPhase] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({ fullName: "", idNumber: "", dateOfBirth: "" });

  const [scanMode, setScanMode] = useState<"camera" | "upload">("camera");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Không thể truy cập Camera. Vui lòng cấp quyền hoặc tải ảnh lên.");
    }
  };

  useEffect(() => {
    if (scanMode === "camera" && !showManualForm && phase === "idle") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanMode, showManualForm, phase]);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Lỗi xử lý ảnh từ camera.");
        setPhase("error");
        return;
      }
      const file = new File([blob], "cccd_capture.jpg", { type: "image/jpeg" });
      handleProcessFile(file);
    }, "image/jpeg", 0.9);
  };

  const handleProcessFile = async (file: File) => {
    setError("");
    setPhase("loading");
    stopCamera();
    try {
      const result = await CheckInService.ocrCheckIn(hotelId, file);
      setPhase("done");
      setTimeout(() => onCheckInComplete(result), 1000);
    } catch (err) {
      setError("Thông tin không khớp với bất kỳ đơn đặt phòng nào đang chờ nhận phòng.");
      setPhase("error");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleProcessFile(file);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualData.fullName.trim() || !manualData.idNumber.trim()) {
      setError("Vui lòng nhập Họ Tên và Số CCCD");
      return;
    }
    setError("");
    setPhase("loading");
    try {
      const result = await CheckInService.manualCheckIn(hotelId, manualData);
      setPhase("done");
      setTimeout(() => onCheckInComplete(result), 1000);
    } catch (err) {
      setError("Thông tin không khớp với bất kỳ đơn đặt phòng nào đang chờ nhận phòng.");
      setPhase("error");
      setTimeout(() => setError(""), 5000);
    }
  };

  const reset = () => {
    setPhase("idle");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="phone-screen-content bg-dark h-100 d-flex flex-column">
      <div className="p-3 text-white text-center border-bottom border-secondary small fw-bold">
        QUÉT CCCD / CMND
      </div>

      <style>{`
        .manual-input::placeholder {
          color: rgba(255,255,255,0.4) !important;
        }
        .manual-input {
          background-color: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #fff !important;
        }
        .manual-input:focus {
          background-color: rgba(255,255,255,0.1) !important;
          border-color: #1686cb !important;
          box-shadow: none !important;
        }
        .manual-input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.5;
        }
      `}</style>

      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4 gap-4">
        {showManualForm ? (
          <div className="w-100 rounded-4 p-3 shadow-sm text-white position-relative" style={{ background: "#2a2d3e" }}>
            <h6 className="fw-bold text-center mb-3 text-info">Nhập thông tin thủ công</h6>
            <form onSubmit={handleManualSubmit}>
              <div className="mb-2">
                <label className="form-label small fw-bold mb-1">Họ và Tên</label>
                <input
                  type="text"
                  className="form-control form-control-sm manual-input"
                  placeholder="VD: NGUYEN VAN A"
                  value={manualData.fullName}
                  onChange={e => setManualData({ ...manualData, fullName: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="mb-2">
                <label className="form-label small fw-bold mb-1">Số CCCD / CMND</label>
                <input
                  type="text"
                  className="form-control form-control-sm manual-input"
                  placeholder="12 số CCCD"
                  value={manualData.idNumber}
                  onChange={e => setManualData({ ...manualData, idNumber: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold mb-1">Ngày sinh</label>
                <input
                  type="date"
                  className="form-control form-control-sm manual-input"
                  value={manualData.dateOfBirth}
                  onChange={e => setManualData({ ...manualData, dateOfBirth: e.target.value })}
                />
              </div>

              {error && (
                <div className="alert alert-danger p-2 text-center mb-3" style={{ fontSize: "11px" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={phase === "loading"}
                className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm d-flex justify-content-center align-items-center"
                style={{ fontSize: "12px" }}
              >
                {phase === "loading" ? <Loader2 size={14} className="spin me-2" /> : null}
                Xác nhận thông tin
              </button>
            </form>
            <button
              className="btn btn-link w-100 text-decoration-none mt-2 small text-white opacity-50"
              onClick={() => { setShowManualForm(false); reset(); }}
              style={{ fontSize: "12px" }}
            >
              Quay lại quét ảnh
            </button>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {(phase === "idle" || phase === "error") && !showManualForm && (
              <div className="d-flex bg-secondary bg-opacity-25 rounded-pill p-1 mb-2" style={{ width: "100%", maxWidth: "300px" }}>
                <button
                  className={`btn btn-sm flex-grow-1 rounded-pill fw-bold ${scanMode === "camera" ? "btn-light text-dark shadow-sm" : "text-white opacity-75"}`}
                  onClick={() => setScanMode("camera")}
                  style={{ fontSize: "12px", border: "none" }}
                >
                  <Camera size={14} className="me-1" /> Camera
                </button>
                <button
                  className={`btn btn-sm flex-grow-1 rounded-pill fw-bold ${scanMode === "upload" ? "btn-light text-dark shadow-sm" : "text-white opacity-75"}`}
                  onClick={() => setScanMode("upload")}
                  style={{ fontSize: "12px", border: "none" }}
                >
                  <UploadCloud size={14} className="me-1" /> Tải ảnh
                </button>
              </div>
            )}

            <div
              className="w-100 position-relative rounded-4 overflow-hidden d-flex align-items-center justify-content-center"
              style={{
                aspectRatio: "1.58",
                border: `2px dashed ${phase === "done" ? "#22c55e" : phase === "error" ? "#ef4444" : scanMode === "camera" ? "transparent" : "#0d6efd"}`,
                background: phase === "done"
                  ? "rgba(34,197,94,0.07)"
                  : phase === "error"
                    ? "rgba(239,68,68,0.07)"
                    : scanMode === "camera"
                      ? "#000"
                      : "rgba(13,110,253,0.05)",
                cursor: (scanMode === "upload" || phase === "error") && phase !== "loading" && phase !== "done" ? "pointer" : "default",
              }}
              onClick={() => {
                if ((scanMode === "upload" || phase === "error") && phase !== "loading" && phase !== "done") {
                  fileInputRef.current?.click();
                }
              }}
            >
              {scanMode === "camera" && phase === "idle" && !cameraError && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div className="position-absolute w-100 h-100 p-2" style={{ pointerEvents: "none" }}>
                    <div className="w-100 h-100 rounded-3 border border-2 opacity-75" style={{ borderColor: "#22c55e", borderStyle: "dashed" }}></div>
                  </div>
                </>
              )}

              {scanMode === "camera" && cameraError && phase === "idle" && (
                <div className="text-center p-3">
                  <Camera size={32} className="text-danger opacity-50 mb-2" />
                  <p className="text-white small fw-bold mb-0">{cameraError}</p>
                  <button
                    className="btn btn-sm btn-outline-light mt-3"
                    onClick={() => setScanMode("upload")}
                  >
                    Chuyển sang Tải ảnh
                  </button>
                </div>
              )}

              {phase === "loading" && (
                <motion.div
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="position-absolute start-0 end-0"
                  style={{ height: 2, background: "#00d9ff", boxShadow: "0 0 10px #00d9ff", zIndex: 3 }}
                />
              )}

              {phase === "loading" ? (
                <Loader2 size={40} className="text-info spin position-absolute" style={{ zIndex: 2 }} />
              ) : phase === "done" ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="position-absolute" style={{ zIndex: 2 }}>
                  <Check size={48} className="text-success" />
                </motion.div>
              ) : scanMode === "upload" && (
                <CreditCard size={40} className={phase === "error" ? "text-danger opacity-50 position-absolute" : "text-primary opacity-25 position-absolute"} style={{ zIndex: 2 }} />
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
            </div>

            {scanMode === "camera" && phase === "idle" && !cameraError && (
              <button
                className="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm mb-1 d-flex align-items-center justify-content-center"
                onClick={captureImage}
                style={{ fontSize: "14px" }}
              >
                <Camera size={18} className="me-2" />Chụp ảnh CCCD
              </button>
            )}

            <p className="text-white text-center small fw-bold mb-0">
              {phase === "loading"
                ? "Đang nhận diện & xác thực booking..."
                : phase === "done"
                  ? "✓ Xác thực thành công! Đang chuyển..."
                  : scanMode === "upload"
                    ? "Nhấn vào khung để tải ảnh CCCD lên"
                    : ""}
            </p>

            {phase === "idle" && (
              <button
                className="btn btn-link text-info text-decoration-none small mt-2"
                onClick={() => setShowManualForm(true)}
                style={{ fontSize: "12px" }}
              >
                Không quét được ảnh? Nhập thông tin thủ công
              </button>
            )}

            {phase === "error" && (
              <div className="w-100">
                <div className="rounded-3 p-3 text-center mb-2" style={{ background: "rgba(239,68,68,0.15)", color: "#ff8080", fontSize: "12px" }}>
                  {error}
                </div>
                <button onClick={reset} className="btn btn-sm btn-outline-light w-100 rounded-pill" style={{ fontSize: "12px" }}>
                  Thử lại
                </button>
                <button
                  className="btn btn-link w-100 text-info text-decoration-none mt-2"
                  onClick={() => { setShowManualForm(true); reset(); }}
                  style={{ fontSize: "12px" }}
                >
                  Hoặc nhập thông tin thủ công
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────
   BƯỚC 2 — Check-in thành công
───────────────────────────────────────────────── */
const StepCheckInDone = ({
  checkInResult,
  roomInfo,
  hotelName,
  onGoToPayment,
}: {
  checkInResult: OcrCheckInResponse | null;
  roomInfo: RoomRecord | null;
  hotelName: string;
  onGoToPayment: () => void;
}) => {
  const data = checkInResult?.data;
  const ocrRaw = checkInResult?.ocrRaw;
  const hasPayment = !!data?.paymentUrl;

  const checkInTime = data?.checkInTime
    ? new Date(data.checkInTime).toLocaleString("vi-VN", {
      hour: "2-digit", minute: "2-digit",
      day: "2-digit", month: "2-digit", year: "numeric",
    })
    : "—";

  const roomLabel = roomInfo
    ? `Phòng ${roomInfo.roomNumber} · ${roomInfo.roomType}`
    : data?.roomId ? `Phòng #${data.roomId}` : "—";

  return (
    <div className="phone-screen-content bg-white h-100 d-flex flex-column">
      <div className="flex-grow-1 p-3 d-flex flex-column justify-content-center overflow-auto">
        <div className="text-center mb-3">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="bg-success text-white rounded-circle d-inline-flex p-3 shadow"
          >
            <Check size={34} />
          </motion.div>
          <h5 className="fw-bold text-dark mt-3 mb-0">Check-in thành công!</h5>
          <p className="text-muted small mb-0">{hotelName}</p>
        </div>

        <div className="rounded-4 p-3 mt-3" style={{ background: "#f4f8ff", border: "1.5px solid #d0e0ff" }}>
          <Row label="Khách" value={data?.guestName ?? "—"} />
          <Row label="CCCD" value={ocrRaw?.idNumber ?? "—"} />
          <Row label="Phòng" value={roomLabel} />
          <Row label="Giờ check-in" value={checkInTime} />
          {data?.bookingCode && <Row label="Mã booking" value={data.bookingCode} />}
          <div className="d-flex gap-2 align-items-center mt-3 pt-2 border-top">
            <ShieldCheck size={13} className="text-primary flex-shrink-0" />
            <span style={{ fontSize: "10px", color: "#666" }}>Đã xác thực & ghi nhận bởi CATKAA</span>
          </div>
        </div>
      </div>

      <div className="p-3 border-top d-flex flex-column gap-2">
        {hasPayment ? (
          <button
            onClick={onGoToPayment}
            className="btn w-100 rounded-pill text-white fw-bold py-2 shadow-sm"
            style={{ background: "linear-gradient(135deg,#16309F,#1686cb)", fontSize: "13px" }}
          >
            <CreditCard size={14} className="me-2" />
            Tiếp tục thanh toán →
          </button>
        ) : (
          <div className="rounded-3 p-2 text-center" style={{ background: "#f0fdf4", fontSize: "11px", color: "#16a34a", border: "1px solid #bbf7d0" }}>
            ✓ Đã thanh toán trước — Không cần thao tác thêm
          </div>
        )}
        <Link
          to="/"
          onClick={() => sessionStorage.removeItem("catkaa_checkin_state")}
          className="btn btn-outline-secondary w-100 rounded-pill fw-bold small text-decoration-none"
          style={{ fontSize: "12px" }}
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────
   BƯỚC 3 — Thanh toán VNPay
───────────────────────────────────────────────── */
const StepPayment = ({
  checkInResult,
  roomInfo,
  hotelName,
}: {
  checkInResult: OcrCheckInResponse | null;
  roomInfo: RoomRecord | null;
  hotelName: string;
}) => {
  const data = checkInResult?.data;
  const paymentUrl = data?.paymentUrl;
  const [paid, setPaid] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [loadingMock, setLoadingMock] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "PAYMENT_RESULT") {
        if (e.data.success) setPaymentConfirmed(true);
        setPaid(true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const roomLabel = roomInfo
    ? `Phòng ${roomInfo.roomNumber} · ${roomInfo.roomType}`
    : data?.roomId ? `Phòng #${data.roomId}` : "—";

  const handlePay = () => {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank");
      setPaid(true);
    }
  };

  const handleMockPay = async () => {
    if (!data?.bookingId) return;
    setLoadingMock(true);
    try {
      const result = await PaymentService.mockPayment(data.bookingId);
      if (result.roomPassword && data) {
        data.roomPassword = result.roomPassword;
      }
      setPaymentConfirmed(true);
      setPaid(true);
    } catch (err) {
      setError("Quá trình thanh toán đang bị gián đoạn. Vui lòng thử lại sau.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoadingMock(false);
    }
  };

  return (
    <div className="phone-screen-content d-flex flex-column h-100">
      {/* Header */}
      <div className="px-3 py-2 text-white d-flex align-items-center gap-2" style={{ background: "linear-gradient(135deg,#16309F,#1686cb)" }}>
        <CreditCard size={14} />
        <span className="fw-bold" style={{ fontSize: "11px" }}>THANH TOÁN</span>
        <div className="ms-auto">
          <img src="/images/vnpay-logo.png" alt="VNPay" style={{ height: 16, opacity: 0.9 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      </div>

      {error && (
        <div className="bg-danger text-white p-2 text-center" style={{ fontSize: "11px" }}>
          {error}
        </div>
      )}

      <div className="flex-grow-1 p-3 overflow-auto" style={{ background: "#F0F4F8" }}>
        {/* Booking summary */}
        <div className="bg-white rounded-4 p-3 shadow-sm mb-3">
          <p className="fw-bold text-muted mb-2" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>THÔNG TIN ĐẶT PHÒNG</p>
          <Row label="Khách" value={data?.guestName ?? "—"} />
          <Row label="Phòng" value={roomLabel} />
          <Row label="Khách sạn" value={hotelName} />
          {data?.bookingCode && <Row label="Mã booking" value={data.bookingCode} />}
        </div>

        {/* Payment instruction */}
        {paymentConfirmed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-4 p-3 text-center"
            style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}
          >
            <div className="mb-2" style={{ fontSize: "32px" }}>🎉</div>
            <p className="fw-bold mb-1" style={{ fontSize: "13px", color: "#16a34a" }}>
              Thanh toán thành công!
            </p>
            <p className="text-muted mb-0" style={{ fontSize: "10px" }}>
              Phòng của bạn đã được xác nhận. Chúc bạn có kỳ nghỉ tuyệt vời!
            </p>
            {data?.roomPassword && (
              <div className="mt-3 p-2 rounded-3" style={{ background: "#dcfce7", border: "1px dashed #22c55e" }}>
                <p className="mb-1 text-success fw-bold" style={{ fontSize: "11px" }}>Mật khẩu mở cửa phòng của bạn là:</p>
                <div className="fw-bolder" style={{ fontSize: "20px", color: "#16a34a", letterSpacing: "2px" }}>
                  {data.roomPassword}
                </div>
              </div>
            )}
          </motion.div>
        ) : !paid ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-4 p-3 text-center"
            style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "1.5px solid #bfdbfe" }}
          >
            <div className="mb-2" style={{ fontSize: "28px" }}>💳</div>
            <p className="fw-bold mb-1" style={{ fontSize: "12px", color: "#1e40af" }}>
              Thanh toán qua VNPay
            </p>
            <p className="text-muted mb-0" style={{ fontSize: "10px" }}>
              Nhấn nút bên dưới để chuyển sang trang thanh toán an toàn của VNPay.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-4 p-3 text-center"
            style={{ background: "#fffbeb", border: "1.5px solid #fde68a" }}
          >
            <div className="mb-2" style={{ fontSize: "24px" }}>⏳</div>
            <p className="fw-bold mb-1" style={{ fontSize: "12px", color: "#92400e" }}>
              Đang chờ xác nhận...
            </p>
            <p className="text-muted mb-0" style={{ fontSize: "10px" }}>
              Hoàn tất thanh toán trên tab VNPay. Trang này sẽ tự cập nhật.
            </p>
          </motion.div>
        )}
      </div>

      <div className="p-3 bg-white border-top d-flex flex-column gap-2">
        {paymentConfirmed ? (
          <Link
            to="/"
            onClick={() => sessionStorage.removeItem("catkaa_checkin_state")}
            className="btn w-100 rounded-pill text-white fw-bold py-2 text-decoration-none"
            style={{ background: "#16a34a", fontSize: "13px" }}
          >
            <Check size={14} className="me-2" />
            Về trang chủ
          </Link>
        ) : !paid ? (
          <>
            <button
              onClick={handleMockPay}
              disabled={loadingMock}
              className="btn w-100 rounded-pill text-white fw-bold py-2 shadow"
              style={{ background: "#10b981", fontSize: "13px" }}
            >
              {loadingMock ? <Loader2 size={14} className="me-2 spin" /> : <Check size={14} className="me-2" />}
              Thanh toán (Giả lập)
            </button>
            <button
              onClick={handlePay}
              className="btn w-100 rounded-pill text-white fw-bold py-2 shadow"
              style={{ background: "#94a3b8", fontSize: "13px" }}
            >
              <ExternalLink size={14} className="me-2" />
              Thanh toán VNPay (Đang bảo trì)
            </button>
          </>
        ) : (
          <button
            onClick={handlePay}
            className="btn btn-outline-primary w-100 rounded-pill fw-bold py-2"
            style={{ fontSize: "12px" }}
          >
            <ExternalLink size={13} className="me-1" />
            Mở lại trang VNPay
          </button>
        )}
        {!paymentConfirmed && (
          <Link
            to="/"
            onClick={() => sessionStorage.removeItem("catkaa_checkin_state")}
            className="btn w-100 rounded-pill fw-bold py-2 text-decoration-none"
            style={{ background: "#f1f5f9", color: "#64748b", fontSize: "12px" }}
          >
            <Ban size={13} className="me-1" />
            Bỏ qua — Thanh toán tại quầy
          </Link>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="d-flex justify-content-between align-items-start mb-2">
    <span className="text-muted" style={{ fontSize: "11px", minWidth: 70 }}>{label}</span>
    <span className="fw-bold text-dark text-end" style={{ fontSize: "11px" }}>{value}</span>
  </div>
);

/* ─────────────────────────────────────────────────
   PAGE CHÍNH
───────────────────────────────────────────────── */

const STEPS_DATA = [
  { label: "Chào mừng", icon: MessageSquare },
  { label: "Quét CCCD", icon: ScanLine },
  { label: "Nhận phòng", icon: KeyRound },
  { label: "Thanh toán", icon: CreditCard },
];

export default function GuestFlow() {
  const [step, setStep] = useState(0);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [checkInResult, setCheckInResult] = useState<OcrCheckInResponse | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomRecord | null>(null);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem("catkaa_checkin_state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.step !== undefined) setStep(parsed.step);
        if (parsed.selectedHotel) setSelectedHotel(parsed.selectedHotel);
        if (parsed.checkInResult) setCheckInResult(parsed.checkInResult);
        if (parsed.roomInfo) setRoomInfo(parsed.roomInfo);
      } catch (e) {
        console.error("Failed to parse check-in state", e);
      }
    }
  }, []);

  // Save state to sessionStorage on change
  useEffect(() => {
    const stateToSave = { step, selectedHotel, checkInResult, roomInfo };
    sessionStorage.setItem("catkaa_checkin_state", JSON.stringify(stateToSave));
  }, [step, selectedHotel, checkInResult, roomInfo]);

  useEffect(() => {
    getHotels()
      .then(setHotels)
      .catch(() => { })
      .finally(() => setLoadingHotels(false));
  }, []);

  const handleCheckInComplete = async (response: OcrCheckInResponse) => {
    setCheckInResult(response);
    try {
      const room = await getRoomById(response.data.roomId);
      setRoomInfo(room);
    } catch {
      setRoomInfo(null);
    }
    setStep(2);
  };

  const canGoBack = step === 1;
  const canGoNext = step === 0 && !!selectedHotel;

  return (
    <div className="demo-wrapper">
      <div className="auto-container">
        <div className="row align-items-center g-5">

          {/* ── Cột trái: điều hướng ── */}
          <div className="col-lg-5">
            <div className="sec-title mb-4">
              <div className="subtitle"><span className="dot"></span> CATKAA SECURITY</div>
              <h2 className="fw-900 text-dark" style={{ fontSize: "42px", lineHeight: "1.1" }}>
                Quy trình<br /><span className="text-catkaa">Check-in Số</span>
              </h2>
            </div>
            <p className="text-muted mb-5">
              Hệ thống tự động nhận diện CCCD và xác thực booking của bạn chỉ trong vài giây. Không cần chờ đợi, không cần lễ tân.
            </p>

            {/* Step list */}
            <div className="d-flex flex-column gap-3 mb-5">
              {STEPS_DATA.map((s, i) => (
                <div
                  key={i}
                  className={`d-flex align-items-center gap-3 p-3 rounded-4 ${step === i ? "bg-white shadow" : ""}`}
                  style={{
                    border: step === i ? "1.5px solid #c7d7ff" : "1.5px solid transparent",
                    opacity: step < i ? 0.45 : 1,
                    transition: "all 0.3s",
                  }}
                >
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: 40, height: 40,
                      background: step > i ? "#16a34a" : step === i ? "#16309F" : "#e5e7eb",
                      color: step >= i ? "#fff" : "#9ca3af",
                      transition: "background 0.3s",
                    }}
                  >
                    {step > i ? <Check size={18} /> : <s.icon size={18} />}
                  </div>
                  <div>
                    <p className={`mb-0 small fw-bold ${step === i ? "text-dark" : "text-muted"}`}>{s.label}</p>
                    <p className="mb-0 text-muted" style={{ fontSize: "10px" }}>BƯỚC {i + 1}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="d-flex gap-3 justify-content-center">
              <button
                onClick={() => canGoBack && setStep(step - 1)}
                disabled={!canGoBack}
                className="theme-btn btn-style-three btn-small flex-grow-1 d-flex align-items-center justify-content-center shadow-sm"
                style={{ opacity: canGoBack ? 1 : 0.4, maxWidth: "160px" }}
              >
                <span className="btn-title d-flex align-items-center">
                  <ArrowLeft size={16} className="me-2" /> Quay lại
                </span>
              </button>
              <button
                onClick={() => canGoNext && setStep(1)}
                disabled={!canGoNext}
                className="theme-btn btn-style-three btn-small flex-grow-1 d-flex align-items-center justify-content-center shadow-sm"
                style={{ opacity: canGoNext ? 1 : 0.4, maxWidth: "160px" }}
              >
                <span className="btn-title d-flex align-items-center">
                  Tiếp theo <ArrowRight size={16} className="ms-2" />
                </span>
              </button>
            </div>
          </div>

          {/* ── Cột phải: Phone Mockup ── */}
          <div className="col-lg-7 d-flex justify-content-center">
            <div className="phone-mockup">
              <div className="phone-notch-top"></div>
              <div className="h-100 bg-white overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.35 }}
                    className="h-100"
                  >
                    {step === 0 && (
                      <StepWelcome
                        hotels={hotels}
                        loadingHotels={loadingHotels}
                        selectedHotel={selectedHotel}
                        onHotelSelect={setSelectedHotel}
                        onNext={() => setStep(1)}
                      />
                    )}
                    {step === 1 && (
                      <StepScan
                        hotelId={selectedHotel!.id}
                        onCheckInComplete={handleCheckInComplete}
                      />
                    )}
                    {step === 2 && (
                      <StepCheckInDone
                        checkInResult={checkInResult}
                        roomInfo={roomInfo}
                        hotelName={selectedHotel?.name ?? ""}
                        onGoToPayment={() => setStep(3)}
                      />
                    )}
                    {step === 3 && (
                      <StepPayment
                        checkInResult={checkInResult}
                        roomInfo={roomInfo}
                        hotelName={selectedHotel?.name ?? ""}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
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
}
