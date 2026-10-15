# Booking (đặt lịch giặt)
> Cập nhật: 2026-10-15

## Tổng quan
Trang `/booking` và form trong Chat dùng **chung** một form và logic đặt lịch thật (`useLaundryBooking`). Khách chỉ chọn tỉnh nơi có chi nhánh phục vụ; đặt xong thì nhớ thông tin cho lần sau. Sub-logic: (1) Form + logic dùng chung, (2) Lọc tỉnh theo chi nhánh, (3) Prefill + nhớ địa chỉ, (4) Ghi chú cho cửa hàng, (5) Ngày giờ lấy đồ, (6) Số kg ước lượng, (7) Thời gian giặt dự kiến. Tính tiền / điểm / giảm giá xem `docs/instruction/order.md`.

## Dùng chung
- `hooks/useLaundryBooking.ts` — state form, prefill, giá ước tính, submit; nhận `BOOKING_SOURCE` (CHAT | PAGE).
- `components/Chat/LaundryForm.tsx` — UI form (có `onCancel`/`showTitle`/`className` tùy chọn).
- `utils/bookingAddress.ts` — đọc/ghi địa chỉ đặt lịch trong localStorage.
- `services/branch.ts` — danh sách chi nhánh (cache localStorage 1 ngày, `getBranchCities`); admin sửa chi nhánh thì xoá cache localStorage của trình duyệt đó (xem `docs/instruction/admin.md` §3).
- `agents/tools/booking.ts` — `createLaundryBooking` (nhận `note`, `source`, `pickupDate`, `pickupSlot`, `isWeightEstimated`) + helper khung giờ / số kg (§5, §6).
- Constants: `LOCAL_STORAGE_KEY` (`branches`, `bookingAddress`), `BRANCH_CACHE_DURATION`, `MAX_BOOKING_NOTE_LENGTH`, `BOOKING_SOURCE`, `PICKUP_TIME_SLOTS`, `PICKUP_LEAD_HOURS`, `PICKUP_MAX_DAYS_AHEAD`, `INPUT_DATE_FORMAT`, `DISPLAY_DATE_FORMAT`, `DEFAULT_ESTIMATED_WEIGHT`.

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

## 5. Ngày giờ lấy đồ
### Mục đích
Khách không phải tự chọn: form điền sẵn khung giờ trống sớm nhất, chỉ đổi khi cần.
### Luồng xử lý
- Khung giờ cố định `PICKUP_TIME_SLOTS` (8–10, 10–12, …, 18–20). Một khung hợp lệ khi giờ bắt đầu ≥ hiện tại + `PICKUP_LEAD_HOURS` (2h). Ngày chọn được: hôm nay → `PICKUP_MAX_DAYS_AHEAD` (7) ngày, bỏ ngày không còn khung nào.
- Mặc định (`getDefaultPickup`): ngày + khung hợp lệ đầu tiên. VD 14:00 → 16–18 hôm nay; sau 18:00 → 8–10 ngày mai. Điền trong effect prefill của `useLaundryBooking` và sau `resetForm`.
- `LaundryForm`: 2 `MySelect` (Ngày lấy đồ — nhãn "Hôm nay (dd/mm)"/"Ngày mai (dd/mm)" theo `SHORT_DATE_FORMAT`; Khung giờ). Options chỉ dựng sau khi mount (`isMounted`) để tránh lệch hydration (server Vercel chạy UTC).
- Đổi ngày: giữ khung đang chọn nếu ngày mới còn khung đó, không thì lấy khung đầu của ngày.
- Khung hết hạn khi form đang mở: form re-render mỗi `PICKUP_REFRESH_INTERVAL` (60s); `submitBooking` gặp khung hết hạn cũng ép re-render và trả `null`. Khi đó form tự chuyển sang khung đầu tiên còn lại (hết khung → mặc định) và hiện dòng cảnh báo `chat.laundryForm.pickupMoved` thay cho gợi ý, tới khi khách tự chọn lại.
- Submit: API chưa có field ngày giờ → ghi vào `notes` dòng `booking.pickup.note` ("Thời gian lấy đồ: 14:00 – 16:00, ngày 15/10/2026"). Tin nhắn xác nhận trong Chat có thêm dòng "Lấy đồ".
### Translation
- `chat.laundryForm.{pickupDate,pickupTime,pickupHint,pickupMoved}`, `booking.pickup.{today,tomorrow,slot,time,note}`; constants `SHORT_DATE_FORMAT`, `PICKUP_REFRESH_INTERVAL`.
### Edge cases
- Giờ tính theo máy khách (giả định múi giờ VN). Server không kiểm tra giờ lấy đồ.

## 6. Số kg ước lượng (không bắt buộc)
- Ô "Ước lượng số kg (không bắt buộc)" + gợi ý "shipper sẽ cân lại". Để trống hợp lệ; nhập thì phải > 0 (`isWeightValid`).
- Có số kg → hiện "Giá tham khảo" + dòng "Giá cuối tính theo số kg thực tế". Trống → không hiện khối giá.
- Submit khi trống: gửi `DEFAULT_ESTIMATED_WEIGHT` (1 kg) để API nhận đơn + thêm dòng `booking.weightNotEstimated` vào `notes`. Admin sửa số kg thật sau khi cân (xem `docs/instruction/order.md` §5, chỉ được khi `PENDING`/`RECEIVED`).
- Chat xác nhận: khối lượng "Chưa ước lượng", giá "Tính sau khi shipper cân".
- **Dùng điểm cần số kg**: chưa nhập kg thì ô "Dùng điểm" bị khoá + hint `booking.points.needWeight`, hook cũng không gửi `usePoints` (với 1 kg tạm, server chỉ giữ điểm theo giá 1 kg và không tăng lại khi admin sửa kg).
- Translation: `chat.laundryForm.{weight,weightPlaceholder,weightHint,weightValue,weightUnknown,estimatedPrice,priceHint,priceAfterWeighing}`, `booking.weightNotEstimated`, `booking.points.needWeight`, `chat.orderConfirmation`.

## 7. Thời gian giặt dự kiến (ghi chú)
- Chỉ là ghi chú tĩnh, không ảnh hưởng đơn. Trang `/pricing` (`PricingPlans.tsx`) có card "Thời gian giặt dự kiến" đọc mảng `pricing.washTime.items` (`{ service, time }`) trong file ngôn ngữ — sửa nội dung chỉ cần sửa `vn.json`/`en.json`.
- Form đặt lịch có dòng nhắc dưới ô dịch vụ, link sang Bảng giá (`chat.laundryForm.washTimeHint`) mở **tab mới** — trong drawer chat trên mobile, đổi route cùng tab sẽ bị drawer che và đóng drawer thì mất dữ liệu form.

## Translation / Constants
- `chat.laundryForm.note`, `chat.laundryForm.notePlaceholder`, `booking.serviceTypeLabel`, `booking.error`, `pricing.washTime.{title,subtitle,items}`.

## Edge cases / nợ kỹ thuật
- Chỉ lọc theo tỉnh, không lọc phường/xã. Chi nhánh cũ chưa có `city`/`district` → API trả rỗng; chưa chi nhánh nào có `city` → hiện tất cả tỉnh.
- Trang Booking không còn email, địa chỉ trả đồ; key `booking.form.*`, `booking.validation.*` còn nhưng chưa dùng.
- Ngày giờ lấy đồ chỉ nằm trong `notes` — muốn lọc/sắp xếp theo giờ lấy đồ ở admin cần BE thêm field riêng.
- Server cache chi nhánh trong Redis; sau deploy chờ hết TTL hoặc sửa 1 chi nhánh để xóa cache.

## Liên quan
- `docs/instruction/chat.md` (form Tỉnh/Xã), `docs/instruction/order.md` (giá, điểm, giảm 10kg, admin sửa kg), `docs/instruction/tracking.md`, `docs/instruction/promotion.md` (ghi tên khuyến mãi vào ghi chú).
