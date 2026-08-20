'use client'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import MyPagination from '@/components/MyPagination'
import PriceForm from '@/components/PriceForm'
import { PricingPlan } from '@/services/pricing'
import useAdminListPrice from '@/hooks/reactQuery/useAdminListPrice'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'

const AdminPricesPage = () => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const { prices, isLoading, deletePlan, isDeleting } = useAdminListPrice()

  const openEdit = (plan: PricingPlan) => {
    open({
      title: translate('admin.prices.edit'),
      classNames: { container: 'md:w-[560px]' },
      children: <PriceForm plan={plan} />,
    })
  }

  const confirmDelete = (plan: PricingPlan) => {
    open({
      title: translate('admin.prices.delete'),
      children: (
        <div className='w-full'>
          <p className='mb-6 text-sm text-gray-600'>{translate('admin.prices.deleteConfirm')}</p>
          <div className='flex justify-end gap-3'>
            <MyButton variant='outline' onClick={() => close()}>
              {translate('common.cancel')}
            </MyButton>
            <MyButton
              variant='error'
              loading={isDeleting}
              onClick={async () => {
                await deletePlan(plan.id)
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
        <h1 className='text-2xl font-bold text-text'>{translate('admin.prices.title')}</h1>
        <MyButton variant='primary'>{translate('admin.prices.create')}</MyButton>
      </div>

      {/* Services Table */}
      <MyCard>
        <MyCardBody>
          {isLoading ? (
            <MyLoading />
          ) : prices.length === 0 ? (
            <MyEmpty message={translate('common.noData')} />
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='text-left py-3 px-4 font-medium text-gray-500'>Tên dịch vụ</th>
                    <th className='text-right py-3 px-4 font-medium text-gray-500'>Đơn giá (VNĐ/kg)</th>
                    <th className='text-center py-3 px-4 font-medium text-gray-500'>Trạng thái</th>
                    <th className='text-center py-3 px-4 font-medium text-gray-500'>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((service) => (
                    <tr key={service.id} className='border-b border-border'>
                      <td className='py-3 px-4 font-medium'>{service.name}</td>
                      <td className='py-3 px-4 text-right'>{service.price.toLocaleString()}</td>
                      <td className='py-3 px-4 text-center'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {service.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center justify-center gap-2'>
                          <button
                            type='button'
                            onClick={() => openEdit(service)}
                            className='px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded-lg'
                          >
                            {translate('common.edit')}
                          </button>
                          <button
                            type='button'
                            onClick={() => confirmDelete(service)}
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
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminPricesPage
