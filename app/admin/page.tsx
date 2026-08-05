'use client'

import Link from 'next/link'

import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import { ArrowUpIcon } from '@/components/Icons/ArrowUp'
import { CheckBadgeIcon } from '@/components/Icons/CheckBadge'
import InboxIcon from '@/components/Icons/Inbox'
import { PaymentIcon } from '@/components/Icons/Payment'
import { UserCircleIcon } from '@/components/Icons/UserCircle'
import ZapIcon from '@/components/Icons/Zap'
import useLanguage from '@/hooks/useLanguage'
import { cn } from '@/utils/tailwind'

type StatCard = {
  label: string
  value: string
  trend?: string
  icon: React.ElementType
  iconColor: string
}

type RatioItem = {
  name: string
  percent: number
}

type ServiceItem = {
  name: string
  percent: number
}

type OrderRow = {
  code: string
  customer: string
  phone: string
  service: string
  total: string
  status: string
  variant: string
  date: string
}

const statusStyles: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  green: 'bg-green-100 text-green-700',
  gray: 'bg-gray-100 text-gray-700',
}

const AdminDashboardPage = () => {
  const { translate } = useLanguage()

  const stats: StatCard[] = [
    {
      label: translate('admin.dashboard.totalRevenue'),
      value: translate('admin.dashboard.totalRevenueValue'),
      trend: translate('admin.dashboard.totalRevenueTrend'),
      icon: PaymentIcon,
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      label: translate('admin.dashboard.todayOrders'),
      value: translate('admin.dashboard.todayOrdersValue'),
      trend: translate('admin.dashboard.todayOrdersTrend'),
      icon: InboxIcon,
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      label: translate('admin.dashboard.processingOrders'),
      value: translate('admin.dashboard.processingOrdersValue'),
      icon: ZapIcon,
      iconColor: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: translate('admin.dashboard.completedOrders'),
      value: translate('admin.dashboard.completedOrdersValue'),
      trend: translate('admin.dashboard.completedOrdersTrend'),
      icon: CheckBadgeIcon,
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      label: translate('admin.dashboard.totalCustomers'),
      value: translate('admin.dashboard.totalCustomersValue'),
      trend: translate('admin.dashboard.totalCustomersTrend'),
      icon: UserCircleIcon,
      iconColor: 'bg-purple-100 text-purple-600',
    },
  ]

  const ratio = (translate('admin.dashboard.ratio') || []) as RatioItem[]
  const services = (translate('admin.dashboard.services') || []) as ServiceItem[]
  const orders = (translate('admin.dashboard.orders') || []) as OrderRow[]

  // Monthly revenue in millions (T1..T12)
  const revenueData = [12, 18, 15, 22, 20, 26, 24, 30, 28, 34, 31, 42]
  const maxRevenue = Math.max(...revenueData)

  return (
    <div className='space-y-6'>
      {/* Page header */}
      <div>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.dashboard.title')}</h1>
        <p className='mt-1 text-sm text-gray-500'>{translate('admin.dashboard.subtitle')}</p>
      </div>

      {/* Stats grid */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5'>
        {stats.map((stat) => (
          <MyCard key={stat.label}>
            <MyCardBody>
              <div className='flex items-start justify-between gap-2'>
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', stat.iconColor)}>
                  <stat.icon className='h-5 w-5' />
                </div>
                {stat.trend && (
                  <span className='inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700'>
                    <ArrowUpIcon className='h-3 w-3' />
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className='mt-4 text-2xl font-extrabold text-text'>{stat.value}</p>
              <p className='mt-1 text-sm text-gray-500'>{stat.label}</p>
            </MyCardBody>
          </MyCard>
        ))}
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Revenue chart */}
        <MyCard className='lg:col-span-2'>
          <MyCardHeader>
            <h2 className='font-semibold text-text'>{translate('admin.dashboard.revenueChart')}</h2>
          </MyCardHeader>
          <MyCardBody>
            <div className='flex h-64 items-end justify-between gap-1.5 sm:gap-2'>
              {revenueData.map((value, index) => (
                <div key={index} className='flex flex-1 flex-col items-center'>
                  <div
                    className='w-full rounded-t-lg bg-gradient-to-t from-primary to-secondary transition-all duration-300 hover:opacity-80'
                    style={{ height: `${(value / maxRevenue) * 220}px` }}
                  />
                  <span className='mt-2 text-xs text-gray-500'>{`T${index + 1}`}</span>
                </div>
              ))}
            </div>
          </MyCardBody>
        </MyCard>

        {/* Order ratio + popular services */}
        <div className='space-y-6'>
          <MyCard>
            <MyCardHeader>
              <h2 className='font-semibold text-text'>{translate('admin.dashboard.orderRatio')}</h2>
            </MyCardHeader>
            <MyCardBody className='space-y-4'>
              {ratio.map((item) => (
                <div key={item.name}>
                  <div className='mb-1.5 flex items-center justify-between text-sm'>
                    <span className='text-gray-600'>{item.name}</span>
                    <span className='font-semibold text-text'>{item.percent}%</span>
                  </div>
                  <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
                    <div className='h-full rounded-full bg-gradient-to-r from-primary to-secondary' style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </MyCardBody>
          </MyCard>

          <MyCard>
            <MyCardHeader>
              <h2 className='font-semibold text-text'>{translate('admin.dashboard.popularServices')}</h2>
            </MyCardHeader>
            <MyCardBody className='space-y-3'>
              {services.map((item) => (
                <div key={item.name} className='flex items-center justify-between border-b border-border pb-3 text-sm last:border-0 last:pb-0'>
                  <span className='text-gray-600'>{item.name}</span>
                  <span className='font-semibold text-primary'>{item.percent}%</span>
                </div>
              ))}
            </MyCardBody>
          </MyCard>
        </div>
      </div>

      {/* Recent orders */}
      <MyCard>
        <MyCardHeader className='flex items-center justify-between'>
          <h2 className='font-semibold text-text'>{translate('admin.dashboard.recentOrders')}</h2>
          <Link href='/admin/don-hang' className='text-sm font-medium text-primary hover:underline'>
            {translate('admin.dashboard.viewAll')}
          </Link>
        </MyCardHeader>
        <MyCardBody>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-border'>
                  <th className='px-4 py-3 text-left font-medium text-gray-500'>{translate('admin.orders.list.code')}</th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500'>{translate('admin.orders.list.customer')}</th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500'>{translate('admin.orders.list.phone')}</th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500'>{translate('admin.orders.list.service')}</th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500'>{translate('admin.orders.list.price')}</th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500'>{translate('common.status')}</th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500'>{translate('admin.orders.list.date')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.code} className='border-b border-border last:border-0 hover:bg-background'>
                    <td className='px-4 py-3 font-semibold text-text'>{order.code}</td>
                    <td className='px-4 py-3 text-text'>{order.customer}</td>
                    <td className='px-4 py-3 text-gray-600'>{order.phone}</td>
                    <td className='px-4 py-3 text-gray-600'>{order.service}</td>
                    <td className='px-4 py-3 font-semibold text-text'>{order.total}</td>
                    <td className='px-4 py-3'>
                      <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', statusStyles[order.variant] || statusStyles.gray)}>
                        {order.status}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-gray-500'>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminDashboardPage
