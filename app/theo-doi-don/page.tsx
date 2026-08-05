'use client'

import { useState } from 'react'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyBadge from '@/components/MyBadge'
import SeoJsonLd from '@/components/SeoJsonLd'
import { ORDER_STATUS } from '@/constants/app'
import useLanguage from '@/hooks/useLanguage'
import { breadcrumbSchema, webPageSchema } from '@/config/seo'

type TrackingResult = {
  code: string
  status: ORDER_STATUS
  pickupDate: string
  deliveryDate: string
  service: string
  weight: number
  totalPrice: number
  eta: string
} | null

const TrackingPage = () => {
  const { translate } = useLanguage()
  const [phone, setPhone] = useState('')
  const [orderCode, setOrderCode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<TrackingResult>(null)
  const [error, setError] = useState('')

  const statusSteps: ORDER_STATUS[] = [
    ORDER_STATUS.CREATED,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PICKED_UP,
    ORDER_STATUS.WASHING,
    ORDER_STATUS.DRYING,
    ORDER_STATUS.IRONING,
    ORDER_STATUS.FOLDING,
    ORDER_STATUS.PACKAGING,
    ORDER_STATUS.DELIVERING,
    ORDER_STATUS.COMPLETED,
  ]

  const getProgressPercentage = (status: ORDER_STATUS): number => {
    const index = statusSteps.indexOf(status)

    return Math.round(((index + 1) / statusSteps.length) * 100)
  }

  const getStatusBadgeVariant = (status: ORDER_STATUS) => {
    switch (status) {
      case ORDER_STATUS.COMPLETED:
        return 'success'
      case ORDER_STATUS.DELIVERING:
      case ORDER_STATUS.WASHING:
      case ORDER_STATUS.DRYING:
      case ORDER_STATUS.IRONING:
      case ORDER_STATUS.FOLDING:
      case ORDER_STATUS.PACKAGING:
        return 'warning'
      default:
        return 'info'
    }
  }

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone.trim() || !orderCode.trim()) return

    setIsSearching(true)
    setError('')
    setResult(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock data
      const mockResult: TrackingResult = {
        code: orderCode,
        status: ORDER_STATUS.WASHING,
        pickupDate: '2024-01-15',
        deliveryDate: '2024-01-16',
        service: 'Giặt sấy',
        weight: 5,
        totalPrice: 60000,
        eta: '18:30',
      }

      setResult(mockResult)
    } catch {
      setError(translate('tracking.result.notFound'))
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className='py-12 px-4'>
      <SeoJsonLd data={webPageSchema('Theo dõi đơn hàng giặt ủi', '/theo-doi-don', 'Tra cứu tình trạng đơn hàng giặt ủi theo thời gian thực')} />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Theo dõi đơn', path: '/theo-doi-don' },
        ])}
      />
      <div className='max-w-2xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-text mb-2'>{translate('tracking.title')}</h1>
          <p className='text-gray-600'>{translate('tracking.subtitle')}</p>
        </div>

        <MyCard className='mb-8'>
          <MyCardBody>
            <form onSubmit={handleTrack} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <MyInput
                  label={translate('tracking.form.phone')}
                  placeholder={translate('tracking.form.phonePlaceholder')}
                  type='tel'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <MyInput
                  label={translate('tracking.form.orderCode')}
                  placeholder={translate('tracking.form.orderCodePlaceholder')}
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                />
              </div>
              <MyButton type='submit' variant='primary' loading={isSearching} className='w-full'>
                {translate('tracking.form.track')}
              </MyButton>
            </form>
          </MyCardBody>
        </MyCard>

        {error && (
          <MyCard className='mb-8'>
            <MyCardBody className='text-center'>
              <p className='text-red-500'>{error}</p>
            </MyCardBody>
          </MyCard>
        )}

        {result && (
          <MyCard>
            <MyCardBody>
              <h2 className='text-xl font-bold text-text mb-6'>{translate('tracking.result.title')}</h2>

              {/* Progress Bar */}
              <div className='mb-8'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-gray-600'>{translate('tracking.result.progress')}</span>
                  <span className='text-sm font-semibold text-primary'>{getProgressPercentage(result.status)}%</span>
                </div>
                <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
                  <div className='h-full bg-primary transition-all duration-500' style={{ width: `${getProgressPercentage(result.status)}%` }} />
                </div>
              </div>

              {/* Status Timeline */}
              <div className='mb-8'>
                <div className='space-y-3'>
                  {statusSteps.map((status, index) => {
                    const currentIndex = statusSteps.indexOf(result.status)
                    const isCompleted = index <= currentIndex
                    const isCurrent = index === currentIndex

                    return (
                      <div key={status} className={`flex items-center gap-3 ${isCompleted ? 'text-text' : 'text-gray-400'}`}>
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            isCurrent ? 'bg-primary ring-4 ring-primary/20' : isCompleted ? 'bg-primary' : 'bg-gray-300'
                          }`}
                        />
                        <span className={`text-sm ${isCurrent ? 'font-semibold text-primary' : ''}`}>{translate(`tracking.status.${status}`)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Info */}
              <div className='grid grid-cols-2 gap-4 pt-6 border-t border-border'>
                <div>
                  <p className='text-sm text-gray-500'>{translate('tracking.result.code')}</p>
                  <p className='font-semibold text-text'>{result.code}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>{translate('tracking.result.status')}</p>
                  <MyBadge variant={getStatusBadgeVariant(result.status)}>{translate(`tracking.status.${result.status}`)}</MyBadge>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>{translate('tracking.result.service')}</p>
                  <p className='font-semibold text-text'>{result.service}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>{translate('tracking.result.weight')}</p>
                  <p className='font-semibold text-text'>{result.weight} kg</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>{translate('tracking.result.totalPrice')}</p>
                  <p className='font-semibold text-primary'>{result.totalPrice.toLocaleString()}đ</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>{translate('tracking.result.eta')}</p>
                  <p className='font-semibold text-text'>
                    {translate('tracking.result.eta')}: {result.eta}
                  </p>
                </div>
              </div>
            </MyCardBody>
          </MyCard>
        )}
      </div>
    </div>
  )
}

export default TrackingPage
