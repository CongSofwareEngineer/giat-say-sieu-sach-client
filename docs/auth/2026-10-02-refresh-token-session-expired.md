# Tự động refresh token & báo hết hạn đăng nhập

- Ngày: 2026-10-02
- Phạm vi: auth / `config/baseApi.ts`

## Mục đích
- Mọi API cần auth (`isUseAuth`) luôn gắn `accessToken`; nếu thiếu/hết hạn thì dùng `refreshToken` lấy token mới rồi gọi tiếp.
- Khi không còn `refreshToken` (hoặc server từ chối refresh) thì tự logout và báo user đăng nhập lại.
- Tuyệt đối không tự xóa cookie `accessToken` / `refreshToken` trong `baseApi` (trước đây refresh lỗi là xóa cả 2 token).

## Luồng xử lý
1. `request()` với `isUseAuth` gọi `getAuthToken()`:
   - Có `accessToken` còn hạn (đọc `exp` trong JWT, trừ hao 5s) → dùng luôn.
   - Ngược lại → `renewAccessToken()`.
2. `renewAccessToken()`:
   - Không có `refreshToken` → `handleSessionExpired()` và trả `null`.
   - Gọi `POST /auth/refresh` (dùng chung 1 promise khi nhiều request cùng refresh) → lưu token mới vào cookie → trả `accessToken` mới.
   - Refresh lỗi 401/403 → `handleSessionExpired()`. Lỗi mạng/lỗi khác → bỏ qua, không logout.
3. Nếu API trả 401 (với request có `isUseAuth`) → gọi lại `renewAccessToken()` và retry 1 lần với token mới.
4. `handleSessionExpired()` (chỉ chạy ở client, chỉ khi `isLogin = true` để tránh toast trùng): gọi `logout()` của zustand user + toast warning `auth.sessionExpired`. Không xóa cookie.

## File liên quan
- `config/baseApi.ts` — logic lấy/refresh token, retry 401, xử lý hết hạn đăng nhập
- `public/assets/language/vn.json`, `en.json` — thông báo hết hạn đăng nhập

## Constants / Translation keys mới
- `auth.sessionExpired`

## Lưu ý
- Đã bỏ `clearTokens()` trong `baseApi`; cookie chỉ bị xóa khi user tự bấm Đăng xuất (`components/Header`).
- Vì không xóa cookie, nếu `refreshToken` đã bị server thu hồi thì mỗi request auth sau đó vẫn thử refresh 1 lần rồi thất bại (user đã ở trạng thái logout nên không hiện toast lặp lại).
- Không tự redirect sang `/login`; các trang cần đăng nhập tự xử lý theo `isLogin`.
- Ở server component, `handleSessionExpired()` không làm gì (không có `window`).
