'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'

import MyInput from '@/components/MyInput'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MySelect from '@/components/MySelect'
import MyPagination from '@/components/MyPagination'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import AdminDeleteConfirm from '@/components/admin/AdminDeleteConfirm'
import { getOrderCode, OrderItem } from '@/services/order'
import useAdminOrders from '@/hooks/admin/useAdminOrders'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { ORDER_STATUS, PAGE_SIZE } from '@/constants/app'
import { ArrowDownIcon } from '@/components/Icons/ArrowDown'
import { TrashIcon } from '@/components/Icons/Trash'

const ALL_STATUS = 'all'

const AdminOrdersPage = () => {
  const { translate } = useLanguage()
  const { open } = useModalDrawer()
  const { orders, isLoading, updateOrderStatus, isUpdatingStatus, deleteOrder, isDeleting } = useAdminOrders()
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
