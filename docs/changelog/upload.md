# Upload ảnh (Cloudinary) — Changelog
> Instruction: docs/instruction/upload.md

## 2026-10-01
- **Upload service**: `UploadService.uploadImages` gửi multipart qua `postFormData`, tự chia lô theo `MAX_IMAGES_PER_UPLOAD`.
- **Avatar / đánh giá / thumbnail blog**: upload trước, đưa `{ publicId, url }` vào body API nghiệp vụ (thay cho base64 / URL nhập tay). Thumbnail blog đổi từ ô nhập URL sang chọn + upload ảnh.
- **Type**: `avatar` / `images` / `thumbnail` đổi từ `string` sang `CloudinaryImage`; hiển thị bằng `.url`. Cho phép `res.cloudinary.com` trong `next.config.ts`.
- **Constants / keys mới**:
  - `UPLOAD_IMAGE_TYPE`, `MAX_IMAGES_PER_UPLOAD`
  - `common.selectImage`, `blog.thumbnail`
- **Lý do**:
  - Server chuyển sang lưu ảnh Cloudinary qua `POST /uploads/images`; các API khác không còn nhận file/base64.
