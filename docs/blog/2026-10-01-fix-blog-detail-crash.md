# Fix Blog Detail Page Crash

- Ngày: 2026-10-01
- Phạm vi: blog

## Mục đích
Trang chi tiết bài viết blog bị crash khi vào. Vấn đề chính là khi `content` undefined/null, component `BlogContent` cố render với `dangerouslySetInnerHTML` nhận undefined gây crash.

## Luồng xử lý
1. Thêm check `if (!content) return null` tại đầu component `BlogContent` để handle case khi content trống
2. Fix công thức tính thời gian đọc: từ `length / 200 / 60` sửa thành `length / 200` (200 ký tự = 1 phút đọc)
3. Thêm translation key `blog.emptyContent` vào language files để comply với project rules (mặc dù không hiển thị nhưng để sẵn)

## File liên quan
- `components/Blog/BlogContent.tsx` — Server component render nội dung bài viết
- `utils/blogContent.ts` — Hàm tiện ích xử lý và phân tích nội dung blog
- `public/assets/language/vn.json` — Translation keys tiếng Việt
- `public/assets/language/en.json` — Translation keys tiếng Anh

## Constants / Translation keys mới
- `blog.emptyContent`

## Lưu ý
- `BlogContent` là server component nên không thể dùng hooks như `useLanguage()`. Khi content trống, component sẽ render `null` thay vì show message.
- Công thức tính read time bây giờ chính xác hơn: 200 ký tự = 1 phút (tiêu chuẩn industry standard)
