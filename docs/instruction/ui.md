# UI dùng chung (`components/My*`, theme, layout)
> Cập nhật: 2026-10-16

## Tổng quan
Bộ primitive `components/My*` + Header/Footer + token style trong `app/globals.css` (Tailwind v4 + daisyUI theme `giat-say-sieu-sach`). Phong cách: bo tròn lớn, glassmorphism nhẹ, shadow nhuốm màu primary, focus ring mềm; giữ tông sáng, không đổi cấu trúc heading/text/metadata (an toàn SEO). Sub-logic: (1) MySelect, (2) Form input/button & primitive khác, (3) MyTable, (4) Header/Footer, (5) Trang chính sách `/policy`.

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
- `MyButton`: hover nhấc nhẹ, active co, focus ring, shadow theo variant, `outline` tông primary.
- `MyBadge` nền nhạt + `ring-inset`; `MyPagination` dạng pill; `MyModal`, `MyDrawer`, `Toast`, `MyEmpty`, `MyLoading` làm mới.

## 3. MyTable (`components/MyTable/index.tsx`)
- Bảng generic cho mọi trang admin (khách hàng, đánh giá, liên hệ, bảng giá, blog, đơn hàng).
- Props: `columns: MyTableColumn<T>[]` (`key`, `title`, `align` left|center|right, `className` td, `headerClassName` th, `render(record, index)`), `data` (đã lọc + phân trang ở client), `rowKey`, `loading`, `emptyMessage`, `pagination`.
- `loading` → `MyLoading`; rỗng → `MyEmpty`; còn lại → bảng + `MyPagination` (chỉ khi `totalPages > 1`).
- Header `th` mặc định `whitespace-nowrap`, nền xám nhạt chữ in hoa nhỏ; hàng có hover.
- `components/ChatMarkdown` vẫn dùng `<table>` riêng (style markdown, không phải bảng dữ liệu).

## 4. Header / Footer
- Header: nav dạng pill, dropdown kính mờ có animation, nút Đăng ký gradient, chuông thông báo (xem `docs/instruction/profile.md`).
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

## Translation / Constants
- Dùng lại `common.close`, `common.search`, `common.select`, `common.notFound`.

## Edge cases / nợ kỹ thuật
- Còn text hardcode: tên thương hiệu "Giặt Ủi / Siêu Sạch" + `alt` logo ở Header/Footer, `aria-label='Toggle menu'`, email trong Footer.

## Liên quan
- `docs/instruction/admin.md` (các bảng admin), `docs/instruction/booking.md` (`LaundryForm`).
