# Booking (đặt lịch giặt)
> Cập nhật: 2026-10-02

## Tổng quan
Trang `/booking` và form trong Chat dùng **chung** một form và logic đặt lịch thật (`useLaundryBooking`). Khách chỉ chọn tỉnh nơi có chi nhánh phục vụ; đặt xong thì nhớ thông tin cho lần sau. Sub-logic: (1) Form + logic dùng chung, (2) Lọc tỉnh theo chi nhánh, (3) Prefill + nhớ địa chỉ, (4) Ghi chú cho cửa hàng. Tính tiền / điểm / giảm giá xem `docs/instruction/order.md`.

## Dùng chung
- `hooks/useLaundryBooking.ts` — state form, prefill, giá ước tính, submit; nhận `BOOKING_SOURCE` (CHAT | PAGE).
- `components/Chat/LaundryForm.tsx` — UI form (có `onCancel`/`showTitle`/`className` tùy chọn).
- `utils/bookingAddress.ts` — đọc/ghi địa chỉ đặt lịch trong localStorage.
- `services/branch.ts` — danh sách chi nhánh (cache localStorage 1 ngày, `getBranchCities`).
- `agents/tools/booking.ts` — `createLaundryBooking` (nhận `note`, `source`).
- Constants: `LOCAL_STORAGE_KEY` (`branches`, `bookingAddress`), `BRANCH_CACHE_DURATION`, `MAX_BOOKING_NOTE_LENGTH`, `BOOKING_SOURCE`.

## 1. Form + logic dùng chung
### Entry points
- `app/booking/page.tsx` — viết bằng `LaundryForm` + `useLaundryBooking(BOOKING_SOURCE.PAGE)`.
- `components/Chat/index.tsx` — `useLaundryBooking(BOOKING_SOURCE.CHAT)`.
### Luồng xử lý
- Submit (`submitBooking`) → `createLaundryBooking` (API guest order). Trang Booking: thành công hiện mã đơn (`getOrderCode`) + nút theo dõi; lỗi → toast `booking.error`.
- Form khởi tạo rỗng rồi prefill trong effect (tránh lỗi hydration ở `/booking`).

## 2. Lọc tỉnh theo chi nhánh
### Luồng xử lý
- Khi app load, `components/ReactQuery` prefetch chi nhánh (`useGetListBranches` `staleTime` 1 ngày). `BranchService.getBranches()` đọc cache localStorage, quá `BRANCH_CACHE_DURATION` (1 ngày) thì gọi lại API.
- `LaundryForm` lấy `city` các chi nhánh (`getBranchCities`) → chỉ hiện tỉnh trùng tên (so sánh trim + lowercase với `name` LocationApi). Không có chi nhánh / API lỗi / không khớp → hiện tất cả tỉnh.
### Cấu trúc địa chỉ chi nhánh
3 phần như `AddressItem`: `city` (tỉnh, tên theo LocationApi, VD `Hồ Chí Minh`), `district` (phường/xã), `address` (số nhà + đường). Server bắt buộc cả 3.

## 3. Prefill + nhớ địa chỉ
### Luồng xử lý
- Prefill chỉ điền ô còn trống: họ tên/SĐT (user đăng nhập → lần đặt trước localStorage); địa chỉ (địa chỉ mặc định user → lần đặt trước).
- Địa chỉ đã lưu nằm ngoài tỉnh có chi nhánh bị ẩn khỏi dropdown; prefill ngoài vùng phục vụ bị xóa tỉnh/xã để chọn lại.
- Submit thành công → lưu `name/phone/address/district/city` vào `LOCAL_STORAGE_KEY.bookingAddress`.

## 4. Ghi chú cho cửa hàng
- Ô "Ghi chú" (tùy chọn, tối đa `MAX_BOOKING_NOTE_LENGTH`) ở cả Chat và Booking. Ghi chú nối vào `notes` của đơn sau dòng nguồn đặt (`chat.serviceTypeLabel` / `booking.serviceTypeLabel` theo `BOOKING_SOURCE`).

## Translation / Constants
- `chat.laundryForm.note`, `chat.laundryForm.notePlaceholder`, `booking.serviceTypeLabel`, `booking.error`.

## Edge cases / nợ kỹ thuật
- Chỉ lọc theo tỉnh, không lọc phường/xã. Chi nhánh cũ chưa có `city`/`district` → API trả rỗng; chưa chi nhánh nào có `city` → hiện tất cả tỉnh.
- Trang Booking không còn email, địa chỉ trả đồ, ngày/giờ nhận; key `booking.form.*`, `booking.validation.*` còn nhưng chưa dùng.
- `BranchItem.workingHours` (client) chưa khớp `openingHours` (server) — lỗi có sẵn.
- Server cache chi nhánh trong Redis; sau deploy chờ hết TTL hoặc sửa 1 chi nhánh để xóa cache.

## Liên quan
- `docs/instruction/chat.md` (form Tỉnh/Xã), `docs/instruction/order.md` (giá, điểm, giảm 10kg), `docs/instruction/tracking.md`.
