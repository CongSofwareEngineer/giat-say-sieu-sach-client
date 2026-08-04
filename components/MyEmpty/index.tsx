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
      <div className='w-16 h-16 mb-4 text-gray-300'>
        <InboxIcon className='w-full h-full' />
      </div>
      <p className='text-gray-500 text-center mb-4'>{message || translate('common.noData')}</p>
      {action}
    </div>
  )
}

export default MyEmpty
