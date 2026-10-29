# Notifications — chuông thông báo dùng dữ liệu thật

- Ngày: 2026-10-29
- Feature: notifications (→ docs/instruction/notifications.md)
- Loại: Added, Fixed
- File: `services/notification.ts`, `hooks/reactQuery/useGetNotifications.ts`, `components/Header/index.tsx`, `components/NotificationBell/index.tsx`, `components/NotificationProvider/index.tsx`, `app/firebase-messaging-sw.js/route.ts`, `constants/app.ts`, `constants/reactQuery.ts`, `public/assets/language/vn.json`, `public/assets/language/en.json`

## Thay đổi
- **Chuông thông báo** (§4): Header lấy `GET /notifications/me`, dịch từ `type` + `data` theo ngôn ngữ hiện tại, badge theo `meta.unreadCount`. Bấm mục → đánh dấu đã đọc + mở `/track-order?code=`; "Đánh dấu đã đọc" → `PATCH /notifications/me/read-all`. Làm mới mỗi 60s và ngay khi có push.
- **NotificationBell**: thêm prop `unreadCount`, đóng dropdown khi bấm một mục.
- **Nhận push khi đang mở web** (§3): làm mới chuông + "Đơn hàng của tôi".
- **Service worker**: sửa handler `notificationclick` dùng biến `payload` không tồn tại (lỗi → không mở được trang); giờ mở `data.link` hoặc trang chủ.

## Constants / Translation keys mới
- `NOTIFICATION_TYPE`, `NOTIFICATION_INBOX`, `TRACK_ORDER_PATH`, `QUERY_KEYS.getNotifications`
- `notification.types.ORDER_STATUS.<status>.{title,body}`

## Lý do
- Chuông trước đây luôn trống (`notifications={[]}`); khách không xem lại được cập nhật đơn.
