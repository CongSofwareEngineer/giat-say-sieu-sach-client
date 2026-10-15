# Promotion

- Ngày: 2026-10-15
- Feature: promotion (→ docs/instruction/promotion.md)
- Loại: Added
- File: `services/promotion.ts`, `app/promotions/{layout,page}.tsx`, `app/promotions/components/PromotionList.tsx` (mới), `app/admin/promotions/page.tsx` (mới), `components/PromotionForm/index.tsx` (mới), `hooks/admin/useAdminPromotions.ts` (mới), `components/Icons/Gift.tsx` (mới), `agents/tools/promotion.ts`, `utils/functions.ts`, `app/admin/AdminShell.tsx`, `app/admin/page.tsx`, `components/Header/index.tsx`, `components/Footer/index.tsx`, `constants/{app,reactQuery}.ts`, `public/assets/language/{vn,en}.json`

## Thay đổi
- **Trang khuyến mãi `/promotions`**: Server Component (ISR 60s), ẩn khuyến mãi đã hết hạn, hiện % giảm, thời gian áp dụng, trạng thái Đang/Sắp diễn ra, nút đặt lịch; trạng thái rỗng. Link ở Header (dropdown) và Footer.
- **Admin `/admin/promotions`**: bảng + tìm kiếm + phân trang, thêm/sửa trong modal (validate tên, % 1–100, ngày kết thúc ≥ ngày bắt đầu; khi sửa, field để trống gửi `null` để xoá), xoá có xác nhận. Thêm vào sidebar và dashboard admin.
- **Service**: thêm `createPromotion`, `updatePromotion`, `deletePromotion`; `getPromotions` cache phía server; helper `toShopDate`, `getPromotionStatus`, `getPromotionPeriodText` — ngày luôn tính theo giờ VN (`SHOP_TIMEZONE`) để server UTC và trình duyệt cho cùng trạng thái.
- **Chat tool `get_promotions`**: bỏ khuyến mãi đã hết hạn.

## Constants / Translation keys mới
- `PROMOTION_STATUS`, `PROMOTION_DISCOUNT_RANGE`, `SHOP_TIMEZONE`, `QUERY_KEYS.getListPromotions`
- `menu.promotions`, `promotions.*`, `admin.sidebar.promotions`, `admin.promotions.*`

## Lý do
- Backend đã có `/promotions` nhưng web chưa có nơi hiển thị/quản lý. Field dùng theo `PromotionItem` hiện có (title, description, discountPercent, startDate, endDate) — cần đối chiếu DTO của BE.
