'use client'

import { useState } from 'react'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyPagination from '@/components/MyPagination'
import { mockCustomers } from '@/services/mockData'
import useLanguage from '@/hooks/useLanguage'

const AdminCustomersPage = () => {
  const { translate } = useLanguage()
  const [search, setSearch] = useState('')

  const filteredCustomers = mockCustomers.filter(
    (customer) => customer.name.toLowerCase().includes(search.toLowerCase()) || customer.phone.includes(search)
  )

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
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-border'>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Họ tên</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Số điện thoại</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Email</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Ngày tạo</th>
                  <th className='text-center py-3 px-4 font-medium text-gray-500'>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className='border-b border-border'>
                    <td className='py-3 px-4 font-medium'>{customer.name}</td>
                    <td className='py-3 px-4'>{customer.phone}</td>
                    <td className='py-3 px-4'>{customer.email}</td>
                    <td className='py-3 px-4'>{customer.createdAt}</td>
                    <td className='py-3 px-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <button className='px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded-lg'>{translate('common.edit')}</button>
                        <button className='px-3 py-1 text-xs text-red-600 border border-red-600 rounded-lg'>{translate('common.delete')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-4'>
            <MyPagination currentPage={1} totalPages={1} onPageChange={() => {}} />
          </div>
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminCustomersPage
