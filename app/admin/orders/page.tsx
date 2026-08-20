'use client'

import { useMemo, useState } from 'react'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyBadge from '@/components/MyBadge'
import MyPagination from '@/components/MyPagination'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import { OrderItem } from '@/services/order'
import useAdminListOrders from '@/hooks/reactQuery/useAdminListOrders'
import useLanguage from '@/hooks/useLanguage'
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

const FILTER_STATUS: ORDER_STATUS[] = [ORDER_STATUS.PENDING, ORDER_STATUS.WASHING, ORDER_STATUS.DRYING, ORDER_STATUS.READY, ORDER_STATUS.COMPLETED]

const AdminOrdersPage = () => {
  const { translate } = useLanguage()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { orders, isLoading, updateOrderStatus, isUpdatingStatus } = useAdminListOrders()

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchSearch = order.id.toLowerCase().includes(search.toLowerCase()) || order.items?.some((item) => item.categoryName?.toLowerCase().includes(search.toLowerCase()))
        const matchStatus = statusFilter === 'all' || order.status === statusFilter

        return matchSearch && matchStatus
      }),
    [orders, search, statusFilter]
  )

  const handleStatusChange = (orderId: string, newStatus: ORDER_STATUS) => {
    updateOrderStatus({ id: orderId, status: newStatus })
  }

  const getServiceName = (order: OrderItem): string => {
    return order.items?.map((item) => item.categoryName).join(', ') || '—'
  }

  const getUserIdDisplay = (order: OrderItem): string => {
    const uid = order.userId
    return uid && uid !== '[object Object]' ? uid : '—'
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-text'>{translate('admin.orders.title')}</h1>

      {/* Filters */}
      <MyCard>
        <MyCardBody>
          <div className='flex flex-col sm:flex-row gap-4'>
            <MyInput placeholder={translate('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} className='flex-1' />
            <div className='flex gap-2'>
              {['all', ...FILTER_STATUS].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {status === 'all' ? translate('admin.orders.filters.all') : statusConfig[status as ORDER_STATUS]?.label}
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
          ) : filteredOrders.length === 0 ? (
            <MyEmpty message={translate('common.noData')} />
          ) : (
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
                    <th className='text-center py-3 px-4 font-medium text-gray-500'>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className='border-b border-border'>
                      <td className='py-3 px-4 font-medium'>#{order.id.slice(-6).toUpperCase()}</td>
                      <td className='py-3 px-4'>{getUserIdDisplay(order)}</td>
                      <td className='py-3 px-4'>{getServiceName(order)}</td>
                      <td className='py-3 px-4'>
                        <MyBadge variant={statusConfig[order.status]?.variant || 'info'}>{statusConfig[order.status]?.label}</MyBadge>
                      </td>
                      <td className='py-3 px-4 text-right'>{order.finalAmount.toLocaleString()}đ</td>
                      <td className='py-3 px-4'>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center justify-center'>
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className='mt-4'>
            <MyPagination currentPage={1} totalPages={1} onPageChange={() => {}} />
          </div>
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminOrdersPage
