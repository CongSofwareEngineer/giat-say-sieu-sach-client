'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import { CheckIcon } from '@/components/Icons/Check'
import SeoJsonLd from '@/components/SeoJsonLd'
import LaundryForm from '@/components/Chat/LaundryForm'
import useLanguage from '@/hooks/useLanguage'
import useLaundryBooking from '@/hooks/useLaundryBooking'
import { breadcrumbSchema, webPageSchema } from '@/config/seo'
import { BOOKING_SOURCE } from '@/constants/app'
import { getOrderCode } from '@/services/order'
import { toast } from '@/utils/toast'

const BookingPage = () => {
  const { translate } = useLanguage()
  const router = useRouter()
  const [orderCode, setOrderCode] = useState('')

  // Same form + submit logic as the chat booking form
  const { formData, addresses, activePlans, selectedPlan, estimatedPrice, isBooking, handleChange, resetForm, submitBooking } = useLaundryBooking(
    BOOKING_SOURCE.PAGE
  )

  const handleSubmit = async () => {
    if (!selectedPlan) {
      toast({ message: translate('chat.serviceNotFound'), type: 'error' })

      return
    }

    try {
      const result = await submitBooking()

      if (!result) return

      setOrderCode(getOrderCode(result.order.id))
      resetForm()
    } catch {
      toast({ message: translate('booking.error'), type: 'error' })
    }
  }

  if (orderCode) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center py-12 px-4'>
        <MyCard className='max-w-md w-full'>
          <MyCardBody className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-secondary text-white shadow-[0_12px_28px_-10px_rgba(0,127,106,0.6)]'>
              <CheckIcon className='size-8' strokeWidth={2.5} />
            </div>
            <h2 className='text-2xl font-bold text-text mb-2'>{translate('booking.success.title')}</h2>
            <p className='text-gray-600 mb-4'>{translate('booking.success.message')}</p>
            <p className='text-2xl font-bold text-primary mb-6'>{orderCode}</p>
            <div className='flex flex-col gap-3'>
              <MyButton variant='primary' className='w-full' onClick={() => router.push(`/track-order?code=${orderCode}`)}>
                {translate('booking.success.track')}
              </MyButton>
              <MyButton variant='default' className='w-full' onClick={() => setOrderCode('')}>
                {translate('booking.success.backHome')}
              </MyButton>
            </div>
          </MyCardBody>
        </MyCard>
      </div>
    )
  }

  return (
    <div className='py-12 px-4'>
      <SeoJsonLd data={webPageSchema('Đặt lịch giặt ủi tại nhà', '/booking', 'Đặt lịch giặt ủi online, lấy đồ tận nhà miễn phí tại TP.HCM')} />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Đặt lịch', path: '/booking' },
        ])}
      />
      <div className='max-w-2xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-text mb-2'>{translate('booking.title')}</h1>
          <p className='text-gray-600'>{translate('booking.subtitle')}</p>
        </div>

        <LaundryForm
          formData={formData}
          addresses={addresses}
          plans={activePlans}
          estimatedPrice={estimatedPrice}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isSubmitting={isBooking}
          showTitle={false}
          className='p-6 shadow-sm'
        />
      </div>
    </div>
  )
}

export default BookingPage
