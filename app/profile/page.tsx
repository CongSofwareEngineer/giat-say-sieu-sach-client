'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import AddressBook from './components/AddressBook'
import ChangePasswordForm from './components/ChangePasswordForm'
import MyOrders from './components/MyOrders'
import ProfileInfoForm from './components/ProfileInfoForm'
import ProfileSidebar, { PROFILE_TABS, ProfileTab } from './components/ProfileSidebar'

import useLanguage from '@/hooks/useLanguage'
import useUser from '@/hooks/useUser'
import UserService from '@/services/users'
import { PROFILE_REFERRALS_PATH, PROFILE_TAB_QUERY } from '@/constants/app'

const ProfilePage = () => {
  const { translate } = useLanguage()
  const router = useRouter()
  const { isLogin, hasHydrated, updateUser, user } = useUser()

  const [activeTab, setActiveTab] = useState<ProfileTab>('info')

  // Redirect to login when not authenticated
  useEffect(() => {
    if (hasHydrated && !isLogin) {
      router.replace('/login')
    }
  }, [hasHydrated, isLogin, router])

  // `/profile?tab=` (coming back from the referral page) opens that tab
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get(PROFILE_TAB_QUERY) as ProfileTab | null

    if (tab && PROFILE_TABS.includes(tab) && tab !== 'referrals') setActiveTab(tab)
  }, [])

  const handleChangeTab = (tab: ProfileTab) => {
    if (tab === 'referrals') router.push(PROFILE_REFERRALS_PATH)
    else setActiveTab(tab)
  }

  // Temp password from an admin reset -> open the change password tab
  useEffect(() => {
    if (hasHydrated && user.mustChangePassword) setActiveTab('password')
  }, [hasHydrated, user.mustChangePassword])

  // Refresh profile so loyalty points earned from completed orders are up to date
  useEffect(() => {
    if (!hasHydrated || !isLogin) return

    UserService.getProfile()
      .then((profile) => {
        if (profile) updateUser({ loyaltyPoints: profile.loyaltyPoints ?? 0, mustChangePassword: !!profile.mustChangePassword })
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
          <ProfileSidebar activeTab={activeTab} onChangeTab={handleChangeTab} />

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
