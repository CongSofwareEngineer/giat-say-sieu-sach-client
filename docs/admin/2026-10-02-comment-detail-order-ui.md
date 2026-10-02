# Admin: xem chi tiết đánh giá & sửa UI Quản lý đơn hàng

- Ngày: 2026-10-02
- Phạm vi: admin / comments, admin / orders

## Mục đích
- Trang Quản lý đánh giá chỉ hiện nội dung bị cắt ngắn, admin không xem được đầy đủ tiêu đề, nội dung, hình ảnh, phản hồi.
- Trang Quản lý đơn hàng hiển thị sai UI:
  - Thanh lọc gồm 8 nút trạng thái nằm cùng hàng với ô tìm kiếm (`MyInput` bọc `w-full`) → ô tìm kiếm bị bóp nhỏ, nút bị tràn/xuống dòng lộn xộn.
  - Nhãn trạng thái hardcode tiếng Việt → đổi sang tiếng Anh vẫn hiện tiếng Việt.
  - Phân trang trộn `meta.totalPages` của server với lọc phía client → lọc xong vẫn còn nhiều trang, sang trang 2 bị trống.
  - Đổi trạng thái hiện 2 toast (page và hook cùng toast).
  - Giá/ngày format theo locale trình duyệt, nút Xóa khác style các trang admin khác.

## Luồng xử lý
1. Đánh giá: bấm icon (i) hoặc bấm vào nội dung ở bảng → mở modal "Chi tiết đánh giá", tái sử dụng `CommentCard` (tên, sao, dịch vụ, tiêu đề, nội dung đầy đủ, ảnh bấm phóng to, phản hồi của shop, nút Phản hồi/Xóa).
2. Đơn hàng: header card giống trang Đánh giá/Liên hệ — tiêu đề + ô tìm kiếm + `MySelect` lọc trạng thái.
3. Nhãn trạng thái lấy từ `tracking.status.<STATUS>`; giá dùng `tracking.result.price`; ngày dùng `dayjs` `DD/MM/YYYY HH:mm`.
4. Phân trang tính từ danh sách đã lọc (`PAGE_SIZE` trong `constants/app.ts`).
5. Toast đổi trạng thái đơn / ẩn-hiện đánh giá chỉ do hook (`useAdminOrders`, `useAdminComments`) hiển thị.

## File liên quan
- `app/admin/comments/page.tsx` — thêm `openDetail`, nút xem chi tiết, bỏ toast trùng.
- `app/admin/orders/page.tsx` — làm lại thanh lọc, i18n trạng thái, phân trang, nút xóa icon.
- `components/Comment/CommentCard.tsx` — tái sử dụng làm nội dung modal chi tiết (không sửa).

## Constants / Translation keys mới
- `admin.comments.detail` (vn/en)

## Lưu ý
- Cột "Khách hàng" của đơn vẫn chỉ có `userId` vì API danh sách đơn chưa trả về tên/SĐT khách. Cần server populate user để hiện tên.
- Danh sách đơn đang lấy trang mặc định của server (không truyền `page`/`limit`). Nếu số đơn vượt limit mặc định của server, cần chuyển sang phân trang server-side.
- Trong modal chi tiết, SĐT hiển thị dạng che (logic sẵn có của `CommentCard`); SĐT đầy đủ vẫn xem ở bảng.
