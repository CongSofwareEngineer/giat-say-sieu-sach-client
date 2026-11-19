# Chat AI (trợ lý đa agent)
> Cập nhật: 2026-11-19

## Tổng quan
Chat nổi là trợ lý đa agent; chỉ lời gọi LLM rời trình duyệt (qua `/api/chat-agent/chat/completions`), còn tool chạy client-side với `AgentContext` (`locale`, `userId`). Sub-logic: (1) Đặt lịch giặt không cần login, (2) Tra cứu đơn theo SĐT / mã đơn, (3) Form chọn Tỉnh/Xã qua LocationApi, (4) Định dạng danh sách đơn, (5) Địa chỉ cửa hàng / địa chỉ đã lưu, (6) Huỷ đơn qua chat, (7) Điểm tích lũy & hạng, (8) Định tuyến & chọn tool bằng Jev (System One), (9) Streaming câu trả lời, (10) Chuẩn hóa tool call, (11) Log token & câu hỏi lên Google Sheets, (12) Giới hạn chat (3 tin chờ / 10 tin mỗi giờ), (13) Ngôn ngữ trả lời, (14) Câu trả lời cố định (không gọi LLM), (15) Fast path: tool tự trả lời. Form đặt lịch dùng chung với trang `/booking` — xem `docs/instruction/booking.md`.

## Dùng chung
- `agents/index.ts` (Jev quyết định agent + tool → `runAgent`), `agents/runAgent.ts` (tool loop, `MAX_TOOL_ROUNDS = 6`, lọc tool schema), `agents/llm.ts` (`callLlm` non-stream, `streamLlm` SSE — xem §9), `agents/systemOne.ts` (client Jev), `agents/base.ts`.
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

## 8. Định tuyến & chọn tool bằng Jev (System One)
### Mục đích
Chọn agent xử lý tin nhắn **và** chọn tool nào được phép chạy, bằng một request duy nhất tới Jev (model quyết định có kiểu dữ liệu của TypeSafe, docs: `docs.typesafe.ai`) thay vì một lời gọi LLM. Jev trả về giá trị + phân phối xác suất chứ không sinh văn bản, nên quyết định này nhanh và rẻ hơn nhiều; đồng thời chỉ gửi schema của những tool liên quan cho LLM nên request trả lời cũng nhẹ đi.
### Entry points
- `agents/systemOne.ts` — `askSystemOne(state, questions, signal)` POST `/api/systemone` (proxy giữ `SYSTEM_ONE_API_KEY` ở server, ghép URL `SYSTEM_ONE_API_URL + /systemone`); `choiceQuestion()` tạo câu hỏi type `choice`; `likelyChoices(answer, min)` lọc option theo `probabilities`.
- `agents/agents/router.ts` — `decideWithJev(conversation, signal)`: dựng `state`, 2 câu hỏi, trả `{ agent, toolNames }`. `agentCriteria()` sinh từ `AGENT_REGISTRY`, `toolCriteria()` sinh từ tool của mọi agent routable + option `none`.
- `agents/index.ts` — `chatAgent.chat()` gọi `decideWithJev` → `getAgent(decision.agent)` → `runAgent(..., decision.toolNames)`.
- `agents/runAgent.ts` — `selectTools(agent, toolNames)` lọc tool schema gửi cho LLM.
### Luồng xử lý
1. `state` gửi cho Jev là text ngắn: `SYSTEM_ONE_STATE_MESSAGES` (4) lượt cuối trong thẻ `<conversation>` + tin mới nhất trong `<latest_user_message>`. Đây là lý do rẻ: quyết định không cần cả history.
2. Một request chứa **2 câu hỏi** (Jev chạy song song, độc lập, `state` chỉ tính token một lần):
   - `route_agent` (`choice`): `criteria` = `{ tên agent: description }` của **mọi** agent trong `AGENT_REGISTRY` (gồm `fallback`). Description lấy từ chính file agent, nên thêm agent vào registry là route được ngay, không sửa gì ở đây.
   - `pick_tool` (`choice`): `criteria` = `{ tên tool: description }` của tất cả tool thuộc các agent routable (tên tool unique toàn cục theo `TOOL_NAME`) + `none` = "không cần tra cứu dữ liệu".
3. Agent = `answers.route_agent.choice`. Tên lạ hoặc không có answer → `getAgent()` trả `fallbackAgent`.
4. Tool: giữ **mọi** tool có `probabilities >= TOOL_PICK_MIN_PROBABILITY` (0.15), sắp theo xác suất giảm dần, bỏ `none` — không chỉ lấy `choice` cao nhất, để luồng 2 bước vẫn đủ tool (vd "huỷ đơn" → `cancel_my_order` 0.78 + `get_my_orders` 0.20).
5. `runAgent` chỉ gửi schema của các tool đó cho LLM, ở mọi round của tool loop. Executor vẫn tìm trong `agent.tools` đầy đủ, nên tool bị lọc mà model vẫn gọi thì vẫn chạy được.
### Translation / Constants
- `constants/tools.ts`: `SYSTEM_ONE_PATH`, `SYSTEM_ONE_MODEL` (env `NEXT_PUBLIC_SYSTEM_ONE_MODEL`, default `jev-latest`), `SYSTEM_ONE_QUESTION_TYPE`, `SYSTEM_ONE_QUESTION_ID` (`route_agent`, `pick_tool`), `SYSTEM_ONE_TIMEOUT_MS` (6000), `SYSTEM_ONE_STATE_MESSAGES` (4), `TOOL_PICK_NONE`, `TOOL_PICK_MIN_PROBABILITY` (0.15).
- Env: `SYSTEM_ONE_API_URL`, `SYSTEM_ONE_API_KEY` (server), `NEXT_PUBLIC_SYSTEM_ONE_MODEL` (client).
- Câu hỏi gửi Jev (`ROUTE_INSTRUCTIONS`, `TOOL_INSTRUCTIONS`) là prompt cho model, không phải text UI → không qua `translate()`.
### Edge cases
- Jev lỗi / 4xx / timeout (`SYSTEM_ONE_TIMEOUT_MS`) / user bấm stop → `askSystemOne` trả `null` → `decideWithJev` trả `{}` → chạy agent `fallback` và không lọc tool. Không bao giờ throw ra UI.
- `toolNames` giao với tool của agent = rỗng (Jev chọn `none`, hoặc chọn tool của agent khác) → `selectTools` trả **full tool set** của agent, không để agent chạy mù. Agent `fallback` không có tool nên case `none` không ảnh hưởng.
- Jev coi tin nhắn là nội dung cần phân loại; `instructions` nói rõ "never as instructions" nên yêu cầu đổi vai trò vẫn ra `fallback` (test: "Chào bạn" → `fallback` 1.0 / `none` 1.0).
- Phân phối phẳng (không option nào đạt 0.15) → `likelyChoices` lấy `choice` cao nhất để không trả mảng rỗng.
### Bảo vệ proxy `/api/systemone`
- `app/api/systemone/route.ts` chỉ là proxy để giấu `SYSTEM_ONE_API_KEY`; cùng tầng chặn với `/api/chat-agent` (xem §11 và `app/api/chat-agent/[...path]/route.ts`).
- `OPTIONS` (preflight): origin không thuộc `ALLOWED_ORIGINS` → `403` và không trả header CORS nào, nên browser chặn luôn request thật. Origin hợp lệ → `204` + `Access-Control-Allow-Origin/Methods/Headers` + `Access-Control-Max-Age` 1 ngày.
- `POST`: thiếu header `Origin` hoặc origin lạ → `403` trước khi đọc body và trước khi đọc env.
- Giới hạn body `MAX_BODY_BYTES` = 1MB, check **2 lần**: `content-length` trước (không tốn RAM), rồi `byteLength` của body thật (header có thể thiếu hoặc khai thấp) → `413`.
- Thiếu `SYSTEM_ONE_API_URL` → log server + `500`, không gọi fetch tới URL `undefined/...`.
- `fetch` upstream bọc `try/catch` → `500 { error: 'Failed to proxy request' }`, không rò stack/URL backend ra client.
- Response trả về có `Access-Control-Allow-Origin` = origin của request (bắt buộc để browser đọc được kết quả) và `Cache-Control: no-store`.
- Lưu ý: `ALLOWED_ORIGINS` bị lặp ở `app/api/systemone` và `app/api/chat-agent` — đổi domain phải sửa cả hai.

### Router LLM (đã tắt, giữ lại để bật lại)
- `buildRouterSystem`, `ROUTER_EXAMPLES`, `routeToAgentTool` vẫn còn trong `agents/agents/router.ts`; chỗ gọi nằm trong block comment `routeWithLlm` ở `agents/index.ts` (kèm các import đã comment). Bật lại = bỏ comment và gọi `routeWithLlm` thay `decideWithJev`.
- Khi dùng router LLM: prompt chia `# Identity` → `# Instructions` → `# Agents` (thẻ `<agent name>` sinh từ registry) → `# Examples` (few-shot). Mỗi agent giữ **đúng 2 ví dụ** trong `ROUTER_EXAMPLES` (lệch số ví dụ gây bias khi tin nhắn mơ hồ); không có tool call hợp lệ → agent `fallback`.
- `description` của agent dùng cho **cả** `criteria` của Jev và prompt router LLM, nên viết theo hướng "khi nào route vào đây", không phải mô tả chức năng chung.

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

## 12. Giới hạn chat (chống spam, tiết kiệm token)
### Mục đích
Giới hạn số tin khách gửi cho trợ lý để chặn spam và giới hạn tiền token. Áp dụng cho cả khách chưa đăng nhập. Đã đăng nhập thì tính theo **tài khoản**, chưa đăng nhập thì tính theo **máy** (`deviceId`).
### Entry points
- `utils/chatDevice.ts` — `getChatDeviceId()`: UUID ngẫu nhiên tạo một lần, lưu ở `LOCAL_STORAGE_KEY.chatDeviceId`. Nếu localStorage bị chặn thì dùng id tạm trong bộ nhớ của phiên trang.
- `services/chatMessage.ts` — `ChatMessageService.saveMessage(deviceId, type, isLogin)` (`POST /chat-messages`). Đã login thì gửi kèm token (`isUseAuth`), chưa login thì không.
- `components/Chat/index.tsx` — `handleSend`, `getChatLimitMessage`, `handleClearChat`.
- Backend: module `src/module/chat-message` (collection `ChatMessage`), xem `docs/instruction/chat.md` của repo backend.
### Luật (cửa sổ trượt 1 giờ)
1. **Tin chưa được trả lời**: tối đa **3** tin của khách sau tin bot gần nhất, chỉ tính các tin trong 1 giờ gần nhất. Tin chờ quá 1 giờ không còn tính, nên khách không bao giờ bị khoá mãi.
2. **Tổng số tin**: tối đa **10** tin của khách trong 1 giờ gần nhất, kể cả khi bot đã trả lời hết.
3. Vượt luật → backend trả **429** với body `{ reason: PENDING_LIMIT | HOURLY_LIMIT, retryAfterSeconds }`. `retryAfterSeconds` là thời gian tới khi có tin rời khỏi cửa sổ và khách gửi lại được.
### Luồng xử lý
1. Khách gửi tin: hiện tin ngay và khoá ô gửi (`isSending`). Ghi nhớ trạng thái login của lượt này (`isLoginTurn`), rồi gọi `saveMessage(USER)`.
2. Bị 429: gỡ tin vừa hiện, trả lại nội dung vào ô nhập (nếu khách gõ tay), toast theo `reason` kèm số phút chờ (`chat.limitPending` / `chat.limitHourly`). 429 không có `reason` (throttler global của backend) → `chat.spamBlocked`. Không gọi LLM.
3. Lưu được: chạy agent như bình thường (§9).
4. Kết thúc lượt (trả lời xong, lỗi, hoặc bấm Dừng) đều gọi `saveMessage(BOT)` với cùng `isLoginTurn` trước khi mở khoá ô gửi. Backend chỉ nhận tin bot khi tin gần nhất là của khách, nếu không thì trả 400 (client bỏ qua).
5. **Xoá hội thoại** (nút thùng rác) chỉ xoá ở client (tin nhắn + history gửi lên AI, để bớt token), **không** reset bộ đếm trên backend.
### Dữ liệu (backend)
- Mỗi dòng: `userId` (null nếu khách vãng lai), `deviceId`, `type` (`user` | `bot`), `createdAt`. Không lưu nội dung tin.
- Tự xoá sau 1 ngày (TTL), vì luật chỉ cần dữ liệu 1 giờ gần nhất.
### Translation / Constants
- `chat.limitPending`, `chat.limitHourly` (biến `{minutes}`), `chat.spamBlocked`; `CHAT_MESSAGE_TYPE`, `CHAT_LIMIT_REASON`, `SECONDS_PER_MINUTE` (`constants/tools.ts`), `LOCAL_STORAGE_KEY.chatDeviceId`, `HTTP_STATUS.TOO_MANY_REQUESTS` (`constants/app.ts`).
- `HttpError` (`config/baseApi.ts`) có thêm `data` (JSON body của lỗi) để đọc `reason`.
- Số 3 / 10 nằm ở backend (`CHAT_LIMIT`); câu toast ghi cứng 3 và 10, đổi constants backend thì sửa luôn 2 key này.
### Edge cases
- **UI vs server**: UI vẫn chỉ cho gửi 1 tin rồi chờ trả lời. Luật 3 tin chờ chặn trường hợp gọi thẳng API, nhiều tab, hoặc khách đóng trang giữa chừng (tin bot không được lưu).
- **Login/logout**: tài khoản và máy có bộ đếm riêng. Khách vãng lai đăng nhập thì có thêm quota theo tài khoản.
- **Gửi đồng thời**: hai request cùng lúc có thể cùng lọt qua kiểm tra (vượt quá 1 tin); throttler global (5 request/giây) giới hạn phần này.
- **Backend không phản hồi** (lỗi khác 429): chat vẫn chạy nhưng không có giới hạn và không lưu tin bot cho lượt đó.
- **Xoá hội thoại khi đang trả lời**: lượt bị huỷ không lưu tin bot, nên tin đó tính là đang chờ (tối đa 1 giờ).
- **Lách giới hạn (khách vãng lai)**: xoá localStorage sẽ đổi `deviceId` và có quota mới. Endpoint `/api/chat-agent` vẫn gọi thẳng được mà không qua kiểm tra này.
- Form đặt lịch và tra đơn theo SĐT (§1, §2) không gọi LLM nên không được lưu/đếm.

## 13. Ngôn ngữ trả lời
### Mục đích
Trả lời khách bằng đúng ngôn ngữ khách đang nhắn, không tốn thêm một lượt gọi LLM để kiểm tra.
### Entry points
- `agents/agents/faq.ts`, `price.ts`, `recommend.ts`, `fallback.ts` — dòng cuối system prompt: `Reply in the same language as the user's message.`
- `agents/tools/index.ts` — `baseTools = [searchTool]`.
### Luồng xử lý
1. Không detect ngôn ngữ, không truyền `locale` vào prompt. Model tự nhận diện ngôn ngữ của tin nhắn và trả lời bằng ngôn ngữ đó.
2. Tool `answer_in_language` (`agents/tools/language.ts`) đã **tắt** — phần export và chỗ gắn vào `baseTools` / agent `fallback` được comment lại, file vẫn giữ để bật lại nếu cần. Mỗi lần model gọi tool này là thêm một vòng tool loop (1 request + token), trong khi model đã tự trả lời đúng ngôn ngữ.
### Translation / Constants
- `TOOL_NAME.answerInLanguage` vẫn còn trong `constants/tools.ts` (chưa dùng).
### Edge cases
- Khách đổi ngôn ngữ website nhưng vẫn nhắn tiếng Việt → model trả lời tiếng Việt (theo tin nhắn, không theo `locale`).
- Nội dung do tool trả về (danh sách đơn, điểm, địa chỉ...) vẫn dịch theo `locale` qua `translate()` trong từng tool, không đổi.

## 14. Câu trả lời cố định (không gọi LLM)
### Mục đích
Chatbox chỉ phục vụ một tập vai trò cố định (bảng giá & dịch vụ, khuyến mãi, FAQ, đặt lịch, tra cứu / huỷ đơn, chi nhánh & liên hệ, điểm tích luỹ, địa chỉ đã lưu). Những tin nhắn mà câu trả lời đã xác định sẵn thì trả về text cố định, không tốn một lời gọi LLM nào — nhanh hơn, rẻ hơn, và câu từ luôn đồng nhất.
### Entry points
- `AgentDefinition.fixedReply` (`agents/base.ts`): `string | ((ctx) => string)`. Agent nào khai báo field này thì `chatAgent.chat` trả thẳng text đó.
- `agents/index.ts` — sau khi Jev chọn agent, kiểm tra `target.fixedReply` trước khi gọi `runAgent`.
- `agents/agents/fallback.ts` — agent `fallback` khai báo `fixedReply: () => translate('agent.fallback.outOfScope')`.
### Luồng xử lý
1. `decideWithJev` trả agent. Jev lỗi / timeout / tên agent lạ → `getAgent()` cũng cho ra `fallback`.
2. `fallback` có `fixedReply` → `chat()` trả `{ text, history }` ngay, **không** gọi `runAgent`, không gọi LLM, không chạy tool.
3. `components/Chat/index.tsx` không cần sửa: câu trả lời không stream vẫn được `smoother.setTarget(cleanText)` hiển thị dần như cũ.
### Translation / Constants
- `agent.fallback.outOfScope` — một câu duy nhất vừa chào, vừa liệt kê vai trò, vừa mời khách hỏi lại đúng phạm vi (dùng chung cho lời chào, cảm ơn, small talk và off-topic).
- `fixedReply` phải là **hàm**, không phải string hằng: `translate()` đọc store ngôn ngữ lúc chạy, gán ở module scope sẽ khoá cứng ngôn ngữ lúc import.
### Edge cases
- Lời chào ("Chào bạn") và off-topic ("1+1 bằng mấy") dùng chung một câu — chấp nhận đánh đổi để chỉ có một key và không bao giờ tốn LLM. Muốn tách thì thêm option cho câu hỏi `route_agent` của Jev.
- Yêu cầu đổi vai trò / prompt injection cũng route về `fallback` (xem §8) → cũng nhận câu cố định này, model không có cơ hội trả lời.
- `systemPrompt` của `fallback` vẫn giữ để bật lại luồng LLM nếu cần; `agent.fallback.message` là key khác (lỗi khi tool loop quá `MAX_TOOL_ROUNDS`), không liên quan.

## 15. Fast path — tool tự trả lời, không gọi LLM
### Mục đích
Với những câu hỏi mà câu trả lời đã xác định sẵn (chỉ là map data API vào một câu cố định), chạy đúng một tool rồi trả thẳng output của nó làm câu trả lời. Một lượt chat như vậy chỉ còn **1 request Jev**, không có chat completion nào. Trước đây LLM chỉ làm việc chép lại output của tool (prompt agent còn phải dặn "hiển thị nguyên văn"), nên vòng gọi đó vừa tốn tiền vừa có rủi ro model sửa số / đổi format.

### Entry points
- `agents/fastPath.ts` — `runFastPath(toolName, ctx, handlers)`: trả về text câu trả lời, hoặc `null` nghĩa là "không đủ điều kiện, chạy agent như cũ".
- `agents/index.ts` — gọi `runFastPath` sau bước `fixedReply` (§14) và trước `runAgent`.
- `agents/systemOne.ts` — `confidentChoice(answer, min)`: lấy `choice` top **chỉ khi** xác suất của nó >= `min`.
- `agents/agents/router.ts` — `RouteDecision.fastTool`: tool Jev chắc chắn nhất, `undefined` nếu phân phối phân tán hoặc Jev chọn `none`.

### Luồng xử lý
1. Jev trả về phân phối xác suất cho câu `pick_tool` (§8). `confidentChoice` lấy tool top nếu xác suất >= `FAST_PATH_MIN_PROBABILITY` (0.6). Vì tổng xác suất = 1 nên trên 0.5 chỉ có tối đa **một** tool đạt ngưỡng → điều kiện "đúng 1 tool và chắc chắn" tự thoả mãn.
2. `runFastPath` kiểm tra tool có nằm trong `ANSWER_READY_TOOLS` không. Không → `null`.
3. Tìm tool trong **toàn bộ** `AGENT_REGISTRY`, không chỉ agent được route: `pick_tool` chọn trên union tool toàn cục nên tool có thể không thuộc agent đó.
4. Gọi `handlers.onToolCall(name)` → UI vẫn hiện nhãn trạng thái (`TOOL_STATUS_KEY`) y như luồng tool loop.
5. `tool.execute({}, ctx)` → output trim; rỗng → `null`.
6. `chatAgent.chat` trả `{ text, history }`, assistant message được thêm vào history như một câu trả lời bình thường.

### Tool đang chạy fast path
`ANSWER_READY_TOOLS` (`constants/tools.ts`):

| Tool | Câu trả lời lấy từ | Ghi chú |
|---|---|---|
| `get_branches` | `agent.order.branch.*` + `GET /branches` | §5 |
| `get_contact_info` | `agent.order.contact.summary` + `INFO_CONTACT` + `GET /branches` | §5 |
| `get_my_loyalty` | `agent.loyalty.*` + `profile.loyalty.*` + `GET /users/me` | §7; chưa login → `requireLogin` |
| `get_promotions` | `agent.promotion.*` + `GET /promotions` | §4 của `promotion.md` |
| `open_laundry_form` | `agent.laundry.formOpening` + `[LAUNDRY_FORM]` | §1 |
| `track_order` | `agent.order.track.*` + `GET /laundry-orders/lookup/:code` | §2; cần mã đơn |
| `get_my_orders` | `agent.order.myOrders.*` | §2, §4; guest cần SĐT |
| `cancel_my_order` | `agent.order.cancel.*` | §6; khách vẫn phải xác nhận trong modal |

Tool **không** cho vào whitelist: `get_faq` / `search` (output còn cần model chọn & rút gọn), `get_services` / `get_service` / `estimate_cost` (cần tính toán theo kg), `get_my_addresses` (hiếm, giữ LLM).

### Tham số tool (regex, không dùng LLM)
Jev chỉ quyết định **tool nào** chạy, không trả tham số. Ba tool cần tham số thì đọc thẳng từ tin nhắn bằng regex trong `agents/fastPath.ts` — chính xác hơn và rẻ hơn việc nhờ LLM copy mã ra khỏi câu:

| Tool | Tham số | Cách lấy | Không tìm thấy |
|---|---|---|---|
| `track_order` | `orderCode` | `ORDER_CODE_IN_TEXT_REGEX` (`constants/app.ts`) | trả `null` → agent + LLM hỏi lại trong ngữ cảnh |
| `get_my_orders` | `phone` (chỉ guest) | `CHAT_LOG_PHONE_REGEX` + `isValidVnPhone` + `normalizeVnPhone` | `{}` → tool hỏi SĐT + bật `OrderPhoneForm` |
| `cancel_my_order` | `orderCode` (tuỳ chọn) | như `track_order` | `{}` → tool liệt kê đơn `PENDING` để khách chọn |

- `ORDER_CODE_IN_TEXT_REGEX`: mã đơn 8 ký tự thuộc bảng `2-9` + `A-Z` trừ `O I L` (xem `tracking.md` §1). `#` được capture riêng: **không có `#` thì mã phải chứa ít nhất một chữ số**, nếu không một từ 8 chữ cái (`abcdefgh`) sẽ bị đọc thành mã đơn.
- `CHAT_LOG_PHONE_REGEX` (`constants/tools.ts`) dùng chung với phần ẩn SĐT trong log (§11) — cùng một pattern "SĐT Việt Nam trong câu tự do", không tách thành 2 constant. Tên key vẫn mang tiền tố `CHAT_LOG_` vì lịch sử.

### Translation / Constants
- `ANSWER_READY_TOOLS` (`constants/tools.ts`) — whitelist tool mà output **đã là câu trả lời cuối cho user**. Tool nào output còn cần model đọc/gộp/rút gọn thì **không** được cho vào.
- `FAST_PATH_MIN_PROBABILITY` (0.6) — ngưỡng chắc chắn của Jev.
- Text câu trả lời nằm trong chính tool, qua `translate()` (`agent.*`), nên fast path tự động đúng ngôn ngữ.
- `agent.promotion.{empty,item,discount,code,noDescription}` — trước đây `promotion.ts` hardcode tiếng Việt trong code, nên user chọn EN vẫn ra tiếng Việt.
- `agent.laundry.formOpening` — câu mở form. Output của `open_laundry_form` giờ là **câu trả lời hoàn chỉnh + marker trên dòng riêng** thay vì chỉ thị cho LLM, nên fast path dùng được; prompt agent `recommend` đổi sang "output its result exactly as-is, keeping the marker line unchanged".
- `agent.order.myOrders.askPhone` + `agent.order.cancel.confirmPrompt` — hai nhánh còn lại từng trả **chỉ thị cho LLM** thay vì câu cho khách (guest chưa có SĐT; đã chọn được đơn cần huỷ). Giờ là câu hoàn chỉnh, nên fast path dùng được; prompt `recommend` đổi sang relay nguyên văn.
- Nguyên tắc: tool nằm trong `ANSWER_READY_TOOLS` thì **mọi nhánh** output của nó phải là câu nói được với khách, kể cả nhánh lỗi / thiếu dữ liệu. Không được còn câu kiểu "Briefly tell the user to…".

### Edge cases
- Tin mơ hồ / nhiều ý → không tool nào đạt 0.6 → `fastTool` rỗng → chạy agent + LLM như cũ. Không mất chức năng nào.
- Tool throw (API chết) → `runFastPath` trả `null` → agent chạy lại tool đó và báo lỗi cho user bằng `agent.run.toolError`. Tool chạy 2 lần trong case lỗi này, chấp nhận được vì tool trong whitelist đều là read-only.
- User bấm stop: `signal.throwIfAborted()` trước và sau khi chạy tool; abort được throw ra ngoài cho `handleSend` xử lý, không biến thành câu trả lời.
- Agent route về `fallback` thì `fixedReply` (§14) thắng, fast path không chạy — quyết định phạm vi là cửa gác, giống hành vi cũ (trước đây cũng ra câu "chỉ hỗ trợ dịch vụ giặt").
- Câu trả lời fast path **không stream** (không có `onText`); `components/Chat` vẫn hiện dần qua `smoother.setTarget` nên UI không đổi.

## Liên quan
- `docs/instruction/booking.md` (form dùng chung), `docs/instruction/order.md` (tạo đơn, giá, điểm, huỷ đơn), `docs/instruction/tracking.md` (tra cứu trang /track-order), `docs/instruction/profile.md` §1 (hạng & điểm).
