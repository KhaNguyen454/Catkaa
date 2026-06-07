import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/Home";
import About from "../pages/About";
import GuestFlow from "../pages/GuestFlow";
import GuestHistory from "../pages/GuestHistory";
import OwnerDashboard from "../pages/OwnerDashboard";
import PaymentResult from "../pages/PaymentResult";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Services from "../pages/Services";
import TestBooking from "../pages/TestBooking";
import Checkout from "../pages/Checkout";
import Contact from "../pages/Contact";
import { getAuthRole, getAuthToken } from "../services/authService";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!getAuthToken()) return <Navigate to="/login" replace />;
  const role = getAuthRole();
  if (role !== "Admin" && role !== "Host") return <Navigate to="/" replace />;
  return <>{children}</>;
};



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
        <Route path="my-history" element={<GuestHistory />} />
        <Route path="checkout" element={<Checkout />} />
      </Route>

      {/* VNPay return page — standalone, no layout */}
      <Route path="/payment-result" element={<PaymentResult />} />

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
