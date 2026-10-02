# Render blog và bảng giá ở server (SEO)

- Ngày: 2026-10-02
- Phạm vi: blog, pricing, SEO (metadata + JSON-LD), trang 404

## Mục đích
- Bài blog tạo trong admin bị canonical trỏ về trang chủ, vì metadata chỉ đọc mảng `BLOG_POSTS` gõ tay. Kết quả là bài không được Google index.
- `/blog` và `/pricing` gọi API ở client, nên HTML ban đầu chỉ có chữ "Đang tải". Crawler, mạng xã hội và AI không thấy bài viết và giá.
- Slug không tồn tại vẫn trả trang "Bài viết không tồn tại" như một trang bình thường (soft 404).
- JSON-LD dùng dữ liệu gõ tay (bài viết, giá) không khớp với dữ liệu thật.

## Luồng xử lý
1. `/blog/[slug]`: `generateMetadata` và page cùng gọi `BlogService.getPostBySlug` ở server. Next tự gộp 2 lần `fetch` giống nhau, nên chỉ có 1 request.
   - API trả 404 thì gọi `notFound()` và hiện `app/not-found.tsx`.
   - Lỗi khác (API sập, timeout) thì throw, để Google không xoá bài khỏi index.
2. `/blog/[slug]` dùng ISR: `generateStaticParams` trả `[]` và `revalidate = 60`. Bài được render lần đầu khi có người vào, sau đó cache 60 giây.
3. `/blog` và `/pricing` thành Server Component, có `revalidate = 60`. UI chuyển sang `app/blog/components/BlogList.tsx` và `app/pricing/components/PricingPlans.tsx` (client), nhận dữ liệu qua props.
4. Khi `next build` mà API không kết nối được (`IS_BUILD_PHASE`), trang build ra danh sách rỗng thay vì làm hỏng build. ISR sẽ lấy lại dữ liệu sau 60 giây. Lúc chạy thật, lỗi vẫn được throw để giữ bản cache tốt gần nhất.
5. JSON-LD lấy từ dữ liệu API:
   - `blogSchema(posts)`.
   - `articleSchema(post)`: ảnh, ngày sửa và tác giả thật của bài.
   - `serviceSchema(offers)` và `localBusinessSchema(offers)`: giá lấy qua `toServiceOffers(plans)`.
6. `buildMetadata`:
   - Thêm `image`, `modifiedTime`, `authors`.
   - Các field article của OG đặt đúng vị trí. Trước đây chúng nằm trong key `article` nên Next bỏ qua.
   - Title dùng `absolute` kèm `- <siteName>`. Lý do: layout `/blog` khai báo title dạng chuỗi, làm mất template của root, nên trang con `/blog/[slug]` bị thiếu tên site.
7. `BaseAPI` throw `HttpError` có `status`, để phân biệt 404 với các lỗi khác.

## File liên quan
- `app/blog/[slug]/page.tsx`: fetch bài ở server, `generateMetadata`, `notFound()`, ISR.
- `app/blog/[slug]/layout.tsx`: bỏ metadata đọc từ `BLOG_POSTS`.
- `app/blog/page.tsx`, `app/blog/components/BlogList.tsx`: danh sách blog render ở server và lọc category ở client.
- `app/pricing/page.tsx`, `app/pricing/components/PricingPlans.tsx`: bảng giá render ở server, phần review ở client.
- `app/not-found.tsx`: trang 404 chung, chữ lấy qua `translate()`. Next tự thêm `noindex`.
- `components/Blog/BlogDetail.tsx`: gọi `articleSchema(post)`.
- `config/seo.ts`: các schema nhận dữ liệu API, thêm `toServiceOffers`, sửa `buildMetadata`.
- `config/baseApi.ts`: class `HttpError`.
- `constants/app.ts`: `HTTP_STATUS`, `IS_BUILD_PHASE`.

## Constants / Translation keys mới
- `HTTP_STATUS.NOT_FOUND`, `IS_BUILD_PHASE`
- `common.notFoundPage.title`, `common.notFoundPage.description`, `common.notFoundPage.backHome`

## Lưu ý
- Admin sửa bài hoặc giá thì tối đa 60 giây sau mới hiện trên site. Muốn hiện ngay thì gọi `revalidatePath` sau khi lưu (chưa làm).
- Vì có `app/blog/[slug]/loading.tsx`, response được stream, nên slug sai trả HTTP 200 kèm `<meta name="robots" content="noindex">`. Google không index trang này, nhưng một số công cụ sẽ báo "soft 404". Muốn trả đúng mã 404 thì phải bỏ `loading.tsx`.
- `BLOG_POSTS` (`config/seo.ts`) và hook `useBlogPosts` không còn được dùng. Chưa xoá, chờ xác nhận.
- `useGetListPrice` vẫn được `CommentSection` dùng, giữ nguyên.
- Biến `NEXT_PUBLIC_API_APP` được gắn cứng vào bản build lúc chạy `next build`. Build với API local thì bản build đó gọi API local.
