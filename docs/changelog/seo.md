# SEO (server render, metadata, JSON-LD) — Changelog
> Instruction: docs/instruction/seo.md

## 2026-10-15
- **Sitemap**: thêm `additionalPaths` lấy toàn bộ bài blog đã publish từ API → sitemap có `/blog/<slug>` (lastmod theo `updatedAt`). Loại `/login`, `/register`, `/profile`, `/manifest.json` khỏi sitemap. Config tự load `.env*` bằng `@next/env`.
- **robots.txt**: sửa key sai `robotsTxtPolicies` → `robotsTxtOptions.policies`, giờ robots.txt mới thật sự có `Disallow: /admin/, /api/, /profile`.
- **Trang lỗi**: `app/error.tsx` (lỗi trong route, giữ Header/Footer, nút Thử lại + Về trang chủ, hiện mã lỗi `digest`) và `app/global-error.tsx` (lỗi ở root layout, tự render `<html>/<body>`).
- **Constants / keys mới**:
  - `common.errorPage.{title,description,retry,code}`
- **Lý do**:
  - Trước đây sitemap không có bài blog nào (route động) và lại có các trang cần đăng nhập. robots.txt sinh ra không có Disallow vì sai tên option.
  - Chưa có trang lỗi → khi lỗi runtime người dùng thấy màn hình lỗi mặc định của Next.

## 2026-10-02
- **Server render**: `/blog`, `/pricing` thành Server Component (`revalidate = 60`); `/blog/[slug]` fetch ở server, `generateMetadata`, 404 → `notFound()`, lỗi khác throw. Build không có API → danh sách rỗng.
- **Metadata**: `buildMetadata` thêm `image`, `modifiedTime`, `authors`, sửa vị trí field OG article, title `absolute`. Bỏ metadata đọc `BLOG_POSTS` gõ tay.
- **JSON-LD**: các schema nhận dữ liệu API; thêm `toServiceOffers`.
- **Fix 500 (429) production**: GET công khai cache `API_CACHE_SECONDS` trên server Next (15 lượt tải → 1 request backend).
- **404**: thêm `app/not-found.tsx`; `BaseAPI` ném `HttpError` có `status`.
- **Constants / keys mới**:
  - `HTTP_STATUS.NOT_FOUND`, `IS_BUILD_PHASE`, `API_CACHE_SECONDS`
  - `common.notFoundPage.{title,description,backHome}`
- **Lý do**:
  - Bài blog mới bị canonical về trang chủ (không được index); HTML ban đầu chỉ có "Đang tải"; soft 404; JSON-LD không khớp dữ liệu thật; `/blog/<slug>` 500 do backend trả 429.
