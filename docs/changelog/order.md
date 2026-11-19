# Order (tính tiền / điểm / giảm giá / huỷ / sửa kg) — Changelog
> Instruction: docs/instruction/order.md

## 2026-10-29
- **Hoá đơn** (§7): nút "Hoá đơn" ở mỗi đơn trong "Đơn hàng của tôi" mở modal biên nhận gồm cửa hàng, khách, từng dịch vụ (kg × đơn giá), giảm trên 10kg / khuyến mãi / dùng điểm và tổng thanh toán. Nút "In / Lưu PDF" dùng `window.print()`, CSS in chỉ in khối hoá đơn.
- **Kiểu `OrderItem`**: thêm `isReviewed?` (server trả cho đơn của tôi, dùng cho nút đánh giá — xem `docs/instruction/comment.md` §7).
- **Constants / keys mới**:
  - `orders.invoice.*`
- **Lý do**:
  - Khách cần xem / lưu chi tiết tiền của đơn.

## 2026-10-02
- **Tính tiền**: `Thành tiền = Tổng − giảm 10kg − khuyến mãi − giảm điểm` (server quyết định). Đơn > 10kg giảm 10.000đ (cả guest). Giảm điểm theo bội số 100 điểm (100 = 5.000đ).
- **Dùng điểm khi đặt**: ô "Dùng điểm" khi login & ≥ 100 điểm → `POST /laundry-orders` (token, `usePoints: true`), tên/SĐT ghi vào `notes`.
- **Giữ chỗ & trừ điểm**: lưu `pointsUsed` lúc đặt; điểm khả dụng trừ `pointsUsed` đơn đang chạy; cộng điểm (atomic) khi `COMPLETED`.
- **Huỷ đơn**: `PATCH /me/:id/cancel` chỉ `PENDING`; nút ở profile + track-order (kiểm tra chủ đơn qua `/me/:id`); modal `CancelOrderConfirm` dùng chung.
- **Admin sửa số kg**: `PATCH /:id/items` chỉ `PENDING`/`RECEIVED`, tính lại tiền; từ `WASHING` khoá (400).
- **Copy mã đơn + timeline**: copy ở booking/chat; timeline track-order mới (gradient, thanh tiến độ, mô tả từng bước).
- **Constants / keys mới**:
  - `LOYALTY_REDEEM`, `WEIGHT_DISCOUNT`, `ORDER_EDITABLE_STATUSES`, `ORDER_STATUS_STEPS`, `CANCELLABLE_ORDER_STATUS`, `COPY_FEEDBACK_DURATION`, `HTTP_STATUS.BAD_REQUEST`, `QUERY_KEYS.getMyOrders`, `QUERY_KEYS.getMyOrder`
  - `common.copied`, `booking.contactNote`, `booking.points.*`, `booking.pricing.*`, `booking.success.copyCode`, `tracking.result.{orderCode,current,discount}`, `tracking.stepDesc.*`, `myOrders.*`, `admin.orders.{editWeight,weightEditDesc,weightInvalid,weightEditError,weightUpdated,weightLocked,newTotal,list.weight}`
- **Lý do**:
  - Khách dùng điểm giảm tiền (không dùng mã KM), đơn lớn được ưu đãi, tự huỷ khi mới đặt, admin sửa kg sau khi cân; cải thiện UX copy mã + theo dõi đơn. Cần deploy BE trước FE.
