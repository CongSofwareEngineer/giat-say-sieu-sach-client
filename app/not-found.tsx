'use client'

import Link from 'next/link'

import MyButton from '@/components/MyButton'
import useLanguage from '@/hooks/useLanguage'
import { HTTP_STATUS } from '@/constants/app'

// Site-wide 404 page; Next.js adds a noindex robots tag automatically
const NotFound = () => {
  const { translate } = useLanguage()

  return (
    <div className='px-4 py-20 lg:py-28'>
      <div className='mx-auto max-w-xl text-center'>
        <p className='text-6xl font-extrabold text-primary lg:text-7xl'>{HTTP_STATUS.NOT_FOUND}</p>
        <h1 className='mt-4 text-2xl font-bold text-text lg:text-3xl'>{translate('common.notFoundPage.title')}</h1>
        <p className='mt-3 text-base leading-relaxed text-gray-500'>{translate('common.notFoundPage.description')}</p>
        <Link href='/' className='mt-8 inline-block'>
          <MyButton variant='primary'>{translate('common.notFoundPage.backHome')}</MyButton>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
