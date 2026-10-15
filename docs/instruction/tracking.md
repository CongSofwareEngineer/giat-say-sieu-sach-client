# Tracking (theo dõi đơn `/track-order`)
> Cập nhật: 2026-10-02

## Tổng quan
Trang `/track-order` tra cứu đơn thật bằng **cùng API public mà Chat dùng**, để kết quả trang và chat giống nhau. Sub-logic: (1) Tra cứu theo mã / SĐT, (2) Hiển thị kết quả. Timeline + nút huỷ đơn xem `docs/instruction/order.md`.

## Dùng chung
- `services/order.ts` — `normalizeOrderCode` (bỏ `#`, viết hoa), `getOrderByCode`, `lookupOrdersByPhone`, `getOrderCode`.
- `agents/tools/order.ts` — tool `track_order` dùng chung `normalizeOrderCode`.
- Constants: `MAX_CHAT_ORDERS`, `ORDER_STATUS`.

## 1. Tra cứu theo mã / SĐT
### Entry points
- `app/track-order/page.tsx` (chỉ ghép tiêu đề, SEO, `TrackOrderContent`).
- `app/track-order/components/TrackOrderContent.tsx` (state, gọi API, tự tra theo `?code=`), `TrackOrderForm.tsx` (form + validate).
### Luồng xử lý
1. Nhập mã và/hoặc SĐT — phải có ít nhất 1.
2. Có mã → `normalizeOrderCode` → `GET /laundry-orders/lookup/:code` (bỏ qua SĐT).
3. Chỉ SĐT → `isValidVnPhone` → E.164 → `POST /laundry-orders/guest/lookup { phone, limit: MAX_CHAT_ORDERS }` (4 đơn gần nhất).
4. Vào trang với `?code=XXXXXX` → điền sẵn + tự tra. Tra nhiều lần liên tiếp chỉ lấy kết quả mới nhất (`requestIdRef`).

## 2. Hiển thị kết quả
- `TrackOrderResult.tsx` — mỗi đơn: mã `#XXXXXX`, badge trạng thái, % tiến độ + timeline, dịch vụ (tên · kg · tiền), tổng tiền, ngày tạo. `CANCELLED` hiện thông báo huỷ thay timeline.
- Không có kết quả / lỗi API → "Không tìm thấy đơn hàng" (theo mã) hoặc "... với số điện thoại này".

## Translation / Constants
- `tracking.form.{requireOne,invalidPhone,hint}`, `tracking.result.{listTitle,createdAt,quantity,price,cancelled,notFoundPhone}`.

## Edge cases / nợ kỹ thuật
- API public không trả cân nặng tổng, giờ giao, ngày nhận/giao → đã bỏ khỏi UI; key `tracking.result.{eta,pickupDate,deliveryDate,weight}` còn nhưng chưa dùng.
- JSON-LD trong `page.tsx` và metadata trong `layout.tsx` vẫn là text tiếng Việt cứng.

## Liên quan
- `docs/instruction/chat.md` (tool `track_order` / `get_my_orders`), `docs/instruction/order.md` (timeline, huỷ đơn).
