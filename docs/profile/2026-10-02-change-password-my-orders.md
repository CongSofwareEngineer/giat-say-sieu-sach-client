# Đổi mật khẩu, tab "Đơn hàng của tôi", chuông thông báo (UI)

- Ngày: 2026-10-02
- Phạm vi: profile, header (FE) + user (BE `server-giat-say-sieu-sach-nestjs`)

## Mục đích
- User tự đổi mật khẩu trong trang cá nhân.
- User xem lịch sử đơn và huỷ đơn vừa đặt ngay trong profile.
- Có chuông thông báo trên header để sau này hiện thông báo mới (hiện tại chỉ làm UI).

## Luồng xử lý
1. **Đổi mật khẩu**
   - Profile → tab "Đổi mật khẩu": nhập mật khẩu hiện tại, mật khẩu mới (≥ `MIN_PASSWORD_LENGTH` = 8, khác mật khẩu cũ), xác nhận.
   - FE gọi `PATCH /users/me/password` `{ currentPassword, newPassword }`.
   - BE dùng hàm có sẵn `updatePassword` (Argon2id). Sai mật khẩu cũ trả **400** (không phải 401) để FE không tự refresh token rồi gửi lại request → FE hiện "Mật khẩu hiện tại không đúng".
2. **Đơn hàng của tôi**
   - Profile → tab "Đơn hàng của tôi" (`MyOrders.tsx`) gọi `GET /laundry-orders/me` có phân trang (`PAGE_SIZE`).
   - Mỗi đơn: mã, ngày, trạng thái, dịch vụ/kg, giá (gạch giá gốc nếu có giảm), số điểm đã dùng, nút "Theo dõi" (sang `/track-order?code=`), nút "Huỷ đơn" khi `PENDING`.
3. **Chuông thông báo**
   - `components/NotificationBell` hiển thị cho user đã đăng nhập: badge số chưa đọc (tối đa "9+"), dropdown danh sách, empty state, nút "Đánh dấu đã đọc", click ra ngoài để đóng.
   - Header đang truyền `notifications={[]}` → luôn hiện empty state.

## File liên quan
- BE `src/module/user/user.controller.ts` — endpoint `PATCH /users/me/password`
- BE `src/module/user/dto/change-password.dto.ts` — DTO (mới)
- BE `src/module/user/user.service.ts` — sai mật khẩu cũ trả 400
- BE `src/utils/password.ts` — `PASSWORD_ERRORS.CURRENT_INVALID`
- `app/profile/components/ChangePasswordForm.tsx` — form đổi mật khẩu
- `app/profile/components/MyOrders.tsx` — danh sách đơn của tôi
- `app/profile/components/ProfileSidebar.tsx`, `app/profile/page.tsx` — thêm tab `orders`, `password`
- `components/NotificationBell/index.tsx` — chuông thông báo (UI)
- `components/Header/index.tsx` — gắn chuông
- `components/Icons/Bell.tsx`, `components/Icons/Lock.tsx` — icon mới
- `services/users/index.ts` — `changePassword`

## Constants / Translation keys mới
- `MIN_PASSWORD_LENGTH`
- `profile.menu.orders|password`, `changePassword.*`, `myOrders.*`, `notification.title|markAllRead|empty|emptyDesc`

## Lưu ý
- **Việc tiếp theo cho chuông**: BE thêm collection Notification + API danh sách / đánh dấu đã đọc, lưu thông báo khi đơn đổi trạng thái; FE viết hook truyền `notifications`, `onMarkAllRead`, `onItemClick` vào `NotificationBell`.
- Tài khoản guest (tạo khi đặt không đăng nhập) không có mật khẩu nên không đăng nhập/đổi mật khẩu được.
- Form đăng ký đang kiểm tra tối thiểu 6 ký tự trong khi server yêu cầu 8 — nên sửa đồng bộ sau.
