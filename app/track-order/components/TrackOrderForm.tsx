'use client'

import { useState } from 'react'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import useLanguage from '@/hooks/useLanguage'
import { normalizeOrderCode } from '@/services/order'
import { isValidVnPhone } from '@/utils/phone'

export type TrackOrderQuery = {
  code: string
  phone: string
}

type TrackOrderFormProps = {
  initialCode?: string
  loading: boolean
  onSubmit: (query: TrackOrderQuery) => void
}

const TrackOrderForm = ({ initialCode = '', loading, onSubmit }: TrackOrderFormProps) => {
  const { translate } = useLanguage()
  const [phone, setPhone] = useState('')
  const [orderCode, setOrderCode] = useState(initialCode)
  const [error, setError] = useState('')

  // Same rule as the chat: the order code wins, the phone is only used without a code
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const code = normalizeOrderCode(orderCode)
    const phoneValue = phone.trim()

    if (!code && !phoneValue) return setError(translate('tracking.form.requireOne'))
    if (!code && !isValidVnPhone(phoneValue)) return setError(translate('tracking.form.invalidPhone'))

    setError('')
    onSubmit({ code, phone: phoneValue })
  }

  return (
    <MyCard className='mb-8'>
      <MyCardBody>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <MyInput
              label={translate('tracking.form.orderCode')}
              placeholder={translate('tracking.form.orderCodePlaceholder')}
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
            />
            <MyInput
              label={translate('tracking.form.phone')}
              placeholder={translate('tracking.form.phonePlaceholder')}
              type='tel'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <p className='text-sm text-gray-500'>{translate('tracking.form.hint')}</p>
          {error && <p className='text-sm text-red-600'>{error}</p>}
          <MyButton type='submit' variant='primary' loading={loading} className='w-full'>
            {translate('tracking.form.track')}
          </MyButton>
        </form>
      </MyCardBody>
    </MyCard>
  )
}

export default TrackOrderForm
