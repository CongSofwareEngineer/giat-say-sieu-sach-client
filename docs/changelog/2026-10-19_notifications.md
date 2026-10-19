# Notifications

- Ngày: 2026-10-19
- Feature: notifications (→ docs/instruction/notifications.md)
- Loại: Changed, Fixed
- File: `services/notification.ts`, `hooks/useNotifications.ts`, `components/NotificationProvider/index.tsx`, `app/login/page.tsx`, `agents/tools/booking.ts`, `services/users/index.ts`, `services/users/type.ts`, `services/order.ts`, `constants/app.ts`, `docs/instruction/auth.md`, `docs/instruction/chat.md`

## Thay đổi
- **Đăng ký FID**: bỏ `getToken()` (deprecated); thiết bị đăng ký bằng `register()` + `onRegistered()` và được định danh bằng FID. Handler `onRegistered` được giữ suốt vòng đời app để nhận FID mới khi Firebase xoay vòng.
- **Lưu trữ**: FID lưu ở `localStorage[LOCAL_STORAGE_KEY.fcmFid]` thay cho `fcm_token`; hook đổi API sang `fid` / `getFid` / `getStoredFid` / `clearFid`, thêm helper `getStoredFcmFid()`. Các hàm của hook được memo bằng `useCallback`.
- **Đồng bộ server**: `UserService.updateFcmToken` → `updateFcmFid`, gửi `PATCH /users/me { fid }`; đơn khách gửi `notificationFid` thay cho `notificationToken`.
- **Login**: bỏ chuỗi hardcode `'fcm_token'`, dùng `getStoredFcmFid()`.
- **Kiểu**: `User.fcmToken` → `User.fids`; `CreateGuestOrderPayload.notificationToken` → `notificationFid`.

## Constants / Translation keys mới
- `LOCAL_STORAGE_KEY.fcmFid`

## Lý do
- `getToken` của `firebase@12.18` bị deprecated, Firebase khuyến nghị nhắn tin theo FID; đồng bộ cả hệ thống client + server sang FID.
- Trước đây `PATCH /users/me { fcmToken }` luôn bị server trả 400 (DTO không có field) nên user đã đăng nhập chưa từng được lưu token — nay server nhận `fid`.
- Phụ thuộc thay đổi server cùng ngày (`notificationFid`, `fid`, `User.fids`) — phải deploy client và server cùng lúc.
