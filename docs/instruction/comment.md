# Comment (đánh giá)
> Cập nhật: 2026-10-19

## Tổng quan
Khách đánh giá dịch vụ (sao, tiêu đề, nội dung, ảnh); hiển thị ở trang bảng giá và trang đánh giá. Sub-logic: (1) Dịch vụ đánh giá đồng bộ server, (2) Validate/chuẩn hoá SĐT, (3) Hiển thị ảnh thumbnail, (4) Giới hạn nội dung/ảnh và SĐT che từ API. Upload ảnh xem `docs/instruction/upload.md`; admin xem/ẩn đánh giá xem `docs/instruction/admin.md`.

## Dùng chung
- `services/comment.ts` — API đánh giá, `getServiceName`, kiểu `CommentItem` (`phone` đã che từ server).
- `constants/app.ts` — `COMMENT_SERVICES`, `VN_LOCAL_PHONE_REGEX`, `MAX_COMMENT_CONTENT_LENGTH` (200), `MAX_COMMENT_IMAGES` (3).
- `utils/phone.ts` — `normalizeVnPhone`, `isValidVnPhone`, `formatPhoneToE164`.
- `components/Comment/*` — `CommentForm`, `CommentSection`, `CommentCard`.

## 1. Dịch vụ đánh giá đồng bộ server
### Luồng xử lý
- `COMMENT_SERVICES` nằm trong `constants/app.ts`, hardcode nhưng dùng đúng id của `laundry-categories` trên server (Giặt thường, Giặt nhanh, Giặt khô, Ủi đồ); tên hiển thị qua `translate(labelKey)`.
- Gửi đánh giá: `serviceId` làm `categoryId` trong `POST /comments/laundry-categories/:id`. Hook chỉ gửi `rating`, `content`, `images`; tên/SĐT lấy từ tài khoản phía server.
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
- `CommentCard` hiện ảnh thumbnail 40x40 (`h-10 w-10`, flex-wrap), click mở modal xem ảnh lớn (`viewImage`). Áp dụng cả trang bảng giá và trang đánh giá.

## 4. Giới hạn nội dung, ảnh và SĐT hiển thị
### Mục đích
Nội dung đánh giá tối đa 200 ký tự, tối đa 3 ảnh; SĐT người đánh giá hiển thị công khai đã che.
### Entry points
- `components/Comment/CommentForm.tsx` — ô nội dung, bộ đếm, validate; ô ảnh.
- `components/Comment/CommentCard.tsx` — hiển thị tên + SĐT.
### Luồng xử lý
1. Ô nội dung: `maxLength` = `MAX_COMMENT_CONTENT_LENGTH` (200), dưới ô hiện bộ đếm `{count}/{max}` (`reviews.form.contentCounter`).
2. Khi submit, nội dung đã `trim` mà vẫn dài hơn 200 (VD bản đánh giá cũ khi sửa) → lỗi `reviews.validation.contentTooLong`, không gửi.
3. Ảnh: tối đa `MAX_COMMENT_IMAGES` (3). Đủ 3 ảnh thì ẩn nút thêm; chọn nhiều ảnh được cắt theo số còn lại.
4. `CommentCard` hiển thị `comment.phone` đúng như API trả về, dạng `090...567` (3 số đầu + `...` + 3 số cuối). Client không còn tự che SĐT.
### Translation / Constants
- `reviews.form.contentCounter`, `reviews.validation.contentTooLong`; `MAX_COMMENT_CONTENT_LENGTH`, `MAX_COMMENT_IMAGES`.
### Edge cases
- Giới hạn 200 ký tự và 3 ảnh cũng được server kiểm tra (DTO); lỗi server chung hiện `reviews.error`.
- Nếu API trả SĐT rỗng (tài khoản không đủ số để che) thì không hiện dòng SĐT.

## Liên quan
- `docs/instruction/upload.md` (upload ảnh đánh giá), `docs/instruction/admin.md` (xem chi tiết/ẩn đánh giá), `docs/instruction/auth.md` (validate SĐT login/register).
- Server: `docs/instruction/comment.md` bên repo `server-giat-say-sieu-sach-nestjs` (giới hạn, che SĐT, `userId`).
