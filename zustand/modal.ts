import { ReactNode } from 'react'
import { create } from 'zustand'

export interface ModalState {
  id: string
  addModal?: boolean
  callBackAfter?: () => any
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

let modalCounter = 0

export const modal = create<ModalStore>()((set, get) => ({
  modals: [],

  open: (modal) => {
    const id = modal.id || `modal-${++modalCounter}`

    if (modal.addModal === false) {
      set((state) => {
        const last = state.modals[state.modals.length - 1]

        if (last?.callBackAfter) last.callBackAfter()

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

        if (last?.callBackAfter) last.callBackAfter()

        return { modals: state.modals.slice(0, -1) }
      }

      const target = state.modals.find((m) => m.id === id)

      if (target?.callBackAfter) target.callBackAfter()

      return {
        modals: state.modals.filter((m) => m.id !== id),
      }
    })
  },

  closeAll: () => {
    const { modals } = get()

    modals.forEach((m) => m.callBackAfter?.())
    set({ modals: [] })
  },
}))
