import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

const Home: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const images = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextStep = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevStep = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const timer = setInterval(nextStep, 4000);
    return () => clearInterval(timer);
  }, [index]);

  const getCardStyle = (itemIndex: number) => {
    const diff = (itemIndex - index + images.length) % images.length;

    if (diff === 0) {
      return { x: 0, scale: 1, zIndex: 10, opacity: 1, filter: "blur(0px)" };
    }

    const xOffset = isMobile ? 40 : 300;
    const sideScale = isMobile ? 0.85 : 0.8;

    if (diff === 1 || diff === -(images.length - 1)) {
      return {
        x: xOffset,
        scale: sideScale,
        zIndex: 5,
        opacity: isMobile ? 0.6 : 0.4,
        filter: isMobile ? "blur(1px)" : "blur(4px)",
      };
    }

    if (diff === images.length - 1 || diff === -1) {
      return {
        x: -xOffset,
        scale: sideScale,
        zIndex: 5,
        opacity: isMobile ? 0.6 : 0.4,
        filter: isMobile ? "blur(1px)" : "blur(4px)",
      };
    }

    return { x: 0, scale: 0.5, zIndex: 0, opacity: 0, filter: "blur(10px)" };
  };

  return (
    <>
      <style>{`
        .banner-title h1 {
          font-size: 72px !important;
          font-weight: 900 !important;
          line-height: 1.1 !important;
          color: #ffffff !important;
          margin: 0 !important;
        }
        .banner-slogan {
          display: block;
          font-size: 28px !important;
          font-weight: 600 !important;
          color: #ffffff !important;
          marginTop: 15px !important;
          letter-spacing: 2px !important;
          border-left: 5px solid #1686cb !important;
          padding-left: 20px !important;
          line-height: 1.2 !important;
        }
        .banner-desc {
          font-size: 19px !important;
          color: #ffffff !important;
          margin-bottom: 40px !important;
          opacity: 0.95 !important;
          max-width: 750px !important;
          line-height: 1.7 !important;
        }
        @media (max-width: 767px) {
          .banner-title h1 { font-size: 48px !important; }
          .banner-slogan { font-size: 20px !important; }
          .banner-desc { font-size: 16px !important; }
        }

        .about-image-collage {
          position: relative;
          height: 550px;
        }
        .main-img-wrapper {
          width: 85%;
          height: 85%;
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.1);
        }
        .sub-img-wrapper {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 50%;
          height: 50%;
          border-radius: 30px;
          overflow: hidden;
          border: 8px solid #fff;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        @media (max-width: 991px) {
          .about-image-collage { height: 400px; margin-bottom: 40px; }
        }
      `}</style>

      {/* Banner Section */}
      <section className="banner-section-two">
        <div className="banner-bg-pattern bounce-x">
          <img src="/images/resource/banner2-top-bg.png" alt="" />
        </div>
        <div className="large-container">
          <div className="main-banner-img wow fadeInUp bounce-y">
            <img
              src="/images/anhnen.jpg"
              alt="CATKAA Banner"
              style={{ borderRadius: "30px" }}
            />
          </div>
          <div className="row">
            <div className="col-xl-8 col-lg-10">
              <div className="content-column">
                <div
                  className="sub-title wow fadeInUp"
                  style={{
                    color: "#ffffff",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                    fontSize: "16px",
                    textTransform: "uppercase",
                  }}
                >
                  Chào mừng bạn đến với Ngôi Nhà Thứ Hai
                </div>
                <div
                  className="banner-title wow fadeInUp"
                  style={{ marginBottom: "35px" }}
                >
                  <h1>CATKAA</h1>
                  <span className="banner-slogan">
                    ĐIỂM TỰA PHÁP LÝ <br /> TỰ DO VẬN HÀNH
                  </span>
                </div>
                <div
                  className="banner-bottom-box2 wow fadeInUp"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                >
                  <div className="banner-desc wow fadeInUp">
                    CATKAA mang đến giải pháp công nghệ dành riêng cho các chủ
                    Homestay tại Việt Nam. Từ những căn nhà sàn vùng cao đến
                    villa gỗ Đà Lạt, chúng tôi giúp bạn vận hành tự động và
                    chuyên nghiệp hơn.
                  </div>
                  <div className="contact-info d-flex align-items-center gap-4">
                    <div
                      className="icon d-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: "#1686cb",
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        color: "#fff",
                        fontSize: "24px",
                        boxShadow: "0 8px 20px rgba(22, 134, 203, 0.4)",
                      }}
                    >
                      <i className="fa-sharp fa-solid fa-phone-volume"></i>
                    </div>
                    <div className="info">
                      <h6
                        className="small-title"
                        style={{
                          color: "#ffffff",
                          marginBottom: "4px",
                          opacity: "0.8",
                          fontSize: "14px",
                        }}
                      >
                        Hỗ trợ đối tác 24/7
                      </h6>
                      <h5
                        className="call mb-0"
                        style={{
                          color: "#ffffff",
                          fontWeight: "800",
                          fontSize: "22px",
                        }}
                      >
                        Hotline: 0356 022 021
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REFINED MODERN ABOUT SECTION */}
      <section className="about-section-modern pt-120 pb-120">
        <div className="auto-container">
          <div className="row align-items-center">
            {/* Left: Image Collage */}
            <div className="col-lg-6 wow fadeInLeft" data-wow-delay="200ms">
              <div className="about-image-collage">
                <div className="main-img-wrapper">
                  <img
                    src="https://images.unsplash.com/photo-1562133567-b6a0a9c7e6eb?q=80&w=1000&auto=format&fit=crop"
                    alt="CATKAA Modern Interior"
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                <div className="sub-img-wrapper">
                  <img
                    src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop"
                    alt="CATKAA Exterior"
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right: Content Only */}
            <div
              className="col-lg-6 ps-lg-5 wow fadeInRight"
              data-wow-delay="400ms"
            >
              <div className="sec-title mb-4">
                <div className="subtitle" style={{ color: "#1686cb" }}>
                  <span
                    className="dot"
                    style={{ backgroundColor: "#1686cb" }}
                  ></span>{" "}
                  VỀ CHÚNG TÔI
                </div>
                <h2
                  className="title mt-3"
                  style={{
                    fontSize: "42px",
                    fontWeight: "800",
                    lineHeight: "1.2",
                  }}
                >
                  Kiến tạo chuẩn mực mới <br /> cho Homestay Việt Nam
                </h2>
              </div>

              <p
                className="mb-4 text-muted"
                style={{ fontSize: "18px", lineHeight: "1.8" }}
              >
                Chúng tôi không chỉ cung cấp phần mềm, CATKAA xây dựng một hệ
                sinh thái toàn diện từ
                <strong> Pháp lý, Vận hành đến An ninh</strong>. Giúp các chủ
                nhà thảnh thơi kinh doanh trong khi khách hàng tận hưởng sự an
                tâm tuyệt đối.
              </p>

              <ul className="list-style-three mb-5">
                <li className="d-flex align-items-center gap-3 mb-3">
                  <CheckCircle2 className="text-primary" size={24} />
                  <span className="fw-bold text-dark">
                    Tự động hóa eKYC & Báo cáo PA72
                  </span>
                </li>
                <li className="d-flex align-items-center gap-3 mb-3">
                  <CheckCircle2 className="text-primary" size={24} />
                  <span className="fw-bold text-dark">
                    Hỗ trợ vận hành 24/7 chuyên nghiệp
                  </span>
                </li>
              </ul>

              <Link to="/about" className="theme-btn btn-style-two">
                <span className="btn-title">Tìm hiểu thêm về chúng tôi</span>
                <i className="icon fa-regular fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Stack Slider Section */}
      <section className="featured-stays-section pt-5 mt-5 pb-120 overflow-hidden">
        <div className="auto-container">
          <div className="sec-title text-center mb-5">
            <div className="subtitle" style={{ color: "#1686cb" }}>
              <span className="dot"></span> GIẢI PHÁP TOÀN DIỆN
            </div>
            <h2 className="title">Brand Story</h2>
          </div>

          <div
            className="position-relative d-flex justify-content-center align-items-center"
            style={{ height: isMobile ? "350px" : "650px" }}
          >
            <button
              onClick={prevStep}
              className="position-absolute start-0 btn btn-outline-primary rounded-circle shadow-sm bg-white"
              style={{
                left: "2%",
                zIndex: 20,
                padding: isMobile ? "8px" : "15px",
              }}
            >
              <ChevronLeft size={isMobile ? 18 : 24} />
            </button>
            <button
              onClick={nextStep}
              className="position-absolute end-0 btn btn-outline-primary rounded-circle shadow-sm bg-white"
              style={{
                right: "2%",
                zIndex: 20,
                padding: isMobile ? "8px" : "15px",
              }}
            >
              <ChevronRight size={isMobile ? 18 : 24} />
            </button>

            <div className="position-relative w-100 d-flex justify-content-center align-items-center">
              {images.map((num, i) => {
                const style = getCardStyle(i);
                return (
                  <motion.div
                    key={num}
                    initial={false}
                    animate={style}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="position-absolute rounded-4 overflow-hidden shadow-lg bg-white"
                    style={{
                      width: isMobile ? "85%" : "800px",
                      height: isMobile ? "250px" : "500px",
                      cursor: "pointer",
                      border: isMobile ? "1px solid #eee" : "none",
                    }}
                    onClick={() => setIndex(i)}
                  >
                    <img
                      src={`/images/${num}.png`}
                      alt={`Tính năng CATKAA ${num}`}
                      className="w-100 h-100"
                      style={{
                        objectFit: "contain",
                        padding: isMobile ? "5px" : "15px",
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-4">
            <div className="d-flex justify-content-center gap-2">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-circle transition-all ${index === i ? "bg-primary" : "bg-light border"}`}
                  style={{
                    width:
                      index === i
                        ? isMobile
                          ? "15px"
                          : "20px"
                        : isMobile
                          ? "6px"
                          : "10px",
                    height: isMobile ? "6px" : "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="service-section-two pt-120 pb-60">
        <div className="auto-container">
          <div className="row">
            <div className="d-xl-flex align-items-center justify-content-between mb-5">
              <div className="sec-title mb-20 wow fadeInRight flex-shrink-0">
                <div className="subtitle">
                  <span className="dot"></span> Dịch vụ của chúng tôi
                </div>
                <h2 className="title">
                  Những giải pháp chúng tôi <br className="d-none d-xl-block" />{" "}
                  mang lại cho bạn
                </h2>
              </div>
              <div className="sec-title-right mb-lg-50 mt-5 mt-lg--0">
                <div className="text">
                  CATKAA cung cấp hệ sinh thái toàn diện giúp chủ homestay giải
                  quyết bài toán vận hành và pháp lý một cách tự động, minh bạch
                  và an toàn.
                </div>
              </div>
            </div>
          </div>
          <div className="tabs-box">
            <div className="row">
              <div className="col-lg-6 mb-5 mb-lg-0">
                <div
                  className="tab-btns tab-buttons wow fadeInUp"
                  data-wow-delay="100ms"
                >
                  <button className="tab-btn active-btn">
                    <span>01.</span> Tự động hóa eKYC khách hàng{" "}
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                  <button className="tab-btn">
                    <span>02.</span> Báo cáo lưu trú PA72/VNeID{" "}
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                  <button className="tab-btn">
                    <span>03.</span> Quản lý booking tập trung{" "}
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                  <button className="tab-btn">
                    <span>04.</span> Check-in không tiếp xúc{" "}
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                  <button className="tab-btn">
                    <span>05.</span> Thanh toán tự động & Minh bạch{" "}
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
              <div
                className="tabs-content col-lg-6 wow fadeInUp ps-4"
                data-wow-delay="300ms"
              >
                <div className="tab active-tab">
                  <div className="tab-inner-content">
                    <div className="service-block-h2">
                      <div className="inner-block">
                        <div className="image">
                          <img
                            className="w-100"
                            src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop"
                            alt="Digital Check-in"
                            style={{ borderRadius: "20px" }}
                          />
                        </div>
                        <div className="contents mt-4">
                          <h4 className="title">Tự động hóa eKYC khách hàng</h4>
                          <div className="text">
                            Nhận diện CCCD và khuôn mặt khách hàng chỉ trong vài
                            giây, đảm bảo tính xác thực và an toàn cao nhất.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
