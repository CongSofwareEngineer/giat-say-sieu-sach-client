'use client'

import MyButton from '@/components/MyButton'
import { INFO_CONTACT, SITE_CONFIG } from '@/constants/app'
import useLanguage from '@/hooks/useLanguage'
import useUser from '@/hooks/useUser'
import { getOrderCode, OrderItem } from '@/services/order'
import { formatDate } from '@/utils/date'

export type OrderInvoiceProps = {
  order: OrderItem
}

// Receipt of one order (open it with useModalDrawer); only `.print-area` is printed (see app/globals.css)
const OrderInvoice = ({ order }: OrderInvoiceProps) => {
  const { translate } = useLanguage()
  const { user } = useUser()

  const formatPrice = (price: number) => translate('tracking.result.price', { price: (price ?? 0).toLocaleString('vi-VN') })

  const weightDiscount = order.weightDiscount ?? 0
  const pointsDiscount = order.pointsDiscount ?? 0
  // Server only stores the total discount: the promotion part is what is left after the weight and points parts
  const promotionDiscount = Math.max((order.discountAmount ?? 0) - weightDiscount - pointsDiscount, 0)

  const discountRows = [
    { key: 'weight', label: translate('orders.invoice.weightDiscount'), amount: weightDiscount },
    {
      key: 'promotion',
      label: order.promotionCode
        ? translate('orders.invoice.promotionWithCode', { code: order.promotionCode })
        : translate('orders.invoice.promotion'),
      amount: promotionDiscount,
    },
    {
      key: 'points',
      label: translate('orders.invoice.pointsDiscount', { points: (order.pointsUsed ?? 0).toLocaleString('vi-VN') }),
      amount: pointsDiscount,
    },
  ].filter((row) => row.amount > 0)

  return (
    <div className='w-full'>
      <div className='print-area space-y-5 text-sm text-text'>
        <div className='flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4'>
          <div>
            <p className='text-lg font-bold text-primary'>{SITE_CONFIG.title}</p>
            <p className='text-xs text-gray-500'>{INFO_CONTACT.Address}</p>
            <p className='text-xs text-gray-500'>{INFO_CONTACT.Phone}</p>
          </div>
          <div className='text-right'>
            <p className='font-bold uppercase tracking-wide'>{translate('orders.invoice.title')}</p>
            <p className='text-xs text-gray-500'>
              {translate('orders.invoice.code')}: <span className='font-semibold text-text'>#{getOrderCode(order)}</span>
            </p>
            <p className='text-xs text-gray-500'>
              {translate('orders.invoice.date')}: {formatDate(order.createdAt) || '—'}
            </p>
            <p className='text-xs text-gray-500'>
              {translate('orders.invoice.status')}: {translate(`tracking.status.${order.status}`)}
            </p>
          </div>
        </div>

        <div>
          <p className='mb-1 text-xs font-semibold uppercase text-gray-500'>{translate('orders.invoice.customer')}</p>
          <p className='font-medium'>{user.name}</p>
          {user.phone && <p className='text-gray-600'>{user.phone}</p>}
          {order.address && <p className='text-gray-600'>{[order.address, order.district, order.city].filter(Boolean).join(', ')}</p>}
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full min-w-[420px] text-left'>
            <thead>
              <tr className='border-b border-border text-xs uppercase text-gray-500'>
                <th className='py-2 pr-2 font-semibold'>{translate('orders.invoice.service')}</th>
                <th className='py-2 px-2 text-right font-semibold'>{translate('orders.invoice.quantity')}</th>
                <th className='py-2 px-2 text-right font-semibold'>{translate('orders.invoice.unitPrice')}</th>
                <th className='py-2 pl-2 text-right font-semibold'>{translate('orders.invoice.subtotal')}</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={`${item.categoryId}-${index}`} className='border-b border-border/60'>
                  <td className='py-2 pr-2'>{item.categoryName}</td>
                  <td className='py-2 px-2 text-right'>{translate('tracking.result.quantity', { quantity: item.quantity })}</td>
                  <td className='py-2 px-2 text-right'>{formatPrice(item.unitPrice)}</td>
                  <td className='py-2 pl-2 text-right font-medium'>{formatPrice(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='ml-auto w-full max-w-xs space-y-1.5'>
          <div className='flex justify-between'>
            <span className='text-gray-600'>{translate('orders.invoice.total')}</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
          {discountRows.map((row) => (
            <div key={row.key} className='flex justify-between text-emerald-700'>
              <span>{row.label}</span>
              <span>-{formatPrice(row.amount)}</span>
            </div>
          ))}
          <div className='flex justify-between border-t border-border pt-2 text-base font-bold'>
            <span>{translate('orders.invoice.finalAmount')}</span>
            <span className='text-primary'>{formatPrice(order.finalAmount)}</span>
          </div>
        </div>

        <p className='text-center text-xs text-gray-500'>{translate('orders.invoice.thanks')}</p>
      </div>

      <div className='mt-6 flex justify-end print:hidden'>
        <MyButton variant='primary' onClick={() => window.print()}>
          {translate('orders.invoice.print')}
        </MyButton>
      </div>
    </div>
  )
}

export default OrderInvoice
