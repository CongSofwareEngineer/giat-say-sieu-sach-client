'use client'

import { useState } from 'react'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyEmpty from '@/components/MyEmpty'
import MyImage from '@/components/MyImage'
import MyTable, { MyTableColumn } from '@/components/MyTable'
import { UserCircleIcon } from '@/components/Icons/UserCircle'
import useLanguage from '@/hooks/useLanguage'
import { useGetReferees } from '@/hooks/reactQuery/useGetReferrals'
import { Referee } from '@/services/referral'
import { formatDate } from '@/utils/date'

// People who created an account from my link, with the commission earned from each
const RefereeList = () => {
  const { translate } = useLanguage()
  const [page, setPage] = useState(1)
  const { referees, totalPages, isLoading, isError, refetch } = useGetReferees(page)

  const columns: MyTableColumn<Referee>[] = [
    {
      key: 'name',
      title: translate('referral.referees.customer'),
      render: (referee) => (
        <div className='flex items-center gap-3'>
          <div className='relative size-9 shrink-0 overflow-hidden rounded-full bg-gray-100'>
            {referee.avatar ? (
              <MyImage src={referee.avatar} alt={translate('common.avatar')} fill className='object-cover' sizes='36px' />
            ) : (
              <UserCircleIcon className='size-9 text-gray-400' />
            )}
          </div>
          <div className='min-w-0'>
            <p className='truncate font-medium text-text'>{referee.name}</p>
            <p className='text-xs text-gray-500'>{referee.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'joinedAt',
      title: translate('referral.referees.joinedAt'),
      className: 'whitespace-nowrap text-gray-600',
      render: (referee) => formatDate(referee.joinedAt) || '—',
    },
    {
      key: 'orders',
      title: translate('referral.referees.orders'),
      align: 'center',
      render: (referee) => referee.completedOrders.toLocaleString('vi-VN'),
    },
    {
      key: 'points',
      title: translate('referral.referees.commission'),
      align: 'right',
      className: 'whitespace-nowrap font-semibold text-primary',
      render: (referee) => translate('referral.pointsValue', { points: referee.commissionPoints.toLocaleString('vi-VN') }),
    },
  ]

  return (
    <MyCard>
      <MyCardHeader>
        <h2 className='text-lg font-bold text-text'>{translate('referral.referees.title')}</h2>
        <p className='text-sm text-gray-500'>{translate('referral.referees.subtitle')}</p>
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
            data={referees}
            rowKey={(referee) => referee.id}
            loading={isLoading}
            emptyMessage={translate('referral.referees.empty')}
            pagination={{ currentPage: page, totalPages, onPageChange: setPage }}
          />
        )}
      </MyCardBody>
    </MyCard>
  )
}

export default RefereeList
