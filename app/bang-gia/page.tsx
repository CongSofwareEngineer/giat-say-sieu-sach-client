'use client'

import type { ReactNode } from 'react'

import Link from 'next/link'

import MyCard, { MyCardBody } from '@/components/MyCard'
import MyButton from '@/components/MyButton'
import { CheckBadgeIcon } from '@/components/Icons/CheckBadge'
import SeoJsonLd from '@/components/SeoJsonLd'
import useLanguage from '@/hooks/useLanguage'
import { breadcrumbSchema, localBusinessSchema, serviceSchema } from '@/config/seo'
import { cn } from '@/utils/tailwind'

type TagProps = {
  children: ReactNode
}

// Small pill label used above section titles
const Tag = ({ children }: TagProps) => (
  <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-wider text-primary'>
    {children}
  </span>
)

type Plan = {
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
  const { translate } = useLanguage()

  const plans = (translate('pricing.plans') || []) as Plan[]
  const extras = (translate('pricing.extras') || []) as Extra[]

  return (
    <div className='py-16 lg:py-24'>
      <SeoJsonLd
        data={localBusinessSchema([
          { name: 'Giặt Thường', price: '25000', description: 'Giặt máy tiêu chuẩn, sấy khô hoàn toàn' },
          { name: 'Giặt Nhanh', price: '40000', description: 'Xử lý ưu tiên, giao trong 4-6 giờ' },
          { name: 'Giặt Khô', price: '80000', description: 'Cho vest, comple, áo dài, đồ hiệu' },
          { name: 'Ủi', price: '15000', description: 'Ủi phẳng, thẳng nếp, chuyên nghiệp' },
          { name: 'Giặt + Ủi', price: '50000', description: 'Combo tiết kiệm, giặt sạch và ủi đẹp' },
        ])}
      />
      <SeoJsonLd data={serviceSchema()} />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Bảng giá', path: '/bang-gia' },
        ])}
      />
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Page header */}
        <div className='mx-auto mb-14 max-w-2xl text-center'>
          <Tag>{translate('pricing.tag')}</Tag>
          <h1 className='mt-4 text-3xl font-extrabold leading-tight text-text lg:text-4xl'>{translate('pricing.title')}</h1>
          <p className='mt-3 text-base leading-relaxed text-gray-500 lg:text-lg'>{translate('pricing.subtitle')}</p>
        </div>

        {/* Plans */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          {plans.map((plan) => (
            <MyCard
              key={plan.name}
              className={cn(
                'relative transition-transform duration-300 hover:-translate-y-1',
                plan.popular && 'border-primary shadow-card-hover ring-2 ring-primary xl:-translate-y-3 xl:hover:-translate-y-4'
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
                  <span className='text-sm font-normal text-gray-400'>{plan.unit}</span>
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

                <Link href='/dat-lich' className='mt-6 block w-full'>
                  <MyButton variant={plan.popular ? 'default' : 'primary'} className='w-full'>
                    {translate('pricing.bookNow')}
                  </MyButton>
                </Link>
              </MyCardBody>
            </MyCard>
          ))}
        </div>

        {/* Extra services */}
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

        {/* Note */}
        <p className='mt-10 text-center text-sm text-gray-500'>{translate('pricing.note')}</p>
      </div>
    </div>
  )
}

export default PriceListPage
