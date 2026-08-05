'use client'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import { mockServices } from '@/services/mockData'
import useLanguage from '@/hooks/useLanguage'

const AdminPricesPage = () => {
  const { translate } = useLanguage()

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.prices.title')}</h1>
        <MyButton variant='primary'>{translate('admin.prices.create')}</MyButton>
      </div>

      {/* Services Table */}
      <MyCard>
        <MyCardBody>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-border'>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Tên dịch vụ</th>
                  <th className='text-right py-3 px-4 font-medium text-gray-500'>Đơn giá (VNĐ/kg)</th>
                  <th className='text-center py-3 px-4 font-medium text-gray-500'>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {mockServices.map((service) => (
                  <tr key={service.id} className='border-b border-border'>
                    <td className='py-3 px-4 font-medium'>{service.name}</td>
                    <td className='py-3 px-4 text-right'>{service.price.toLocaleString()}</td>
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
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminPricesPage
