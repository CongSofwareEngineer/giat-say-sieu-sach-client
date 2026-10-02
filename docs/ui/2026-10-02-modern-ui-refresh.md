# Làm mới giao diện (modern UI refresh)

- Ngày: 2026-10-02
- Phạm vi: UI dùng chung (components/My*), Header, Footer, form, bảng admin

## Mục đích
Giao diện cũ có nhiều chi tiết lỗi thời (ký tự `▼` `✓` `✕`, `<select>` gốc của trình duyệt, viền trái của toast, shadow xám nặng, nút bo góc vuông). Cập nhật sang phong cách hiện đại: bo tròn lớn, glassmorphism nhẹ, shadow màu primary, focus ring mềm. Giữ tông sáng, không đổi cấu trúc heading/text/metadata để không ảnh hưởng SEO.

## Luồng xử lý
1. `MySelect` viết lại UI + thêm hành vi:
   - Trigger cao 44px, icon `ArrowDownIcon` xoay khi mở, placeholder màu xám nhạt.
   - Menu dạng kính mờ, ô tìm kiếm có icon, option đang chọn có `CheckIcon`.
   - Điều hướng bàn phím: `↑/↓` di chuyển, `Enter` chọn, `Esc` đóng (chặn lan ra modal/drawer), `Tab` đóng.
   - Tự lật menu lên trên khi phía dưới không đủ chỗ (đo chiều cao thực của menu).
   - Hỗ trợ prop `label` và `error` (trước đây khai báo nhưng không render — trang `admin/blog/new` đã truyền vào).
   - Thêm ARIA: `aria-haspopup`, `aria-expanded`, `role=listbox/option`.
2. Đồng bộ style `MyInput`, `MyTextarea` theo cùng token với `MySelect` (h-11, rounded-xl, `focus:ring-4 ring-primary/10`).
3. `MyButton`: hiệu ứng hover nhấc nhẹ, active co lại, focus ring; shadow màu theo variant; `outline` đổi sang tông primary.
4. `MyBadge` dùng nền nhạt + `ring-inset`; `MyPagination` dạng pill; `MyModal`, `MyDrawer`, `Toast`, `MyEmpty`, `MyLoading` làm mới.
5. `globals.css`: `shadow-card`, `shadow-card-hover` đổi sang shadow mềm nhuốm màu primary (ảnh hưởng toàn bộ `MyCard`).
6. Header: nav dạng pill, dropdown kính mờ có animation, nút Đăng ký gradient. Footer: đường sáng phía trên, glow, nút mạng xã hội mới.
7. Thay `<select>` gốc bằng `MySelect` ở `UserForm`, `LaundryForm`. Trong bảng admin (orders/contact) giữ `<select>` gốc (tránh menu bị cắt bởi `overflow-x-auto`) nhưng style lại + icon mũi tên.
8. Bảng admin: header nền xám nhạt chữ in hoa nhỏ, hàng có hover.
9. Thay ký tự `✓` bằng `CheckIcon` (booking, contact, review form, hero trang chủ); `✕` trong drawer bằng `XMarkIcon`.

## File liên quan
- `components/MySelect/index.tsx` — select mới
- `components/MyInput`, `MyTextarea`, `MyButton`, `MyBadge`, `MyPagination`, `MyModal`, `MyDrawer`, `MyEmpty`, `MyLoading`, `Toast` — style
- `components/Header`, `components/Footer` — style
- `components/UserForm`, `components/Chat/LaundryForm.tsx` — thay `<select>` gốc
- `app/admin/*/page.tsx` — style bảng
- `app/globals.css` — shadow utilities
- `app/page.tsx`, `app/login`, `app/register`, `app/booking`, `app/contact` — chi tiết nhỏ

## Constants / Translation keys mới
- Không có. Dùng lại `common.close`, `common.search`, `common.select`, `common.notFound`.

## Lưu ý
- `LaundryForm`: khi chưa có gói dịch vụ active và `serviceType` rỗng, select hiển thị placeholder "Chọn" thay vì option đầu tiên như `<select>` gốc (đúng với giá trị thực).
- Còn text hardcode có sẵn từ trước (không thuộc phạm vi lần này): tên thương hiệu "Giặt Ủi / Siêu Sạch" + `alt` logo trong Header/Footer, `aria-label='Toggle menu'`, email trong Footer.
