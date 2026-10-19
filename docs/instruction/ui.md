# UI dùng chung (`components/My*`, theme, layout)
> Cập nhật: 2026-10-19

## Tổng quan
Bộ primitive `components/My*` + Header/Footer + token style trong `app/globals.css` (Tailwind v4 + daisyUI theme `giat-say-sieu-sach`). Phong cách: bo tròn lớn, glassmorphism nhẹ, shadow nhuốm màu primary, focus ring mềm; giữ tông sáng, không đổi cấu trúc heading/text/metadata (an toàn SEO). Sub-logic: (1) MySelect, (2) Form input/button & primitive khác, (3) MyTable, (4) Header/Footer, (5) Trang chính sách `/policy`, (6) Thẻ gói Phổ biến, (7) CTA đặt lịch.

## Dùng chung
- Token form chung: `h-11`, `rounded-xl`, `focus:ring-4 ring-primary/10` (áp cho `MyInput`, `MyTextarea`, `MySelect`).
- `app/globals.css` — `shadow-card`, `shadow-card-hover` (ảnh hưởng mọi `MyCard`).
- Icon thay ký tự: `CheckIcon` (thay `✓`), `XMarkIcon` (thay `✕`), `ArrowDownIcon` (thay `▼`) từ `components/Icons/`.

## 1. MySelect (`components/MySelect/index.tsx`)
- Trigger 44px, icon xoay khi mở; menu kính mờ, ô tìm kiếm, option đang chọn có `CheckIcon`.
- Bàn phím: `↑/↓` di chuyển, `Enter` chọn, `Esc` đóng (chặn lan ra modal/drawer), `Tab` đóng.
- Tự lật menu lên trên khi phía dưới thiếu chỗ (đo chiều cao thật).
- Render prop `label`, `error`; ARIA `aria-haspopup`, `aria-expanded`, `role=listbox/option`.
- Thay `<select>` gốc ở `UserForm`, `LaundryForm`. Trong bảng admin có `overflow-x-auto` vẫn giữ `<select>` gốc (tránh menu bị cắt) nhưng style lại.
- Không có giá trị → hiện placeholder "Chọn" (không tự lấy option đầu như `<select>` gốc).

## 2. Primitive khác
- `MyButton`: hover nhấc nhẹ, active co, focus ring, shadow theo variant, `outline` tông primary. Variant `cta` (nền `accent` vàng) **chỉ dành cho hành động đặt lịch** — xem §7.
- `MyBadge` nền nhạt + `ring-inset`; `MyPagination` dạng pill; `MyModal`, `MyDrawer`, `Toast`, `MyEmpty`, `MyLoading` làm mới.

## 3. MyTable (`components/MyTable/index.tsx`)
- Bảng generic cho mọi trang admin (khách hàng, đánh giá, liên hệ, bảng giá, blog, đơn hàng).
- Props: `columns: MyTableColumn<T>[]` (`key`, `title`, `align` left|center|right, `className` td, `headerClassName` th, `render(record, index)`), `data` (đã lọc + phân trang ở client), `rowKey`, `loading`, `emptyMessage`, `pagination`.
- `loading` → `MyLoading`; rỗng → `MyEmpty`; còn lại → bảng + `MyPagination` (chỉ khi `totalPages > 1`).
- Header `th` mặc định `whitespace-nowrap`, nền xám nhạt chữ in hoa nhỏ; hàng có hover.
- `components/ChatMarkdown` vẫn dùng `<table>` riêng (style markdown, không phải bảng dữ liệu).

## 4. Header / Footer
- Header: nav dạng pill, dropdown kính mờ có animation, nút "Đặt lịch" (§7), nút Đăng ký dạng viền, chuông thông báo (xem `docs/instruction/profile.md`).
- **Chọn ngôn ngữ: tạm ẩn** — khối nút 🌐 trong Header đang được comment (kèm import `GlobeIcon`, `LANGUAGE_SUPPORT`, state `isLangOpen`). Site chỉ chạy tiếng Việt: `zustand/language.ts` `storage.getItem` luôn trả `LANGUAGE_SUPPORT.VN`, bỏ qua giá trị `en` đã lưu trong localStorage. Bật lại (khi mở rộng chi nhánh): bỏ comment ở cả 2 file. File `en.json` vẫn giữ, vẫn phải thêm key cho cả 2 ngôn ngữ.
- Footer: đường sáng phía trên, glow, nút mạng xã hội mới.
- Địa chỉ (Footer "Thông tin liên hệ" + trang `/contact`): lấy từ chi nhánh API qua `useGetListBranches` (mỗi chi nhánh: tên + `formatAddress`; trang Liên hệ kèm `openingHours`). Chưa có chi nhánh → `contact.info.addressUpdating`. Không còn dùng `INFO_CONTACT.Address` ở UI. Cache chi nhánh xem `docs/instruction/booking.md` §2.
- Link: Header dropdown "Thêm" có Khuyến mãi (`/promotions`); Footer "Liên kết nhanh" có Khuyến mãi, "Dịch vụ" có Chính sách (`/policy`).

## 5. Trang chính sách `/policy`
### Mục đích
Một trang gom điều khoản dịch vụ, bồi thường, thanh toán, huỷ đơn, bảo mật để khách yên tâm gửi đồ.
### Entry points
- `app/policy/layout.tsx` — metadata (chữ lấy từ `vn.json` → `policy.seo.*`).
- `app/policy/page.tsx` — Server Component, chỉ ghép JSON-LD `WebPage` + breadcrumb và `PolicyContent`.
- `app/policy/components/PolicyContent.tsx` — client component (dùng `useLanguage`).
### Luồng xử lý
- Nội dung là mảng `policy.sections` (`{ id, title, items[] }`) trong `vn.json`/`en.json` → sửa chính sách **chỉ cần sửa file ngôn ngữ**, không đụng code. `translate('policy.sections')` trả mảng (không truyền biến), có guard `Array.isArray`.
- Mục lục dạng pill link anchor `#<id>`; mỗi section là `MyCard` có `scroll-mt-24` (không bị Header che). Cuối trang link Liên hệ (`policy.contact`).
### Translation
- `policy.{seo.*,tag,title,subtitle,updatedAt,toc,contact,sections}`, `menu.policy`.
### Edge cases
- Nội dung hiện là **bản nháp** theo mức phổ biến (báo trong 24h, bồi thường tối đa 10 lần phí dịch vụ…) — cần chủ cửa hàng xác nhận lại. Đổi nội dung thì cập nhật `policy.updatedAt`.

## 6. Thẻ gói "Phổ biến" có viền sáng chạy (trang chủ + `/pricing`)
### Mục đích
Làm nổi bật gói được nhiều người chọn (`plan.popular`) bằng một vòng sáng chạy quanh thẻ.
### Entry points
- `app/globals.css` — class `.plan-popular-glow` (pseudo `::before` vẽ vòng `conic-gradient` xoay, `@property --glow-angle`, keyframes `glowSpin` 3s vô hạn).
- Gắn class khi `plan.popular`: `app/page.tsx` (mục bảng giá trang chủ), `app/pricing/components/PricingPlans.tsx`.
### Luồng xử lý
- Vòng sáng chỉ là viền 3px nằm ngoài thẻ (`mask` exclude), không che nội dung và không đổi layout.
- Màu lấy từ theme `accent` → `primary`. `prefers-reduced-motion: reduce` tắt animation.
### Edge cases
- `MyCard` không có `overflow-hidden` nên vòng không bị cắt; badge "Phổ biến" vẫn nằm trên viền như trước.

## 7. CTA đặt lịch (trang chủ + Header)
### Mục đích
Làm hành động chính của site — đặt lịch giặt — luôn nổi bật và trong tầm tay. Màu vàng `accent` chỉ dùng cho CTA này để tách khỏi tông teal của phần còn lại.
### Entry points
- `components/MyButton` — variant `cta`.
- `app/globals.css` — class `.cta-shine` (vệt sáng `::after` lướt qua, keyframes `ctaShine` 3.5s; tắt khi `prefers-reduced-motion`). Cần đặt trên phần tử `relative` (MyButton đã có).
- `app/page.tsx` (hero) — nút `cta` lớn + icon `CalendarIcon`, link "Theo dõi đơn" dạng text, danh sách 3 điểm cam kết dưới nút.
- `components/Header/index.tsx` — desktop: nút `cta` ở cụm nút bên phải, luôn hiện (cả khi đã đăng nhập); mobile: nút đầu menu. Ẩn khi `pathname === '/booking'`.
- `components/BookingStickyBar` — props `watchRef` (ref tới nút CTA ở hero). Chỉ render trên mobile (`useModalDrawer`, ≤768px).
### Luồng xử lý
- `BookingStickyBar` dùng `IntersectionObserver` trên `watchRef`: hiện khi phần tử đã cuộn lên khỏi màn hình (`top < 0`), ẩn khi cuộn lại về hero. Thanh `fixed bottom-5 left-4 right-[74px]` để chừa chỗ cho nút liên hệ nổi (`ContactFloatingButtons`, góc phải).
### Translation / Constants
- `home.hero.bookCta`, `home.hero.trackCta`, `home.hero.trust1..3`, `menu.booking`.
### Edge cases
- Khi ẩn, thanh sticky có `pointer-events-none`, `aria-hidden`, `tabIndex=-1` để không bấm/tab nhầm.
- Đường dẫn `/booking` vẫn viết literal như phần còn lại của code (chưa có constant route).

## Translation / Constants
- Dùng lại `common.close`, `common.search`, `common.select`, `common.notFound`.

## Edge cases / nợ kỹ thuật
- Còn text hardcode: tên thương hiệu "Giặt Ủi / Siêu Sạch" + `alt` logo ở Header/Footer, `aria-label='Toggle menu'`, email trong Footer.

## Liên quan
- `docs/instruction/admin.md` (các bảng admin), `docs/instruction/booking.md` (`LaundryForm`).
