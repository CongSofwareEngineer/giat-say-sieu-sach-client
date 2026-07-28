'use client'

import { ReactNode, useEffect, useState } from 'react'

import { cn } from '@/utils/tailwind'
import useDrawer from '@/hooks/useDrawer'

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

function MyDrawerItem(drawer: MyDrawer) {
  const { close } = useDrawer()
  const [open, setOpen] = useState(false)

  const placement = drawer.placement || 'bottom'

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

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClickBackdrop}
        className={`
          fixed inset-0 z-40 bg-black/40
          transition-opacity duration-300 
        `}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed z-50 bg-white rounded-t-2xl shadow-olive-500 transition-transform duration-300',
          placementBase[placement],
          open ? placementFinal[placement] : placementInitial[placement]
        )}
      >
        <div className='flex justify-center pt-3'>
          <div onClick={() => close()} className='h-1 w-10 cursor-pointer rounded-full bg-gray-300' />
        </div>

        <div className='flex items-center justify-between border-b p-4'>
          <button onClick={() => close()} className='text-xl'>
            <div className='text-black'>✕</div>
          </button>
        </div>

        {drawer.children}
      </aside>
    </>
  )
}

export default function MyDrawer() {
  const { drawers } = useDrawer()

  return drawers.map((e, index) => {
    return <MyDrawerItem key={`drawer_${index}`} {...e} />
  })
}
