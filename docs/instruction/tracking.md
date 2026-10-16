# Tracking (theo dõi đơn `/track-order`)
> Cập nhật: 2026-10-16

## Tổng quan
Trang `/track-order` tra cứu đơn thật bằng **cùng API public mà Chat dùng**, để kết quả trang và chat giống nhau. Sub-logic: (1) Mã đơn hàng, (2) Tra cứu theo mã / SĐT, (3) Hiển thị kết quả. Timeline + nút huỷ đơn xem `docs/instruction/order.md`.

## Dùng chung
- `services/order.ts` — `getOrderCode(order)` (đọc `order.code`), `normalizeOrderCode` (bỏ `#`, viết hoa), `getOrderByCode`, `lookupOrdersByPhone`.
- `agents/tools/order.ts` — tool `track_order` dùng chung `normalizeOrderCode`.
- Constants: `MAX_CHAT_ORDERS`, `ORDER_STATUS`.

## 1. Mã đơn hàng
### Mục đích
Mã khách dùng để tra cứu đơn mà không cần đăng nhập, nên **không được đoán được**.
### Luồng xử lý
- Server sinh mã **ngẫu nhiên 8 ký tự** khi tạo đơn (CSPRNG, bảng 31 ký tự `2-9` + `A-Z` bỏ `0 O 1 I L`, ví dụ `#K7QH3MZP`), lưu ở field `code` (unique). Client chỉ hiển thị, **không tự tính mã**.
- Mọi chỗ hiển thị mã (trang đặt lịch, chat, track-order, profile, admin) đều gọi `getOrderCode(order)` → `order.code`.
- `GET /laundry-orders/lookup/:code` **chỉ nhận mã** — không nhận ID đơn (ObjectId tăng tuần tự, đoán được).
- Server giới hạn 10 lần tra cứu / phút / IP cho cả tra theo mã và theo SĐT; vượt giới hạn → 429, UI hiện "không tìm thấy".
### Edge cases
- Đơn cũ chưa chạy backfill trên server (`migrate:order-code`) chưa có `code` → `getOrderCode` trả chuỗi rỗng; tra theo SĐT vẫn ra đơn. Mã cũ (6 ký tự cuối ID) không còn tra được.

## 2. Tra cứu theo mã / SĐT
### Entry points
- `app/track-order/page.tsx` (chỉ ghép tiêu đề, SEO, `TrackOrderContent`).
- `app/track-order/components/TrackOrderContent.tsx` (state, gọi API, tự tra theo `?code=`), `TrackOrderForm.tsx` (form + validate).
### Luồng xử lý
1. Nhập mã và/hoặc SĐT — phải có ít nhất 1.
2. Có mã → `normalizeOrderCode` → `GET /laundry-orders/lookup/:code` (bỏ qua SĐT).
3. Chỉ SĐT → `isValidVnPhone` → E.164 → `POST /laundry-orders/guest/lookup { phone, limit: MAX_CHAT_ORDERS }` (4 đơn gần nhất).
4. Vào trang với `?code=XXXXXXXX` → điền sẵn + tự tra. Tra nhiều lần liên tiếp chỉ lấy kết quả mới nhất (`requestIdRef`).

## 3. Hiển thị kết quả
- `TrackOrderResult.tsx` — mỗi đơn: mã `#XXXXXXXX`, badge trạng thái, % tiến độ + timeline, dịch vụ (tên · kg · tiền), tổng tiền, ngày tạo. `CANCELLED` hiện thông báo huỷ thay timeline.
- Không có kết quả / lỗi API (400 mã sai định dạng, 404, 429) → "Không tìm thấy đơn hàng" (theo mã) hoặc "... với số điện thoại này".
- Response public vẫn có `id` để chủ đơn đã login huỷ đơn (`me/:id`, có kiểm tra chủ sở hữu); không có endpoint public nào nhận `id`.

## Translation / Constants
- `tracking.form.{requireOne,invalidPhone,hint}` (hint ghi mã 8 ký tự), `tracking.result.{listTitle,createdAt,quantity,price,cancelled,notFoundPhone}`.

## Edge cases / nợ kỹ thuật
- API public không trả cân nặng tổng, giờ giao, ngày nhận/giao → đã bỏ khỏi UI; key `tracking.result.{eta,pickupDate,deliveryDate,weight}` còn nhưng chưa dùng.
- JSON-LD trong `page.tsx` và metadata trong `layout.tsx` vẫn là text tiếng Việt cứng.

## Liên quan
- `docs/instruction/chat.md` (tool `track_order` / `get_my_orders`), `docs/instruction/order.md` (timeline, huỷ đơn).
