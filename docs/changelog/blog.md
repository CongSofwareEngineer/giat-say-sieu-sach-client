# Blog — Changelog
> Instruction: docs/instruction/blog.md

## 2026-10-02
- **Admin blog edit loop**: `getPostById` bọc `useCallback` (reference ổn định); trang edit bỏ `translate` khỏi deps `useEffect`, chỉ fetch lại khi `id` đổi. Trước đây `useEffect` chạy lại mỗi render → loading liên tục, editor remount, mất nội dung đang sửa.
- **500 blog trên Vercel (jsdom ESM)**: giữ `serverExternalPackages: ['@blocknote/server-util']` trong `next.config.ts`; ép `jsdom@^26.1.0` qua `resolutions` trong `package.json` (jsdom 26 dùng `html-encoding-sniffer@4` CommonJS, không còn `@exodus/bytes` chỉ-ESM mà jsdom 29 `require()` gây `ERR_REQUIRE_ESM`).
- **Lý do**:
  - Không sửa được bài viết ở admin (vòng lặp fetch); mọi URL `/blog/<slug>` trả 500 trên Vercel. Đã test local bằng `NODE_OPTIONS=--no-experimental-require-module`: build OK, trang trả 200.

## 2026-10-01
- **Chi tiết blog crash**: thêm `if (!content) return null` ở đầu `BlogContent` (trước đây `dangerouslySetInnerHTML` nhận undefined → crash).
- **Thời gian đọc**: sửa công thức `length / 200 / 60` → `length / 200` (200 ký tự = 1 phút).
- **Constants / keys mới**:
  - `blog.emptyContent` (để sẵn, không hiển thị)
- **Lý do**:
  - Trang chi tiết bài viết bị crash khi `content` undefined/null; công thức read-time sai.
