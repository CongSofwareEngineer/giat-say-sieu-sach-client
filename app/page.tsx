'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'

import MyCard, { MyCardBody } from '@/components/MyCard'
import MyButton from '@/components/MyButton'
import { CheckBadgeIcon } from '@/components/Icons/CheckBadge'
import StarIcon from '@/components/Icons/Star'
import { ArrowDownIcon } from '@/components/Icons/ArrowDown'
import { ArrowUpIcon } from '@/components/Icons/ArrowUp'
import InboxIcon from '@/components/Icons/Inbox'
import CalendarIcon from '@/components/Icons/Calendar'
import SparklesIcon from '@/components/Icons/Home/Sparkles'
import { PaymentIcon } from '@/components/Icons/Payment'
import SmartPhoneIcon from '@/components/Icons/Home/SmartPhone'
import ChatBubbleIcon from '@/components/Icons/ChatBubble'
import AwardIcon from '@/components/Icons/Home/Award'
import SeoJsonLd from '@/components/SeoJsonLd'
import useLanguage from '@/hooks/useLanguage'
import { breadcrumbSchema, faqSchema, localBusinessSchema, SEO_FAQS, SERVICE_OFFERS } from '@/config/seo'
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

type SectionHeaderProps = {
  tag?: string
  title: string
  subtitle?: string
}

// Reusable centered section header (tag + title + subtitle)
const SectionHeader = ({ tag, title, subtitle }: SectionHeaderProps) => (
  <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-16'>
    {tag && <Tag>{tag}</Tag>}
    <h2 className='mt-4 text-3xl font-extrabold leading-tight text-text lg:text-4xl'>{title}</h2>
    {subtitle && <p className='mt-3 text-base leading-relaxed text-gray-500 lg:text-lg'>{subtitle}</p>}
  </div>
)

const HomePage = () => {
  const { translate } = useLanguage()
  const [openFaq, setOpenFaq] = useState(0)

  const heroStats = [
    { value: translate('home.hero.statsCustomersValue'), label: translate('home.hero.statsCustomersLabel') },
    { value: translate('home.hero.statsOrdersValue'), label: translate('home.hero.statsOrdersLabel') },
    { value: translate('home.hero.statsRatingValue'), label: translate('home.hero.statsRatingLabel') },
  ]

  const processSteps = [
    { step: '01', title: translate('home.process.step1'), description: translate('home.process.step1Desc') },
    { step: '02', title: translate('home.process.step2'), description: translate('home.process.step2Desc') },
    { step: '03', title: translate('home.process.step3'), description: translate('home.process.step3Desc') },
    { step: '04', title: translate('home.process.step4'), description: translate('home.process.step4Desc') },
  ]

  const benefits = [
    { icon: InboxIcon, title: translate('home.benefits.pickup'), description: translate('home.benefits.pickupDesc') },
    { icon: CalendarIcon, title: translate('home.benefits.ontime'), description: translate('home.benefits.ontimeDesc') },
    { icon: SparklesIcon, title: translate('home.benefits.clean'), description: translate('home.benefits.cleanDesc') },
    { icon: PaymentIcon, title: translate('home.benefits.price'), description: translate('home.benefits.priceDesc') },
    { icon: SmartPhoneIcon, title: translate('home.benefits.track'), description: translate('home.benefits.trackDesc') },
    { icon: ChatBubbleIcon, title: translate('home.benefits.support'), description: translate('home.benefits.supportDesc') },
  ]

  const plans = [
    {
      name: translate('home.pricing.plan1Name'),
      price: translate('home.pricing.plan1Price'),
      description: translate('home.pricing.plan1Desc'),
      popular: false,
    },
    {
      name: translate('home.pricing.plan2Name'),
      price: translate('home.pricing.plan2Price'),
      description: translate('home.pricing.plan2Desc'),
      popular: true,
    },
    {
      name: translate('home.pricing.plan3Name'),
      price: translate('home.pricing.plan3Price'),
      description: translate('home.pricing.plan3Desc'),
      popular: false,
    },
    {
      name: translate('home.pricing.plan4Name'),
      price: translate('home.pricing.plan4Price'),
      description: translate('home.pricing.plan4Desc'),
      popular: false,
    },
  ]

  const commitments = [
    { icon: AwardIcon, title: translate('home.commitment.warranty'), description: translate('home.commitment.warrantyDesc') },
    { icon: CheckBadgeIcon, title: translate('home.commitment.privacy'), description: translate('home.commitment.privacyDesc') },
    { icon: PaymentIcon, title: translate('home.commitment.compensation'), description: translate('home.commitment.compensationDesc') },
  ]

  const feedbacks = [
    { comment: translate('home.feedback.item1Comment'), name: translate('home.feedback.item1Name'), role: translate('home.feedback.item1Role') },
    { comment: translate('home.feedback.item2Comment'), name: translate('home.feedback.item2Name'), role: translate('home.feedback.item2Role') },
    { comment: translate('home.feedback.item3Comment'), name: translate('home.feedback.item3Name'), role: translate('home.feedback.item3Role') },
  ]

  const faqs = [
    { question: translate('home.faq.q1'), answer: translate('home.faq.a1') },
    { question: translate('home.faq.q2'), answer: translate('home.faq.a2') },
    { question: translate('home.faq.q3'), answer: translate('home.faq.a3') },
    { question: translate('home.faq.q4'), answer: translate('home.faq.a4') },
    { question: translate('home.faq.q5'), answer: translate('home.faq.a5') },
  ]

  return (
    <div>
      <SeoJsonLd data={localBusinessSchema(SERVICE_OFFERS)} />
      <SeoJsonLd data={faqSchema(SEO_FAQS)} />
      <SeoJsonLd data={breadcrumbSchema([{ name: 'Trang chủ', path: '/' }])} />
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5'>
        <div className='pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl' />

        <div className='relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24'>
          <div className='grid items-center gap-14 lg:grid-cols-2 lg:gap-16'>
            {/* Hero copy */}
            <div>
              <Tag>{translate('home.hero.tag')}</Tag>
              <h1 className='mt-5 text-4xl font-extrabold leading-tight text-text sm:text-5xl lg:text-[3.4rem]'>
                <span className='bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>{translate('home.hero.title1')}</span>
                <br />
                {translate('home.hero.title2')}
              </h1>
              <p className='mt-5 max-w-xl text-lg leading-relaxed text-gray-600'>{translate('home.hero.description')}</p>

              <div className='mt-8 flex flex-col gap-4 sm:flex-row'>
                <Link href='/booking' className='sm:flex-none'>
                  <MyButton variant='default' size='large' className='w-full px-8'>
                    {translate('home.hero.bookCta')}
                  </MyButton>
                </Link>
                <Link
                  href='/track-order'
                  className='inline-flex items-center justify-center rounded-xl border-2 border-primary px-8 py-3 text-base font-bold text-primary transition-all duration-250 hover:bg-primary hover:text-white sm:flex-none'
                >
                  {translate('home.hero.trackCta')}
                </Link>
              </div>

              {/* Stats */}
              <div className='mt-12 grid max-w-md grid-cols-3 gap-6'>
                {heroStats.map((stat) => (
                  <div key={stat.label}>
                    <div className='text-2xl font-extrabold text-text lg:text-3xl'>{stat.value}</div>
                    <div className='mt-1 text-xs text-gray-500 lg:text-sm'>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual - order card mockup */}
            <div className='relative mx-auto w-full max-w-md lg:max-w-none'>
              <div className='pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/20 blur-2xl' />
              <div className='pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-secondary/20 blur-2xl' />

              <MyCard className='relative rotate-1 rounded-3xl shadow-card-hover'>
                <MyCardBody className='p-6 lg:p-8'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white'>
                        <CheckBadgeIcon className='h-6 w-6' />
                      </div>
                      <div>
                        <p className='font-bold text-text'>{translate('home.hero.orderCode')}</p>
                        <p className='mt-0.5 flex items-center gap-1.5 text-sm text-gray-500'>
                          <span className='inline-block h-1.5 w-1.5 rounded-full bg-secondary' />
                          {translate('home.hero.orderStatus')}
                        </p>
                      </div>
                    </div>
                    <span className='text-sm font-bold text-primary'>✓</span>
                  </div>

                  <div className='mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-100'>
                    <div className='h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-secondary' />
                  </div>
                  <div className='mt-3 flex justify-between text-xs text-gray-500'>
                    <span>{translate('home.process.step2')}</span>
                    <span>{translate('home.process.step3')}</span>
                    <span>{translate('home.process.step4')}</span>
                  </div>
                </MyCardBody>
              </MyCard>

              {/* Floating rating card */}
              <MyCard className='absolute -bottom-8 -left-4 flex items-center gap-3 rounded-2xl px-5 py-4 shadow-card-hover lg:-left-10'>
                <StarIcon className='h-8 w-8 text-yellow-400' fill='currentColor' strokeWidth={0} />
                <div>
                  <p className='text-2xl font-extrabold leading-none text-text'>{translate('home.hero.orderRatingValue')}</p>
                  <p className='mt-1 text-xs text-gray-500'>{translate('home.hero.orderRatingLabel')}</p>
                </div>
              </MyCard>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className='py-16 lg:py-24'>
        <SectionHeader tag={translate('home.process.tag')} title={translate('home.process.title')} subtitle={translate('home.process.subtitle')} />
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {processSteps.map((step) => (
              <MyCard key={step.step} className='group transition-transform duration-300 hover:-translate-y-1'>
                <MyCardBody className='p-6 lg:p-7'>
                  <span className='text-5xl font-extrabold text-primary transition-colors group-hover:text-secondary'>{step.step}</span>
                  <h3 className='mt-4 text-lg font-bold text-text'>{step.title}</h3>
                  <p className='mt-2 text-sm leading-relaxed text-gray-500'>{step.description}</p>
                </MyCardBody>
              </MyCard>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className='bg-white py-16 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <SectionHeader tag={translate('home.benefits.tag')} title={translate('home.benefits.title')} />
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {benefits.map((benefit) => (
              <MyCard key={benefit.title} className='group transition-transform duration-300 hover:-translate-y-1'>
                <MyCardBody className='flex items-start gap-4 p-6'>
                  <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:text-white'>
                    <benefit.icon className='h-6 w-6' />
                  </div>
                  <div>
                    <h3 className='font-bold text-text'>{benefit.title}</h3>
                    <p className='mt-1 text-sm leading-relaxed text-gray-500'>{benefit.description}</p>
                  </div>
                </MyCardBody>
              </MyCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className='py-16 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <SectionHeader tag={translate('home.pricing.tag')} title={translate('home.pricing.title')} subtitle={translate('home.pricing.subtitle')} />
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {plans.map((plan) => (
              <MyCard
                key={plan.name}
                className={cn(
                  'relative text-center transition-transform duration-300 hover:-translate-y-1',
                  plan.popular && 'border-primary shadow-card-hover ring-2 ring-primary lg:-translate-y-3 lg:hover:-translate-y-4'
                )}
              >
                <MyCardBody className='p-6 lg:p-7'>
                  {plan.popular && (
                    <div className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-secondary px-3.5 py-1 text-[11px] font-bold tracking-wider text-white shadow-md'>
                      {translate('home.pricing.popular')}
                    </div>
                  )}
                  <h3 className='text-lg font-bold text-text'>{plan.name}</h3>
                  <div className='mt-3 text-4xl font-extrabold text-primary'>
                    {plan.price}
                    <span className='text-base font-normal text-gray-500'>{translate('home.pricing.perKg')}</span>
                  </div>
                  <p className='mt-3 text-sm leading-relaxed text-gray-500'>{plan.description}</p>
                  <Link href='/booking' className='mt-6 block w-full sm:flex-none'>
                    <MyButton variant={plan.popular ? 'default' : 'primary'} className='w-full'>
                      {translate('home.pricing.bookNow')}
                    </MyButton>
                  </Link>
                </MyCardBody>
              </MyCard>
            ))}
          </div>
          <div className='mt-10 text-center'>
            <Link href='/pricing' className='inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary-dark'>
              {translate('home.pricing.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className='bg-gradient-to-br from-primary to-secondary py-16 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-16'>
            <h2 className='text-3xl font-extrabold leading-tight text-white lg:text-4xl'>{translate('home.commitment.title')}</h2>
          </div>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {commitments.map((commitment) => (
              <div key={commitment.title} className='text-center text-white'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15'>
                  <commitment.icon className='h-8 w-8' />
                </div>
                <h3 className='mt-5 text-lg font-bold'>{commitment.title}</h3>
                <p className='mt-2 text-sm leading-relaxed text-white'>{commitment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className='py-16 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <SectionHeader tag={translate('home.feedback.tag')} title={translate('home.feedback.title')} />
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {feedbacks.map((feedback) => (
              <MyCard key={feedback.name} className='transition-transform duration-300 hover:-translate-y-1'>
                <MyCardBody className='p-6 lg:p-7'>
                  <div className='flex items-center gap-1'>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <StarIcon key={index} className='h-4 w-4 text-yellow-400' fill='currentColor' strokeWidth={0} />
                    ))}
                  </div>
                  <p className='mt-4 text-sm leading-relaxed text-gray-600'>&quot;{feedback.comment}&quot;</p>
                  <div className='mt-6 flex items-center gap-3 border-t border-border pt-5'>
                    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-bold text-white'>
                      {feedback.name.charAt(0)}
                    </div>
                    <div>
                      <p className='font-semibold text-text'>{feedback.name}</p>
                      <p className='text-xs text-gray-500'>{feedback.role}</p>
                    </div>
                  </div>
                </MyCardBody>
              </MyCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className='bg-white py-16 lg:py-24'>
        <div className='mx-auto max-w-3xl px-4 sm:px-6 lg:px-8'>
          <SectionHeader title={translate('home.faq.title')} />
          <div className='space-y-4'>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index

              return (
                <MyCard key={faq.question} className='overflow-hidden'>
                  <button
                    type='button'
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className='flex w-full items-center justify-between gap-4 p-5 text-left lg:p-6'
                    aria-expanded={isOpen}
                  >
                    <span className='font-semibold text-text'>{faq.question}</span>
                    {isOpen ? (
                      <ArrowUpIcon className='h-5 w-5 flex-shrink-0 text-primary' />
                    ) : (
                      <ArrowDownIcon className='h-5 w-5 flex-shrink-0 text-gray-500' />
                    )}
                  </button>
                  <div className={cn('grid transition-all duration-300', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                    <div className='overflow-hidden'>
                      <p className='px-5 pb-5 text-sm leading-relaxed text-gray-500 lg:px-6 lg:pb-6'>{faq.answer}</p>
                    </div>
                  </div>
                </MyCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary px-6 py-14 text-center shadow-card-hover lg:px-12 lg:py-20'>
            <div className='pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl' />
            <div className='pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl' />
            <div className='relative'>
              <h2 className='text-3xl font-extrabold leading-tight text-white lg:text-4xl'>{translate('home.cta.title')}</h2>
              <p className='mx-auto mt-4 max-w-xl text-lg text-white'>{translate('home.cta.subtitle')}</p>
              <div className='mt-8'>
                <Link
                  href='/booking'
                  className='inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-bold text-primary shadow-lg transition-all duration-250 hover:-translate-y-0.5 hover:shadow-xl'
                >
                  {translate('home.cta.button')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
