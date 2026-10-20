# Profile (khu vực khách hàng `/profile`)
> Cập nhật: 2026-10-20

## Tổng quan
Trang cá nhân của khách đã đăng nhập: thông tin, avatar, sổ địa chỉ, đổi mật khẩu, đơn hàng của tôi, hạng + điểm tích lũy. Kèm chuông thông báo trên Header (mới làm UI). Sub-logic: (1) Hạng khách hàng & điểm, (2) Đổi mật khẩu, (3) Đơn hàng của tôi, (4) Chuông thông báo, (5) Dữ liệu Tỉnh/Xã (proxy esgoo), (6) Sổ địa chỉ, (7) Thông tin cá nhân (tên + email). Avatar xem `docs/instruction/upload.md`.

## Dùng chung
- `app/profile/page.tsx` — làm mới profile khi vào trang (`GET /users/me` → cập nhật `loyaltyPoints`, `mustChangePassword` vào store); còn `mustChangePassword` → tự mở tab `password`.
- `app/profile/components/ProfileSidebar.tsx` — menu tab (`orders`, `password`...), gắn `LoyaltyCard`, đổi avatar.
- `services/users/index.ts` — `changePassword`, `updateAvatar`, `updateProfile`.
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
- Đang dùng mật khẩu tạm do admin cấp (`user.mustChangePassword`) → hiện cảnh báo `changePassword.tempPasswordNotice` trên form; nhập mật khẩu tạm vào ô "Mật khẩu hiện tại". Thành công → `updateUser({ mustChangePassword: false })`. Luồng cấp mật khẩu tạm xem `docs/instruction/auth.md` §5.

## 3. Đơn hàng của tôi
- `app/profile/components/MyOrders.tsx` → `GET /laundry-orders/me` có phân trang (`PAGE_SIZE`), hook `hooks/reactQuery/useGetMyOrders.ts`.
- Mỗi đơn: mã, ngày, trạng thái, dịch vụ/kg, giá (gạch giá gốc nếu giảm), điểm đã dùng, nút "Theo dõi" (`/track-order?code=`), nút "Huỷ đơn" khi `PENDING`.

## 4. Chuông thông báo (UI)
- `components/NotificationBell/index.tsx` (gắn ở `components/Header`): badge chưa đọc (tối đa "9+"), dropdown, empty state, "Đánh dấu đã đọc", click ngoài để đóng.
- Hiện Header truyền `notifications={[]}` → luôn empty. Việc tiếp: BE thêm collection Notification + API; FE viết hook truyền `notifications`, `onMarkAllRead`, `onItemClick`.

## 5. Dữ liệu Tỉnh/Xã (proxy esgoo)
### Mục đích
- API esgoo (`LOCATION_API.upstream`) không trả header CORS → browser không gọi thẳng được. Client gọi route nội bộ `/api/location/...`, server Next gọi esgoo thay.
### Entry points
- `services/location/index.ts` (`LocationService`: `getProvinces`, `getDistricts`, `getFullData`, `getLocationName`) — base là `LOCATION_API.proxy`.
- `app/api/location/[...path]/route.ts` — chỉ `GET`.
- Dùng bởi `useGetProvinces`, `useGetWards`, `app/profile/components/AddressForm.tsx`, form đặt lịch trong chat (xem `docs/instruction/chat.md` §3).
### Luồng xử lý
1. Kiểm tra request: `Sec-Fetch-Site` phải là `same-origin` và origin (lấy từ `Origin`, không có thì từ `Referer`) thuộc `ALLOWED_ORIGINS` → sai trả 403.
2. Path phải khớp `LOCATION_API.pathRegex` (`<1|2|4|5>/<id>.htm`) → sai trả 404 (không cho dùng làm open proxy).
3. Fetch esgoo với `next.revalidate = LOCATION_API.cacheSeconds` (24h) → mỗi path chỉ gọi esgoo tối đa 1 lần/24h dù bao nhiêu client.
4. Trả JSON với `Cache-Control: private, max-age=24h` (browser cache; `private` để CDN không trả bản cache cho request chưa qua kiểm tra).
### Edge cases
- esgoo lỗi / mạng lỗi → 502.
- Chặn được web khác gọi qua browser và bot không giả header. Server cố tình giả `Sec-Fetch-Site`/`Referer` vẫn qua được, nhưng nhờ cache esgoo không bị quá tải.
- `LocationService` dùng URL tương đối → chỉ gọi ở client.

## 6. Sổ địa chỉ
### Mục đích
Khách thêm / sửa / xoá / đặt mặc định địa chỉ giao nhận đồ, dùng lại khi đặt lịch.
### Entry points
- `app/profile/components/AddressBook.tsx` (danh sách + mở modal qua `useModalDrawer`), `AddressForm.tsx` (form thêm/sửa dùng chung), `AddressCard.tsx`, `DeleteAddressConfirm.tsx`.
- Hook `hooks/reactQuery/useGetListAddress.ts` (`QUERY_KEYS.getListAddresses`, sync vào store `zustand/address.ts`), service `services/address` (`/addresses/me`, auth).
### Luồng xử lý
1. Form gửi `{ phone, address, district, city, isDefault }` — **không có `recipientName`** (server để optional).
2. `phone` được chuẩn hoá bằng `normalizeVnPhone` (về dạng `0xxxxxxxxx`) trước khi gửi, vì server (`IsPhoneNumber('VN')`) từ chối dạng `84xxx` không có dấu `+`.
3. `POST /addresses/me` (thêm) hoặc `PATCH /addresses/me/:id` (sửa) → thành công thì invalidate `getListAddresses` và đóng modal.
### Edge cases
- Lỗi request → hiện `profile.addresses.errors.save` trong form, modal không đóng.
- Địa chỉ đầu tiên luôn được server đặt mặc định; địa chỉ đang mặc định thì checkbox "mặc định" bị khoá.
- Tỉnh/Xã lấy từ §5; nếu tên tỉnh cũ không còn trong danh sách mới thì select trống, cần chọn lại.

## 7. Thông tin cá nhân (tên + email)
### Entry points
- `app/profile/components/ProfileInfoForm.tsx` → `UserService.updateProfile` (`PATCH /users/me`).
### Luồng xử lý
1. Form lấy `name`, `phone`, `email` từ store. **SĐT chỉ hiển thị** (disabled) vì là định danh đăng nhập.
2. Validate: tên bắt buộc; email không bắt buộc nhưng nếu có phải khớp `EMAIL_REGEX`.
3. Gửi `{ name, email }` (email rỗng → `null` = xoá email) → OK thì `updateUser` + hiện "Đã lưu"; lỗi → toast `common.error`.
### Ghi chú
- Email dùng để nhận OTP quên mật khẩu (`docs/instruction/auth.md` §4); **chưa xác minh** email.
- Keys: `profile.info.{emailInvalid,emailHint}`.

## Translation / Constants
- `ALLOWED_ORIGINS`, `LOCATION_API`
- `CUSTOMER_TIER`, `CUSTOMER_TIER_MIN_POINTS`, `MIN_PASSWORD_LENGTH`
- `profile.addresses.*`, `profile.loyalty.*`, `profile.menu.{orders,password}`, `changePassword.*`, `myOrders.*`, `notification.{title,markAllRead,empty,emptyDesc}`
- Icon: `components/Icons/Bell.tsx`, `Lock.tsx`.

## Liên quan
- `docs/instruction/order.md` (huỷ đơn, điểm), `docs/instruction/auth.md` (đăng ký cũng yêu cầu `MIN_PASSWORD_LENGTH`), `docs/instruction/upload.md` (avatar).
