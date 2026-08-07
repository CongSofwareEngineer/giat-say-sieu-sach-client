'use client'

import { useEffect, useRef, useState } from 'react'

import MyButton from '@/components/MyButton'
import { CloseIcon } from '@/components/Icons/Functions/Close'
import { ContactIcon } from '@/components/Icons/Contact'
import { PhoneIcon } from '@/components/Icons/Phone'
import ZaloIcon from '@/components/Icons/SocialMedia/Zalo'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { INFO_CONTACT } from '@/constants/app'
import { cn } from '@/utils/tailwind'

type ActionItem = {
  key: string
  label: string
  icon: React.ReactNode
  className: string
  href?: string
  target?: string
  rel?: string
  onClick?: () => void
}

type ContactFloatingButtonsProps = {
  className?: string
  hidden?: boolean
  extraItems?: ActionItem[]
}

// Strip dashes so tel:/sms: links are valid
const contactPhone = INFO_CONTACT.Phone.replace(/[^+\d]/g, '')

const ContactFloatingButtons = ({ className, hidden = false, extraItems = [] }: ContactFloatingButtonsProps) => {
  const { translate } = useLanguage()
  const { isMobile } = useModalDrawer({ maxWidth: 768 })
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const contactItems: ActionItem[] = [
    {
      key: 'zalo',
      label: translate('contact.quick.zalo'),
      icon: <ZaloIcon className='h-5 w-5' />,
      className: 'bg-[#0068FF]',
      href: INFO_CONTACT.Zalo,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      key: 'message',
      label: translate('contact.quick.message'),
      icon: <ContactIcon className='h-5 w-5' />,
      className: 'bg-green-500',
      href: `sms:${contactPhone}`,
    },
    {
      key: 'call',
      label: translate('contact.quick.call'),
      icon: <PhoneIcon className='h-5 w-5' />,
      className: 'bg-primary',
      href: `tel:${contactPhone}`,
    },
  ]

  // Merge external actions (e.g. chat) on top of the default contact links
  const items: ActionItem[] = [...extraItems, ...contactItems]

  // Close menu then run the item action (e.g. open chat)
  const handleItemClick = (item: ActionItem) => {
    setIsOpen(false)
    item.onClick?.()
  }

  // Close the menu when the user taps/clicks outside it
  useEffect(() => {
    if (!isOpen) return

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)

    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [isOpen])

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed z-50 flex flex-col items-end',
        isMobile ? 'bottom-5 right-[18px]' : 'bottom-6 right-[31px]',
        hidden && 'pointer-events-none opacity-0',
        className
      )}
    >
      <div className='flex flex-col items-end gap-3'>
        {items.map((item, index) => (
          <div key={item.key} className='flex items-center gap-2'>
            <span
              className={cn(
                'whitespace-nowrap rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-md transition-all duration-300',
                isOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-2 opacity-0'
              )}
              style={{ transitionDelay: isOpen ? `${(items.length - 1 - index) * 50}ms` : '0ms' }}
            >
              {item.label}
            </span>
            {item.href ? (
              <a
                href={item.href}
                target={item.target}
                rel={item.rel}
                aria-label={item.label}
                title={item.label}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110',
                  item.className,
                  isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-75 opacity-0'
                )}
                style={{ transitionDelay: isOpen ? `${(items.length - 1 - index) * 50}ms` : '0ms' }}
              >
                {item.icon}
              </a>
            ) : (
              <button
                type='button'
                aria-label={item.label}
                title={item.label}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110',
                  item.className,
                  isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-75 opacity-0'
                )}
                style={{ transitionDelay: isOpen ? `${(items.length - 1 - index) * 50}ms` : '0ms' }}
              >
                {item.icon}
              </button>
            )}
          </div>
        ))}
      </div>

      <MyButton
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={translate('contact.quick.title')}
        aria-expanded={isOpen}
        className='mt-3 h-11 w-11 p-0'
      >
        {isOpen ? <CloseIcon className='h-5 w-5' /> : <ContactIcon className='h-5 w-5' />}
      </MyButton>
    </div>
  )
}

export default ContactFloatingButtons
