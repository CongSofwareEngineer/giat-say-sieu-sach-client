'use client'

import MyBadge, { MyBadgeVariant } from '@/components/MyBadge'
import MyCard, { MyCardBody } from '@/components/MyCard'
import { ORDER_STATUS } from '@/constants/app'
import useLanguage from '@/hooks/useLanguage'
import { getOrderCode, PublicOrderItem } from '@/services/order'
import { formatDate } from '@/utils/date'

// Normal order flow; CANCELLED is shown separately
const STATUS_STEPS: ORDER_STATUS[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.RECEIVED,
  ORDER_STATUS.WASHING,
  ORDER_STATUS.DRYING,
  ORDER_STATUS.READY,
  ORDER_STATUS.COMPLETED,
]

const getStatusBadgeVariant = (status: ORDER_STATUS): MyBadgeVariant => {
  switch (status) {
    case ORDER_STATUS.COMPLETED:
      return 'success'
    case ORDER_STATUS.WASHING:
    case ORDER_STATUS.DRYING:
    case ORDER_STATUS.READY:
      return 'warning'
    case ORDER_STATUS.CANCELLED:
      return 'error'
    default:
      return 'info'
  }
}

type TrackOrderResultProps = {
  order: PublicOrderItem
}

const TrackOrderResult = ({ order }: TrackOrderResultProps) => {
  const { translate } = useLanguage()
  const isCancelled = order.status === ORDER_STATUS.CANCELLED
  const currentIndex = STATUS_STEPS.indexOf(order.status)
  const progress = currentIndex < 0 ? 0 : Math.round(((currentIndex + 1) / STATUS_STEPS.length) * 100)
  const formatPrice = (price: number) => translate('tracking.result.price', { price: price.toLocaleString('vi-VN') })

  return (
    <MyCard>
      <MyCardBody>
        <div className='flex flex-wrap items-center justify-between gap-2 mb-6'>
          <h2 className='text-xl font-bold text-text'>#{getOrderCode(order.id)}</h2>
          <MyBadge variant={getStatusBadgeVariant(order.status)}>{translate(`tracking.status.${order.status}`)}</MyBadge>
        </div>

        {isCancelled ? (
          <p className='mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600'>{translate('tracking.result.cancelled')}</p>
        ) : (
          <>
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm text-gray-600'>{translate('tracking.result.progress')}</span>
                <span className='text-sm font-semibold text-primary'>{progress}%</span>
              </div>
              <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
                <div className='h-full bg-primary transition-all duration-500' style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className='mb-6 space-y-3'>
              {STATUS_STEPS.map((status, index) => {
                const isCompleted = index <= currentIndex
                const isCurrent = index === currentIndex

                return (
                  <div key={status} className={`flex items-center gap-3 ${isCompleted ? 'text-text' : 'text-gray-500'}`}>
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
          </>
        )}

        <div className='pt-6 border-t border-border space-y-4'>
          <div>
            <p className='text-sm text-gray-500 mb-2'>{translate('tracking.result.service')}</p>
            {order.items?.length ? (
              <ul className='space-y-1'>
                {order.items.map((item, index) => (
                  <li key={`${item.categoryName}-${index}`} className='flex items-center justify-between gap-4 text-sm'>
                    <span className='text-text'>
                      {item.categoryName} · {translate('tracking.result.quantity', { quantity: item.quantity })}
                    </span>
                    <span className='font-medium text-text'>{formatPrice(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-text'>—</p>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500'>{translate('tracking.result.totalPrice')}</p>
              <p className='font-semibold text-primary'>{formatPrice(order.finalAmount)}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>{translate('tracking.result.createdAt')}</p>
              <p className='font-semibold text-text'>{formatDate(order.createdAt) || '—'}</p>
            </div>
          </div>
        </div>
      </MyCardBody>
    </MyCard>
  )
}

export default TrackOrderResult
