'use client'

import Link from 'next/link'

import MyCard, { MyCardBody } from '@/components/MyCard'
import { CheckBadgeIcon } from '@/components/Icons/CheckBadge'
import useLanguage from '@/hooks/useLanguage'

type PolicySection = {
  id: string
  title: string
  items: string[]
}

// Policy sections + table of contents, texts from the language files
const PolicyContent = () => {
  const { translate } = useLanguage()

  // Sections live in the language files as an array so the content can be edited without code changes
  const rawSections = translate('policy.sections')
  const sections: PolicySection[] = Array.isArray(rawSections) ? rawSections : []

  return (
    <div className='py-16 lg:py-24'>
      <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-10 text-center'>
          <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-wider text-primary'>
            {translate('policy.tag')}
          </span>
          <h1 className='mt-4 text-3xl font-extrabold leading-tight text-text lg:text-4xl'>{translate('policy.title')}</h1>
          <p className='mt-3 text-base leading-relaxed text-gray-500 lg:text-lg'>{translate('policy.subtitle')}</p>
          <p className='mt-2 text-xs text-gray-400'>{translate('policy.updatedAt')}</p>
        </div>

        {/* Table of contents */}
        <nav aria-label={translate('policy.toc')} className='mb-8 flex flex-wrap justify-center gap-2'>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className='rounded-full border border-border bg-white px-3.5 py-1.5 text-sm text-gray-600 transition-colors hover:border-primary/40 hover:text-primary'
            >
              {section.title}
            </a>
          ))}
        </nav>

        <div className='space-y-6'>
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className='scroll-mt-24'>
              <MyCard>
                <MyCardBody className='p-6 lg:p-8'>
                  <h2 className='text-xl font-bold text-text'>
                    <span className='mr-2 text-primary'>{index + 1}.</span>
                    {section.title}
                  </h2>
                  <ul className='mt-4 space-y-3'>
                    {section.items.map((item) => (
                      <li key={item} className='flex items-start gap-2.5 text-sm leading-relaxed text-gray-600 lg:text-base'>
                        <CheckBadgeIcon className='mt-0.5 size-4 shrink-0 text-secondary lg:mt-1' />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </MyCardBody>
              </MyCard>
            </section>
          ))}
        </div>

        <p className='mt-10 text-center text-sm text-gray-500'>
          {translate('policy.contact', {
            link: (text) => (
              <Link href='/contact' className='font-semibold text-primary hover:underline'>
                {text}
              </Link>
            ),
          })}
        </p>
      </div>
    </div>
  )
}

export default PolicyContent
