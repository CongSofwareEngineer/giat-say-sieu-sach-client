# Chat AI (trợ lý đa agent) — Changelog
> Instruction: docs/instruction/chat.md

## 2026-11-19
- **Ngôn ngữ trả lời**: tắt tool `answer_in_language` (comment export trong `agents/tools/index.ts`, bỏ khỏi `baseTools` và agent `fallback`); 4 agent đổi dòng prompt sang `Reply in the same language as the user's message.`. Mỗi lần model gọi tool này là thêm 1 vòng tool loop (1 request + token) chỉ để biết ngôn ngữ, trong khi model tự nhận diện được từ tin nhắn. File `agents/tools/language.ts` giữ lại (không dùng) để bật lại nếu cần.
- **Router prompt**: gộp 3 bullet về `fallback` trong `# Instructions` thành 1 (3 bullet cùng kết luận `fallback` làm model bị phân tán); giữ riêng luật chống prompt injection.
- **Danh sách agent sinh từ registry**: `routableAgents()` đổi từ list hardcode `[faq, price, recommend]` sang `Object.values(AGENT_REGISTRY)` lọc bỏ `fallback`; `enum` của `routeToAgentTool` cũng derive từ `routableAgents()` + `fallback` thay vì liệt kê tay. Trước đây thêm agent vào registry mà quên 2 chỗ này thì agent không bao giờ được route tới (hoặc được prompt liệt kê nhưng tool schema không nhận → tool call invalid → rơi về `fallback`), lỗi âm thầm không thấy ở build. Thứ tự và nội dung prompt không đổi. Đã cập nhật lại các bước "thêm agent mới" trong `CLAUDE.md` (4 bước → 2 bước + ví dụ).
- **Mô tả agent `fallback`**: bỏ bản hardcode trong `buildRouterSystem`, router đọc `fallbackAgent.description`. Trước đó có 2 mô tả khác nghĩa cho cùng một agent (router vs `fallback.ts`) nên sửa một bên là lệch; bản giữ lại là bản hướng routing (gồm cả "đổi role / luật"). `buildRouterSystem` cũng gộp `agents` + `fallbackAgent` thành một mảng, nên `<agents>` và tập tên lọc ví dụ dùng chung một nguồn.
- **Router few-shot**: cân lại `ROUTER_EXAMPLES` còn 2 ví dụ / agent (trước đó `recommend` 4, `fallback` 3) để tin nhắn mơ hồ không bị nghiêng về `recommend`. Bỏ 3 ví dụ "Cửa hàng ở đâu vậy?", "Mình còn bao nhiêu điểm?", "Viết giúp mình bài thơ về mùa thu" — các case này đã được `description` của agent và luật `fallback` cover.
- **Giới hạn chat**: đổi từ "tối đa 2 tin chưa trả lời" sang 2 luật trong cửa sổ trượt 1 giờ: tối đa 3 tin chưa được trả lời và tối đa 10 tin. Đã login thì tính theo tài khoản (gửi token), chưa login thì theo `deviceId`.
- **Toast khi bị chặn**: hiện lý do và số phút phải chờ, đọc từ body 429 (`reason`, `retryAfterSeconds`).
- **Xoá hội thoại**: chỉ xoá ở client, không còn gọi `DELETE /chat-messages/:deviceId` (bỏ `ChatMessageService.clearMessages`).
- **HttpError**: thêm `data` chứa JSON body của response lỗi.
- **Constants / keys mới**:
  - `CHAT_LIMIT_REASON`, `SECONDS_PER_MINUTE`; `chat.limitPending`, `chat.limitHourly`
- **Lý do**:
  - Luật cũ có thể khoá khách tới 30 ngày khi họ đóng trang giữa chừng 2 lần. Giờ tin chờ quá 1 giờ không còn tính.
  - Giới hạn 10 tin mỗi giờ để giảm tiền token. Xoá hội thoại không được reset bộ đếm, nếu không thì giới hạn vô dụng.
  - Backend local trước đó chưa có module `chat-message`, nên giới hạn chưa thực sự chạy; đã thêm ở repo backend.

## 2026-11-07
- **Lưu tin nhắn**: mỗi tin user/bot được lưu vào collection `ChatMessage` (`deviceId`, `indexChat`, `type`, `createdAt`). `indexChat` là bộ đếm chung theo từng máy. Bản ghi tự xoá sau 30 ngày.
- **Device id**: mỗi máy có một UUID ngẫu nhiên lưu ở localStorage, nên khách chưa đăng nhập cũng có lịch sử riêng.
- **Chặn spam**: backend trả 429 khi `indexChat` của user > `indexChat` bot gần nhất + 2 (tối đa 2 tin chưa được trả lời). Client gỡ tin, trả lại nội dung vào ô nhập và hiện toast. Mọi lượt kết thúc (thành công, lỗi, Dừng) đều lưu tin bot.
- **Xoá hội thoại**: xoá luôn lịch sử của máy trên database.
- **Constants / keys mới**:
  - `LOCAL_STORAGE_KEY.chatDeviceId`, `CHAT_MESSAGE_TYPE`, `chat.spamBlocked`
  - Backend: `ChatMessageType`, `CHAT_MAX_PENDING_USER_MESSAGES`, `CHAT_MESSAGE_TTL_SECONDS`, `DB_COLLECTION.ChatMessage`; endpoint `POST /chat-messages`, `DELETE /chat-messages/:deviceId`
- **Lý do**:
  - Khách gửi liên tục không chờ trả lời gây spam và tốn token LLM. Trước đây chỉ khoá ở UI (dễ vượt qua).

## 2026-11-04
- **Chuẩn hóa tool call trong `agents/llm.ts`**: đọc được tool call sai định dạng của model, gồm tham số nằm trong tên tool (`route_to_agent({"agent":"faq"})`, kể cả thiếu hoặc thừa `)`) và lệnh gọi viết thành văn bản. Áp dụng cho cả `callLlm` (router) và `streamLlm` (`runAgent`) qua `normalizeResponse`. Chỉ nhận tool có trong danh sách của request; câu trả lời thường và tool lạ giữ nguyên.
- **Router luôn gọi tool**: `fallback` được thêm vào `enum` của `route_to_agent` và vào danh sách `# Agents`; câu ngoài phạm vi chọn `fallback` thay vì không gọi tool. Prompt nêu rõ giá, đơn, đặt chỗ, địa chỉ, liên hệ của doanh nghiệp khác và kiến thức chung/toán là `fallback`. Không có tool call hợp lệ thì vẫn vào agent `fallback`.
- **Log token & câu hỏi lên Google Sheets**: proxy `/api/chat-agent` ghi nền mỗi lần gọi LLM thành một dòng gồm token input/output/cache, câu hỏi, câu trả lời, tool call, trạng thái, thời gian. Sheet có 10 cột, dòng mới được append xuống cuối; dòng router (`toolCalls` chứa `route_to_agent`) được tô màu bằng Conditional formatting trên Sheet. SĐT được che, chỉ giữ 3 số cuối. Thiếu env Google thì tắt log; ghi lỗi không ảnh hưởng chat. Thêm package `google-auth-library`.
- **Constants / keys mới**:
  - `CHAT_LOG_STATUS`, `CHAT_LOG_COLUMNS`, `CHAT_LOG_SHEET_RANGE`, `CHAT_LOG_MAX_TEXT_LENGTH`, `CHAT_LOG_TIMEOUT_MS`, `CHAT_LOG_PHONE_REGEX`, `GOOGLE_SHEETS_API_URL`, `GOOGLE_SHEETS_SCOPE`.
  - Env: `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`.
- **Lý do**:
  - Cần thống kê token theo từng request và xem khách hỏi gì. Dùng Sheet thay vì MongoDB vì database đang giới hạn dung lượng, đầy có thể ảnh hưởng đơn hàng.
  - Router so khớp tên tool tuyệt đối nên output sai định dạng rơi vào `fallback`, khách bị từ chối dù model đã chọn đúng agent.
  - Sau khi sửa định dạng, câu ngoài phạm vi lọt vào các agent nhiều hơn vì trước đó chúng chỉ bị chặn nhờ lỗi định dạng.
  - Kết quả test với `ministral-3b-2410`, mỗi câu 3 lần, câu test tự soạn. Bộ 119 câu (dùng để sửa prompt): độ chính xác cuối 95,0%, từ chối nhầm 0%, để lọt 6,5%. Bộ 34 câu mới: độ chính xác từ 72,5% lên 88,2%, từ chối nhầm 0%, để lọt từ 52,1% xuống 18,8%.

## 2026-11-03
- **Streaming câu trả lời**: agent gọi LLM với `stream: true` (SSE), chữ hiện dần thay vì chờ xong hết. Router vẫn non-stream. Provider không trả SSE thì tự đọc JSON như cũ.
- **Làm mượt chữ**: chữ được nhả đều theo tick, chunk lớn cũng không nhảy cục. Tab ẩn thì hiện hết ngay.
- **Trạng thái theo tool**: khi chưa có chữ, indicator hiện việc đang làm (vd "Đang xem bảng giá...").
- **Nút Dừng**: khi đang trả lời, nút Gửi thành nút Dừng; giữ phần chữ đã hiện, không báo lỗi.
- **Cuộn thông minh**: tự cuộn theo chữ; user kéo lên đọc thì không bị kéo xuống, gửi tin mới thì cuộn lại.
- **Xoá hội thoại khi đang trả lời**: huỷ lượt đang chạy, câu trả lời không hiện lại sau khi xoá.
- **Constants / keys mới**:
  - `TOOL_STATUS_KEY`, `CHAT_COMPLETIONS_PATH`, `SSE_CONTENT_TYPE`, `SSE_DATA_PREFIX`, `SSE_DONE_EVENT`, `CHAT_STREAM_TICK_MS`, `CHAT_STREAM_CATCH_UP_DIVISOR`, `CHAT_SCROLL_PIN_THRESHOLD`
  - `chat.stop`, `chat.status.{price,order,branch,address,loyalty,search,form,promotion}`
- **Lý do**:
  - Trước đây user phải chờ toàn bộ câu trả lời mới thấy chữ; muốn trải nghiệm giống ChatGPT/Gemini.
  - Text đang stream để ở store riêng không persist vì `persist` của Zustand ghi localStorage sau mọi lần `set`.

## 2026-10-30
- **Router prompt**: `buildRouterSystem` viết lại theo cấu trúc Identity → Instructions → Agents (`<agent name>`) → Examples (few-shot `ROUTER_EXAMPLES`). Router xác định rõ mình là bộ điều phối, không trả lời khách; thêm luật câu nối tiếp, tin nhiều ý, và coi tin nhắn khách là dữ liệu (yêu cầu đổi vai trò / lộ prompt → `FALLBACK`).
- **Lý do**:
  - Router đôi khi lệch vai trò (tự trả lời, bị prompt injection), route sai câu nối tiếp. Áp dụng guide prompt engineering / prompt generation của OpenAI.

## 2026-10-28
- **Huỷ đơn qua chat** (§6): tool `cancel_my_order` cho khách đã login — tìm đơn theo mã (kiểm tra đúng chủ đơn + còn `PENDING`) hoặc tự chọn khi chỉ có 1 đơn chờ xác nhận, nhiều đơn thì liệt kê để khách chọn. Tool không huỷ: chat mở modal `CancelOrderConfirm`, khách bấm xác nhận mới gọi API; huỷ xong toast + làm mới danh sách đơn + ghi tin vào chat.
- **Điểm tích lũy & hạng** (§7): tool `get_my_loyalty` lấy điểm mới nhất từ `/users/me`, trả hạng, điểm, giá trị quy đổi, số điểm còn thiếu để lên hạng, cách tích/đổi điểm.
- **Agent `recommend`**: gắn 2 tool mới, bổ sung mô tả (router chuyển câu hỏi huỷ đơn / điểm / hạng sang agent này) và prompt (không được nói đã huỷ khi khách chưa xác nhận).
- **Constants / keys mới**:
  - `TOOL_NAME.cancelMyOrder`, `TOOL_NAME.getMyLoyalty`
  - `agent.order.cancel.{requireLogin,notFound,notCancellable,noPending,pickOne,pickItem,cancelled}`, `agent.loyalty.{requireLogin,summary,redeemRule}`
- **Lý do**:
  - Khách muốn huỷ đơn / hỏi điểm ngay trong chat thay vì vào trang Profile. Bắt buộc xác nhận bằng modal để AI hiểu nhầm cũng không huỷ nhầm đơn.

## 2026-10-16
- **Nút "Chi nhánh"** (trước là "Địa chỉ"): đổi nhãn `chat.quickOptions.address` thành "Chi nhánh" / "Branches" để user không hiểu nhầm là địa chỉ của mình; khi bấm gửi câu rõ nghĩa (`chat.quickOptions.addressMessage`) thay vì chỉ chữ trên nút.
- **Agent recommend**: hỏi địa chỉ/chi nhánh → luôn gọi `get_branches`; `get_my_addresses` chỉ khi user hỏi địa chỉ đã lưu của mình; không bịa địa chỉ.
- **`get_branches`**: trả thông báo khi không có chi nhánh, in đậm tên chi nhánh, thêm link Google Map nếu có.
- **`get_contact_info`**: địa chỉ lấy từ chi nhánh API thay cho `INFO_CONTACT.Address` (địa chỉ giả "Tân Bình").
- **`get_my_addresses`**: chưa login → báo cần đăng nhập (không gọi API 401); sửa template `agent.address.item` đang chứa biến `{label}`, `{name}` không tồn tại.
- **Constants / keys mới**:
  - `chat.quickOptions.addressMessage`, `agent.order.branch.empty`, `agent.order.branch.map`, `agent.address.requireLogin`; sửa `agent.address.item`; đổi giá trị `chat.quickOptions.address` ("Địa chỉ" → "Chi nhánh", "Address" → "Branches").
- **Lý do**:
  - Bấm "Địa chỉ" trong chat không ra địa chỉ: câu hỏi mơ hồ khiến agent gọi nhầm tool (địa chỉ đã lưu → lỗi khi chưa login, hoặc contact info → địa chỉ giả), cộng với cache chi nhánh rỗng (xem changelog booking cùng ngày).

## 2026-10-15
- **Giờ mở cửa chi nhánh**: tool danh sách chi nhánh đọc `openingHours` (đúng field server trả) thay cho `workingHours` → trợ lý không còn luôn trả lời "chưa có giờ mở cửa".
- **Dữ liệu FAQ**: `FaqService.getFaqs()` gọi `?limit=FULL_LIST_LIMIT` để lấy đủ FAQ (trước chỉ được 20 FAQ đầu do limit mặc định của server). Cache localStorage đổi key sang `faqs_cache_v2` để bỏ cache cũ chỉ có 20 FAQ; thời hạn cache chuyển thành constant `FAQ_CACHE_DURATION`.
- **Constants / keys mới**:
  - `LOCAL_STORAGE_KEY.faqs`, `FAQ_CACHE_DURATION`, `FULL_LIST_LIMIT`
- **Lý do**:
  - FE và BE lệch tên field / số lượng dữ liệu → trợ lý AI trả lời thiếu.

## 2026-10-02
- **Định dạng danh sách đơn**: `formatOrderList` tạo mỗi đơn thành 1 khối markdown riêng (**Đơn #CODE** / Tình trạng: **STATUS** / Dịch vụ / Tổng tiền · Ngày), nối bằng dòng trống `\n\n` → mỗi đơn là 1 đoạn `<p>` (`ChatMarkdown` đã có `whitespace-pre-wrap`). Trước đây dùng list `-` nên `\n` bị markdown nuốt, các đơn gộp thành 1 dòng khó đọc.
- **Lý do**:
  - Danh sách "đơn gần nhất" trong chat bị gộp 1 dòng, tình trạng không nổi bật.

## 2026-10-01
- **Đặt lịch không cần login**: `createLaundryBooking` luôn gọi `POST /laundry-orders/guest` (name, phone E.164, address/district/city, items, notes, notificationToken). Thành công hiện mã đơn `#XXXXXX` (`getOrderCode`). Không lưu đơn/SĐT ở localStorage.
- **Tra cứu đơn**: tool `get_my_orders` (login → `/me?limit=4`; chưa login → marker `[ORDER_PHONE_FORM]` → `OrderPhoneForm` → `POST /guest/lookup`); tool `track_order` → `GET /lookup/:code`.
- **Form Tỉnh/Xã qua LocationApi**: `LaundryForm` chọn tỉnh/xã bằng `MySelect` có search (`useGetProvinces` + `useGetWards`), user chỉ gõ số nhà/đường; hỗ trợ "địa chỉ đã lưu" + `addressId`. Tỉnh/xã lưu theo `name`.
- **Constants / keys mới**:
  - `TOOL_NAME.getMyOrders`, `MAX_CHAT_ORDERS` (4), `QUERY_KEYS.getWards`
  - `chat.orderSuccessWithCode`, `chat.orderLookup.*`, `chat.laundryForm.{savedAddress,city,ward,addressDetail,addressDetailPlaceholder}`, `agent.order.myOrders.*`
- **Lý do**:
  - Cho phép đặt lịch + tra cứu đơn ngay trong chat; tránh user gõ địa chỉ sai (district/city rỗng). Cần deploy server trước (endpoint guest/lookup, field address/district/city). Chi tiết server xem repo `server-giat-say-sieu-sach-nestjs`.
