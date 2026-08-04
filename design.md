# Giặt Ủi Siêu Sạch - Project Specification

Bạn là một Senior Fullstack Developer với hơn 15 năm kinh nghiệm.

Nhiệm vụ của bạn là xây dựng hoàn chỉnh một website chuyên nghiệp cho cửa hàng **Giặt Ủi Siêu Sạch**.

Đây là dự án thực tế nên mọi source code phải có chất lượng production-ready, tối ưu SEO, tốc độ tải nhanh, dễ bảo trì và dễ mở rộng.

---

# Mục tiêu

Website giúp khách hàng:

- Đặt lịch lấy đồ giặt tận nơi
- Theo dõi tiến độ đơn giặt
- Xem lịch sử đơn hàng
- Đăng nhập bằng số điện thoại
- Xem blog
- Giới thiệu cửa hàng
- Liên hệ cửa hàng

Admin có thể:

- Quản lý đơn hàng
- Quản lý khách hàng
- Quản lý blog
- Quản lý banner
- Quản lý bảng giá
- Xem doanh thu
- Thống kê

---

# Công nghệ

Bắt buộc sử dụng

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- DaisyUI
- Zustand
- Prisma
- PostgreSQL
- Day.js
- Lucide React

---

# Không được sử dụng

Không sử dụng bất kỳ thư viện nào sau đây

- React Hook Form
- Framer Motion
- Zod
- Redux
- Context API để quản lý Global State
- next-intl
- react-i18next
- i18next

---

# Coding Style

- TypeScript Strict Mode
- Clean Code
- SOLID
- DRY
- KISS
- Reusable Component
- Feature-based Folder Structure
- Không hard-code dữ liệu
- Không duplicate code
- Tách component nhỏ
- Đặt tên rõ ràng
- Có comment khi cần
- Dễ mở rộng

Ưu tiên Server Component.

Chỉ dùng Client Component khi thực sự cần.

---

# Folder Structure

Đề xuất cấu trúc

src/

- app/
- components/
- configs/
- zustand/
- hooks/
- services/
- lib/
- locales/
- types/
- constants/
- utils/

---

# Thiết kế

Website theo phong cách

- Hiện đại
- Sang trọng
- Sạch sẽ
- Dễ nhìn
- Màu sáng

Tham khảo bố cục của ảnh được cung cấp nhưng KHÔNG copy.

Hãy thiết kế theo phong cách riêng.

Màu chủ đạo

Primary

- #12B3D6

Secondary

- #00C2A8

Accent

- #FFC857

Background

- #F8FBFD

Card

- White

Border

- #E7EEF5

Text

- #1F2937

Footer

- #0F172A

Bo góc

16px ~ 24px

Shadow nhẹ.

Hover đẹp.

Transition nhẹ bằng CSS.

Không cần animation phức tạp.

---

# Responsive

Website phải Responsive hoàn toàn.

Desktop

Tablet

Mobile

Mobile First.

---

# Header

Header sticky.

Có

Logo

Trang chủ

Bảng giá

Blog

Giới thiệu

Theo dõi đơn

Đặt lịch

Liên hệ

Đăng nhập

Đăng ký

Dropdown chọn ngôn ngữ

- 🇻🇳 Tiếng Việt
- 🇺🇸 English

---

# Home

Landing Page.

Hero Section

Nhấn mạnh

- Giặt Ủi Siêu Sạch
- Giá rẻ
- Giao nhận tận nơi
- Siêu nhanh
- Đúng hẹn
- Chất lượng cao

Có CTA

Đặt lịch ngay

Các section

- Hero
- Quy trình 4 bước
- Lợi ích
- Bảng giá
- Cam kết
- Feedback
- FAQ
- CTA cuối trang
- Footer

---

# Booking

Trang đặt lịch.

Form gồm

- Họ tên
- Số điện thoại
- Email (optional)
- Địa chỉ nhận đồ
- Địa chỉ trả đồ
- Ngày nhận
- Giờ nhận
- Dịch vụ
- Khối lượng ước tính
- Ghi chú

Sau khi đặt

Sinh mã đơn.

---

# Tracking

Khách nhập

- Số điện thoại
- Mã đơn

Hiển thị

Timeline

Ví dụ

Created

↓

Confirmed

↓

Picked Up

↓

Washing

↓

Drying

↓

Ironing

↓

Folding

↓

Packaging

↓

Delivering

↓

Completed

Hiển thị

- % tiến độ
- ETA
- Thời gian giao dự kiến

Ví dụ

"Dự kiến giao lúc 18:30"

---

# Lịch sử đơn hàng

Sau khi đăng nhập

Khách xem được

- Danh sách đơn
- Trạng thái
- Giá
- Ngày tạo
- Chi tiết

Có

Search

Filter

Pagination

---

# Đăng ký

Thông tin

- Tên
- Số điện thoại
- Mật khẩu

---

# Đăng nhập

Đăng nhập bằng

- Số điện thoại
- Mật khẩu

Có Remember Me.

---

# Blog

Danh sách bài viết.

Chi tiết bài viết.

Slug.

SEO.

---

# Giới thiệu

Giới thiệu cửa hàng.

Hình ảnh.

Cam kết.

Tầm nhìn.

Sứ mệnh.

---

# Liên hệ

Có

Google Map

Điện thoại

Email

Facebook

Zalo

Form liên hệ

---

# Admin

Dashboard đẹp.

Sidebar.

Topbar.

---

# Dashboard

Hiển thị

- Tổng doanh thu
- Đơn hôm nay
- Đơn đang xử lý
- Đơn hoàn thành
- Tổng khách hàng

Có biểu đồ

- Doanh thu
- Đơn hàng

---

# Quản lý đơn

CRUD.

Danh sách

- Mã đơn
- Khách
- SĐT
- Địa chỉ nhận
- Địa chỉ trả
- Giá
- Trạng thái
- Ngày tạo

Admin có thể đổi trạng thái.

Khách sẽ thấy cập nhật ngay.

---

# Quản lý khách hàng

CRUD

---

# Quản lý Blog

CRUD

---

# Quản lý Banner

CRUD

---

# Quản lý Bảng Giá

CRUD

---

# Database

Customer

- id
- name
- phone
- email
- password
- createdAt

Order

- id
- code
- customerId
- pickupAddress
- deliveryAddress
- pickupDate
- pickupTime
- service
- weight
- note
- estimateDeliveryTime
- totalPrice
- status
- createdAt

Blog

- id
- title
- slug
- thumbnail
- content
- createdAt

Banner

- id
- title
- subtitle
- image

Service

- id
- name
- price

---

# Floating Chat

Toàn bộ website luôn có nút chat.

Vị trí

Góc phải dưới.

Button hình tròn.

Có shadow.

Hover đẹp.

Luôn nổi lên trên tất cả nội dung.

Khi click

Mở cửa sổ chat.

Thiết kế giống Messenger hoặc Live Chat.

Đây là component dùng chung cho toàn bộ website.

---

# Footer

Có

- Logo
- Giới thiệu
- Menu
- Liên hệ
- Social
- Copyright

---

# SEO

Tối ưu SEO tuyệt đối.

Bắt buộc

- Dynamic Metadata
- OpenGraph
- Twitter Card
- robots.txt
- sitemap.xml
- Canonical URL
- JSON-LD
- Breadcrumb
- next/image
- next/font
- Lazy Loading
- Semantic HTML
- Core Web Vitals

Blog phải hỗ trợ SEO đầy đủ.

---

# Đa ngôn ngữ

Không sử dụng bất kỳ thư viện i18n nào.

Tự xây dựng hoàn toàn bằng Zustand.

Header có dropdown

- 🇻🇳 Tiếng Việt
- 🇺🇸 English

Yêu cầu

- Đổi ngôn ngữ không reload trang.
- Lưu ngôn ngữ vào localStorage.
- Mặc định là Tiếng Việt.
- Tạo LanguageStore bằng Zustand.
- Toàn bộ text lấy từ dictionary.

Cấu trúc

src/

- locales/
    - vi.ts
    - en.ts

- stores/
    - language.store.ts

- hooks/
    - useTranslate.ts

Ví dụ

```ts
const t = useTranslate();

t("home.title");

t("menu.booking");
```

Không hard-code text trong JSX.

Toàn bộ text đều lấy từ dictionary.

Hệ thống phải dễ mở rộng để sau này chỉ cần thêm file ngôn ngữ mới.

---

# UI Component

Hãy xây dựng bộ UI Component tái sử dụng

- Button
- Input
- Select
- Textarea
- Modal
- Drawer
- Dropdown
- Pagination
- Empty
- Loading
- Table
- Card
- Badge
- Toast
- Confirm Dialog

Không phụ thuộc thư viện ngoài ngoài DaisyUI.

---

# State Management

Toàn bộ Global State sử dụng Zustand.

Ví dụ

- Authentication
- Language
- Theme (nếu có)
- User
- Loading
- Notification

---

# Validation

Không dùng React Hook Form.

Không dùng Zod.

Validation tự viết bằng TypeScript.

---

# Date

Toàn bộ xử lý ngày giờ sử dụng Day.js.

---

# Code Quality

Mỗi component chỉ nên làm một nhiệm vụ.

Không tạo file quá lớn.

Ưu tiên reusable.

Không hard-code.

Không duplicate.

Đặt tên rõ ràng.

Dễ đọc.

Production Ready.

---

# Sau khi bắt đầu

Không code tất cả trong một lần.

Hãy thực hiện theo từng bước.

## Phase 1

- Khởi tạo project
- Cấu trúc thư mục
- Cài đặt thư viện
- Cấu hình Tailwind
- DaisyUI
- Prisma
- Zustand
- Day.js
- Theme
- Layout
- Header
- Footer
- Language Store
- Dictionary
- UI Component cơ bản

## Phase 2

Xây dựng toàn bộ Website.

## Phase 3

Xây dựng Admin.

## Phase 4

SEO.

## Phase 5

Tối ưu Performance.

## Phase 6

Review toàn bộ source code.

Trong suốt quá trình phát triển, hãy luôn ưu tiên:
- Clean Code.
- Khả năng mở rộng.
- Hiệu năng.
- SEO.
- Trải nghiệm người dùng.
- Giao diện hiện đại, sáng sủa và chuyên nghiệp phù hợp với dịch vụ giặt ủi.
