'use client'

import { useState } from 'react'

import MyButton from '@/components/MyButton'
import useLanguage from '@/hooks/useLanguage'
import { isValidVnPhone } from '@/utils/phone'

type OrderPhoneFormProps = {
  isSubmitting?: boolean
  onSubmit: (phone: string) => void
  onCancel: () => void
}

// Phone input shown to guests so they can look up their orders by phone
const OrderPhoneForm = ({ isSubmitting = false, onSubmit, onCancel }: OrderPhoneFormProps) => {
  const { translate } = useLanguage()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidVnPhone(phone)) {
      setError(translate('chat.orderLookup.invalidPhone'))

      return
    }

    onSubmit(phone.trim())
  }

  return (
    <form onSubmit={handleSubmit} className='bg-white border border-border w-full rounded-xl p-4 space-y-3'>
      <h3 className='font-semibold text-primary'>{translate('chat.orderLookup.title')}</h3>

      <div>
        <label className='block text-xs font-medium text-gray-700 mb-1'>{translate('common.phone')}</label>
        <input
          type='tel'
          value={phone}
          autoFocus
          onChange={(e) => {
            setPhone(e.target.value)
            setError('')
          }}
          placeholder={translate('chat.laundryForm.phonePlaceholder')}
          className='w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20'
        />
        {error && <p className='mt-1 text-xs text-red-600'>{error}</p>}
      </div>

      <div className='flex gap-2'>
        <MyButton type='button' onClick={onCancel} variant='outline' className='flex-1 py-2 text-sm'>
          {translate('common.cancel')}
        </MyButton>
        <MyButton type='submit' loading={isSubmitting} disabled={!phone.trim()} className='flex-1 py-2 text-sm'>
          {translate('chat.orderLookup.submit')}
        </MyButton>
      </div>
    </form>
  )
}

export default OrderPhoneForm
