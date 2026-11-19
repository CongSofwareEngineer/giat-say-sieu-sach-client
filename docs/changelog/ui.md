# UI dùng chung (`components/My*`, theme, layout) — Changelog
> Instruction: docs/instruction/ui.md

## 2026-10-19
- **Thẻ gói "Phổ biến"**: thêm viền sáng chạy quanh thẻ (class `.plan-popular-glow`) ở mục bảng giá trang chủ và trang `/pricing`. Chỉ là vòng viền ngoài thẻ, không đổi layout; tắt animation khi người dùng bật giảm chuyển động.
- **Section "Thời gian giặt dự kiến" (`/pricing`)**: làm lại theo phong cách tech tông sáng — nền sáng có lưới mờ (utility mới `bg-tech-grid`, màu lưới theo `currentColor`) + quầng sáng nhạt, thẻ trắng mờ, thời gian hiển thị chữ lớn dễ đọc, ghi chú đưa lên dưới tiêu đề. Nội dung không đổi (xem `docs/instruction/booking.md` §7).
- **CTA đặt lịch nổi bật**: thêm variant `cta` cho `MyButton` (nền vàng `accent`, chữ tối) + class `.cta-shine` (vệt sáng lướt qua mỗi 3.5s). Hero trang chủ: nút "Đặt lịch ngay" to hơn, có icon lịch; "Theo dõi đơn" hạ xuống dạng text link; thêm 3 dòng cam kết ngắn dưới nút.
- **Header**: thêm nút "Đặt lịch" (variant `cta`) luôn hiện trên desktop, kể cả khi đã đăng nhập; trên mobile nằm đầu menu. Ẩn khi đang ở `/booking`. Nút "Đăng ký" chuyển sang kiểu viền để không tranh với CTA.
- **Thanh đặt lịch sticky (mobile)**: component mới `BookingStickyBar`, chỉ ở trang chủ; hiện khi đã cuộn qua nút CTA ở hero, nằm bên trái nút liên hệ nổi.
- **Chọn ngôn ngữ (Header)**: tạm ẩn nút chọn ngôn ngữ (comment, chưa xóa code); site luôn hiển thị tiếng Việt, kể cả với người trước đó đã chọn English.
- **Constants / keys mới**:
  - `home.hero.trust1`, `home.hero.trust2`, `home.hero.trust3`
- **Lý do**:
  - Yêu cầu làm gói phổ biến nổi bật hơn.
  - Section thời gian giặt cũ bị chê xấu, cần nhìn hiện đại/công nghệ và dễ đọc hơn.
  - Nút đặt lịch ở trang chủ bị chìm: trùng màu gradient với tiêu đề/icon/nút Đăng ký, header không có CTA đặt lịch, mobile phải cuộn ngược lên để đặt.
  - Hiện chỉ phục vụ khách Việt, tạm ẩn chọn ngôn ngữ; sẽ bật lại khi mở rộng chi nhánh.

## 2026-10-16
- **Địa chỉ ở Footer + trang Liên hệ**: hiển thị danh sách chi nhánh thật từ API (`useGetListBranches`) thay cho `INFO_CONTACT.Address`; trang Liên hệ kèm giờ mở cửa từng chi nhánh. Chưa có chi nhánh → "Đang cập nhật".
- **Constants / keys mới**:
  - `contact.info.addressUpdating`
- **Lý do**:
  - API chi nhánh đã có dữ liệu; địa chỉ cứng "Tân Bình, Sài Gòn" là dữ liệu tạm, sai với thực tế.

## 2026-10-15
- **Trang chính sách `/policy`**: 5 mục (Điều khoản dịch vụ, Bồi thường, Thanh toán, Huỷ đơn, Bảo mật) + mục lục anchor + link liên hệ. Nội dung nằm trong `policy.sections` của file ngôn ngữ. `page.tsx` là Server Component, UI ở `PolicyContent`.
- **Footer**: thêm link Chính sách (cột Dịch vụ) và Khuyến mãi (Liên kết nhanh).
- **Constants / keys mới**:
  - `menu.policy`, `policy.*`
- **Lý do**:
  - Trang chủ có cam kết bồi thường nhưng chưa có trang chính sách để khách đọc. Nội dung là bản nháp, cần chủ cửa hàng xác nhận.

## 2026-10-02
- **Modern UI refresh**: `MySelect` viết lại (bàn phím, tự lật menu, ARIA, render `label`/`error`); đồng bộ token `MyInput`/`MyTextarea`; làm mới `MyButton`, `MyBadge`, `MyPagination`, modal/drawer/toast/empty/loading; shadow card nhuốm primary; Header/Footer mới; thay ký tự `✓ ✕ ▼` bằng icon; thay `<select>` gốc bằng `MySelect` ở `UserForm`, `LaundryForm`.
- **MyTable**: component bảng generic, áp cho 6 trang admin (customers, comments, contact, pricing, blog, orders) — gom khối loading / empty / pagination lặp lại. Cột "Thời gian" trang liên hệ căn giữa cả ô.
- **Lý do**:
  - Giao diện cũ lỗi thời (ký tự thô, `<select>` gốc, shadow nặng); 6 trang admin tự viết `<table>` trùng lặp.
