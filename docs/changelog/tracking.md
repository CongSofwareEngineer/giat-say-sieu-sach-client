# Tracking (theo dõi đơn `/track-order`) — Changelog
> Instruction: docs/instruction/tracking.md

## 2026-10-16
- **Mã đơn hàng**: bỏ cách lấy 6 ký tự cuối ID. Mã giờ là `code` ngẫu nhiên 8 ký tự do server sinh; `getOrderCode(order)` đọc `order.code` (thêm `code?` vào `OrderItem`, `PublicOrderItem`). Mọi chỗ hiển thị / copy / link `?code=` dùng mã mới.
- **Tra cứu theo mã**: chỉ nhận mã, không còn nhận full ID; mô tả tool `track_order` cập nhật theo.
- **Text**: gợi ý ô tra cứu và câu nhắc trong chat đổi "6 ký tự, #XXXXXX" → "8 ký tự, #XXXXXXXX".
- **Lý do**:
  - Lỗ hổng bảo mật: 6 ký tự cuối ObjectId là bộ đếm tăng dần → dò tuần tự được mã của đơn khác. Đi cùng thay đổi server (`docs/changelog/2026-10-16_order.md` bên repo server).

## 2026-10-01
- **Tra cứu thật**: bỏ API giả (`setTimeout`, mock cứng); tra theo mã → `GET /lookup/:code`, theo SĐT → `POST /guest/lookup` (giống tool chat). Thêm `normalizeOrderCode` dùng chung với `track_order`.
- **Kết quả**: card từng đơn (mã, badge, tiến độ, dịch vụ, tổng tiền, ngày); `CANCELLED` hiện thông báo huỷ; hỗ trợ `?code=` tự tra; chống race bằng `requestIdRef`.
- **Constants / keys mới**:
  - Dùng lại `MAX_CHAT_ORDERS`, `ORDER_STATUS`
  - `tracking.form.{requireOne,invalidPhone,hint}`, `tracking.result.{listTitle,createdAt,quantity,price,cancelled,notFoundPhone}`
- **Lý do**:
  - Trang cũ luôn trả cùng một dữ liệu mock cho mọi mã/SĐT.
