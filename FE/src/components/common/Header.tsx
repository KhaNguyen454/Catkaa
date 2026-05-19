import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, User, X } from "lucide-react";
import {
  clearAuthToken,
  getAuthRole,
  getAuthToken,
  getAuthUsername,
} from "../../services/authService";

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!getAuthToken();
  const username = getAuthUsername();
  const role = getAuthRole();

  const isActive = (path: string) =>
    location.pathname === path ? "current" : "";

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    clearAuthToken();
    setDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="main-header header-style-one style-one">
      {/* Header Top */}
      <div className="header-top">
        <div className="inner-container xl-container">
          <div className="top-left">
            <ul className="list-style-one">
              <li><i className="fa-solid fa-location-dot"></i> 123 Homestay St, Da Lat</li>
              <li><i className="fa-solid fa-envelope"></i> <a href="mailto:support@catkaa.com">support@catkaa.com</a></li>
            </ul>
          </div>
          <div className="top-right">
            <ul className="social-icon-one d-flex align-items-center">
              <li>Follow Us:</li>
              <li className="ms-3">
                <a href="#" className="social-link-item"><span className="fab fa-facebook-f"></span></a>
              </li>
              <li className="ms-2">
                <a href="#" className="social-link-item"><span className="fab fa-instagram"></span></a>
              </li>
              <li className="ms-2">
                <a href="#" className="social-link-item"><span className="fab fa-youtube"></span></a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Header Lower */}
      <div className="header-lower">
        <div className="auto-container">
          <div className="main-box d-flex align-items-center" style={{ height: '80px' }}>

            {/* Logo */}
            <div className="logo-box flex-shrink-0">
              <Link to="/" className="d-flex align-items-center text-decoration-none">
                <div className="bg-white p-1 rounded-3 shadow-sm" style={{ border: '1px solid #f0f0f0' }}>
                  <img src="/images/catkaa.jpg" alt="CATKAA" style={{ height: "40px", width: "auto", display: 'block' }} />
                </div>
                <div className="ms-2 d-flex flex-column">
                  <span className="catkaa-text" style={{ color: "#1686cb", fontWeight: "900", fontSize: "20px", lineHeight: "1" }}>CATKAA</span>
                  <span className="d-none d-md-block" style={{ color: "#333", fontSize: "7px", fontWeight: "700", letterSpacing: "1px", marginTop: '2px' }}>LEGAL FOUNDATION, FREEDOM OF OPERATION</span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="nav main-menu mx-auto d-none d-xl-block">
              <ul className="navigation d-flex align-items-center">
                <li className={isActive("/")}><Link to="/">Trang Chủ</Link></li>
                <li className={isActive("/about")}><Link to="/about">Giới Thiệu</Link></li>
                <li className={isActive("/services")}><Link to="/services">Gói & Dịch Vụ</Link></li>
                <li className={isActive("/contact")}><Link to="/contact">Liên Hệ</Link></li>
                <li className={isActive("/test-booking")}><Link to="/test-booking">Booking</Link></li>
              </ul>
            </nav>

            {/* Actions */}
            <div className="outer-box d-flex align-items-center gap-2 gap-md-3">
              {isLoggedIn ? (
                /* User Avatar + Dropdown */
                <div className="position-relative d-none d-md-block" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="user-avatar-btn"
                    title={username ?? "Tài khoản"}
                  >
                    <User size={18} />
                  </button>

                  {dropdownOpen && (
                    <div className="user-dropdown">
                      <div className="user-dropdown-info">
                        <div className="user-dropdown-name">{username}</div>
                        <div className="user-dropdown-role">{role}</div>
                      </div>
                      <div className="user-dropdown-divider" />
                      <button onClick={handleLogout} className="user-dropdown-logout">
                        <LogOut size={14} />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="login-nav-btn d-none d-md-flex align-items-center justify-content-center gap-2">
                  <LogIn size={16} /> Đăng Nhập
                </Link>
              )}

              <Link to="/check-in" className="checkin-nav-btn">
                Check-in Ngay
              </Link>

              <button
                className="d-xl-none border-0 bg-transparent p-1 p-md-2"
                onClick={toggleMobileMenu}
                style={{ color: '#333' }}
              >
                <Menu size={28} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          right: isMobileMenuOpen ? 0 : '-100%',
          width: '300px',
          height: '100vh',
          backgroundColor: '#ffffff',
          zIndex: 10000,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '25px'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <img src="/images/catkaa.jpg" alt="CATKAA" style={{ height: "35px", borderRadius: '4px' }} />
            <span className="ms-2 fw-bold" style={{ color: '#1686cb', fontSize: '18px' }}>CATKAA</span>
          </div>
          <button className="border-0 bg-transparent" onClick={toggleMobileMenu}>
            <X size={28} />
          </button>
        </div>

        <nav className="mobile-nav flex-grow-1">
          <ul className="list-unstyled">
            <li className="mb-3"><Link to="/" onClick={toggleMobileMenu} className="text-decoration-none fw-bold text-dark d-block py-2">Trang Chủ</Link></li>
            <li className="mb-3"><Link to="/about" onClick={toggleMobileMenu} className="text-decoration-none fw-bold text-dark d-block py-2">Giới Thiệu</Link></li>
            <li className="mb-3"><Link to="/services" onClick={toggleMobileMenu} className="text-decoration-none fw-bold text-dark d-block py-2">Gói & Dịch Vụ</Link></li>
            <li className="mb-3"><Link to="/contact" onClick={toggleMobileMenu} className="text-decoration-none fw-bold text-dark d-block py-2">Liên Hệ</Link></li>
            <li className="mb-3"><Link to="/test-booking" onClick={toggleMobileMenu} className="text-decoration-none fw-bold text-dark d-block py-2">Booking</Link></li>
          </ul>
        </nav>

        <div className="mobile-drawer-footer pt-4 border-top mt-auto">
          {isLoggedIn ? (
            <>
              <div className="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded-3">
                <div className="user-avatar-btn" style={{ width: 36, height: 36, fontSize: 14, pointerEvents: 'none' }}>
                  <User size={16} />
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>{username}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-100 d-flex align-items-center justify-content-center gap-2 fw-bold mb-3 btn"
                style={{ padding: '12px', borderRadius: '50px', border: '2px solid #e53e3e', color: '#e53e3e', background: 'transparent', fontSize: '14px' }}
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" onClick={toggleMobileMenu} className="w-100 d-flex align-items-center justify-content-center gap-2 text-decoration-none fw-bold mb-3 login-nav-btn" style={{ padding: '12px' }}>
              <LogIn size={20} /> Đăng Nhập
            </Link>
          )}
          <Link to="/check-in" onClick={toggleMobileMenu}
            className="w-100 d-flex align-items-center justify-content-center gap-2 text-decoration-none fw-bold checkin-nav-btn"
            style={{ padding: '12px', borderRadius: '10px' }}
          >
            Check-in Ngay
          </Link>
        </div>
      </div>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={toggleMobileMenu}
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999, backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <style>{`
        .navigation li { margin: 0 15px; }
        .navigation li a {
          font-weight: 600; color: #333; text-decoration: none;
          transition: all 0.3s ease; position: relative; padding: 10px 0;
        }
        .navigation li a:before {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0; height: 2px; background-color: #1686cb; transition: all 0.3s ease;
        }
        .navigation li:hover a, .navigation li.current a { color: #1686cb; }
        .navigation li:hover a:before, .navigation li.current a:before { width: 100%; }

        .login-nav-btn {
          padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 700;
          color: #1686cb !important; border: 2px solid #1686cb;
          text-decoration: none !important; transition: all 0.3s ease; background-color: transparent;
        }
        .login-nav-btn:hover { background-color: #1686cb; color: #ffffff !important; transform: translateY(-2px); }

        .checkin-nav-btn {
          padding: 10px 24px; border-radius: 50px; font-size: 14px; font-weight: 700;
          background-color: #333333; color: #ffffff !important; text-decoration: none !important;
          transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          display: inline-flex; align-items: center; white-space: nowrap;
        }
        .checkin-nav-btn:hover { background-color: #1686cb !important; transform: translateY(-2px); box-shadow: 0 6px 12px rgba(22, 134, 203, 0.2); }

        /* User Avatar Button */
        .user-avatar-btn {
          width: 40px; height: 40px; border-radius: 50%; border: 2px solid #1686cb;
          background: #eef6fd; color: #1686cb; display: flex; align-items: center;
          justify-content: center; cursor: pointer; transition: all 0.25s ease;
          font-weight: 700; font-size: 15px;
        }
        .user-avatar-btn:hover { background: #1686cb; color: #fff; transform: translateY(-1px); }

        /* User Dropdown */
        .user-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: #fff; border-radius: 12px; min-width: 180px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12); border: 1px solid #f0f0f0;
          overflow: hidden; z-index: 1000;
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .user-dropdown-info { padding: 12px 16px; }
        .user-dropdown-name { font-weight: 700; font-size: 13px; color: #333; }
        .user-dropdown-role {
          font-size: 11px; font-weight: 600; color: #1686cb;
          background: #eef6fd; display: inline-block;
          padding: 2px 8px; border-radius: 20px; margin-top: 4px;
        }
        .user-dropdown-divider { height: 1px; background: #f0f0f0; }
        .user-dropdown-logout {
          width: 100%; padding: 10px 16px; border: none; background: transparent;
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 600; color: #e53e3e;
          cursor: pointer; transition: background 0.2s;
        }
        .user-dropdown-logout:hover { background: #fff5f5; }

        /* Social Icons */
        .social-link-item {
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.1); color: #fff; border-radius: 50%;
          font-size: 13px; transition: all 0.3s ease; text-decoration: none !important;
        }
        .social-link-item:hover { background: #1686cb; color: #fff; transform: translateY(-2px); }

        @media (max-width: 991px) {
          .checkin-nav-btn { padding: 8px 16px; font-size: 12px; }
          .login-nav-btn { padding: 6px 14px; font-size: 12px; }
        }
        @media (max-width: 480px) {
          .catkaa-text { font-size: 18px !important; }
          .checkin-nav-btn { padding: 6px 12px; font-size: 11px; }
        }
      `}</style>
    </header>
  );
};

export default Header;
