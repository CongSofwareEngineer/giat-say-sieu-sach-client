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

## 5. Every logic change must have a log file in `docs/`

- For every new or changed piece of logic (feature, hook, API call, business rule, bug fix), write a Markdown log file in `docs/` so the team can understand it.
- Path: `docs/<feature>/<YYYY-MM-DD>-<short-slug>.md` (e.g. `docs/blog/2026-09-30-blocknote-editor.md`). Create the `<feature>` folder if missing.
- Write the log in Vietnamese, short and clear, using this template:

```md
# <Tên thay đổi>

- Ngày: YYYY-MM-DD
- Phạm vi: <feature / module>

## Mục đích
<Vì sao cần thay đổi này, giải quyết vấn đề gì>

## Luồng xử lý
1. <Bước 1>
2. <Bước 2>

## File liên quan
- `path/to/file.ts` — <vai trò>

## Constants / Translation keys mới
- `QUERY_KEYS.xxx`, `common.xxx`

## Lưu ý
<Edge case, giới hạn, việc cần làm tiếp>
```

- Update the existing log instead of creating a duplicate when continuing the same change on the same day.

## Done checklist

Before reporting a task as done, verify:

- [ ] No hardcoded UI text — all via `translate()`, keys in both `vn.json` and `en.json`
- [ ] No raw keys/names/values — all via `constants/` or `config/`
- [ ] Nothing committed or pushed
- [ ] Every add/delete was confirmed by the user
- [ ] Log file written in `docs/`
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
docs/<feature>/            # change logs (rule 5)
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
