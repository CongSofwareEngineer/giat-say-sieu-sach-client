'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'

import MyInput from '@/components/MyInput'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MySelect from '@/components/MySelect'
import MyTable, { MyTableColumn } from '@/components/MyTable'
import MyButton from '@/components/MyButton'
import AdminDeleteConfirm from '@/components/admin/AdminDeleteConfirm'
import { getOrderCode, OrderItem, OrderUser } from '@/services/order'
import useAdminOrders from '@/hooks/admin/useAdminOrders'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { COPY_FEEDBACK_DURATION, ORDER_EDITABLE_STATUSES, ORDER_STATUS, PAGE_SIZE, WEIGHT_DISCOUNT } from '@/constants/app'
import { ArrowDownIcon } from '@/components/Icons/ArrowDown'
import { CheckIcon } from '@/components/Icons/Check'
import { CopyIcon } from '@/components/Icons/Functions/Copy'
import { EditIcon } from '@/components/Icons/Functions/Edit'
import { LockIcon } from '@/components/Icons/Lock'
import { PhoneIcon } from '@/components/Icons/Phone'
import { TrashIcon } from '@/components/Icons/Trash'
import { calculateOrderPricing } from '@/utils/orderPricing'
import { copyToClipboard } from '@/utils/functions'
import { toast } from '@/utils/toast'

const ALL_STATUS = 'all'

// Total weight (kg) of an order: every item quantity is in kg
const getOrderWeight = (order: OrderItem): number => order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0

// Customer populated by the server; older responses may still send a raw id string
const getOrderUser = (order: OrderItem): OrderUser | null => (order.userId && typeof order.userId === 'object' ? order.userId : null)

type CopyButtonProps = {
  value: string
  label: string
}

// Small icon button that copies a value and briefly shows a check mark
const CopyButton = ({ value, label }: CopyButtonProps) => {
  const { translate } = useLanguage()
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await copyToClipboard(value)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION)
    } catch {
      toast({ message: translate('common.error'), type: 'error' })
    }
  }

  return (
    <button
      type='button'
      aria-label={label}
      title={isCopied ? translate('common.copied') : label}
      onClick={handleCopy}
      className='rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-primary/10 hover:text-primary'
    >
      {isCopied ? <CheckIcon className='size-4 text-emerald-600' strokeWidth={2.5} /> : <CopyIcon className='size-4' />}
    </button>
  )
}

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
  const { open, close, isMobile } = useModalDrawer()
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
      const user = getOrderUser(order)
      const matchSearch =
        !kw ||
        order.id.toLowerCase().includes(kw) ||
        !!user?.name?.toLowerCase().includes(kw) ||
        !!user?.phone?.includes(kw) ||
        order.items?.some((item) => item.categoryName?.toLowerCase().includes(kw))
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

  const columns: MyTableColumn<OrderItem>[] = [
    {
      key: 'code',
      title: translate('admin.orders.list.code'),
      className: 'whitespace-nowrap font-medium',
      render: (order) => (
        <div className='flex items-center gap-1'>
          <span>#{getOrderCode(order.id)}</span>
          <CopyButton value={getOrderCode(order.id)} label={translate('admin.orders.list.copyCode')} />
        </div>
      ),
    },
    {
      key: 'customer',
      title: translate('admin.orders.list.customer'),
      render: (order) => {
        const user = getOrderUser(order)

        return (
          <p className='max-w-[180px] truncate font-medium' title={user?.name}>
            {user?.name || '—'}
          </p>
        )
      },
    },
    {
      key: 'phone',
      title: translate('admin.orders.list.phone'),
      className: 'whitespace-nowrap',
      render: (order) => {
        const user = getOrderUser(order)

        if (!user?.phone) return '—'

        return (
          <div className='flex items-center gap-1'>
            <span>{user.phone}</span>
            {isMobile ? (
              <a
                href={`tel:${user.phone}`}
                aria-label={translate('admin.orders.list.callPhone')}
                title={translate('admin.orders.list.callPhone')}
                className='rounded-lg p-1.5 text-primary transition-colors hover:bg-primary/10'
              >
                <PhoneIcon className='size-4' />
              </a>
            ) : (
              <CopyButton value={user.phone} label={translate('admin.orders.list.copyPhone')} />
            )}
          </div>
        )
      },
    },
    {
      key: 'service',
      title: translate('admin.orders.list.service'),
      render: (order) => (
        <p className='max-w-[220px] truncate' title={getServiceName(order)}>
          {getServiceName(order)}
        </p>
      ),
    },
    {
      key: 'weight',
      title: translate('admin.orders.list.weight'),
      className: 'whitespace-nowrap',
      render: (order) => (
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
      ),
    },
    {
      key: 'status',
      title: translate('admin.orders.list.status'),
      render: (order) => (
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
          <ArrowDownIcon className='pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400' strokeWidth={2} />
        </div>
      ),
    },
    {
      key: 'price',
      title: translate('admin.orders.list.price'),
      align: 'right',
      className: 'whitespace-nowrap font-medium',
      render: (order) => formatPrice(order.finalAmount),
    },
    {
      key: 'date',
      title: translate('admin.orders.list.date'),
      className: 'whitespace-nowrap text-gray-500',
      render: (order) => (order.createdAt ? dayjs(order.createdAt).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      key: 'actions',
      title: translate('common.actions'),
      align: 'center',
      render: (order) => (
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
      ),
    },
  ]

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
          <MyTable
            columns={columns}
            data={paginatedOrders}
            rowKey={(order) => order.id}
            loading={isLoading}
            emptyMessage={translate('common.noData')}
            pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
          />
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminOrdersPage
