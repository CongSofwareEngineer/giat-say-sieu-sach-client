# Booking (đặt lịch giặt) — Changelog
> Instruction: docs/instruction/booking.md

## 2026-10-29
- **Form + logic dùng chung** (§1): `createLaundryBooking` (trang `/booking` và form trong chat) gửi thêm `referralCode` (mã từ link `?ref=` đã lưu) khi gọi `POST /laundry-orders/guest`. Server chỉ dùng khi SĐT chưa có tài khoản. Chi tiết `docs/instruction/profile.md` §8.
- **Constants / keys mới**:
  - `CreateGuestOrderPayload.referralCode`
- **Lý do**:
  - Khách được giới thiệu thường đặt lịch luôn mà không đăng ký; vẫn cần ghi nhận người giới thiệu để tính hoa hồng.

## 2026-10-17
- **reCAPTCHA v3 chạy ngầm cho đơn guest**:
  - form đặt lịch (Chat + `/booking`) preload script;
  - lúc submit lấy token action `guest_order` và gửi `captchaToken` lên `POST /laundry-orders/guest`;
  - badge ẩn, thay bằng dòng ghi chú có link Privacy / Terms trong form.
- **Thông báo khi bị chặn**: server trả 429 (quá 3 đơn/phút hoặc SĐT đã có 3 đơn chưa xong) → hiện `booking.tooManyOrders` thay vì lỗi chung, ở cả Chat và trang Booking.
- **Constants / keys mới**:
  - `RECAPTCHA`, `RECAPTCHA_ACTION.GUEST_ORDER`, `MAX_ACTIVE_ORDERS_PER_PHONE`, `HTTP_STATUS.TOO_MANY_REQUESTS`
  - `booking.tooManyOrders`, `chat.laundryForm.recaptchaNotice`, `chat.laundryForm.recaptchaPrivacy`, `chat.laundryForm.recaptchaTerms`
  - Env: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- **Lý do**:
  - Chặn spam API tạo đơn từ khách chưa đăng ký đặt qua chatbot (server: `docs/changelog/2026-10-17_order.md`).
  - Chỉ dùng giải pháp miễn phí.

## 2026-10-16
- **Khung giờ lấy / trả đồ**: đổi từ 4 khung 3 tiếng (8–20h) sang khung 1 tiếng phủ giờ hoạt động 6:00–23:00 (`PICKUP_TIME_SLOTS`). Dòng gợi ý dưới ô lấy đồ hiện giờ mở/đóng cửa.
- **Giờ lấy đồ mặc định = khung hiện tại**: khung lấy đồ chọn được khi chưa kết thúc (`PICKUP_LEAD_HOURS` 2 → 0, so với giờ kết thúc khung), nên đặt lúc 10:20 thì lấy 10–11 ngay. Ngoài giờ mở cửa → khung 6–7 kế tiếp. Dòng gợi ý nói rõ shipper đến trong khung hiện tại, giờ chỉ là ước lượng.
- **Giờ trả đồ**: chỉ cần bắt đầu sau giờ bắt đầu khung lấy đồ ít nhất 1 tiếng (`WASH_DURATION_HOURS` = 1, tính từ đầu khung lấy thay vì cuối khung + 24h). Mặc định trả cùng ngày, khung ngay sau khung lấy.
- **Cache chi nhánh**: `BranchService.getBranches()` không lưu cache khi API trả rỗng, bỏ qua cache rỗng cũ, và lọc bỏ chi nhánh `isActive === false`.
- **Constants / keys mới**:
  - Sửa giá trị: `PICKUP_TIME_SLOTS`, `WASH_DURATION_HOURS` (24 → 1), `PICKUP_LEAD_HOURS` (2 → 0)
  - Sửa nội dung: `chat.laundryForm.pickupHint` (thêm `{open}`/`{close}`), `chat.laundryForm.returnHint`
- **Lý do**:
  - Yêu cầu cửa hàng: lấy và trả chỉ cần cách nhau 1 tiếng, cho phép cùng ngày; cửa hàng hoạt động 6h–23h nên mở rộng khung giờ và cho khách biết.
  - Khách đặt mà phải chờ vài tiếng mới được lấy đồ là trải nghiệm dở; lấy ngay trong khung hiện tại cho thấy cửa hàng làm việc nhanh. Khung giờ chỉ là ước lượng.
  - Cache chi nhánh: trước khi API có dữ liệu, trình duyệt đã lưu list rỗng 1 ngày → chat/footer/form không thấy chi nhánh mới tạo.

## 2026-10-15
- **Ngày giờ lấy đồ + trả đồ**: form (trang `/booking` + Chat) có 2 cặp ô chọn: "Ngày/Khung giờ lấy đồ" và "Ngày/Khung giờ trả đồ", khách chọn được cả hai. Khung giờ 3 tiếng (8–11, 11–14, 14–17, 17–20). Lấy đồ: khung bắt đầu ≥ hiện tại + 2h, mặc định khung sớm nhất (hôm nay nếu còn). Trả đồ: phải bắt đầu ≥ cuối khung lấy đồ + `WASH_DURATION_HOURS` (24h), mặc định khung sớm nhất; đổi lấy đồ làm trả đồ không còn hợp lệ thì tự chỉnh. Khung lấy đồ hết hạn khi form đang mở (kiểm tra mỗi 60s và lúc bấm đặt) tự chuyển sang khung kế tiếp kèm cảnh báo. Cả hai ghi vào `notes` của đơn và tin xác nhận trong Chat.
- **Số kg ước lượng**: không còn bắt buộc; ghi rõ shipper sẽ cân lại, giá đổi thành "Giá tham khảo". Bỏ trống → gửi tạm 1 kg + ghi chú "Khách chưa ước lượng số kg" để admin cập nhật sau khi cân. Ô "Dùng điểm" bị khoá khi chưa nhập kg.
- **Dữ liệu chi nhánh**: `BranchItem` đổi `workingHours` → `openingHours` (khớp server), thêm `socialMedia`, `isActive`. Admin sửa chi nhánh thì xoá cache localStorage chi nhánh (xem changelog admin cùng ngày).
- **Thời gian giặt dự kiến**: khối ghi chú ở trang Bảng giá (nội dung trong file ngôn ngữ) — thiết kế dạng section nền gradient, mỗi dịch vụ một thẻ (số thứ tự, tên, badge thời gian), ghi chú "tính từ lúc shipper lấy đồ" ở cuối kèm icon Info. Dòng nhắc kèm link (mở tab mới) dưới ô dịch vụ trong form.
- **Constants / keys mới**:
  - `PICKUP_TIME_SLOTS`, `PICKUP_LEAD_HOURS`, `WASH_DURATION_HOURS`, `PICKUP_MAX_DAYS_AHEAD`, `PICKUP_REFRESH_INTERVAL`, `INPUT_DATE_FORMAT`, `DISPLAY_DATE_FORMAT`, `SHORT_DATE_FORMAT`, `DEFAULT_ESTIMATED_WEIGHT`
  - `chat.laundryForm.{pickupDate,pickupTime,pickupHint,pickupMoved,returnDate,returnTime,returnHint,weightHint,weightValue,weightUnknown,priceHint,priceAfterWeighing,washTimeHint}`, `booking.pickup.{today,tomorrow,slot,time,note,returnNote}`, `booking.weightNotEstimated`, `booking.points.needWeight`, `pricing.washTime.{title,subtitle,items}`
  - Sửa nội dung: `chat.laundryForm.{weight,weightPlaceholder,estimatedPrice}`, `chat.orderConfirmation` (thêm dòng lấy đồ + trả đồ, giá theo trạng thái số kg)
- **Lý do**:
  - Góp ý từ góc nhìn khách: khách cần biết khi nào shipper đến (có mặc định, đổi khi cần), không biết chính xác số kg, và muốn biết bao lâu có đồ. API chưa có field giờ lấy đồ nên tạm ghi vào `notes`.
  - Khách cần chọn được cả ngày lấy và ngày trả; ngày trả phải đủ thời gian giặt tính từ khung lấy đồ. Khung 3 tiếng theo yêu cầu cửa hàng.
  - Khoá dùng điểm khi chưa có kg: với 1 kg tạm, server chỉ giữ điểm theo giá 1 kg và không tăng lại khi admin sửa kg. Kiểm tra khung hết hạn: trước đó bấm "Đặt lịch" với khung đã qua không có phản hồi gì.

## 2026-10-02
- **Form đặt lịch dùng chung**: trang `/booking` bỏ form giả (submit `setTimeout`, dịch vụ/giá hardcode), viết lại bằng `LaundryForm` + `useLaundryBooking(BOOKING_SOURCE.PAGE)`; Chat dùng `BOOKING_SOURCE.CHAT`. Logic đặt lịch thật qua `createLaundryBooking`.
- **Lọc tỉnh theo chi nhánh**: `getBranchCities` → chỉ hiện tỉnh có chi nhánh (so khớp `name` LocationApi). `BranchService` cache localStorage 1 ngày; prefetch khi load app. Thêm `city`/`district` cho chi nhánh (3 phần địa chỉ).
- **Prefill + nhớ địa chỉ**: prefill ô trống từ user đăng nhập / lần đặt trước; lưu `bookingAddress` vào localStorage sau khi đặt; ẩn/làm sạch địa chỉ ngoài vùng phục vụ.
- **Ghi chú cho cửa hàng**: ô note (tối đa `MAX_BOOKING_NOTE_LENGTH`), nối vào `notes` sau dòng nguồn đặt.
- **Constants / keys mới**:
  - `LOCAL_STORAGE_KEY` (`branches`, `bookingAddress`), `BRANCH_CACHE_DURATION`, `MAX_BOOKING_NOTE_LENGTH`, `BOOKING_SOURCE`
  - `chat.laundryForm.note`, `chat.laundryForm.notePlaceholder`, `booking.serviceTypeLabel`, `booking.error`
- **Lý do**:
  - Trang Booking trước đây là mock, tách rời Chat; cần đặt lịch thật, chỉ cho chọn tỉnh có chi nhánh, và không bắt khách nhập lại mỗi lần. Cần deploy server (field `district`/`city` cho branch). Chi tiết server xem repo `server-giat-say-sieu-sach-nestjs`.
