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

        <section className='relative isolate mt-16 overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-card sm:p-8 lg:p-10'>
          {/* Decorative layers: grid + soft glows */}
          <div aria-hidden className='bg-tech-grid pointer-events-none absolute inset-0 -z-10 text-primary' />
          <div
            aria-hidden
            className='pointer-events-none absolute -top-24 left-1/2 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-bright-cyan/15 blur-3xl'
          />
          <div aria-hidden className='pointer-events-none absolute -right-20 -bottom-24 -z-10 size-72 rounded-full bg-secondary/10 blur-3xl' />

          <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_24px_-6px_var(--color-primary)]'>
              <CalendarIcon className='size-6' />
            </div>
            <div className='min-w-0'>
              <h2 className='text-2xl font-extrabold tracking-tight text-text lg:text-3xl'>{translate('pricing.washTime.title')}</h2>
              <p className='mt-1 flex items-start gap-1.5 text-sm text-gray-500'>
                <InfoIcon className='mt-0.5 size-4 shrink-0 text-primary' />
                <span>{translate('pricing.washTime.subtitle')}</span>
              </p>
            </div>
          </div>

          <div className='mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3'>
            {washTimes.map((item, index) => (
              <div
                key={item.service}
                className='group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-white/80 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover'
              >
                {/* Top light line shown on hover */}
                <span
                  aria-hidden
                  className='absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-bright-cyan to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                />
                <div className='flex items-start justify-between gap-3'>
                  <p className='text-[15px] font-medium leading-snug text-gray-600'>{item.service}</p>
                  <span className='shrink-0 font-mono text-xs font-semibold text-primary/60'>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className='flex items-center gap-2.5'>
                  <span className='size-1.5 rounded-full bg-bright-cyan shadow-[0_0_8px_var(--color-bright-cyan)]' />
                  <span className='text-2xl font-bold tabular-nums tracking-tight text-text'>{item.time}</span>
                </div>
              </div>
            ))}
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
