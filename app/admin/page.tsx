'use client'

import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import { mockDashboardStats } from '@/services/mockData'
import useLanguage from '@/hooks/useLanguage'

const AdminDashboardPage = () => {
  const { translate } = useLanguage()
  const stats = mockDashboardStats

  const statCards = [
    {
      label: translate('admin.dashboard.totalRevenue'),
      value: `${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      icon: '💰',
      color: 'bg-green-50 text-green-600',
    },
    { label: translate('admin.dashboard.todayOrders'), value: stats.todayOrders, icon: '📦', color: 'bg-blue-50 text-blue-600' },
    { label: translate('admin.dashboard.processingOrders'), value: stats.processingOrders, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
    { label: translate('admin.dashboard.completedOrders'), value: stats.completedOrders, icon: '✅', color: 'bg-green-50 text-green-600' },
    { label: translate('admin.dashboard.totalCustomers'), value: stats.totalCustomers, icon: '👥', color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-text'>{translate('admin.dashboard.title')}</h1>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
        {statCards.map((stat, index) => (
          <MyCard key={index}>
            <MyCardBody>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-500'>{stat.label}</p>
                  <p className='text-2xl font-bold text-text'>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>{stat.icon}</div>
              </div>
            </MyCardBody>
          </MyCard>
        ))}
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <MyCard>
          <MyCardHeader>
            <h2 className='font-semibold text-text'>{translate('admin.dashboard.revenueChart')}</h2>
          </MyCardHeader>
          <MyCardBody>
            <div className='h-64 flex items-end justify-between gap-2'>
              {stats.revenueChart.map((item, index) => (
                <div key={index} className='flex-1 flex flex-col items-center'>
                  <div className='w-full bg-primary rounded-t' style={{ height: `${(item.revenue / 2500000) * 200}px` }} />
                  <span className='text-xs text-gray-500 mt-2'>{item.date}</span>
                </div>
              ))}
            </div>
          </MyCardBody>
        </MyCard>

        <MyCard>
          <MyCardHeader>
            <h2 className='font-semibold text-text'>{translate('admin.dashboard.ordersChart')}</h2>
          </MyCardHeader>
          <MyCardBody>
            <div className='h-64 flex items-end justify-between gap-2'>
              {stats.ordersChart.map((item, index) => (
                <div key={index} className='flex-1 flex flex-col items-center'>
                  <div className='w-full bg-secondary rounded-t' style={{ height: `${(item.orders / 100) * 200}px` }} />
                  <span className='text-xs text-gray-500 mt-2'>{item.date}</span>
                </div>
              ))}
            </div>
          </MyCardBody>
        </MyCard>
      </div>

      {/* Recent Orders */}
      <MyCard>
        <MyCardHeader>
          <h2 className='font-semibold text-text'>Đơn hàng gần đây</h2>
        </MyCardHeader>
        <MyCardBody>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-border'>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Mã đơn</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Khách hàng</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Dịch vụ</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Trạng thái</th>
                  <th className='text-right py-3 px-4 font-medium text-gray-500'>Giá</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-b border-border'>
                  <td className='py-3 px-4'>GS100001</td>
                  <td className='py-3 px-4'>Nguyễn Văn A</td>
                  <td className='py-3 px-4'>Giặt sấy</td>
                  <td className='py-3 px-4'>
                    <span className='px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs'>Đang giặt</span>
                  </td>
                  <td className='py-3 px-4 text-right'>60.000đ</td>
                </tr>
                <tr className='border-b border-border'>
                  <td className='py-3 px-4'>GS100002</td>
                  <td className='py-3 px-4'>Trần Thị B</td>
                  <td className='py-3 px-4'>Giặt thường</td>
                  <td className='py-3 px-4'>
                    <span className='px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs'>Hoàn thành</span>
                  </td>
                  <td className='py-3 px-4 text-right'>24.000đ</td>
                </tr>
                <tr>
                  <td className='py-3 px-4'>GS100003</td>
                  <td className='py-3 px-4'>Lê Văn C</td>
                  <td className='py-3 px-4'>Giặt hấp</td>
                  <td className='py-3 px-4'>
                    <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs'>Đã nhận đồ</span>
                  </td>
                  <td className='py-3 px-4 text-right'>30.000đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminDashboardPage
