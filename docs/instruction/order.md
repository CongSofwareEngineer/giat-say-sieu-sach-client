# Order (tính tiền / điểm / giảm giá / huỷ / sửa kg)
> Cập nhật: 2026-10-29

## Tổng quan
Logic đơn hàng xuyên suốt booking, chat, track-order, profile và admin. **Server là nơi tính tiền cuối cùng**; FE chỉ ước tính. Sub-logic: (1) Công thức tính tiền, (2) Dùng điểm khi đặt, (3) Giữ chỗ & trừ/cộng điểm, (4) Huỷ đơn, (5) Admin sửa số kg, (6) Copy mã đơn + timeline, (7) Hoá đơn / biên nhận. Danh sách "đơn của tôi" ở profile xem `docs/instruction/profile.md`.

## Dùng chung
- `services/order.ts` — `getMyOrder`, `cancelMyOrder`, `updateOrderItems`, `createGuestOrder`, field giảm giá.
- `utils/orderPricing.ts` — ước tính giá FE (cùng công thức server).
- `utils/functions.ts` — `getOrderStatusBadgeVariant`.
- Constants: `LOYALTY_REDEEM`, `WEIGHT_DISCOUNT`, `ORDER_EDITABLE_STATUSES`, `ORDER_STATUS_STEPS`, `CANCELLABLE_ORDER_STATUS`, `COPY_FEEDBACK_DURATION`, `HTTP_STATUS.BAD_REQUEST`, `ORDER_STATUS`. **Phải khớp với BE** (`src/common/app.ts`).
- QUERY_KEYS: `getMyOrders`, `getMyOrder`.

## 1. Công thức tính tiền (server quyết định)
`Thành tiền = Tổng − giảm 10kg − khuyến mãi − giảm điểm` (`calculatePricing` ở BE).
- Giảm 10kg: tổng kg **> 10** → giảm `WEIGHT_DISCOUNT.AMOUNT` (10.000đ), áp cả đơn guest.
- Giảm điểm: theo bội số 100 điểm (100 điểm = 5.000đ), tối đa = điểm khả dụng, không vượt số tiền còn lại.

## 2. Dùng điểm khi đặt
- FE hiện ô "Dùng điểm tích lũy" khi user đăng nhập và có ≥ 100 điểm.
- Tick → gọi `POST /laundry-orders` (có token, `usePoints: true`); tên/SĐT nhập trên form ghi vào `notes` (`booking.contactNote`). Không tick → `POST /laundry-orders/guest`.

## 3. Giữ chỗ & trừ/cộng điểm
- Lúc đặt chỉ lưu `pointsUsed` (giữ chỗ). Điểm khả dụng = `loyaltyPoints` − tổng `pointsUsed` của đơn chưa xong (`ORDER_ACTIVE_STATUSES`).
- Đơn `COMPLETED`: `awardLoyaltyPoints` cộng `điểm mới (theo finalAmount) − pointsUsed` một lần (atomic, không âm). Đơn huỷ: không trừ gì.

## 4. Huỷ đơn
- API `PATCH /laundry-orders/me/:id/cancel`, chỉ `PENDING` (`CANCELLABLE_ORDER_STATUS`).
- Profile tab "Đơn hàng của tôi" + trang theo dõi (nút Huỷ chỉ hiện khi login & là chủ đơn — `GET /laundry-orders/me/:id`, 404 = không phải chủ). Modal dùng chung `components/CancelOrderConfirm`.
- Đơn guest không huỷ được trên web (API huỷ cần token).
- Chat AI cũng huỷ được (tool `cancel_my_order`, vẫn qua modal xác nhận) — xem `docs/instruction/chat.md` §6.

## 5. Admin sửa số kg
- Cột "Số kg" trong `admin/orders` → modal sửa từng dòng, xem trước thành tiền mới.
- `PATCH /laundry-orders/:id/items` (admin): chỉ `PENDING`, `RECEIVED` (`ORDER_EDITABLE_STATUSES`); tính lại tiền, giữ khuyến mãi, không tăng điểm đã dùng. Từ `WASHING` trở đi: FE hiện icon khoá, server trả 400.

## 6. Copy mã đơn + timeline theo dõi
- Copy mã đơn: trang đặt lịch, tin nhắn thành công trong chat (`ChatMessage.orderCode`).
- Timeline (`TrackOrderResult`): header gradient + thanh tiến độ, mỗi bước có icon/mô tả (`tracking.stepDesc.*`), hiện giảm giá nếu có.

## 7. Hoá đơn / biên nhận
### Mục đích
Khách xem và in / lưu PDF chi tiết tiền của một đơn: từng dịch vụ, các khoản giảm, tổng thanh toán.
### Entry points
- Nút "Hoá đơn" ở mỗi đơn trong `app/profile/components/MyOrders.tsx` → `useModalDrawer().open({ mode: 'modal', children: <OrderInvoice order={order} /> })`.
- `components/OrderInvoice/index.tsx` — props `{ order: OrderItem }`; chỉ dùng dữ liệu đã có trong `GET /laundry-orders/me`, không gọi API thêm.
### Luồng xử lý
1. Header: tên cửa hàng (`SITE_CONFIG.title`), địa chỉ + SĐT (`INFO_CONTACT`), mã đơn, ngày tạo, trạng thái.
2. Khách hàng: tên + SĐT của tài khoản (`useUser`), địa chỉ lấy đồ của đơn (nếu có).
3. Bảng: dịch vụ · số kg · đơn giá (`unitPrice`) · thành tiền (`subtotal`), cuộn ngang trên màn nhỏ.
4. Tổng: tạm tính (`totalAmount`) → từng khoản giảm > 0: giảm trên 10kg (`weightDiscount`), khuyến mãi (= `discountAmount − weightDiscount − pointsDiscount`, kèm mã nếu có `promotionCode`), dùng điểm (`pointsDiscount`, kèm số điểm) → tổng thanh toán (`finalAmount`).
5. "In / Lưu PDF" → `window.print()`. CSS `@media print` trong `app/globals.css` chỉ in khối `.print-area` (ẩn modal, header, nút); trình duyệt cho chọn "Lưu thành PDF".
### Translation / Constants
- `orders.invoice.{button,title,code,date,status,customer,service,quantity,unitPrice,subtotal,total,weightDiscount,promotion,promotionWithCode,pointsDiscount,finalAmount,thanks,print}`.
### Edge cases
- Đơn chưa cân (1 kg tạm) → hoá đơn hiện số tạm; sau khi admin sửa kg sẽ đúng.
- Không có ở `/track-order`: API public không trả đơn giá và địa chỉ.
- Không phải hoá đơn VAT, chỉ là biên nhận.

## Translation / Constants
- `common.copied`, `booking.contactNote`, `booking.points.*`, `booking.pricing.*`, `booking.success.copyCode`, `tracking.result.{orderCode,current,discount}`, `tracking.stepDesc.*`, `myOrders.*`, `admin.orders.{editWeight,weightEditDesc,weightInvalid,weightEditError,weightUpdated,weightLocked,newTotal,list.weight}`.

## Edge cases / nợ kỹ thuật
- Hằng số giảm giá phải giống FE (`constants/app.ts`) và BE (`src/common/app.ts`).
- FE ước tính điểm theo `loyaltyPoints` hiện có (chưa trừ điểm giữ cho đơn khác) → số tiền thực có thể lệch; server trả `finalAmount` chuẩn.
- 2 đơn dùng điểm cùng lúc có thể giữ trùng (race nhỏ); hoàn thành điểm không âm nhờ `$max: 0`.
- Cần deploy BE trước FE (API `PATCH /:id/items`, field `usePoints`). Chi tiết server xem repo `server-giat-say-sieu-sach-nestjs`.

## Liên quan
- `docs/instruction/booking.md`, `docs/instruction/profile.md` (điểm + hạng + đơn của tôi), `docs/instruction/tracking.md`, `docs/instruction/admin.md`.
