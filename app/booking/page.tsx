'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import MyInput from '@/components/MyInput'
import MyTextarea from '@/components/MyTextarea'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MySelect from '@/components/MySelect'
import SeoJsonLd from '@/components/SeoJsonLd'
import useLanguage from '@/hooks/useLanguage'
import { breadcrumbSchema, webPageSchema } from '@/config/seo'

type BookingFormData = {
  fullName: string
  phone: string
  email: string
  pickupAddress: string
  deliveryAddress: string
  pickupDate: string
  pickupTime: string
  service: string
  weight: string
  note: string
}

type BookingErrors = Partial<Record<keyof BookingFormData, string>>

const BookingPage = () => {
  const { translate } = useLanguage()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderCode, setOrderCode] = useState('')
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phone: '',
    email: '',
    pickupAddress: '',
    deliveryAddress: '',
    pickupDate: '',
    pickupTime: '',
    service: '',
    weight: '',
    note: '',
  })
  const [errors, setErrors] = useState<BookingErrors>({})

  const serviceOptions = [
    { value: 'giat-thuong', label: 'Giặt thường - 8.000đ/kg' },
    { value: 'giat-say', label: 'Giặt sấy - 12.000đ/kg' },
    { value: 'giat-hap', label: 'Giặt hấp - 15.000đ/kg' },
    { value: 'ui-do', label: 'Ủi đồ - 5.000đ/kg' },
  ]

  const timeOptions = [
    { value: '08:00', label: '08:00' },
    { value: '09:00', label: '09:00' },
    { value: '10:00', label: '10:00' },
    { value: '11:00', label: '11:00' },
    { value: '12:00', label: '12:00' },
    { value: '13:00', label: '13:00' },
    { value: '14:00', label: '14:00' },
    { value: '15:00', label: '15:00' },
    { value: '16:00', label: '16:00' },
    { value: '17:00', label: '17:00' },
    { value: '18:00', label: '18:00' },
    { value: '19:00', label: '19:00' },
  ]

  const validate = (): boolean => {
    const newErrors: BookingErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = translate('booking.validation.nameRequired')
    }

    if (!formData.phone.trim()) {
      newErrors.phone = translate('booking.validation.phoneRequired')
    } else if (!/^(0[0-9]{9})$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = translate('booking.validation.phoneInvalid')
    }

    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = translate('booking.validation.pickupAddressRequired')
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = translate('booking.validation.deliveryAddressRequired')
    }

    if (!formData.pickupDate) {
      newErrors.pickupDate = translate('booking.validation.dateRequired')
    }

    if (!formData.pickupTime) {
      newErrors.pickupTime = translate('booking.validation.timeRequired')
    }

    if (!formData.service) {
      newErrors.service = translate('booking.validation.serviceRequired')
    }

    if (!formData.weight) {
      newErrors.weight = translate('booking.validation.weightRequired')
    } else if (Number(formData.weight) < 1) {
      newErrors.weight = translate('booking.validation.weightMin')
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const code = `GS${Date.now().toString().slice(-6)}`

      setOrderCode(code)
      setIsSuccess(true)
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center py-12 px-4'>
        <MyCard className='max-w-md w-full'>
          <MyCardBody className='text-center'>
            <div className='w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center'>
              <span className='text-3xl'>✓</span>
            </div>
            <h2 className='text-2xl font-bold text-text mb-2'>{translate('booking.success.title')}</h2>
            <p className='text-gray-600 mb-4'>{translate('booking.success.message')}</p>
            <p className='text-2xl font-bold text-primary mb-6'>{orderCode}</p>
            <div className='flex flex-col gap-3'>
              <MyButton variant='primary' className='w-full' onClick={() => router.push(`/track-order?code=${orderCode}`)}>
                {translate('booking.success.track')}
              </MyButton>
              <MyButton
                variant='default'
                className='w-full'
                onClick={() => {
                  setIsSuccess(false)
                  setFormData({
                    fullName: '',
                    phone: '',
                    email: '',
                    pickupAddress: '',
                    deliveryAddress: '',
                    pickupDate: '',
                    pickupTime: '',
                    service: '',
                    weight: '',
                    note: '',
                  })
                }}
              >
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

        <MyCard>
          <MyCardBody>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <MyInput
                  label={translate('booking.form.fullName')}
                  placeholder={translate('booking.form.fullNamePlaceholder')}
                  required
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  error={errors.fullName}
                />
                <MyInput
                  label={translate('booking.form.phone')}
                  placeholder={translate('booking.form.phonePlaceholder')}
                  required
                  type='tel'
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  error={errors.phone}
                />
              </div>

              <MyInput
                label={translate('booking.form.email')}
                placeholder={translate('booking.form.emailPlaceholder')}
                type='email'
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />

              <MyInput
                label={translate('booking.form.pickupAddress')}
                placeholder={translate('booking.form.pickupAddressPlaceholder')}
                required
                value={formData.pickupAddress}
                onChange={(e) => handleChange('pickupAddress', e.target.value)}
                error={errors.pickupAddress}
              />

              <MyInput
                label={translate('booking.form.deliveryAddress')}
                placeholder={translate('booking.form.deliveryAddressPlaceholder')}
                required
                value={formData.deliveryAddress}
                onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                error={errors.deliveryAddress}
              />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <MyInput
                  label={translate('booking.form.pickupDate')}
                  type='date'
                  required
                  value={formData.pickupDate}
                  onChange={(e) => handleChange('pickupDate', e.target.value)}
                  error={errors.pickupDate}
                />
                <div>
                  <label className='block text-sm font-medium text-text mb-1.5'>
                    {translate('booking.form.pickupTime')}
                    <span className='text-red-600 ml-1'>*</span>
                  </label>
                  <MySelect
                    data={timeOptions}
                    value={formData.pickupTime}
                    placeholder='Chọn giờ'
                    onChange={(item) => handleChange('pickupTime', item.value as string)}
                  />
                  {errors.pickupTime && <p className='mt-1 text-sm text-red-600'>{errors.pickupTime}</p>}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-text mb-1.5'>
                    {translate('booking.form.service')}
                    <span className='text-red-600 ml-1'>*</span>
                  </label>
                  <MySelect
                    data={serviceOptions}
                    value={formData.service}
                    placeholder={translate('booking.form.selectService')}
                    onChange={(item) => handleChange('service', item.value as string)}
                  />
                  {errors.service && <p className='mt-1 text-sm text-red-600'>{errors.service}</p>}
                </div>
                <MyInput
                  label={translate('booking.form.weight')}
                  placeholder={translate('booking.form.weightPlaceholder')}
                  required
                  type='number'
                  min='1'
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  error={errors.weight}
                />
              </div>

              <MyTextarea
                label={translate('booking.form.note')}
                placeholder={translate('booking.form.notePlaceholder')}
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
              />

              <MyButton type='submit' variant='primary' size='large' loading={isSubmitting} className='w-full'>
                {translate('booking.form.submit')}
              </MyButton>
            </form>
          </MyCardBody>
        </MyCard>
      </div>
    </div>
  )
}

export default BookingPage
