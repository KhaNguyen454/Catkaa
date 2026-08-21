import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function PaymentResult() {
  const [params] = useSearchParams();
  const success = params.get("success") === "true";
  const ref = params.get("ref") ?? "";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 80);
    // Notify opener tab
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        { type: "PAYMENT_RESULT", success, ref },
        window.location.origin,
      );
    }
    return () => clearTimeout(t);
  }, [success, ref]);

  const accent = success ? "#16a34a" : "#dc2626";
  const accentBg = success ? "#f0fdf4" : "#fff1f2";
  const accentBorder = success ? "#bbf7d0" : "#fecdd3";
  const accentLight = success ? "#dcfce7" : "#fee2e2";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#0f2a5e 0%,#1a3d7c 50%,#1686cb 100%)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: "24px 16px",
      }}
    >
      {/* Brand header */}
      <div
        style={{
          marginBottom: 28,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-12px)",
          transition: "all .45s ease",
          textAlign: "center",
        }}
      >
        <div style={{ color: "rgba(255,255,255,.35)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>
          CATKA · Thanh toán
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "40px 32px 32px",
          textAlign: "center",
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 24px 80px rgba(0,0,0,.28)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(.97)",
          transition: "all .5s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {/* Icon circle */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: accentLight,
            border: `3px solid ${accentBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 36,
          }}
        >
          {success ? "✅" : "❌"}
        </div>

        <h1
          style={{
            fontWeight: 800,
            fontSize: 22,
            color: accent,
            margin: "0 0 8px",
            letterSpacing: "-.3px",
          }}
        >
          {success ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </h1>

        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>
          {success
            ? "Đặt phòng đã được xác nhận. Chúc bạn có kỳ nghỉ tuyệt vời tại CATKA!"
            : "Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."}
        </p>

        {/* Status chip */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: accentBg,
            border: `1px solid ${accentBorder}`,
            borderRadius: 99,
            padding: "6px 16px",
            marginBottom: 20,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent, display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>
            {success ? "Giao dịch thành công" : "Giao dịch thất bại"}
          </span>
        </div>

        {/* Transaction detail */}
        {ref && (
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", marginBottom: 4 }}>
              Mã giao dịch
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", fontFamily: "monospace", wordBreak: "break-all" }}>
              {ref}
            </div>
          </div>
        )}

        {/* Buttons */}
        <button
          onClick={() => {
            if (window.opener && !window.opener.closed) {
              window.close();
            } else {
              window.location.href = "/";
            }
          }}
          style={{
            background: success
              ? "linear-gradient(135deg,#16a34a,#15803d)"
              : "linear-gradient(135deg,#dc2626,#b91c1c)",
            color: "#fff",
            border: "none",
            borderRadius: 99,
            padding: "13px 0",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            width: "100%",
            boxShadow: `0 4px 16px ${success ? "rgba(22,163,74,.35)" : "rgba(220,38,38,.35)"}`,
            transition: "opacity .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = ".88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Đóng và quay lại trang chủ
        </button>

        {!success && (
          <button
            onClick={() => window.history.back()}
            style={{
              background: "transparent",
              color: "#64748b",
              border: "1px solid #e2e8f0",
              borderRadius: 99,
              padding: "10px 0",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              width: "100%",
              marginTop: 10,
            }}
          >
            Thử lại thanh toán
          </button>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 24,
          color: "rgba(255,255,255,.3)",
          fontSize: 11,
          opacity: visible ? 1 : 0,
          transition: "opacity .6s .3s",
        }}
      >
        Được bảo mật bởi VNPay · CATKA MicroPMS
      </div>
    </div>
  );
}
