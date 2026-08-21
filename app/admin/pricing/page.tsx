'use client'

import { useMemo, useState } from 'react'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import MyPagination from '@/components/MyPagination'
import MyInput from '@/components/MyInput'
import AdminDeleteConfirm from '@/components/admin/AdminDeleteConfirm'
import PriceForm from '@/components/PriceForm'
import { PricingPlan } from '@/services/pricing'
import useAdminPricing from '@/hooks/admin/useAdminPricing'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'

const AdminPricesPage = () => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const { plans, isLoading, createPlan, updatePlan, deletePlan, isCreating, isUpdating, isDeleting } = useAdminPricing()
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredPlans = useMemo(() => plans.filter((plan) => plan.name.toLowerCase().includes(search.toLowerCase())), [plans, search])

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / pageSize))
  const paginatedPlans = useMemo(() => {
    const start = (currentPage - 1) * pageSize

    return filteredPlans.slice(start, start + pageSize)
  }, [filteredPlans, currentPage])

  const openCreate = () => {
    open({
      mode: 'modal',
      title: translate('admin.prices.create'),
      classNames: { container: 'md:w-[560px]' },
      children: <PriceForm />,
    })
  }

  const openEdit = (plan: PricingPlan) => {
    open({
      mode: 'modal',
      title: translate('admin.prices.edit'),
      classNames: { container: 'md:w-[560px]' },
      children: <PriceForm plan={plan} />,
    })
  }

  const confirmDelete = (plan: PricingPlan) => {
    open({
      mode: 'modal',
      title: translate('admin.prices.delete'),
      children: <AdminDeleteConfirm itemName={plan.name} onConfirm={() => deletePlan(plan.id)} isDeleting={isDeleting} />,
    })
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.prices.title')}</h1>
        <MyButton variant='primary' onClick={openCreate}>
          {translate('admin.prices.create')}
        </MyButton>
      </div>

      {/* Filters */}
      <MyCard>
        <MyCardBody>
          <MyInput
            placeholder={translate('common.search')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className='max-w-md'
          />
        </MyCardBody>
      </MyCard>

      {/* Services Table */}
      <MyCard>
        <MyCardBody>
          {isLoading ? (
            <MyLoading />
          ) : paginatedPlans.length === 0 ? (
            <MyEmpty message={translate('common.noData')} />
          ) : (
            <>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-border'>
                      <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('admin.prices.name', {}, 'Tên dịch vụ')}</th>
                      <th className='text-right py-3 px-4 font-medium text-gray-500'>{translate('admin.prices.price', {}, 'Đơn giá')}</th>
                      <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('common.status')}</th>
                      <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPlans.map((service) => (
                      <tr key={service.id} className='border-b border-border'>
                        <td className='py-3 px-4 font-medium'>{service.name}</td>
                        <td className='py-3 px-4 text-right'>{service.price.toLocaleString()}</td>
                        <td className='py-3 px-4 text-center'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {service.isActive
                              ? translate('admin.prices.active', {}, 'Đang hoạt động')
                              : translate('admin.prices.inactive', {}, 'Không hoạt động')}
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

export default AdminPricesPage
