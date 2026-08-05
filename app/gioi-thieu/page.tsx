'use client'

import type { ReactNode } from 'react'

import MyCard, { MyCardBody } from '@/components/MyCard'
import MyImage from '@/components/MyImage'
import { CheckBadgeIcon } from '@/components/Icons/CheckBadge'
import { EyeIcon } from '@/components/Icons/Eye'
import ZapIcon from '@/components/Icons/Zap'
import ChatBubbleIcon from '@/components/Icons/ChatBubble'
import { UserCircleIcon } from '@/components/Icons/UserCircle'
import StarIcon from '@/components/Icons/Star'
import useLanguage from '@/hooks/useLanguage'
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

type Stat = {
  value: string
  label: string
}

type ValueItem = {
  title: string
  description: string
}

type Member = {
  name: string
  role: string
}

const AboutPage = () => {
  const { translate } = useLanguage()

  const stats = (translate('about.stats') || []) as Stat[]
  const values = (translate('about.values.items') || []) as ValueItem[]
  const members = (translate('about.team.members') || []) as Member[]

  const valueIcons = [CheckBadgeIcon, ChatBubbleIcon, UserCircleIcon, StarIcon]
  const valueIconStyles = [
    { box: 'bg-blue-100 text-blue-700', star: false },
    { box: 'bg-amber-100 text-amber-700', star: false },
    { box: 'bg-purple-100 text-purple-700', star: false },
    { box: 'bg-yellow-100 text-yellow-600', star: true },
  ]

  return (
    <div>
      {/* Hero / Story */}
      <section className='bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid items-center gap-14 lg:grid-cols-2'>
            <div>
              <Tag>{translate('about.tag')}</Tag>
              <h1 className='mt-4 text-4xl font-extrabold leading-tight text-text lg:text-[3.4rem]'>{translate('about.title')}</h1>
              <p className='mt-5 max-w-xl text-base leading-relaxed text-gray-600 lg:text-lg'>{translate('about.storyContent')}</p>

              <div className='mt-10 grid max-w-md grid-cols-3 gap-6'>
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className='text-3xl font-extrabold text-text lg:text-4xl'>{stat.value}</div>
                    <div className='mt-1 text-xs text-gray-500 lg:text-sm'>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className='relative'>
              <div className='pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-secondary/20 blur-2xl' />
              <div className='relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card-hover'>
                <MyImage src='/thumbnail.png' alt='Giặt Ủi Siêu Sạch' fill sizes='(min-width: 1024px) 50vw, 100vw' className='object-cover' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className='py-16 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            <MyCard className='transition-transform duration-300 hover:-translate-y-1'>
              <MyCardBody className='p-6 lg:p-8'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white'>
                  <EyeIcon className='h-6 w-6' />
                </div>
                <h2 className='mt-5 text-xl font-bold text-text'>{translate('about.vision.title')}</h2>
                <p className='mt-3 text-sm leading-relaxed text-gray-500 lg:text-base'>{translate('about.vision.content')}</p>
              </MyCardBody>
            </MyCard>
            <MyCard className='transition-transform duration-300 hover:-translate-y-1'>
              <MyCardBody className='p-6 lg:p-8'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white'>
                  <ZapIcon className='h-6 w-6' />
                </div>
                <h2 className='mt-5 text-xl font-bold text-text'>{translate('about.mission.title')}</h2>
                <p className='mt-3 text-sm leading-relaxed text-gray-500 lg:text-base'>{translate('about.mission.content')}</p>
              </MyCardBody>
            </MyCard>
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className='bg-white py-16 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-16'>
            <h2 className='text-3xl font-extrabold leading-tight text-text lg:text-4xl'>{translate('about.values.title')}</h2>
          </div>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
            {values.map((value, index) => {
              const Icon = valueIcons[index % valueIcons.length]
              const style = valueIconStyles[index % valueIconStyles.length]

              return (
                <MyCard key={value.title} className='group transition-transform duration-300 hover:-translate-y-1'>
                  <MyCardBody className='p-6 lg:p-7'>
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', style.box)}>
                      <Icon className='h-6 w-6' fill={style.star ? 'currentColor' : 'none'} strokeWidth={style.star ? 0 : 1.5} />
                    </div>
                    <h3 className='mt-5 text-lg font-bold text-text'>{value.title}</h3>
                    <p className='mt-2 text-sm leading-relaxed text-gray-500'>{value.description}</p>
                  </MyCardBody>
                </MyCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className='py-16 lg:py-24'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-16'>
            <h2 className='text-3xl font-extrabold leading-tight text-text lg:text-4xl'>{translate('about.team.title')}</h2>
            <p className='mt-3 text-base leading-relaxed text-gray-500 lg:text-lg'>{translate('about.team.subtitle')}</p>
          </div>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {members.map((member) => (
              <MyCard key={member.name} className='text-center transition-transform duration-300 hover:-translate-y-1'>
                <MyCardBody className='p-6 lg:p-7'>
                  <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white'>
                    {member.name.charAt(0)}
                  </div>
                  <h3 className='mt-5 text-lg font-bold text-text'>{member.name}</h3>
                  <p className='mt-1 text-sm text-gray-500'>{member.role}</p>
                </MyCardBody>
              </MyCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
