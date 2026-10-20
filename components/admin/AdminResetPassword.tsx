'use client'

import { useState } from 'react'

import MyButton from '@/components/MyButton'
import { CheckIcon } from '@/components/Icons/Check'
import { CopyIcon } from '@/components/Icons/Functions/Copy'
import { COPY_FEEDBACK_DURATION } from '@/constants/app'
import useModalDrawer from '@/hooks/useModalDrawer'
import useLanguage from '@/hooks/useLanguage'
import { copyToClipboard } from '@/utils/functions'

type AdminResetPasswordProps = {
  customerName: string
  // Resolves with the temporary password created by the server
  onConfirm: () => Promise<{ tempPassword: string }>
}

// Confirm step, then shows the temporary password once so the admin can send it to the customer
const AdminResetPassword = ({ customerName, onConfirm }: AdminResetPasswordProps) => {
  const { translate } = useLanguage()
  const { close } = useModalDrawer()
  const [isResetting, setIsResetting] = useState(false)
  const [tempPassword, setTempPassword] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const handleConfirm = async () => {
    setIsResetting(true)

    try {
      const result = await onConfirm()

      setTempPassword(result.tempPassword)
    } catch {
      // Error toast is shown by the mutation
    } finally {
      setIsResetting(false)
    }
  }

  const handleCopy = async () => {
    await copyToClipboard(tempPassword)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION)
  }

  if (tempPassword) {
    return (
      <div className='w-full'>
        <p className='mb-4 text-sm text-gray-600'>{translate('admin.customers.resetPassword.done', { name: customerName })}</p>
        <div className='mb-2 flex items-center gap-2'>
          <p className='flex-1 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-2 text-center text-xl font-bold tracking-widest text-primary break-all'>
            {tempPassword}
          </p>
          <button
            type='button'
            onClick={handleCopy}
            aria-label={translate('admin.customers.resetPassword.copy')}
            title={translate('admin.customers.resetPassword.copy')}
            className='flex size-11 shrink-0 items-center justify-center rounded-xl border border-border text-gray-600 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
          >
            {isCopied ? <CheckIcon className='size-5 text-emerald-600' strokeWidth={2.5} /> : <CopyIcon className='size-5' />}
          </button>
        </div>
        {isCopied && <p className='mb-2 text-xs font-medium text-emerald-600'>{translate('common.copied')}</p>}
        <p className='mb-6 text-xs text-gray-500'>{translate('admin.customers.resetPassword.hint')}</p>
        <div className='flex justify-end'>
          <MyButton variant='primary' onClick={() => close()}>
            {translate('common.close')}
          </MyButton>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <p className='mb-6 text-sm text-gray-600'>{translate('admin.customers.resetPassword.confirm', { name: customerName })}</p>
      <div className='flex justify-end gap-3'>
        <MyButton variant='outline' onClick={() => close()} disabled={isResetting}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton variant='primary' loading={isResetting} onClick={handleConfirm}>
          {translate('admin.customers.resetPassword.submit')}
        </MyButton>
      </div>
    </div>
  )
}

export default AdminResetPassword
