# Promotion (khuyến mãi)

- Ngày: 2026-10-20
- Feature: promotion (→ docs/instruction/promotion.md)
- Loại: Fixed, Changed
- File: `services/promotion.ts`, `components/PromotionForm/index.tsx`, `app/admin/promotions/page.tsx`, `app/promotions/components/PromotionList.tsx`, `hooks/admin/useAdminPromotions.ts`, `agents/tools/promotion.ts`, `constants/app.ts`, `public/assets/language/{vn,en}.json`

## Thay đổi
- **Đồng bộ field với backend**: `PromotionItem` / `PromotionPayload` đổi từ `title, discountPercent, startDate, endDate` sang đúng DTO server: `name, code, description, discountType, discountValue, startAt, endAt, isActive` (+ `minOrderAmount, maxDiscountAmount, usageLimit, usedCount` khi đọc).
- **Admin list**: dùng `GET /promotions/admin` (thấy cả khuyến mãi đã tắt / đã kết thúc); badge "Đã tắt" khi `isActive = false`; tìm theo tên hoặc mã; cột "Mức giảm" hỗ trợ % và số tiền.
- **Form admin**: thêm mã khuyến mãi, kiểu giảm (% / số tiền cố định), toggle bật/tắt; validate số tiền > 0.
- **Trang `/promotions` + chat tool**: hiển thị `name`, mức giảm theo `discountType`, mã (nếu có). Public list gọi `?limit=FULL_LIST_LIMIT`.
- Helper mới `getPromotionDiscountText`.

## Constants / Translation keys mới
- `PROMOTION_DISCOUNT_TYPE`
- `admin.promotions.{code,codePlaceholder,codeHint,discount,discountType,discountTypes.PERCENTAGE,discountTypes.FIXED_AMOUNT,discountAmount,amountInvalid,isActive,inactive}`, `promotions.{discountAmount,code}`

## Lý do
- Client và server lệch field: server `ValidationPipe` (`forbidNonWhitelisted`) trả **400** khi admin tạo/sửa (field `title`, `discountPercent`... không có trong DTO); trang `/promotions` và chat tool đọc `title` / `discountPercent` → `undefined`; admin dùng list public nên không thấy khuyến mãi đã tắt.
