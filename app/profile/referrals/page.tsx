'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import ProfileSidebar, { ProfileTab } from '../components/ProfileSidebar'

import CommissionHistory from './components/CommissionHistory'
import RefereeList from './components/RefereeList'
import ReferralLinkCard from './components/ReferralLinkCard'

import { PROFILE_PATH, PROFILE_TAB_QUERY } from '@/constants/app'
import useLanguage from '@/hooks/useLanguage'
import useUser from '@/hooks/useUser'

const ReferralsPage = () => {
  const { translate } = useLanguage()
  const router = useRouter()
  const { isLogin, hasHydrated } = useUser()

  // Redirect to login when not authenticated
  useEffect(() => {
    if (hasHydrated && !isLogin) {
      router.replace('/login')
    }
  }, [hasHydrated, isLogin, router])

  // Other menu items are tabs of /profile
  const handleChangeTab = (tab: ProfileTab) => {
    if (tab !== 'referrals') router.push(`${PROFILE_PATH}?${PROFILE_TAB_QUERY}=${tab}`)
  }

  if (!hasHydrated || !isLogin) return null

  return (
    <main className='py-12 px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-text mb-2'>{translate('profile.title')}</h1>
          <p className='text-gray-600'>{translate('profile.subtitle')}</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start'>
          <ProfileSidebar activeTab='referrals' onChangeTab={handleChangeTab} />

          <div className='min-w-0 space-y-6'>
            <ReferralLinkCard />
            <RefereeList />
            <CommissionHistory />
          </div>
        </div>
      </div>
    </main>
  )
}

export default ReferralsPage
