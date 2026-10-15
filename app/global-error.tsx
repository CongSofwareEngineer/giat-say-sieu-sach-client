'use client'

import './globals.css'

import MyButton from '@/components/MyButton'
import useLanguage from '@/hooks/useLanguage'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

// Replaces the root layout when it crashes, so it renders its own <html>/<body> without header/providers
const GlobalError = ({ error, unstable_retry }: GlobalErrorProps) => {
  const { translate } = useLanguage()

  return (
    <html lang='vi'>
      <body className='flex min-h-screen items-center justify-center bg-background px-4 text-text antialiased'>
        <title>{translate('common.errorPage.title')}</title>
        <div className='mx-auto max-w-xl text-center'>
          <h1 className='text-2xl font-bold lg:text-3xl'>{translate('common.errorPage.title')}</h1>
          <p className='mt-3 text-base leading-relaxed text-gray-500'>{translate('common.errorPage.description')}</p>
          {error.digest && <p className='mt-2 text-xs text-gray-400'>{translate('common.errorPage.code', { code: error.digest })}</p>}
          <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
            <MyButton variant='primary' onClick={() => unstable_retry()}>
              {translate('common.errorPage.retry')}
            </MyButton>
            {/* Full reload: the client router may be broken here */}
            <MyButton variant='outline' onClick={() => window.location.assign('/')}>
              {translate('common.notFoundPage.backHome')}
            </MyButton>
          </div>
        </div>
      </body>
    </html>
  )
}

export default GlobalError
