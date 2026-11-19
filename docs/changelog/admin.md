# Admin (`/admin`) — Changelog
> Instruction: docs/instruction/admin.md

## 2026-10-20
- **Quản lý khách hàng**: thêm nút "Đặt lại mật khẩu" ở cột thao tác → modal xác nhận → hiện mật khẩu tạm (một lần) kèm nút copy. Hook `useAdminCustomers` có thêm `resetCustomerPassword` (lỗi → toast `common.error`). Chi tiết luồng ở `docs/instruction/auth.md` §5.
- **Constants / keys mới**:
  - `admin.customers.resetPassword.*`
- **Lý do**:
  - Khách chưa có email cần cửa hàng hỗ trợ lấy lại mật khẩu, không tốn phí SMS.

## 2026-10-19
- **Bảng giá — gói phổ biến**: thêm cột "Phổ biến" dạng công tắc trong bảng admin; bật/tắt cập nhật ngay cờ `popular` qua API (không cần mở form sửa).
- **Lý do**:
  - Trang `/pricing` không hiện gói phổ biến vì cả 4 gói đều `popular: false`; admin cần thấy và đổi nhanh gói nào là phổ biến.

## 2026-10-15
- **Quản lý chi nhánh** (`/admin/branches`): danh sách (cả chi nhánh ẩn), tìm kiếm, thêm/sửa/xoá. Form chọn Tỉnh/Phường từ LocationApi để tên khớp bộ lọc tỉnh ở form đặt lịch; có giờ mở cửa, 4 link mạng xã hội, công tắc hiển thị.
- **Quản lý FAQ** (`/admin/faqs`): danh sách (cả FAQ ẩn), tìm kiếm, thêm/sửa/xoá. Danh mục chọn từ danh sách cố định `FAQ_CATEGORY`, từ khoá nhập cách nhau dấu phẩy, công tắc hiển thị.
- **Sidebar + dashboard**: thêm 2 mục Chi nhánh, Câu hỏi thường gặp; lưới dashboard đổi sang 4 cột ở `xl`.
- **Cache**: sau khi admin lưu/xoá, xoá cache localStorage chi nhánh/FAQ và invalidate query public để trình duyệt admin thấy ngay.
- **Constants / keys mới**:
  - `QUERY_KEYS.{getAdminBranches,getAdminFaqs}`, `FULL_LIST_LIMIT`, `FAQ_CATEGORY`, `BRANCH_SOCIAL`
  - `admin.sidebar.{branches,faqs}`, `admin.branches.*`, `admin.faqs.*`
- **Lý do**:
  - Trước đây muốn đổi chi nhánh / FAQ (FAQ được trợ lý AI dùng) phải sửa thẳng ở backend. BE đã có CRUD, cần UI admin.

## 2026-10-02
- **Đánh giá**: thêm modal "Chi tiết đánh giá" (tái sử dụng `CommentCard`), bỏ toast trùng.
- **Đơn hàng — UI**: thanh lọc làm lại (ô tìm kiếm + `MySelect` trạng thái thay 8 nút tràn hàng); nhãn trạng thái i18n; phân trang tính từ danh sách đã lọc (trước trộn `meta.totalPages` server → trang 2 trống); bỏ toast trùng; giá/ngày format thống nhất; nút xoá dạng icon.
- **Đơn hàng — khách hàng**: hiện tên + SĐT khách (`userId` đã populate; trước hiện `[object Object]`), gọi/copy SĐT, copy mã đơn, tìm kiếm theo tên/SĐT. Thêm type `OrderUser`.
- **Constants / keys mới**:
  - `admin.comments.detail`, `admin.orders.list.{copyCode,copyPhone,callPhone}`
- **Lý do**:
  - Admin không xem được đầy đủ đánh giá; trang đơn hàng vỡ UI, sai ngôn ngữ, sai phân trang, toast 2 lần.
