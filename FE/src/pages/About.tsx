import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Zap, TrendingUp } from "lucide-react";

const About: React.FC = () => {
  return (
    <div className="about-page">
      {/* Page Title */}
      <section
        className="page-title"
        style={{
          backgroundImage:
            'linear-gradient(rgba(26, 30, 46, 0.7), rgba(26, 30, 46, 0.7)), url("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "120px 0",
        }}
      >
        <div className="auto-container text-center">
          <h1 className="text-white fw-bold display-4 mb-2">Về CATKAA</h1>
          <p
            className="text-white opacity-75 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            Giải pháp công nghệ tiên phong, nâng tầm dịch vụ lưu trú và bảo vệ pháp lý toàn diện cho chủ Homestay.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section pt-100 pb-100">
        <div className="auto-container mt-5 mb-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="position-relative">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop" 
                  alt="Văn phòng CATKAA" 
                  className="w-100 rounded-4 shadow"
                />
                <div 
                  className="position-absolute bg-white p-4 rounded-4 shadow-lg text-center d-none d-md-block"
                  style={{ bottom: "-30px", right: "-30px", maxWidth: "250px" }}
                >
                  <h2 className="fw-bold mb-0" style={{ color: "#1686cb" }}>100%</h2>
                  <p className="text-muted small mb-0 fw-bold">Tự Động Hóa Nhận Phòng</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 ps-lg-5 mt-5 mt-lg-0">
              <div className="sec-title mb-4">
                <div className="subtitle" style={{ color: "#1686cb" }}>
                  <span className="dot" style={{ backgroundColor: "#1686cb" }}></span> CÂU CHUYỆN CỦA CHÚNG TÔI
                </div>
                <h2 className="title mt-3 fw-bold" style={{ fontSize: "36px" }}>
                  Bắt nguồn từ sự thấu hiểu
                </h2>
              </div>
              <p className="text-muted mb-4" style={{ lineHeight: "1.8", fontSize: "16px" }}>
                Việc kinh doanh Homestay chưa bao giờ là dễ dàng. Chủ nhà luôn phải đối mặt với hàng tá rủi ro pháp lý, rắc rối trong khâu vận hành bảo mật, và việc đăng ký lưu trú rườm rà làm mất đi trải nghiệm tốt của khách hàng.
              </p>
              <p className="text-muted mb-4" style={{ lineHeight: "1.8", fontSize: "16px" }}>
                <strong>CATKAA</strong> ra đời với một sứ mệnh duy nhất: <strong>Trở thành "ngôi nhà thứ hai" của các chủ Homestay</strong>. Chúng tôi mang đến hệ sinh thái công nghệ All-in-one giúp giải quyết triệt để 100% các thủ tục pháp lý (eKYC, khai báo lưu trú) và tự động hóa toàn bộ quy trình nhận/trả phòng.
              </p>
              <div className="d-flex align-items-center gap-4 mt-5">
                <div className="d-flex flex-column">
                  <h4 className="fw-bold text-dark mb-1">200+</h4>
                  <span className="text-muted small fw-bold">Khách sạn đối tác</span>
                </div>
                <div style={{ width: "1px", height: "40px", backgroundColor: "#ddd" }}></div>
                <div className="d-flex flex-column">
                  <h4 className="fw-bold text-dark mb-1">50.000+</h4>
                  <span className="text-muted small fw-bold">Lượt Check-in thành công</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="core-values bg-light pt-100 pb-100">
        <div className="auto-container py-4">
          <div className="sec-title text-center mb-5">
            <div className="subtitle" style={{ color: "#1686cb" }}>
              <span className="dot" style={{ backgroundColor: "#1686cb" }}></span> GIÁ TRỊ CỐT LÕI
            </div>
            <h2 className="title fw-bold">Tại sao nên chọn CATKAA?</h2>
          </div>
          <div className="row g-4 mt-4">
            <div className="col-lg-4 col-md-6">
              <div className="bg-white p-5 rounded-4 h-100 shadow-sm transition-all hover-lift border-0">
                <div className="icon-wrapper mb-4 d-inline-flex p-3 rounded-circle" style={{ background: "rgba(22, 134, 203, 0.1)", color: "#1686cb" }}>
                  <ShieldCheck size={32} />
                </div>
                <h4 className="fw-bold mb-3">An Toàn Pháp Lý</h4>
                <p className="text-muted mb-0" style={{ lineHeight: "1.7" }}>
                  Chuẩn hóa quy trình thu thập thông tin và tự động liên kết báo cáo lưu trú nhanh chóng, bảo vệ bạn trước mọi rủi ro kiểm tra hành chính.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="bg-white p-5 rounded-4 h-100 shadow-sm transition-all hover-lift border-0">
                <div className="icon-wrapper mb-4 d-inline-flex p-3 rounded-circle" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                  <Zap size={32} />
                </div>
                <h4 className="fw-bold mb-3">Vận Hành Tự Động</h4>
                <p className="text-muted mb-0" style={{ lineHeight: "1.7" }}>
                  Từ hệ thống quản lý PMS tập trung đến khóa cửa Smart Lock không tiếp xúc, giải phóng 80% thời gian quản lý của chủ nhà.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="bg-white p-5 rounded-4 h-100 shadow-sm transition-all hover-lift border-0">
                <div className="icon-wrapper mb-4 d-inline-flex p-3 rounded-circle" style={{ background: "rgba(234, 179, 8, 0.1)", color: "#eab308" }}>
                  <TrendingUp size={32} />
                </div>
                <h4 className="fw-bold mb-3">Tối Ưu Doanh Thu</h4>
                <p className="text-muted mb-0" style={{ lineHeight: "1.7" }}>
                  Cung cấp báo cáo tài chính minh bạch, chống gian lận doanh thu, giúp bạn dễ dàng theo dõi hiệu quả kinh doanh từ xa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5" style={{ background: "linear-gradient(135deg, #16309F, #1686cb)" }}>
        <div className="auto-container text-center py-4">
          <h3 className="text-white fw-bold mb-3">Sẵn sàng thay đổi cách quản lý Homestay?</h3>
          <p className="text-white opacity-75 mb-4 mx-auto" style={{ maxWidth: "600px" }}>
            Gia nhập cộng đồng hơn 200+ chủ nhà đang sử dụng CATKAA để thảnh thơi vận hành mỗi ngày.
          </p>
          <div className="d-flex justify-content-center gap-3 mt-4" style={{ position: "relative", zIndex: 10 }}>
            <Link to="/services" className="btn bg-white rounded-pill px-4 py-2 fw-bold shadow-sm" style={{ color: "#1686cb" }}>
              Xem Bảng Giá
            </Link>
            <Link to="/contact" className="btn btn-outline-light rounded-pill px-4 py-2 fw-bold">
              Liên Hệ Tư Vấn
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-10px); box-shadow: 0 15px 35px rgba(22, 134, 203, 0.1) !important; }
      `}</style>
    </div>
  );
};

export default About;
