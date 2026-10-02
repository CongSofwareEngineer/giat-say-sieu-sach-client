'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'

import MyInput from '@/components/MyInput'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MySelect from '@/components/MySelect'
import MyPagination from '@/components/MyPagination'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import MyButton from '@/components/MyButton'
import AdminDeleteConfirm from '@/components/admin/AdminDeleteConfirm'
import { getOrderCode, OrderItem } from '@/services/order'
import useAdminOrders from '@/hooks/admin/useAdminOrders'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { ORDER_EDITABLE_STATUSES, ORDER_STATUS, PAGE_SIZE, WEIGHT_DISCOUNT } from '@/constants/app'
import { ArrowDownIcon } from '@/components/Icons/ArrowDown'
import { EditIcon } from '@/components/Icons/Functions/Edit'
import { LockIcon } from '@/components/Icons/Lock'
import { TrashIcon } from '@/components/Icons/Trash'
import { calculateOrderPricing } from '@/utils/orderPricing'

const ALL_STATUS = 'all'

// Total weight (kg) of an order: every item quantity is in kg
const getOrderWeight = (order: OrderItem): number => order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0

type EditWeightFormProps = {
  order: OrderItem
  onClose: () => void
  onSave: (items: { categoryId: string; quantity: number }[]) => Promise<unknown>
}

// Modal content to fix the weight after weighing the clothes (server recalculates the amounts)
const EditWeightForm = ({ order, onClose, onSave }: EditWeightFormProps) => {
  const { translate } = useLanguage()
  const [quantities, setQuantities] = useState<string[]>(() => order.items.map((item) => String(item.quantity)))
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const parsed = quantities.map((value) => parseFloat(value))
  const isValid = parsed.length > 0 && parsed.every((value) => !isNaN(value) && value > 0)
  const totalWeight = isValid ? parsed.reduce((sum, value) => sum + value, 0) : 0
  const totalAmount = isValid ? order.items.reduce((sum, item, index) => sum + Math.round(item.unitPrice * parsed[index]), 0) : 0
  // Preview only: never redeems more points than at booking time (same as the server)
  const preview = calculateOrderPricing(totalAmount, totalWeight, order.pointsUsed ?? 0)
  const formatPrice = (price: number) => translate('tracking.result.price', { price: price.toLocaleString('vi-VN') })

  const handleSave = async () => {
    if (!isValid || isSaving) return

    setSaveError('')
    setIsSaving(true)

    try {
      await onSave(order.items.map((item, index) => ({ categoryId: item.categoryId, quantity: parsed[index] })))
      onClose()
    } catch {
      setSaveError(translate('admin.orders.weightEditError'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='w-full space-y-4'>
      <p className='text-sm text-gray-600'>{translate('admin.orders.weightEditDesc', { code: getOrderCode(order.id) })}</p>

      {order.items.map((item, index) => (
        <MyInput
          key={`${item.categoryId}-${index}`}
          label={`${item.categoryName} (${formatPrice(item.unitPrice)}/kg)`}
          type='number'
          min={0.1}
          step={0.1}
          required
          value={quantities[index]}
          onChange={(e) => setQuantities((prev) => prev.map((value, i) => (i === index ? e.target.value : value)))}
          error={!isNaN(parsed[index]) && parsed[index] > 0 ? undefined : translate('admin.orders.weightInvalid')}
        />
      ))}

      {isValid && (
        <div className='space-y-1.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm'>
          <div className='flex justify-between gap-3 text-gray-600'>
            <span>{translate('booking.pricing.subtotal')}</span>
            <span className='font-medium text-text'>{formatPrice(preview.totalAmount)}</span>
          </div>
          {preview.weightDiscount > 0 && (
            <div className='flex justify-between gap-3 text-emerald-700'>
              <span>{translate('booking.pricing.weightDiscount', { kg: WEIGHT_DISCOUNT.MIN_KG })}</span>
              <span>-{formatPrice(preview.weightDiscount)}</span>
            </div>
          )}
          {preview.pointsDiscount > 0 && (
            <div className='flex justify-between gap-3 text-emerald-700'>
              <span>{translate('booking.pricing.pointsDiscount', { points: preview.pointsUsed.toLocaleString('vi-VN') })}</span>
              <span>-{formatPrice(preview.pointsDiscount)}</span>
            </div>
          )}
          <div className='flex justify-between gap-3 border-t border-primary/15 pt-1.5 font-semibold text-primary'>
            <span>{translate('admin.orders.newTotal')}</span>
            <span>{formatPrice(preview.finalAmount)}</span>
          </div>
        </div>
      )}

      {saveError && <p className='text-sm text-red-600'>{saveError}</p>}

      <div className='flex justify-end gap-3'>
        <MyButton variant='outline' onClick={onClose}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton variant='primary' loading={isSaving} disabled={!isValid} onClick={handleSave}>
          {translate('common.save')}
        </MyButton>
      </div>
    </div>
  )
}

const AdminOrdersPage = () => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const { orders, isLoading, updateOrderStatus, isUpdatingStatus, updateOrderItems, deleteOrder, isDeleting } = useAdminOrders()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUS)
  const [currentPage, setCurrentPage] = useState(1)

  const statusOptions = useMemo(
    () => [
      { value: ALL_STATUS, label: translate('admin.orders.filters.all') },
      ...Object.values(ORDER_STATUS).map((status) => ({ value: status, label: translate(`tracking.status.${status}`) })),
    ],
    [translate]
  )

  const filteredOrders = useMemo(() => {
    const kw = search.trim().toLowerCase()

    return orders.filter((order) => {
      const matchSearch = !kw || order.id.toLowerCase().includes(kw) || order.items?.some((item) => item.categoryName?.toLowerCase().includes(kw))
      const matchStatus = statusFilter === ALL_STATUS || order.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [orders, search, statusFilter])

  // Paginate on the client so page count always matches the filtered list
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE

    return filteredOrders.slice(start, start + PAGE_SIZE)
  }, [filteredOrders, currentPage])

  // Success/error toasts are handled inside useAdminOrders
  const handleStatusChange = async (orderId: string, newStatus: ORDER_STATUS) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus })
    } catch {
      // Error toast already shown by the hook
    }
  }

  const getServiceName = (order: OrderItem): string => {
    return order.items?.map((item) => item.categoryName).join(', ') || '—'
  }

  const formatPrice = (price: number) => translate('tracking.result.price', { price: (price ?? 0).toLocaleString('vi-VN') })

  const confirmDelete = (order: OrderItem) => {
    open({
      mode: 'modal',
      title: translate('admin.orders.delete'),
      children: <AdminDeleteConfirm itemName={`#${getOrderCode(order.id)}`} onConfirm={() => deleteOrder(order.id)} isDeleting={isDeleting} />,
    })
  }

  const openEditWeight = (order: OrderItem) => {
    open({
      mode: 'modal',
      title: translate('admin.orders.editWeight'),
      children: <EditWeightForm order={order} onClose={close} onSave={(items) => updateOrderItems({ id: order.id, items })} />,
    })
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-text'>{translate('admin.orders.title')}</h1>

      <MyCard>
        <MyCardHeader>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <h2 className='text-lg font-bold text-text'>{translate('admin.orders.list.title')}</h2>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <MyInput
                placeholder={translate('common.search')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className='sm:w-64'
              />
              <MySelect
                data={statusOptions}
                value={statusFilter}
                placeholder={translate('admin.orders.status')}
                search={false}
                onChange={(item) => {
                  setStatusFilter(item.value as string)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
        </MyCardHeader>
        <MyCardBody>
          {isLoading ? (
            <MyLoading />
          ) : paginatedOrders.length === 0 ? (
            <MyEmpty message={translate('common.noData')} />
          ) : (
            <>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-border bg-gray-50/80'>
                      <th className='whitespace-nowrap text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500'>
                        {translate('admin.orders.list.code')}
                      </th>
                      <th className='whitespace-nowrap text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500'>
                        {translate('admin.orders.list.customer')}
                      </th>
                      <th className='whitespace-nowrap text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500'>
                        {translate('admin.orders.list.service')}
                      </th>
                      <th className='whitespace-nowrap text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500'>
                        {translate('admin.orders.list.weight')}
                      </th>
                      <th className='whitespace-nowrap text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500'>
                        {translate('admin.orders.list.status')}
                      </th>
                      <th className='whitespace-nowrap text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500'>
                        {translate('admin.orders.list.price')}
                      </th>
                      <th className='whitespace-nowrap text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500'>
                        {translate('admin.orders.list.date')}
                      </th>
                      <th className='whitespace-nowrap text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500'>
                        {translate('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className='border-b border-border align-middle transition-colors hover:bg-primary/[0.03]'>
                        <td className='whitespace-nowrap py-3 px-4 font-medium'>#{getOrderCode(order.id)}</td>
                        <td className='py-3 px-4'>
                          <p className='max-w-[160px] truncate text-xs text-gray-500' title={order.userId}>
                            {typeof order.userId === 'string' ? order.userId : '—'}
                          </p>
                        </td>
                        <td className='py-3 px-4'>
                          <p className='max-w-[220px] truncate' title={getServiceName(order)}>
                            {getServiceName(order)}
                          </p>
                        </td>
                        <td className='whitespace-nowrap py-3 px-4'>
                          <div className='flex items-center gap-1.5'>
                            <span className='font-medium'>{translate('tracking.result.quantity', { quantity: getOrderWeight(order) })}</span>
                            {ORDER_EDITABLE_STATUSES.includes(order.status) ? (
                              <button
                                type='button'
                                aria-label={translate('admin.orders.editWeight')}
                                title={translate('admin.orders.editWeight')}
                                onClick={() => openEditWeight(order)}
                                className='rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary'
                              >
                                <EditIcon className='h-4 w-4' />
                              </button>
                            ) : (
                              <span title={translate('admin.orders.weightLocked')} className='p-1.5 text-gray-300'>
                                <LockIcon className='h-4 w-4' />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='py-3 px-4'>
                          <div className='relative w-fit min-w-[140px]'>
                            <select
                              className='w-full cursor-pointer appearance-none rounded-full border border-border bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-text transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60'
                              value={order.status}
                              aria-label={translate('admin.orders.updateStatus')}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as ORDER_STATUS)}
                              disabled={isUpdatingStatus}
                            >
                              {Object.values(ORDER_STATUS).map((status) => (
                                <option key={status} value={status}>
                                  {translate(`tracking.status.${status}`)}
                                </option>
                              ))}
                            </select>
                            <ArrowDownIcon
                              className='pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400'
                              strokeWidth={2}
                            />
                          </div>
                        </td>
                        <td className='whitespace-nowrap py-3 px-4 text-right font-medium'>{formatPrice(order.finalAmount)}</td>
                        <td className='whitespace-nowrap py-3 px-4 text-gray-500'>
                          {order.createdAt ? dayjs(order.createdAt).format('DD/MM/YYYY HH:mm') : '—'}
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex items-center justify-center gap-2'>
                            <button
                              type='button'
                              aria-label={translate('admin.orders.delete')}
                              onClick={() => confirmDelete(order)}
                              className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600'
                            >
                              <TrashIcon className='h-5 w-5' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className='mt-4 flex justify-center'>
                  <MyPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminOrdersPage
