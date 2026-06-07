# Hướng Dẫn Lấy "App Password" (Mật khẩu ứng dụng) Gmail cho Backend (SMTP)

Để hệ thống BE (`Catkaa.MicroPms.Api`) có thể gửi email qua `SmtpEmailService`, bạn cần cung cấp một **App Password** của Gmail (không dùng mật khẩu đăng nhập bình thường vì lý do bảo mật).

Dưới đây là các bước lấy App Password:

## Bước 1: Đăng nhập và Bật Xác minh 2 bước (2-Step Verification)
1. Đăng nhập vào tài khoản Gmail cần dùng làm Sender (ví dụ: `catkaofficial@gmail.com`).
2. Truy cập trang Quản lý Tài khoản Google: [https://myaccount.google.com/](https://myaccount.google.com/)
3. Chọn mục **Bảo mật (Security)** ở menu bên trái.
4. Tìm phần "Cách bạn đăng nhập vào Google" (How you sign in to Google).
5. Đảm bảo **Xác minh 2 bước (2-Step Verification)** đã được bật. Nếu chưa, hãy làm theo hướng dẫn trên màn hình để bật (sẽ yêu cầu số điện thoại).

## Bước 2: Tạo App Password
1. Sau khi bật Xác minh 2 bước, trên thanh tìm kiếm của trang Quản lý Tài khoản Google (ở trên cùng), gõ chữ **App Passwords** (Mật khẩu ứng dụng).
2. Click vào kết quả `Mật khẩu ứng dụng` (có thể yêu cầu nhập lại mật khẩu Gmail).
3. Ở trang mới:
   - Phần **Ứng dụng (App)**: Chọn "Khác (Tên tùy chỉnh)" (Other/Custom name) và nhập tên ví dụ: `Catkaa SMTP`.
   - Bấm nút **Tạo (Generate)**.
4. Google sẽ hiển thị một popup chứa mật khẩu gồm 16 chữ cái (ví dụ: `abcd efgh ijkl mnop`).
5. **Copy** mật khẩu này lại. (Lưu ý: Bỏ qua các dấu cách khi sử dụng).

## Bước 3: Cập nhật cấu hình Backend
1. Mở file `appsettings.json` trong project Backend (`Catkaa.MicroPms.Api`).
2. Tìm đến block cấu hình `SmtpSettings`:
```json
  "SmtpSettings": {
    "Server": "smtp.gmail.com",
    "Port": 587,
    "SenderName": "Catkaa PMS",
    "SenderEmail": "catkaofficial@gmail.com",
    "Password": "ĐIỀN APP PASSWORD VÀO ĐÂY (KHÔNG CÓ DẤU CÁCH)"
  }
```
3. Lưu file và khởi động lại Backend.

Chúc bạn cấu hình thành công!
