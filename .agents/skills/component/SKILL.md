---
name: component
description: Always reuse existing components from the components/ folder, avoid creating new ones
---

# Component Skill

## Rules

- **Always check `components/` first** before writing any new UI
- Reuse existing components: `MyButton`, `MyDrawer`, `MyModal`, `MySelect`, etc.
- Do **not** create new components if an existing one can be used or extended
- Check thoroughly — look at all subdirectories under `components/`

## Existing components

| Component | Path | Usage |
|---|---|---|
| `MyButton` | `components/MyButton/` | `<MyButton variant="primary" size="small" loading>...</MyButton>` |
| `MyDrawer` | `components/MyDrawer/` | Rendered by `useModalDrawer` on mobile |
| `MyModal` | `components/MyModal/` | Rendered by `useModalDrawer` on desktop |
| `MySelect` | `components/MySelect/` | `<MySelect data={items} value={val} onChange={fn} />` |
| `ClientRender` | `components/ClientRender/` | Wraps app content in layout |
| `ReactQuery` | `components/ReactQuery/` | Provider wrapper for TanStack Query |

## Icon components

All icons live in `components/Icons/` — never create new icon files:
- `Functions/` — `Close`, `Copy`, `Edit`, `Filter`, `Home`, `IconRegister`, `LogOut`, `Menu`, `Search`, `Send`, `Setting`
- `Home/` — `Award`, `Code`, `Coffee`, `Database`, `Experience`, `Server`, `SmartPhone`, `Sparkles`
- `SocialMedia/` — `Facebook`, `Github`, `Instagram`, `Linkedin`, `Twitter`, `Zalo`
- Standalone — `ArrowDown`, `ArrowUp`, `Calendar`, `Camera`, `CheckBadge`, `Class`, `Contact`, `Download`, `ExternalLink`, `Eye`, `EyeSlash`, `Globe`, `Inbox`, `Info`, `Mail`, `MapPin`, `Moon`, `Payment`, `Phone`, `Plus`, `Star`, `Sun`, `Trash`, `UserCircle`, `UserPlus`, `XMark`, `Zap`
