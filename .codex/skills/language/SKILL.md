---
name: language
description: Always add text to vn.json/en.json, use useLanguage hook with translate() for UI strings
---

# Language Skill

## Rules

- **Add all text keys** to both `public/assets/language/vn.json` (Vietnamese) and `public/assets/language/en.json` (English)
- Keep both files in sync — every key in one must exist in the other
- **Never hardcode UI strings** — use `useLanguage` hook from `@/hooks/useLanguage`
- Call `translate(key, variables?, defaultMessage?)` to get translated text
- Key follows dot notation matching the JSON structure (e.g. `"common.save"`)

## translate() API

```typescript
const { translate, lang, setLanguage } = useLanguage()

// Simple string
translate('common.save')            // "Lưu" / "Save"

// With variables
translate('welcome.user', { name: 'John' })  // "Chào bạn, John!" / "Welcome, John!"

// With ReactNode render function
translate('terms.link', {
  link: (text) => <a href="/terms">{text}</a>
})

// With default fallback
translate('missing.key', {}, 'fallback')
```

## JSON structure example

```json
// vn.json
{
  "common": {
    "save": "Lưu",
    "cancel": "Hủy"
  },
  "welcome": {
    "user": "Chào bạn, {name}!"
  }
}

// en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "welcome": {
    "user": "Welcome, {name}!"
  }
}
```

## File locations

- `public/assets/language/vn.json` — Vietnamese translations
- `public/assets/language/en.json` — English translations
- `hooks/useLanguage.tsx` — The hook implementation
- `zustand/language.ts` — Zustand store + types
