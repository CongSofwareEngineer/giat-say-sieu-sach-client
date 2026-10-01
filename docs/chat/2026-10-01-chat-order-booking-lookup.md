# Chat: đặt lịch giặt (không cần login) và tra cứu đơn theo SĐT / mã đơn

- Ngày: 2026-10-01
- Phạm vi: Chat AI / agent tools / order (client + server)

## Mục đích
- Đặt lịch trong chat không cần login, chỉ cần họ tên, SĐT và địa chỉ (tỉnh, xã, địa chỉ cụ thể).
- Sau khi đặt, hiện mã đơn để khách tra lại.
- Khách hỏi "đơn của tôi" → tra theo SĐT trên server, hiện 4 đơn gần nhất kèm tình trạng.
- Khách đưa mã đơn → tra thẳng theo mã.
- KHÔNG lưu đơn/SĐT ở localStorage (không an toàn).

## Luồng xử lý
### Đặt lịch
1. User điền form → `createLaundryBooking` (`agents/tools/booking.ts`).
2. Mọi user (login hay không) đều gọi `POST /laundry-orders/guest` với `phone` (E.164), `name`, `address`, `district`, `city`, `items`, `notes`, `notificationToken` (nếu có).
3. Server tìm user theo SĐT (chưa có thì tạo), lưu địa chỉ thẳng vào đơn. Thiếu địa chỉ → lỗi validate 400 ngay.
4. Tắt form, hiện "Đặt lịch thành công! Mã đơn: #XXXXXX" (6 ký tự cuối của ID, `getOrderCode`).

### Tra cứu "đơn của tôi" (tool `get_my_orders`)
1. Router chuyển sang agent `recommend`, agent gọi `get_my_orders`.
2. Đã login → `GET /laundry-orders/me?limit=4`.
3. Chưa login, chưa có SĐT → tool trả marker `[ORDER_PHONE_FORM]` → chat hiện ô nhập SĐT (`OrderPhoneForm`).
4. Submit SĐT → client gọi thẳng `getMyOrders(phone, ctx)` (cùng logic với tool, không qua LLM) → `POST /laundry-orders/guest/lookup { phone, limit: 4 }`. Kết quả được thêm vào history để agent hiểu ngữ cảnh.

### Tra theo mã (tool `track_order`)
- `GET /laundry-orders/lookup/:code` (mã 6 ký tự, có/không `#`, hoặc full ID). Không cần login.

## Server (repo `server-giat-say-sieu-sach-nestjs`)
- `CreateGuestOrderDto`: thêm `address`, `district`, `city` (bắt buộc, không rỗng); `notificationToken` thành optional.
- Schema `LaundryOrder`: thêm `address`, `district`, `city` (optional cho đơn cũ). `formatOrderResponse` trả thêm 3 field này.
- `POST /laundry-orders/guest/lookup` (public): body `{ phone, limit? }` (mặc định 4, tối đa 10).
- `GET /laundry-orders/lookup/:code` (public): tìm theo 6 ký tự cuối của `_id` hoặc full ID.
- 2 endpoint public chỉ trả `id, code, status, finalAmount, items(categoryName, quantity, subtotal), createdAt` — không trả địa chỉ, notes, userId.
- Sửa `createGuestOrder`: `registerGuest` trả object thường không có `id` → dùng `user._id.toString()`.
- File: `laundry-order.controller.ts`, `laundry-order.service.ts`, `schemas/laundry-order.schema.ts`, `dto/create-guest-order.dto.ts`, `dto/lookup-guest-orders.dto.ts`.

## File liên quan (client)
- `agents/tools/booking.ts` — `createLaundryBooking`, luôn gọi API guest
- `agents/tools/myOrders.ts` — tool `get_my_orders`, `getMyOrders`, `formatOrderList`, marker `ORDER_PHONE_FORM_MARKER`
- `agents/tools/order.ts` — `track_order` gọi tra theo mã, export `statusLabel`
- `agents/agents/recommend.ts` — gắn tool `get_my_orders`, cập nhật prompt
- `services/order.ts` — `getMyOrders`, `createGuestOrder`, `lookupOrdersByPhone`, `getOrderByCode`, `getOrderCode`, type `PublicOrderItem`
- `components/Chat/index.tsx` — submit đặt lịch, xử lý marker SĐT, tra cứu theo SĐT
- `components/Chat/OrderPhoneForm.tsx` — ô nhập SĐT
- `components/Chat/LaundryForm.tsx` — validate SĐT, loading khi đặt
- `hooks/useNotifications.ts` — export `FCM_TOKEN_KEY`

## Constants / Translation keys mới
- `TOOL_NAME.getMyOrders`, `MAX_CHAT_ORDERS` (4)
- `chat.orderSuccessWithCode`, `chat.orderLookup.{title,submit,invalidPhone}`
- `agent.order.myOrders.{header,item,empty,invalidPhone}`
- Sửa text `agent.order.track.noCode` theo định dạng mã mới `#XXXXXX`

## Lưu ý
- Endpoint tra theo SĐT/mã là public: ai biết SĐT hoặc mã đều xem được tình trạng đơn (đã ẩn địa chỉ, ghi chú, thông tin user). Đang dựa vào throttler global của server để chống dò. Nếu cần chặt hơn: thêm OTP SĐT.
- Tra theo mã 6 ký tự dùng `$expr` (quét collection) — ổn khi dữ liệu nhỏ; nếu đơn nhiều nên thêm field `code` có index.
- User đã login nhưng đặt bằng SĐT khác → đơn vào tài khoản của SĐT đó, không hiện ở `/me`.
- Code cũ gọi key `chat.order.notes/confirmation/success` không tồn tại → đã đổi sang `chat.serviceTypeLabel`, `chat.orderConfirmation`, `chat.orderSuccessWithCode`.
- Cần deploy server trước thì luồng đặt lịch / tra cứu mới chạy.
