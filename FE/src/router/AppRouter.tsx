import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/Home";
import GuestFlow from "../pages/GuestFlow";
import OwnerDashboard from "../pages/OwnerDashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Services from "../pages/Services";
import TestBooking from "../pages/TestBooking";
import { getAuthRole, getAuthToken } from "../services/authService";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!getAuthToken()) return <Navigate to="/login" replace />;
  const role = getAuthRole();
  if (role !== "Admin" && role !== "Host") return <Navigate to="/" replace />;
  return <>{children}</>;
};

const About = () => (
  <section className="pt-120 pb-120 auto-container">
    <h2>Giới Thiệu</h2>
    <p>
      Hệ thống CATKAA cung cấp giải pháp pháp lý và tự động hóa toàn diện cho
      Homestay.
    </p>
  </section>
);
const Contact = () => (
  <section className="pt-120 pb-120 auto-container">
    <h2>Liên Hệ</h2>
    <p>Email: support@catkaa.com | Hotline: +84 123 456 789</p>
  </section>
);

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Tất cả trang thuộc MainLayout sẽ có Header và Footer */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="contact" element={<Contact />} />
        <Route path="check-in" element={<GuestFlow />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="test-booking" element={<TestBooking />} />
      </Route>

      {/* Chỉ Dashboard Admin là chạy độc lập vì có Sidebar riêng */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRouter;
