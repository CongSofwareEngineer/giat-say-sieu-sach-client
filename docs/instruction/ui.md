# UI dùng chung (`components/My*`, theme, layout)
> Cập nhật: 2026-10-02

## Tổng quan
Bộ primitive `components/My*` + Header/Footer + token style trong `app/globals.css` (Tailwind v4 + daisyUI theme `giat-say-sieu-sach`). Phong cách: bo tròn lớn, glassmorphism nhẹ, shadow nhuốm màu primary, focus ring mềm; giữ tông sáng, không đổi cấu trúc heading/text/metadata (an toàn SEO). Sub-logic: (1) MySelect, (2) Form input/button & primitive khác, (3) MyTable, (4) Header/Footer.

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

## Translation / Constants
- Dùng lại `common.close`, `common.search`, `common.select`, `common.notFound`.

## Edge cases / nợ kỹ thuật
- Còn text hardcode: tên thương hiệu "Giặt Ủi / Siêu Sạch" + `alt` logo ở Header/Footer, `aria-label='Toggle menu'`, email trong Footer.

## Liên quan
- `docs/instruction/admin.md` (các bảng admin), `docs/instruction/booking.md` (`LaundryForm`).
