# Comment (đánh giá)
> Cập nhật: 2026-10-29

## Tổng quan
Khách đánh giá dịch vụ (sao, tiêu đề, nội dung, ảnh); hiển thị ở trang bảng giá và trang đánh giá. Sub-logic: (1) Dịch vụ đánh giá đồng bộ server, (2) Validate/chuẩn hoá SĐT, (3) Hiển thị ảnh thumbnail, (4) Giới hạn nội dung/ảnh và SĐT che từ API, (5) Admin trả lời / xoá đánh giá, (6) Bắt buộc đăng nhập + tiêu đề, (7) Đánh giá theo từng đơn. Upload ảnh xem `docs/instruction/upload.md`; admin xem/ẩn đánh giá xem `docs/instruction/admin.md`.

## Dùng chung
- `services/comment.ts` — API đánh giá, `getServiceName`, kiểu `CommentItem` (`phone` đã che từ server).
- `constants/app.ts` — `COMMENT_SERVICES`, `VN_LOCAL_PHONE_REGEX`, `MAX_COMMENT_CONTENT_LENGTH` (200), `MAX_COMMENT_IMAGES` (3).
- `utils/phone.ts` — `normalizeVnPhone`, `isValidVnPhone`, `formatPhoneToE164`.
- `components/Comment/*` — `CommentForm`, `CommentSection`, `CommentCard`.

## 1. Dịch vụ đánh giá đồng bộ server
### Luồng xử lý
- `COMMENT_SERVICES` nằm trong `constants/app.ts`, hardcode nhưng dùng đúng id của `laundry-categories` trên server (Giặt thường, Giặt nhanh, Giặt khô, Ủi đồ); tên hiển thị qua `translate(labelKey)`.
- Gửi đánh giá: `serviceId` làm `categoryId` trong `POST /comments/laundry-categories/:id`. Hook chỉ gửi `rating`, `title`, `content`, `images` (có token); tên/SĐT lấy từ tài khoản phía server.
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

## 5. Admin trả lời / xoá đánh giá
### Entry points
- `components/Comment/CommentCard.tsx` — nút Trả lời (chỉ admin), Xoá (admin hoặc chủ đánh giá), khối "Shop phản hồi".
- `components/Comment/ReplyForm.tsx` — modal nhập trả lời, gọi `replyComment` của `useGetListComments`.
- `services/comment.ts` — `replyComment` (`POST /comments/:id/reply`), `deleteComment` (`DELETE /comments/me/:id`), `adminDeleteComment` (`DELETE /comments/:id`), `buildCommentReplies`.
### Luồng xử lý
1. Admin (`user.isAdmin`) bấm Trả lời → modal `ReplyForm` → gửi `{ content }` → thành công thì invalidate `QUERY_KEYS.getListComments`, toast `common.success`, đóng modal.
2. API public trả mỗi comment gốc kèm `replies`; `buildCommentReplies` giữ nguyên `replies` có sẵn và chỉ ghép thêm từ danh sách phẳng (danh sách admin).
3. `CommentCard` hiện các reply dưới nội dung với nhãn `reviews.shopReply`.
4. Xoá: đánh giá của chính mình → `deleteComment`; admin xoá đánh giá người khác → `adminDeleteComment` (endpoint `/me/:id` chỉ khớp đánh giá của người gọi).
### Translation / Constants
- `reviews.form.reply`, `reviews.form.replyLabel`, `reviews.form.replyPlaceholder`, `reviews.form.replySubmit`, `reviews.validation.replyRequired`, `reviews.shopReply`, `reviews.error`.
### Edge cases
- Nội dung trống → `reviews.validation.replyRequired`, không gửi. Lỗi server → `reviews.error` trong modal.
- Danh sách public cache 300s phía server, nhưng server xoá cache khi có reply mới.

## 6. Bắt buộc đăng nhập + tiêu đề
### Mục đích
API tạo đánh giá của server yêu cầu đăng nhập (`JwtAuthGuard`, `rating` 1–5), nên client chặn khách vãng lai trước khi mở form.
### Entry points
- `components/Comment/CommentSection.tsx` — `openCommentForm`.
- `hooks/reactQuery/useGetListComments.ts` — `createComment`, `updateComment`.
- `services/comment.ts` — `createComment(categoryId, { rating, title?, content, images })`, luôn `isUseAuth: true`.
### Luồng xử lý
1. Bấm "Viết đánh giá": `useUser().isLogin` = false → toast `reviews.loginRequired` + `router.push('/login')`, không mở modal.
2. Đã đăng nhập → modal `CommentForm` (tên/SĐT khoá theo tài khoản). Tạo: gửi `title` + `rating` + `content` + `images`. Sửa: `PATCH /comments/me/:id` với `title`, `content`, `images`, `rating`.
3. Server lưu `title` (tối đa 100 ký tự) và trả về trong `CommentItem.title`; đánh giá cũ có `title` rỗng.
### Translation / Constants
- `reviews.loginRequired`.
### Edge cases
- Trang login chưa có tham số quay lại → sau khi đăng nhập khách phải tự mở lại trang đánh giá.
- `CommentForm` vẫn còn nhánh cho khách chưa đăng nhập (nhập tên/SĐT, ẩn sao) nhưng không còn đường vào.

## 7. Đánh giá theo từng đơn
### Mục đích
Khách đánh giá đúng đơn mình đã dùng sau khi đơn hoàn thành; mỗi đơn chỉ một đánh giá. Đánh giá vẫn hiện chung ở trang Đánh giá / Bảng giá như đánh giá thường.
### Entry points
- `app/profile/components/MyOrders.tsx` — nút "Đánh giá" khi `order.status === ORDER_STATUS.COMPLETED && !order.isReviewed` → modal `CommentForm` với prop `order={{ id, code }}`.
- `components/Comment/CommentForm.tsx` — có `order` thì ẩn ô chọn dịch vụ, thay bằng dòng `reviews.order.forOrder`; không bắt buộc `serviceId`.
- `useGetListComments().createOrderComment({ orderId, payload })` → `CommentService.createOrderComment(orderId, { rating, title, content, images })` → `POST /comments/orders/:orderId` (cần đăng nhập).
### Luồng xử lý
1. Server trả `isReviewed` cho từng đơn trong `GET /laundry-orders/me`.
2. Khách điền sao, tiêu đề, nội dung, ảnh (giống form thường, cùng giới hạn) → upload ảnh → gửi.
3. Server kiểm tra đơn của chính khách + `COMPLETED` + chưa có đánh giá, gắn đánh giá vào dịch vụ của món đầu tiên trong đơn, lưu `orderId`.
4. Thành công → làm mới danh sách đánh giá + "Đơn hàng của tôi" (nút đổi thành "Đã đánh giá").
### Translation / Constants
- `reviews.order.{button,title,forOrder,reviewed,alreadyReviewed}`, `HTTP_STATUS.CONFLICT`.
### Edge cases
- 409 (đã đánh giá, vd mở ở 2 tab) → `reviews.order.alreadyReviewed`; lỗi khác → `reviews.error`.
- Khách xoá đánh giá đó → đơn lại hiện nút "Đánh giá".
- Admin ẩn đánh giá → đơn vẫn tính là đã đánh giá.

## Liên quan
- `docs/instruction/upload.md` (upload ảnh đánh giá), `docs/instruction/admin.md` (xem chi tiết/ẩn đánh giá), `docs/instruction/auth.md` (validate SĐT login/register).
- Server: `docs/instruction/comment.md` bên repo `server-giat-say-sieu-sach-nestjs` (giới hạn, che SĐT, `userId`).
