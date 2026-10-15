# Chat AI (trợ lý đa agent)
> Cập nhật: 2026-10-15

## Tổng quan
Chat nổi là trợ lý đa agent; chỉ lời gọi LLM rời trình duyệt (qua `/api/chat-agent/chat/completions`), còn tool chạy client-side với `AgentContext` (`locale`, `userId`). Sub-logic: (1) Đặt lịch giặt không cần login, (2) Tra cứu đơn theo SĐT / mã đơn, (3) Form chọn Tỉnh/Xã qua LocationApi, (4) Định dạng danh sách đơn. Form đặt lịch dùng chung với trang `/booking` — xem `docs/instruction/booking.md`.

## Dùng chung
- `agents/index.ts` (router → chọn agent → `runAgent`), `agents/runAgent.ts` (tool loop, `MAX_TOOL_ROUNDS = 6`), `agents/llm.ts`, `agents/base.ts`.
- `agents/tools/*` — booking, order, myOrders, faq, search...; `agents/agents/*` — faq, price, recommend, fallback, router.
- `services/order.ts` — `getMyOrders`, `createGuestOrder`, `lookupOrdersByPhone`, `getOrderByCode`, `getOrderCode`, `normalizeOrderCode`.
- Translation `chat.*`, `agent.*`; `TOOL_NAME`, `AGENT_NAME` (`constants/tools.ts`); `MAX_CHAT_ORDERS` (4).

## 1. Đặt lịch giặt (không cần login)
### Entry points
- `agents/tools/booking.ts` — `createLaundryBooking`; `components/Chat/index.tsx`, `components/Chat/LaundryForm.tsx`.
### Luồng xử lý
1. User điền form → mọi user đều gọi `POST /laundry-orders/guest` với `phone` (E.164), `name`, `address`, `district`, `city`, `items`, `notes`, `notificationToken` (nếu có). (Khi dùng điểm tích lũy thì gọi API có token — xem `docs/instruction/order.md`.)
2. Server tìm user theo SĐT (chưa có thì tạo), lưu địa chỉ thẳng vào đơn; thiếu địa chỉ → 400.
3. Tắt form, hiện tin xác nhận (`chat.orderConfirmation`: tên, SĐT, địa chỉ, dịch vụ, giờ lấy đồ, khối lượng, giá tham khảo — chưa nhập kg thì "Chưa ước lượng" / "Tính sau khi shipper cân") rồi "Đặt lịch thành công! Mã đơn: #XXXXXX" (6 ký tự cuối ID, `getOrderCode`). Giờ lấy đồ + số kg ước lượng xem `docs/instruction/booking.md` §5, §6.
### Edge cases
- KHÔNG lưu đơn/SĐT ở localStorage (bảo mật). User login nhưng đặt bằng SĐT khác → đơn vào tài khoản của SĐT đó.
- Tool `get_promotions` (agent `price`) chỉ trả khuyến mãi chưa hết hạn — xem `docs/instruction/promotion.md` §4.

## 2. Tra cứu đơn
### get_my_orders ("đơn của tôi")
- Router → agent `recommend` gọi `get_my_orders`. Đã login → `GET /laundry-orders/me?limit=4`. Chưa login & chưa có SĐT → trả marker `[ORDER_PHONE_FORM]` → hiện `OrderPhoneForm`; submit SĐT → `getMyOrders(phone, ctx)` → `POST /laundry-orders/guest/lookup { phone, limit: 4 }` (kết quả thêm vào history).
### track_order (theo mã)
- `GET /laundry-orders/lookup/:code` (6 ký tự, có/không `#`, hoặc full ID). Không cần login.
### Edge cases
- Endpoint tra SĐT/mã là public (đã ẩn địa chỉ/ghi chú/user), dựa vào throttler global chống dò. Tra theo mã dùng `$expr` quét collection (ổn khi dữ liệu nhỏ).

## 3. Form Tỉnh/Xã qua LocationApi
### Entry points
- `components/Chat/LaundryForm.tsx`; `hooks/reactQuery/useGetWards.ts`; `services/address/index.ts` (`formatAddress`).
### Luồng xử lý
- `useGetProvinces` (cache localStorage 24h) → chọn tỉnh lưu `city`, reset `district`, `useGetWards` gọi `LocationService.getDistricts(provinceId)` (API esgoo 2 cấp tỉnh→xã) → chọn lưu `district`; user gõ số nhà/đường vào `address`. Tỉnh/xã lưu theo `name` (khớp `AddressForm`).
- Chọn "địa chỉ đã lưu" → prefill + `addressId`; sửa bất kỳ phần nào → xóa `addressId`. Nút Đặt lịch bật khi đủ họ tên, SĐT, tỉnh, xã, địa chỉ, khối lượng > 0.
### Translation / Constants
- `QUERY_KEYS.getWards`; `chat.laundryForm.{savedAddress,city,ward,addressDetail,addressDetailPlaceholder}`.

## 4. Định dạng danh sách đơn
- `formatOrderList` (`agents/tools/myOrders.ts`): mỗi đơn là 1 khối markdown riêng (**Đơn #CODE** / **Tình trạng** / Dịch vụ / Tổng tiền · Ngày), nối bằng `\n\n` → mỗi đơn 1 đoạn `<p>` (`ChatMarkdown` có `whitespace-pre-wrap`). Trước đây dùng list `-` bị markdown nuốt `\n`. Agent `recommend` giữ nguyên kết quả tool ("as-is").

## Liên quan
- `docs/instruction/booking.md` (form dùng chung), `docs/instruction/order.md` (tạo đơn, giá, điểm), `docs/instruction/tracking.md` (tra cứu trang /track-order).
