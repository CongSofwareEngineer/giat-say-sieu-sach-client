# Auth (đăng ký / đăng nhập / token)
> Cập nhật: 2026-10-29

## Tổng quan
Xác thực khách hàng bằng **họ tên + số điện thoại + mật khẩu**. Token (access/refresh) lưu ở httpOnly cookie, chỉ đọc/ghi qua server actions trong `utils/cookie.ts` (`COOKIES_KEY`). Trạng thái đăng nhập là store Zustand `zustand/user.ts` (`useUser`). Sub-logic: (1) Đăng ký, (2) Tự refresh token + báo hết hạn, (3) Ghi nhớ đăng nhập, (4) Quên mật khẩu (**tạm thời chỉ liên hệ admin**; luồng email OTP đã comment lại), (5) Admin cấp mật khẩu tạm, (6) Đăng nhập bằng Google. Hiện mọi khách quên mật khẩu đều nhờ cửa hàng cấp mật khẩu tạm (§5). Sau này có dịch vụ gửi mã tốt hơn sẽ bật lại / thay luồng email OTP.

## Dùng chung
- `config/baseApi.ts` — `BaseAPI` ghép URL, gắn header, ném `HttpError` (giữ `status`).
- `services/auth/index.ts` — `AuthService.register`, login, `forgotPassword`, `resetPassword`; `services/auth/type.ts` — kiểu `Auth` (token).
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
3. Gửi `POST /auth/register` `{ name, phone (E.164), password, captchaToken, referralCode? }` (`isUseAuth: false`) qua Server Action `registerAction`. `referralCode` = mã từ link `?ref=` đã lưu ở localStorage (xem `docs/instruction/profile.md` §8); thành công thì xoá mã. Có mã → form hiện dòng `referral.register.invitedBy`.
4. OK → server trả `{ accessToken, refreshToken, user, accessExpire, refreshExpire }` (giống login) → `registerAction` lưu token vào cookie (`saveAuthCookies`, dùng chung với login) → trang gọi `login(user)` và `router.replace('/')` (khách đã đăng nhập luôn). Response thiếu token → `router.replace('/login')`. Lỗi → câu chung `auth.register.error`.
### Translation / Constants
- `auth.register.*` (`passwordMin` nhận `{min}`), `MIN_PASSWORD_LENGTH`. Vào từ Header + link ở `/login`.
### Edge cases / nợ kỹ thuật
- Mọi lỗi server gộp chung một câu (do `BaseAPI` chỉ ném `status`), VD SĐT đã tồn tại cũng chỉ thấy câu chung.
- Sau đăng ký chưa đồng bộ FID thông báo như trang login (`syncFcmFid`, xem `docs/instruction/notifications.md`).

## 2. Refresh token & hết hạn đăng nhập (`config/baseApi.ts`)
### Mục đích
Mọi API `isUseAuth` luôn gắn `accessToken`; thiếu/hết hạn thì dùng `refreshToken` lấy token mới rồi gọi tiếp. Không còn `refreshToken` (hoặc server từ chối) → tự logout + báo đăng nhập lại.
### Entry points
- `BaseAPI.getAuthToken` / `renewAccessToken` / `handleSessionExpired`.
- `app/api/auth-proxy/[...path]/route.ts` — proxy cũng gửi refresh token qua header `Authorization`.
### Luồng xử lý
1. `getAuthToken`: còn hạn (đọc `exp` JWT, trừ hao 5s) → dùng luôn; ngược lại → `renewAccessToken`.
2. `renewAccessToken`: không có refresh token → `handleSessionExpired`, trả `null`. Có → `POST /auth/refresh` với header `Authorization: Bearer <refreshToken>` (KHÔNG gửi trong body); nhiều request cùng refresh chia sẻ 1 promise.
   - Response server: `{ success, data: { accessToken, accessExpire } }` — chỉ có access token mới (server **không rotate** refresh token).
   - `saveAccessToken` chỉ ghi lại cookie `accessToken` (`maxAge` = `exp` của JWT − bây giờ; user không "ghi nhớ" → session cookie). Cookie `refreshToken` **giữ nguyên** giá trị và hạn ban đầu (15 ngày).
3. API trả 401 (request `isUseAuth`) → gọi lại `renewAccessToken` và retry 1 lần.
4. `handleSessionExpired` (chỉ client, chỉ khi `isLogin`): `user.logout()` + toast `auth.sessionExpired`. **Không xóa cookie** (cookie chỉ xóa khi user bấm Đăng xuất ở `components/Header`).
### Translation / Constants
- `auth.sessionExpired`; `COOKIES_KEY`.
### Edge cases
- Refresh lỗi 401/403 → session expired; lỗi mạng/khác hoặc response thiếu `data.accessToken` → bỏ qua, không logout.
- `app/api/auth-proxy` (hiện chưa có chỗ gọi) dùng cùng response: chỉ ghi cookie `accessToken`; refresh thất bại thì proxy xóa cả 2 cookie.
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

## 4. Quên mật khẩu (`/forgot-password`)
### Trạng thái hiện tại (tạm thời)
- Trang `/forgot-password` **chỉ hiển thị hướng dẫn liên hệ cửa hàng**: tiêu đề + câu `auth.forgotPassword.contactAdmin` + link Zalo (`INFO_CONTACT.Zalo`) và gọi hotline (`INFO_CONTACT.Phone`) + link quay lại `/login`. Admin cấp mật khẩu tạm theo §5.
- Luồng email OTP bên dưới **đã comment lại** ở cuối `app/forgot-password/page.tsx` (giữ nguyên code). `AuthService.forgotPassword` / `resetPassword` và các key `auth.forgotPassword.*` cũ vẫn giữ, hiện không có chỗ gọi. Bật lại: khôi phục phần code đã comment và bỏ component tạm phía trên.
- Link "Quên mật khẩu?" ở `/login` vẫn trỏ tới `/forgot-password`.

### Luồng email OTP (đang tắt) — mục đích
Khách đã lưu email trong hồ sơ tự đặt lại mật khẩu bằng mã OTP gửi qua email (backend gửi bằng Gmail SMTP / Brevo free).
### Entry points
- `app/forgot-password/page.tsx` (2 bước trong một trang), `app/forgot-password/layout.tsx` (metadata `noindex`; cũng nằm trong `PRIVATE_PATHS` của `next-sitemap.config.js`).
- Link "Quên mật khẩu?" ở `app/login/page.tsx`.
- `AuthService.forgotPassword(phone, captchaToken)`, `AuthService.resetPassword(phone, otp, newPassword)` — đều `isUseAuth: false`.
### Luồng xử lý
1. **Bước 1**: nhập SĐT + tick reCAPTCHA (`HumanVerification`) → `POST /auth/forgot-password { phone (E.164), captchaToken }`. Server **luôn trả OK** dù SĐT không tồn tại / chưa có email (không lộ tài khoản) → chuyển bước 2, bắt đầu đếm ngược `OTP_RESEND_SECONDS`.
2. **Bước 2**: nhập OTP (`OTP_LENGTH` số, ô OTP daisyUI) + mật khẩu mới (≥ `MIN_PASSWORD_LENGTH`) + xác nhận → `POST /auth/reset-password { phone, otp, newPassword }` → toast `auth.forgotPassword.success` → `/login`.
3. "Gửi lại" quay về bước 1 (giữ SĐT) vì cần captcha mới; nút gửi bị khoá đến hết đếm ngược.
4. Hộp cuối trang: chưa có email → link Zalo / hotline (`INFO_CONTACT`) để được admin cấp mật khẩu tạm (§5).
### API backend (đã có, `src/module/auth` + `user.service`)
- `POST /auth/forgot-password { phone, captchaToken }`: kiểm captcha; giới hạn 3 lần/phút/IP (quá → **429**); có email → tạo OTP 6 số, lưu **hash** trên user, hạn 10 phút, gửi email qua SMTP. Gửi lại cùng SĐT trong 60s bị **bỏ qua im lặng** (vẫn 200, để không lộ SĐT có email). Luôn trả `{ data: null }`.
- `POST /auth/reset-password { phone, otp, newPassword }`: OTP sai / hết hạn / đã dùng → **400**; sai đủ 5 lần thì huỷ OTP + **429**; quá 10 lần/phút/IP → **429**. Thành công → đổi mật khẩu, xoá OTP, tắt `mustChangePassword`, **thu hồi mọi refresh token** cũ (máy khác đang đăng nhập sẽ bị "phiên hết hạn" khi refresh).
### Translation / Constants
- `auth.forgotPassword.*`, dùng lại `otp.error.{tooManyRequests,sendFailed}`, `otp.resendIn`, `changePassword.*` (label/placeholder mật khẩu), `auth.register.{captchaRequired,passwordMismatch}`.
- `OTP_LENGTH` (6), `OTP_RESEND_SECONDS` (60), `MIN_PASSWORD_LENGTH`, `HTTP_STATUS`, `INFO_CONTACT`.
### Edge cases
- Bước 1 lỗi: 429 → "Quá nhiều yêu cầu", khác → "Không thể gửi mã". Bước 2: 400 → lỗi dưới ô OTP, 429 / khác → lỗi chung.
- Email được lưu ở `/profile` (xem `docs/instruction/profile.md` §7), **chưa xác minh** — gõ sai email thì khách dùng §5.
- Ô OTP dùng class daisyUI `otp otp-lg otp-primary` (6 ô rời, `otp-error` khi lỗi). Project không sinh theme daisyUI nên các biến theme mà `.otp` cần (`--border`, `--radius-field`, `--size-field`, `--color-base-100`, `--color-error`, …) được khai báo riêng cho `.otp` trong `app/globals.css`. Không thêm `justify-center` / class layout lên `<label class="otp">` (làm lệch chữ số so với ô).

## 5. Admin cấp mật khẩu tạm (`/admin/customers`)
### Mục đích
Khách chưa có email (hoặc không nhận được mail) liên hệ cửa hàng; admin tạo mật khẩu tạm, khách đăng nhập rồi buộc đổi.
### Entry points
- Nút "Đặt lại mật khẩu" ở cột thao tác `app/admin/customers/page.tsx` → modal `components/admin/AdminResetPassword.tsx` (qua `useModalDrawer`).
- `useAdminCustomers().resetCustomerPassword(id)` → `UserService.resetUserPassword(id)` → `PATCH /users/:id/reset-password` → `{ tempPassword }`.
- Kiểu `User.mustChangePassword?: boolean` (`services/users/type.ts`).
### Luồng xử lý
1. Admin xác nhận → server tạo mật khẩu tạm, gắn `mustChangePassword: true`, thu hồi refresh token cũ, trả `tempPassword` (chỉ một lần).
2. Modal hiện mật khẩu tạm + nút copy; admin gửi cho khách qua Zalo / điện thoại. Lỗi → toast `common.error` từ hook, modal giữ bước xác nhận.
3. Khách đăng nhập: `user.mustChangePassword` → `router.replace('/profile')` (thay vì `/` hoặc `/admin`). `/profile` tự mở tab Đổi mật khẩu + cảnh báo `changePassword.tempPasswordNotice` (xem `docs/instruction/profile.md` §2).
4. Đổi mật khẩu thành công → server tắt cờ; client `updateUser({ mustChangePassword: false })`.
### Translation / Constants
- `admin.customers.resetPassword.*`, `common.{copied,close,cancel}`, `COPY_FEEDBACK_DURATION`.
### Edge cases
- Chỉ nhắc + chuyển tab, **không chặn** các trang khác khi còn cờ.
- `/profile` đồng bộ `mustChangePassword` từ `GET /users/me` mỗi lần vào (server không trả field → coi là `false`).

## 6. Đăng nhập bằng Google (`/login`, `/register`)
### Mục đích
Khách đăng nhập nhanh bằng Google. Mọi tài khoản vẫn phải có số điện thoại (đặt lịch, tra cứu, điểm đều theo SĐT), nên lần đầu khách phải nhập SĐT.
### Entry points
- `components/GoogleLoginButton/index.tsx` — props `{ onSuccess(user) }`; nằm dưới form ở `/login` (sau dòng "hoặc") và `/register`.
- `googleLoginAction(idToken, phone?, password?, referralCode?)` (`app/login/actions.ts`, Server Action; `referralCode` từ link giới thiệu, server chỉ dùng khi tạo tài khoản mới — `docs/instruction/profile.md` §8) → `AuthService.loginWithGoogle` → `POST /auth/google` (`isUseAuth: false`). Trả `{ status: 'ok', user } | 'requirePhone' | 'requirePassword' | { status: 'error', httpStatus }` thay vì throw (lỗi throw từ Server Action mất `status` ở client).
- `/login` dùng chung `finishLogin(user, rememberMe)` cho cả 2 cách đăng nhập (sync FID, chuyển `/profile` nếu `mustChangePassword`, admin → `/admin`, còn lại `/`). `/register`: `login(user)` + về `/`.
### Luồng xử lý
1. Bấm "Tiếp tục với Google" → `signInWithPopup(getFirebaseAuth(), GoogleAuthProvider)` → lấy Firebase ID token.
2. Gửi token. Server:
   - Google đã liên kết → đăng nhập (cookie lưu như login thường, luôn "ghi nhớ").
   - Chưa liên kết → `requirePhone` → form hiện ô SĐT (`auth.google.phoneHint`).
3. Gửi lại token + SĐT (E.164):
   - SĐT mới → server tạo tài khoản từ tên/email Google → đăng nhập.
   - SĐT của tài khoản khách vãng lai (chưa có mật khẩu) → liên kết luôn.
   - SĐT đã có tài khoản có mật khẩu → `requirePassword` → hiện ô mật khẩu (`auth.google.passwordHint`, SĐT bị khoá); đúng mật khẩu thì liên kết + đăng nhập.
4. Thành công → `clearReferralCode()` → `signOut` khỏi Firebase Auth (phiên nằm ở cookie của mình) → `onSuccess(user)`.
### Translation / Constants
- `auth.google.{button,phoneHint,passwordHint,passwordRequired,continue,wrongPassword,phoneLinked,error}`, `common.{or,cancel}`, `booking.validation.phoneInvalid`.
- `FIREBASE_POPUP_CANCEL_CODES`, `HTTP_STATUS.{UNAUTHORIZED,CONFLICT}`; icon `components/Icons/SocialMedia/Google.tsx`.
### Edge cases
- Khách đóng popup → không báo lỗi.
- 409: SĐT đã liên kết Google khác → `auth.google.phoneLinked`. 401 ở bước mật khẩu → `auth.google.wrongPassword`. Lỗi khác (token hết hạn, Firebase chưa bật Google) → `auth.google.error`; "Hủy" để làm lại từ đầu.
- **Cấu hình bắt buộc**: Firebase Console → Authentication → bật provider Google + thêm domain web vào Authorized domains. Firebase project của client phải trùng `FIREBASE_PROJECT_ID` của server.
- Chưa có Zalo (cần app Zalo Developers + duyệt quyền lấy SĐT).
- Không có bước xác minh SĐT bằng OTP; liên kết tài khoản vãng lai không cần mật khẩu (giống `/auth/register` cho phép SĐT đó đặt mật khẩu).

## Liên quan
- `docs/instruction/profile.md` (đổi mật khẩu §2, email §7), `docs/instruction/admin.md` (trang khách hàng), `docs/instruction/booking.md` (đặt lịch dùng SĐT E.164).
