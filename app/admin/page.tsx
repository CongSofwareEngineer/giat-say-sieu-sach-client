'use client'

import Link from 'next/link'

import MyCard, { MyCardBody } from '@/components/MyCard'
import InboxIcon from '@/components/Icons/Inbox'
import { PaymentIcon } from '@/components/Icons/Payment'
import { UserCircleIcon } from '@/components/Icons/UserCircle'
import ChatBubbleIcon from '@/components/Icons/ChatBubble'
import { ContactIcon } from '@/components/Icons/Contact'
import useLanguage from '@/hooks/useLanguage'

const AdminDashboardPage = () => {
  const { translate } = useLanguage()

  const stats = [
    { label: translate('admin.sidebar.orders'), href: '/admin/orders', icon: InboxIcon, color: 'from-blue-500 to-blue-600' },
    { label: translate('admin.sidebar.customers'), href: '/admin/customers', icon: UserCircleIcon, color: 'from-purple-500 to-purple-600' },
    { label: translate('admin.sidebar.prices'), href: '/admin/pricing', icon: PaymentIcon, color: 'from-green-500 to-green-600' },
    { label: translate('admin.sidebar.comments'), href: '/admin/comments', icon: ChatBubbleIcon, color: 'from-yellow-500 to-yellow-600' },
    { label: translate('admin.sidebar.contacts'), href: '/admin/contact', icon: ContactIcon, color: 'from-pink-500 to-pink-600' },
  ]

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.dashboard.title')}</h1>
        <p className='mt-1 text-sm text-gray-500'>{translate('admin.dashboard.subtitle')}</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5'>
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <MyCard className='hover:shadow-md transition-shadow cursor-pointer h-full'>
              <MyCardBody>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                  <stat.icon className='h-5 w-5' />
                </div>
                <p className='mt-4 text-sm font-medium text-text'>{stat.label}</p>
              </MyCardBody>
            </MyCard>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboardPage
