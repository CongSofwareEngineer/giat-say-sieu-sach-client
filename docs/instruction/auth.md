# Auth (đăng ký / đăng nhập / token)
> Cập nhật: 2026-10-19

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
- `app/register/actions.ts` — `registerAction` (Server Action: gọi `AuthService.register` + lưu token vào cookie).
- `components/HumanVerification/index.tsx` — khung reCAPTCHA (`config/firebase.ts` → `getFirebaseAuth`).
### Luồng xử lý
1. Mở trang → render reCAPTCHA, khách nhập form + tick captcha (captcha hết hạn thì xóa token, tick lại).
2. Bấm Đăng ký → validate (họ tên, SĐT hợp lệ VN, mật khẩu ≥ `MIN_PASSWORD_LENGTH` (4, giống server và form đổi mật khẩu), xác nhận khớp, captcha). Sai bất kỳ mục nào → không gửi.
3. Gửi `POST /auth/register` `{ name, phone (E.164), password, captchaToken }` (`isUseAuth: false`) qua Server Action `registerAction`.
4. OK → server trả `{ accessToken, refreshToken, user, accessExpire, refreshExpire }` (giống login) → `registerAction` lưu token vào cookie (`saveAuthCookies`, dùng chung với login) → trang gọi `login(user)` và `router.replace('/')` (khách đã đăng nhập luôn). Response thiếu token → `router.replace('/login')`. Lỗi → câu chung `auth.register.error`.
### Translation / Constants
- `auth.register.*` (`passwordMin` nhận `{min}`), `MIN_PASSWORD_LENGTH`. Vào từ Header + link ở `/login`.
### Edge cases / nợ kỹ thuật
- Mọi lỗi server gộp chung một câu (do `BaseAPI` chỉ ném `status`), VD SĐT đã tồn tại cũng chỉ thấy câu chung.
- Sau đăng ký chưa đồng bộ FCM token như trang login (`syncFcmToken`).

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

## 3. Ghi nhớ đăng nhập (`/login`, `zustand/user.ts`)
### Mục đích
Checkbox "Ghi nhớ đăng nhập" (mặc định tích) quyết định phiên có còn sau khi reload trang hay không.
### Entry points
- `app/login/page.tsx` — `formData.rememberMe` (mặc định `true`) → `loginAction(phone, password, rememberMe)` và `login(user, rememberMe)`.
- `app/login/actions.ts` — `saveAuthCookies(auth, rememberMe)`: tích → cookie có `maxAge` theo `accessExpire`/`refreshExpire`; không tích → session cookie (không `maxAge`).
- `zustand/user.ts` — `isRemembered` trong state (không tích = `false`); `login`, `logout`, `setItem`, `onRehydrateStorage`.
### Luồng xử lý
1. **Tích**: như cũ — user lưu localStorage (`user-zustand`), cookie có hạn, reload vẫn đăng nhập.
2. **Không tích**: cookie token là session cookie; user KHÔNG được ghi vào localStorage (`setItem` xóa key thay vì ghi). Đồng thời đặt cờ `sessionStorage[SESSION_ONLY_LOGIN_KEY]`.
3. **Reload trang**: store khởi tạo lại ở trạng thái chưa đăng nhập → `onRehydrateStorage` thấy cờ trong sessionStorage → xóa cờ, xóa cookie `accessToken`/`refreshToken` (`removeCookie`) → coi như đã logout.
4. **Đóng tab/trình duyệt**: sessionStorage mất, session cookie cũng mất.
5. Đăng nhập lại có tích → xóa cờ. `logout()` xóa cờ và đặt `isRemembered` về `true`.
### Translation / Constants
- `auth.login.rememberMe`; `SESSION_ONLY_LOGIN_KEY`, `COOKIES_KEY` (`constants/cookies.ts`).
### Edge cases
- Đăng ký (`registerAction`) không có checkbox nên luôn lưu như "ghi nhớ".
- Người dùng lưu từ phiên cũ (chưa có `isRemembered`) được coi là ghi nhớ (giá trị mặc định `true`).
- Ở server render, `onRehydrateStorage` không đụng `sessionStorage` (guard `typeof window`).

## Liên quan
- `docs/instruction/profile.md` (đổi mật khẩu), `docs/instruction/booking.md` (đặt lịch dùng SĐT E.164).
