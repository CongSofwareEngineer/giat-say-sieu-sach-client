import { ReactNode, useRef } from 'react'

import useDrawer from '@/hooks/useDrawer'
import useMedia from '@/hooks/useMedia'
import useModal from '@/hooks/useModal'

// ── Types ────────────────────────────────────────────────

type ModalPlacement = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type DrawerPlacement = 'left' | 'right' | 'bottom' | 'top'

type ModalDrawerMode = 'auto' | 'modal' | 'drawer'

export type ModalDrawerConfig = {
  mode?: ModalDrawerMode
  maxWidth?: number
}

export type ModalDrawerOptions = {
  children?: ReactNode
  title?: ReactNode
  onClose?: () => any
  overClickClose?: boolean
  add?: boolean

  // modal
  placement?: ModalPlacement
  showBtnClose?: boolean
  classNames?: {
    container?: string
    body?: string
    header?: string
    backdrop?: string
  }

  // drawer
  drawerPlacement?: DrawerPlacement
  className?: string
  style?: React.CSSProperties

  // per-call override
  mode?: 'modal' | 'drawer'
}

// ── Hook ─────────────────────────────────────────────────

const useModalDrawer = (config: ModalDrawerConfig = {}) => {
  const { mode: globalMode = 'auto', maxWidth = 768 } = config
  const { isMobile, isClient } = useMedia(maxWidth)
  const modalStore = useModal()
  const drawerStore = useDrawer()
  const lastMode = useRef<'modal' | 'drawer'>('modal')

  const resolveMode = (perCallMode?: 'modal' | 'drawer'): 'modal' | 'drawer' => {
    if (perCallMode) return perCallMode
    if (globalMode !== 'auto') return globalMode as 'modal' | 'drawer'

    return isMobile ? 'drawer' : 'modal'
  }

  const open = (options: ModalDrawerOptions = {}) => {
    const resolved = resolveMode(options.mode)

    if (!isClient) {
      lastMode.current = 'modal'
      modalStore.open({
        children: options.children,
        title: options.title,
        onClose: options.onClose,
        overClickClose: options.overClickClose,
        addModal: options.add,
        placement: options.placement ?? 'center',
        showBtnClose: options.showBtnClose,
        classNames: options.classNames,
      })

      return
    }

    lastMode.current = resolved

    if (resolved === 'modal') {
      modalStore.open({
        children: options.children,
        title: options.title,
        onClose: options.onClose,
        overClickClose: options.overClickClose,
        addModal: options.add,
        placement: options.placement ?? 'center',
        showBtnClose: options.showBtnClose,
        classNames: options.classNames,
      })
    } else {
      drawerStore.open({
        children: options.children,
        title: options.title,
        onClose: options.onClose,
        overClickClose: options.overClickClose,
        addDrawer: options.add,
        placement: options.drawerPlacement ?? 'bottom',
        className: options.className,
        style: options.style,
      })
    }
  }

  const close = () => {
    if (lastMode.current === 'modal') {
      modalStore.close()
    } else {
      drawerStore.close()
    }
  }

  const closeAll = () => {
    modalStore.closeAll()
    drawerStore.closeAll()
  }

  return { open, close, closeAll, isMobile, isClient }
}

export default useModalDrawer
