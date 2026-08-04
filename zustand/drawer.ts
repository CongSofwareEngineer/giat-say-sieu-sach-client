import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { IS_PRODUCTION } from '@/constants/app'
import { MyDrawer } from '@/components/MyDrawer'

interface DrawerStore {
  drawers: MyDrawer[]
  open: (drawer: Omit<MyDrawer, 'addDrawer'> & { addDrawer?: boolean }) => void
  close: (id?: string) => void
  closeAll: () => void
}

export const drawer = create<DrawerStore>()(
  devtools(
    (set, get) => ({
      drawers: [],

      open: (drawer) => {
        const listDrawers = get().drawers

        if (drawer.addDrawer) {
          set({ drawers: [...listDrawers, drawer] })
        } else {
          set({ drawers: [drawer] })
        }

        if (listDrawers.length === 0) {
          document.body.style.overflow = 'hidden'
        }
      },

      close: () => {
        const listDrawers = get().drawers
        const lastDrawer = listDrawers.pop()

        if (lastDrawer?.onClose) {
          lastDrawer.onClose()
        }

        if (listDrawers.length === 0) {
          document.body.style.removeProperty('overflow')
        }

        set({ drawers: listDrawers.slice(0, -1) })
      },

      closeAll: () => {
        const { drawers } = get()

        drawers.forEach((m) => m.onClose?.())
        set({ drawers: [] })
        document.body.style.removeProperty('overflow')
      },
    }),
    {
      enabled: !IS_PRODUCTION,
      name: 'drawer-zustand',
    }
  )
)
