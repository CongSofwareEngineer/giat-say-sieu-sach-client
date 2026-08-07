---

name: create-page
description: Create a Next.js page using strict file separation, reusable existing components/functions, and TailwindCSS/daisyUI styling. Use this skill whenever creating a new route, page, or page UI.
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Create Page

## Purpose

Create Next.js pages with a clean, maintainable, and strictly separated file structure.

The page must be easy to understand, modify, reuse, and scale.

The most important rule is:

> Always separate files clearly. Never put page-specific component implementations inside `page.tsx` or `layout.tsx`.

---

# 1. Required Page Structure

Every new page MUST follow this structure:

```text
route/
├── layout.tsx
├── page.tsx
└── components/
    ├── ComponentA.tsx
    ├── ComponentB.tsx
    ├── ComponentC.tsx
    └── ...
```

For example:

```text
app/
└── services/
    ├── layout.tsx
    ├── page.tsx
    └── components/
        ├── ServiceHero.tsx
        ├── ServiceList.tsx
        ├── ServiceCard.tsx
        ├── ServiceFilter.tsx
        └── ServiceCTA.tsx
```

The `components/` directory MUST be created at the same level as `page.tsx` and `layout.tsx`.

---

# 2. `page.tsx` Rules

`page.tsx` MUST be a composition layer.

It should:

* Import page components
* Compose the page
* Pass props
* Handle minimal page-level logic when necessary

Example:

```tsx
import { ServiceHero } from './components/ServiceHero'
import { ServiceList } from './components/ServiceList'
import { ServiceCTA } from './components/ServiceCTA'

export default function ServicesPage() {
  return (
    <main>
      <ServiceHero />
      <ServiceList />
      <ServiceCTA />
    </main>
  )
}
```

## NEVER do this

Do not define components inside `page.tsx`:

```tsx
function ServiceCard() {
  return <div>...</div>
}

export default function ServicesPage() {
  return <ServiceCard />
}
```

Instead:

```text
components/
└── ServiceCard.tsx
```

Then import it:

```tsx
import { ServiceCard } from './components/ServiceCard'
```

---

# 3. `layout.tsx` Rules

`layout.tsx` MUST remain focused on layout concerns.

It may contain:

* Metadata
* Layout wrappers
* Route-level providers when required
* Layout-level configuration

Example:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Our services',
}

export default function ServicesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
```

## NEVER do this

Do not define UI components inside `layout.tsx`.

```tsx
function Header() {
  return <header>...</header>
}

function Footer() {
  return <footer>...</footer>
}

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
```

Instead, use existing shared components or create separate files when necessary.

---

# 4. ALWAYS Reuse Existing Skills, Components, and Functions

Before creating new components or functions:

**Inspect the project and existing skills first.**

Look for:

* Existing Claude Code skills
* Existing shared components
* Existing UI components
* Existing utility functions
* Existing hooks
* Existing constants
* Existing types
* Existing data functions
* Existing layouts
* Existing patterns used by other pages

If an existing component or function already solves the problem, **reuse it**.

Do NOT create a duplicate implementation.

---

# 5. Reuse Existing Skills

If other skills are available and relevant to the page:

**Use those skills.**

For example, if the project has skills for:

```text
SEO
UI components
forms
data fetching
responsive design
metadata
images
navigation
```

Use the appropriate skill instead of implementing an isolated solution.

The `create-page` skill is responsible for page architecture.

Other specialized skills remain responsible for their own domain.

---

# 6. Component Reuse Priority

When implementing a page, follow this priority:

```text
1. Existing page-specific component
        ↓
2. Existing shared component
        ↓
3. Existing component pattern from another page
        ↓
4. Create a new page-specific component
```

Do not create a new component if an existing component can be reused without making the existing component worse or overly generic.

---

# 7. Function Reuse Priority

Use the same principle for functions.

Before writing a new function:

```text
Search existing utilities/functions first.
```

If an existing function performs the required operation:

```tsx
import { existingFunction } from '@/...'
```

Reuse it.

Do NOT create duplicate functions such as:

```text
formatPrice()
formatCurrency()
formatMoney()
```

when the project already has an established utility for that purpose.

---

# 8. Strict File Separation

Always separate meaningful components into their own files.

For example:

```text
components/
├── Hero.tsx
├── SearchBar.tsx
├── Filter.tsx
├── ProductList.tsx
├── ProductCard.tsx
└── EmptyState.tsx
```

Do NOT create:

```text
components/
└── Everything.tsx
```

containing many unrelated components.

Also do NOT create:

```text
page.tsx
```

containing many component implementations.

---

# 9. Component Responsibility

Each component should have one clear responsibility.

Good:

```text
ServiceHero.tsx
ServiceFilter.tsx
ServiceList.tsx
ServiceCard.tsx
ServiceFAQ.tsx
```

Bad:

```text
ServicePageEverything.tsx
```

with the entire page implementation inside one file.

Prefer small, focused components over large monolithic components.

---

# 10. Styling Rules

The project uses:

* TailwindCSS
* daisyUI

Styling MUST primarily use TailwindCSS utility classes and daisyUI components.

Example:

```tsx
<div className="mx-auto max-w-7xl px-4 py-12">
  <button className="btn btn-primary">
    Book now
  </button>
</div>
```

Prefer:

```tsx
className="flex items-center justify-between gap-4 rounded-xl p-6"
```

instead of creating custom CSS.

---

# 11. daisyUI Priority

When daisyUI already provides an appropriate component, prefer daisyUI.

Examples:

```text
button
card
modal
drawer
dropdown
menu
input
select
textarea
badge
alert
tabs
navbar
breadcrumbs
pagination
```

Use daisyUI classes where appropriate:

```tsx
<button className="btn btn-primary">
  Continue
</button>
```

```tsx
<div className="card bg-base-100 shadow-xl">
  ...
</div>
```

Do not rebuild a daisyUI component from scratch unless there is a concrete design or functional reason.

---

# 12. TailwindCSS Priority

When custom styling is needed, use TailwindCSS first.

Prefer:

```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
```

instead of creating a CSS file for simple layout/styling.

Avoid unnecessary:

```text
page.css
component.css
styles.css
```

for styling that TailwindCSS can handle directly.

---

# 13. Custom CSS

Custom CSS is allowed only when TailwindCSS/daisyUI cannot reasonably achieve the required result.

Before creating custom CSS, check whether the same result can be achieved using:

* TailwindCSS
* daisyUI
* Existing project utilities
* Existing components

Do not introduce custom CSS unnecessarily.

---

# 14. Responsive Design

Every page MUST be responsive.

Use TailwindCSS responsive utilities:

```tsx
className="
  grid
  grid-cols-1
  gap-4
  sm:grid-cols-2
  lg:grid-cols-3
"
```

Consider at minimum:

```text
mobile
tablet
desktop
```

Do not create separate desktop/mobile component implementations unless there is a genuine functional requirement.

---

# 15. Page Components Should Stay Local

If a component is only used by one page, keep it inside that page:

```text
app/
└── services/
    └── components/
        └── ServiceCard.tsx
```

Do not move it to:

```text
components/ServiceCard.tsx
```

unless it is genuinely shared.

---

# 16. Shared Components

Use the project's existing shared components whenever possible.

For example:

```text
components/
├── Header.tsx
├── Footer.tsx
├── Button.tsx
├── Container.tsx
└── Section.tsx
```

If these already exist, reuse them.

Do not create duplicate versions inside the page.

---

# 17. Avoid Premature Abstraction

Do not create abstractions just for the sake of abstraction.

Bad:

```text
components/
├── GenericSection.tsx
├── GenericWrapper.tsx
├── GenericContent.tsx
├── GenericContainer.tsx
└── GenericBlock.tsx
```

when the page does not actually need them.

Prefer meaningful components that represent real UI or business concepts.

---

# 18. Next.js Best Practices

Follow the existing project's Next.js architecture.

Prefer Server Components by default.

Only use:

```tsx
'use client'
```

when client-side functionality is actually required.

Do not make the entire page a Client Component just because one child component requires client-side behavior.

Instead:

```text
page.tsx
    ↓
Server Component
    ↓
Client Component
```

Example:

```tsx
import { ServiceList } from './components/ServiceList'

export default function ServicesPage() {
  return (
    <main>
      <ServiceList />
    </main>
  )
}
```

And only `ServiceList.tsx` becomes a Client Component if necessary.

---

# 19. SEO

When creating a page, follow the project's SEO conventions and existing SEO skill.

Do not sacrifice semantic HTML for styling convenience.

Prefer:

```tsx
<main>
  <section>
    <h1>...</h1>
  </section>
</main>
```

Use appropriate:

* `h1`
* `h2`
* `h3`
* semantic sections
* links
* accessible buttons
* meaningful alt text

If metadata is required, place it in `layout.tsx` or the appropriate Next.js metadata location according to the project's existing architecture.

---

# 20. Final Structure Check

Before considering the page complete, verify:

### Required files

```text
✓ layout.tsx
✓ page.tsx
✓ components/
```

### Architecture

```text
✓ page.tsx only composes the page
✓ layout.tsx handles layout concerns
✓ components are separated into files
✓ page-specific components live in ./components/
✓ shared components are reused
✓ existing functions are reused
✓ existing skills are followed
```

### Styling

```text
✓ TailwindCSS is used
✓ daisyUI is used when appropriate
✓ no unnecessary custom CSS
✓ responsive design is implemented
```

### Code quality

```text
✓ no duplicated components
✓ no duplicated utility functions
✓ no unnecessary abstractions
✓ no large monolithic files
✓ no component definitions inside page.tsx
✓ no component definitions inside layout.tsx
```

---

# Core Rule

When creating a page, always think:

```text
Existing Skills
      ↓
Existing Components
      ↓
Existing Functions
      ↓
New Page Structure
      ↓
New Page Components
      ↓
TailwindCSS / daisyUI
```

The final architecture should always be:

```text
route/
├── layout.tsx
├── page.tsx
└── components/
    ├── ComponentA.tsx
    ├── ComponentB.tsx
    ├── ComponentC.tsx
    └── ...
```

**Never sacrifice file separation for convenience.**

**Never duplicate existing components or functions.**

**Never put component implementations inside `page.tsx` or `layout.tsx`.**

**Always reuse the project's existing skills, components, functions, TailwindCSS utilities, and daisyUI components before creating new implementations.**
