'use client'
import { CloseIcon } from '../Icons/Functions/Close'

import useModal from '@/hooks/useModal'
import useLanguage from '@/hooks/useLanguage'
import { cn } from '@/utils/tailwind'
import { Modal } from '@/zustand/modal'

const MyModal = () => {
  const { listModals, close } = useModal()
  const { translate } = useLanguage()

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
            'fixed flex justify-center items-center flex-col inset-0 w-[100dvw] h-[100dvh] bg-slate-900/30 backdrop-blur-sm animation-fade-in',
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
              'md:w-[500px] animation-zoom transition-all duration-500 border border-white/60 ring-1 ring-black/5 max-h-[calc(100dvh-100px)] w-[90dvw] relative flex flex-col justify-center items-center bg-card text-text rounded-3xl p-6 shadow-[0_32px_64px_-24px_rgba(15,23,42,0.35)]',
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
                  aria-label={translate('common.close')}
                  className='flex size-9 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-text'
                >
                  <CloseIcon className='size-6' />
                </button>
              </div>
            )}
            {modal.title && <div className='mb-3 w-full pr-10 text-lg font-bold text-text'>{modal.title}</div>}
            <div className='flex flex-1 w-full overflow-auto'>{modal.children}</div>
          </div>
        </div>
      ))}
    </>
  )
}

export default MyModal
