'use client'

import { useEffect, useRef, useState } from 'react'

import { BellIcon } from '@/components/Icons/Bell'
import useLanguage from '@/hooks/useLanguage'
import { formatDate } from '@/utils/date'
import { cn } from '@/utils/tailwind'

export type NotificationItem = {
  id: string
  title: string
  body?: string
  createdAt: string
  isRead: boolean
}

export type NotificationBellProps = {
  notifications: NotificationItem[]
  onMarkAllRead?: () => void
  onItemClick?: (item: NotificationItem) => void
  className?: string
}

// Max unread count shown on the badge before switching to "9+"
const MAX_BADGE_COUNT = 9

// Header bell with an unread badge and a dropdown list (UI only: data and actions come from the parent)
const NotificationBell = ({ notifications, onMarkAllRead, onItemClick, className }: NotificationBellProps) => {
  const { translate } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((item) => !item.isRead).length

  // Close when clicking outside the bell / dropdown
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={translate('notification.title')}
        aria-expanded={isOpen}
        className='relative flex cursor-pointer items-center justify-center rounded-full p-2.5 text-text transition-colors hover:bg-primary/5 hover:text-primary'
      >
        <BellIcon className='h-5 w-5' />
        {unreadCount > 0 && (
          <span className='absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white'>
            {unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute -right-12 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/80 bg-white/95 shadow-[0_20px_48px_-12px_rgba(10,111,135,0.25),0_4px_12px_-4px_rgba(16,24,40,0.08)] backdrop-blur-xl animation-fade-in sm:right-0'>
          <div className='flex items-center justify-between gap-2 border-b border-border/80 px-4 py-3'>
            <p className='text-sm font-semibold text-text'>{translate('notification.title')}</p>
            {unreadCount > 0 && onMarkAllRead && (
              <button type='button' onClick={onMarkAllRead} className='text-xs font-medium text-primary hover:underline'>
                {translate('notification.markAllRead')}
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className='flex flex-col items-center px-6 py-10 text-center'>
              <div className='mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary/60'>
                <BellIcon className='size-7' />
              </div>
              <p className='text-sm font-medium text-text'>{translate('notification.empty')}</p>
              <p className='mt-1 text-xs text-gray-500'>{translate('notification.emptyDesc')}</p>
            </div>
          ) : (
            <ul className='max-h-96 divide-y divide-border/60 overflow-y-auto'>
              {notifications.map((item) => (
                <li key={item.id}>
                  <button
                    type='button'
                    onClick={() => onItemClick?.(item)}
                    className={cn('flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-primary/5', !item.isRead && 'bg-primary/[0.04]')}
                  >
                    <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', item.isRead ? 'bg-transparent' : 'bg-primary')} />
                    <span className='min-w-0 flex-1'>
                      <span className={cn('block truncate text-sm text-text', !item.isRead && 'font-semibold')}>{item.title}</span>
                      {item.body && <span className='mt-0.5 line-clamp-2 block text-xs text-gray-500'>{item.body}</span>}
                      <span className='mt-1 block text-[11px] text-gray-400'>{formatDate(item.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
