import { ReactNode } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface ModalState {
  id: string
  addModal?: boolean
  onClose?: () => any
  showBtnClose?: boolean
  children?: ReactNode
  title?: ReactNode
  classNames?: {
    container?: string
    body?: string
    header?: string
    backdrop?: string
  }
  overClickClose?: boolean
  placement?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

interface ModalStore {
  modals: ModalState[]
  open: (modal: Omit<ModalState, 'id'> & { id?: string }) => void
  close: (id?: string) => void
  closeAll: () => void
}

export const modal = create<ModalStore>()(
  devtools(
    (set, get) => ({
      modals: [],

      open: (modal) => {
        const listModals = get().modals
        const id = modal.id || `modal-${listModals.length + 1}`

        if (modal.addModal === false) {
          set((state) => {
            const last = state.modals[state.modals.length - 1]

            if (last?.onClose) last.onClose()

            return {
              modals: [...state.modals.slice(0, -1), { ...modal, id }],
            }
          })
        } else {
          set((state) => ({
            modals: [...state.modals, { ...modal, id }],
          }))
        }
      },

      close: (id) => {
        set((state) => {
          if (!id) {
            const last = state.modals[state.modals.length - 1]

            if (last?.onClose) last.onClose()

            return { modals: state.modals.slice(0, -1) }
          }

          const target = state.modals.find((m) => m.id === id)

          if (target?.onClose) target.onClose()

          return {
            modals: state.modals.filter((m) => m.id !== id),
          }
        })
      },

      closeAll: () => {
        const { modals } = get()

        modals.forEach((m) => m.onClose?.())
        set({ modals: [] })
      },
    }),
    {
      enabled: process.env.NEXT_PUBLIC_ENV !== 'production',
      name: 'modal-zustand',
    }
  )
)
