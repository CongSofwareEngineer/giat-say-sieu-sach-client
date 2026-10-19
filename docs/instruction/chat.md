# Chat AI (trợ lý đa agent)
> Cập nhật: 2026-10-16

## Tổng quan
Chat nổi là trợ lý đa agent; chỉ lời gọi LLM rời trình duyệt (qua `/api/chat-agent/chat/completions`), còn tool chạy client-side với `AgentContext` (`locale`, `userId`). Sub-logic: (1) Đặt lịch giặt không cần login, (2) Tra cứu đơn theo SĐT / mã đơn, (3) Form chọn Tỉnh/Xã qua LocationApi, (4) Định dạng danh sách đơn, (5) Địa chỉ cửa hàng / địa chỉ đã lưu. Form đặt lịch dùng chung với trang `/booking` — xem `docs/instruction/booking.md`.

## Dùng chung
- `agents/index.ts` (router → chọn agent → `runAgent`), `agents/runAgent.ts` (tool loop, `MAX_TOOL_ROUNDS = 6`), `agents/llm.ts`, `agents/base.ts`.
- `agents/tools/*` — booking, order, myOrders, faq, search...; `agents/agents/*` — faq, price, recommend, fallback, router.
- Dữ liệu FAQ (tool `faq`, `search`): `FaqService.getFaqs()` lấy toàn bộ FAQ đang hiển thị (`?limit=FULL_LIST_LIMIT`), cache localStorage `LOCAL_STORAGE_KEY.faqs` trong `FAQ_CACHE_DURATION` (3 ngày). Admin quản lý ở `/admin/faqs` (xem `docs/instruction/admin.md` §4).
- Danh sách chi nhánh (tool `get_branches` trong `agents/tools/order.ts`): tên, địa chỉ, giờ mở cửa (`openingHours`), SĐT, link bản đồ — xem §5.
- `services/order.ts` — `getMyOrders`, `createGuestOrder`, `lookupOrdersByPhone`, `getOrderByCode`, `getOrderCode`, `normalizeOrderCode`.
- Translation `chat.*`, `agent.*`; `TOOL_NAME`, `AGENT_NAME` (`constants/tools.ts`); `MAX_CHAT_ORDERS` (4).

## 1. Đặt lịch giặt (không cần login)
### Entry points
- `agents/tools/booking.ts` — `createLaundryBooking`; `components/Chat/index.tsx`, `components/Chat/LaundryForm.tsx`.
### Luồng xử lý
1. User điền form → mọi user đều gọi `POST /laundry-orders/guest` với `phone` (E.164), `name`, `address`, `district`, `city`, `items`, `notes`, `notificationFid` (nếu có — FID thiết bị, xem `docs/instruction/notifications.md`). (Khi dùng điểm tích lũy thì gọi API có token — xem `docs/instruction/order.md`.)
2. Server tìm user theo SĐT (chưa có thì tạo), lưu địa chỉ thẳng vào đơn; thiếu địa chỉ → 400.
3. Tắt form, hiện tin xác nhận (`chat.orderConfirmation`: tên, SĐT, địa chỉ, dịch vụ, giờ lấy đồ, giờ trả đồ, khối lượng, giá tham khảo — chưa nhập kg thì "Chưa ước lượng" / "Tính sau khi shipper cân") rồi "Đặt lịch thành công! Mã đơn: #XXXXXXXX" (mã ngẫu nhiên do server sinh, `getOrderCode` — xem `tracking.md` §1). Giờ lấy/trả đồ + số kg ước lượng xem `docs/instruction/booking.md` §5, §6.
### Edge cases
- KHÔNG lưu đơn/SĐT ở localStorage (bảo mật). User login nhưng đặt bằng SĐT khác → đơn vào tài khoản của SĐT đó.
- Tool `get_promotions` (agent `price`) chỉ trả khuyến mãi chưa hết hạn — xem `docs/instruction/promotion.md` §4.

## 2. Tra cứu đơn
### get_my_orders ("đơn của tôi")
- Router → agent `recommend` gọi `get_my_orders`. Đã login → `GET /laundry-orders/me?limit=4`. Chưa login & chưa có SĐT → trả marker `[ORDER_PHONE_FORM]` → hiện `OrderPhoneForm`; submit SĐT → `getMyOrders(phone, ctx)` → `POST /laundry-orders/guest/lookup { phone, limit: 4 }` (kết quả thêm vào history).
### track_order (theo mã)
- `GET /laundry-orders/lookup/:code` (mã 8 ký tự, có/không `#`; không nhận ID đơn). Không cần login, giới hạn 10 lần/phút/IP.
### Edge cases
- Endpoint tra SĐT/mã là public (đã ẩn địa chỉ/ghi chú/user), dựa vào throttler global chống dò. Tra theo mã dùng `$expr` quét collection (ổn khi dữ liệu nhỏ).

## 3. Form Tỉnh/Xã qua LocationApi
### Entry points
- `components/Chat/LaundryForm.tsx`; `hooks/reactQuery/useGetWards.ts`; `services/address/index.ts` (`formatAddress`).
### Luồng xử lý
- `useGetProvinces` (cache localStorage 24h) → chọn tỉnh lưu `city`, reset `district`, `useGetWards` gọi `LocationService.getDistricts(provinceId)` (API esgoo 2 cấp tỉnh→xã, gọi qua proxy `/api/location` — xem `docs/instruction/profile.md` §5) → chọn lưu `district`; user gõ số nhà/đường vào `address`. Tỉnh/xã lưu theo `name` (khớp `AddressForm`).
- Chọn "địa chỉ đã lưu" → prefill + `addressId`; sửa bất kỳ phần nào → xóa `addressId`. Nút Đặt lịch bật khi đủ họ tên, SĐT, tỉnh, xã, địa chỉ, khối lượng > 0.
### Translation / Constants
- `QUERY_KEYS.getWards`; `chat.laundryForm.{savedAddress,city,ward,addressDetail,addressDetailPlaceholder}`.

## 4. Định dạng danh sách đơn
- `formatOrderList` (`agents/tools/myOrders.ts`): mỗi đơn là 1 khối markdown riêng (**Đơn #CODE** / **Tình trạng** / Dịch vụ / Tổng tiền · Ngày), nối bằng `\n\n` → mỗi đơn 1 đoạn `<p>` (`ChatMarkdown` có `whitespace-pre-wrap`). Trước đây dùng list `-` bị markdown nuốt `\n`. Agent `recommend` giữ nguyên kết quả tool ("as-is").

## 5. Địa chỉ cửa hàng / địa chỉ đã lưu
### Mục đích
Trả lời "địa chỉ" bằng dữ liệu chi nhánh thật từ API (`GET /branches`), không dùng địa chỉ cứng.
### Entry points
- `components/Chat/QuickOptions.tsx` — nút "Chi nhánh" (key `chat.quickOptions.address`; đặt tên "Chi nhánh" thay vì "Địa chỉ" để user không nhầm với địa chỉ của mình) gửi câu rõ nghĩa `chat.quickOptions.addressMessage` để router/agent hiểu là hỏi chi nhánh.
- Agent `recommend` (`agents/agents/recommend.ts`): "địa chỉ"/"chi nhánh"/"cửa hàng ở đâu" → `get_branches`; chỉ gọi `get_my_addresses` khi user hỏi rõ địa chỉ **của mình**. Cấm bịa địa chỉ.
- `agents/tools/order.ts`: `get_branches` (danh sách chi nhánh, có link `socialMedia.googleMap` nếu có), `get_contact_info` (phần địa chỉ cũng lấy từ chi nhánh).
- `agents/tools/address.ts`: `get_my_addresses` (`GET /addresses/me`, cần login).
### Luồng xử lý
1. Click "Chi nhánh" → gửi `addressMessage` → router → `recommend` → `get_branches` → `BranchService.getBranches()` (cache localStorage, xem `docs/instruction/booking.md` §2).
2. Mỗi chi nhánh 1 dòng: `- **Tên**: địa chỉ (giờ mở cửa) - SĐT` (+ dòng `agent.order.branch.map` nếu có link bản đồ).
### Translation / Constants
- `chat.quickOptions.addressMessage`, `agent.order.branch.{noHours,empty,map}`, `agent.address.{empty,requireLogin,item}`; `BRANCH_SOCIAL.GOOGLE_MAP`.
### Edge cases
- Không có chi nhánh → `agent.order.branch.empty`; `get_contact_info` lỗi API chi nhánh → vẫn trả phone/email, địa chỉ = `branch.empty`.
- `get_my_addresses` khi chưa login (`ctx.userId` rỗng) → `agent.address.requireLogin`, không gọi API.

## Liên quan
- `docs/instruction/booking.md` (form dùng chung), `docs/instruction/order.md` (tạo đơn, giá, điểm), `docs/instruction/tracking.md` (tra cứu trang /track-order).
