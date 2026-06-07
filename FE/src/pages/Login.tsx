import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { getAuthRole, getAuthToken, login, setAuthToken } from "../services/authService";
import { useMessage } from "../components/MessageContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useMessage();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get("returnUrl");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getAuthToken()) {
      if (returnUrl) {
        navigate(returnUrl, { replace: true });
        return;
      }
      const role = getAuthRole();
      navigate(role === "Admin" || role === "Host" ? "/dashboard" : "/", { replace: true });
    }
  }, [navigate, returnUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ username, password });
      setAuthToken(response.token);
      notify("loginSuccess", "success");
      if (returnUrl) {
        navigate(returnUrl, { replace: true });
      } else {
        const role = getAuthRole();
        navigate(role === "Admin" || role === "Host" ? "/dashboard" : "/", { replace: true });
      }
    } catch (submitError) {
      const raw = submitError instanceof Error ? submitError.message : "";
      const errorMsg =
        raw === "Invalid username or password"
          ? "Tên đăng nhập hoặc mật khẩu không đúng"
          : raw || "Không thể đăng nhập";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-page-split d-flex flex-column flex-md-row min-vh-100 overflow-hidden">
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

        {/* Lớp phủ gradient nhẹ để video sâu hơn */}
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

      {/* CỘT PHẢI: FORM ĐĂNG NHẬP (Chiếm 40% trên desktop) */}
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
              Quản trị CATKAA
            </h3>
            <p className="text-muted small">
              Chào mừng trở lại! Vui lòng đăng nhập.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
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
                  <Mail size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="admin@catkaa.com"
                  value={username}
                  onChange={(event) => { setUsername(event.target.value); setError(""); }}
                  autoComplete="username"
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

            <div className="form-group mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label
                  className="fw-bold"
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    opacity: 0.6,
                    letterSpacing: "0.5px",
                  }}
                >
                  Mật khẩu
                </label>
                {/* <a
                  href="#"
                  className="small text-primary text-decoration-none fw-bold"
                  style={{ fontSize: "11px" }}
                >
                  Quên?
                </a> */}
              </div>
              <div className="position-relative">
                <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setError(""); }}
                  autoComplete="current-password"
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

            {error ? (
              <div
                className="alert alert-danger py-2 px-3 mb-3"
                role="alert"
                style={{ fontSize: "13px", borderRadius: "10px" }}
              >
                {error}
              </div>
            ) : null}

            <div className="form-check mb-4">
              <input
                type="checkbox"
                className="form-check-input"
                id="remember"
                style={{ cursor: "pointer" }}
              />
              <label
                className="form-check-label text-muted ms-1"
                htmlFor="remember"
                style={{ cursor: "pointer", fontSize: "12px" }}
              >
                Duy trì đăng nhập
              </label>
            </div>

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
              {loading ? "Đang đăng nhập..." : "Đăng nhập ngay"}
              {!loading ? <ArrowRight size={18} /> : null}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-muted" style={{ fontSize: "12px" }}>
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-primary fw-bold text-decoration-none"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-3 text-center border-top">
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

export default Login;
