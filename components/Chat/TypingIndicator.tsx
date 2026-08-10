'use client'

import useLanguage from '@/hooks/useLanguage'

const TypingIndicator = () => {
  const { translate } = useLanguage()

  return (
    <div className='flex justify-start'>
      <div className='flex items-center gap-2 bg-gray-100 text-gray-500 rounded-2xl rounded-bl-md px-3 py-2 text-xs'>
        <span className='flex gap-1'>
          <span className='h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce' />
          <span className='h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]' />
          <span className='h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]' />
        </span>
        {translate('chat.typing')}
      </div>
    </div>
  )
}

export default TypingIndicator
