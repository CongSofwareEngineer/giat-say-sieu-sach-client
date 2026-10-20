'use client'

import type { PromotionItem } from '@/services/promotion'

import Link from 'next/link'

import MyCard, { MyCardBody } from '@/components/MyCard'
import MyButton from '@/components/MyButton'
import MyBadge from '@/components/MyBadge'
import MyEmpty from '@/components/MyEmpty'
import CalendarIcon from '@/components/Icons/Calendar'
import GiftIcon from '@/components/Icons/Gift'
import useLanguage from '@/hooks/useLanguage'
import { PROMOTION_STATUS } from '@/constants/app'
import { getPromotionDiscountText, getPromotionPeriodText } from '@/services/promotion'
import { getPromotionStatusBadgeVariant } from '@/utils/functions'

type PromotionListProps = {
  // Running + upcoming promotions, status computed on the server
  promotions: { promotion: PromotionItem; status: PROMOTION_STATUS }[]
}

const PromotionList = ({ promotions }: PromotionListProps) => {
  const { translate } = useLanguage()

  return (
    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-14'>
        <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-wider text-primary'>
          {translate('promotions.tag')}
        </span>
        <h1 className='mt-4 text-3xl font-extrabold leading-tight text-text lg:text-4xl'>{translate('promotions.title')}</h1>
        <p className='mt-3 text-base leading-relaxed text-gray-500 lg:text-lg'>{translate('promotions.subtitle')}</p>
      </div>

      {promotions.length === 0 ? (
        <MyCard>
          <MyEmpty
            message={translate('promotions.empty')}
            action={
              <Link href='/booking'>
                <MyButton variant='primary'>{translate('promotions.bookNow')}</MyButton>
              </Link>
            }
          />
        </MyCard>
      ) : (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {promotions.map(({ promotion, status }) => (
            <MyCard key={promotion.id} className='relative overflow-hidden transition-transform duration-300 hover:-translate-y-1'>
              <MyCardBody className='flex h-full flex-col p-6'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white'>
                    <GiftIcon className='size-6' />
                  </div>
                  {!!promotion.discountValue && (
                    <span className='rounded-full bg-accent px-3 py-1 text-sm font-extrabold text-text'>
                      {getPromotionDiscountText(promotion, translate)}
                    </span>
                  )}
                </div>

                <h2 className='mt-4 text-lg font-bold text-text'>{promotion.name}</h2>
                {promotion.code && (
                  <p className='mt-1 text-sm text-gray-600'>
                    {translate('promotions.code')} <span className='font-mono font-bold text-primary'>{promotion.code}</span>
                  </p>
                )}
                <div className='flex-1'>
                  {promotion.description && <p className='mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-500'>{promotion.description}</p>}
                </div>

                <div className='mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600'>
                  <CalendarIcon className='size-4 shrink-0 text-primary' />
                  <span>{getPromotionPeriodText(promotion, translate)}</span>
                  <MyBadge variant={getPromotionStatusBadgeVariant(status)}>
                    {translate(status === PROMOTION_STATUS.UPCOMING ? 'promotions.upcoming' : 'promotions.active')}
                  </MyBadge>
                </div>

                {status === PROMOTION_STATUS.ACTIVE && (
                  <Link href='/booking' className='mt-5 block'>
                    <MyButton variant='primary' className='w-full'>
                      {translate('promotions.bookNow')}
                    </MyButton>
                  </Link>
                )}
              </MyCardBody>
            </MyCard>
          ))}
        </div>
      )}

      <p className='mt-10 text-center text-sm text-gray-500'>{translate('promotions.note')}</p>
    </div>
  )
}

export default PromotionList
