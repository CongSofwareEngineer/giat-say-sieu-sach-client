# Auth (đăng ký / đăng nhập / token) — Changelog
> Instruction: docs/instruction/auth.md

## 2026-10-29
- **Đăng nhập Google** (§6): nút "Tiếp tục với Google" ở `/login` và `/register` (Firebase `signInWithPopup`) → `googleLoginAction` → `POST /auth/google`. Lần đầu bắt nhập SĐT; SĐT đã có tài khoản có mật khẩu thì phải nhập đúng mật khẩu để liên kết.
- **Mã giới thiệu** (§1, §6): `POST /auth/register` và `POST /auth/google` gửi kèm `referralCode` (từ link `?ref=` đã lưu); thành công **không** xoá mã — mã chỉ xoá khi bấm Đăng xuất. Form đăng ký hiện dòng "đăng ký qua link giới thiệu". Chi tiết `docs/instruction/profile.md` §8.
- **`/login`**: gom phần sau đăng nhập vào `finishLogin` dùng chung cho mật khẩu và Google (hành vi không đổi).
- **Constants / keys mới**:
  - `FIREBASE_POPUP_CANCEL_CODES`, `HTTP_STATUS.UNAUTHORIZED`
  - `auth.google.{button,phoneHint,passwordHint,passwordRequired,continue,wrongPassword,phoneLinked,error}`, `referral.register.invitedBy`
- **Lý do**:
  - Đăng nhập nhanh hơn; vẫn giữ SĐT bắt buộc vì đặt đơn / tra cứu / điểm đều theo SĐT. Zalo để sau khi có app Zalo Developers.

## 2026-10-21
- **Quên mật khẩu**: tạm tắt luồng lấy lại mật khẩu qua email OTP (code được comment lại ở cuối `app/forgot-password/page.tsx`, service/translation cũ giữ nguyên). Trang `/forgot-password` giờ chỉ hướng dẫn liên hệ cửa hàng qua Zalo / hotline để admin cấp mật khẩu tạm (xem `docs/instruction/auth.md` §5).
- **Constants / keys mới**:
  - `auth.forgotPassword.contactAdmin`
- **Lý do**:
  - Dịch vụ gửi email OTP chưa ổn định; tạm dùng cách liên hệ admin, sau này có dịch vụ tốt hơn sẽ bật lại / thay thế.

## 2026-10-20
- **Refresh token (`BaseAPI`)**: đọc access token mới từ `data.accessToken` của `POST /auth/refresh` (trước đọc `accessToken`/`refreshToken` ở top-level → luôn `undefined`). Sau refresh chỉ ghi lại cookie `accessToken` (`maxAge` theo `exp` của JWT, không "ghi nhớ" → session cookie); cookie `refreshToken` giữ nguyên. Response thiếu token → không ghi cookie, không logout.
- **Auth proxy**: cùng cách đọc response mới; không còn ghi đè cookie `refreshToken`; dùng `COOKIES_KEY`.
- `getTokenExpiry` được export để proxy dùng chung.
- **Quên mật khẩu (email OTP)**: trang mới `/forgot-password` 2 bước — SĐT + captcha → `POST /auth/forgot-password`; OTP 6 số + mật khẩu mới → `POST /auth/reset-password` → về `/login`. Có đếm ngược gửi lại, hộp liên hệ Zalo/hotline cho khách chưa có email. Trang `noindex` + loại khỏi sitemap.
- **Login**: link "Quên mật khẩu?" trỏ tới `/forgot-password` (trước là nút không làm gì). Đăng nhập bằng mật khẩu tạm (`user.mustChangePassword`) → chuyển `/profile`.
- **Ô nhập OTP (daisyUI)**: khai báo biến theme daisyUI cho `.otp` trong `app/globals.css`, bỏ `otp-joined` + `justify-center` → 6 ô rời, viền mảnh, chữ số hiển thị đúng ô (áp dụng cả `/forgot-password` và `OtpVerification`).
- **Admin cấp mật khẩu tạm**: `UserService.resetUserPassword` (`PATCH /users/:id/reset-password`), kiểu `User.mustChangePassword`.
- **Constants / keys mới**:
  - `OTP_LENGTH`, `OTP_RESEND_SECONDS`, `EMAIL_REGEX`
  - `auth.forgotPassword.*`
- **Lý do**:
  - Bug: access token hết hạn (15 phút) dù refresh token còn hạn vẫn bị logout. Client ghi cookie `accessToken` và `refreshToken` = `undefined` sau khi refresh → request gửi đi không có token → 401 → refresh lại bằng refresh token hỏng → 401 → `handleSessionExpired` logout. Cần deploy kèm server (`/auth/refresh` trả `data.accessToken`).
  - Quên mật khẩu: khách không lấy lại được mật khẩu. Chọn email OTP + admin reset vì đều miễn phí (SMS/Zalo ZNS mất phí). Backend đã bổ sung cùng ngày: `POST /auth/forgot-password`, `POST /auth/reset-password`, `PATCH /users/:id/reset-password`, field `mustChangePassword`, thu hồi refresh token (xem `docs/instruction/auth.md` §4–§5). Cần cấu hình SMTP trên server để email OTP được gửi.
  - Ô OTP hiển thị xấu, không thấy số nhập: theme `giat-say-sieu-sach` khai báo trong `@plugin "daisyui"` không tồn tại nên daisyUI không sinh biến theme → viền dày mặc định, số lệch/ẩn.

## 2026-10-19
- **Ghi nhớ đăng nhập**: checkbox ở `/login` (mặc định tích) được nối vào logic.
  - Tích: như trước — user lưu localStorage, cookie có hạn.
  - Không tích: cookie token là session cookie, user không lưu localStorage; reload trang thì logout và xóa cookie token.
- **Đăng xuất**: xóa cờ phiên không-ghi-nhớ trong sessionStorage.
- **Constants / keys mới**:
  - `SESSION_ONLY_LOGIN_KEY` (`constants/cookies.ts`).
- **Lý do**:
  - Checkbox "Ghi nhớ đăng nhập" trước đây không có tác dụng; yêu cầu: không tích thì reload trang phải logout.

## 2026-10-15
- **Đăng ký — mật khẩu tối thiểu**: dùng `MIN_PASSWORD_LENGTH` thay cho số 6 cứng, hạ hằng số từ 8 xuống **4** (khớp server; áp dụng cả form đổi mật khẩu ở profile) để không làm khó khách; mật khẩu ngắn giờ **chặn submit** (trước chỉ hiện lỗi nhưng vẫn gửi). Câu lỗi lấy số từ `{min}`.
- **Đăng ký — tự đăng nhập**: `registerAction` thành Server Action thật (`'use server'`), lưu token trả về vào cookie; trang đăng ký gọi `login(user)` rồi về trang chủ thay vì chuyển sang `/login`. Response không có token (server chưa deploy bản mới) → vẫn chuyển sang `/login` như cũ.
- **Server đi kèm** (repo `server-giat-say-sieu-sach-nestjs`, cùng ngày): `POST /auth/register` trả token giống login và giới hạn mật khẩu 4–50 ký tự (đăng nhập + đổi mật khẩu cũng tối thiểu 4).
- **Lưu cookie dùng chung**: tách `saveAuthCookies(auth)` trong `app/login/actions.ts`, login và register cùng dùng.
- **Lý do**:
  - Form cho gửi mật khẩu quá ngắn → server từ chối với câu lỗi chung khó hiểu. Yêu cầu 8 ký tự gây khó cho khách phổ thông → chốt 4.
  - Đăng ký xong khách phải nhập lại để đăng nhập (server cũ không trả token).

## 2026-10-02
- **Refresh token**: `renewAccessToken` gửi refresh token qua header `Authorization: Bearer <refreshToken>` (trước gửi trong body nên server luôn trả 401 "Missing authorization header"). Nhiều request cùng refresh dùng chung 1 promise.
- **Retry 401**: request `isUseAuth` gặp 401 → refresh + retry 1 lần.
- **Hết hạn đăng nhập**: thêm `handleSessionExpired` → `user.logout()` + toast `auth.sessionExpired` (chỉ client, chỉ khi đang login). Bỏ `clearTokens()` trong `baseApi` — không tự xóa cookie nữa (chỉ xóa khi bấm Đăng xuất).
- **Constants / keys mới**:
  - `auth.sessionExpired`
- **Lý do**:
  - Refresh trước đây không bao giờ thành công (sai cách gửi token). Việc tự xóa cả 2 token khi refresh lỗi gây mất phiên sai.

## 2026-09-30
- **Đăng ký (`/register`)**: form họ tên + SĐT + mật khẩu + xác nhận, reCAPTCHA Firebase. Submit `POST /auth/register` (`isUseAuth: false`), thành công `router.replace('/login')`, lỗi hiện câu chung. Trang `noindex, nofollow`.
- **Constants / keys mới**:
  - `auth.register.*`
- **Lý do**:
  - Cho khách tự tạo tài khoản. (Còn các nợ kỹ thuật đã ghi trong instruction: không chặn submit khi mật khẩu < 6, SĐT chưa chuẩn hóa E.164, lỗi server gộp chung, không tự đăng nhập sau đăng ký.)
