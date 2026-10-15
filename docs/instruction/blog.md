# Blog
> Cập nhật: 2026-10-02

## Tổng quan
Blog có 2 phía: đọc công khai (Server Component, render ở server để SEO) và CRUD trong admin (BlockNote editor). Nội dung bài lưu dạng BlockNote, render ở server bằng `@blocknote/server-util`. Sub-logic: (1) Trang chi tiết blog công khai, (2) Admin tạo/sửa bài (BlockNote), (3) Tương thích runtime (jsdom/Vercel). SEO blog (metadata, JSON-LD, server render danh sách) xem `docs/instruction/seo.md`.

## Dùng chung
- `services/blogClient.ts` — GET công khai, cache `API_CACHE_SECONDS`, dùng trong Server Component.
- `services/blog.ts` — CRUD admin (cần auth). **Không trộn 2 service này.**
- `hooks/admin/useAdminBlog.ts` — hook dữ liệu admin.
- `components/Blog/*` — `BlogContent`, `BlogDetail`, `BlogList`.

## 1. Trang chi tiết blog công khai (`/blog/[slug]`)
### Mục đích
Hiển thị nội dung BlockNote đã render HTML ở server, không crash khi thiếu dữ liệu.
### Entry points
- `components/Blog/BlogContent.tsx` (Server Component) — render nội dung.
- `utils/blogContent.ts` — xử lý/phân tích nội dung (tính thời gian đọc: `length / 200`, 200 ký tự = 1 phút).
### Luồng xử lý / Edge cases
- `content` trống → `BlogContent` trả `null` (không dùng hook vì là Server Component).
- `blog.emptyContent` để sẵn trong language (không hiển thị).

## 2. Admin tạo/sửa bài (`/admin/blog`, `/admin/blog/new`, `/admin/blog/[id]`)
### Mục đích
Admin soạn bài bằng BlockNote, chọn thumbnail (upload Cloudinary).
### Entry points
- `app/admin/blog/[id]/page.tsx` (sửa), `app/admin/blog/new/page.tsx` (tạo), `app/admin/blog/page.tsx` (danh sách, dùng `MyTable`).
- `hooks/admin/useAdminBlog.ts` — `getPostById` bọc `useCallback` để reference ổn định.
### Luồng xử lý
- Trang edit chỉ fetch lại khi `id` (hoặc `getPostById`) đổi; **không** đưa `translate` vào deps `useEffect`/`useCallback` (hàm mới mỗi render → vòng lặp fetch, editor remount, mất nội dung).
- Thumbnail: chọn → tối ưu → khi Lưu mới upload (`blogs`) → create/update (xem `docs/instruction/upload.md`).
### Edge cases / nợ kỹ thuật
- Trang edit còn text hardcode (`'Saved!'`, `'All changes saved!'`, category list, `'Click to edit'`) và toast hiện 2 lần (hook + trang) — cần xử lý.

## 3. Tương thích runtime (jsdom / Vercel)
### Mục đích
`/blog/<slug>` từng trả 500 trên Vercel do `@blocknote/server-util` → jsdom 29 `require()` một ES Module (`@exodus/bytes`).
### Luồng xử lý (cấu hình hiện tại)
- `next.config.ts`: giữ `serverExternalPackages: ['@blocknote/server-util']`.
- `package.json`: ép `jsdom` về `^26.1.0` qua `resolutions` (jsdom 26 dùng `html-encoding-sniffer@4` CommonJS, không còn `@exodus/bytes`). Project dùng **yarn** — không chạy `npm install` (sẽ bỏ qua `resolutions`).
### Edge cases
- Khi nâng `@blocknote/server-util`, kiểm tra lại tương thích jsdom 26.
- Slug không tồn tại hiện trả HTTP 200 kèm `noindex` (do `loading.tsx` stream trước `notFound()`), chưa phải 404 thật — xem `docs/instruction/seo.md`.

## Liên quan
- `docs/instruction/seo.md` (server render + metadata + JSON-LD), `docs/instruction/upload.md` (thumbnail).
