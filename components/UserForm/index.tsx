'use client'

import { useState } from 'react'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import { User } from '@/services/users'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import useAdminListUsers from '@/hooks/reactQuery/useAdminListUsers'

type UserFormProps = {
  user: User
}

const UserForm = ({ user }: UserFormProps) => {
  const { translate } = useLanguage()
  const { close } = useModalDrawer()
  const { updateUser, isUpdating } = useAdminListUsers()

  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [isActive, setIsActive] = useState(user.isActive)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await updateUser({ id: user._id, payload: { name, phone, isActive } })
      close()
    } catch (err) {
      setError(translate('common.error'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className='w-full space-y-4'>
      <MyInput label='Họ tên' value={name} onChange={(e) => setName(e.target.value)} required />
      <MyInput label='Số điện thoại' type='tel' value={phone} onChange={(e) => setPhone(e.target.value)} required />
      <label className='flex items-center gap-2 text-sm'>
        <input type='checkbox' checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className='rounded border-border' />
        <span>Đang hoạt động</span>
      </label>
      {error && <p className='text-sm text-red-600'>{error}</p>}
      <div className='flex justify-end pt-2'>
        <MyButton variant='outline' size='small' className='mr-2' onClick={() => close()}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton type='submit' variant='primary' size='small' loading={isUpdating}>
          {translate('common.save')}
        </MyButton>
      </div>
    </form>
  )
}

export default UserForm
