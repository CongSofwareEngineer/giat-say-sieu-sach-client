'use client'

import { useState } from 'react'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyBadge from '@/components/MyBadge'
import MyPagination from '@/components/MyPagination'
import { mockOrders } from '@/services/mockData'
import useLanguage from '@/hooks/useLanguage'
import { ORDER_STATUS } from '@/constants/app'

const statusConfig: Record<ORDER_STATUS, { label: string; variant: 'success' | 'warning' | 'info' | 'error' }> = {
  [ORDER_STATUS.CREATED]: { label: 'Đã tạo', variant: 'info' },
  [ORDER_STATUS.CONFIRMED]: { label: 'Đã xác nhận', variant: 'info' },
  [ORDER_STATUS.PICKED_UP]: { label: 'Đã nhận đồ', variant: 'info' },
  [ORDER_STATUS.WASHING]: { label: 'Đang giặt', variant: 'warning' },
  [ORDER_STATUS.DRYING]: { label: 'Đang sấy', variant: 'warning' },
  [ORDER_STATUS.IRONING]: { label: 'Đang ủi', variant: 'warning' },
  [ORDER_STATUS.FOLDING]: { label: 'Đang gấp', variant: 'warning' },
  [ORDER_STATUS.PACKAGING]: { label: 'Đang đóng gói', variant: 'warning' },
  [ORDER_STATUS.DELIVERING]: { label: 'Đang giao', variant: 'warning' },
  [ORDER_STATUS.COMPLETED]: { label: 'Hoàn thành', variant: 'success' },
}

const AdminOrdersPage = () => {
  const { translate } = useLanguage()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredOrders = mockOrders.filter((order) => {
    const matchSearch = order.code.toLowerCase().includes(search.toLowerCase()) || order.customerName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || order.status === statusFilter

    return matchSearch && matchStatus
  })

  const handleStatusChange = (orderId: string, newStatus: string) => {
    // Mock status change
    console.log(`Order ${orderId} status changed to ${newStatus}`)
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
              {['all', 'CREATED', 'CONFIRMED', 'WASHING', 'COMPLETED'].map((status) => (
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
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-border'>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.code') || 'Mã đơn'}</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.customer') || 'Khách hàng'}</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.phone') || 'SĐT'}</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.address') || 'Địa chỉ nhận'}</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.service') || 'Dịch vụ'}</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.status')}</th>
                  <th className='text-right py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.price')}</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.orders.list.date') || 'Ngày tạo'}</th>
                  <th className='text-center py-3 px-4 font-medium text-gray-500'>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className='border-b border-border'>
                    <td className='py-3 px-4 font-medium'>{order.code}</td>
                    <td className='py-3 px-4'>{order.customerName}</td>
                    <td className='py-3 px-4'>{order.phone}</td>
                    <td className='py-3 px-4 max-w-[200px] truncate'>{order.pickupAddress}</td>
                    <td className='py-3 px-4'>{order.service}</td>
                    <td className='py-3 px-4'>
                      <MyBadge variant={statusConfig[order.status as ORDER_STATUS]?.variant || 'info'}>
                        {statusConfig[order.status as ORDER_STATUS]?.label}
                      </MyBadge>
                    </td>
                    <td className='py-3 px-4 text-right'>{order.totalPrice.toLocaleString()}đ</td>
                    <td className='py-3 px-4'>{order.createdAt}</td>
                    <td className='py-3 px-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <select
                          className='px-2 py-1 border border-border rounded text-xs'
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
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
          <div className='mt-4'>
            <MyPagination currentPage={1} totalPages={1} onPageChange={() => {}} />
          </div>
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminOrdersPage
