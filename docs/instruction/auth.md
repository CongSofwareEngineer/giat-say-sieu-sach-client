# Auth (đăng ký / đăng nhập / token)
> Cập nhật: 2026-10-02

## Tổng quan
Xác thực khách hàng bằng **họ tên + số điện thoại + mật khẩu**. Token (access/refresh) lưu ở httpOnly cookie, chỉ đọc/ghi qua server actions trong `utils/cookie.ts` (`COOKIES_KEY`). Trạng thái đăng nhập là store Zustand `zustand/user.ts` (`useUser`). Sub-logic: (1) Đăng ký, (2) Tự refresh token + báo hết hạn.

## Dùng chung
- `config/baseApi.ts` — `BaseAPI` ghép URL, gắn header, ném `HttpError` (giữ `status`).
- `services/auth/index.ts` — `AuthService.register`, login; `services/auth/type.ts` — kiểu `Auth` (token).
- `utils/phone.ts` — `formatPhoneToE164`, `isValidVnPhone`, `normalizeVnPhone` (nhận `+84` / `84` / `0`).
- Translation: nhóm `auth.*` (`vn.json`/`en.json`).

## 1. Đăng ký (`/register`)
### Mục đích
Khách tự tạo tài khoản, có reCAPTCHA của Firebase ("tôi không phải robot").
### Entry points
- `app/register/page.tsx` — form, state, validate, submit; `app/register/layout.tsx` — metadata (`noindex`).
- `app/register/actions.ts` — `registerAction` (bọc `AuthService.register`; chưa phải Server Action thật, chạy ở client).
- `components/HumanVerification/index.tsx` — khung reCAPTCHA (`config/firebase.ts` → `getFirebaseAuth`).
### Luồng xử lý
1. Mở trang → render reCAPTCHA, khách nhập form + tick captcha (captcha hết hạn thì xóa token, tick lại).
2. Bấm Đăng ký → validate (họ tên, SĐT hợp lệ VN, mật khẩu, xác nhận khớp, captcha).
3. Gửi `POST /auth/register` `{ name, phone, password, captchaToken }` (`isUseAuth: false`).
4. OK → `router.replace('/login')`. Lỗi → câu chung `auth.register.error`.
### Translation / Constants
- `auth.register.*`. Vào từ Header + link ở `/login`.
### Edge cases / nợ kỹ thuật
- Mật khẩu < 6 ký tự có hiện lỗi `passwordMin` nhưng **không chặn submit** (thiếu `isValid = false`).
- SĐT gửi lên **đúng như khách gõ** (chưa chuẩn hóa E.164 ở bước này) — server cần tự chuẩn hóa.
- Mọi lỗi server gộp chung một câu (do `BaseAPI` chỉ ném `status`).
- API trả token nhưng client **không tự đăng nhập**.
- Form register yêu cầu tối thiểu 6 ký tự trong khi server yêu cầu 8 → cần đồng bộ.

## 2. Refresh token & hết hạn đăng nhập (`config/baseApi.ts`)
### Mục đích
Mọi API `isUseAuth` luôn gắn `accessToken`; thiếu/hết hạn thì dùng `refreshToken` lấy token mới rồi gọi tiếp. Không còn `refreshToken` (hoặc server từ chối) → tự logout + báo đăng nhập lại.
### Entry points
- `BaseAPI.getAuthToken` / `renewAccessToken` / `handleSessionExpired`.
- `app/api/auth-proxy/[...path]/route.ts` — proxy cũng gửi refresh token qua header `Authorization`.
### Luồng xử lý
1. `getAuthToken`: còn hạn (đọc `exp` JWT, trừ hao 5s) → dùng luôn; ngược lại → `renewAccessToken`.
2. `renewAccessToken`: không có refresh token → `handleSessionExpired`, trả `null`. Có → `POST /auth/refresh` với header `Authorization: Bearer <refreshToken>` (KHÔNG gửi trong body); nhiều request cùng refresh chia sẻ 1 promise; lưu token mới vào cookie.
3. API trả 401 (request `isUseAuth`) → gọi lại `renewAccessToken` và retry 1 lần.
4. `handleSessionExpired` (chỉ client, chỉ khi `isLogin`): `user.logout()` + toast `auth.sessionExpired`. **Không xóa cookie** (cookie chỉ xóa khi user bấm Đăng xuất ở `components/Header`).
### Translation / Constants
- `auth.sessionExpired`; `COOKIES_KEY`.
### Edge cases
- Refresh lỗi 401/403 → session expired; lỗi mạng/khác → bỏ qua, không logout.
- Refresh token bị thu hồi: mỗi request auth sau đó vẫn thử refresh 1 lần rồi thất bại (user đã logout nên không toast lặp).
- Server component: `handleSessionExpired` không làm gì (không có `window`). Không tự redirect `/login`.

## Liên quan
- `docs/instruction/profile.md` (đổi mật khẩu), `docs/instruction/booking.md` (đặt lịch dùng SĐT E.164).
