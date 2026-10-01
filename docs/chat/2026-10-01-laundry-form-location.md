# Form đặt giặt trong Chat: chọn Tỉnh/Xã qua LocationApi

- Ngày: 2026-10-01
- Phạm vi: Chat AI / LaundryForm

## Mục đích
Trước đây user tự gõ toàn bộ địa chỉ vào một ô text nên dễ nhập sai, nhập bậy, và địa chỉ mới tạo bị lưu với `district`/`city` rỗng.
Giờ Tỉnh/Thành phố và Phường/Xã phải chọn từ `LocationService` (dropdown có ô tìm kiếm), user chỉ tự gõ địa chỉ cụ thể (số nhà, tên đường).

## Luồng xử lý
1. Form load danh sách tỉnh qua hook có sẵn `useGetProvinces` (có cache localStorage 24h).
2. Chọn tỉnh → lưu tên tỉnh vào `city`, reset `district`, hook `useGetWards` gọi `LocationService.getDistricts(provinceId)` để lấy danh sách phường/xã (API esgoo mới, 2 cấp tỉnh → xã).
3. Chọn phường/xã → lưu vào `district`. User nhập số nhà/đường vào `address`.
4. Chọn "địa chỉ đã lưu" → điền sẵn `address`, `district`, `city` và `addressId`.
5. Sửa bất kỳ phần nào của địa chỉ → xoá `addressId`, khi submit sẽ tìm địa chỉ trùng trong danh sách đã lưu, không có thì tạo mới với đủ `address`/`district`/`city`.
6. Nút "Đặt lịch" chỉ bật khi đủ họ tên, SĐT, tỉnh, xã, địa chỉ cụ thể và khối lượng > 0.

## File liên quan
- `components/Chat/LaundryForm.tsx` — UI chọn tỉnh/xã/địa chỉ đã lưu bằng `MySelect` (có search)
- `components/Chat/index.tsx` — state form, prefill địa chỉ mặc định, submit tạo địa chỉ + đơn
- `components/Chat/types.ts` — thêm `district`, `city` vào `LaundryFormData`
- `hooks/reactQuery/useGetWards.ts` — hook mới lấy phường/xã theo tỉnh
- `services/address/index.ts` — `formatAddress` nhận object chỉ cần `address`/`district`/`city`

## Constants / Translation keys mới
- `QUERY_KEYS.getWards`
- `chat.laundryForm.savedAddress`, `chat.laundryForm.city`, `chat.laundryForm.ward`, `chat.laundryForm.addressDetail`, `chat.laundryForm.addressDetailPlaceholder`

## Lưu ý
- Tỉnh/xã lưu theo `name` (giống `app/profile/components/AddressForm.tsx`) để địa chỉ tạo từ chat và từ trang profile khớp nhau.
- Địa chỉ đã lưu kiểu cũ (tên tỉnh không có trong API) vẫn dùng được qua `addressId`, nhưng dropdown tỉnh sẽ hiện placeholder.
- Key `chat.laundryForm.addressPlaceholder` không còn dùng trong form, chưa xoá.
