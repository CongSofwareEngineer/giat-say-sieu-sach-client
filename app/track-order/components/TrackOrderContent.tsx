'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import TrackOrderForm, { TrackOrderQuery } from './TrackOrderForm'
import TrackOrderResult from './TrackOrderResult'

import MyCard, { MyCardBody } from '@/components/MyCard'
import { MAX_CHAT_ORDERS, ORDER_STATUS } from '@/constants/app'
import useLanguage from '@/hooks/useLanguage'
import OrderService, { normalizeOrderCode, PublicOrderItem } from '@/services/order'
import { formatPhoneToE164 } from '@/utils/phone'

// Same lookups as the chat tools: by code (track_order) or by phone (get_my_orders)
const fetchOrders = async ({ code, phone }: TrackOrderQuery): Promise<PublicOrderItem[]> => {
  if (code) {
    const order = await OrderService.getOrderByCode(code).catch(() => undefined)

    return order ? [order] : []
  }

  return OrderService.lookupOrdersByPhone({ phone: formatPhoneToE164(phone) ?? phone, limit: MAX_CHAT_ORDERS })
}

const TrackOrderContent = () => {
  const { translate } = useLanguage()
  const searchParams = useSearchParams()
  const initialCode = normalizeOrderCode(searchParams.get('code') ?? '')
  const [isSearching, setIsSearching] = useState(false)
  const [orders, setOrders] = useState<PublicOrderItem[]>([])
  // Translation key of the error, translated on render so it follows the language
  const [errorKey, setErrorKey] = useState('')
  // Ignore responses of older searches when the user searches again
  const requestIdRef = useRef(0)

  const handleTrack = useCallback(async (query: TrackOrderQuery) => {
    const requestId = ++requestIdRef.current

    setIsSearching(true)
    setErrorKey('')
    setOrders([])

    try {
      const result = await fetchOrders(query)

      if (requestId !== requestIdRef.current) return
      if (result.length === 0) setErrorKey(query.code ? 'tracking.result.notFound' : 'tracking.result.notFoundPhone')
      setOrders(result)
    } catch {
      if (requestId === requestIdRef.current) setErrorKey('tracking.result.notFound')
    } finally {
      if (requestId === requestIdRef.current) setIsSearching(false)
    }
  }, [])

  // Reflect a cancellation done from the result card without searching again
  const handleCancelled = useCallback((orderId: string) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: ORDER_STATUS.CANCELLED } : order)))
  }, [])

  // Arriving with ?code=XXXXXX (e.g. from the booking page) tracks it right away
  useEffect(() => {
    if (initialCode) handleTrack({ code: initialCode, phone: '' })
  }, [initialCode, handleTrack])

  return (
    <>
      <TrackOrderForm initialCode={initialCode} loading={isSearching} onSubmit={handleTrack} />

      {errorKey && (
        <MyCard className='mb-8'>
          <MyCardBody className='text-center'>
            <p className='text-red-600'>{translate(errorKey)}</p>
          </MyCardBody>
        </MyCard>
      )}

      {orders.length > 1 && (
        <h2 className='text-lg font-semibold text-text mb-4'>{translate('tracking.result.listTitle', { count: orders.length })}</h2>
      )}

      <div className='space-y-6'>
        {orders.map((order) => (
          <TrackOrderResult key={order.id} order={order} onCancelled={handleCancelled} />
        ))}
      </div>
    </>
  )
}

export default TrackOrderContent
