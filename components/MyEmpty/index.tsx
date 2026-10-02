import { ReactNode } from 'react'

import InboxIcon from '../Icons/Inbox'

import useLanguage from '@/hooks/useLanguage'

export type MyEmptyProps = {
  message?: string
  action?: ReactNode
  className?: string
}

const MyEmpty = ({ message, action, className }: MyEmptyProps) => {
  const { translate } = useLanguage()

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className ?? ''}`}>
      <div className='mb-4 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary/60 ring-1 ring-primary/10'>
        <InboxIcon className='size-10' />
      </div>
      <p className='mb-4 text-center text-sm text-gray-500'>{message || translate('common.noData')}</p>
      {action}
    </div>
  )
}

export default MyEmpty
