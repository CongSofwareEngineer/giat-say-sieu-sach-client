'use client'

import { ReactNode, useEffect, useState } from 'react'

import { XMarkIcon } from '../Icons/XMark'

import { cn } from '@/utils/tailwind'
import useDrawer from '@/hooks/useDrawer'
import useLanguage from '@/hooks/useLanguage'

export type MyDrawer = {
  placement: 'left' | 'right' | 'bottom' | 'top'
  className?: string
  style?: React.CSSProperties
  children?: ReactNode
  onClose?: () => any
  overClickClose?: boolean
  title?: ReactNode
}

const placementInitial = {
  left: '-translate-x-full',
  right: 'translate-x-full',
  bottom: 'translate-y-full',
  top: '-translate-y-full',
}

const placementFinal = {
  left: 'translate-x-0',
  right: 'translate-x-0',
  bottom: 'translate-y-0',
  top: 'translate-y-0',
}

const placementBase = {
  left: 'left-0 top-0 h-full w-80',
  right: 'right-0 top-0 h-full w-80',
  bottom: 'left-0 bottom-0 w-full h-[calc(100dvh-68px)]',
  top: 'left-0 top-0 w-full',
}

function MyDrawerItem({ index = 0, ...drawer }: MyDrawer & { index?: number }) {
  const { close } = useDrawer()
  const { translate } = useLanguage()
  const [open, setOpen] = useState(false)
  const [visual, setVisual] = useState<{ offsetTop: number; height: number } | null>(null)

  const placement = drawer.placement || 'bottom'
  const zIndex = 60 + index * 2

  useEffect(() => {
    const vv = window.visualViewport

    if (!vv) return

    const update = () => setVisual({ offsetTop: vv.offsetTop, height: vv.height })

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)

    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true))

    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }

    window.addEventListener('keydown', handleEsc)

    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [])

  const onClickBackdrop = (event: any) => {
    if (event.target === event.currentTarget) {
      if (drawer.overClickClose !== false) {
        close()
      }
    }
  }

  const drawerStyle: React.CSSProperties = { zIndex: zIndex + 1 }

  if (placement === 'bottom' && visual) {
    const keyboardHeight = Math.max(0, window.innerHeight - (visual.offsetTop + visual.height))

    drawerStyle.height = `calc(${visual.height}px - 68px)`
    drawerStyle.bottom = keyboardHeight
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClickBackdrop}
        style={{ zIndex }}
        className='
          fixed inset-0 bg-slate-900/30 backdrop-blur-sm
          transition-opacity duration-300 
        '
      />

      {/* Drawer */}
      <aside
        style={drawerStyle}
        className={cn(
          'fixed overflow-hidden bg-white shadow-[0_0_64px_-16px_rgba(15,23,42,0.35)] transition-transform duration-300 ease-out',
          placementBase[placement],
          open ? placementFinal[placement] : placementInitial[placement],
          drawer.className
        )}
      >
        <div className='absolute top-0 left-0 right-0 z-10 flex h-15 items-center justify-between gap-4 bg-gradient-to-r from-primary to-secondary p-4 shadow-[0_8px_24px_-12px_rgba(10,111,135,0.6)]'>
          <div className='min-w-0 flex-1 text-sm font-semibold text-white'>{drawer.title}</div>
          <button
            onClick={() => close()}
            aria-label={translate('common.close')}
            className='flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25'
          >
            <XMarkIcon className='size-5' stroke='currentColor' strokeWidth={2} fill='none' />
          </button>
        </div>
        <div className='h-full md:px-5 w-full overflow-y-auto overscroll-contain pt-15'>{drawer.children}</div>
      </aside>
    </>
  )
}

export default function MyDrawer() {
  const { drawers } = useDrawer()

  return drawers.map((e, index) => {
    return <MyDrawerItem key={`drawer_${index}`} {...e} index={index} />
  })
}
