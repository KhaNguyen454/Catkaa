import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { submitContactForm, ContactSubmitData } from "../services/contactService";

const Contact: React.FC = () => {
  const location = useLocation();
  const initialPackage = location.state?.packageName || "";

  const [formData, setFormData] = useState<ContactSubmitData>({
    name: "",
    phone: "",
    email: "",
    packageName: initialPackage,
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitContactForm(formData);
      setStatus("success");
      setFormData({ name: "", phone: "", email: "", packageName: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.response?.data?.message || err.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  return (
    <div className="contact-page">
      {/* Page Title */}
      <section
        className="page-title"
        style={{
          backgroundImage:
            'linear-gradient(rgba(26, 30, 46, 0.8), rgba(26, 30, 46, 0.8)), url("https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "100px 0",
        }}
      >
        <div className="auto-container text-center">
          <h1 className="text-white fw-bold display-5 mb-2">Liên Hệ Với Chúng Tôi</h1>
          <p className="text-white opacity-75">
            Hãy để CATKAA đồng hành cùng bạn nâng tầm dịch vụ Homestay.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <style>{`
        .contact-form-block input::placeholder,
        .contact-form-block textarea::placeholder {
          opacity: 0.4;
          color: #999;
        }
      `}</style>
      <section className="contact-section pt-100 pb-100">
        <div className="auto-container">
          <div className="row g-5">
            {/* Contact Info */}
            <div className="col-lg-5 col-md-12">
              <div className="contact-info-block bg-light p-5 rounded-4 h-100 shadow-sm">
                <h3 className="fw-bold mb-4" style={{ color: "#16309F" }}>Thông Tin Liên Hệ</h3>
                <p className="text-muted mb-5">
                  Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn giải đáp mọi thắc mắc và cung cấp giải pháp tốt nhất.
                </p>

                <div className="info-item d-flex mb-4">
                  <div className="icon me-3 mt-1" style={{ fontSize: "24px", color: "#1686cb" }}>
                    <i className="fa-solid fa-map-location-dot"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Địa chỉ văn phòng</h6>
                    <p className="text-muted small mb-0">Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, TP. Hồ Chí Minh</p>
                  </div>
                </div>

                <div className="info-item d-flex mb-4">
                  <div className="icon me-3 mt-1" style={{ fontSize: "24px", color: "#1686cb" }}>
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Email hỗ trợ</h6>
                    <a href="mailto:catkaofficial@gmail.com" className="text-muted small text-decoration-none">catkaofficial@gmail.com</a>
                  </div>
                </div>

                <div className="info-item d-flex mb-4">
                  <div className="icon me-3 mt-1" style={{ fontSize: "24px", color: "#1686cb" }}>
                    <i className="fa-solid fa-phone-volume"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Hotline tư vấn</h6>
                    <a href="tel:0356022021" className="text-muted small text-decoration-none">0356022021</a>
                  </div>
                </div>

                <div className="info-item d-flex">
                  <div className="icon me-3 mt-1" style={{ fontSize: "24px", color: "#1686cb" }}>
                    <i className="fa-brands fa-facebook"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Fanpage Facebook</h6>
                    <a href="https://www.facebook.com/profile.php?id=61590199657550" target="_blank" rel="noreferrer" className="text-muted small text-decoration-none">Theo dõi chúng tôi</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-7 col-md-12">
              <div className="contact-form-block bg-white p-5 rounded-4 shadow-sm border h-100">
                <h3 className="fw-bold mb-2">Gửi Yêu Cầu Hỗ Trợ</h3>
                <p className="text-muted mb-4 small">Vui lòng điền thông tin bên dưới, chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.</p>

                {status === "success" && (
                  <div className="alert alert-success d-flex align-items-center mb-4">
                    <i className="fa-solid fa-circle-check me-2"></i>
                    <div>Thông tin của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ sớm nhất.</div>
                  </div>
                )}
                {status === "error" && (
                  <div className="alert alert-danger mb-4">{errorMessage}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Họ và tên *</label>
                      <input type="text" className="form-control" name="name" required placeholder="Nguyễn Văn A" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Số điện thoại *</label>
                      <input type="tel" className="form-control" name="phone" required placeholder="09xxxxxxx" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Email liên hệ *</label>
                      <input type="email" className="form-control" name="email" required placeholder="nguyenvana@gmail.com" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Gói dịch vụ quan tâm</label>
                      <input type="text" className="form-control" name="packageName" placeholder="Ví dụ: Gói Sở Hữu" value={formData.packageName} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Nội dung / Yêu cầu</label>
                      <textarea className="form-control" name="message" rows={4} placeholder="Vui lòng để lại lời nhắn..." value={formData.message} onChange={handleChange}></textarea>
                    </div>
                    <div className="col-12 mt-4">
                      <button type="submit" disabled={status === "loading"} className="btn w-100 rounded-pill text-white fw-bold py-3" style={{ background: "#1686cb", transition: "0.3s" }}>
                        {status === "loading" ? "Đang gửi..." : "Gửi Yêu Cầu"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
