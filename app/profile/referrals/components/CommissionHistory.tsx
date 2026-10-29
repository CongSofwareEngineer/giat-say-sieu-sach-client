'use client'

import { useState } from 'react'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyEmpty from '@/components/MyEmpty'
import MyTable, { MyTableColumn } from '@/components/MyTable'
import useLanguage from '@/hooks/useLanguage'
import { useGetReferralCommissions } from '@/hooks/reactQuery/useGetReferrals'
import { ReferralCommission } from '@/services/referral'
import { formatDate } from '@/utils/date'

// One row per completed order of a referred customer
const CommissionHistory = () => {
  const { translate } = useLanguage()
  const [page, setPage] = useState(1)
  const { commissions, totalPages, isLoading, isError, refetch } = useGetReferralCommissions(page)

  const columns: MyTableColumn<ReferralCommission>[] = [
    {
      key: 'order',
      title: translate('referral.commissions.order'),
      render: (commission) => (
        <div>
          <p className='font-medium text-text'>{commission.orderCode ? `#${commission.orderCode}` : '—'}</p>
          <p className='text-xs text-gray-500'>{commission.refereeName || '—'}</p>
        </div>
      ),
    },
    {
      key: 'date',
      title: translate('common.date'),
      className: 'whitespace-nowrap text-gray-600',
      render: (commission) => formatDate(commission.createdAt) || '—',
    },
    {
      key: 'amount',
      title: translate('referral.commissions.orderAmount'),
      align: 'right',
      className: 'whitespace-nowrap text-gray-600',
      render: (commission) => translate('tracking.result.price', { price: (commission.orderAmount ?? 0).toLocaleString('vi-VN') }),
    },
    {
      key: 'points',
      title: translate('referral.commissions.points'),
      align: 'right',
      className: 'whitespace-nowrap font-semibold text-emerald-700',
      render: (commission) => `+${translate('referral.pointsValue', { points: commission.points.toLocaleString('vi-VN') })}`,
    },
  ]

  return (
    <MyCard>
      <MyCardHeader>
        <h2 className='text-lg font-bold text-text'>{translate('referral.commissions.title')}</h2>
        <p className='text-sm text-gray-500'>{translate('referral.commissions.subtitle')}</p>
      </MyCardHeader>
      <MyCardBody>
        {isError ? (
          <MyEmpty
            message={translate('referral.loadError')}
            action={
              <MyButton variant='outline' onClick={() => refetch()}>
                {translate('common.retry')}
              </MyButton>
            }
          />
        ) : (
          <MyTable
            columns={columns}
            data={commissions}
            rowKey={(commission) => commission.id}
            loading={isLoading}
            emptyMessage={translate('referral.commissions.empty')}
            pagination={{ currentPage: page, totalPages, onPageChange: setPage }}
          />
        )}
      </MyCardBody>
    </MyCard>
  )
}

export default CommissionHistory
