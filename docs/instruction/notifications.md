# Notifications (Firebase Cloud Messaging)
> Cập nhật: 2026-10-29

## Tổng quan
Nhận push notification qua Firebase Cloud Messaging (FCM). Thiết bị được định danh bằng **FID** (Firebase Installation ID) qua `register()` + `onRegistered()` của `firebase/messaging`, **không dùng** `getToken()` (đã deprecated). Server (NestJS) lưu FID vào `User.fids` và gửi push theo FID.

Sub-logic: (1) Đăng ký FID, (2) Đồng bộ FID lên server, (3) Nhận tin khi đang mở web, (4) Chuông thông báo (hộp thư trong web).

## Dùng chung
- `services/notification.ts` — `NotificationService` (singleton qua `initNotificationService(vapidKey)`): `requestPermission`, `getFid`, `setFidListener`, `onMessage`.
- `hooks/useNotifications.ts` — hook `useNotifications(vapidKey)` trả về `permission`, `fid`, `isSupported`, `requestPermission`, `getFid`, `getStoredFid`, `clearFid`, `onMessage`; helper `getStoredFcmFid()` dùng được ngoài React (booking tool, login).
- `components/NotificationProvider` — gắn ở layout, hiện banner xin quyền và điều phối các bước dưới.
- `config/firebase.ts` — `getFirebaseMessaging()`; service worker phục vụ ở `/firebase-messaging-sw.js` (`app/firebase-messaging-sw.js/route.ts`).
- Constant: `LOCAL_STORAGE_KEY.fcmFid` (`constants/app.ts`) — FID của thiết bị; `NOTIFICATION_TYPE`, `NOTIFICATION_INBOX`, `TRACK_ORDER_PATH` — chuông thông báo (§4).
- `NotificationInboxService` (`services/notification.ts`) + hook `hooks/reactQuery/useGetNotifications.ts`, key `QUERY_KEYS.getNotifications` — chuông thông báo (§4).
- Env: `NEXT_PUBLIC_FIREBASE_VAPID_KEY`, `NEXT_PUBLIC_FIREBASE_*`.

## 1. Đăng ký FID
### Mục đích
Đăng ký thiết bị với FCM và lấy FID làm đích nhận push.

### Entry points
- `NotificationService.getFid()` — gọi từ `useNotifications().getFid()`.
- `NotificationProvider`: tự gọi khi `Notification.permission === 'granted'`, hoặc sau khi user bấm cho phép trên banner.

### Luồng xử lý
1. Lần đầu gọi `getFid()`, service gắn **một** handler `onRegistered` tồn tại suốt vòng đời app (bắt buộc phải có trước `register()`).
2. `register(messaging, { vapidKey })` → Firebase gọi handler với FID → service lưu `this.fid` và gọi `fidListener`.
3. `useNotifications` đặt `fidListener`: lưu FID vào state + `localStorage[LOCAL_STORAGE_KEY.fcmFid]`.
4. `getFid()` resolve FID (hoặc `null` nếu lỗi / không hỗ trợ).
5. Khi FID bị Firebase xoay vòng, SDK tự chạy lại `register` → handler nhận FID mới → localStorage được cập nhật.

### Edge cases
- Trình duyệt không có `Notification` / `serviceWorker` → `isSupported = false`, banner không hiện.
- Quyền `denied` hoặc `register` lỗi → `getFid()` trả `null`, banner về `idle`.
- localStorage bị chặn → FID chỉ nằm trong state phiên hiện tại.
- Gọi `register` nhiều lần không tốn request: SDK chỉ sync lại khi FID đổi hoặc quá 7 ngày.

## 2. Đồng bộ FID lên server
### Mục đích
Gắn FID vào user trên server để server gửi push đúng người.

### Entry points
- `UserService.updateFcmFid(fid)` → `PATCH /users/me { fid }` (cần đăng nhập). Server **thêm** FID vào `User.fids` (không ghi đè) và gỡ FID đó khỏi user khác.
- Đặt đơn khách: `createGuestOrder({ ..., notificationFid })` (`agents/tools/booking.ts`, dùng chung cho form booking và chat) → server gắn FID cho user theo số điện thoại.

### Luồng xử lý
- Đăng nhập thành công (`app/login/page.tsx`, `syncFcmFid`) → nếu có FID đã lưu thì gọi `updateFcmFid`.
- `NotificationProvider`: khi `hasHydrated && isLogin` và có FID đã lưu → `updateFcmFid`; khi user vừa cho phép trên banner và đang đăng nhập → `updateFcmFid` với FID mới.
- Đặt đơn khách: gửi `notificationFid` nếu localStorage có FID.

### Edge cases
- Mọi lỗi sync đều im lặng (không toast) — push là tính năng phụ.
- FID xoay vòng khi đang đăng nhập chỉ được sync ở lần tải trang / đăng nhập kế tiếp.
- Token FCM cũ (`fcm_token`) không còn dùng; thiết bị cũ tự đăng ký FID mới khi mở web.

## 3. Nhận tin khi đang mở web
### Mục đích
Hiện thông báo dạng toast khi push tới lúc user đang xem trang.

### Luồng xử lý
`NotificationProvider` → `onMessage(payload)`:
1. Làm mới `QUERY_KEYS.getNotifications` (chuông) và `QUERY_KEYS.getMyOrders` (trạng thái đơn) ngay.
2. Nếu có `notification.title`/`body` thì `toast.addToast({ type: 'default', duration: 5000 })`.

Khi tab đóng/ẩn, service worker hiển thị notification hệ thống. Click: push đổi trạng thái đơn có `webpush.fcmOptions.link` (server gửi) → Firebase SDK tự mở `/track-order?code=…`; push không có link → handler `notificationclick` mở `data.link` hoặc trang chủ.

### Translation / Constants
- Banner: `notification.requestPermission.title`, `.message`, `.allowButton`, `.denyButton`.

## 4. Chuông thông báo (hộp thư trong web)
### Mục đích
Khách đã đăng nhập xem lại lịch sử cập nhật đơn (đã lấy đồ, đang giặt, xong, huỷ…) ngay trên Header, kể cả khi không bật push.

### Entry points
- `components/Header/index.tsx` — gọi `useGetNotifications()`, dựng text theo ngôn ngữ, truyền vào `components/NotificationBell` (`notifications`, `unreadCount`, `onMarkAllRead`, `onItemClick`). Chỉ hiện khi `hasHydrated && isLogin`.
- `NotificationInboxService` (`services/notification.ts`, endpoint `notifications`, đều `isUseAuth: true`):
  - `getMine({ page, limit })` → `GET /notifications/me` → `{ data: InboxNotification[], meta: { …, unreadCount } }`;
  - `markRead(id)` → `PATCH /notifications/me/:id/read`;
  - `markAllRead()` → `PATCH /notifications/me/read-all`.

### Luồng xử lý
1. Server tự tạo thông báo mỗi khi admin đổi trạng thái đơn (và gửi push nếu khách có FID) — xem server `docs/instruction/notifications.md`.
2. Hook lấy `NOTIFICATION_INBOX.pageSize` (20) thông báo mới nhất; tự làm mới mỗi `NOTIFICATION_INBOX.refetchIntervalMs` (60s, chỉ khi tab đang mở) và ngay khi có push (§3).
3. Server chỉ trả `type` + `data { orderId, orderCode, status }`. Header dịch thành `notification.types.<type>.<status>.{title,body}` với `{code}` = mã đơn → đổi ngôn ngữ là đổi luôn text cũ.
4. Badge dùng `meta.unreadCount` (tổng chưa đọc trên server, không chỉ trang đầu), tối đa "9+".
5. Bấm một thông báo → đóng dropdown, `markRead` nếu chưa đọc, chuyển tới `${TRACK_ORDER_PATH}?code=<mã đơn>`. "Đánh dấu đã đọc" → `markAllRead`. Mutation xong thì làm mới danh sách.

### Translation / Constants
- `notification.{title,markAllRead,empty,emptyDesc}`, `notification.types.ORDER_STATUS.<PENDING|RECEIVED|WASHING|DRYING|READY|COMPLETED|CANCELLED>.{title,body}`.
- `NOTIFICATION_TYPE.ORDER_STATUS`, `NOTIFICATION_INBOX`, `TRACK_ORDER_PATH`, `QUERY_KEYS.getNotifications`.

### Edge cases
- Lỗi API → danh sách rỗng (empty state), không toast.
- Server xoá thông báo cũ hơn 90 ngày (TTL index).
- Đơn chưa có mã (đơn cũ chưa backfill) → `{code}` rỗng và bấm vào không chuyển trang.
- Chỉ có đơn đổi trạng thái bởi admin mới sinh thông báo; khách tự huỷ đơn thì không.

## Liên quan
- `docs/instruction/auth.md` — đăng nhập (gọi sync FID).
- `docs/instruction/chat.md` — booking tool gửi `notificationFid`.
- Server: `docs/instruction/notifications.md` của repo `server-giat-say-sieu-sach-nestjs`.
