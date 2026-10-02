# Hạng khách hàng (Bạc / Vàng / Kim cương) & điểm tích lũy

- Ngày: 2026-10-02
- Phạm vi: profile (client) + laundry-order, user (server NestJS `server-giat-say-sieu-sach-nestjs`)

## Mục đích
Thưởng điểm cho khách theo số tiền đã chi và xếp hạng thành viên. Khách xem được điểm + hạng ở trang Hồ sơ.

## Quy tắc
- 1.000đ (`finalAmount`, sau giảm giá) = 1 điểm, làm tròn xuống.
- Điểm **chỉ được cộng khi đơn chuyển sang `COMPLETED`** (trước đây cộng ngay lúc tạo đơn, 1 điểm/10.000đ — đã bỏ).
- Hạng (tính từ tổng điểm):
  - Bạc: mặc định (0 điểm)
  - Vàng: ≥ 1.000 điểm (≈ 1.000.000đ đã chi)
  - Kim cương: ≥ 3.000 điểm (≈ 3.000.000đ đã chi)

## Luồng xử lý
1. Admin đổi trạng thái đơn sang `COMPLETED` (qua `PATCH /laundry-orders/:id/status` hoặc `PATCH /laundry-orders/:id`).
2. Server gọi `awardLoyaltyPoints(orderId)`: cập nhật nguyên tử đơn `loyaltyPointsAwarded: true` (chỉ khi đơn đang `COMPLETED` và chưa được cộng) → cộng `floor(finalAmount / 1000)` điểm cho user bằng `$inc`.
3. Client mở trang `/profile` → gọi `GET /users/me` để cập nhật `loyaltyPoints` vào store.
4. `LoyaltyCard` tính hạng bằng `getCustomerTier(points)` và hiển thị hạng, điểm, thanh tiến độ lên hạng kế tiếp.

## File liên quan
Client:
- `constants/app.ts` — `CUSTOMER_TIER`, `CUSTOMER_TIER_MIN_POINTS` (ngưỡng hạng)
- `utils/loyalty.ts` — `getCustomerTier()` tính hạng + tiến độ
- `app/profile/components/LoyaltyCard.tsx` — thẻ hiển thị hạng/điểm
- `app/profile/components/ProfileSidebar.tsx` — gắn `LoyaltyCard` dưới tên user
- `app/profile/page.tsx` — làm mới profile khi vào trang

Server:
- `src/common/app.ts` — `LOYALTY_POINTS.POINTS_PER_VND = 1000`
- `src/module/laundry-order/schemas/laundry-order.schema.ts` — field `loyaltyPointsAwarded`
- `src/module/laundry-order/laundry-order.service.ts` — bỏ cộng điểm lúc tạo đơn, thêm `awardLoyaltyPoints()` khi hoàn thành
- `src/module/user/user.service.ts` — `addLoyaltyPoints()` dùng `$inc` (tránh mất điểm khi cập nhật đồng thời)

## Constants / Translation keys mới
- `CUSTOMER_TIER`, `CUSTOMER_TIER_MIN_POINTS`
- `profile.loyalty.tier`, `profile.loyalty.points`, `profile.loyalty.tiers.{SILVER,GOLD,DIAMOND}`, `profile.loyalty.toNextTier`, `profile.loyalty.topTier`, `profile.loyalty.earnRule`

## Lưu ý
- Hạng chỉ tính ở client từ `loyaltyPoints`, server không lưu hạng. Nếu đổi ngưỡng thì chỉ cần sửa `CUSTOMER_TIER_MIN_POINTS`.
- Đơn cũ tạo trước khi deploy đã được cộng điểm lúc tạo (theo luật cũ). Nếu đơn đó hoàn thành sau khi deploy sẽ được cộng thêm một lần nữa theo luật mới. Nếu cần chính xác, chạy script set `loyaltyPointsAwarded: true` cho các đơn cũ trước khi deploy.
- Điểm không bị trừ khi xóa đơn đã hoàn thành.
