# Promotion (khuyến mãi)
> Cập nhật: 2026-10-20

## Tổng quan
Chương trình khuyến mãi do admin tạo, hiển thị cho khách ở trang `/promotions` và được agent Chat trả lời. Field **khớp 1-1 với backend** (`module/promotion`). FE **chưa** gửi `promotionCode` khi đặt lịch (server đã hỗ trợ trong `CreateLaundryOrderDto` / `CreateGuestOrderDto`) — khách vẫn ghi tên/mã chương trình vào ô ghi chú. Sub-logic: (1) Trạng thái theo ngày, (2) Trang khuyến mãi công khai, (3) Admin quản lý khuyến mãi, (4) Chat tool.

## Dùng chung
- `services/promotion.ts`:
  - `PromotionService.getPromotions()` → `GET /promotions?limit=FULL_LIST_LIMIT` (public: chỉ khuyến mãi **đang bật + chưa kết thúc**, cache `API_CACHE_SECONDS`).
  - `getAdminPromotions()` → `GET /promotions/admin?limit=FULL_LIST_LIMIT` (admin, có token: gồm cả đã tắt / đã kết thúc).
  - `createPromotion` (`POST`), `updatePromotion` (`PATCH /:id`), `deletePromotion` (`DELETE /:id`).
  - Helpers: `toShopDate`, `getPromotionStatus`, `getPromotionPeriodText`, `getPromotionDiscountText`.
- Kiểu `PromotionItem` (theo `formatPromotionResponse` của server): `id`, `code` (rỗng = chỉ thông báo, không áp được vào đơn), `name`, `description`, `discountType`, `discountValue` (0 = không hiện mức giảm), `minOrderAmount`, `maxDiscountAmount`, `startAt` / `endAt` (ISO hoặc `null`), `usageLimit`, `usedCount`, `isActive`.
- Kiểu `PromotionPayload` (theo `Create/UpdatePromotionDto`): `name`, `code?`, `description?`, `discountType?`, `discountValue?`, `startAt?`, `endAt?` (`YYYY-MM-DD` = trọn ngày theo giờ shop), `isActive?`. Khi sửa: `code` / `description` / `startAt` / `endAt` gửi `null` để xoá.
- Constants: `PROMOTION_DISCOUNT_TYPE` (PERCENTAGE | FIXED_AMOUNT, trùng `DiscountType` server), `PROMOTION_STATUS` (ACTIVE | UPCOMING | EXPIRED), `PROMOTION_DISCOUNT_RANGE` (1–100, cho kiểu %), `FULL_LIST_LIMIT`, `SHOP_TIMEZONE`, `INPUT_DATE_FORMAT`, `DISPLAY_DATE_FORMAT`, `QUERY_KEYS.getListPromotions`.
- `utils/functions.ts` — `getPromotionStatusBadgeVariant`, `convertPriceToCurrent` (định dạng tiền cho kiểu FIXED_AMOUNT).
- Icon `components/Icons/Gift.tsx`.

## 1. Trạng thái theo ngày
- Mọi ngày quy về **ngày lịch theo `SHOP_TIMEZONE`** (`toShopDate`) rồi so sánh chuỗi `YYYY-MM-DD` → server Vercel (UTC), trình duyệt admin và chat tool cho cùng kết quả.
- `getPromotionStatus(promotion, now)`: hôm nay < ngày `startAt` → UPCOMING; > ngày `endAt` → EXPIRED; còn lại ACTIVE. Không có `startAt` = đã bắt đầu, không có `endAt` = không hết hạn. (`isActive` xử lý riêng ở admin, xem §3.)
- `getPromotionPeriodText`: "dd/mm/yyyy – dd/mm/yyyy" / "Đến hết …" / "Từ …" / "Không giới hạn thời gian".
- `getPromotionDiscountText`: PERCENTAGE → `promotions.discount` ("Giảm 20%"), FIXED_AMOUNT → `promotions.discountAmount` ("Giảm 10.000đ"); `discountValue` = 0 → chuỗi rỗng.

## 2. Trang khuyến mãi công khai `/promotions`
### Entry points
- `app/promotions/layout.tsx` — metadata (`promotions.seo.*`).
- `app/promotions/page.tsx` — Server Component, `revalidate = 60`, gọi `getPromotions()`. Lỗi API lúc build → `[]`; lúc chạy → throw để giữ trang cache cũ. JSON-LD `WebPage` + breadcrumb.
- `app/promotions/components/PromotionList.tsx` — UI.
### Luồng xử lý
1. Server đã lọc bỏ khuyến mãi tắt / đã kết thúc; client vẫn tính trạng thái, **ẩn EXPIRED**, xếp ACTIVE trước UPCOMING.
2. Mỗi thẻ: icon quà, badge mức giảm (nếu `discountValue` > 0), tên, "Mã: XXX" (nếu có `code`), mô tả, thời gian + badge trạng thái, nút "Đặt lịch ngay" (chỉ ACTIVE).
3. Rỗng → `MyEmpty` + nút đặt lịch. Cuối trang: hướng dẫn ghi tên chương trình vào ô ghi chú.
### Translation
- `promotions.{seo.*,tag,title,subtitle,discount,discountAmount,code,validRange,validUntil,validFrom,alwaysOn,active,upcoming,expired,bookNow,empty,note}`, `menu.promotions`.
### Edge cases
- ISR 60s + cache Redis server 30 phút (server xoá cache khi admin sửa) → thay đổi hiện sau tối đa ~1 phút.

## 3. Admin quản lý khuyến mãi `/admin/promotions`
### Entry points
- `app/admin/promotions/page.tsx` — `MyTable`: tên + mã + mô tả, mức giảm, thời gian, trạng thái, sửa/xoá. Tìm theo tên hoặc mã, phân trang client `PAGE_SIZE` (`constants/app.ts`).
- `components/PromotionForm/index.tsx` — form trong modal (`useModalDrawer`): tên (bắt buộc), mã (tự viết hoa), mô tả, kiểu giảm (`MySelect`) + mức giảm, ngày bắt đầu/kết thúc, toggle "Đang bật".
- `hooks/admin/useAdminPromotions.ts` — query `getAdminPromotions()` với `QUERY_KEYS.getListPromotions`; tạo/sửa/xoá invalidate list. **Toast do hook hiển thị**.
### Luồng xử lý
1. Trạng thái: `isActive = false` → badge "Đã tắt" (khách không thấy dù còn hạn); còn lại theo §1.
2. Submit: tạo → bỏ qua trường trống; sửa → `code` / `description` / ngày trống gửi `null`; `discountValue` trống → `0`. Luôn gửi `discountType`, `isActive`.
### Validate
- Tên bắt buộc (`admin.promotions.nameRequired`).
- Kiểu % → mức giảm trong `PROMOTION_DISCOUNT_RANGE` (`admin.promotions.percentInvalid`); kiểu số tiền → > 0 (`admin.promotions.amountInvalid`).
- Ngày kết thúc không trước ngày bắt đầu (`admin.promotions.dateInvalid`). Lỗi → khoá nút Lưu.
- Server: mã trùng → 400; % > 100 → 400; `endAt` ≤ `startAt` → 400 → toast `common.error`.
### Translation
- `admin.sidebar.promotions`, `admin.promotions.{title,create,edit,delete,created,updated,deleted,name,namePlaceholder,code,codePlaceholder,codeHint,description,descriptionPlaceholder,discount,discountType,discountTypes.*,discountPercent,discountAmount,startDate,endDate,dateHint,period,dateInvalid,percentInvalid,amountInvalid,nameRequired,isActive,inactive}`, dùng lại `promotions.{active,upcoming,expired,discount,discountAmount}`.
### Edge cases
- Form chưa có `minOrderAmount`, `maxDiscountAmount`, `usageLimit` (server mặc định 0 = không giới hạn); chỉ cần khi FE gửi `promotionCode` vào đơn.
- Modal xoá nhận `isDeleting` lúc mở nên không có loading (giống các trang admin khác).

## 4. Chat tool `get_promotions`
- `agents/tools/promotion.ts` lấy list public, lọc bỏ EXPIRED, trả cho LLM dạng `- <name> (giảm 20% | giảm 10.000đ) [mã XXX]: <mô tả>` (xem `docs/instruction/chat.md`).

## Liên quan
- `docs/instruction/booking.md` (ô ghi chú khi đặt), `docs/instruction/admin.md`, `docs/instruction/chat.md`, `docs/instruction/seo.md`.
- Server: `src/module/promotion` (repo `server-giat-say-sieu-sach-nestjs`).
