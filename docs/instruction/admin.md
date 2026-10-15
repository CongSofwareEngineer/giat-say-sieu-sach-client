# Admin (`/admin`)
> Cập nhật: 2026-10-15

## Tổng quan
Dashboard quản trị (client-only, `force-dynamic`, `noindex`): đơn hàng, khách hàng, bảng giá, khuyến mãi, blog, đánh giá, liên hệ. Mọi bảng dùng `MyTable` (xem `docs/instruction/ui.md`). Sub-logic: (1) Quản lý đơn hàng, (2) Quản lý đánh giá. Blog admin xem `docs/instruction/blog.md`; sửa số kg xem `docs/instruction/order.md`; khuyến mãi xem `docs/instruction/promotion.md` §3.

## Dùng chung
- `app/admin/AdminShell.tsx` — client shell.
- Hook dữ liệu `hooks/admin/*` (`useAdminOrders`, `useAdminComments`, `useAdminBlog`, `useAdminCustomers`...). **Toast thành công/lỗi chỉ do hook hiển thị**, trang không toast lại.
- Phân trang tính ở client từ danh sách đã lọc, dùng `PAGE_SIZE` trong `constants/app.ts` (10).

## 1. Quản lý đơn hàng (`app/admin/orders/page.tsx`)
### Luồng xử lý
- Header card giống trang Đánh giá/Liên hệ: tiêu đề + ô tìm kiếm + `MySelect` lọc trạng thái.
- Nhãn trạng thái từ `tracking.status.<STATUS>`; giá `tracking.result.price`; ngày `dayjs` `DD/MM/YYYY HH:mm`.
- Cột "Khách hàng"/"SĐT": `getOrderUser(order)` trả user nếu `userId` đã populate `{ _id, name, phone }`, chuỗi id cũ → `—`.
- SĐT: mobile (`isMobile` của `useModalDrawer`, ≤ 768px) hiện icon gọi `tel:`; desktop hiện icon copy. Mã đơn có icon copy (6 ký tự, không `#`). `CopyButton` dùng `copyToClipboard`, đổi icon check trong `COPY_FEEDBACK_DURATION`, lỗi → `common.error`.
- Tìm kiếm theo mã, tên và SĐT khách. Nút xoá dạng icon giống các trang admin khác.
### Edge cases
- Danh sách đơn lấy trang mặc định của server (không truyền `page`/`limit`); nếu đơn vượt limit server cần chuyển sang phân trang server-side.

## 2. Quản lý đánh giá (`app/admin/comments/page.tsx`)
- Bấm icon (i) hoặc nội dung trong bảng → modal "Chi tiết đánh giá" tái sử dụng `CommentCard` (tên, sao, dịch vụ, tiêu đề, nội dung đầy đủ, ảnh phóng to, phản hồi, nút Phản hồi/Xoá).
- Trong modal SĐT hiển thị dạng che (logic `CommentCard`); SĐT đầy đủ xem ở bảng.

## Translation / Constants
- `admin.comments.detail`, `admin.orders.list.{copyCode,copyPhone,callPhone}`; type `OrderUser` (`services/order.ts`).

## Edge cases / nợ kỹ thuật
- Trang khách hàng còn text hardcode (`'Admin'`, `'Khách hàng'`, `'Hoạt động'`, `'Tạm khóa'`) — cần chuyển sang `translate()`.

## Liên quan
- `docs/instruction/ui.md` (MyTable), `docs/instruction/order.md` (sửa số kg), `docs/instruction/blog.md`, `docs/instruction/comment.md`.
