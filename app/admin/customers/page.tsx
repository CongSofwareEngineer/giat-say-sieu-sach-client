'use client'

import type { User } from '@/services/users/type'

import { useMemo, useState } from 'react'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyPagination from '@/components/MyPagination'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import MyBadge from '@/components/MyBadge'
import UserForm from '@/components/UserForm'
import useAdminListUsers from '@/hooks/reactQuery/useAdminListUsers'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { UserRole } from '@/services/users/type'

const AdminCustomersPage = () => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const { users, isLoading, deleteUser, isDeleting } = useAdminListUsers()
  const [search, setSearch] = useState('')

  const filteredCustomers = useMemo(
    () =>
      users.filter(
        (customer: User) =>
          customer.name.toLowerCase().includes(search.toLowerCase()) || customer.phone.includes(search)
      ),
    [users, search]
  )

  const openEdit = (customer: User) => {
    open({
      title: translate('admin.customers.edit'),
      classNames: { container: 'md:w-[560px]' },
      children: <UserForm user={customer} />,
    })
  }

  const confirmDelete = (customer: User) => {
    open({
      title: translate('admin.customers.delete'),
      children: (
        <div className='w-full'>
          <p className='mb-6 text-sm text-gray-600'>{translate('admin.customers.deleteConfirm')}</p>
          <div className='flex justify-end gap-3'>
            <MyButton variant='outline' onClick={() => close()}>
              {translate('common.cancel')}
            </MyButton>
            <MyButton
              variant='error'
              loading={isDeleting}
              onClick={async () => {
                await deleteUser(customer._id)
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
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.customers.title')}</h1>
        <MyButton variant='primary'>{translate('admin.customers.create')}</MyButton>
      </div>

      {/* Filters */}
      <MyCard>
        <MyCardBody>
          <MyInput placeholder={translate('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </MyCardBody>
      </MyCard>

      {/* Customers Table */}
      <MyCard>
        <MyCardBody>
          {isLoading ? (
            <MyLoading />
          ) : filteredCustomers.length === 0 ? (
            <MyEmpty message={translate('common.noData')} />
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='text-left py-3 px-4 font-medium text-gray-500'>Họ tên</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-500'>Số điện thoại</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-500'>Email</th>
                    <th className='text-center py-3 px-4 font-medium text-gray-500'>Vai trò</th>
                    <th className='text-center py-3 px-4 font-medium text-gray-500'>Trạng thái</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-500'>Ngày tạo</th>
                    <th className='text-center py-3 px-4 font-medium text-gray-500'>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className='border-b border-border'>
                      <td className='py-3 px-4 font-medium'>{customer.name}</td>
                      <td className='py-3 px-4'>{customer.phone}</td>
                      <td className='py-3 px-4'>{customer.email || '—'}</td>
                      <td className='py-3 px-4 text-center'>
                        <MyBadge variant={customer.role === UserRole.ADMIN ? 'primary' : 'default'}>{customer.role === UserRole.ADMIN ? 'Admin' : 'Khách hàng'}</MyBadge>
                      </td>
                      <td className='py-3 px-4 text-center'>
                        <MyBadge variant={customer.isActive ? 'success' : 'warning'}>{customer.isActive ? 'Hoạt động' : 'Tạm khóa'}</MyBadge>
                      </td>
                      <td className='py-3 px-4'>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center justify-center gap-2'>
                          <button
                            type='button'
                            onClick={() => openEdit(customer)}
                            className='px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded-lg'
                          >
                            {translate('common.edit')}
                          </button>
                          <button
                            type='button'
                            onClick={() => confirmDelete(customer)}
                            className='px-3 py-1 text-xs text-red-600 border border-red-600 rounded-lg'
                          >
                            {translate('common.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className='mt-4'>
            <MyPagination currentPage={1} totalPages={1} onPageChange={() => {}} />
          </div>
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminCustomersPage
