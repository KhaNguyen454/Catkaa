import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPricingPlans, PricingPlan } from "../services/pricingService";
import { getAuthToken, getAuthRole, upgradeToHost, clearAuthToken } from "../services/authService";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { useMessage } from "../components/MessageContext";

const Services: React.FC = () => {
  const [pricingData, setPricingData] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [packageToConfirm, setPackageToConfirm] = useState<PricingPlan | null>(null);
  const [selectedPackageForPayment, setSelectedPackageForPayment] = useState<PricingPlan | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const navigate = useNavigate();
  const { notify } = useMessage();

  useEffect(() => {
    getPricingPlans()
      .then(setPricingData)
      .catch((err) => console.error("Failed to load pricing plans", err))
      .finally(() => setLoading(false));
  }, []);

  const handleRegisterClick = async (e: React.MouseEvent, pkg: PricingPlan) => {
    e.preventDefault();
    const token = getAuthToken();
    const role = getAuthRole();

    if (!token) {
      notify("Để có thể đăng ký dịch vụ, yêu cầu quý khách đăng ký tài khoản", "warning");
      navigate("/register?returnUrl=/services");
      return;
    }

    // Luôn mở Modal xác nhận trước
    setPackageToConfirm(pkg);
  };

  const handleConfirmUpgrade = async (pkg: PricingPlan) => {
    // Ẩn modal xác nhận
    setPackageToConfirm(null);

    // Bỏ qua thanh toán nếu gói là miễn phí (gói Trải Nghiệm - ID 1)
    if (pkg.id === 1 || pkg.price === "0 VNĐ") {
      setIsProcessingPayment(true);
      try {
        const response = await upgradeToHost(pkg.id);
        notify(response.message || "Nâng cấp thành công", "success");
        clearAuthToken();
        setTimeout(() => navigate("/login"), 2500);
      } catch (err: any) {
        notify(err.message || "Có lỗi xảy ra khi đăng ký", "error");
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }

    // Nếu có giá tiền, mở Modal Payment
    setSelectedPackageForPayment(pkg);
  };

  const handleMockPayment = async (pkg: PricingPlan) => {
    setIsProcessingPayment(true);
    try {
      const response = await upgradeToHost(pkg.id);
      notify("Thanh toán thành công! " + (response.message || ""), "success");
      clearAuthToken();
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      notify(err.message || "Có lỗi xảy ra khi thanh toán", "error");
    } finally {
      setIsProcessingPayment(false);
      setSelectedPackageForPayment(null);
    }
  };

  if (loading) {
    return (
      <div className="services-page d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      {/* Page Title */}
      <section
        className="page-title"
        style={{
          backgroundImage:
            'linear-gradient(rgba(26, 30, 46, 0.7), rgba(26, 30, 46, 0.7)), url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "120px 0",
        }}
      >
        <div className="auto-container text-center">
          <h1 className="text-white fw-900 display-4 mb-2">Gói & Dịch Vụ</h1>
          <p
            className="text-white opacity-75 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            Giải pháp công nghệ toàn diện giúp bạn vận hành nhàn hạ và chuyên
            nghiệp hơn.
          </p>
        </div>
      </section>

      {/* Intro Icons Section */}
      {/* <section className="services-intro py-5 bg-white border-bottom">
        <div className="auto-container">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-4">
                <div
                  className="icon mb-3"
                  style={{ fontSize: "40px", color: "#1686cb" }}
                >
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <h5 className="fw-bold">Bảo Mật Pháp Lý</h5>
                <p className="small text-muted">
                  Đảm bảo 100% quy trình eKYC và báo cáo lưu trú PA72.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 border-start border-end">
                <div
                  className="icon mb-3"
                  style={{ fontSize: "40px", color: "#1686cb" }}
                >
                  <i className="fa-solid fa-microchip"></i>
                </div>
                <h5 className="fw-bold">Vận Hành Tự Động</h5>
                <p className="small text-muted">
                  Hệ thống Micro PMS và Smart Lock quản lý từ xa 24/7.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4">
                <div
                  className="icon mb-3"
                  style={{ fontSize: "40px", color: "#1686cb" }}
                >
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <h5 className="fw-bold">Tối Ưu Doanh Thu</h5>
                <p className="small text-muted">
                  Báo cáo minh bạch, quản lý booking tập trung, hiệu quả.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Pricing Cards Section */}
      <section className="pricing-section pt-40 pb-120 bg-light">
        <div className="auto-container">
          <div className="sec-title text-center mb-5">
            <div className="subtitle" style={{ color: "#1686cb" }}>
              <span
                className="dot"
                style={{ backgroundColor: "#1686cb" }}
              ></span>{" "}
              BẢNG GIÁ DỊCH VỤ
            </div>
            {/* <h2 className="title">Lựa Chọn Giải Pháp Tối Ưu Cho Homestay</h2> */}
          </div>

          <div className="row g-4 justify-content-center align-items-stretch">
            {pricingData.map((pkg, idx) => (
              <div
                key={pkg.id}
                className="col-xl-4 col-md-6 wow fadeInUp"
                data-wow-delay={`${idx * 100}ms`}
              >
                <div
                  className={`pricing-card h-100 shadow-sm bg-white p-5 rounded-5 border-0 text-center transition-all position-relative ${pkg.isPopular ? "border-2 scale-105" : ""}`}
                  style={
                    pkg.isPopular
                      ? {
                          borderColor: "#1686cb",
                          transform: "scale(1.05)",
                          zIndex: 2,
                        }
                      : {}
                  }
                >
                  {pkg.isPopular && (
                    <div
                      className="popular-badge position-absolute top-0 start-50 translate-middle text-white fw-bold px-4 py-1 rounded-pill"
                      style={{ backgroundColor: "#1686cb" }}
                    >
                      PHỔ BIẾN
                    </div>
                  )}

                  <div className="pricing-header mb-4">
                    <h4 className="fw-bold text-dark mb-1">{pkg.name}</h4>
                    <p className="text-muted small">{pkg.subtitle}</p>
                    <div className="price-box my-4">
                      <h3
                        className="fw-900 mb-0"
                        style={{
                          color: "#1686cb",
                          fontSize: pkg.price.length > 15 ? "24px" : "32px",
                        }}
                      >
                        {pkg.price}
                      </h3>
                    </div>
                  </div>

                  <div className="pricing-features-list text-start mb-5">
                    {pkg.features.map((feature, fIdx) => (
                      <div
                        key={fIdx}
                        className={`d-flex justify-content-between align-items-center py-2 border-bottom ${feature.disabled ? "opacity-50" : ""}`}
                        style={{ borderColor: "#f0f0f0" }}
                      >
                        <span className="text-muted small fw-bold">
                          {feature.name}
                        </span>
                        <span
                          className={`small ${feature.highlight ? "text-success fw-bold" : feature.disabled ? "text-muted" : "text-dark fw-bold"}`}
                        >
                          {feature.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => handleRegisterClick(e, pkg)}
                    className="theme-btn w-100 rounded-pill py-3 d-flex align-items-center justify-content-center transition-all"
                    style={{
                      backgroundColor: pkg.isPopular ? "#1686cb" : "#f8f9fa",
                      color: pkg.isPopular ? "#fff" : "#333",
                      border: pkg.isPopular ? "none" : "1px solid #ddd",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    <span className="btn-title">{pkg.btnText}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <p className="text-muted small">
              * Áp dụng chính sách sử dụng hợp lý (Fair Usage Policy) cho lượt
              OCR không giới hạn.
            </p>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {selectedPackageForPayment && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "450px" }}>
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Thanh toán gói dịch vụ</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedPackageForPayment(null)}
                  disabled={isProcessingPayment}
                ></button>
              </div>
              <div className="modal-body p-4 text-center">
                <div className="mb-4">
                  <h4 className="fw-bold" style={{ color: "#1686cb" }}>{selectedPackageForPayment.name}</h4>
                  <h5 className="text-muted mb-0">{selectedPackageForPayment.price}</h5>
                </div>
                
                <div className="d-flex flex-column gap-3">
                  <button
                    onClick={() => handleMockPayment(selectedPackageForPayment)}
                    disabled={isProcessingPayment}
                    className="btn rounded-pill text-white fw-bold py-3 shadow-sm d-flex justify-content-center align-items-center"
                    style={{ background: "#10b981", fontSize: "14px" }}
                  >
                    {isProcessingPayment ? <Loader2 size={18} className="me-2 spin" /> : <Check size={18} className="me-2" />}
                    {isProcessingPayment ? "Đang xử lý..." : "Thanh toán (Giả lập)"}
                  </button>
                  
                  <button
                    className="btn rounded-pill text-white fw-bold py-3 shadow-sm d-flex justify-content-center align-items-center"
                    style={{ background: "#94a3b8", fontSize: "14px" }}
                    onClick={() => alert("Cổng thanh toán VNPay hiện đang được bảo trì. Vui lòng sử dụng tính năng Thanh toán (Giả lập).")}
                    disabled={isProcessingPayment}
                  >
                    <ExternalLink size={18} className="me-2" /> 
                    Thanh toán VNPay (Đang bảo trì)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {packageToConfirm && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "400px" }}>
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-body p-4 text-center">
                <div className="mb-3">
                  <h5 className="fw-bold">Xác nhận đăng ký gói</h5>
                  <p className="text-muted small">
                    Việc sử dụng gói <strong className="text-primary">{packageToConfirm.name}</strong> sẽ kích hoạt quyền <strong>CHỦ KHÁCH SẠN</strong> cho tài khoản của bạn.
                  </p>
                  <p className="text-muted small mb-0">Bạn có chắc chắn muốn tiếp tục không?</p>
                </div>
                <div className="d-flex gap-2 justify-content-center mt-4">
                  <button 
                    className="btn btn-light rounded-pill px-4 fw-bold shadow-sm" 
                    onClick={() => setPackageToConfirm(null)}
                    disabled={isProcessingPayment}
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center" 
                    onClick={() => handleConfirmUpgrade(packageToConfirm)}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? <Loader2 size={16} className="me-2 spin" /> : null}
                    Đồng ý
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pricing-card { transition: all 0.4s ease; }
        .pricing-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(22, 134, 203, 0.15) !important; }
        .scale-105 { transform: scale(1.05); }
        .fw-900 { font-weight: 900; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Services;
