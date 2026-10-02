# Đồng nhất form đặt lịch (Chat + trang Booking), lọc tỉnh theo chi nhánh, nhớ địa chỉ

- Ngày: 2026-10-02
- Phạm vi: Booking page / Chat AI / Branch

## Mục đích
- Trang `/booking` trước đây là form riêng, submit giả (`setTimeout`), dịch vụ/giá hardcode → giờ dùng chung form và logic đặt lịch thật với Chat.
- Khách chỉ được chọn tỉnh nơi có chi nhánh phục vụ.
- Đặt lịch xong thì nhớ thông tin để lần sau không phải nhập lại.

## Cấu trúc địa chỉ chi nhánh
Địa chỉ chi nhánh tách 3 phần giống địa chỉ khách hàng (`AddressItem`):
- `city` — Tỉnh/Thành phố (tên theo LocationApi, VD `Hồ Chí Minh`)
- `district` — Phường/Xã (tên theo LocationApi, VD `Sài Gòn`)
- `address` — Địa chỉ cụ thể: số nhà, tên đường (VD `123 Nguyễn Huệ`)

Server bắt buộc cả 3 khi tạo chi nhánh. Client hiển thị địa chỉ đầy đủ bằng `formatAddress`.

## Luồng xử lý
1. Khi app load, `components/ReactQuery` prefetch danh sách chi nhánh. `BranchService.getBranches()` đọc cache localStorage (`LOCAL_STORAGE_KEY.branches`), cache quá 1 ngày (`BRANCH_CACHE_DURATION`) thì gọi lại API và lưu lại.
2. `LaundryForm` lấy `city` của các chi nhánh (`getBranchCities`) → chỉ hiện các tỉnh trùng tên (so sánh trim + lowercase với `name` của LocationApi). Không có chi nhánh / API lỗi / không tỉnh nào khớp → hiện tất cả tỉnh.
3. Địa chỉ đã lưu nằm ngoài các tỉnh có chi nhánh bị ẩn khỏi dropdown. Địa chỉ prefill nằm ngoài vùng phục vụ sẽ bị xoá tỉnh/xã để user chọn lại.
4. Prefill form (hook `useLaundryBooking`), chỉ điền vào ô còn trống:
   - Họ tên/SĐT: user đăng nhập → thông tin đặt lịch lần trước (localStorage).
   - Địa chỉ: địa chỉ mặc định của user đăng nhập (ưu tiên) → địa chỉ đặt lịch lần trước.
   - Form khởi tạo rỗng rồi mới prefill trong effect để tránh lỗi hydration ở trang `/booking`.
5. Submit (`submitBooking`) → `createLaundryBooking` (API guest order). Thành công thì lưu `name/phone/address/district/city` vào `LOCAL_STORAGE_KEY.bookingAddress`.
6. Thêm ô "Ghi chú cho cửa hàng" (tuỳ chọn, tối đa `MAX_BOOKING_NOTE_LENGTH`) ở cả Chat và trang Booking. Ghi chú được nối vào `notes` của đơn sau dòng nguồn đặt (`chat.serviceTypeLabel` / `booking.serviceTypeLabel` theo `BOOKING_SOURCE`).
7. Trang Booking: thành công → hiện mã đơn (`getOrderCode`) và nút theo dõi đơn; lỗi → toast `booking.error`.

## File liên quan
- `hooks/useLaundryBooking.ts` — (mới) state form, prefill, giá ước tính, submit dùng chung cho Chat và Booking
- `utils/bookingAddress.ts` — (mới) đọc/ghi địa chỉ đặt lịch trong localStorage
- `components/Chat/LaundryForm.tsx` — lọc tỉnh theo chi nhánh, ô ghi chú, `onCancel`/`showTitle`/`className` tuỳ chọn
- `components/Chat/index.tsx` — bỏ logic form riêng, dùng `useLaundryBooking(BOOKING_SOURCE.CHAT)`
- `components/Chat/types.ts` — thêm `note` vào `LaundryFormData`
- `app/booking/page.tsx` — viết lại bằng `LaundryForm` + `useLaundryBooking(BOOKING_SOURCE.PAGE)`
- `services/branch.ts` — thêm `city`, cache 1 ngày, `getBranchCities`
- `hooks/reactQuery/useGetListBranches.ts` — `staleTime` = 1 ngày
- `components/ReactQuery/index.tsx` — prefetch chi nhánh khi load app
- `agents/tools/booking.ts` — nhận `note`, `source`
- `agents/tools/order.ts` — tool `get_branches` hiển thị địa chỉ đầy đủ bằng `formatAddress`
- Server `server-giat-say-sieu-sach-nestjs/src/module/branch/*` — thêm field `district`, `city` (schema, create/update/response DTO, service), `address` chỉ còn số nhà + đường, seed demo tách lại theo phường mới của HCM

## Constants / Translation keys mới
- Server: `Branch.district`, `Branch.city`
- `LOCAL_STORAGE_KEY` (`branches`, `bookingAddress`), `BRANCH_CACHE_DURATION`, `MAX_BOOKING_NOTE_LENGTH`, `BOOKING_SOURCE`
- `chat.laundryForm.note`, `chat.laundryForm.notePlaceholder`, `booking.serviceTypeLabel`, `booking.error`

## Lưu ý
- Cần deploy server và cập nhật các chi nhánh cũ: `city`, `district` đúng tên của LocationApi (VD `Hồ Chí Minh`, không phải `TP.HCM`), `address` chỉ giữ số nhà + đường. Chi nhánh cũ chưa có `city`/`district` thì API trả chuỗi rỗng; chưa chi nhánh nào có `city` thì client vẫn hiện tất cả tỉnh.
- Hiện chỉ lọc theo tỉnh, không lọc phường/xã của khách theo phường của chi nhánh.
- Server cache danh sách chi nhánh trong Redis; sau deploy cần chờ hết TTL hoặc tạo/sửa 1 chi nhánh để xoá cache.
- Seed demo chỉ tạo chi nhánh chưa tồn tại (theo tên), chi nhánh cũ không tự có `city`/`district`. Phường trong seed được đổi tay sang phường mới sau sáp nhập (Bến Nghé → Sài Gòn, P5 Q3 → Bàn Cờ, Tân Phong → Tân Mỹ, P17 Bình Thạnh → Gia Định, P12 Tân Bình → Bảy Hiền), cần kiểm tra lại nếu dùng thật.
- Trang Booking không còn email, địa chỉ trả đồ, ngày/giờ nhận. Các key `booking.form.*`, `booking.validation.*` không còn dùng nhưng chưa xoá.
- `BranchItem.workingHours` ở client không khớp field `openingHours` của server (lỗi có sẵn, chưa sửa).
