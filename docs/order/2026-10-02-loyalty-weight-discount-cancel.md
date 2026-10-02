# Giảm giá theo điểm / trên 10kg, huỷ đơn, admin sửa số kg, timeline theo dõi đơn

- Ngày: 2026-10-02
- Phạm vi: booking, chat booking, track-order, admin/orders (FE) + laundry-order (BE `server-giat-say-sieu-sach-nestjs`)

## Mục đích
- Khách dùng điểm tích lũy để giảm tiền khi đặt (100 điểm = 5.000đ), không dùng mã khuyến mãi.
- Đơn trên 10kg tự động giảm 10.000đ.
- Khách tự huỷ đơn khi đơn còn ở trạng thái vừa đặt (`PENDING`).
- Admin sửa được số kg sau khi cân đồ, khoá lại khi đơn đã bắt đầu giặt.
- Sau khi đặt thành công cho phép copy mã đơn; timeline theo dõi đơn đẹp, dễ đọc hơn.

## Luồng xử lý
1. **Tính tiền (server quyết định)** — `calculatePricing` trong `laundry-order.service.ts`:
   `Thành tiền = Tổng − giảm 10kg − khuyến mãi (nếu có) − giảm điểm`.
   - Giảm 10kg: tổng kg **> 10** thì giảm `WEIGHT_DISCOUNT.AMOUNT` (áp dụng cả đơn guest).
   - Giảm điểm: dùng theo bội số 100 điểm, tối đa = điểm khả dụng, không vượt số tiền còn lại.
2. **Dùng điểm khi đặt**: FE hiện ô "Dùng điểm tích lũy" khi user đã đăng nhập và có ≥ 100 điểm.
   - Tick → FE gọi `POST /laundry-orders` (có token, `usePoints: true`) vì API guest không xác thực được chủ điểm. Tên/SĐT nhập trên form được ghi vào `notes` (`booking.contactNote`).
   - Không tick → vẫn đặt qua `POST /laundry-orders/guest` như cũ.
3. **Giữ chỗ & trừ điểm**:
   - Lúc đặt chỉ lưu `pointsUsed` trên đơn (giữ chỗ). Điểm khả dụng = `loyaltyPoints` − tổng `pointsUsed` của các đơn chưa xong (`ORDER_ACTIVE_STATUSES`) → không dùng trùng điểm cho 2 đơn.
   - Đơn chuyển `COMPLETED`: `awardLoyaltyPoints` cộng `điểm mới (theo finalAmount) − pointsUsed` một lần (atomic, không âm).
   - Đơn bị huỷ: không trừ gì.
4. **Huỷ đơn** (API có sẵn `PATCH /laundry-orders/me/:id/cancel`, chỉ `PENDING`):
   - Profile → tab "Đơn hàng của tôi": nút Huỷ trên đơn `PENDING`.
   - Trang theo dõi: nút Huỷ chỉ hiện khi user đăng nhập và là chủ đơn (FE gọi `GET /laundry-orders/me/:id`, 404 = không phải chủ).
5. **Admin sửa số kg**: cột "Số kg" trong `admin/orders` → modal sửa từng dòng, xem trước thành tiền mới.
   - API mới `PATCH /laundry-orders/:id/items` (admin): chỉ cho `PENDING`, `RECEIVED` (`ORDER_EDITABLE_STATUSES`), tính lại tiền; giữ nguyên khuyến mãi đã áp, không tăng số điểm đã dùng (chỉ giảm nếu tổng tiền nhỏ hơn).
   - Từ `WASHING` trở đi: FE hiện icon khoá, server trả 400 (lọc theo status khi update nên không ghi đè nếu admin khác vừa chuyển trạng thái).
6. **Copy mã đơn**: trang đặt lịch (nút cạnh mã đơn) và tin nhắn thành công trong chat (`ChatMessage.orderCode`).
7. **Timeline theo dõi đơn**: header gradient + thanh tiến độ, mỗi bước có icon, đường nối, bước hiện tại nổi bật, mô tả từng bước (`tracking.stepDesc.*`), hiện giảm giá nếu có.

## File liên quan
- BE `src/common/app.ts` — `LOYALTY_POINTS.REDEEM_*`, `WEIGHT_DISCOUNT`, `ORDER_EDITABLE_STATUSES`, `ORDER_ACTIVE_STATUSES`
- BE `src/module/laundry-order/laundry-order.service.ts` — `buildOrderItems`, `calculatePricing`, `getAvailablePoints`, `updateItems`, trừ điểm khi hoàn thành
- BE `src/module/laundry-order/laundry-order.controller.ts` — `PATCH /:id/items`
- BE `src/module/laundry-order/dto/update-order-items.dto.ts` — DTO sửa items (mới)
- BE `src/module/laundry-order/dto/create-laundry-order.dto.ts` — thêm `usePoints`, `address`, `district`, `city`
- BE `src/module/laundry-order/schemas/laundry-order.schema.ts` — thêm `weightDiscount`, `pointsUsed`, `pointsDiscount`
- BE `src/module/user/user.service.ts` — `addLoyaltyPoints` nhận số âm, không cho điểm < 0
- `utils/orderPricing.ts` — tính giá ước tính trên FE (cùng công thức server)
- `hooks/useLaundryBooking.ts` — state `usePoints`, `pricing`, `pointsBalance`
- `agents/tools/booking.ts` — chọn API guest / API có token khi dùng điểm
- `components/Chat/LaundryForm.tsx` — ô dùng điểm + bảng tạm tính
- `components/Chat/ChatMessageList.tsx`, `components/Chat/index.tsx`, `zustand/chat.ts` — nút copy mã đơn trong chat
- `app/booking/page.tsx` — copy mã đơn
- `app/track-order/components/TrackOrderResult.tsx`, `TrackOrderContent.tsx` — timeline mới + huỷ đơn
- `components/CancelOrderConfirm/index.tsx` — modal xác nhận huỷ (dùng chung)
- `hooks/reactQuery/useGetMyOrders.ts` — danh sách đơn của user + mutation huỷ
- `app/admin/orders/page.tsx`, `hooks/admin/useAdminOrders.ts` — sửa số kg
- `services/order.ts` — `getMyOrder`, `cancelMyOrder`, `updateOrderItems`, field giảm giá mới
- `utils/functions.ts` — `getOrderStatusBadgeVariant` (chuyển từ TrackOrderResult ra dùng chung)

## Constants / Translation keys mới
- `LOYALTY_REDEEM`, `WEIGHT_DISCOUNT`, `ORDER_EDITABLE_STATUSES`, `ORDER_STATUS_STEPS`, `CANCELLABLE_ORDER_STATUS`, `COPY_FEEDBACK_DURATION`, `HTTP_STATUS.BAD_REQUEST`
- `QUERY_KEYS.getMyOrders`, `QUERY_KEYS.getMyOrder`
- `common.copied`, `booking.contactNote`, `booking.points.*`, `booking.pricing.*`, `booking.success.copyCode`
- `tracking.result.orderCode|current|discount`, `tracking.stepDesc.*`
- `myOrders.*`, `admin.orders.editWeight|weightEditDesc|weightInvalid|weightEditError|weightUpdated|weightLocked|newTotal`, `admin.orders.list.weight`

## Lưu ý
- Hằng số giảm giá phải giống nhau ở FE (`constants/app.ts`) và BE (`src/common/app.ts`). FE chỉ ước tính, server là nơi tính cuối cùng.
- FE ước tính điểm theo `loyaltyPoints` hiện có, chưa trừ điểm đang giữ cho đơn khác → số tiền thực có thể khác một chút (server trả `finalAmount` chuẩn).
- Hai đơn đặt dùng điểm **cùng lúc** vẫn có thể giữ trùng điểm (race nhỏ); khi hoàn thành điểm không bị âm nhờ `$max: 0`.
- Đơn guest (không đăng nhập) không huỷ được trên web vì API huỷ cần token.
- Cần deploy BE trước FE (FE gọi API mới `PATCH /:id/items`, `PATCH /users/me/password`, field `usePoints`).
