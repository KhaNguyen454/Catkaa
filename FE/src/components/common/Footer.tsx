import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer
      className="main-footer footer-style-one"
      style={{ backgroundColor: "#1a1e2e", paddingTop: "40px", marginTop: "0" }}
    >
      <div
        className="widgets-section wow fadeInLeft"
        data-wow-delay="100ms"
        data-wow-duration="1500ms"
      >
        <div className="auto-container">
          <div className="row">
            {/* Footer Column */}
            <div className="footer-column col-lg-4 col-sm-12">
              <div className="footer-widget about-widget">
                <figure className="image mb-4">
                  <Link
                    to="/"
                    className="d-flex align-items-center text-decoration-none"
                  >
                    <div
                      style={{
                        background: "#fff",
                        padding: "6px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src="/images/catkaa.jpg"
                        alt="CATKAA"
                        style={{ maxHeight: "40px", borderRadius: "4px" }}
                      />
                    </div>
                    <div className="catkaa-brand-group ms-3">
                      <span
                        className="catkaa-brand-name"
                        style={{
                          color: "#1686cb",
                          fontWeight: "800",
                          fontSize: "22px",
                          lineHeight: "1",
                          textTransform: "uppercase",
                        }}
                      >
                        CATKAA
                      </span>
                    </div>
                  </Link>
                </figure>
                <p
                  style={{
                    color: "#a5a9bd",
                    lineHeight: "1.8",
                    fontSize: "14px",
                  }}
                >
                  Giải pháp công nghệ tiên phong cho Homestay Việt Nam. Chúng
                  tôi giúp bạn tự động hóa quy trình check-in, quản lý pháp lý
                  và nâng cao trải nghiệm khách hàng.
                </p>
                <div className="footer-social-widget2 mt-4">
                  <style>{`
                    .footer-social-link {
                      width: 40px;
                      height: 40px;
                      line-height: 40px;
                      background: rgba(255,255,255,0.05);
                      color: #fff;
                      display: inline-block;
                      text-align: center;
                      border-radius: 50%;
                      margin-right: 10px;
                      transition: all 0.3s ease;
                    }
                    .footer-social-link:hover {
                      background: #1686cb;
                      transform: translateY(-3px);
                    }
                  `}</style>
                  <a href="#" className="footer-social-link">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="footer-social-link">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="footer-social-link">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Footer Column */}
            <div className="footer-column col-lg-2 col-sm-6">
              <div className="footer-widget links-widget">
                <h5
                  className="widget-title"
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    marginBottom: "30px",
                    fontSize: "18px",
                    position: "relative",
                    paddingBottom: "10px",
                  }}
                >
                  Liên Kết
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "30px",
                      height: "2px",
                      background: "#1686cb",
                    }}
                  ></span>
                </h5>
                <ul
                  className="user-links"
                  style={{ listStyle: "none", padding: 0 }}
                >
                  <li className="mb-2">
                    <Link
                      to="/about"
                      style={{
                        color: "#a5a9bd",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "all 0.3s",
                        whiteSpace: "nowrap"
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#1686cb")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#a5a9bd")
                      }
                    >
                      Giới Thiệu
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/services"
                      style={{
                        color: "#a5a9bd",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "all 0.3s",
                        whiteSpace: "nowrap"
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#1686cb")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#a5a9bd")
                      }
                    >
                      Gói & Dịch Vụ
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/contact"
                      style={{
                        color: "#a5a9bd",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "all 0.3s",
                        whiteSpace: "nowrap"
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#1686cb")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#a5a9bd")
                      }
                    >
                      Liên Hệ
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Column */}
            <div className="footer-column col-lg-2 col-sm-6">
              <div className="footer-widget links-widget">
                <h5
                  className="widget-title"
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    marginBottom: "30px",
                    fontSize: "18px",
                    position: "relative",
                    paddingBottom: "10px",
                  }}
                >
                  Hệ Thống của CATKAA
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "30px",
                      height: "2px",
                      background: "#1686cb",
                    }}
                  ></span>
                </h5>
                <ul
                  className="user-links"
                  style={{ listStyle: "none", padding: 0 }}
                >
                  <li className="mb-2">
                    <Link
                      to="/check-in"
                      style={{
                        color: "#a5a9bd",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "all 0.3s",
                        whiteSpace: "nowrap"
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#1686cb")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#a5a9bd")
                      }
                    >
                      Quy trình Khách hàng
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/dashboard"
                      style={{
                        color: "#a5a9bd",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "all 0.3s",
                        whiteSpace: "nowrap"
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#1686cb")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#a5a9bd")
                      }
                    >
                      Dashboard Chủ nhà
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/pa72"
                      style={{
                        color: "#a5a9bd",
                        textDecoration: "none",
                        fontSize: "14px",
                        transition: "all 0.3s",
                        whiteSpace: "nowrap"
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#1686cb")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#a5a9bd")
                      }
                    >
                      Báo cáo PA72
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Column */}
            <div className="footer-column col-lg-4 col-sm-6">
              <div className="footer-widget contact-widget">
                <h5
                  className="widget-title"
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    marginBottom: "30px",
                    fontSize: "18px",
                    position: "relative",
                    paddingBottom: "10px",
                  }}
                >
                  Liên Hệ
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "30px",
                      height: "2px",
                      background: "#1686cb",
                    }}
                  ></span>
                </h5>
                <div className="text-white opacity-75 small mb-3">
                  Lô E2a-7, Đường D1, Khu Công nghệ cao, Phường Tăng Nhơn Phú, TP. Hồ Chí Minh
                </div>
                <a
                  className="d-block text-white mb-2"
                  style={{ textDecoration: "none", fontSize: "14px" }}
                  href="tel:0356022021"
                >
                  0356022021
                </a>
                <a
                  className="d-block mb-2"
                  style={{
                    color: "#1686cb",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                  href="mailto:catkaofficial@gmail.com"
                >
                  catkaofficial@gmail.com
                </a>
                <a
                  className="d-block text-white"
                  style={{ textDecoration: "none", fontSize: "14px" }}
                  href="https://www.facebook.com/profile.php?id=61590199657550"
                  target="_blank"
                  rel="noreferrer"
                >
                  Fanpage Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="footer-bottom mt-40"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "30px 0",
        }}
      >
        <div className="auto-container">
          <div
            className="copyright-text text-center"
            style={{ color: "#6c727f", fontSize: "13px" }}
          >
            © Copyright 2026 CATKAA. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
