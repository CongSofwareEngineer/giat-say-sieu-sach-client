---
name: modal-drawer
description: Always use useModalDrawer hook to open modals/drawers, never write custom ones
---

# Modal-Drawer Skill

## Rules

- **Always use `useModalDrawer`** from `@/hooks/useModalDrawer` to open modals and drawers
- Never write a custom modal or drawer component manually
- The hook auto-selects: **modal on desktop**, **drawer on mobile** (based on `maxWidth`, default `768px`)

## Usage

```typescript
import useModalDrawer from '@/hooks/useModalDrawer'

const { open, close, closeAll } = useModalDrawer({
  mode: 'auto',      // 'auto' | 'modal' | 'drawer'
  maxWidth: 768,     // breakpoint for modal/drawer switch
})

// Open with content
open({
  children: <YourContent />,
  title: 'Dialog Title',
  onClose: () => console.log('closed'),
  overClickClose: true,     // default true
  add: false,               // stack multiple modals

  // Modal-specific options
  placement: 'center',      // 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showBtnClose: true,
  classNames: {
    container: '',
    body: '',
    header: '',
    backdrop: '',
  },

  // Drawer-specific options
  drawerPlacement: 'bottom', // 'left' | 'right' | 'bottom' | 'top'
  className: '',
  style: {},

  // Per-call override
  mode: 'modal',           // force modal or drawer for this call
})

// Close
close()       // close current
closeAll()    // close all
```

## Important

- `useModalDrawer` returns `{ open, close, closeAll, isMobile, isClient }`
- Modal placement defaults to `'center'`, drawer placement defaults to `'bottom'`
- To force a specific mode for one call, pass `mode: 'modal'` or `mode: 'drawer'` in options
