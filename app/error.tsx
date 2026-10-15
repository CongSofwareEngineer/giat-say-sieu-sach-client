'use client'

import Link from 'next/link'

import MyButton from '@/components/MyButton'
import useLanguage from '@/hooks/useLanguage'

type ErrorPageProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

// Runtime error boundary for every route under the root layout (header/footer stay visible)
const ErrorPage = ({ error, unstable_retry }: ErrorPageProps) => {
  const { translate } = useLanguage()

  return (
    <div className='px-4 py-20 lg:py-28'>
      <div className='mx-auto max-w-xl text-center'>
        <h1 className='text-2xl font-bold text-text lg:text-3xl'>{translate('common.errorPage.title')}</h1>
        <p className='mt-3 text-base leading-relaxed text-gray-500'>{translate('common.errorPage.description')}</p>
        {error.digest && <p className='mt-2 text-xs text-gray-400'>{translate('common.errorPage.code', { code: error.digest })}</p>}
        <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
          <MyButton variant='primary' onClick={() => unstable_retry()}>
            {translate('common.errorPage.retry')}
          </MyButton>
          <Link href='/'>
            <MyButton variant='outline'>{translate('common.notFoundPage.backHome')}</MyButton>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
