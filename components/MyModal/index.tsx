'use client'
import { CloseIcon } from '../Icons/Functions/Close'

import useModal from '@/hooks/useModal'
import { cn } from '@/utils/tailwind'
import { Modal } from '@/zustand/modal'

const MyModal = () => {
  const { listModals, close } = useModal()

  const onClick = (event: any, modal: Modal) => {
    if (event.target === event.currentTarget) {
      if (modal.overClickClose !== false) {
        close()
      }
    }
  }

  const getPosition = (modal: Modal) => {
    switch (modal.placement || 'center') {
      case 'center':
        return {
          alignItems: 'center',
          justifyContent: 'center',
        }

      case 'top-left':
        return {}

      case 'top-right':
        return { alignItems: 'end' }

      case 'bottom-left':
        return { justifyContent: 'end' }

      default:
        return { alignItems: 'end', justifyContent: 'end' }
    }
  }

  const getPositionBody = (modal: Modal) => {
    switch (modal.placement || 'center') {
      case 'center':
        return {}

      case 'top-left':
        return {
          top: 20,
          left: 20,
        }

      case 'top-right':
        return {
          top: 20,
          right: 20,
        }

      case 'bottom-left':
        return {
          bottom: 20,
          left: 20,
        }

      default:
        return { bottom: 20, right: 20 }
    }
  }

  return (
    <>
      {listModals.map((modal, index) => (
        <div
          key={`modal-${index}`}
          className={cn(
            'fixed flex justify-center items-center flex-col inset-0 w-[100dvw] h-[100dvh] bg-primary/25 backdrop-blur-[2px] ',
            modal?.classNames?.backdrop
          )}
          style={{
            zIndex: 100 + index * 2,
            ...getPosition(modal),
          }}
          onClick={(e) => onClick(e, modal)}
        >
          <div
            className={cn(
              'md:w-[500px] animation-zoom transition-all duration-500 border border-border max-h-[calc(100dvh-100px)] w-[90dvw] relative flex flex-col justify-center items-center bg-card text-text rounded-2xl p-5 shadow-card-hover',
              modal.classNames?.container
            )}
            style={getPositionBody(modal)}
          >
            {modal.showBtnClose !== false && (
              <div className='absolute z-10 text-xl right-4 top-4 flex justify-end'>
                <button
                  onClick={() => {
                    close()
                    if (modal?.onClose) {
                      modal?.onClose()
                    }
                  }}
                  className={'p-0 min-h-9 h-9 aspect-square rounded-full border-0'}
                >
                  <CloseIcon className='cursor-pointer size-6 text-text' />
                </button>
              </div>
            )}
            {modal.title && <div className='font-bold mb-2 w-full'>{modal.title}</div>}
            <div className='flex flex-1 w-full overflow-auto'>{modal.children}</div>
          </div>
        </div>
      ))}
    </>
  )
}

export default MyModal
