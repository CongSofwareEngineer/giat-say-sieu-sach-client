# SEO (server render, metadata, JSON-LD)
> Cập nhật: 2026-10-02

## Tổng quan
Các trang công khai quan trọng (blog, bảng giá) render ở server để crawler / mạng xã hội / AI đọc được nội dung; metadata và JSON-LD lấy từ dữ liệu API thật. Sub-logic: (1) Server render blog + pricing, (2) Metadata, (3) JSON-LD, (4) Cache chống 429, (5) Trang 404.

## Dùng chung
- `config/seo.ts` — `buildMetadata`, các schema builder, `toServiceOffers`; render bằng `components/SeoJsonLd`.
- `services/blogClient.ts`, `services/pricing.ts` — GET công khai có cache server.
- `config/baseApi.ts` — `HttpError` (có `status`) để phân biệt 404.
- Constants: `HTTP_STATUS`, `IS_BUILD_PHASE`, `API_CACHE_SECONDS` (60s).

## 1. Server render blog + pricing
- `/blog` và `/pricing` là Server Component, `revalidate = 60`. UI client tách ra `app/blog/components/BlogList.tsx` (lọc category ở client) và `app/pricing/components/PricingPlans.tsx`, nhận dữ liệu qua props.
- `/blog/[slug]`: `generateMetadata` và page cùng gọi `BlogService.getPostBySlug` (Next gộp `fetch` trùng → 1 request). Render theo request (đã bỏ ISR `generateStaticParams`).
  - API 404 → `notFound()`; lỗi khác (sập, timeout) → throw để Google không xoá bài khỏi index.
- Khi `next build` không kết nối được API (`IS_BUILD_PHASE`) → build ra danh sách rỗng thay vì hỏng build; runtime lỗi vẫn throw để giữ bản cache tốt gần nhất.

## 2. Metadata (`buildMetadata`)
- Hỗ trợ `image`, `modifiedTime`, `authors`; field article của OG đặt đúng vị trí.
- Title dùng `absolute` kèm `- <siteName>` (layout `/blog` khai báo title chuỗi làm mất template root).
- Admin pages `noindex`. `app/blog/[slug]/layout.tsx` không còn đọc `BLOG_POSTS`.

## 3. JSON-LD từ dữ liệu API
- `blogSchema(posts)`, `articleSchema(post)` (ảnh, ngày sửa, tác giả thật — gọi trong `components/Blog/BlogDetail.tsx`), `serviceSchema(offers)`, `localBusinessSchema(offers)` (giá qua `toServiceOffers(plans)`).

## 4. Cache chống 429
- Backend giới hạn request theo IP (throttler `login` 10 req/phút đăng ký global). Server Next đi ra từ vài IP Vercel → dễ 429.
- `getPostBySlug`, `getPosts`, `getPlans` dùng `fetch` với `next: { revalidate: API_CACHE_SECONDS }` → nhiều lượt truy cập chỉ tốn 1 request/phút (trình duyệt bỏ qua option `next`).

## 5. Trang 404
- `app/not-found.tsx` — trang 404 chung, text qua `translate()`, Next tự thêm `noindex`.

## Translation / Constants
- `HTTP_STATUS.NOT_FOUND`, `IS_BUILD_PHASE`, `API_CACHE_SECONDS`; `common.notFoundPage.{title,description,backHome}`.

## Edge cases / nợ kỹ thuật
- Throttler `login` ở BE vẫn global; Google crawl nhiều bài trong 1 phút vẫn có thể 429 → nên sửa ở BE (chỉ áp cho `/auth/login`).
- Admin sửa bài/giá mất tối đa 60s mới hiện; muốn ngay thì gọi `revalidatePath` sau khi lưu (chưa làm).
- Có `app/blog/[slug]/loading.tsx` nên response stream → slug sai trả 200 + `noindex` (soft 404). Muốn 404 thật phải bỏ `loading.tsx`.
- `BLOG_POSTS` (`config/seo.ts`) và `useBlogPosts` không còn dùng, chưa xoá (chờ xác nhận).
- `NEXT_PUBLIC_API_APP` gắn cứng lúc `next build` — build với API local thì bản build gọi API local.

## Liên quan
- `docs/instruction/blog.md`.
