# Promotion (khuyến mãi) — Changelog
> Instruction: docs/instruction/promotion.md

## 2026-10-20
- **Đồng bộ field với backend**: `PromotionItem` / `PromotionPayload` đổi từ `title, discountPercent, startDate, endDate` sang đúng DTO server: `name, code, description, discountType, discountValue, startAt, endAt, isActive` (+ `minOrderAmount, maxDiscountAmount, usageLimit, usedCount` khi đọc).
- **Admin list**: dùng `GET /promotions/admin` (thấy cả khuyến mãi đã tắt / đã kết thúc); badge "Đã tắt" khi `isActive = false`; tìm theo tên hoặc mã; cột "Mức giảm" hỗ trợ % và số tiền.
- **Form admin**: thêm mã khuyến mãi, kiểu giảm (% / số tiền cố định), toggle bật/tắt; validate số tiền > 0.
- **Trang `/promotions` + chat tool**: hiển thị `name`, mức giảm theo `discountType`, mã (nếu có). Public list gọi `?limit=FULL_LIST_LIMIT`.
- Helper mới `getPromotionDiscountText`.
- **Constants / keys mới**:
  - `PROMOTION_DISCOUNT_TYPE`
  - `admin.promotions.{code,codePlaceholder,codeHint,discount,discountType,discountTypes.PERCENTAGE,discountTypes.FIXED_AMOUNT,discountAmount,amountInvalid,isActive,inactive}`, `promotions.{discountAmount,code}`
- **Lý do**:
  - Client và server lệch field: server `ValidationPipe` (`forbidNonWhitelisted`) trả **400** khi admin tạo/sửa (field `title`, `discountPercent`... không có trong DTO); trang `/promotions` và chat tool đọc `title` / `discountPercent` → `undefined`; admin dùng list public nên không thấy khuyến mãi đã tắt.

## 2026-10-15
- **Trang khuyến mãi `/promotions`**: Server Component (ISR 60s), ẩn khuyến mãi đã hết hạn, hiện % giảm, thời gian áp dụng, trạng thái Đang/Sắp diễn ra, nút đặt lịch; trạng thái rỗng. Link ở Header (dropdown) và Footer.
- **Admin `/admin/promotions`**: bảng + tìm kiếm + phân trang, thêm/sửa trong modal (validate tên, % 1–100, ngày kết thúc ≥ ngày bắt đầu; khi sửa, field để trống gửi `null` để xoá), xoá có xác nhận. Thêm vào sidebar và dashboard admin.
- **Service**: thêm `createPromotion`, `updatePromotion`, `deletePromotion`; `getPromotions` cache phía server; helper `toShopDate`, `getPromotionStatus`, `getPromotionPeriodText` — ngày luôn tính theo giờ VN (`SHOP_TIMEZONE`) để server UTC và trình duyệt cho cùng trạng thái.
- **Chat tool `get_promotions`**: bỏ khuyến mãi đã hết hạn.
- **Constants / keys mới**:
  - `PROMOTION_STATUS`, `PROMOTION_DISCOUNT_RANGE`, `SHOP_TIMEZONE`, `QUERY_KEYS.getListPromotions`
  - `menu.promotions`, `promotions.*`, `admin.sidebar.promotions`, `admin.promotions.*`
- **Lý do**:
  - Backend đã có `/promotions` nhưng web chưa có nơi hiển thị/quản lý. Field dùng theo `PromotionItem` hiện có (title, description, discountPercent, startDate, endDate) — cần đối chiếu DTO của BE.
