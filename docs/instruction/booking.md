# Booking (đặt lịch giặt)
> Cập nhật: 2026-10-16

## Tổng quan
Trang `/booking` và form trong Chat dùng **chung** một form và logic đặt lịch thật (`useLaundryBooking`). Khách chỉ chọn tỉnh nơi có chi nhánh phục vụ; đặt xong thì nhớ thông tin cho lần sau. Sub-logic: (1) Form + logic dùng chung, (2) Lọc tỉnh theo chi nhánh, (3) Prefill + nhớ địa chỉ, (4) Ghi chú cho cửa hàng, (5) Ngày giờ lấy + trả đồ, (6) Số kg ước lượng, (7) Thời gian giặt dự kiến. Tính tiền / điểm / giảm giá xem `docs/instruction/order.md`.

## Dùng chung
- `hooks/useLaundryBooking.ts` — state form, prefill, giá ước tính, submit; nhận `BOOKING_SOURCE` (CHAT | PAGE).
- `components/Chat/LaundryForm.tsx` — UI form (có `onCancel`/`showTitle`/`className` tùy chọn).
- `utils/bookingAddress.ts` — đọc/ghi địa chỉ đặt lịch trong localStorage.
- `services/branch.ts` — danh sách chi nhánh (cache localStorage 1 ngày, `getBranchCities`); admin sửa chi nhánh thì xoá cache localStorage của trình duyệt đó (xem `docs/instruction/admin.md` §3).
- `agents/tools/booking.ts` — `createLaundryBooking` (nhận `note`, `source`, `pickupDate`, `pickupSlot`, `returnDate`, `returnSlot`, `isWeightEstimated`) + helper khung giờ / số kg (§5, §6).
- Constants: `LOCAL_STORAGE_KEY` (`branches`, `bookingAddress`), `BRANCH_CACHE_DURATION`, `MAX_BOOKING_NOTE_LENGTH`, `BOOKING_SOURCE`, `PICKUP_TIME_SLOTS`, `PICKUP_LEAD_HOURS`, `WASH_DURATION_HOURS`, `PICKUP_MAX_DAYS_AHEAD`, `INPUT_DATE_FORMAT`, `DISPLAY_DATE_FORMAT`, `DEFAULT_ESTIMATED_WEIGHT`.

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

## 5. Ngày giờ lấy + trả đồ
### Mục đích
Khách chọn khi nào shipper đến lấy đồ và khi nào trả đồ. Cả hai được điền sẵn khung sớm nhất, chỉ đổi khi cần.
### Luồng xử lý
- Khung giờ dùng chung `PICKUP_TIME_SLOTS`, mỗi khung 1 tiếng, phủ giờ hoạt động của cửa hàng 6:00–23:00 (6–7, 7–8, …, 22–23). Dòng gợi ý lấy đồ `chat.laundryForm.pickupHint` hiện giờ mở/đóng cửa ({open}/{close} lấy từ khung đầu/cuối của `PICKUP_TIME_SLOTS`). Ngày chọn được: tối đa `PICKUP_MAX_DAYS_AHEAD` (7) ngày, bỏ ngày không còn khung hợp lệ.
- **Lấy đồ** (`getPickupDates`, `getAvailablePickupSlots`, `isPickupValid`): khung hợp lệ khi giờ bắt đầu ≥ hiện tại + `PICKUP_LEAD_HOURS` (2h). Ngày liệt kê từ hôm nay.
- **Trả đồ** (`getReturnDates`, `getAvailableReturnSlots`, `isReturnValid`): khung hợp lệ khi giờ bắt đầu ≥ **giờ bắt đầu khung lấy đồ** + `WASH_DURATION_HOURS` (1h) — tức trả được ngay khung kế tiếp, cùng ngày. Ngày liệt kê từ ngày lấy đồ. Chưa có khung lấy đồ hợp lệ → không có lựa chọn.
- Mặc định (`getDefaultPickup` → gồm cả `getDefaultReturn`): khung lấy đồ sớm nhất (hôm nay nếu còn) + khung trả sớm nhất, **cùng ngày với ngày lấy** khi còn khung. VD 10:00 ngày 15 → lấy 12–13, trả 13–14 ngày 15; 21:30 ngày 15 → lấy 6–7, trả 7–8 ngày 16; chọn lấy 22–23 → trả 6–7 ngày hôm sau. Điền trong effect prefill của `useLaundryBooking` và sau `resetForm`.
- `LaundryForm`: 2 hàng `MySelect` (Ngày + Khung giờ lấy đồ; Ngày + Khung giờ trả đồ). Nhãn ngày "Hôm nay (dd/mm)"/"Ngày mai (dd/mm)" theo `SHORT_DATE_FORMAT`. Options chỉ dựng sau khi mount (`isMounted`) để tránh lệch hydration (server Vercel chạy UTC).
- Đổi ngày (lấy hoặc trả): giữ khung đang chọn nếu ngày mới còn khung đó, không thì lấy khung đầu của ngày.
- Đổi lấy đồ làm trả đồ không còn hợp lệ → effect tự chỉnh: giữ ngày trả nếu còn khung (lấy khung đầu), không thì về trả đồ mặc định. Dòng gợi ý `chat.laundryForm.returnHint` ({hours} = `WASH_DURATION_HOURS`), nói rõ trả được trong cùng ngày.
- Khung lấy đồ hết hạn khi form đang mở: form re-render mỗi `PICKUP_REFRESH_INTERVAL` (60s); `submitBooking` gặp khung lấy/trả không hợp lệ cũng ép re-render và trả `null`. Form tự chuyển sang khung đầu còn lại (hết khung → mặc định) và hiện `chat.laundryForm.pickupMoved`, tới khi khách tự chọn lại.
- Submit: API chưa có field ngày giờ → ghi vào `notes` 2 dòng `booking.pickup.note` ("Thời gian lấy đồ: 14:00 – 17:00, ngày 15/10/2026") và `booking.pickup.returnNote` ("Thời gian trả đồ: …"). Tin xác nhận trong Chat có dòng "Lấy đồ" và "Trả đồ".
### Translation
- `chat.laundryForm.{pickupDate,pickupTime,pickupHint,pickupMoved,returnDate,returnTime,returnHint}`, `booking.pickup.{today,tomorrow,slot,time,note,returnNote}`; constants `SHORT_DATE_FORMAT`, `PICKUP_REFRESH_INTERVAL`.
### Edge cases
- Giờ tính theo máy khách (giả định múi giờ VN). Server không kiểm tra giờ lấy/trả.
- Khoảng cách lấy → trả chỉ là tối thiểu 1h, không theo thời gian giặt thực tế của dịch vụ (xem §7) — khách tự chọn giờ trả phù hợp.

## 6. Số kg ước lượng (không bắt buộc)
- Ô "Ước lượng số kg (không bắt buộc)" + gợi ý "shipper sẽ cân lại". Để trống hợp lệ; nhập thì phải > 0 (`isWeightValid`).
- Có số kg → hiện "Giá tham khảo" + dòng "Giá cuối tính theo số kg thực tế". Trống → không hiện khối giá.
- Submit khi trống: gửi `DEFAULT_ESTIMATED_WEIGHT` (1 kg) để API nhận đơn + thêm dòng `booking.weightNotEstimated` vào `notes`. Admin sửa số kg thật sau khi cân (xem `docs/instruction/order.md` §5, chỉ được khi `PENDING`/`RECEIVED`).
- Chat xác nhận: khối lượng "Chưa ước lượng", giá "Tính sau khi shipper cân".
- **Dùng điểm cần số kg**: chưa nhập kg thì ô "Dùng điểm" bị khoá + hint `booking.points.needWeight`, hook cũng không gửi `usePoints` (với 1 kg tạm, server chỉ giữ điểm theo giá 1 kg và không tăng lại khi admin sửa kg).
- Translation: `chat.laundryForm.{weight,weightPlaceholder,weightHint,weightValue,weightUnknown,estimatedPrice,priceHint,priceAfterWeighing}`, `booking.weightNotEstimated`, `booking.points.needWeight`, `chat.orderConfirmation`.

## 7. Thời gian giặt dự kiến (ghi chú)
- Chỉ là ghi chú tĩnh, không ảnh hưởng đơn (khung trả đồ chỉ cần cách lấy đồ `WASH_DURATION_HOURS`, §5). Trang `/pricing` (`PricingPlans.tsx`) có section "Thời gian giặt dự kiến" đọc mảng `pricing.washTime.items` (`{ service, time }`) trong file ngôn ngữ — sửa nội dung chỉ cần sửa `vn.json`/`en.json`.
- UI: section nền `bg-linear-default` bo góc, tiêu đề + icon lịch ở giữa; lưới thẻ 1/2/3 cột (mobile/sm/lg), mỗi thẻ có số thứ tự, tên dịch vụ, badge thời gian (màu `secondary`); `pricing.washTime.subtitle` hiện ở cuối như ghi chú kèm `InfoIcon`.
- Form đặt lịch có dòng nhắc dưới ô dịch vụ, link sang Bảng giá (`chat.laundryForm.washTimeHint`) mở **tab mới** — trong drawer chat trên mobile, đổi route cùng tab sẽ bị drawer che và đóng drawer thì mất dữ liệu form.

## Translation / Constants
- `chat.laundryForm.note`, `chat.laundryForm.notePlaceholder`, `booking.serviceTypeLabel`, `booking.error`, `pricing.washTime.{title,subtitle,items}`.

## Edge cases / nợ kỹ thuật
- Chỉ lọc theo tỉnh, không lọc phường/xã. Chi nhánh cũ chưa có `city`/`district` → API trả rỗng; chưa chi nhánh nào có `city` → hiện tất cả tỉnh.
- Trang Booking không còn email, địa chỉ trả đồ; key `booking.form.*`, `booking.validation.*` còn nhưng chưa dùng.
- Ngày giờ lấy/trả đồ chỉ nằm trong `notes` — muốn lọc/sắp xếp theo giờ lấy/trả ở admin cần BE thêm field riêng.
- Server cache chi nhánh trong Redis; sau deploy chờ hết TTL hoặc sửa 1 chi nhánh để xóa cache.

## Liên quan
- `docs/instruction/chat.md` (form Tỉnh/Xã), `docs/instruction/order.md` (giá, điểm, giảm 10kg, admin sửa kg), `docs/instruction/tracking.md`, `docs/instruction/promotion.md` (ghi tên khuyến mãi vào ghi chú).
