# Comment (đánh giá)
> Cập nhật: 2026-10-02

## Tổng quan
Khách đánh giá dịch vụ (sao, tiêu đề, nội dung, ảnh); hiển thị ở trang bảng giá và trang đánh giá. Sub-logic: (1) Dịch vụ đánh giá đồng bộ server, (2) Validate/chuẩn hoá SĐT, (3) Hiển thị ảnh thumbnail. Upload ảnh xem `docs/instruction/upload.md`; admin xem/ẩn đánh giá xem `docs/instruction/admin.md`.

## Dùng chung
- `services/comment.ts` — API đánh giá, `getServiceName`.
- `constants/app.ts` — `COMMENT_SERVICES`, `VN_LOCAL_PHONE_REGEX`.
- `utils/phone.ts` — `normalizeVnPhone`, `isValidVnPhone`, `formatPhoneToE164`.
- `components/Comment/*` — `CommentForm`, `CommentSection`, `CommentCard`.

## 1. Dịch vụ đánh giá đồng bộ server
### Luồng xử lý
- `COMMENT_SERVICES` nằm trong `constants/app.ts`, hardcode nhưng dùng đúng id của `laundry-categories` trên server (Giặt thường, Giặt nhanh, Giặt khô, Ủi đồ); tên hiển thị qua `translate(labelKey)`.
- Gửi đánh giá: `serviceId` làm `categoryId` trong `POST /comments/laundry-categories/:id`.
- `CommentSection` dùng `COMMENT_SERVICES` cho bộ lọc (bỏ `useGetListPrice`, bớt 1 API call).
### Translation / Constants
- `COMMENT_SERVICES`; `reviews.services.{regular,express,dryClean,ironing}`.
### Edge cases
- Admin đổi dịch vụ trên server phải cập nhật lại `COMMENT_SERVICES` (id lấy từ `GET /laundry-categories`). Đánh giá cũ có `serviceId` slug cũ không hiện badge.

## 2. Validate / chuẩn hoá SĐT
### Luồng xử lý
- Regex `VN_LOCAL_PHONE_REGEX` trong constants. `normalizeVnPhone` bỏ khoảng trắng, `.`, `-`, đổi `+84`/`84` → `0`. `isValidVnPhone` chấp nhận `+84`/`84`/`0`.
- Comment form + login validate bằng `isValidVnPhone`; gửi server ở dạng E.164 (`formatPhoneToE164`).
### Edge cases
- Server cần lưu/so khớp SĐT theo E.164 (hoặc tự chuẩn hoá), nếu không tài khoản cũ đăng ký bằng `0...` có thể không đăng nhập được.

## 3. Hiển thị ảnh thumbnail
- `CommentCard` hiện ảnh thumbnail 56x56 (`h-14 w-14`, flex-wrap), click mở modal xem ảnh lớn (`viewImage`). Áp dụng cả trang bảng giá và trang đánh giá. SĐT hiển thị dạng che sau khi chuẩn hoá về `0...`.

## Liên quan
- `docs/instruction/upload.md` (upload ảnh đánh giá), `docs/instruction/admin.md` (xem chi tiết/ẩn đánh giá), `docs/instruction/auth.md` (validate SĐT login/register).
