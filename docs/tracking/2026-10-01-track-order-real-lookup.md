# Trang /track-order: tra cứu đơn thật theo logic chat

- Ngày: 2026-10-01
- Phạm vi: Tracking / trang `/track-order`

## Mục đích
- Trang cũ giả lập API (`setTimeout`) và luôn trả mock cứng (Đang giặt, 5kg, 60.000đ, ngày 2024-01-15) với mọi mã/SĐT → hiện sai dữ liệu.
- Đổi sang gọi đúng API public mà chat đang dùng để kết quả trang và chat giống nhau.

## Luồng xử lý
1. User nhập mã đơn và/hoặc SĐT. Phải có ít nhất 1 trong 2.
2. Có mã → chuẩn hóa (`normalizeOrderCode`: bỏ `#`, viết hoa) → `GET /laundry-orders/lookup/:code` (giống tool `track_order`). Có mã thì bỏ qua SĐT.
3. Chỉ có SĐT → validate `isValidVnPhone` → đổi sang E.164 → `POST /laundry-orders/guest/lookup { phone, limit: MAX_CHAT_ORDERS }` (giống tool `get_my_orders`), hiện 4 đơn gần nhất.
4. Mỗi đơn hiện: mã `#XXXXXX` (`getOrderCode`), badge trạng thái, % tiến độ + timeline, danh sách dịch vụ (tên · kg · tiền), tổng tiền, ngày tạo. Đơn `CANCELLED` hiện thông báo hủy thay cho timeline.
5. Không có kết quả / lỗi API → hiện "Không tìm thấy đơn hàng" (theo mã) hoặc "Không tìm thấy đơn hàng nào với số điện thoại này".
6. Vào trang với `?code=XXXXXX` → điền sẵn mã và tự tra luôn.
7. Tra nhiều lần liên tiếp → chỉ lấy kết quả của lần mới nhất (`requestIdRef`).

## File liên quan
- `app/track-order/page.tsx` — chỉ ghép tiêu đề, SEO và `TrackOrderContent`
- `app/track-order/components/TrackOrderContent.tsx` — state, gọi API, tự tra theo `?code=`
- `app/track-order/components/TrackOrderForm.tsx` — form mã đơn / SĐT, validate
- `app/track-order/components/TrackOrderResult.tsx` — card 1 đơn
- `services/order.ts` — thêm `normalizeOrderCode`
- `agents/tools/order.ts` — `track_order` dùng chung `normalizeOrderCode`

## Constants / Translation keys mới
- Dùng lại `MAX_CHAT_ORDERS`, `ORDER_STATUS`
- `tracking.form.{requireOne,invalidPhone,hint}`
- `tracking.result.{listTitle,createdAt,quantity,price,cancelled,notFoundPhone}`

## Lưu ý
- API public không trả cân nặng tổng, giờ giao dự kiến, ngày nhận/giao → đã bỏ khỏi UI. Key cũ `tracking.result.{eta,pickupDate,deliveryDate,weight}` vẫn giữ, chưa dùng.
- Trang `/booking` vẫn là mock (tạo mã `GS......` giả) → link "Theo dõi đơn" từ đó sẽ báo không tìm thấy. Cần nối `/booking` với API `createGuestOrder` riêng.
- SEO JSON-LD trong `page.tsx` và metadata trong `layout.tsx` vẫn là text tiếng Việt cứng như trước.
