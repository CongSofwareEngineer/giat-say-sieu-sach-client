# Promotion (khuyến mãi)
> Cập nhật: 2026-10-15

## Tổng quan
Chương trình khuyến mãi do admin tạo, hiển thị cho khách ở trang `/promotions` và được agent Chat trả lời. Hiện chỉ để **thông tin**: FE chưa tự áp khuyến mãi vào đơn (khách ghi tên chương trình vào ô ghi chú khi đặt). Sub-logic: (1) Trạng thái theo ngày, (2) Trang khuyến mãi công khai, (3) Admin quản lý khuyến mãi, (4) Chat tool.

## Dùng chung
- `services/promotion.ts` — `PromotionService` (`getPromotions`, `createPromotion`, `updatePromotion`, `deletePromotion`, endpoint `promotions`), `toShopDate`, `getPromotionStatus`, `getPromotionPeriodText`.
- Field (giả định theo BE, chưa đối chiếu DTO): `title`, `description?`, `discountPercent?`, `startDate?`, `endDate?`. `PromotionPayload` cho phép `null` để xoá field khi sửa.
- Constants: `PROMOTION_STATUS` (ACTIVE | UPCOMING | EXPIRED), `PROMOTION_DISCOUNT_RANGE` (1–100), `SHOP_TIMEZONE` (`Asia/Ho_Chi_Minh`), `INPUT_DATE_FORMAT`, `DISPLAY_DATE_FORMAT`, `QUERY_KEYS.getListPromotions`.
- `utils/functions.ts` — `getPromotionStatusBadgeVariant` (ACTIVE `success`, UPCOMING `info`, EXPIRED `default`).
- Icon `components/Icons/Gift.tsx`.

## 1. Trạng thái theo ngày
- Mọi ngày quy về **ngày lịch theo `SHOP_TIMEZONE`** (`toShopDate`, plugin dayjs `utc` + `timezone`) rồi so sánh chuỗi `YYYY-MM-DD` → server Vercel (UTC), trình duyệt admin và chat tool cho cùng kết quả, không lệch hydration.
- `getPromotionStatus(promotion, now)`: hôm nay (giờ VN) < ngày bắt đầu → UPCOMING; > ngày kết thúc → EXPIRED (ngày kết thúc tính trọn ngày); còn lại ACTIVE. Không có `startDate` = đã bắt đầu, không có `endDate` = không hết hạn.
- `getPromotionPeriodText`: "dd/mm/yyyy – dd/mm/yyyy" / "Đến hết …" / "Từ …" / "Không giới hạn thời gian" (ngày cũng theo giờ VN).

## 2. Trang khuyến mãi công khai `/promotions`
### Entry points
- `app/promotions/layout.tsx` — metadata (lấy chữ từ `vn.json` → `promotions.seo.*`).
- `app/promotions/page.tsx` — Server Component, `revalidate = 60`, gọi `getPromotions()` (cache `API_CACHE_SECONDS`). Lỗi API lúc build → `[]`; lúc chạy → throw để giữ trang cache cũ (giống `/pricing`). JSON-LD `WebPage` + breadcrumb.
- `app/promotions/components/PromotionList.tsx` — UI.
### Luồng xử lý
1. Server tính trạng thái, **ẩn EXPIRED**, xếp ACTIVE trước UPCOMING.
2. Mỗi thẻ: icon quà, badge "Giảm X%" (nếu có), tên, mô tả (giữ xuống dòng), thời gian áp dụng + badge trạng thái, nút "Đặt lịch ngay" (chỉ ACTIVE).
3. Rỗng → `MyEmpty` + nút đặt lịch. Cuối trang: hướng dẫn ghi tên chương trình vào ô ghi chú khi đặt.
### Translation
- `promotions.{seo.*,tag,title,subtitle,discount,validRange,validUntil,validFrom,alwaysOn,active,upcoming,expired,bookNow,empty,note}`, `menu.promotions`.
### Edge cases
- Trang ISR 60s: khuyến mãi mới/sửa/xoá hiện sau tối đa ~1 phút; trạng thái tính lúc render nên có thể trễ tối đa 60s.
- Link: Header (dropdown "Thêm") và Footer (Liên kết nhanh). Sitemap tự thêm khi build.

## 3. Admin quản lý khuyến mãi `/admin/promotions`
### Entry points
- `app/admin/promotions/page.tsx` — `MyTable`: tên + mô tả, % giảm, thời gian, trạng thái, sửa/xoá. Tìm theo tên, phân trang client `PAGE_SIZE` (`constants/app.ts`).
- `components/PromotionForm/index.tsx` — form trong modal (`useModalDrawer`): tên (bắt buộc), mô tả, % giảm, ngày bắt đầu/kết thúc (`<input type='date'>`).
- `hooks/admin/useAdminPromotions.ts` — query `QUERY_KEYS.getListPromotions`; mutation tạo/sửa/xoá invalidate list. **Toast do hook hiển thị**, form không toast lại.
- Menu: `AdminShell` + thẻ ở dashboard `/admin`.
### Validate
- Tên bắt buộc (chỉ có khoảng trắng → lỗi `admin.promotions.nameRequired` sau khi bấm Lưu); % giảm (nếu nhập) trong `PROMOTION_DISCOUNT_RANGE`; ngày kết thúc không trước ngày bắt đầu → báo lỗi, khoá nút Lưu.
- Trường để trống: **tạo** → không gửi; **sửa** → gửi `null` để server xoá giá trị cũ (vd bỏ ngày kết thúc = không giới hạn). Cần BE chấp nhận `null`.
### Translation
- `admin.sidebar.promotions`, `admin.promotions.*`, dùng lại `promotions.{active,upcoming,expired,discount}`.
### Edge cases
- API create/update/delete cần token admin (`POST/PATCH/DELETE /promotions`). Nếu BE dùng field khác (vd `code`, `isActive`) cần sửa `PromotionItem` + form.
- Modal xoá nhận `isDeleting` lúc mở nên không có loading (giống các trang admin khác).

## 4. Chat tool `get_promotions`
- `agents/tools/promotion.ts` lọc bỏ khuyến mãi EXPIRED trước khi trả cho LLM (xem `docs/instruction/chat.md`).

## Liên quan
- `docs/instruction/booking.md` (ô ghi chú khi đặt), `docs/instruction/admin.md`, `docs/instruction/chat.md`, `docs/instruction/seo.md`.
