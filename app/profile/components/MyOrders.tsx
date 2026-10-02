'use client'

import { useState } from 'react'
import Link from 'next/link'

import CancelOrderConfirm from '@/components/CancelOrderConfirm'
import MyBadge from '@/components/MyBadge'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyEmpty from '@/components/MyEmpty'
import MyLoading from '@/components/MyLoading'
import MyPagination from '@/components/MyPagination'
import { CANCELLABLE_ORDER_STATUS } from '@/constants/app'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import useGetMyOrders from '@/hooks/reactQuery/useGetMyOrders'
import { getOrderCode, OrderItem } from '@/services/order'
import { formatDate } from '@/utils/date'
import { getOrderStatusBadgeVariant } from '@/utils/functions'
import { toast } from '@/utils/toast'

const MyOrders = () => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const [page, setPage] = useState(1)
  const { orders, totalPages, isLoading, isError, refetch, cancelOrder } = useGetMyOrders(page)

  const formatPrice = (price: number) => translate('tracking.result.price', { price: (price ?? 0).toLocaleString('vi-VN') })

  const openCancelConfirm = (order: OrderItem) => {
    open({
      mode: 'modal',
      title: translate('myOrders.cancel.title'),
      children: (
        <CancelOrderConfirm
          orderCode={getOrderCode(order.id)}
          onClose={close}
          onConfirm={async () => {
            await cancelOrder(order.id)
            close()
            toast({ message: translate('myOrders.cancel.success'), type: 'default' })
          }}
        />
      ),
    })
  }

  return (
    <MyCard>
      <MyCardHeader>
        <h2 className='text-lg font-bold text-text'>{translate('myOrders.title')}</h2>
        <p className='text-sm text-gray-500'>{translate('myOrders.subtitle')}</p>
      </MyCardHeader>
      <MyCardBody>
        {isLoading ? (
          <MyLoading />
        ) : isError ? (
          <MyEmpty
            message={translate('myOrders.loadError')}
            action={
              <MyButton variant='outline' onClick={() => refetch()}>
                {translate('common.retry')}
              </MyButton>
            }
          />
        ) : orders.length === 0 ? (
          <MyEmpty
            message={translate('myOrders.empty')}
            action={
              <Link href='/booking'>
                <MyButton variant='primary'>{translate('myOrders.bookNow')}</MyButton>
              </Link>
            }
          />
        ) : (
          <div className='space-y-4'>
            {orders.map((order) => {
              const orderCode = getOrderCode(order.id)
              const hasDiscount = (order.discountAmount ?? 0) > 0

              return (
                <div key={order.id} className='rounded-2xl border border-border p-4 transition-colors hover:border-primary/30'>
                  <div className='flex flex-wrap items-start justify-between gap-2'>
                    <div>
                      <p className='font-bold text-text'>#{orderCode}</p>
                      <p className='text-xs text-gray-500'>{formatDate(order.createdAt) || '—'}</p>
                    </div>
                    <MyBadge variant={getOrderStatusBadgeVariant(order.status)}>{translate(`tracking.status.${order.status}`)}</MyBadge>
                  </div>

                  <ul className='mt-3 space-y-1 text-sm text-gray-600'>
                    {order.items?.map((item, index) => (
                      <li key={`${item.categoryId}-${index}`}>
                        {item.categoryName} · {translate('tracking.result.quantity', { quantity: item.quantity })}
                      </li>
                    ))}
                  </ul>

                  <div className='mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-3'>
                    <div>
                      {hasDiscount && <p className='text-xs text-gray-400 line-through'>{formatPrice(order.totalAmount)}</p>}
                      <p className='text-lg font-bold text-primary'>{formatPrice(order.finalAmount)}</p>
                      {(order.pointsUsed ?? 0) > 0 && (
                        <p className='text-xs text-emerald-700'>
                          {translate('myOrders.pointsUsed', { points: order.pointsUsed?.toLocaleString('vi-VN') })}
                        </p>
                      )}
                    </div>
                    <div className='flex gap-2'>
                      {order.status === CANCELLABLE_ORDER_STATUS && (
                        <MyButton
                          variant='outline'

                          className='border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50'
                          onClick={() => openCancelConfirm(order)}
                        >
                          {translate('myOrders.cancel.button')}
                        </MyButton>
                      )}
                      <Link href={`/track-order?code=${orderCode}`}>
                        <MyButton variant='primary'>{translate('myOrders.track')}</MyButton>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className='flex justify-center'>
              <MyPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}
      </MyCardBody>
    </MyCard>
  )
}

export default MyOrders
