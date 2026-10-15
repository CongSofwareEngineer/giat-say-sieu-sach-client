# Profile (khu vực khách hàng `/profile`)
> Cập nhật: 2026-10-15

## Tổng quan
Trang cá nhân của khách đã đăng nhập: thông tin, avatar, sổ địa chỉ, đổi mật khẩu, đơn hàng của tôi, hạng + điểm tích lũy. Kèm chuông thông báo trên Header (mới làm UI). Sub-logic: (1) Hạng khách hàng & điểm, (2) Đổi mật khẩu, (3) Đơn hàng của tôi, (4) Chuông thông báo. Avatar xem `docs/instruction/upload.md`.

## Dùng chung
- `app/profile/page.tsx` — làm mới profile khi vào trang (`GET /users/me` → cập nhật `loyaltyPoints` vào store).
- `app/profile/components/ProfileSidebar.tsx` — menu tab (`orders`, `password`...), gắn `LoyaltyCard`, đổi avatar.
- `services/users/index.ts` — `changePassword`, `updateAvatar`.
- Store `zustand/user.ts` (`useUser`, chờ `hasHydrated`).

## 1. Hạng khách hàng & điểm tích lũy
### Quy tắc
- 1.000đ `finalAmount` (sau giảm giá) = 1 điểm, làm tròn xuống. Điểm **chỉ cộng khi đơn chuyển `COMPLETED`** (BE `awardLoyaltyPoints`, atomic, đánh dấu `loyaltyPointsAwarded`).
- Hạng: Bạc (mặc định), Vàng ≥ 1.000 điểm, Kim cương ≥ 3.000 điểm.
### Entry points
- `constants/app.ts` — `CUSTOMER_TIER`, `CUSTOMER_TIER_MIN_POINTS`; `utils/loyalty.ts` — `getCustomerTier()` (hạng + tiến độ).
- `app/profile/components/LoyaltyCard.tsx` — hiển thị hạng, điểm, thanh tiến độ lên hạng kế.
### Edge cases
- Hạng chỉ tính ở client từ `loyaltyPoints`; đổi ngưỡng chỉ cần sửa `CUSTOMER_TIER_MIN_POINTS`.
- Đơn cũ (cộng điểm lúc tạo theo luật cũ) hoàn thành sau deploy sẽ được cộng thêm — cần script set `loyaltyPointsAwarded: true` nếu muốn chính xác. Xoá đơn đã hoàn thành không trừ điểm.
- Dùng điểm khi đặt / trừ điểm xem `docs/instruction/order.md`.

## 2. Đổi mật khẩu
- `app/profile/components/ChangePasswordForm.tsx`: mật khẩu hiện tại, mới (≥ `MIN_PASSWORD_LENGTH` = 4, khác cũ), xác nhận → `PATCH /users/me/password { currentPassword, newPassword }`.
- Sai mật khẩu cũ BE trả **400** (không phải 401, tránh FE tự refresh + retry) → hiện "Mật khẩu hiện tại không đúng".
- Tài khoản guest (tạo khi đặt không login) không có mật khẩu.

## 3. Đơn hàng của tôi
- `app/profile/components/MyOrders.tsx` → `GET /laundry-orders/me` có phân trang (`PAGE_SIZE`), hook `hooks/reactQuery/useGetMyOrders.ts`.
- Mỗi đơn: mã, ngày, trạng thái, dịch vụ/kg, giá (gạch giá gốc nếu giảm), điểm đã dùng, nút "Theo dõi" (`/track-order?code=`), nút "Huỷ đơn" khi `PENDING`.

## 4. Chuông thông báo (UI)
- `components/NotificationBell/index.tsx` (gắn ở `components/Header`): badge chưa đọc (tối đa "9+"), dropdown, empty state, "Đánh dấu đã đọc", click ngoài để đóng.
- Hiện Header truyền `notifications={[]}` → luôn empty. Việc tiếp: BE thêm collection Notification + API; FE viết hook truyền `notifications`, `onMarkAllRead`, `onItemClick`.

## Translation / Constants
- `CUSTOMER_TIER`, `CUSTOMER_TIER_MIN_POINTS`, `MIN_PASSWORD_LENGTH`
- `profile.loyalty.*`, `profile.menu.{orders,password}`, `changePassword.*`, `myOrders.*`, `notification.{title,markAllRead,empty,emptyDesc}`
- Icon: `components/Icons/Bell.tsx`, `Lock.tsx`.

## Liên quan
- `docs/instruction/order.md` (huỷ đơn, điểm), `docs/instruction/auth.md` (đăng ký cũng yêu cầu `MIN_PASSWORD_LENGTH`), `docs/instruction/upload.md` (avatar).
