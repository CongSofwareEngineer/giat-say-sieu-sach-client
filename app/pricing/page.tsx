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
import SeoJsonLd from '@/components/SeoJsonLd'
import useLanguage from '@/hooks/useLanguage'
import { breadcrumbSchema, localBusinessSchema, serviceSchema, SERVICE_OFFERS } from '@/config/seo'
import { cn } from '@/utils/tailwind'
import useGetListPrice from '@/hooks/reactQuery/useGetListPrice'

type TagProps = {
  children: ReactNode
}

const Tag = ({ children }: TagProps) => (
  <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-wider text-primary'>
    {children}
  </span>
)

type Plan = {
  id?: string
  name: string
  price: string
  unit: string
  description: string
  popular?: boolean
  features: string[]
}

type Extra = {
  name: string
  price: string
}

const PriceListPage = () => {
  const { translate, lang } = useLanguage()
  const [reviewServiceId, setReviewServiceId] = useState('all')
  const reviewRef = useRef<HTMLDivElement>(null)
  const { prices: plans, isLoading } = useGetListPrice()

  const mappedPlans: Plan[] = plans.map((plan: PricingPlan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price.toLocaleString('vi-VN') + 'đ',
    unit: '/' + plan.unit,
    description: plan.description,
    features: plan.features[lang] || plan.features.vn,
  }))

  const extras = (translate('pricing.extras') || []) as Extra[]

  const scrollToReviews = (serviceId: string) => {
    setReviewServiceId(serviceId)
    reviewRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className='py-16 lg:py-24'>
      <SeoJsonLd data={localBusinessSchema(SERVICE_OFFERS)} />
      <SeoJsonLd data={serviceSchema()} />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Bảng giá', path: '/pricing' },
        ])}
      />
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto mb-14 max-w-2xl text-center'>
          <Tag>{translate('pricing.tag')}</Tag>
          <h1 className='mt-4 text-3xl font-extrabold leading-tight text-text lg:text-4xl'>{translate('pricing.title')}</h1>
          <p className='mt-3 text-base leading-relaxed text-gray-500 lg:text-lg'>{translate('pricing.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className='text-center text-gray-500'>{translate('common.loading')}</div>
        ) : (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {mappedPlans.map((plan) => (
              <MyCard
                key={plan.name}
                className={cn(
                  'relative transition-transform duration-300 hover:-translate-y-1',
                  plan.popular && 'bg-linear-default border-primary shadow-card-hover ring-2 ring-primary xl:-translate-y-3 xl:hover:-translate-y-4'
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
                    {plan.price}
                    <span className='text-sm font-normal text-gray-500'>{plan.unit}</span>
                  </div>
                  <p className='mt-2 text-sm leading-relaxed text-gray-500'>{plan.description}</p>

                  <ul className='mt-5 flex-1 space-y-2.5'>
                    {plan.features.map((feature) => (
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
        )}

        <MyCard className='mt-14'>
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
        </MyCard>

        <p className='mt-10 text-center text-sm text-gray-500'>{translate('pricing.note')}</p>
      </div>

      <div ref={reviewRef} className='mx-auto mt-20 max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8'>
        <CommentSection
          tag={translate('reviews.tag')}
          title={translate('reviews.title')}
          subtitle={translate('reviews.subtitle')}
          serviceId={reviewServiceId}
          onServiceChange={setReviewServiceId}
        />
      </div>
    </div>
  )
}

export default PriceListPage
