'use client'

import { useMemo, useState } from 'react'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyBadge from '@/components/MyBadge'
import MyPagination from '@/components/MyPagination'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import AdminDeleteConfirm from '@/components/admin/AdminDeleteConfirm'
import { OrderItem } from '@/services/order'
import useAdminOrders from '@/hooks/admin/useAdminOrders'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { ORDER_STATUS } from '@/constants/app'

const statusConfig: Record<ORDER_STATUS, { label: string; variant: 'success' | 'warning' | 'info' | 'error' }> = {
  [ORDER_STATUS.PENDING]: { label: 'Chờ xác nhận', variant: 'info' },
  [ORDER_STATUS.RECEIVED]: { label: 'Đã nhận đồ', variant: 'info' },
  [ORDER_STATUS.WASHING]: { label: 'Đang giặt', variant: 'warning' },
  [ORDER_STATUS.DRYING]: { label: 'Đang sấy', variant: 'warning' },
  [ORDER_STATUS.READY]: { label: 'Đã sẵn sàng', variant: 'success' },
  [ORDER_STATUS.COMPLETED]: { label: 'Hoàn thành', variant: 'success' },
  [ORDER_STATUS.CANCELLED]: { label: 'Đã hủy', variant: 'error' },
}

const AdminOrdersPage = () => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const { orders, meta, isLoading, updateOrderStatus, isUpdatingStatus, deleteOrder, isDeleting } = useAdminOrders()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchSearch =
          order.id.toLowerCase().includes(search.toLowerCase()) ||
          order.items?.some((item) => item.categoryName?.toLowerCase().includes(search.toLowerCase()))
        const matchStatus = statusFilter === 'all' || order.status === statusFilter

        return matchSearch && matchStatus
      }),
    [orders, search, statusFilter]
  )

  const totalPages = meta?.totalPages || Math.max(1, Math.ceil(filteredOrders.length / pageSize))
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize

    return filteredOrders.slice(start, start + pageSize)
  }, [filteredOrders, currentPage])

  const handleStatusChange = (orderId: string, newStatus: ORDER_STATUS) => {
    updateOrderStatus({ id: orderId, status: newStatus })
  }

  const getServiceName = (order: OrderItem): string => {
    return order.items?.map((item) => item.categoryName).join(', ') || '—'
  }

  const getUserIdDisplay = (order: OrderItem): string => {
    const uid = order.userId

    return typeof uid === 'string' ? uid : '—'
  }

  const confirmDelete = (order: OrderItem) => {
    open({
      mode: 'modal',
      title: translate('admin.orders.delete'),
      children: (
        <AdminDeleteConfirm itemName={`#${order.id.slice(-6).toUpperCase()}`} onConfirm={() => deleteOrder(order.id)} isDeleting={isDeleting} />
      ),
    })
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-text'>{translate('admin.orders.title')}</h1>

      {/* Filters */}
      <MyCard>
        <MyCardBody>
          <div className='flex flex-col sm:flex-row gap-4'>
            <MyInput
              placeholder={translate('common.search')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className='flex-1'
            />
            <div className='flex gap-2 flex-wrap'>
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setCurrentPage(1)
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {translate('admin.orders.filters.all')}
              </button>
              {Object.values(ORDER_STATUS).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {statusConfig[status]?.label}
                </button>
              ))}
            </div>
          </div>
        </MyCardBody>
      </MyCard>

      {/* Orders Table */}
      <MyCard>
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
                    <tr className='border-b border-border'>
                      <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.code')}</th>
                      <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.customer')}</th>
                      <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.service')}</th>
                      <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.status')}</th>
                      <th className='text-right py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.price')}</th>
                      <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.date')}</th>
                      <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className='border-b border-border'>
                        <td className='py-3 px-4 font-medium'>#{order.id.slice(-6).toUpperCase()}</td>
                        <td className='py-3 px-4'>{getUserIdDisplay(order)}</td>
                        <td className='py-3 px-4'>{getServiceName(order)}</td>
                        <td className='py-3 px-4'>
                          <select
                            className='px-2 py-1 border border-border rounded text-xs'
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as ORDER_STATUS)}
                            disabled={isUpdatingStatus}
                          >
                            {Object.values(ORDER_STATUS).map((status) => (
                              <option key={status} value={status}>
                                {statusConfig[status]?.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className='py-3 px-4 text-right'>{order.finalAmount.toLocaleString()}đ</td>
                        <td className='py-3 px-4'>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                        <td className='py-3 px-4'>
                          <div className='flex items-center justify-center gap-2'>
                            <button
                              type='button'
                              onClick={() => confirmDelete(order)}
                              className='px-3 py-1 text-xs text-red-600 border border-red-600 rounded-lg'
                            >
                              {translate('common.delete')}
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
