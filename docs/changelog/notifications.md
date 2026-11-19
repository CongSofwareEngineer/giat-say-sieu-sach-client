# Notifications (Firebase Cloud Messaging) — Changelog
> Instruction: docs/instruction/notifications.md

## 2026-10-29
- **Chuông thông báo** (§4): Header lấy `GET /notifications/me`, dịch từ `type` + `data` theo ngôn ngữ hiện tại, badge theo `meta.unreadCount`. Bấm mục → đánh dấu đã đọc + mở `/track-order?code=`; "Đánh dấu đã đọc" → `PATCH /notifications/me/read-all`. Làm mới mỗi 60s và ngay khi có push.
- **NotificationBell**: thêm prop `unreadCount`, đóng dropdown khi bấm một mục.
- **Nhận push khi đang mở web** (§3): làm mới chuông + "Đơn hàng của tôi".
- **Service worker**: sửa handler `notificationclick` dùng biến `payload` không tồn tại (lỗi → không mở được trang); giờ mở `data.link` hoặc trang chủ.
- **Constants / keys mới**:
  - `NOTIFICATION_TYPE`, `NOTIFICATION_INBOX`, `TRACK_ORDER_PATH`, `QUERY_KEYS.getNotifications`
  - `notification.types.ORDER_STATUS.<status>.{title,body}`
- **Lý do**:
  - Chuông trước đây luôn trống (`notifications={[]}`); khách không xem lại được cập nhật đơn.

## 2026-10-19
- **Đăng ký FID**: bỏ `getToken()` (deprecated); thiết bị đăng ký bằng `register()` + `onRegistered()` và được định danh bằng FID. Handler `onRegistered` được giữ suốt vòng đời app để nhận FID mới khi Firebase xoay vòng.
- **Lưu trữ**: FID lưu ở `localStorage[LOCAL_STORAGE_KEY.fcmFid]` thay cho `fcm_token`; hook đổi API sang `fid` / `getFid` / `getStoredFid` / `clearFid`, thêm helper `getStoredFcmFid()`. Các hàm của hook được memo bằng `useCallback`.
- **Đồng bộ server**: `UserService.updateFcmToken` → `updateFcmFid`, gửi `PATCH /users/me { fid }`; đơn khách gửi `notificationFid` thay cho `notificationToken`.
- **Login**: bỏ chuỗi hardcode `'fcm_token'`, dùng `getStoredFcmFid()`.
- **Kiểu**: `User.fcmToken` → `User.fids`; `CreateGuestOrderPayload.notificationToken` → `notificationFid`.
- **Constants / keys mới**:
  - `LOCAL_STORAGE_KEY.fcmFid`
- **Lý do**:
  - `getToken` của `firebase@12.18` bị deprecated, Firebase khuyến nghị nhắn tin theo FID; đồng bộ cả hệ thống client + server sang FID.
  - Trước đây `PATCH /users/me { fcmToken }` luôn bị server trả 400 (DTO không có field) nên user đã đăng nhập chưa từng được lưu token — nay server nhận `fid`.
  - Phụ thuộc thay đổi server cùng ngày (`notificationFid`, `fid`, `User.fids`) — phải deploy client và server cùng lúc.
