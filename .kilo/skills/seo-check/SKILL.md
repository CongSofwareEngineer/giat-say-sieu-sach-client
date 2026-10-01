---
name: seo-check
description: SEO check for this Next.js project — reads source code (metadata, JSON-LD, sitemap, robots, headings, images) and optionally runs the claude-seo plugin scripts on localhost or the live site. Use when the user asks to check/audit SEO of this project, a route, or before deploying.
---

# SEO Check Skill

Project-specific SEO audit, based on the `claude-seo` plugin (`~/.claude/skills/seo`) but driven by this codebase instead of a URL.

**Invocation:** `/seo-check [mode] [target]`

| Command | What it does | Needs |
|---------|-------------|-------|
| `/seo-check` | Static check of all public routes in source code | Nothing |
| `/seo-check <route>` | Static check of one route, e.g. `/seo-check /pricing` | Nothing |
| `/seo-check local [route]` | Static check + build, run on `localhost:3000`, audit rendered HTML | Plugin runtime |
| `/seo-check live [url]` | Static check + audit production (default `SITE_CONFIG.url`) + PageSpeed | Plugin runtime, internet |

## Rules

- **Report only — never edit code** during the check. Fix only after the user approves, and then follow `CLAUDE.md` (constants, `translate()`, ask before add/delete, log in `docs/`).
- Write the report in **Vietnamese**, findings ranked Critical → High → Medium → Low, each with `file:line`, why it matters, and the concrete fix.
- Do not report something you did not verify in code or in fetched output. Mark guesses as "cần kiểm tra".
- Do not spawn the plugin's audit subagents; run checks inline.
- Never run `git` commands that change state.

## Project SEO map

| Concern | Where |
|---------|-------|
| Site name, URL, description, keywords | `constants/app.ts` → `SITE_CONFIG` |
| Base metadata, per-page `buildMetadata()`, all JSON-LD helpers, `toJsonLd()` | `config/seo.ts` |
| Per-route metadata | `app/**/layout.tsx` (`export const metadata` / `generateMetadata`) |
| JSON-LD rendering | `<script type="application/ld+json">` in layouts/pages, via `toJsonLd()` |
| Sitemap + robots (generated on `postbuild`) | `next-sitemap.config.js` → `public/sitemap*.xml`, `public/robots.txt` |
| PWA manifest | `app/manifest.json` |
| UI text (crawlable content) | `translate()` from `hooks/useLanguage`, keys in `public/assets/language/*.json` |
| Images | `config/images.ts` |

**Route groups:**
- Public (must be indexable): `/`, `/about`, `/pricing`, `/booking`, `/contact`, `/reviews`, `/blog`, `/blog/[slug]`, `/track-order`
- Private (must be `noindex` and excluded from sitemap): `/admin/*`, `/profile`, `/login`, `/register`, `/api/*`

Re-list routes with `find app -name page.tsx` — the lists above may be outdated.

## Mode 1 — Static check (always runs)

For each route in scope, read its `page.tsx`, `layout.tsx` and the components they render.

### 1. Metadata
- [ ] Public route uses `buildMetadata({ title, description, path })` from `config/seo.ts` (not a raw `metadata` object missing canonical/OG)
- [ ] `title` unique across routes, ~30–60 chars after the `%s - <siteName>` template
- [ ] `description` unique, ~70–160 chars
- [ ] `path` matches the actual route → canonical correct; dynamic routes (`/blog/[slug]`) use `generateMetadata` with the slug
- [ ] Private route sets `robots: { index: false, follow: false }`
- [ ] `openGraph.images` resolves to an existing file in `public/` (check `SITE_CONFIG.thumbnail`)
- [ ] Base `robots` in `generateMetaBase` — flag `nocache: true` site-wide (Medium)

### 2. Structured data (JSON-LD)
- [ ] Rendered through `toJsonLd()` (XSS-safe), never raw `JSON.stringify`
- [ ] Uses helpers in `config/seo.ts`; `@id` references (`#organization`, `#localbusiness`, `#website`) resolve to a schema rendered on the same page or in root layout
- [ ] `LocalBusiness`: NAP (name, address, phone) identical to the contact page and footer; `geo`, `openingHoursSpecification` match the real business
- [ ] `aggregateRating` / `Review` must reflect real, visible reviews on the page — hardcoded or self-serving ratings are **High** (Google review-snippet policy)
- [ ] `BlogPosting`: `datePublished`/`dateModified` real ISO dates, `image` specific to the post when possible, `author` present
- [ ] Never recommend `HowTo` (deprecated). `FAQPage` has no Google rich result since 2026-05-07 → report existing ones as **Info** only, do not recommend adding or removing
- [ ] Hardcoded data in `config/seo.ts` (e.g. `BLOG_POSTS`, `SERVICE_OFFERS`) is in sync with real content (admin-managed blog, pricing API) — drift is **Medium**

### 3. Content & headings
- [ ] Exactly one `<h1>` per page, headings not skipping levels
- [ ] Main content is server-rendered. `translate()` reads from a client store (`zustand/language`): verify the text appears in the server HTML (Mode 2 confirms). Content only visible after client JS is **High**
- [ ] `<html lang>` in `app/layout.tsx` matches the default language (`vi`)
- [ ] Internal links use `next/link` with real `href` (not `onClick` + `router.push`) so crawlers can follow them
- [ ] Thin content: public service pages ≥ ~300 words, blog posts ≥ ~800 words (plugin `references/quality-gates.md`)

### 4. Images
- [ ] `next/image` used (not raw `<img>`), with `width`/`height` or `fill` + sized parent (CLS)
- [ ] Meaningful `alt` via `translate()`; decorative images `alt=""`
- [ ] Above-the-fold hero image has `priority`; others lazy (default)
- [ ] Large files in `public/` (> 300 KB) or non-WebP/AVIF photos → Medium

### 5. Sitemap & robots
- [ ] `siteUrl` in `next-sitemap.config.js` equals `SITE_CONFIG.url`
- [ ] `exclude` covers every private route (`/admin/*`, `/api/*`, `/profile`, `/login`, `/register`)
- [ ] Dynamic routes (`/blog/[slug]`) are included — next-sitemap only sees static pages unless `additionalPaths` is set
- [ ] `lastmod: new Date()` on every URL makes lastmod meaningless → Low
- [ ] `robots.txt`: no `Host:` needed (Yandex-only), `Sitemap:` points to production URL

### 6. Performance hints (code-level)
- [ ] Heavy client libs (BlockNote, Mantine, Firebase) not imported in public pages' initial bundle; use `next/dynamic` where possible
- [ ] Fonts via `next/font`; no render-blocking third-party scripts (use `next/script` with a strategy)
- [ ] Core Web Vitals language: LCP, INP, CLS — never FID

## Mode 2 — `local`

Runs the plugin's scripts against a production build on this machine.

1. Check the runtime: `"$HOME/.claude/skills/seo/scripts/claude-seo" doctor --json`. If not ready, tell the user to run `/seo setup` and stop Mode 2 (Mode 1 results still stand).
2. Build **without** `postbuild` — `npm run build` would rewrite tracked files (`public/robots.txt`, and inject `.env.local` secrets into `public/firebase-messaging-sw.js`):
   ```bash
   NEXT_PUBLIC_ENV=production npx next build
   ```
3. Start in background (`run_in_background: true`): `NEXT_PUBLIC_ENV=production npx next start -p 3000`, then wait until `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000` returns `200`.
4. Run per route (prefix every call with the allowlist env, the plugin blocks localhost by default):
   ```bash
   SEO="$HOME/.claude/skills/seo/scripts/claude-seo"
   export CLAUDE_SEO_LOCAL_TARGETS=localhost:3000
   "$SEO" run fetch_page.py http://localhost:3000/<route> --render never -o "$SCRATCH/<route>.raw.html"
   "$SEO" run parse_html.py "$SCRATCH/<route>.raw.html" --url http://localhost:3000/<route> --json
   "$SEO" run render_page.py http://localhost:3000/<route> --mode always --viewport mobile --json --json-ld-output "$SCRATCH/<route>.jsonld.json"
   "$SEO" run capture_screenshot.py http://localhost:3000/<route> --viewport mobile -o "$SCRATCH/shots"
   ```
   `$SCRATCH` = the session scratchpad directory, never the project.
5. Compare:
   - Raw HTML vs rendered: title, meta description, canonical, `h1`, word count. Text present only after render → client-only content (**High**).
   - JSON-LD found vs what Mode 1 expected.
   - Open the mobile screenshot (Read tool): `h1` and primary CTA visible above the fold, no overlapping/cut-off UI.
6. Stop the server (TaskStop) when done.

## Mode 3 — `live`

Target defaults to `SITE_CONFIG.url`. Run Mode 1 first, then:

```bash
SEO="$HOME/.claude/skills/seo/scripts/claude-seo"
"$SEO" run fetch_page.py <url> --json --max-text 2000
"$SEO" run fetch_page.py <url> --googlebot --json --max-text 2000   # compare with normal UA
"$SEO" run sitemap_discovery.py <url> --json
"$SEO" run pagespeed_check.py <url> --strategy mobile --psi-only --json
"$SEO" run agentic_check.py <url> --json
```

- Sitemap: every public route present, no private route, no 404/redirect URLs.
- PageSpeed: report LCP, INP, CLS, TBT against plugin `references/cwv-thresholds.md` (Good: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1). A PSI quota error is not a site failure — say so and continue.
- Production vs code: if live metadata differs from source, the deployed build is outdated — mention it.
- For a deeper single-URL report, suggest the plugin: `/seo page <url>`, `/seo schema <url>`, `/seo local <url>` (this is a local laundry business — GBP/NAP matter).

## Report format

```md
# Báo cáo SEO — <mode>, <route|toàn site>, <YYYY-MM-DD>

## Tóm tắt
<2–3 câu: tình trạng chung, vấn đề lớn nhất>

## Critical
- **<vấn đề>** — `path/file.tsx:12`
  Vì sao: <ảnh hưởng tới index/ranking>
  Sửa: <cách sửa cụ thể, dùng constants / translate() / helper trong config/seo.ts>

## High / Medium / Low
...

## Đã ổn
- <những điểm đạt, ngắn gọn>

## Đề xuất bước tiếp
- <fix theo thứ tự phụ thuộc>; hỏi user có muốn sửa không
```

Keep it scannable: no score theater, no generic SEO advice that does not point to a file or URL in this project.
