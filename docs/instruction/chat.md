# Chat AI (trợ lý đa agent)
> Cập nhật: 2026-11-04

## Tổng quan
Chat nổi là trợ lý đa agent; chỉ lời gọi LLM rời trình duyệt (qua `/api/chat-agent/chat/completions`), còn tool chạy client-side với `AgentContext` (`locale`, `userId`). Sub-logic: (1) Đặt lịch giặt không cần login, (2) Tra cứu đơn theo SĐT / mã đơn, (3) Form chọn Tỉnh/Xã qua LocationApi, (4) Định dạng danh sách đơn, (5) Địa chỉ cửa hàng / địa chỉ đã lưu, (6) Huỷ đơn qua chat, (7) Điểm tích lũy & hạng, (8) Router prompt, (9) Streaming câu trả lời, (10) Chuẩn hóa tool call, (11) Log token & câu hỏi lên Google Sheets. Form đặt lịch dùng chung với trang `/booking` — xem `docs/instruction/booking.md`.

## Dùng chung
- `agents/index.ts` (router → chọn agent → `runAgent`), `agents/runAgent.ts` (tool loop, `MAX_TOOL_ROUNDS = 6`), `agents/llm.ts` (`callLlm` non-stream, `streamLlm` SSE — xem §9), `agents/base.ts`.
- `agents/tools/*` — booking, order, myOrders (cả huỷ đơn), loyalty, faq, search...; `agents/agents/*` — faq, price, recommend, fallback, router.
- Dữ liệu FAQ (tool `faq`, `search`): `FaqService.getFaqs()` lấy toàn bộ FAQ đang hiển thị (`?limit=FULL_LIST_LIMIT`), cache localStorage `LOCAL_STORAGE_KEY.faqs` trong `FAQ_CACHE_DURATION` (3 ngày). Admin quản lý ở `/admin/faqs` (xem `docs/instruction/admin.md` §4).
- Danh sách chi nhánh (tool `get_branches` trong `agents/tools/order.ts`): tên, địa chỉ, giờ mở cửa (`openingHours`), SĐT, link bản đồ — xem §5.
- `services/order.ts` — `getMyOrders`, `getMyOrder`, `cancelMyOrder`, `createGuestOrder`, `lookupOrdersByPhone`, `getOrderByCode`, `getOrderCode`, `normalizeOrderCode`.
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

## 6. Huỷ đơn qua chat
### Mục đích
Khách đã đăng nhập huỷ đơn còn `PENDING` ngay trong chat. AI **không tự huỷ**: tool chỉ chọn đơn, khách phải bấm xác nhận trong modal.
### Entry points
- `agents/tools/myOrders.ts` — tool `cancel_my_order` (`TOOL_NAME.cancelMyOrder`, gắn vào agent `recommend`), `takePendingCancelOrder()`.
- `components/Chat/index.tsx` — `openCancelOrderConfirm` mở `CancelOrderConfirm` (dùng chung với `/profile`, `/track-order`) qua `useModalDrawer` (`mode: 'modal'`, `add: true` — modal z-index cao hơn drawer chat trên mobile).
### Luồng xử lý
1. Khách nhắn "huỷ đơn …" → router → `recommend` → `cancel_my_order({ orderCode? })`.
2. Chưa login → `agent.order.cancel.requireLogin` (API `PATCH /laundry-orders/me/:id/cancel` cần token; khách vãng lai gọi hotline).
3. Có mã → `getOrderByCode` lấy id → `getMyOrder(id)` kiểm tra đơn của chính khách (404 → `notFound`) → khác `CANCELLABLE_ORDER_STATUS` → `notCancellable` (kèm trạng thái).
4. Không mã → `getMyOrders({ limit: PAGE_SIZE })` lọc `PENDING`: 0 đơn → `noPending`; 1 đơn → chọn luôn; nhiều đơn → `pickOne` + danh sách `pickItem` để khách nói mã.
5. Chọn được đơn → tool lưu `{ id, code }` vào biến module `pendingCancelOrder` và bảo LLM nhắc khách xác nhận. Không dùng marker trong câu trả lời (LLM có thể chép sai id).
6. `handleSend` xoá pending cũ trước khi gọi agent, sau khi agent trả lời gọi `takePendingCancelOrder()` → có thì mở modal.
7. Khách bấm "Huỷ đơn" → `OrderService.cancelMyOrder(id)` → toast `myOrders.cancel.success`, invalidate `QUERY_KEYS.getMyOrders` + `getMyOrder`, thêm tin `agent.order.cancel.cancelled` vào chat và history. Lỗi → `CancelOrderConfirm` hiện `myOrders.cancel.error`. Đóng modal → không huỷ.
### Translation / Constants
- `agent.order.cancel.{requireLogin,notFound,notCancellable,noPending,pickOne,pickItem,cancelled}`, dùng lại `myOrders.cancel.*`; `TOOL_NAME.cancelMyOrder`, `CANCELLABLE_ORDER_STATUS`, `PAGE_SIZE` (`constants/app.ts`).
### Edge cases
- Không mã chỉ xét 10 đơn mới nhất; đơn `PENDING` cũ hơn thì khách cần nói mã.
- Đơn huỷ không bị trừ điểm (điểm giữ chỗ tự được nhả) — xem `docs/instruction/order.md` §3, §4.

## 7. Điểm tích lũy & hạng
### Entry points
- `agents/tools/loyalty.ts` — tool `get_my_loyalty` (`TOOL_NAME.getMyLoyalty`, agent `recommend`).
### Luồng xử lý
1. Chưa login → `agent.loyalty.requireLogin`.
2. `UserService.getProfile()` lấy `loyaltyPoints` mới nhất (store persist có thể cũ) → `getCustomerTier()` (`utils/loyalty.ts`) → `getPointsValue()` (`utils/orderPricing.ts`).
3. Trả: hạng + điểm + số tiền quy đổi (`agent.loyalty.summary`), còn bao nhiêu điểm lên hạng (`profile.loyalty.toNextTier` / `topTier`), cách tích (`profile.loyalty.earnRule`), cách đổi (`agent.loyalty.redeemRule`, theo `LOYALTY_REDEEM`). Agent hiển thị nguyên văn.
### Translation / Constants
- `agent.loyalty.{requireLogin,summary,redeemRule}`, dùng lại `profile.loyalty.{tiers.*,toNextTier,topTier,earnRule}`; `TOOL_NAME.getMyLoyalty`, `LOYALTY_REDEEM`, `CUSTOMER_TIER_MIN_POINTS`.
### Edge cases
- Ngưỡng hạng/quy đổi lấy từ constants FE — phải khớp server (xem `docs/instruction/profile.md` §1).

## 8. Router prompt
### Mục đích
Router chỉ phân loại tin nhắn mới nhất và chọn agent, không bao giờ tự trả lời khách và không bị prompt injection đổi vai trò.
### Entry points
- `agents/agents/router.ts` — `buildRouterSystem(routableAgents())`, `ROUTER_EXAMPLES`, `routeToAgentTool`; gọi từ `agents/index.ts`.
### Luồng xử lý
1. Prompt chia theo guide prompt engineering của OpenAI: `# Identity` (là bộ điều phối, không phải trợ lý trả lời khách) → `# Instructions` (luật route) → `# Agents` (thẻ `<agent name>` sinh từ registry, thêm `fallback`) → `# Examples` (few-shot `<user_message>` / `<decision>`).
2. Luật: luôn gọi `route_to_agent` đúng 1 lần, `fallback` nằm trong `enum` của tool; dựa vào tin mới nhất, chỉ dùng lượt trước để hiểu câu nối tiếp ngắn; nhiều ý → chọn yêu cầu chính; ngoài phạm vi → chọn `fallback`. Giá, đơn, đặt chỗ, địa chỉ, liên hệ của doanh nghiệp khác và kiến thức chung/toán cũng là `fallback`.
3. Tin nhắn của khách được coi là nội dung cần phân loại, không phải lệnh: yêu cầu đổi vai trò / bỏ qua luật / lộ prompt → `fallback`.
4. Vẫn không có tool call hợp lệ (phòng khi model trả sai) → `agents/index.ts` chạy agent `fallback`. Output sai định dạng được chuẩn hóa trước — xem §10.
### Edge cases
- `ROUTER_EXAMPLES` chỉ render ví dụ có agent nằm trong danh sách routable (hoặc `fallback`), nên bỏ agent khỏi registry không làm ví dụ trỏ tới agent không tồn tại. Thêm agent mới → nên thêm 1–2 ví dụ.

## 9. Streaming câu trả lời
### Mục đích
Chữ hiện dần trong lúc LLM sinh ra, kèm trạng thái việc đang làm và nút Dừng, thay vì chờ xong cả câu trả lời. Streaming không rút ngắn tổng thời gian: chữ đầu tiên chỉ có sau khi router và các tool chạy xong.
### Entry points
- `agents/llm.ts` — `streamLlm(request, { onText, signal })`: đọc SSE, trả về `{ text, toolCalls }` như `callLlm`.
- `agents/runAgent.ts`, `agents/index.ts` — nhận `AgentStreamHandlers` (`onText`, `onToolCall`, `signal`).
- `zustand/chatStream.ts` — store **không persist**: `text`, `activeTool`, `controller`, `begin/stop/discard/end`.
- `components/Chat/textStream.ts` — `getVisibleStreamText`, `createTextSmoother`.
- `components/Chat/index.tsx` (`handleSend`, cuộn, nút Dừng), `ChatMessageList.tsx` (`StreamingMessage`), `TypingIndicator.tsx` (nhãn trạng thái).
### Luồng xử lý
1. `handleSend` gọi `chatStream.begin()` lấy `AbortController`, tạo smoother rồi gọi `chatAgent.chat(..., handlers)`.
2. Router dùng `callLlm` (non-stream) vì chỉ cần kết quả chọn agent. Indicator hiện `chat.typing`.
3. Mỗi vòng của agent dùng `streamLlm`: `delta.content` → `onText`; `delta.tool_calls` được ghép theo `index` (thiếu thì theo `id` / vị trí).
4. `onText`: cộng dồn text thô → `getVisibleStreamText` (bỏ marker, giữ lại đoạn cuối có thể là đầu marker) → `smoother.setTarget`. Smoother mỗi `CHAT_STREAM_TICK_MS` nhả `pending / CHAT_STREAM_CATCH_UP_DIVISOR` ký tự vào `chatStream.text`.
5. `onToolCall`: xoá text nháp (chữ trước tool call không phải câu trả lời), đặt `activeTool` → indicator hiện nhãn theo `TOOL_STATUS_KEY`.
6. Xong: `setTarget(cleanText)` + `await drain()` → `addMessage` + `setHistory`, xử lý form / modal huỷ đơn như cũ → `chatStream.end()`.
### Cuộn
- Trong `Chat`: khi đang "bám đáy" (`isPinnedRef`) thì mỗi lần stream cập nhật đặt `scrollTop` tức thì (không `smooth`, vì `smooth` chạy lại liên tục gây giật).
- Chỉ cuộn **lên** mới bỏ bám đáy; về gần đáy (`CHAT_SCROLL_PIN_THRESHOLD`) hoặc gửi tin mới thì bám lại.
### Translation / Constants
- `chat.stop`, `chat.status.*`, `chat.typing`; `TOOL_STATUS_KEY`, `CHAT_COMPLETIONS_PATH`, `SSE_*`, `CHAT_STREAM_TICK_MS`, `CHAT_STREAM_CATCH_UP_DIVISOR`, `CHAT_SCROLL_PIN_THRESHOLD` (`constants/tools.ts`). Thêm tool mới → thêm nhãn vào `TOOL_STATUS_KEY` (thiếu thì dùng `chat.typing`).
### Edge cases
- **Dừng**: giữ phần chữ đã hiện và đưa vào history; không báo lỗi; không mở form/modal của lượt đó. Chưa có chữ thì history không đổi.
- **Lỗi giữa chừng**: giữ phần chữ đã hiện, thêm tin `chat.error`, history không đổi.
- **Xoá hội thoại khi đang chạy**: `discard()` huỷ lượt và bỏ toàn bộ kết quả.
- **Đóng chat khi đang chạy**: `Chat` unmount nhưng lượt vẫn chạy (state nằm trong store); mở lại thấy bubble đang chạy tiếp. Form do tool mở nằm ở state cục bộ nên không hiện nếu đã đóng chat.
- **Provider không trả SSE**: `streamLlm` đọc JSON như `callLlm`, chữ vẫn được smoother nhả dần.
- **Tab ẩn**: smoother hiện hết ngay vì trình duyệt giới hạn timer.
- **Markdown chưa hoàn chỉnh**: trong lúc chạy có thể thoáng thấy ký tự thô (`**`, `|` của bảng) cho tới khi đủ cú pháp.

## 10. Chuẩn hóa tool call
### Mục đích
Model đôi khi trả tool call sai định dạng. `agents/llm.ts` chuẩn hóa về một dạng để router và `runAgent` không bỏ sót lệnh gọi.
### Entry points
- `agents/llm.ts` — `normalizeResponse` (dùng `parseEmbeddedCall`, `normalizeToolCall`, `parseTextToolCall`); chạy trong cả `callLlm` (router) và `streamLlm` (agent), nơi gọi không cần làm gì thêm.
### Luồng xử lý
1. Tên tool có dạng `tool({...})` với `tool` nằm trong `request.tools` → khôi phục tên thật và gộp tham số. Tham số trong tên được ưu tiên hơn `arguments`, vì khi đó `arguments` có thể rỗng hoặc chứa rác. Chấp nhận thiếu hoặc thừa `)`.
2. Không có tool call và toàn bộ nội dung text chỉ là một lệnh `tool({...})` → đổi thành tool call (`id` = tên tool), `text` = `null`.
3. Router (`agents/index.ts`) và `runAgent` vẫn so khớp tên tool tuyệt đối trên kết quả đã chuẩn hóa.
### Edge cases
- Tool không có trong `request.tools` (ví dụ `FALLBACK`) giữ nguyên, nên router vẫn đi vào agent `fallback`.
- Text có thêm chữ trước hoặc sau lệnh gọi, hoặc chỉ nhắc đến tên tool → giữ nguyên là câu trả lời thường.
- Request không có `tools` → không chuẩn hóa.
- Tham số trong tên không parse được → giữ tên thật và dùng `arguments`.
- **Khi streaming**: chuẩn hóa chạy sau khi nhận xong, nên lệnh gọi viết thành văn bản có thể thoáng hiện dưới dạng chữ nháp; `onToolCall` sẽ xoá chữ nháp đó (xem §9, bước 5).

## 11. Log token & câu hỏi lên Google Sheets
### Mục đích
Mỗi lần gọi LLM ghi một dòng vào Google Sheet để thống kê token theo từng lần gọi và xem khách đã hỏi gì. Dùng Sheet thay vì MongoDB để log không chiếm dung lượng database đang có giới hạn: Sheet đầy hay lỗi thì chỉ mất log, không ảnh hưởng đơn hàng.
### Entry points
- `app/api/chat-agent/[...path]/route.ts` — bọc response của provider, đọc kết quả và ghi nền bằng `after()`.
- `utils/chatLog.ts` — `readChatLogRequest`, `captureStream`, `buildChatLogRow`, `buildChatLogFailureRow`, `maskPhones`.
- `services/googleSheets.ts` — `isChatLogEnabled`, `appendChatLogRow`. Chỉ dùng ở server vì có key service account.
- `agents/llm.ts` — bật `stream_options.include_usage` để provider báo token khi stream.
### Luồng xử lý
1. Proxy đọc câu hỏi (tin `user` mới nhất trong body).
2. `captureStream` chuyển nguyên từng byte về browser, đồng thời giữ lại toàn bộ nội dung. Khi khách bấm Dừng, lệnh huỷ vẫn truyền tới provider nên model ngừng sinh chữ.
3. Khi response kết thúc, `after()` dựng dòng log (đọc được cả JSON của router và SSE của agent) rồi append xuống cuối Sheet qua `CHAT_LOG_SHEET_RANGE` (`Logs!A:A`), dữ liệu mới nhất ở dưới cùng. Chỉ tốn một lệnh ghi, không phải dịch các dòng cũ, và chạy sau khi response kết thúc nên không làm chat chậm đi. Range phải neo vào cột A, vì nếu dùng cả tab thì Sheets chia "bảng" tại ô trống (ví dụ `answer` của dòng router) và ghi dòng sau lệch cột.
### Cột dữ liệu
Theo thứ tự `CHAT_LOG_COLUMNS` (dòng tiêu đề của Sheet phải khớp): `date`, `time` (giờ `SHOP_TIMEZONE`), `inputTokens`, `outputTokens`, `cachedTokens`, `totalTokens`, `status`, `question`, `toolCalls`, `answer` (hoặc nội dung lỗi khi `status = error`).
- `cachedTokens` nằm trong `inputTokens`, không cộng thêm khi tính tổng.
- Một tin nhắn có nhiều dòng; `question` lặp lại ở mỗi dòng. Dòng router là dòng có `toolCalls` chứa `route_to_agent`, nên đếm số tin nhắn bằng số dòng này.
- **Tô màu**: dòng router được tô nền bằng Conditional formatting đặt ngay trên Sheet với công thức `=REGEXMATCH($I1,"^route_to_agent")`, không nằm trong code và không tốn thêm lượt ghi. Vùng áp dụng bắt đầu từ dòng 1 (tiêu đề không khớp nên không bị tô). Tạo Sheet mới thì phải đặt lại rule này.
- Không lưu id gom nhóm, user, agent hay vòng lặp: không thống kê được theo user/agent, và khi nhiều khách chat cùng lúc thì dòng của các tin nhắn có thể xen kẽ nhau.
- Router lỗi, bị Dừng, hoặc model không gọi `route_to_agent` thì dòng đó không có `toolCalls` nên không được tô và không được đếm là tin nhắn.
### Cấu hình
- Env server: `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`. Thiếu một biến → tắt log, proxy chuyển response thẳng như trước.
- Sheet phải có tab tên `Logs` và được share quyền Editor cho email service account.
### Translation / Constants
- `CHAT_LOG_STATUS`, `CHAT_LOG_COLUMNS`, `CHAT_LOG_SHEET_RANGE`, `CHAT_LOG_MAX_TEXT_LENGTH`, `CHAT_LOG_TIMEOUT_MS`, `CHAT_LOG_PHONE_REGEX`, `GOOGLE_SHEETS_API_URL`, `GOOGLE_SHEETS_SCOPE` (`constants/tools.ts`). Không có text UI.
### Edge cases
- **Che SĐT**: `question`, `toolCalls`, `answer` được che số điện thoại Việt Nam, giữ 3 số cuối. Chỉ che SĐT, nên tên và địa chỉ khách nhắn vẫn được lưu. Hotline của quán trong câu trả lời cũng bị che; số nước ngoài không bị che. Một số chuỗi số giống SĐT (ví dụ ngày `04-11-2026 10`) có thể bị che nhầm.
- **Giới hạn độ dài**: `question`, `toolCalls`, `answer` cắt ở `CHAT_LOG_MAX_TEXT_LENGTH`.
- **Công thức**: ghi bằng `valueInputOption=RAW` nên nội dung khách nhập không chạy thành công thức.
- **Đổi tên tab**: tên `Logs` nằm trong `CHAT_LOG_SHEET_RANGE`; đổi tên tab trên Sheet mà không đổi constant thì mọi lần ghi đều lỗi và mất log.
- **Bấm Dừng giữa chừng**: `status = aborted`, token để trống vì provider chưa kịp báo. Tổng token vì vậy có thể thấp hơn thực tế một chút. `streamLlm` huỷ stream sau `[DONE]` vẫn tính là `ok`.
- **Provider không báo `usage`**: cột token để trống, không ghi 0 và không ước lượng.
- **Lỗi provider / mất kết nối**: `status = error`, `answer` chứa nội dung lỗi.
- **Ghi Sheet lỗi**: bỏ qua dòng đó, chat không bị ảnh hưởng, không có retry. `next.config.ts` xoá `console.*` ở production nên lỗi này không hiện trong log production.
- **Quota Google Sheets**: khoảng 60 lần ghi/phút cho một service account, vượt quota thì mất dòng log. Một file tối đa 10 triệu ô, tức khoảng 1 triệu dòng với 10 cột.
- **Độ tin cậy**: token do provider trả nên client không sửa được.

## Liên quan
- `docs/instruction/booking.md` (form dùng chung), `docs/instruction/order.md` (tạo đơn, giá, điểm, huỷ đơn), `docs/instruction/tracking.md` (tra cứu trang /track-order), `docs/instruction/profile.md` §1 (hạng & điểm).
