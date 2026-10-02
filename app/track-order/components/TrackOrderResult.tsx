'use client'

import type { ComponentType, SVGProps } from 'react'

import { useQuery } from '@tanstack/react-query'

import CancelOrderConfirm from '@/components/CancelOrderConfirm'
import MyBadge from '@/components/MyBadge'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import CalendarIcon from '@/components/Icons/Calendar'
import { CheckBadgeIcon } from '@/components/Icons/CheckBadge'
import { CheckIcon } from '@/components/Icons/Check'
import InboxIcon from '@/components/Icons/Inbox'
import SparklesIcon from '@/components/Icons/Home/Sparkles'
import { SunIcon } from '@/components/Icons/Sun'
import { XMarkIcon } from '@/components/Icons/XMark'
import { CANCELLABLE_ORDER_STATUS, ORDER_STATUS, ORDER_STATUS_STEPS } from '@/constants/app'
import { QUERY_KEYS } from '@/constants/reactQuery'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import useUser from '@/hooks/useUser'
import OrderService, { getOrderCode, PublicOrderItem } from '@/services/order'
import { formatDate } from '@/utils/date'
import { getOrderStatusBadgeVariant } from '@/utils/functions'
import { cn } from '@/utils/tailwind'
import { toast } from '@/utils/toast'

const STEP_ICONS: Record<ORDER_STATUS, ComponentType<SVGProps<SVGSVGElement>>> = {
  [ORDER_STATUS.PENDING]: CalendarIcon,
  [ORDER_STATUS.RECEIVED]: InboxIcon,
  [ORDER_STATUS.WASHING]: SparklesIcon,
  [ORDER_STATUS.DRYING]: SunIcon,
  [ORDER_STATUS.READY]: CheckBadgeIcon,
  [ORDER_STATUS.COMPLETED]: CheckIcon,
  [ORDER_STATUS.CANCELLED]: XMarkIcon,
}

type TrackOrderResultProps = {
  order: PublicOrderItem
  // Called after the owner cancelled the order, so the list can show the new status
  onCancelled?: (orderId: string) => void
}

const TrackOrderResult = ({ order, onCancelled }: TrackOrderResultProps) => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const { isLogin, user } = useUser()

  const orderCode = getOrderCode(order.id)
  const isCancelled = order.status === ORDER_STATUS.CANCELLED
  const currentIndex = ORDER_STATUS_STEPS.indexOf(order.status)
  const progress = currentIndex < 0 ? 0 : Math.round(((currentIndex + 1) / ORDER_STATUS_STEPS.length) * 100)
  const formatPrice = (price: number) => translate('tracking.result.price', { price: price.toLocaleString('vi-VN') })

  // Only the logged-in owner may cancel: the "my order" endpoint 404s for anyone else
  const isCancellable = order.status === CANCELLABLE_ORDER_STATUS
  const { data: ownOrder } = useQuery({
    queryKey: [QUERY_KEYS.getMyOrder, order.id, user?.id ?? ''],
    queryFn: () => OrderService.getMyOrder(order.id),
    enabled: isLogin && !!user?.id && isCancellable,
    retry: false,
    staleTime: 60_000,
  })
  const canCancel = isCancellable && !!ownOrder

  const openCancelConfirm = () => {
    open({
      mode: 'modal',
      title: translate('myOrders.cancel.title'),
      children: (
        <CancelOrderConfirm
          orderCode={orderCode}
          onClose={close}
          onConfirm={async () => {
            await OrderService.cancelMyOrder(order.id)
            close()
            toast({ message: translate('myOrders.cancel.success'), type: 'default' })
            onCancelled?.(order.id)
          }}
        />
      ),
    })
  }

  return (
    <MyCard className='overflow-hidden'>
      {/* Header: code, status and overall progress */}
      <div className='bg-gradient-to-br from-primary to-secondary px-6 py-5 text-white'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <p className='text-xs font-medium uppercase tracking-wider text-white/75'>{translate('tracking.result.orderCode')}</p>
            <h2 className='text-2xl font-extrabold tracking-wide'>#{orderCode}</h2>
            <p className='mt-1 text-xs text-white/75'>
              {translate('tracking.result.createdAt')}: {formatDate(order.createdAt) || '—'}
            </p>
          </div>
          <MyBadge variant={getOrderStatusBadgeVariant(order.status)} className='bg-white ring-white/40'>
            {translate(`tracking.status.${order.status}`)}
          </MyBadge>
        </div>

        {!isCancelled && (
          <div className='mt-5'>
            <div className='mb-1.5 flex items-center justify-between text-xs font-medium text-white/85'>
              <span>{translate('tracking.result.progress')}</span>
              <span>{progress}%</span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-white/20'>
              <div className='h-full rounded-full bg-white transition-all duration-700' style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <MyCardBody>
        {isCancelled ? (
          <div className='mb-6 flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-4'>
            <div className='flex size-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600'>
              <XMarkIcon className='size-6' strokeWidth={2} />
            </div>
            <div>
              <p className='font-semibold text-red-700'>{translate('tracking.status.CANCELLED')}</p>
              <p className='text-sm text-red-600'>{translate('tracking.result.cancelled')}</p>
            </div>
          </div>
        ) : (
          <ol className='mb-6'>
            {ORDER_STATUS_STEPS.map((status, index) => {
              const Icon = STEP_ICONS[status]
              const isDone = index < currentIndex
              const isCurrent = index === currentIndex
              const isLast = index === ORDER_STATUS_STEPS.length - 1

              return (
                <li key={status} className='relative flex gap-4 pb-6 last:pb-0'>
                  {!isLast && (
                    <span
                      aria-hidden
                      className={cn('absolute left-5 top-11 -bottom-1 w-0.5 -translate-x-1/2 rounded-full', isDone ? 'bg-primary' : 'bg-gray-200')}
                    />
                  )}
                  <div
                    className={cn(
                      'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full transition-all',
                      isDone && 'bg-primary text-white',
                      isCurrent &&
                        'bg-gradient-to-br from-primary to-secondary text-white shadow-[0_8px_20px_-6px_rgba(10,111,135,0.6)] ring-4 ring-primary/15',
                      !isDone && !isCurrent && 'border-2 border-dashed border-gray-200 bg-white text-gray-300'
                    )}
                  >
                    {isCurrent && <span className='absolute inset-0 animate-ping rounded-full bg-primary/25' />}
                    {isDone ? <CheckIcon className='size-5' strokeWidth={2.5} /> : <Icon className='size-5' strokeWidth={isCurrent ? 2 : 1.5} />}
                  </div>
                  <div className={cn('min-w-0 pt-1.5', !isDone && !isCurrent && 'opacity-60')}>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className={cn('text-sm font-semibold', isCurrent ? 'text-primary' : 'text-text')}>
                        {translate(`tracking.status.${status}`)}
                      </p>
                      {isCurrent && (
                        <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary'>
                          {translate('tracking.result.current')}
                        </span>
                      )}
                    </div>
                    <p className='mt-0.5 text-xs text-gray-500'>{translate(`tracking.stepDesc.${status}`)}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        <div className='space-y-4 rounded-2xl bg-gray-50/80 p-4'>
          <div>
            <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500'>{translate('tracking.result.service')}</p>
            {order.items?.length ? (
              <ul className='space-y-1.5'>
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

          {!!order.discountAmount && order.discountAmount > 0 && (
            <div className='flex items-center justify-between gap-4 text-sm text-emerald-700'>
              <span>{translate('tracking.result.discount')}</span>
              <span className='font-medium'>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}

          <div className='flex items-center justify-between gap-4 border-t border-border pt-3'>
            <span className='text-sm font-semibold text-text'>{translate('tracking.result.totalPrice')}</span>
            <span className='text-lg font-bold text-primary'>{formatPrice(order.finalAmount)}</span>
          </div>
        </div>

        {canCancel && (
          <div className='mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-xs text-gray-500'>{translate('myOrders.cancel.hint')}</p>
            <MyButton variant='outline' className='border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50' onClick={openCancelConfirm}>
              {translate('myOrders.cancel.button')}
            </MyButton>
          </div>
        )}
      </MyCardBody>
    </MyCard>
  )
}

export default TrackOrderResult
