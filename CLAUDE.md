# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Project Rules (MANDATORY)

These rules apply to every task and override default behavior. They work together with the project skills: `language`, `component`, `create-page`, `icon-image`, `modal-drawer`, `comment`, `review`.

## 1. Never hardcode text in the UI

- Every user-facing string (labels, buttons, titles, placeholders, toasts, errors, empty states, `alt`, `aria-label`, metadata) MUST come from `translate()` of `useLanguage` (`@/hooks/useLanguage`).
- Add each key to BOTH `public/assets/language/vn.json` and `public/assets/language/en.json` (see skill `language`).
- Images come from `config/images.ts`, icons from `components/Icons/` (see skill `icon-image`).

```tsx
// ❌ Bad
<MyButton>Lưu</MyButton>
toast.error('Có lỗi xảy ra')

// ✅ Good
const { translate } = useLanguage()
<MyButton>{translate('common.save')}</MyButton>
toast.error(translate('common.error'))
```

## 2. Never hardcode names/values — always go through constants

- Do NOT write raw string/number literals for keys, names, or config values directly in components, hooks, or services. Define them in `constants/` (or `config/` for site/API/image config) and import them.
- This covers: React Query keys, cookie/localStorage keys, status/enum values, routes/paths, API endpoints, tool/agent names, limits/sizes/page sizes, colors, external URLs, regex patterns, timeouts.
- Reuse existing constants first:
  - `constants/reactQuery.ts` — `QUERY_KEYS`, `PAGE_SIZE`
  - `constants/cookies.ts` — `COOKIES_KEY`
  - `constants/app.ts` — `SITE_CONFIG`, `INFO_CONTACT`, `COLORS`, `ORDER_STATUS`, limits (`MAX_*`)
  - `constants/tools.ts` — `TOOL_NAME`, agent names
  - `config/` — `baseApi.ts`, `images.ts`, `seo.ts`, `firebase.ts`
- If no suitable constant exists, add it to the matching file in `constants/` (ask first — see rule 4).

```ts
// ❌ Bad
useQuery({ queryKey: ['getListBlogs', page] })
if (order.status === 'PENDING') { ... }
Cookies.get('accessToken')

// ✅ Good
useQuery({ queryKey: [QUERY_KEYS.getListBlogs, page] })
if (order.status === ORDER_STATUS.PENDING) { ... }
Cookies.get(COOKIES_KEY.accessToken)
```

## 3. Never commit or push on your own

- Do NOT run `git commit`, `git push`, `git merge`, `git rebase`, `git reset`, `git stash`, or any command that changes git history or the remote.
- Only do so when the user explicitly asks for that specific action in the current message. Leave all changes uncommitted for the user to review.

## 4. Always ask before adding or deleting

- Before creating a new file/folder/component/hook/constant/translation namespace, installing a package, or deleting/renaming any file, code block, key, or dependency: describe what will be added/removed and wait for the user's confirmation.
- Editing existing code within the scope of the requested task does not need extra confirmation, but removing existing logic does.
- When in doubt, ask.

## 5. Docs Workflow (MANDATORY — every task)

Docs gom theo **main feature**, KHÔNG theo từng logic nhỏ. Mỗi feature có 2 nơi, cùng tên `<feature>` (kebab-case):

- `docs/instruction/<feature>.md` — **một file / một main feature**, mô tả **hành vi HIỆN TẠI**; mỗi sub-logic là một section trong file đó.
- `docs/changelog/YYYY-MM-DD_<feature>.md` — **một file / một feature / một ngày**, ghi **lịch sử** thay đổi.

### Feature set của project

| `<feature>` | Covers |
|---|---|
| `auth` | login / register / server actions, refresh token, session expired, cookies |
| `booking` | booking form (guest + logged-in), branch filter, order pricing |
| `order` | my orders list, cancel (PENDING), loyalty / weight / discount |
| `tracking` | track order lookup |
| `profile` | profile info, change password, address book, loyalty tier / points |
| `blog` | public blog (server render, `blogClient`), admin CRUD (`blog`), BlockNote editor |
| `comment` | reviews / comments, phone validation |
| `chat` | AI multi-agent assistant, agents, tools, router |
| `admin` | admin dashboards, `AdminShell`, `MyTable` |
| `notifications` | Firebase Cloud Messaging push |
| `seo` | metadata, JSON-LD, sitemap, robots |
| `upload` | Cloudinary image upload, avatar crop |
| `ui` | shared `My*` primitives, daisyUI theme, layout |

- Trước khi tạo file mới, kiểm tra logic có thuộc một feature **đã có** không — nếu có thì thêm/sửa section trong file đó. Chỉ tạo file mới cho một main feature thật sự mới (hỏi trước — xem rule 4).
- Sub-logic dùng chung cho 2 feature thì đặt ở feature mà nó thuộc về chính, feature kia link tới section đó.
- Nếu còn các file cũ kiểu `docs/<feature>/<ngày>-<slug>.md` (một file / một logic nhỏ), gộp chúng vào đúng `instruction/` + `changelog/` của feature rồi xóa file lẻ.

### 5.1 Trước khi bắt đầu BẤT KỲ request nào
- **Đọc `docs/instruction/` trước.** List thư mục và đọc file feature liên quan tới phần sắp đụng tới.
- Instruction docs outrank your memory. Nếu chưa có doc cho logic đó → nói rõ, và bổ sung khi làm xong (§5.3).

### 5.2 Sau khi thêm/sửa BẤT KỲ logic nào → changelog (ONE file / feature / ngày)
- Thư mục `docs/changelog/`, tên file `YYYY-MM-DD_<feature>.md` (vd `2026-10-15_booking.md`). `<feature>` phải trùng tên file instruction.
- **Một feature + một ngày = đúng MỘT file.** Nếu file hôm nay của feature đó đã có → **sửa file đó**, không tạo file thứ hai, không thêm hậu tố `-2` / `-3`. Ngày khác → file mới. **Không sửa file của những ngày trước** (đó là lịch sử).
- **Tự gộp trùng**: nếu có nhiều file cùng ngày + feature (bị đánh số, hoặc file cũ theo từng logic nhỏ), gộp vào `YYYY-MM-DD_<feature>.md` và xóa phần dư.
- Ghi **kết quả cuối của ngày**, không phải log từng lần thử; nếu sửa sau đè lên sửa trước trong cùng ngày thì chỉ mô tả hành vi cuối. Gom bullet theo sub-logic.
- Template (tiếng Việt, ngắn gọn):

```md
# <Tên feature>

- Ngày: YYYY-MM-DD
- Feature: <feature> (→ docs/instruction/<feature>.md)
- Loại: Added | Changed | Fixed | Removed   (có thể nhiều, vd "Changed, Fixed")
- File: `path/to/file.ts`, …   (hợp các file đã đụng trong ngày)

## Thay đổi
- **<Sub-logic A>**: thay đổi gì (mô tả hành vi, không phải diff từng dòng)
- **<Sub-logic B>**: …

## Constants / Translation keys mới
- `QUERY_KEYS.xxx`, `common.xxx`

## Lý do
- vì sao / bug / ticket cho từng thay đổi
```

- Dùng ngày hiện tại thật. Làm tự động — không đợi được yêu cầu.

### 5.3 Sau khi thêm/sửa BẤT KỲ logic nào → cập nhật instruction doc
- Thư mục `docs/instruction/`, file `docs/instruction/<feature>.md` (cùng tên với changelog).
- **Một file = một main feature**, mỗi sub-logic một section, viết để một người chưa từng thấy code vẫn hiểu toàn bộ feature từ file đó. Sửa section đã có; thêm section nếu thiếu.
- Chỉ mô tả hành vi **hiện tại** (lịch sử nằm ở changelog). Cấu trúc:

```md
# <Tên feature>
> Cập nhật: YYYY-MM-DD

## Tổng quan        — làm gì, vì sao, danh sách sub-logic
## Dùng chung        — state/store (Zustand), QUERY_KEYS, constants, hooks, service dùng chung
## 1. <Sub-logic A>
### Mục đích          — phần này làm gì
### Entry points     — component / hook / service, ai gọi, props/params
### Luồng xử lý       — từng bước (input → gọi API → state/cache → UI)
### Translation / Constants — key `vn.json`/`en.json`, constant liên quan
### Edge cases        — lỗi, empty state, loading, auth, responsive
## 2. <Sub-logic B>
...
## Liên quan         — link tới docs/instruction/*.md khác
```

- Link bằng anchor section ("xem §2 Branch filter") thay vì nhiều file nhỏ.

### Ghi chú
- "Logic" = hành vi component, hook, API call / service, business rule, agent/tool, constants/translation, config. Thay đổi chỉ-comment hoặc chỉ-format thì không cần docs.
- Không bao giờ ghi token, key, secret, URL backend nội bộ vào docs.
- Docs viết tiếng Việt, ngắn và rõ.

## Done checklist

Before reporting a task as done, verify:

- [ ] No hardcoded UI text — all via `translate()`, keys in both `vn.json` and `en.json`
- [ ] No raw keys/names/values — all via `constants/` or `config/`
- [ ] Nothing committed or pushed
- [ ] Every add/delete was confirmed by the user
- [ ] Docs updated per feature (rule 5): `docs/changelog/YYYY-MM-DD_<feature>.md` + `docs/instruction/<feature>.md`
- [ ] `npm run lint` and `npm run build` pass (skill `review`)

---

# Project Context

## Overview

Next.js client for **"Giặt Ủi Siêu Sạch"** — a laundry service website (deployed on Vercel: `giatuisieusach.vercel.app`).

- **Public site**: home, pricing, booking (guest or logged-in), track order, blog, reviews/comments, about, contact.
- **Customer area** (`/profile`): profile info, password, address book, my orders (cancel while `PENDING`), loyalty tier/points.
- **Admin** (`/admin`): orders, customers, pricing, blog (BlockNote editor), comments, contact messages. Client-only, `force-dynamic`, `noindex`.
- **Floating AI chat**: a multi-agent assistant (prices, FAQ, recommendations, order lookup, booking form) whose tool loop runs **in the browser**.
- **Push notifications** via Firebase Cloud Messaging.
- Backend is a separate **NestJS** API at `NEXT_PUBLIC_API_APP`. This repo has no database.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** — see the warning at the top; read `node_modules/next/dist/docs/` first. Route `params` are `Promise`s (`await params`).
- **TanStack Query v5** for server state, **Zustand v5** (`persist` + `devtools`) for client state.
- **TailwindCSS v4** (CSS-first: `@theme` in `app/globals.css`, no `tailwind.config`) + **daisyUI 5** (custom theme `giat-say-sieu-sach`). Merge classes with `cn()` from `utils/tailwind.ts`.
- **BlockNote** (+ Mantine, only for the editor) for blog content; `@blocknote/server-util` renders it in Server Components.
- **Firebase** (messaging), **dayjs**, **libphonenumber-js**, **react-markdown** + `remark-gfm` (chat), **react-easy-crop** (avatar).
- Images uploaded to **Cloudinary** (`res.cloudinary.com` allowed in `next.config.ts`).
- Lint/format: ESLint 9 + Prettier. Package lock: `yarn.lock`.

## Project Structure

```
app/                       # App Router routes (page.tsx + layout.tsx per route)
  <route>/components/      # components used only by that route
  admin/                   # admin dashboard (AdminShell.tsx = client shell)
  api/auth-proxy/[...path] # proxies backend calls with the httpOnly token cookies (+ refresh on 401)
  api/chat-agent/[...path] # proxies LLM chat/completions; hides AGENT_API_KEY; origin allowlist, 1MB cap
  api/systemone/           # proxies SYSTEM_ONE_API_URL; origin allowlist
  firebase-messaging-sw.js/route.ts  # serves the FCM service worker built from config/firebase
  login/actions.ts, register/actions.ts  # server actions (set token cookies)
agents/                    # client-side AI chat
  index.ts                 # chatAgent.chat(): router LLM call -> picks agent -> runAgent()
  runAgent.ts              # tool loop (MAX_TOOL_ROUNDS = 6)
  llm.ts                   # OpenAI-compatible request to /api/chat-agent
  base.ts                  # shared types, toConversation() (last 10 messages)
  agents/                  # agent definitions + registry (faq, price, recommend, fallback, router)
  tools/                   # tools executed on the client (price, order, booking, faq, search, ...)
components/                # shared UI — My* primitives (MyButton, MyInput, MyModal, MyTable, ...),
                           #   Icons/, Chat/, Blog/, Comment/, Header/, Footer/, ...
config/                    # baseApi.ts (BaseAPI class), firebase.ts, images.ts, seo.ts (metadata + JSON-LD)
constants/                 # app.ts, cookies.ts, reactQuery.ts, tools.ts
hooks/
  reactQuery/              # useQuery/useMutation hooks for public & customer data
  admin/                   # admin data hooks (useAdminOrders, useAdminBlog, ...)
  useLanguage, useModalDrawer, useUser, useChat, useNotifications, ...
services/                  # one API client per backend resource (+ type.ts for larger ones)
utils/                     # cookie.ts ('use server'), toast, phone, date, loyalty, orderPricing, slugify, ...
zustand/                   # stores: user, language, modal, drawer, toast, chat, address
public/assets/language/    # vn.json, en.json
docs/instruction/<feature>.md         # current behavior, one file per feature (rule 5)
docs/changelog/YYYY-MM-DD_<feature>.md # change history, one file per feature per day (rule 5)
scripts/replace-firebase-env.js  # postbuild: injects env into public FCM SW (if present)
```

## Architecture & Conventions

### API layer
- Each service is a class extending `BaseAPI` (`config/baseApi.ts`) with an endpoint, exported as a singleton:
  `const OrderService = new OrderApi('laundry-orders'); export default OrderService`.
- `get` defaults to **no auth**; `post` / `put` / `patch` / `postFormData` default to `isUseAuth: true`. Pass `{ isUseAuth: false }` for public endpoints (e.g. guest order, order lookup).
- Errors throw `HttpError` (keeps `status`).
- Backend responses are usually wrapped: `{ data, meta? }` — services unwrap `response.data`.
- Data fetching in components goes through hooks in `hooks/reactQuery/` or `hooks/admin/`, with keys from `QUERY_KEYS`; mutations invalidate the related keys.

### Auth
- Access/refresh tokens live in **httpOnly cookies**, read/written only through the server actions in `utils/cookie.ts` (`COOKIES_KEY`).
- `BaseAPI.getAuthToken()` decodes the JWT `exp` and refreshes ~5s before expiry; a 401 triggers one refresh + retry. Concurrent refreshes share one promise.
- Refresh sends the refresh token in the `Authorization` header (not the body).
- If the refresh token is rejected (401/403) → `user.logout()` + `auth.sessionExpired` toast. Cookies are **not** removed there.
- Logged-in user state is the persisted Zustand store `zustand/user.ts` (`useUser`); wait for `hasHydrated` before relying on it.

### Blog
- `services/blogClient.ts` — public reads, cached (`API_CACHE_SECONDS`), used by Server Components (`app/blog`, `revalidate = 60`).
- `services/blog.ts` — admin CRUD (auth). Don't mix them.
- Skip API calls during build with `IS_BUILD_PHASE` where needed.

### AI chat agents
- Only the LLM call leaves the browser (via `/api/chat-agent/chat/completions`); tools run client-side with `AgentContext` (`locale`, `userId`).
- Add an agent: define it in `agents/agents/`, add its name to `AGENT_NAME` (`constants/tools.ts`), register it in `AGENT_REGISTRY` and `routableAgents()` (`agents/agents/index.ts`), and add it to the `enum` of `routeToAgentTool` (`agents/agents/router.ts`).
- Add a tool: implement it in `agents/tools/`, name it in `TOOL_NAME`, attach it to the agent(s) that may call it.
- Model: `NEXT_PUBLIC_AGENT_MODEL` (client) — the proxy forwards it; key/URL stay server-side.

### UI
- Reuse `components/My*` primitives; open modals/drawers only with `useModalDrawer` (skill `modal-drawer`).
- SEO: metadata helpers and JSON-LD builders in `config/seo.ts`, rendered with `components/SeoJsonLd`. Admin pages are `noindex`.
- Mobile-first responsive layouts with Tailwind/daisyUI classes and theme colors (`primary`, `secondary`, `accent`, `background`, `card`, `border`, `text`, `footer`).

### Gotchas
- `PAGE_SIZE` exists twice: `constants/reactQuery.ts` (20) and `constants/app.ts` (10). Check which one the surrounding code uses.
- `ALLOWED_ORIGINS` is duplicated in `app/api/chat-agent` and `app/api/systemone` — update both when the domain changes.
- `next.config.ts` removes `console.*` in production and only enables `reactStrictMode` in production.
- `app/api/auth-proxy` falls back to the onrender backend URL when `NEXT_PUBLIC_API_APP` is unset.

## Environment

- Variables are typed in `environment.d.ts`; template in `.env.example`. Real values in `.env.local` (git-ignored — never commit it, never print keys).
- Server-only: `AGENT_API_URL`, `AGENT_API_KEY`, `AGENT_MODEL`, `SYSTEM_ONE_API_URL`, `SYSTEM_ONE_API_KEY`.
- Public: `NEXT_PUBLIC_API_APP`, `NEXT_PUBLIC_ENV`, `NEXT_PUBLIC_AGENT_MODEL`, `NEXT_PUBLIC_FIREBASE_*`.

## Commands

```bash
npm run dev        # dev server (http://localhost:3000)
npm run lint       # eslint
npm run build      # production build (NEXT_PUBLIC_ENV=production); postbuild runs FCM env script + next-sitemap
npm run start      # serve the production build
npm run fort-http  # expose localhost:3000 via cloudflared tunnel
```

There is no test suite — verify with `npm run lint` + `npm run build` (and the `code-checker` agent / skill `review`).

## Project skills & agents

- Skills (`.claude/skills/`): `language`, `component`, `create-page`, `icon-image`, `modal-drawer`, `comment`, `review`, `seo-check`.
- Agent (`.claude/agents/`): `code-checker` — read-only reviewer for logic bugs, regressions and UI issues after a change.
