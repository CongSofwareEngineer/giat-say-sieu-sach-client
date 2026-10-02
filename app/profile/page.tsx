'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import AddressBook from './components/AddressBook'
import ChangePasswordForm from './components/ChangePasswordForm'
import MyOrders from './components/MyOrders'
import ProfileInfoForm from './components/ProfileInfoForm'
import ProfileSidebar, { ProfileTab } from './components/ProfileSidebar'

import useLanguage from '@/hooks/useLanguage'
import useUser from '@/hooks/useUser'
import UserService from '@/services/users'

const ProfilePage = () => {
  const { translate } = useLanguage()
  const router = useRouter()
  const { isLogin, hasHydrated, updateUser } = useUser()

  const [activeTab, setActiveTab] = useState<ProfileTab>('info')

  // Redirect to login when not authenticated
  useEffect(() => {
    if (hasHydrated && !isLogin) {
      router.replace('/login')
    }
  }, [hasHydrated, isLogin, router])

  // Refresh profile so loyalty points earned from completed orders are up to date
  useEffect(() => {
    if (!hasHydrated || !isLogin) return

    UserService.getProfile()
      .then((profile) => {
        if (profile) updateUser({ loyaltyPoints: profile.loyaltyPoints ?? 0 })
      })
      .catch(() => {})
  }, [hasHydrated, isLogin, updateUser])

  if (!hasHydrated || !isLogin) return null

  return (
    <main className='py-12 px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-text mb-2'>{translate('profile.title')}</h1>
          <p className='text-gray-600'>{translate('profile.subtitle')}</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start'>
          <ProfileSidebar activeTab={activeTab} onChangeTab={setActiveTab} />

          {activeTab === 'info' && <ProfileInfoForm />}
          {activeTab === 'addresses' && <AddressBook />}
          {activeTab === 'orders' && <MyOrders />}
          {activeTab === 'password' && <ChangePasswordForm />}
        </div>
      </div>
    </main>
  )
}

export default ProfilePage
