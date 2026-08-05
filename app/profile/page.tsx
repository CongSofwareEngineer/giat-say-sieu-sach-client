'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyInput from '@/components/MyInput'
import MySelect from '@/components/MySelect'
import MyImage from '@/components/MyImage'
import MyBadge from '@/components/MyBadge'
import MyEmpty from '@/components/MyEmpty'
import { CameraIcon } from '@/components/Icons/Camera'
import { MapPinIcon } from '@/components/Icons/MapPin'
import { PlusIcon } from '@/components/Icons/Plus'
import { TrashIcon } from '@/components/Icons/Trash'
import { EditIcon } from '@/components/Icons/Functions/Edit'
import { CheckBadgeIcon } from '@/components/Icons/CheckBadge'
import { UserCircleIcon } from '@/components/Icons/UserCircle'
import useLanguage from '@/hooks/useLanguage'
import useUser from '@/hooks/useUser'
import useModalDrawer from '@/hooks/useModalDrawer'
import { UserAddress } from '@/zustand/user'
import { cn } from '@/utils/tailwind'

// Mock provinces data for address selects
const ADDRESS_DATA: Record<string, Record<string, string[]>> = {
  'TP. Hồ Chí Minh': {
    'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành'],
    'Quận 3': ['Phường 1', 'Phường 2'],
    'Quận 7': ['Phường Tân Phú', 'Phường Tân Thuận Tây'],
    'Gò Vấp': ['Phường 1', 'Phường 3'],
  },
  'Hà Nội': {
    'Ba Đình': ['Phường Điện Biên', 'Phường Kim Mã'],
    'Hoàn Kiếm': ['Phường Hàng Trống', 'Phường Hàng Bạc'],
    'Cầu Giấy': ['Phường Dịch Vọng', 'Phường Nghĩa Đô'],
  },
  'Đà Nẵng': {
    'Hải Châu': ['Phường Hải Châu 1', 'Phường Bình Hiên'],
    'Thanh Khê': ['Phường Thanh Khê Đông', 'Phường Thạc Gián'],
  },
}

type AddressFormProps = {
  address?: UserAddress
  onSubmit: (data: Omit<UserAddress, 'id'>) => void
}

// Address form rendered inside a modal/drawer (add & edit modes)
const AddressForm = ({ address, onSubmit }: AddressFormProps) => {
  const { translate } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: address?.name ?? '',
    phone: address?.phone ?? '',
    detail: address?.detail ?? '',
    city: address?.city ?? '',
    district: address?.district ?? '',
    ward: address?.ward ?? '',
    isDefault: address?.isDefault ?? false,
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  const cityOptions = useMemo(() => Object.keys(ADDRESS_DATA).map((city) => ({ value: city, label: city })), [])
  const districtOptions = useMemo(
    () => (formData.city ? Object.keys(ADDRESS_DATA[formData.city]).map((d) => ({ value: d, label: d })) : []),
    [formData.city]
  )
  const wardOptions = useMemo(
    () => (formData.city && formData.district ? ADDRESS_DATA[formData.city][formData.district].map((w) => ({ value: w, label: w })) : []),
    [formData.city, formData.district]
  )

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string | undefined> = {}

    if (!formData.name.trim()) newErrors.name = translate('profile.addresses.validation.nameRequired')
    if (!formData.phone.trim()) newErrors.phone = translate('profile.addresses.validation.phoneRequired')
    else if (!/^(0[0-9]{9})$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = translate('profile.addresses.validation.phoneInvalid')
    if (!formData.detail.trim()) newErrors.detail = translate('profile.addresses.validation.detailRequired')
    if (!formData.city) newErrors.city = translate('profile.addresses.validation.cityRequired')
    if (!formData.district) newErrors.district = translate('profile.addresses.validation.districtRequired')
    if (!formData.ward) newErrors.ward = translate('profile.addresses.validation.wardRequired')

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      onSubmit({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        detail: formData.detail.trim(),
        city: formData.city,
        district: formData.district,
        ward: formData.ward,
        isDefault: formData.isDefault,
      })
      setIsSubmitting(false)
    }, 800)
  }

  return (
    <form onSubmit={handleSubmit} className='w-full space-y-4'>
      <MyInput
        label={translate('profile.addresses.form.name')}
        placeholder={translate('profile.addresses.form.namePlaceholder')}
        required
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
      />

      <MyInput
        label={translate('profile.addresses.form.phone')}
        placeholder={translate('profile.addresses.form.phonePlaceholder')}
        required
        type='tel'
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        error={errors.phone}
      />

      <MyInput
        label={translate('profile.addresses.form.detail')}
        placeholder={translate('profile.addresses.form.detailPlaceholder')}
        required
        value={formData.detail}
        onChange={(e) => handleChange('detail', e.target.value)}
        error={errors.detail}
      />

      <div>
        <label className='block text-sm font-medium text-text mb-1.5'>
          {translate('profile.addresses.form.city')}
          <span className='text-red-600 ml-1'>*</span>
        </label>
        <MySelect
          data={cityOptions}
          value={formData.city}
          placeholder='--'
          onChange={(item) => {
            handleChange('city', item.value as string)
            setFormData((prev) => ({ ...prev, district: '', ward: '' }))
          }}
          style={{ width: '100%' }}
        />
        {errors.city && <p className='mt-1 text-sm text-red-600'>{errors.city}</p>}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-text mb-1.5'>
            {translate('profile.addresses.form.district')}
            <span className='text-red-600 ml-1'>*</span>
          </label>
          <MySelect
            data={districtOptions}
            value={formData.district}
            placeholder='--'
            disabled={!formData.city}
            onChange={(item) => {
              handleChange('district', item.value as string)
              setFormData((prev) => ({ ...prev, ward: '' }))
            }}
            style={{ width: '100%' }}
          />
          {errors.district && <p className='mt-1 text-sm text-red-600'>{errors.district}</p>}
        </div>

        <div>
          <label className='block text-sm font-medium text-text mb-1.5'>
            {translate('profile.addresses.form.ward')}
            <span className='text-red-600 ml-1'>*</span>
          </label>
          <MySelect
            data={wardOptions}
            value={formData.ward}
            placeholder='--'
            disabled={!formData.district}
            onChange={(item) => handleChange('ward', item.value as string)}
            style={{ width: '100%' }}
          />
          {errors.ward && <p className='mt-1 text-sm text-red-600'>{errors.ward}</p>}
        </div>
      </div>

      <label className='flex items-center gap-2 cursor-pointer'>
        <input
          type='checkbox'
          checked={formData.isDefault}
          onChange={(e) => setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))}
          className='h-4 w-4 rounded border-gray-300 text-primary'
        />
        <span className='text-sm text-gray-600'>{translate('profile.addresses.form.isDefault')}</span>
      </label>

      <div className='flex justify-end pt-2'>
        <MyButton type='submit' variant='primary' loading={isSubmitting}>
          {translate('profile.addresses.form.submit')}
        </MyButton>
      </div>
    </form>
  )
}

const ProfilePage = () => {
  const { translate } = useLanguage()
  const router = useRouter()
  const { user, isLogin, hasHydrated, updateUser, addAddress, updateAddress, removeAddress, setDefaultAddress } = useUser()
  const { open, close } = useModalDrawer()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const editingAddressRef = useRef<UserAddress | null>(null)

  const [activeTab, setActiveTab] = useState<'info' | 'addresses'>('info')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isSavingInfo, setIsSavingInfo] = useState(false)
  const [isInfoSaved, setIsInfoSaved] = useState(false)
  const [infoForm, setInfoForm] = useState({ name: '', phone: '', email: '' })
  const [infoErrors, setInfoErrors] = useState<{ name?: string; phone?: string; email?: string }>({})

  const addresses = user?.addresses ?? []

  // Redirect to login when not authenticated
  useEffect(() => {
    if (hasHydrated && !isLogin) {
      router.replace('/login')
    }
  }, [hasHydrated, isLogin, router])

  // Sync form once user data is loaded
  useEffect(() => {
    if (user?.id) {
      setInfoForm({ name: user.name ?? '', phone: user.phone ?? '', email: user.email ?? '' })
    }
  }, [user?.id, user?.name, user?.phone, user?.email])

  if (!hasHydrated || !isLogin) return null

  // Preview a new avatar locally before persisting
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    setIsUploadingAvatar(true)

    const reader = new FileReader()

    reader.onload = () => {
      setTimeout(() => {
        updateUser({ avatar: reader.result as string })
        setIsUploadingAvatar(false)
      }, 800)
    }

    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const validateInfo = (): boolean => {
    const newErrors: { name?: string; phone?: string; email?: string } = {}

    if (!infoForm.name.trim()) newErrors.name = translate('common.required')
    if (!infoForm.phone.trim()) newErrors.phone = translate('booking.validation.phoneRequired')
    else if (!/^(0[0-9]{9})$/.test(infoForm.phone.replace(/\s/g, ''))) newErrors.phone = translate('booking.validation.phoneInvalid')

    setInfoErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateInfo()) return

    setIsSavingInfo(true)

    // Simulate API call
    setTimeout(() => {
      updateUser({ name: infoForm.name.trim(), phone: infoForm.phone.trim(), email: infoForm.email.trim() })
      setIsSavingInfo(false)
      setIsInfoSaved(true)
      setTimeout(() => setIsInfoSaved(false), 2000)
    }, 800)
  }

  // Open add/edit address form in a modal/drawer
  const openAddressForm = (address?: UserAddress) => {
    editingAddressRef.current = address ?? null

    open({
      title: address ? translate('profile.addresses.edit') : translate('profile.addresses.add'),
      children: <AddressForm address={address} onSubmit={handleAddressSubmit} />,
    })
  }

  const handleAddressSubmit = (data: Omit<UserAddress, 'id'>) => {
    const editing = editingAddressRef.current

    if (editing) {
      updateAddress(editing.id, data)
    } else {
      addAddress(data)
    }

    close()
  }

  // Confirm dialog before deleting an address
  const confirmDeleteAddress = (address: UserAddress) => {
    open({
      title: translate('profile.addresses.delete'),
      children: (
        <div className='w-full'>
          <p className='mb-6 text-sm text-gray-600'>{translate('profile.addresses.deleteConfirm')}</p>
          <div className='flex justify-end gap-3'>
            <MyButton variant='outline' onClick={() => close()}>
              {translate('common.cancel')}
            </MyButton>
            <MyButton
              variant='error'
              onClick={() => {
                removeAddress(address.id)
                close()
              }}
            >
              {translate('common.delete')}
            </MyButton>
          </div>
        </div>
      ),
    })
  }

  return (
    <div className='py-12 px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-text mb-2'>{translate('profile.title')}</h1>
          <p className='text-gray-600'>{translate('profile.subtitle')}</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start'>
          {/* Profile summary + tabs */}
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

              <h2 className='mt-4 text-lg font-bold text-text'>{user?.name || translate('menu.profile')}</h2>
              <p className='text-sm text-gray-500'>{user?.phone}</p>

              <div className='mt-6 flex flex-col gap-1'>
                {[
                  { key: 'info', label: translate('profile.menu.info'), icon: <UserCircleIcon className='h-5 w-5' /> },
                  { key: 'addresses', label: translate('profile.menu.addresses'), icon: <MapPinIcon className='h-5 w-5' /> },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type='button'
                    onClick={() => setActiveTab(tab.key as 'info' | 'addresses')}
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

          {/* Active section */}
          {activeTab === 'info' ? (
            <MyCard>
              <MyCardHeader>
                <h2 className='text-lg font-bold text-text'>{translate('profile.info.title')}</h2>
              </MyCardHeader>
              <MyCardBody>
                <form onSubmit={handleSaveInfo} className='space-y-4'>
                  <MyInput
                    label={translate('profile.info.fullName')}
                    placeholder={translate('profile.info.fullNamePlaceholder')}
                    required
                    value={infoForm.name}
                    onChange={(e) => setInfoForm((prev) => ({ ...prev, name: e.target.value }))}
                    error={infoErrors.name}
                  />
                  <MyInput
                    label={translate('profile.info.phone')}
                    placeholder={translate('profile.info.phonePlaceholder')}
                    required
                    type='tel'
                    value={infoForm.phone}
                    onChange={(e) => setInfoForm((prev) => ({ ...prev, phone: e.target.value }))}
                    error={infoErrors.phone}
                  />
                  <MyInput
                    label={translate('profile.info.email')}
                    placeholder={translate('profile.info.emailPlaceholder')}
                    type='email'
                    value={infoForm.email}
                    onChange={(e) => setInfoForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  <div className='flex items-center justify-end gap-3'>
                    {isInfoSaved && <span className='text-sm text-green-600'>{translate('profile.info.saved')}</span>}
                    <MyButton type='submit' variant='primary' loading={isSavingInfo}>
                      {translate('profile.info.save')}
                    </MyButton>
                  </div>
                </form>
              </MyCardBody>
            </MyCard>
          ) : (
            <MyCard>
              <MyCardHeader className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div>
                  <h2 className='text-lg font-bold text-text'>{translate('profile.addresses.title')}</h2>
                  <p className='text-sm text-gray-500'>{translate('profile.addresses.subtitle')}</p>
                </div>
                <MyButton variant='primary' size='small' onClick={() => openAddressForm()}>
                  <PlusIcon className='h-4 w-4 mr-1' />
                  {translate('profile.addresses.add')}
                </MyButton>
              </MyCardHeader>
              <MyCardBody>
                {addresses.length === 0 ? (
                  <MyEmpty
                    message={translate('profile.addresses.empty')}
                    action={
                      <MyButton variant='primary' onClick={() => openAddressForm()}>
                        {translate('profile.addresses.add')}
                      </MyButton>
                    }
                  />
                ) : (
                  <ul className='space-y-3'>
                    {addresses.map((address) => (
                      <li key={address.id} className='flex items-start justify-between gap-4 rounded-xl border border-border bg-white p-4'>
                        <div className='flex gap-3'>
                          <MapPinIcon className='mt-1 h-5 w-5 shrink-0 text-primary' />
                          <div>
                            <div className='flex flex-wrap items-center gap-2'>
                              <p className='font-medium text-text'>
                                {address.name} · {address.phone}
                              </p>
                              {address.isDefault && (
                                <MyBadge variant='primary'>
                                  <CheckBadgeIcon className='h-3 w-3 mr-1' />
                                  {translate('profile.addresses.default')}
                                </MyBadge>
                              )}
                            </div>
                            <p className='mt-1 text-sm text-gray-500'>
                              {address.detail}, {address.ward}, {address.district}, {address.city}
                            </p>
                            {!address.isDefault && (
                              <button
                                type='button'
                                onClick={() => setDefaultAddress(address.id)}
                                className='mt-2 text-xs font-medium text-primary hover:underline'
                              >
                                {translate('profile.addresses.setDefault')}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className='flex gap-1'>
                          <button
                            type='button'
                            aria-label={translate('profile.addresses.edit')}
                            onClick={() => openAddressForm(address)}
                            className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary'
                          >
                            <EditIcon className='h-5 w-5' />
                          </button>
                          <button
                            type='button'
                            aria-label={translate('profile.addresses.delete')}
                            onClick={() => confirmDeleteAddress(address)}
                            className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600'
                          >
                            <TrashIcon className='h-5 w-5' />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </MyCardBody>
            </MyCard>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
