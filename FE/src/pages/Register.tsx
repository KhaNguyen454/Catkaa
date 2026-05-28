import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { getAuthToken } from "../services/authService";
import { useMessage } from "../components/MessageContext";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useMessage();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.username.trim()) {
      const msg = "Tên đăng nhập không được để trống";
      setError(msg);
      notify(msg, "warning");
      return;
    }
    if (!formData.email.trim()) {
      const msg = "Email không được để trống";
      setError(msg);
      notify(msg, "warning");
      return;
    }
    if (!formData.password) {
      const msg = "Mật khẩu không được để trống";
      setError(msg);
      notify(msg, "warning");
      return;
    }
    if (formData.password.length < 6) {
      const msg = "Mật khẩu phải có ít nhất 6 ký tự";
      setError(msg);
      notify(msg, "warning");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      const msg = "Mật khẩu xác nhận không khớp";
      setError(msg);
      notify(msg, "warning");
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5096";
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          role: "Guest",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Đăng ký thất bại");
      }

      notify("registerSuccess", "success");
      setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Không thể đăng ký tài khoản";
      setError(errorMsg);
      notify("registerError", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="register-page-split d-flex flex-column flex-md-row min-vh-100 overflow-hidden">
      {/* CỘT TRÁI: VIDEO (Chiếm 60% trên desktop) */}
      <div
        className="video-column position-relative d-none d-md-block"
        style={{ flex: "0 0 60%", backgroundColor: "#f8fafc" }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        >
          <source src="/images/login.mp4" type="video/mp4" />
        </video>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to right, rgba(0,0,0,0.1), transparent)",
            zIndex: 2,
          }}
        ></div>
      </div>

      {/* CỘT PHẢI: FORM ĐĂNG KÝ (Chiếm 40% trên desktop) */}
      <div
        className="form-column d-flex align-items-center justify-content-center bg-white p-4"
        style={{ flex: "1" }}
      >
        <div style={{ maxWidth: "340px", width: "100%" }}>
          {/* Mobile Logo Only */}
          <div className="text-center d-md-none mb-4">
            <img
              src="/images/catkaa.jpg"
              alt="CATKAA"
              style={{ height: "40px", borderRadius: "8px" }}
            />
          </div>

          <div className="mb-4 text-center text-md-start">
            <h3
              className="fw-bold text-dark mb-1"
              style={{ letterSpacing: "-0.5px" }}
            >
              Tạo tài khoản
            </h3>
            <p className="text-muted small">
              Đăng ký để bắt đầu sử dụng dịch vụ CATKAA.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Tên đăng nhập */}
            <div className="form-group mb-3">
              <label
                className="fw-bold mb-1"
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  opacity: 0.6,
                  letterSpacing: "0.5px",
                }}
              >
                Tên đăng nhập
              </label>
              <div className="position-relative">
                <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="nguyenvana"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  style={{
                    height: "48px",
                    borderRadius: "10px",
                    paddingLeft: "45px",
                    border: "2px solid #f1f5f9",
                    backgroundColor: "#f8fafc",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group mb-3">
              <label
                className="fw-bold mb-1"
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  opacity: 0.6,
                  letterSpacing: "0.5px",
                }}
              >
                Email
              </label>
              <div className="position-relative">
                <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="nguyen@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    height: "48px",
                    borderRadius: "10px",
                    paddingLeft: "45px",
                    border: "2px solid #f1f5f9",
                    backgroundColor: "#f8fafc",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="form-group mb-3">
              <label
                className="fw-bold mb-1"
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  opacity: 0.6,
                  letterSpacing: "0.5px",
                }}
              >
                Mật khẩu
              </label>
              <div className="position-relative">
                <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={{
                    height: "48px",
                    borderRadius: "10px",
                    paddingLeft: "45px",
                    paddingRight: "45px",
                    border: "2px solid #f1f5f9",
                    backgroundColor: "#f8fafc",
                    fontSize: "14px",
                  }}
                />
                <span
                  className="position-absolute top-50 translate-middle-y text-muted"
                  style={{ right: "15px", cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="form-group mb-3">
              <label
                className="fw-bold mb-1"
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  opacity: 0.6,
                  letterSpacing: "0.5px",
                }}
              >
                Xác nhận mật khẩu
              </label>
              <div className="position-relative">
                <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="••••••••"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  style={{
                    height: "48px",
                    borderRadius: "10px",
                    paddingLeft: "45px",
                    paddingRight: "45px",
                    border: "2px solid #f1f5f9",
                    backgroundColor: "#f8fafc",
                    fontSize: "14px",
                  }}
                />
                <span
                  className="position-absolute top-50 translate-middle-y text-muted"
                  style={{ right: "15px", cursor: "pointer" }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>

            {error ? (
              <div
                className="alert alert-danger py-2 px-3 mb-3"
                role="alert"
                style={{ fontSize: "13px", borderRadius: "10px" }}
              >
                {error}
              </div>
            ) : null}

            {success ? (
              <div
                className="alert alert-success py-2 px-3 mb-3"
                role="alert"
                style={{ fontSize: "13px", borderRadius: "10px" }}
              >
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
              disabled={loading}
              style={{
                backgroundColor: "#1686cb",
                height: "48px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "15px",
                border: "none",
                transition: "all 0.3s ease",
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
              {!loading ? <ArrowRight size={18} /> : null}
            </button>
          </form>

          <div className="mt-4 pt-3 text-center border-top">
            <p className="text-muted small mb-0">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-primary fw-bold text-decoration-none"
                style={{ fontSize: "12px" }}
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          <div className="mt-2 text-center">
            <Link
              to="/"
              className="text-muted text-decoration-none hover-primary"
              style={{ fontSize: "12px" }}
            >
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .form-control::placeholder {
          color: #adb5bd !important;
          opacity: 0.4 !important;
        }
        .form-control:focus {
          background-color: #fff !important;
          border-color: #1686cb !important;
          box-shadow: 0 10px 20px rgba(22, 134, 203, 0.05) !important;
        }
        .hover-primary:hover {
          color: #1686cb !important;
        }
        @media (max-width: 767px) {
          .form-column {
            padding: 40px 20px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Register;
