'use client'

import { useRef, useState } from 'react'

import MyCard, { MyCardBody } from '@/components/MyCard'
import MyImage from '@/components/MyImage'
import { CameraIcon } from '@/components/Icons/Camera'
import { MapPinIcon } from '@/components/Icons/MapPin'
import { UserCircleIcon } from '@/components/Icons/UserCircle'
import useBase64Img from '@/hooks/useBase64Img'
import useLanguage from '@/hooks/useLanguage'
import useUser from '@/hooks/useUser'
import { MAX_AVATAR_FILE_SIZE } from '@/constants/app'
import { getBase64 } from '@/utils/functions'
import { cn } from '@/utils/tailwind'

export type ProfileTab = 'info' | 'addresses'

export type ProfileSidebarProps = {
  activeTab: ProfileTab
  onChangeTab: (tab: ProfileTab) => void
}

const ProfileSidebar = ({ activeTab, onChangeTab }: ProfileSidebarProps) => {
  const { translate } = useLanguage()
  const { user, updateUser } = useUser()
  const { getFileOptimize } = useBase64Img()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  const tabs: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { key: 'info', label: translate('profile.menu.info'), icon: <UserCircleIcon className='h-5 w-5' /> },
    { key: 'addresses', label: translate('profile.menu.addresses'), icon: <MapPinIcon className='h-5 w-5' /> },
  ]

  // Preview a new avatar locally before persisting
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    e.target.value = ''

    if (!file) return

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setAvatarError(translate('profile.avatar.maxSize'))

      return
    }

    setAvatarError('')
    setIsUploadingAvatar(true)

    try {
      const optimized = await getFileOptimize(file)
      const { base64 } = (await getBase64(optimized)) as { base64: string }

      updateUser({ avatar: base64 })
    } catch (error: any) {
      // Only show error if it's not a cancellation
      if (error?.message !== 'Crop cancelled') {
        setAvatarError(translate('common.error'))
      }
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return (
    <MyCard className='lg:sticky lg:top-24'>
      <MyCardBody className='text-center'>
        <div className='relative mx-auto h-28 w-28'>
          <div className='relative h-full w-full overflow-hidden rounded-full border-4 border-white shadow-lg'>
            {user?.avatar ? (
              <MyImage src={user.avatar} alt={translate('common.avatar')} fill className='object-cover' sizes='112px' />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-secondary'>
                <UserCircleIcon className='h-14 w-14 text-white' />
              </div>
            )}
          </div>
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            className='absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-110'
            aria-label={translate('profile.avatar.change')}
          >
            {isUploadingAvatar ? (
              <span className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
            ) : (
              <CameraIcon className='h-4 w-4' />
            )}
          </button>
          <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleAvatarChange} />
        </div>

        {avatarError && <p className='mt-3 text-sm text-red-600'>{avatarError}</p>}

        <h2 className='mt-4 text-lg font-bold text-text'>{user?.name || translate('menu.profile')}</h2>
        <p className='text-sm text-gray-500'>{user?.phone}</p>

        <div className='mt-6 flex flex-col gap-1'>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type='button'
              onClick={() => onChangeTab(tab.key)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                activeTab === tab.key ? 'bg-primary/10 text-primary' : 'text-text hover:bg-gray-50'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </MyCardBody>
    </MyCard>
  )
}

export default ProfileSidebar
