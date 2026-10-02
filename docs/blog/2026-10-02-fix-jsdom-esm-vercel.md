# Sửa lỗi 500 trang chi tiết blog trên Vercel (jsdom ESM)

- Ngày: 2026-10-02
- Phạm vi: blog / `app/blog/[slug]`

## Mục đích
Trên Vercel, mọi URL `/blog/<slug>` đều trả về 500 (kể cả slug không tồn tại), trong khi build local chạy bình thường. Log Vercel:

```
Failed to load external module @blocknote/server-util: Error [ERR_REQUIRE_ESM]:
require() of ES Module /var/task/node_modules/@exodus/bytes/encoding-lite.js
from /var/task/node_modules/html-encoding-sniffer/lib/html-encoding-sniffer.js not supported.
```

Nguyên nhân: `BlogContent` dùng `@blocknote/server-util` → `jsdom@29`. jsdom 29 và `html-encoding-sniffer@6` (CommonJS) dùng `require()` để nạp `@exodus/bytes`, một gói chỉ có ES Module. Runtime function của Vercel không cho `require()` một ES Module, nên route sập ngay lúc nạp module. Trước commit `c9a79d1`, các bài được prerender lúc build nên lỗi chưa lộ ra.

Ngoài ra, commit `36af127 fix build` đã bỏ `serverExternalPackages` và đưa BlockNote vào `transpilePackages`, khiến build lỗi `createContext is not a function`, vì BlockNote bị bundle vào server component.

## Luồng xử lý
1. Trả `next.config.ts` về như trước: giữ `serverExternalPackages: ['@blocknote/server-util']`, `transpilePackages` như cũ.
2. Ép `jsdom` về `^26.1.0` qua `resolutions` trong `package.json`, vì project dùng yarn. jsdom 26 dùng `whatwg-encoding` và `html-encoding-sniffer@4` (CommonJS), không còn `@exodus/bytes`.
3. `@blocknote/server-util` chỉ dùng `new JSDOM()` và `window.document`, nên jsdom 26 tương thích.

## File liên quan
- `package.json` — thêm `resolutions.jsdom`
- `yarn.lock` — cập nhật theo jsdom 26
- `next.config.ts` — khôi phục cấu hình `serverExternalPackages`
- `components/Blog/BlogContent.tsx` — nơi dùng `@blocknote/server-util` (không đổi)

## Constants / Translation keys mới
- Không có

## Lưu ý
- Đã kiểm tra local bằng `NODE_OPTIONS=--no-experimental-require-module` (giả lập việc không cho `require()` ESM): build OK, `/blog/<slug>` trả 200 và render đúng nội dung BlockNote.
- Project dùng yarn (`yarn.lock`). Không dùng `npm install`, vì sẽ sinh lại `package-lock.json` và bỏ qua `resolutions`.
- Khi nâng `@blocknote/server-util` lên bản mới, cần kiểm tra lại xem còn tương thích với jsdom 26 không.
- Slug không tồn tại hiện trả HTTP 200 kèm `noindex` (do `loading.tsx` stream trước khi gọi `notFound()`), chưa phải 404. Đây là vấn đề riêng, chưa xử lý.
