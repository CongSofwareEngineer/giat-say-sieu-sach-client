# Profile (khu vực khách hàng `/profile`)
> Cập nhật: 2026-10-29

## Tổng quan
Trang cá nhân của khách đã đăng nhập: thông tin, avatar, sổ địa chỉ, đổi mật khẩu, đơn hàng của tôi, hạng + điểm tích lũy. Kèm chuông thông báo trên Header (mới làm UI). Sub-logic: (1) Hạng khách hàng & điểm, (2) Đổi mật khẩu, (3) Đơn hàng của tôi, (4) Chuông thông báo, (5) Dữ liệu Tỉnh/Xã (proxy esgoo), (6) Sổ địa chỉ, (7) Thông tin cá nhân (tên + email), (8) Giới thiệu bạn bè (link `?ref=` + hoa hồng). Avatar xem `docs/instruction/upload.md`.

## Dùng chung
- `app/profile/page.tsx` — làm mới profile khi vào trang (`GET /users/me` → cập nhật `loyaltyPoints`, `mustChangePassword` vào store); còn `mustChangePassword` → tự mở tab `password`.
- `app/profile/components/ProfileSidebar.tsx` — menu tab (`info`, `addresses`, `orders`, `referrals`, `password`), gắn `LoyaltyCard`, đổi avatar. `referrals` là trang riêng `/profile/referrals` (§8); các mục khác là tab của `/profile`.
- `/profile?tab=<tab>` (`PROFILE_TAB_QUERY`) mở sẵn tab đó — dùng khi bấm menu từ trang giới thiệu quay lại.
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
- Mỗi đơn: mã, ngày, trạng thái, dịch vụ/kg, giá (gạch giá gốc nếu giảm), điểm đã dùng, và các nút:
  - "Huỷ đơn" khi `PENDING`;
  - "Đánh giá" khi `COMPLETED` và `isReviewed` = false; đã đánh giá thì hiện chữ "Đã đánh giá" (xem `docs/instruction/comment.md` §7);
  - "Hoá đơn" — modal biên nhận, in / lưu PDF (xem `docs/instruction/order.md` §7);
  - "Theo dõi" (`/track-order?code=`).

## 4. Chuông thông báo (UI)
- `components/NotificationBell/index.tsx` (gắn ở `components/Header`): badge chưa đọc (tối đa "9+", ưu tiên prop `unreadCount` từ server), dropdown, empty state, "Đánh dấu đã đọc", click ngoài hoặc click một mục để đóng.
- Dữ liệu thật từ `GET /notifications/me` — luồng đầy đủ xem `docs/instruction/notifications.md` §4.

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

## 8. Giới thiệu bạn bè (`/profile/referrals`)
### Mục đích
Mỗi khách có một link riêng `https://giatuisieusach.vercel.app/?ref=<mã>`. Người mới tạo tài khoản / đặt lịch lần đầu từ link được ghi nhận là "người được giới thiệu". **Mỗi đơn** của họ chuyển `COMPLETED`, người giới thiệu được cộng **5% `finalAmount` quy ra điểm** (`floor(finalAmount × 5% / 1.000)`, vd đơn 200.000đ → 10 điểm). Người được giới thiệu **không** được thưởng gì thêm, đặt đơn / tích điểm như bình thường.
### Entry points
- `components/ReferralTracker/index.tsx` (gắn trong `app/layout.tsx`) — mỗi lần đổi trang đọc `?ref=` → `saveReferralCode` vào localStorage (`LOCAL_STORAGE_KEY.referralCode`). Link mới luôn **ghi đè** mã cũ.
- `utils/referral.ts` — `parseReferralCode` (chữ/số, ≤ `REFERRAL.CODE_MAX_LENGTH`), `getStoredReferralCode`, `saveReferralCode`, `clearReferralCode`, `buildReferralLink`.
- Gửi mã lên server (field `referralCode`):
  - Đăng ký thường: `app/register/page.tsx` → `registerAction(..., referralCode)` → `POST /auth/register`. Form hiện dòng `referral.register.invitedBy` khi có mã.
  - Google: `GoogleLoginButton` → `googleLoginAction(token, phone, password, referralCode)` → `POST /auth/google`.
  - Đặt lịch không đăng nhập (trang `/booking` + form trong chat, cùng dùng `createLaundryBooking` ở `agents/tools/booking.ts`) → `POST /laundry-orders/guest`.
  - Mã **chỉ bị xoá khi bấm Đăng xuất** (`clearReferralCode()` trong `handleLogout` của `components/Header` và nút đăng xuất của `app/admin/AdminShell.tsx`). Đăng ký / Google / đặt lịch guest thành công, đang login hay chưa login → giữ nguyên mã. Hết phiên tự động (`handleSessionExpired`) cũng không xoá.
- Trang `app/profile/referrals/page.tsx` (cần đăng nhập, chưa login → `/login`) + `components/`:
  - `ReferralLinkCard` — link + nút Sao chép / Chia sẻ (`navigator.share`, không có thì sao chép) / Facebook (`SHARE_URL.FACEBOOK`), 3 ô thống kê (người đã giới thiệu, đơn có hoa hồng, tổng điểm hoa hồng), thể lệ.
  - `RefereeList` — bảng người đã giới thiệu: tên + SĐT che (`090...567`), ngày tham gia, số đơn hoàn thành, tổng hoa hồng. Phân trang.
  - `CommissionHistory` — lịch sử hoa hồng: mã đơn + tên người được giới thiệu, ngày, giá trị đơn, điểm nhận. Phân trang.
- `services/referral.ts` (`ReferralService`, endpoint `referrals`, auth): `getSummary` (`GET /referrals/me`), `getReferees` (`GET /referrals/me/referees`), `getCommissions` (`GET /referrals/me/commissions`).
- `hooks/reactQuery/useGetReferrals.ts` — `useGetReferralSummary`, `useGetReferees(page)`, `useGetReferralCommissions(page)` (`QUERY_KEYS.getReferralSummary | getReferees | getReferralCommissions`, `REFERRAL.PAGE_SIZE` = 10).
### Luồng xử lý
1. Khách A mở `/profile/referrals` → `GET /referrals/me` (lần đầu server tự sinh mã 6 ký tự cho A) → hiện link.
2. B mở link của A → mã lưu ở localStorage của B.
3. B đăng ký / đăng nhập Google lần đầu / đặt lịch guest → mã gửi kèm → server gán `B.referredBy = A` **chỉ khi tạo tài khoản mới**.
4. Đơn của B → `COMPLETED` → server cộng điểm hoa hồng cho A + ghi lịch sử → hiện ở 2 bảng.
### Translation / Constants
- `referral.*` (`title`, `subtitle`, `yourLink`, `code`, `copy`, `share`, `shareFacebook`, `shareTitle`, `shareText`, `loadError`, `pointsValue`, `stats.*`, `rules.*`, `referees.*`, `commissions.*`, `register.invitedBy`), `profile.menu.referrals`.
- `REFERRAL` (`QUERY_PARAM`, `COMMISSION_RATE` — phải khớp server, `CODE_MAX_LENGTH`, `CODE_REGEX`, `PAGE_SIZE`), `SHARE_URL`, `PROFILE_PATH`, `PROFILE_REFERRALS_PATH`, `PROFILE_TAB_QUERY`, `LOCAL_STORAGE_KEY.referralCode`.
- Icon `components/Icons/Gift.tsx` (menu).
### Edge cases
- SĐT đã có tài khoản (kể cả tài khoản guest tạo khi đặt lịch trước đó) → không tính là được giới thiệu, dù có mã.
- Mã sai / không tồn tại → server bỏ qua, đăng ký vẫn thành công.
- Người được giới thiệu chỉ gán một lần, không đổi sau đó.
- Đơn quá nhỏ (< 20.000đ) → hoa hồng 0 điểm, vẫn có dòng lịch sử.
- Trang `noindex` (layout `/profile`) và nằm trong `PRIVATE_PATHS` của `next-sitemap.config.js` (`/profile/*`).
- Server xử lý chi tiết: repo `server-giat-say-sieu-sach-nestjs` (`docs/instruction/order.md` §6).

## Translation / Constants
- `ALLOWED_ORIGINS`, `LOCATION_API`
- `CUSTOMER_TIER`, `CUSTOMER_TIER_MIN_POINTS`, `MIN_PASSWORD_LENGTH`
- `profile.addresses.*`, `profile.loyalty.*`, `profile.menu.{orders,referrals,password}`, `referral.*` (§8), `changePassword.*`, `myOrders.*`, `notification.{title,markAllRead,empty,emptyDesc}`
- Icon: `components/Icons/Bell.tsx`, `Lock.tsx`.

## Liên quan
- `docs/instruction/order.md` (huỷ đơn, điểm), `docs/instruction/auth.md` (§1, §6 gửi kèm `referralCode`) (đăng ký cũng yêu cầu `MIN_PASSWORD_LENGTH`), `docs/instruction/upload.md` (avatar).
