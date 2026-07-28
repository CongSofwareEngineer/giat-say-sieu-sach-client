import { ReactNode } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { IS_PRODUCTION } from '@/constants/app'

export type Modal = {
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

interface ModalState {
  listModals: Modal[]
  open: (nextModalAdmin: Modal) => void
  close: (isIconClose?: boolean) => void
  closeAll: () => void
}
export const modal = create<ModalState>()(
  devtools(
    (set, get) => ({
      listModals: [],
      open: (param: Modal) => {
        const listModals = get().listModals
        const newModal = {
          showBtnClose: true,
          overClickClose: true,
          ...param,
        }

        if (param.addModal) {
          listModals.push(newModal)
        } else {
          listModals[listModals.length === 0 ? 0 : listModals.length - 1] = newModal
        }
        set({ listModals })
        document.body.style.overflow = 'hidden'
      },
      close: () => {
        const listModals = get().listModals
        const modal = listModals.pop()

        modal?.onClose && modal?.onClose()

        set({ listModals })
        if (listModals.length === 0) {
          document.body.style.removeProperty('overflow')
        }
      },
      closeAll: () => {
        const { listModals } = get()

        listModals.forEach((m) => m.onClose?.())
        set({ listModals: [] })
        document.body.style.removeProperty('overflow')
      },
    }),
    {
      name: 'modal-zustand',
      enabled: !IS_PRODUCTION,
    }
  )
)
