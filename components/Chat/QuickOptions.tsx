'use client'

import useChat from '@/hooks/useChat'
import useLanguage from '@/hooks/useLanguage'
import { cn } from '@/utils/tailwind'

type QuickOptionsProps = {
  onOptionClick: (option: string) => void
  onLaundryClick?: () => void
}

const QuickOptions = ({ onOptionClick, onLaundryClick }: QuickOptionsProps) => {
  const { translate } = useLanguage()
  const { isSending } = useChat()
  const options = [
    { key: 'priceList', label: translate('chat.quickOptions.priceList') },
    { key: 'address', label: translate('chat.quickOptions.address') },
    { key: 'promotions', label: translate('chat.quickOptions.promotions') },
    { key: 'orderInfo', label: translate('chat.quickOptions.orderInfo') },
    { key: 'laundry', label: translate('chat.quickOptions.laundry') },
  ]

  return (
    <div className='flex flex-wrap gap-2 mt-2'>
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => {
            if (isSending) {
              return
            }
            if (option.key === 'laundry' && onLaundryClick) {
              onLaundryClick()
            } else {
              onOptionClick(option.label)
            }
          }}
          className={cn(
            ' px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors whitespace-nowrap',
            isSending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default QuickOptions
