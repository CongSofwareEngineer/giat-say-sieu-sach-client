'use client'

import { ReactNode, useCallback, useEffect, useRef } from 'react'

import useModal from '@/hooks/useModal'

const placementMap: Record<string, string> = {
  center: 'modal-middle',
  'top-left': 'modal-top modal-start',
  'top-right': 'modal-top modal-end',
  'bottom-left': 'modal-bottom modal-start',
  'bottom-right': 'modal-bottom modal-end',
}

interface ModalItemProps {
  id: string
  title?: ReactNode
  children?: ReactNode
  showBtnClose?: boolean
  overClickClose?: boolean
  placement?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  classNames?: {
    container?: string
    body?: string
    header?: string
    backdrop?: string
  }
}

function ModalItem({ id, title, children, showBtnClose = true, overClickClose = true, placement = 'center', classNames }: ModalItemProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const { close } = useModal()

  useEffect(() => {
    const dialog = ref.current

    if (!dialog) return

    if (!dialog.open) {
      dialog.showModal()
    }
  }, [])

  const handleClose = useCallback(() => close(id), [close, id])

  return (
    <dialog ref={ref} className={`modal ${placementMap[placement] || 'modal-middle'} ${classNames?.container || ''}`}>
      <div className={`modal-box ${classNames?.body || ''}`}>
        {(title || showBtnClose) && (
          <div className={`flex items-center justify-between ${classNames?.header || ''}`}>
            {title && <h3 className='text-lg font-bold'>{title}</h3>}
            {showBtnClose && (
              <button className='btn btn-sm btn-circle btn-ghost' onClick={handleClose}>
                ✕
              </button>
            )}
          </div>
        )}
        {children}
      </div>
      {overClickClose && (
        <form method='dialog' className={`modal-backdrop ${classNames?.backdrop || ''}`}>
          <button onClick={handleClose}>close</button>
        </form>
      )}
    </dialog>
  )
}

export default function ModalProvider() {
  const { modals } = useModal()

  if (modals.length === 0) return null

  return (
    <>
      {modals.map((modal) => (
        <ModalItem
          key={modal.id}
          id={modal.id}
          title={modal.title}
          showBtnClose={modal.showBtnClose}
          overClickClose={modal.overClickClose}
          placement={modal.placement}
          classNames={modal.classNames}
        >
          {modal.children}
        </ModalItem>
      ))}
    </>
  )
}
