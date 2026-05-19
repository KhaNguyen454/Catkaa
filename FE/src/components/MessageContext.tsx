import React, { createContext, useContext } from "react";
import { useNotification } from "./NotificationContext";

export const messages = {
  // Auth
  loginSuccess: "Đăng nhập thành công! 🎉",
  loginError: "Tên đăng nhập hoặc mật khẩu không đúng",
  logoutSuccess: "Đã đăng xuất thành công",
  registerSuccess: "Đăng ký tài khoản thành công! Vui lòng đăng nhập",
  registerError: "Đăng ký thất bại. Vui lòng thử lại",

  // User Management
  userCreatedSuccess: "Tạo tài khoản thành công",
  userUpdatedSuccess: "Cập nhật tài khoản thành công",
  userDeletedSuccess: "Xóa tài khoản thành công",
  userLoadError: "Lỗi khi tải thông tin người dùng",

  // Hotel Management
  hotelCreatedSuccess: "Tạo khách sạn thành công",
  hotelUpdatedSuccess: "Cập nhật khách sạn thành công",
  hotelDeletedSuccess: "Xóa khách sạn thành công",
  hotelLoadError: "Lỗi khi tải thông tin khách sạn",

  // Room Management
  roomCreatedSuccess: "Tạo phòng thành công",
  roomUpdatedSuccess: "Cập nhật phòng thành công",
  roomDeletedSuccess: "Xóa phòng thành công",
  roomLoadError: "Lỗi khi tải thông tin phòng",

  // Booking Management
  bookingCreatedSuccess: "Tạo đặt phòng thành công",
  bookingUpdatedSuccess: "Cập nhật đặt phòng thành công",
  bookingDeletedSuccess: "Xóa đặt phòng thành công",
  bookingCancelledSuccess: "Hủy đặt phòng thành công",
  bookingLoadError: "Lỗi khi tải thông tin đặt phòng",
  bookingDeleteError: "Lỗi khi xóa đặt phòng",

  // General
  loadingError: "Lỗi khi tải dữ liệu",
  saveError: "Lỗi khi lưu dữ liệu",
  deleteError: "Lỗi khi xóa dữ liệu",
  unknownError: "Đã xảy ra lỗi không xác định",
  networkError: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối",
};

interface MessageContextType {
  notify: (
    key: keyof typeof messages | string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { addNotification } = useNotification();

  const notify = (
    key: keyof typeof messages | string,
    type: "success" | "error" | "info" | "warning" = "info",
  ) => {
    const message = messages[key as keyof typeof messages] || key;
    addNotification(type, message);
  };

  return (
    <MessageContext.Provider value={{ notify }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within MessageProvider");
  }
  return context;
};
