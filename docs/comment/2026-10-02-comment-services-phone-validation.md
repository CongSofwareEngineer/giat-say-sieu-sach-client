# Đồng bộ dịch vụ đánh giá với server + chấp nhận SĐT "+84" / "0"

- Ngày: 2026-10-02
- Phạm vi: comment (đánh giá), login, register, utils phone

## Mục đích
- `COMMENT_SERVICES` trước đây nằm trong `services/comment.ts` với id giả (`giat-thuong`, `giat-ui`...) không khớp server. Khi gửi đánh giá, `serviceId` được dùng làm `categoryId` trong `POST /comments/laundry-categories/:id` nên id sai sẽ lỗi.
- Form đánh giá và trang đăng nhập dùng regex `^0[0-9]{9}$` nên số dạng `+84977092863` (ví dụ SĐT lấy từ tài khoản) bị báo "Số điện thoại không hợp lệ".

## Luồng xử lý
1. `COMMENT_SERVICES` chuyển vào `constants/app.ts`, vẫn hardcode để không phải gọi API, nhưng dùng đúng id của `laundry-categories` trên server (Giặt thường, Giặt nhanh, Giặt khô, Ủi đồ). Tên hiển thị lấy qua `translate(labelKey)`.
2. `CommentSection` dùng `COMMENT_SERVICES` cho bộ lọc thay vì gọi `useGetListPrice` (bớt 1 API call).
3. `CommentCard` hiển thị badge dịch vụ theo `serviceId` hoặc `categoryId`; che SĐT sau khi chuẩn hoá về dạng `0...`.
4. Regex SĐT chuyển vào constants (`VN_LOCAL_PHONE_REGEX`). `normalizeVnPhone` bỏ khoảng trắng, dấu `.` và `-`, đổi `+84`/`84` thành `0`.
5. Comment form + login validate bằng `isValidVnPhone` (chấp nhận `+84`, `84`, `0`).
6. Login, register, comment gửi SĐT lên server ở dạng E.164 (`+84...`) qua `formatPhoneToE164`, giống booking/tra cứu đơn.
7. Ảnh trong đánh giá (`CommentCard`) hiển thị dạng thumbnail nhỏ 56x56 (`h-14 w-14`, flex-wrap) thay vì grid full width; click vào ảnh mở modal xem ảnh lớn (`viewImage`). Áp dụng cho cả trang bảng giá và trang đánh giá.

## File liên quan
- `constants/app.ts` — `COMMENT_SERVICES`, `VN_LOCAL_PHONE_REGEX`
- `services/comment.ts` — bỏ `COMMENT_SERVICES`, `getServiceName`
- `utils/phone.ts` — dùng regex từ constants, chuẩn hoá thêm `.`/`-`
- `components/Comment/CommentForm.tsx` — options dịch vụ, validate SĐT
- `components/Comment/CommentSection.tsx` — bộ lọc dịch vụ từ constants
- `components/Comment/CommentCard.tsx` — badge dịch vụ, mask SĐT, thumbnail ảnh 56x56
- `app/login/page.tsx`, `app/register/page.tsx` — validate/gửi SĐT

## Constants / Translation keys mới
- `COMMENT_SERVICES`, `VN_LOCAL_PHONE_REGEX`
- `reviews.services.regular`, `reviews.services.express`, `reviews.services.dryClean`, `reviews.services.ironing`

## Lưu ý
- Khi admin thêm/xoá/đổi loại dịch vụ trên server phải cập nhật lại `COMMENT_SERVICES` (id lấy từ `GET /laundry-categories`).
- Đánh giá cũ có `serviceId` dạng slug cũ sẽ không hiện badge dịch vụ.
- Login/register giờ gửi SĐT dạng `+84...`: cần server lưu/so khớp SĐT theo E.164 (hoặc tự chuẩn hoá), nếu không tài khoản cũ đăng ký bằng `0...` có thể không đăng nhập được.
