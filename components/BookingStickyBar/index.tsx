'use client'

import { useEffect, useState, type RefObject } from 'react'
import Link from 'next/link'

import MyButton from '@/components/MyButton'
import CalendarIcon from '@/components/Icons/Calendar'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { cn } from '@/utils/tailwind'

type BookingStickyBarProps = {
  // Bar appears once this element (e.g. the hero CTA) has scrolled above the viewport
  watchRef: RefObject<HTMLElement | null>
}

// Mobile-only floating "Book now" button, placed left of the contact floating button
const BookingStickyBar = ({ watchRef }: BookingStickyBarProps) => {
  const { translate } = useLanguage()
  const { isMobile } = useModalDrawer()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const target = watchRef.current

    if (!isMobile || !target) return

    const observer = new IntersectionObserver(([entry]) => {
      // Show only after scrolling past the target, not while it is still below the fold
      setIsVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })

    observer.observe(target)

    return () => observer.disconnect()
  }, [isMobile, watchRef])

  if (!isMobile) return null

  return (
    <div
      className={cn(
        'fixed bottom-5 left-4 right-[74px] z-40 transition-all duration-300',
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      )}
      aria-hidden={!isVisible}
    >
      <Link href='/booking' tabIndex={isVisible ? 0 : -1} className='block'>
        <MyButton variant='cta' className='cta-shine h-11 w-full text-base' tabIndex={-1}>
          <CalendarIcon className='size-5' strokeWidth={2} />
          {translate('home.hero.bookCta')}
        </MyButton>
      </Link>
    </div>
  )
}

export default BookingStickyBar
