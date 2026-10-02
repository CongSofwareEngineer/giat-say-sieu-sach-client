'use client'

import { useState } from 'react'

import MyButton from '@/components/MyButton'
import useLanguage from '@/hooks/useLanguage'

export type CancelOrderConfirmProps = {
  orderCode: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

// Confirm content for the customer cancelling a just-placed order (open it with useModalDrawer)
const CancelOrderConfirm = ({ orderCode, onClose, onConfirm }: CancelOrderConfirmProps) => {
  const { translate } = useLanguage()
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const handleConfirm = async () => {
    if (isCancelling) return

    setCancelError('')
    setIsCancelling(true)

    try {
      await onConfirm()
    } catch {
      setCancelError(translate('myOrders.cancel.error'))
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className='w-full'>
      <p className='mb-2 text-sm text-gray-600'>{translate('myOrders.cancel.message', { code: orderCode })}</p>
      <p className='mb-6 text-xs text-gray-500'>{translate('myOrders.cancel.note')}</p>
      {cancelError && <p className='mb-4 text-sm text-red-600'>{cancelError}</p>}
      <div className='flex justify-end gap-3'>
        <MyButton variant='outline' onClick={onClose}>
          {translate('myOrders.cancel.keep')}
        </MyButton>
        <MyButton variant='error' loading={isCancelling} onClick={handleConfirm}>
          {translate('myOrders.cancel.confirm')}
        </MyButton>
      </div>
    </div>
  )
}

export default CancelOrderConfirm
