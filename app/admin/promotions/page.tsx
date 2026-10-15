'use client'

import { useMemo, useState } from 'react'

import MyButton from '@/components/MyButton'
import MyBadge from '@/components/MyBadge'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyTable, { MyTableColumn } from '@/components/MyTable'
import MyInput from '@/components/MyInput'
import AdminDeleteConfirm from '@/components/admin/AdminDeleteConfirm'
import PromotionForm from '@/components/PromotionForm'
import { PAGE_SIZE, PROMOTION_STATUS } from '@/constants/app'
import useAdminPromotions from '@/hooks/admin/useAdminPromotions'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { getPromotionPeriodText, getPromotionStatus, PromotionItem } from '@/services/promotion'
import { getPromotionStatusBadgeVariant } from '@/utils/functions'

const STATUS_LABEL_KEY: Record<PROMOTION_STATUS, string> = {
  [PROMOTION_STATUS.ACTIVE]: 'promotions.active',
  [PROMOTION_STATUS.UPCOMING]: 'promotions.upcoming',
  [PROMOTION_STATUS.EXPIRED]: 'promotions.expired',
}

const AdminPromotionsPage = () => {
  const { translate } = useLanguage()
  const { open } = useModalDrawer()
  const { promotions, isLoading, deletePromotion, isDeleting } = useAdminPromotions()
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredPromotions = useMemo(
    () => promotions.filter((promotion) => promotion.title.toLowerCase().includes(search.trim().toLowerCase())),
    [promotions, search]
  )

  const totalPages = Math.max(1, Math.ceil(filteredPromotions.length / PAGE_SIZE))
  const paginatedPromotions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE

    return filteredPromotions.slice(start, start + PAGE_SIZE)
  }, [filteredPromotions, currentPage])

  const openForm = (promotion?: PromotionItem) => {
    open({
      mode: 'modal',
      title: translate(promotion ? 'admin.promotions.edit' : 'admin.promotions.create'),
      classNames: { container: 'md:w-[560px]' },
      children: <PromotionForm promotion={promotion} />,
    })
  }

  const confirmDelete = (promotion: PromotionItem) => {
    open({
      mode: 'modal',
      title: translate('admin.promotions.delete'),
      children: <AdminDeleteConfirm itemName={promotion.title} onConfirm={() => deletePromotion(promotion.id)} isDeleting={isDeleting} />,
    })
  }

  const columns: MyTableColumn<PromotionItem>[] = [
    {
      key: 'title',
      title: translate('admin.promotions.name'),
      className: 'font-medium',
      render: (promotion) => (
        <div className='min-w-0'>
          <p className='font-medium text-text'>{promotion.title}</p>
          {promotion.description && <p className='mt-0.5 line-clamp-1 text-xs text-gray-500'>{promotion.description}</p>}
        </div>
      ),
    },
    {
      key: 'discountPercent',
      title: translate('admin.promotions.discountPercent'),
      align: 'center',
      render: (promotion) => (promotion.discountPercent ? translate('promotions.discount', { percent: promotion.discountPercent }) : '—'),
    },
    {
      key: 'period',
      title: translate('admin.promotions.period'),
      render: (promotion) => getPromotionPeriodText(promotion, translate),
    },
    {
      key: 'status',
      title: translate('common.status'),
      align: 'center',
      render: (promotion) => {
        const status = getPromotionStatus(promotion)

        return <MyBadge variant={getPromotionStatusBadgeVariant(status)}>{translate(STATUS_LABEL_KEY[status])}</MyBadge>
      },
    },
    {
      key: 'actions',
      title: translate('common.actions'),
      align: 'center',
      render: (promotion) => (
        <div className='flex items-center justify-center gap-2'>
          <button type='button' onClick={() => openForm(promotion)} className='px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded-lg'>
            {translate('common.edit')}
          </button>
          <button type='button' onClick={() => confirmDelete(promotion)} className='px-3 py-1 text-xs text-red-600 border border-red-600 rounded-lg'>
            {translate('common.delete')}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.promotions.title')}</h1>
        <MyButton variant='primary' onClick={() => openForm()}>
          {translate('admin.promotions.create')}
        </MyButton>
      </div>

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

      <MyCard>
        <MyCardBody>
          <MyTable
            columns={columns}
            data={paginatedPromotions}
            rowKey={(promotion) => promotion.id}
            loading={isLoading}
            emptyMessage={translate('common.noData')}
            pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
          />
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminPromotionsPage
