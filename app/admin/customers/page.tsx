'use client'

import type { User } from '@/services/users'

import { useMemo, useState } from 'react'

import { UserRole } from '@/services/users/type'
import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyPagination from '@/components/MyPagination'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import MyBadge from '@/components/MyBadge'
import MySelect from '@/components/MySelect'
import AdminDeleteConfirm from '@/components/admin/AdminDeleteConfirm'
import UserForm from '@/components/UserForm'
import useAdminCustomers from '@/hooks/admin/useAdminCustomers'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'

const AdminCustomersPage = () => {
  const { translate } = useLanguage()
  const { open } = useModalDrawer()
  const { customers, meta, isLoading, deleteCustomer, isDeleting } = useAdminCustomers()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer: User) => {
        const matchSearch = customer.name.toLowerCase().includes(search.toLowerCase()) || customer.phone.includes(search)
        const matchRole = roleFilter === 'all' || customer.role === roleFilter

        return matchSearch && matchRole
      }),
    [customers, search, roleFilter]
  )

  const totalPages = meta?.totalPages || Math.max(1, Math.ceil(filteredCustomers.length / pageSize))
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize

    return filteredCustomers.slice(start, start + pageSize)
  }, [filteredCustomers, currentPage])

  const openCreate = () => {
    open({
      mode: 'modal',
      title: translate('admin.customers.create'),
      classNames: { container: 'md:w-[560px]' },
      children: <UserForm />,
    })
  }

  const openEdit = (customer: User) => {
    open({
      mode: 'modal',
      title: translate('admin.customers.edit'),
      classNames: { container: 'md:w-[560px]' },
      children: <UserForm user={customer} />,
    })
  }

  const confirmDelete = (customer: User) => {
    open({
      mode: 'modal',
      title: translate('admin.customers.delete'),
      children: <AdminDeleteConfirm itemName={customer.name} onConfirm={() => deleteCustomer(customer._id)} isDeleting={isDeleting} />,
    })
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.customers.title')}</h1>
        <MyButton variant='primary' onClick={openCreate}>
          {translate('admin.customers.create')}
        </MyButton>
      </div>

      {/* Filters */}
      <MyCard>
        <MyCardBody>
          <div className='flex flex-col sm:flex-row gap-4'>
            <MyInput
              placeholder={translate('common.search')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className='flex-1'
            />
            <MySelect
              data={[
                { value: 'all', label: translate('common.all') },
                { value: UserRole.CUSTOMER, label: translate('admin.customers.roleCustomer', {}, 'Khách hàng') },
                { value: UserRole.ADMIN, label: translate('admin.customers.roleAdmin', {}, 'Admin') },
              ]}
              value={roleFilter}
              placeholder={translate('admin.customers.filterByRole', {}, 'Lọc theo vai trò')}
              search={false}
              onChange={(item) => {
                setRoleFilter(item.value as string)
                setCurrentPage(1)
              }}
            />
          </div>
        </MyCardBody>
      </MyCard>

      {/* Customers Table */}
      <MyCard>
        <MyCardBody>
          {isLoading ? (
            <MyLoading />
          ) : paginatedCustomers.length === 0 ? (
            <MyEmpty message={translate('common.noData')} />
          ) : (
            <>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-border'>
                      <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.customers.name', {}, 'Họ tên')}</th>
                      <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('common.phone')}</th>
                      <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('admin.customers.role', {}, 'Vai trò')}</th>
                      <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('admin.customers.status', {}, 'Trạng thái')}</th>
                      <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.customers.createdAt', {}, 'Ngày tạo')}</th>
                      <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCustomers.map((customer) => (
                      <tr key={customer._id} className='border-b border-border'>
                        <td className='py-3 px-4 font-medium'>{customer.name}</td>
                        <td className='py-3 px-4'>{customer.phone}</td>
                        <td className='py-3 px-4 text-center'>
                          <MyBadge variant={customer.role === UserRole.ADMIN ? 'primary' : 'default'}>
                            {customer.role === UserRole.ADMIN ? 'Admin' : 'Khách hàng'}
                          </MyBadge>
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
              {totalPages > 1 && (
                <div className='mt-4 flex justify-center'>
                  <MyPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminCustomersPage
