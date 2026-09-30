---
name: icon-image
description: Use icons from components/Icons/ only, reference images from config/images.ts
---

# Icon-Image Skill

## Rules

- **Use icons from `components/Icons/` only** — never create new icon components
- Import by exact file path (named or default export depending on the file)
- For images, **use paths defined in `config/images.ts`** — never hardcode image URLs

## Importing icons

```typescript
// Named exports (Functions/, CheckBadge, Sun, XMark, UserCircle, etc.)
import { CloseIcon } from '@/components/Icons/Functions/Close'
import { SearchIcon } from '@/components/Icons/Functions/Search'
import { CheckBadgeIcon } from '@/components/Icons/CheckBadge'
import { SunIcon } from '@/components/Icons/Sun'
import { XMarkIcon } from '@/components/Icons/XMark'

// Default exports (Home/, SocialMedia/, Star, Zap, etc.)
import StarIcon from '@/components/Icons/Star'
import ZapIcon from '@/components/Icons/Zap'
import FacebookIcon from '@/components/Icons/SocialMedia/Facebook'
```

All icons accept standard SVG props — `className`, `strokeWidth`, etc.

## Using images

```typescript
import { images } from '@/config/images'

// Reference by config key (never hardcode URL)
<img src={images.logo} alt="Logo" />
```

Images config file: `config/images.ts`

## What NOT to do

```typescript
// ❌ Bad — hardcoded path
<img src="/logo.png" alt="Logo" />

// ❌ Bad — inline SVG instead of using existing icon
<svg>...</svg>

// ✅ Good — from config
import { images } from '@/config/images'
<img src={images.logo} alt="Logo" />

// ✅ Good — existing icon component
import { CloseIcon } from '@/components/Icons/Functions/Close'
```
