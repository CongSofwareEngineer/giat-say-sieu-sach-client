# Định dạng lại danh sách đơn trong AI chat

- Ngày: 2026-10-02
- Phạm vi: chat / tool `get_my_orders`

## Mục đích
Danh sách "đơn gần nhất" trong chat bị gộp thành 1 dòng (`#468C4B · Đang giặt Giặt khô (3 kg) · 240.000đ · 2/10/2026`): xuống dòng `\n` trong list item bị markdown nuốt mất, tình trạng không nổi bật nên khách khó đọc.

## Luồng xử lý
1. `formatOrderList` tạo mỗi đơn thành 1 khối markdown riêng (không dùng list `-` nữa):
   - Dòng 1: **Đơn #CODE** (in đậm)
   - Dòng 2: Tình trạng: **STATUS** (in đậm)
   - Dòng 3: Dịch vụ
   - Dòng 4: Tổng tiền · Ngày đặt
2. Các khối nối bằng dòng trống (`\n\n`) → mỗi đơn là 1 đoạn `<p>`. `ChatMarkdown` đã có `whitespace-pre-wrap` cho `<p>` nên các dòng bên trong hiển thị đúng.
3. Agent `recommend` vẫn giữ nguyên kết quả tool ("as-is"), nên cả luồng LLM lẫn luồng nhập SĐT trực tiếp đều hiện cùng định dạng.

## File liên quan
- `agents/tools/myOrders.ts` — `formatOrderList`
- `public/assets/language/vn.json`, `public/assets/language/en.json` — sửa nội dung key `agent.order.myOrders.item`

## Constants / Translation keys mới
- Không có key mới, chỉ sửa nội dung `agent.order.myOrders.item`.

## Lưu ý
- Mã đơn và tình trạng phân biệt bằng font-weight (in đậm) + nhãn riêng từng dòng. Nếu cần màu theo từng tình trạng thì phải render bằng component riêng thay vì markdown.
