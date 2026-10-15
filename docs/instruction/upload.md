# Upload ảnh (Cloudinary)
> Cập nhật: 2026-10-01

## Tổng quan
Mọi ảnh (avatar, ảnh đánh giá, thumbnail blog) được upload qua `POST /uploads/images` trước; các API nghiệp vụ chỉ nhận object `{ publicId, url }` (`CloudinaryImage`), không nhận file/base64. Sub-logic: (1) Upload service, (2) Avatar, (3) Ảnh đánh giá, (4) Thumbnail blog.

## Dùng chung
- `services/upload.ts` — `UploadService.uploadImages(files, type)`, type `CloudinaryImage`.
- `config/baseApi.ts` — `postFormData`; `request` không gắn `Content-Type: application/json` khi body là `FormData`.
- `useBase64Img().getFileOptimize` — crop + nén (mặc định vuông, rộng `MAX_PIXEL_REDUCE` 300px, ~15KB).
- Constants: `UPLOAD_IMAGE_TYPE`, `MAX_IMAGES_PER_UPLOAD` (10). `next.config.ts` cho phép `res.cloudinary.com`.
- Hiển thị ảnh luôn bằng `.url` (Header, BlogDetail, blog list...).

## 1. Upload service
- Gửi multipart (`type` + nhiều `files`) trong 1 request; quá `MAX_IMAGES_PER_UPLOAD` thì tự chia nhiều request, giữ đúng thứ tự kết quả.
- API cần đăng nhập; type `blogs` chỉ admin. Server giới hạn 5MB/ảnh, 20 request/phút.

## 2. Avatar
- `app/profile/components/ProfileSidebar.tsx`: chọn ảnh → tối ưu → upload (`avatars`) → `UserService.updateAvatar(avatar)` → cập nhật store user.
- User lưu trong localStorage từ trước có thể còn `avatar` base64 cũ → hiện avatar mặc định đến khi tải lại profile.

## 3. Ảnh đánh giá
- `components/Comment/CommentForm.tsx`: lúc chọn chỉ tối ưu + xem trước; bấm Gửi mới upload tất cả ảnh mới (`comments`) 1 lần, gộp ảnh cũ (khi sửa) rồi create/update.
- Upload xong mà API comment lỗi → ảnh đã upload giữ trong state, gửi lại không upload lại. Ảnh xoá trước khi Gửi thì không upload.

## 4. Thumbnail blog
- `app/admin/blog/new/page.tsx`, `app/admin/blog/[id]/page.tsx`: chọn → tối ưu → bấm Lưu mới upload (`blogs`) → create/update post.
- Nợ: crop vuông 300px nên thumbnail 16:9 full width có thể mờ/bị cắt — cần tham số riêng cho `useBase64Img` + cropper 16:9.

## Translation / Constants
- `UPLOAD_IMAGE_TYPE`, `MAX_IMAGES_PER_UPLOAD`; `common.selectImage`, `blog.thumbnail`.

## Edge cases
- Ảnh cũ bị gỡ khỏi comment/avatar do server xử lý; client không tự xoá trên Cloudinary.

## Liên quan
- `docs/instruction/comment.md`, `docs/instruction/blog.md`, `docs/instruction/profile.md`.
