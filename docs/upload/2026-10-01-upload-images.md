# Upload ảnh qua API `/uploads/images` trước khi gửi body

- Ngày: 2026-10-01
- Phạm vi: upload ảnh (avatar, ảnh đánh giá, thumbnail blog)

## Mục đích
Server đã có API `POST /uploads/images` (lưu ảnh lên Cloudinary). Các API khác (`PATCH /users/me`, comment, blog) không nhận file hoặc base64 nữa, chỉ nhận object `{ publicId, url }` mà API upload trả về. Trước đây client gửi base64 hoặc URL nhập tay nên không khớp với server.

## Luồng xử lý
1. Người dùng chọn ảnh, ảnh được crop và nén qua `useBase64Img().getFileOptimize`.
2. Gọi `UploadService.uploadImages(files, UPLOAD_IMAGE_TYPE.xxx)`: gửi multipart (`type` + nhiều `files`) trong 1 request. Nếu quá `MAX_IMAGES_PER_UPLOAD` (10) ảnh thì tự chia thành nhiều request, kết quả trả về giữ đúng thứ tự.
3. Đưa `{ publicId, url }` nhận được vào body rồi gọi API nghiệp vụ:
   - Avatar: chọn ảnh → upload (`avatars`) → `UserService.updateAvatar(avatar)` → cập nhật store user.
   - Đánh giá: lúc chọn ảnh chỉ tối ưu và xem trước. Khi bấm Gửi mới upload tất cả ảnh mới (`comments`) trong 1 lần, gộp với ảnh cũ (khi sửa) rồi gọi create/update comment.
   - Blog (admin): chọn thumbnail → tối ưu → khi bấm Lưu thì upload (`blogs`) → create/update post.

## File liên quan
- `services/upload.ts` — `UploadService.uploadImages`, type `CloudinaryImage`
- `config/baseApi.ts` — thêm `postFormData`; `request` không tự gắn `Content-Type: application/json` khi body là `FormData`
- `constants/app.ts` — `UPLOAD_IMAGE_TYPE`, `MAX_IMAGES_PER_UPLOAD`
- `app/profile/components/ProfileSidebar.tsx` — luồng đổi avatar
- `components/Comment/CommentForm.tsx`, `CommentCard.tsx` — upload và hiển thị ảnh đánh giá
- `app/admin/blog/new/page.tsx`, `app/admin/blog/[id]/page.tsx` — chọn và upload thumbnail (thay cho ô nhập URL)
- `services/users/*`, `services/comment.ts`, `services/blog.ts`, `services/blogClient.ts`, `hooks/admin/useAdminCustomers.ts` — đổi type `avatar` / `images` / `thumbnail` từ `string` sang `CloudinaryImage`
- `components/Header/index.tsx`, `components/Blog/BlogDetail.tsx`, `app/blog/page.tsx` — hiển thị bằng `.url`
- `next.config.ts` — cho phép `next/image` tải ảnh từ `res.cloudinary.com`

## Constants / Translation keys mới
- `UPLOAD_IMAGE_TYPE`, `MAX_IMAGES_PER_UPLOAD`
- `common.selectImage`, `blog.thumbnail`

## Lưu ý
- API upload yêu cầu đăng nhập; type `blogs` chỉ admin dùng được. Server giới hạn 5MB/ảnh và 20 request/phút.
- Form đánh giá: nếu upload xong mà gọi API comment bị lỗi, ảnh đã upload được giữ lại trong state, nên khi gửi lại sẽ không upload lại.
- Ảnh xóa khỏi form trước khi Gửi thì không bị upload. Ảnh cũ bị gỡ khỏi comment/avatar thì do server xử lý (client không tự xóa trên Cloudinary).
- `useBase64Img` mặc định crop vuông, rộng `MAX_PIXEL_REDUCE` (300px), khoảng 15KB. Với thumbnail blog (hiển thị khung 16:9, full width) ảnh có thể bị mờ hoặc bị cắt. Nếu cần, truyền tham số riêng cho `useBase64Img` và cho cropper hỗ trợ tỉ lệ 16:9.
- User đã lưu trong localStorage từ trước có thể còn `avatar` dạng chuỗi base64 cũ, nên sẽ hiện avatar mặc định cho tới khi đăng nhập lại hoặc tải lại profile.
