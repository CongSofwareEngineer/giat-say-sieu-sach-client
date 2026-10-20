# Admin (`/admin`)
> Cập nhật: 2026-10-20

## Tổng quan
Dashboard quản trị (client-only, `force-dynamic`, `noindex`): đơn hàng, khách hàng, bảng giá, khuyến mãi, chi nhánh, FAQ, blog, đánh giá, liên hệ. Mọi bảng dùng `MyTable` (xem `docs/instruction/ui.md`). Sub-logic: (1) Quản lý đơn hàng, (2) Quản lý đánh giá, (3) Quản lý chi nhánh, (4) Quản lý FAQ, (5) Bảng giá — gói phổ biến. Blog admin xem `docs/instruction/blog.md`; sửa số kg xem `docs/instruction/order.md`; khuyến mãi xem `docs/instruction/promotion.md` §3; nút "Đặt lại mật khẩu" ở trang khách hàng xem `docs/instruction/auth.md` §5.

## Dùng chung
- `app/admin/AdminShell.tsx` — client shell.
- Hook dữ liệu `hooks/admin/*` (`useAdminOrders`, `useAdminComments`, `useAdminBlog`, `useAdminCustomers`...). **Toast thành công/lỗi chỉ do hook hiển thị**, trang không toast lại.
- Phân trang tính ở client từ danh sách đã lọc, dùng `PAGE_SIZE` trong `constants/app.ts` (10).
- Sidebar (`AdminShell`) và card dashboard (`app/admin/page.tsx`) có link tới mọi trang quản lý, kể cả `/admin/branches`, `/admin/faqs`.
- Trang CRUD đơn giản (khuyến mãi, chi nhánh, FAQ) theo cùng mẫu: header + nút Thêm, ô tìm kiếm, `MyTable`; form mở bằng `useModalDrawer`, xoá qua `AdminDeleteConfirm`.

## 1. Quản lý đơn hàng (`app/admin/orders/page.tsx`)
### Luồng xử lý
- Header card giống trang Đánh giá/Liên hệ: tiêu đề + ô tìm kiếm + `MySelect` lọc trạng thái.
- Nhãn trạng thái từ `tracking.status.<STATUS>`; giá `tracking.result.price`; ngày `dayjs` `DD/MM/YYYY HH:mm`.
- Cột "Khách hàng"/"SĐT": `getOrderUser(order)` trả user nếu `userId` đã populate `{ _id, name, phone }`, chuỗi id cũ → `—`.
- SĐT: mobile (`isMobile` của `useModalDrawer`, ≤ 768px) hiện icon gọi `tel:`; desktop hiện icon copy. Mã đơn có icon copy (mã ngẫu nhiên 8 ký tự, không `#` — xem `tracking.md` §1). `CopyButton` dùng `copyToClipboard`, đổi icon check trong `COPY_FEEDBACK_DURATION`, lỗi → `common.error`.
- Tìm kiếm theo mã, tên và SĐT khách. Nút xoá dạng icon giống các trang admin khác.
### Edge cases
- Danh sách đơn lấy trang mặc định của server (không truyền `page`/`limit`); nếu đơn vượt limit server cần chuyển sang phân trang server-side.

## 2. Quản lý đánh giá (`app/admin/comments/page.tsx`)
- Bấm icon (i) hoặc nội dung trong bảng → modal "Chi tiết đánh giá" tái sử dụng `CommentCard` (tên, sao, dịch vụ, tiêu đề, nội dung đầy đủ, ảnh phóng to, phản hồi, nút Phản hồi/Xoá).
- Trong modal SĐT hiển thị dạng che (logic `CommentCard`); SĐT đầy đủ xem ở bảng.

## 3. Quản lý chi nhánh (`app/admin/branches/page.tsx`)
### Entry points
- `hooks/admin/useAdminBranches.ts` — list (`QUERY_KEYS.getAdminBranches`) + create/update/delete; mỗi mutation invalidate cả `getAdminBranches` và `getListBranches` (public).
- `components/BranchForm` — form thêm/sửa; `services/branch.ts` — `getAdminBranches` (`GET /branches/admin?limit=FULL_LIST_LIMIT`, có cả chi nhánh ẩn), `createBranch`, `updateBranch`, `deleteBranch`.
### Luồng xử lý
- Bảng: tên + địa chỉ (`formatAddress`), SĐT, giờ mở cửa, trạng thái (Đang hiển thị / Đã ẩn). Tìm theo tên, địa chỉ, phường, tỉnh, SĐT.
- Form: tên, SĐT (`VN_LOCAL_PHONE_REGEX`), Tỉnh/Phường chọn bằng `MySelect` từ LocationApi (`useGetProvinces`, `useGetWards`) để **tên khớp với bộ lọc tỉnh ở form đặt lịch** (xem `docs/instruction/booking.md` §2), số nhà/đường, giờ mở cửa (`openingHours`), 4 link mạng xã hội (`BRANCH_SOCIAL`), công tắc hiển thị (`isActive`).
- Luôn gửi đủ `socialMedia` → server thay toàn bộ link (link rỗng = xoá).
- Sau khi lưu/xoá, service xoá cache localStorage `LOCAL_STORAGE_KEY.branches` để trình duyệt admin thấy ngay.
### Edge cases
- Trình duyệt khách khác vẫn giữ cache localStorage tối đa `BRANCH_CACHE_DURATION` (1 ngày); server Redis đã được xoá cache khi sửa.
- Chi nhánh cũ có tỉnh không có trong LocationApi → phải chọn lại tỉnh/phường khi sửa.

## 4. Quản lý FAQ (`app/admin/faqs/page.tsx`)
### Entry points
- `hooks/admin/useAdminFaqs.ts` — list (`QUERY_KEYS.getAdminFaqs`) + create/update/delete; invalidate `getAdminFaqs` và `getListFaqs`.
- `components/FaqForm`; `services/faq.ts` — `getAdminFaqs` (`GET /faqs/admin`, có cả FAQ ẩn), `createFaq`, `updateFaq`, `deleteFaq`.
### Luồng xử lý
- Bảng: câu hỏi + trích câu trả lời, danh mục, trạng thái. Tìm theo câu hỏi/câu trả lời.
- Form: câu hỏi, câu trả lời, danh mục (`MySelect` từ `FAQ_CATEGORY`, nhãn `admin.faqs.categories.<value>` qua `getFaqCategoryLabel`), từ khoá (nhập cách nhau dấu phẩy → mảng `tags`), công tắc hiển thị.
- FAQ ẩn không hiện ở trang chủ và trợ lý AI (tool `faq`/`search` dùng `FaqService.getFaqs()` — chỉ FAQ đang hiển thị).
- Sau khi lưu/xoá, service xoá cache localStorage `LOCAL_STORAGE_KEY.faqs`.
### Edge cases
- Danh mục cũ không thuộc `FAQ_CATEGORY` vẫn hiện trong select khi sửa (giữ nguyên), nhãn hiển thị là giá trị gốc.
- Tối đa `FULL_LIST_LIMIT` (100) FAQ mỗi danh sách — server cũng chặn ở 100.

## 5. Bảng giá — gói phổ biến (`app/admin/pricing/page.tsx`)
### Mục đích
Admin chọn gói nào là "Phổ biến"; trang `/pricing` hiện badge + viền sáng chạy cho gói đó (xem `docs/instruction/ui.md` §6).
### Luồng xử lý
- Bảng có cột "Phổ biến" dạng công tắc (`toggle`): bật/tắt gọi `updatePlan({ id, payload: { popular } })` → `PATCH /laundry-categories/:id` → invalidate `QUERY_KEYS.getListPrice` + toast. Đang lưu thì khóa công tắc.
- Vẫn sửa được trong form `PriceForm` (checkbox "Phổ biến").
- Server đã có field `popular` (schema, DTO, response) và xóa cache Redis khi sửa.
### Edge cases
- Có thể bật nhiều gói cùng lúc, mỗi gói đều được highlight.
- Trang `/pricing` cache ISR 60s nên có thể chậm tối đa ~1 phút mới thấy.
- Trang chủ dùng bảng giá hardcode trong `app/page.tsx`, không theo cờ này.

## Translation / Constants
- `admin.sidebar.{branches,faqs}`, `admin.branches.*`, `admin.faqs.*`; `QUERY_KEYS.{getAdminBranches,getAdminFaqs}`, `FULL_LIST_LIMIT`, `FAQ_CATEGORY`, `BRANCH_SOCIAL`, `FAQ_CACHE_DURATION`, `LOCAL_STORAGE_KEY.faqs`.
- `admin.comments.detail`, `admin.orders.list.{copyCode,copyPhone,callPhone}`; type `OrderUser` (`services/order.ts`).

## Edge cases / nợ kỹ thuật
- Trang khách hàng còn text hardcode (`'Admin'`, `'Khách hàng'`, `'Hoạt động'`, `'Tạm khóa'`) — cần chuyển sang `translate()`.

## Liên quan
- `docs/instruction/ui.md` (MyTable), `docs/instruction/order.md` (sửa số kg), `docs/instruction/blog.md`, `docs/instruction/comment.md`, `docs/instruction/booking.md` §2 (chi nhánh dùng ở form đặt lịch), `docs/instruction/chat.md` (FAQ cho trợ lý AI).
