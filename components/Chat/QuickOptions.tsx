'use client'

import useLanguage from '@/hooks/useLanguage'

type QuickOptionsProps = {
  onOptionClick: (option: string) => void
  onLaundryClick?: () => void
}

const QuickOptions = ({ onOptionClick, onLaundryClick }: QuickOptionsProps) => {
  const { translate } = useLanguage()
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
            if (option.key === 'laundry' && onLaundryClick) {
              onLaundryClick()
            } else {
              onOptionClick(option.label)
            }
          }}
          className='px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors whitespace-nowrap'
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default QuickOptions
