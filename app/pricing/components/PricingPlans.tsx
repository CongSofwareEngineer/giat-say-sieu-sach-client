'use client'

import type { ReactNode } from 'react'
import type { PricingPlan } from '@/services/pricing'

import { useRef, useState } from 'react'
import Link from 'next/link'

import MyCard, { MyCardBody } from '@/components/MyCard'
import MyButton from '@/components/MyButton'
import CommentSection from '@/components/Comment/CommentSection'
import { CheckBadgeIcon } from '@/components/Icons/CheckBadge'
import ChatBubbleIcon from '@/components/Icons/ChatBubble'
import CalendarIcon from '@/components/Icons/Calendar'
import { InfoIcon } from '@/components/Icons/Info'
import useLanguage from '@/hooks/useLanguage'
import { cn } from '@/utils/tailwind'
import { convertPriceToCurrent } from '@/utils/functions'

type TagProps = {
  children: ReactNode
}

const Tag = ({ children }: TagProps) => (
  <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-wider text-primary'>
    {children}
  </span>
)

type PricingPlansProps = {
  // Plans fetched on the server
  plans: PricingPlan[]
}

const PricingPlans = ({ plans }: PricingPlansProps) => {
  const { translate, lang } = useLanguage()
  const [reviewServiceId, setReviewServiceId] = useState(plans[0]?.id ?? '')
  const reviewRef = useRef<HTMLDivElement>(null)

  // Expected washing time per service, a static note kept in the language files
  const rawWashTimes = translate('pricing.washTime.items')
  const washTimes: { service: string; time: string }[] = Array.isArray(rawWashTimes) ? rawWashTimes : []

  const scrollToReviews = (serviceId: string) => {
    setReviewServiceId(serviceId)
    reviewRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto mb-14 max-w-2xl text-center'>
          <Tag>{translate('pricing.tag')}</Tag>
          <h1 className='mt-4 text-3xl font-extrabold leading-tight text-text lg:text-4xl'>{translate('pricing.title')}</h1>
          <p className='mt-3 text-base leading-relaxed text-gray-500 lg:text-lg'>{translate('pricing.subtitle')}</p>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {plans.map((plan) => (
            <MyCard
              key={plan.name}
              className={cn(
                'relative transition-transform duration-300 hover:-translate-y-1',
                plan.popular &&
                  'plan-popular-glow bg-linear-default border-primary shadow-card-hover ring-2 ring-primary xl:-translate-y-3 xl:hover:-translate-y-4'
              )}
            >
              <MyCardBody className='flex h-full flex-col p-6 lg:p-7'>
                {plan.popular && (
                  <div className='absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-secondary px-3.5 py-1 text-[11px] font-bold tracking-wider text-white shadow-md'>
                    {translate('pricing.popular')}
                  </div>
                )}
                <h3 className='text-lg font-bold text-text'>{plan.name}</h3>
                <div className='mt-2 text-3xl font-extrabold text-primary'>
                  {convertPriceToCurrent(plan.price)}/<span className='text-sm font-normal text-gray-500'>{plan.unit}</span>
                </div>
                <p className='mt-2 text-sm leading-relaxed text-gray-500'>{plan.description}</p>

                <ul className='mt-5 flex-1 space-y-2.5'>
                  {plan.features?.[lang]?.map((feature) => (
                    <li key={feature} className='flex items-start gap-2 text-sm text-gray-600'>
                      <CheckBadgeIcon className='mt-0.5 h-4 w-4 flex-shrink-0 text-secondary' />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href='/booking' className='mt-6 block w-full'>
                  <MyButton variant={plan.popular ? 'default' : 'primary'} className='w-full'>
                    {translate('pricing.bookNow')}
                  </MyButton>
                </Link>

                {plan.id && (
                  <MyButton variant='outline' className='mt-3 w-full' onClick={() => scrollToReviews(plan.id!)}>
                    <ChatBubbleIcon className='mr-1 h-4 w-4' />
                    {translate('pricing.reviews')}
                  </MyButton>
                )}
              </MyCardBody>
            </MyCard>
          ))}
        </div>

        {/* <MyCard className='mt-14'>
          <MyCardBody className='p-6 lg:p-8'>
            <h2 className='text-xl font-bold text-text lg:text-2xl'>{translate('pricing.extraTitle')}</h2>
            <div className='mt-6 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3'>
              {extras.map((extra) => (
                <div key={extra.name} className='flex items-center justify-between gap-4 border-b border-border pb-3'>
                  <span className='text-sm text-gray-600 lg:text-base'>{extra.name}</span>
                  <span className='flex-shrink-0 text-sm font-semibold text-primary lg:text-base'>{extra.price}</span>
                </div>
              ))}
            </div>
          </MyCardBody>
        </MyCard> */}

        <section className='mt-16 overflow-hidden rounded-3xl border border-border bg-linear-default p-6 shadow-card sm:p-8 lg:p-10'>
          <div className='mx-auto max-w-2xl text-center'>
            <div className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-md'>
              <CalendarIcon className='size-6' />
            </div>
            <h2 className='mt-4 text-2xl font-extrabold text-text lg:text-3xl'>{translate('pricing.washTime.title')}</h2>
          </div>

          <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {washTimes.map((item, index) => (
              <div
                key={item.service}
                className='group flex items-center gap-4 rounded-2xl border border-border bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover sm:p-5'
              >
                <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white'>
                  {index + 1}
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-semibold leading-snug text-text sm:text-base'>{item.service}</p>
                  <span className='mt-1.5 inline-flex rounded-full bg-secondary/10 px-3 py-1 text-sm font-bold text-secondary'>{item.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-6 flex items-start gap-2 rounded-2xl bg-white/70 px-4 py-3 text-sm text-gray-600'>
            <InfoIcon className='mt-0.5 size-4 shrink-0 text-primary' />
            <p>{translate('pricing.washTime.subtitle')}</p>
          </div>
        </section>

        <p className='mt-10 text-center text-sm text-gray-500'>{translate('pricing.note')}</p>
      </div>
      {reviewServiceId && (
        <div ref={reviewRef} className='mx-auto mt-20 max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8'>
          <CommentSection
            tag={translate('reviews.tag')}
            title={translate('reviews.title')}
            subtitle={translate('reviews.subtitle')}
            serviceId={reviewServiceId}
            onServiceChange={setReviewServiceId}
          />
        </div>
      )}
    </>
  )
}

export default PricingPlans
