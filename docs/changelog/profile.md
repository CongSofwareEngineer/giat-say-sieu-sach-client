# Profile (khu vực khách hàng `/profile`) — Changelog
> Instruction: docs/instruction/profile.md

## 2026-10-29
- **Đơn hàng của tôi** (§3): thêm nút "Hoá đơn" (mọi đơn) và "Đánh giá" / chữ "Đã đánh giá" (đơn hoàn thành). Chi tiết ở `docs/instruction/order.md` §7 và `docs/instruction/comment.md` §7.
- **Chuông thông báo** (§4): hết là UI-only, dùng dữ liệu thật — xem `docs/instruction/notifications.md` §4.
- **Giới thiệu bạn bè** (§8): mỗi khách có link `/?ref=<mã>`. `ReferralTracker` lưu mã của link mới nhất vào localStorage (ghi đè mã cũ) và gửi kèm khi đăng ký / Google / đặt lịch guest. Mã **chỉ xoá khi bấm Đăng xuất** (Header + admin); đăng ký / Google thành công hay đang login vẫn giữ nguyên. Trang mới `/profile/referrals`: link + copy/chia sẻ, thống kê, bảng người đã giới thiệu, lịch sử hoa hồng (5% giá trị đơn hoàn thành quy ra điểm). Menu profile thêm mục "Giới thiệu bạn bè"; `/profile?tab=` mở sẵn tab.
- **Sitemap**: thêm `/profile/*` vào `PRIVATE_PATHS` để trang giới thiệu không vào sitemap.
- **Constants / keys mới**:
  - `REFERRAL`, `SHARE_URL`, `PROFILE_PATH`, `PROFILE_REFERRALS_PATH`, `PROFILE_TAB_QUERY`, `LOCAL_STORAGE_KEY.referralCode`
  - `QUERY_KEYS.{getReferralSummary,getReferees,getReferralCommissions}`
  - `referral.*`, `profile.menu.referrals`
- **Lý do**:
  - Thêm hoá đơn, đánh giá theo đơn và thông báo cho khách.
  - Khuyến khích khách giới thiệu khách mới: người giới thiệu nhận hoa hồng điểm trên mọi đơn hoàn thành của người được giới thiệu.
  - Mã giới thiệu đã lưu chỉ gắn với phiên trên thiết bị: đăng xuất thì bỏ, còn lại giữ để không mất mã khi khách đăng nhập/đăng ký.

## 2026-10-20
- **Thông tin cá nhân**: form lưu thật qua `PATCH /users/me` `{ name, email }` (email rỗng → `null`), validate email bằng `EMAIL_REGEX`, có ghi chú email dùng để nhận OTP. SĐT chuyển sang chỉ đọc.
- **Đổi mật khẩu**: khi `mustChangePassword` hiện cảnh báo mật khẩu tạm; đổi xong tắt cờ trong store.
- **Trang profile**: đồng bộ `mustChangePassword` từ `GET /users/me` và tự mở tab Đổi mật khẩu khi còn cờ.
- **Constants / keys mới**:
  - `EMAIL_REGEX`; `profile.info.{emailInvalid,emailHint}`, `changePassword.tempPasswordNotice`
- **Lý do**:
  - Bug: form thông tin chỉ giả lập lưu (`setTimeout`), email không bao giờ lên server → không dùng được cho quên mật khẩu.
  - Hỗ trợ luồng admin cấp mật khẩu tạm (`docs/instruction/auth.md` §5).

## 2026-10-19
- **Sổ địa chỉ**: thêm/sửa địa chỉ chuẩn hoá số điện thoại bằng `normalizeVnPhone` (dạng `0xxxxxxxxx`) trước khi gửi lên server.
- Server (`server-giat-say-sieu-sach-nestjs`) đổi `recipientName` thành optional → client thêm địa chỉ mới được (trước đó luôn lỗi 400).
- **Constants / keys mới**:
  - Không
- **Lý do**:
  - Không thêm được địa chỉ: server bắt buộc `recipientName` trong khi form client đã bỏ field này → `Recipient name must be a string` (400).
  - Số dạng `84xxx` qua được validate của client nhưng bị server từ chối.

## 2026-10-18
- **Dữ liệu Tỉnh/Xã**: thêm route proxy `GET /api/location/<level>/<id>.htm`. `LocationService` gọi qua proxy thay vì gọi thẳng esgoo.
- Proxy chỉ nhận request same-origin từ `ALLOWED_ORIGINS` (`Sec-Fetch-Site` + `Origin`/`Referer`), whitelist path bằng regex, cache dữ liệu esgoo 24h trên server.
- **Constants / keys mới**:
  - `ALLOWED_ORIGINS`, `LOCATION_API` (`constants/app.ts`)
- **Lý do**:
  - esgoo không trả header CORS → browser chặn khi gọi từ client. Giới hạn origin + cache để tránh bị spam làm quá tải.

## 2026-10-02
- **Hạng & điểm**: 1.000đ = 1 điểm, chỉ cộng khi đơn `COMPLETED` (trước cộng lúc tạo đơn, 1 điểm/10.000đ — đã bỏ). Hạng Bạc / Vàng (≥ 1.000) / Kim cương (≥ 3.000), hiển thị bằng `LoyaltyCard`. Vào `/profile` gọi `GET /users/me` để cập nhật điểm.
- **Đổi mật khẩu**: tab mới, `PATCH /users/me/password`; sai mật khẩu cũ trả 400.
- **Đơn hàng của tôi**: tab mới, danh sách phân trang + nút Theo dõi / Huỷ (`PENDING`).
- **Chuông thông báo**: UI `NotificationBell` trên Header (chưa có dữ liệu thật).
- **Constants / keys mới**:
  - `CUSTOMER_TIER`, `CUSTOMER_TIER_MIN_POINTS`, `MIN_PASSWORD_LENGTH`
  - `profile.loyalty.{tier,points,tiers.*,toNextTier,topTier,earnRule}`, `profile.menu.{orders,password}`, `changePassword.*`, `myOrders.*`, `notification.{title,markAllRead,empty,emptyDesc}`
- **Lý do**:
  - Thưởng điểm + xếp hạng thành viên; cho khách tự đổi mật khẩu và xem/huỷ đơn trong profile; chuẩn bị chỗ cho thông báo.
