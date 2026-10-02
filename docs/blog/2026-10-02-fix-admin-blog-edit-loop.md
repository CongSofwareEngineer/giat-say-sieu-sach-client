# Sửa lỗi không edit được bài viết ở Admin Blog

- Ngày: 2026-10-02
- Phạm vi: admin / blog

## Mục đích
Trang `/admin/blog/[id]` gọi API lấy bài viết liên tục, không dừng. Sau mỗi lần render, `useEffect` chạy lại → `setIsLoading(true)` → trang hiện loading, editor bị unmount/mount lại → nội dung đang sửa bị mất, không thao tác được.

Nguyên nhân: deps của `useEffect` có `getPostById` (hook `useAdminBlog` tạo hàm mới mỗi render) và `translate` (`useLanguage` cũng tạo hàm mới mỗi render).

## Luồng xử lý
1. `useAdminBlog` bọc `getPostById` bằng `useCallback` → reference ổn định.
2. Trang edit chỉ fetch lại khi `id` (hoặc `getPostById`) đổi; bỏ `translate` khỏi deps (có comment `eslint-disable` giải thích).

## File liên quan
- `hooks/admin/useAdminBlog.ts` — `getPostById` dùng `useCallback`
- `app/admin/blog/[id]/page.tsx` — sửa deps của `useEffect` fetch bài viết

## Constants / Translation keys mới
- Không có

## Lưu ý
- `translate` của `useLanguage` không ổn định giữa các lần render; đừng đưa vào deps của `useEffect`/`useCallback`.
- Trang edit vẫn còn text hardcode (`'Saved!'`, `'All changes saved!'`, danh sách category, `'Click to edit'`...) và toast bị hiện 2 lần (hook + trang) — cần xử lý riêng.
