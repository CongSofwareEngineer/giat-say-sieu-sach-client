'use client'

import { useEffect, useState } from 'react'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import { User, UserRole } from '@/services/users/type'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import useAdminCustomers from '@/hooks/admin/useAdminCustomers'
import { toast } from '@/utils/toast'

type UserFormProps = {
  user?: User
}

const UserForm = ({ user }: UserFormProps) => {
  const { translate } = useLanguage()
  const { close } = useModalDrawer()
  const { createCustomer, updateCustomer, isCreating, isUpdating } = useAdminCustomers()

  const isEdit = !!user

  const [phone, setPhone] = useState(user?.phone || '')
  const [name, setName] = useState(user?.name || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>(user?.role || UserRole.CUSTOMER)
  const [isActive, setIsActive] = useState(user?.isActive ?? true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setPhone(user.phone)
      setName(user.name)
      setRole(user.role)
      setIsActive(user.isActive)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isEdit && user) {
        await updateCustomer({ id: user._id, payload: { phone, name, isActive } })
      } else {
        if (!password) {
          setError(translate('common.passwordRequired', {}, 'Vui lòng nhập mật khẩu'))

          return
        }
        await createCustomer({ phone, name, password, role, isActive })
      }
      toast({ message: translate('common.success'), type: 'default' })
      close()
    } catch {
      setError(translate('common.error'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className='w-full space-y-4'>
      <MyInput label={translate('admin.customers.phone', {}, 'Số điện thoại')} value={phone} onChange={(e) => setPhone(e.target.value)} required />
      <MyInput label={translate('admin.customers.name', {}, 'Họ tên')} value={name} onChange={(e) => setName(e.target.value)} required />
      {!isEdit && (
        <MyInput
          label={translate('common.password', {}, 'Mật khẩu')}
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      )}
      <div className='flex items-center gap-4'>
        <label className='flex items-center gap-2 text-sm'>
          <input type='checkbox' checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className='rounded border-border' />
          <span>{translate('admin.customers.active', {}, 'Đang hoạt động')}</span>
        </label>
        {!isEdit && (
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className='border border-border rounded px-2 py-1 text-sm'>
            <option value={UserRole.CUSTOMER}>{translate('admin.customers.roleCustomer', {}, 'Khách hàng')}</option>
            <option value={UserRole.ADMIN}>{translate('admin.customers.roleAdmin', {}, 'Admin')}</option>
          </select>
        )}
      </div>
      {error && <p className='text-sm text-red-600'>{error}</p>}
      <div className='flex justify-end pt-2'>
        <MyButton variant='outline' size='small' className='mr-2' onClick={() => close()}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton type='submit' variant='primary' size='small' loading={isCreating || isUpdating}>
          {translate('common.save')}
        </MyButton>
      </div>
    </form>
  )
}

export default UserForm
