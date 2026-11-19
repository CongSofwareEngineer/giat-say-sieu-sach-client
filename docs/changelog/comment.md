# Comment (đánh giá) — Changelog
> Instruction: docs/instruction/comment.md

## 2026-10-29
- **Đánh giá theo đơn** (§7): đơn `COMPLETED` chưa đánh giá có nút "Đánh giá" trong "Đơn hàng của tôi" → `CommentForm` ở chế độ `order` (không chọn dịch vụ) → `POST /comments/orders/:orderId`. Đơn đã đánh giá hiện "Đã đánh giá". 409 → báo đã đánh giá.
- `CommentItem.orderId` (server trả kèm).
- **Constants / keys mới**:
  - `HTTP_STATUS.CONFLICT`, `reviews.order.{button,title,forOrder,reviewed,alreadyReviewed}`
- **Lý do**:
  - Đánh giá gắn với đơn thật đáng tin hơn và mời được khách đánh giá đúng lúc vừa xong đơn.

## 2026-10-20
- **Hiển thị trả lời của shop**: `buildCommentReplies` giữ `replies` mà API public trả kèm mỗi comment gốc, thay vì ghi đè bằng mảng rỗng.
- **Admin xoá đánh giá**: admin xoá đánh giá của người khác dùng `adminDeleteComment` (`DELETE /comments/:id`); xoá đánh giá của chính mình vẫn dùng `deleteComment`.
- **Bắt buộc đăng nhập để viết đánh giá**: chưa đăng nhập bấm "Viết đánh giá" → toast `reviews.loginRequired` + chuyển `/login`. `CommentService.createComment` luôn gửi token (bỏ tham số `options.isUseAuth`), `rating` bắt buộc.
- **Tiêu đề đánh giá**: hook gửi `title` khi tạo; sửa đánh giá gửi `title` hợp lệ với server (server đã thêm field `title`).
- **Constants / keys mới**:
  - `reviews.loginRequired`
- **Lý do**:
  - Admin trả lời đánh giá bị lỗi do server bắt buộc `rating` cho reply (đã sửa phía server), và reply không hiện vì API public không trả reply.
  - Admin xoá đánh giá người khác bị 404 vì `/me/:id` chỉ tìm đánh giá của người gọi.
  - Khách chưa đăng nhập gửi đánh giá bị **401** (`POST /comments/laundry-categories/:id` có `JwtAuthGuard`, rating 0 cũng bị 400).
  - Sửa đánh giá bị **400** vì client gửi `title` mà DTO server chưa có (`forbidNonWhitelisted`); tiêu đề khi tạo bị bỏ mất.

## 2026-10-19
- **Giới hạn nội dung**: tối đa 200 ký tự, ô nội dung có bộ đếm `{count}/{max}`; nội dung dài hơn sẽ báo lỗi khi gửi.
- **Giới hạn ảnh**: tối đa 3 ảnh (trước là 5).
- **SĐT hiển thị**: dùng SĐT do API trả về dạng `090...567` (3 số đầu + `...` + 3 số cuối). Đã bỏ hàm che SĐT ở client (`maskPhone`).
- **Kích thước thumbnail**: ghi lại đúng code (40x40), doc cũ ghi 56x56.
- **Constants / keys mới**:
  - `MAX_COMMENT_CONTENT_LENGTH` (200); `MAX_COMMENT_IMAGES` đổi từ 5 → 3.
  - `reviews.form.contentCounter`, `reviews.validation.contentTooLong`.
- **Lý do**:
  - Yêu cầu giới hạn nội dung/ảnh và che SĐT theo định dạng 3 số đầu + 3 số cuối.
  - Server phải trả SĐT đã che; đồng thời cần sửa cùng đợt (xem changelog server `2026-10-19_comment.md`).

## 2026-10-02
- **Dịch vụ đánh giá**: `COMMENT_SERVICES` chuyển từ `services/comment.ts` sang `constants/app.ts`, dùng đúng id `laundry-categories` của server (trước là id giả `giat-thuong`, `giat-ui`… → gửi đánh giá lỗi). `CommentSection` lọc theo constants, bỏ gọi `useGetListPrice`.
- **SĐT**: regex chuyển vào `VN_LOCAL_PHONE_REGEX`; `normalizeVnPhone` chuẩn hoá thêm `.`/`-`; comment form + login dùng `isValidVnPhone` (chấp nhận `+84`/`84`/`0`); login, register, comment gửi SĐT dạng E.164.
- **Ảnh đánh giá**: `CommentCard` hiện thumbnail 56x56, click mở modal xem ảnh lớn.
- **Constants / keys mới**:
  - `COMMENT_SERVICES`, `VN_LOCAL_PHONE_REGEX`
  - `reviews.services.{regular,express,dryClean,ironing}`
- **Lý do**:
  - Id dịch vụ sai làm gửi đánh giá lỗi; regex `^0[0-9]{9}$` từ chối SĐT dạng `+84...` lấy từ tài khoản.
