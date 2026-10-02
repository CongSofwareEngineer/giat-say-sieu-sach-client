'use client'

import { KeyboardEvent, ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react'

import { ArrowDownIcon } from '../Icons/ArrowDown'
import { CheckIcon } from '../Icons/Check'
import { SearchIcon } from '../Icons/Functions/Search'

import useLanguage from '@/hooks/useLanguage'
import { cn } from '@/utils/tailwind'

export type MySelectItem = {
  value?: string | number
  label?: ReactNode
}

export type MySelectProps = {
  data: MySelectItem[]
  value?: string | number
  label?: string
  placeholder?: string
  error?: string
  className?: string
  style?: React.CSSProperties
  search?: boolean
  disabled?: boolean
  autoFocus?: boolean
  onSearch?: (keyword: string) => void
  onChange?: (item: MySelectItem) => void
  onClick?: () => void
  onBlur?: () => void
}

export default function MySelect({
  data,
  value,
  label,
  placeholder,
  error,
  className,
  style,
  search = true,
  disabled = false,
  autoFocus = false,
  onSearch,
  onChange,
  onClick,
  onBlur,
}: MySelectProps) {
  const { translate } = useLanguage()
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [dropUp, setDropUp] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false)
        onBlur?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onBlur])

  const selected = useMemo(() => {
    return data.find((x) => x.value === value) ?? null
  }, [data, value])

  const filtered = useMemo(() => {
    return data.filter((x) => String(x.label).toLowerCase().includes(keyword.toLowerCase()))
  }, [data, keyword])

  // Focus search box and highlight current item each time the menu opens
  useEffect(() => {
    if (!open) return

    setActiveIndex(Math.max(0, filtered.findIndex((x) => x.value === value)))
    if (search) searchRef.current?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Keep the highlighted option visible while navigating by keyboard
  useEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const handleToggle = () => {
    if (disabled) return

    // Flip the menu upward when there is not enough room below the trigger
    if (!open && triggerRef.current && menuRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom

      setDropUp(spaceBelow < menuRef.current.offsetHeight && rect.top > spaceBelow)
    }

    setOpen((v) => !v)
    onClick?.()
  }

  const handleSearch = (val: string) => {
    setKeyword(val)
    setActiveIndex(0)
    onSearch?.(val)
  }

  const handleSelect = (item: MySelectItem) => {
    onChange?.(item)
    setKeyword('')
    setOpen(false)
    triggerRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return

    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        handleToggle()
      }

      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(filtered.length - 1, i + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(0, i - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (filtered[activeIndex]) handleSelect(filtered[activeIndex])
        break
      case 'Escape':
        // Prevent parent modal/drawer from closing too
        e.stopPropagation()
        setOpen(false)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div className={cn('w-72', className)} style={style}>
      {label && <label className='mb-1.5 block text-sm font-medium text-text'>{label}</label>}

      <div className='relative' ref={wrapperRef} onKeyDown={handleKeyDown}>
        <button
          ref={triggerRef}
          type='button'
          onClick={handleToggle}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-haspopup='listbox'
          aria-expanded={open}
          aria-controls={listId}
          className={cn(
            'group flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-white px-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
            'transition-[border-color,box-shadow,background-color] duration-200 outline-none',
            'hover:border-primary/40 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60 disabled:hover:border-border',
            open && 'border-primary ring-4 ring-primary/10',
            error ? 'border-red-400 hover:border-red-400 focus-visible:ring-red-500/10' : !open && 'border-border'
          )}
        >
          <span className={cn('truncate', selected ? 'text-text' : 'text-gray-400')}>
            {selected?.label ?? placeholder ?? translate('common.select')}
          </span>
          <ArrowDownIcon
            className={cn(
              'size-4 flex-shrink-0 text-gray-400 transition-transform duration-300 group-hover:text-primary',
              open && 'rotate-180 text-primary'
            )}
            strokeWidth={2}
          />
        </button>

        <div
          ref={menuRef}
          className={cn(
            'absolute left-0 right-0 z-30 min-w-[180px] overflow-hidden rounded-2xl border border-border/80 bg-white/95 p-1.5 backdrop-blur-xl',
            'shadow-[0_20px_48px_-12px_rgba(10,111,135,0.25),0_4px_12px_-4px_rgba(16,24,40,0.08)]',
            'transition-[opacity,transform,visibility] duration-200 ease-out',
            dropUp ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top',
            open ? 'visible translate-y-0 scale-100 opacity-100' : cn('invisible scale-95 opacity-0', dropUp ? 'translate-y-1' : '-translate-y-1')
          )}
        >
          {search && (
            <div className='relative mb-1.5'>
              <SearchIcon className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' strokeWidth={2} />
              <input
                ref={searchRef}
                value={keyword}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={translate('common.search')}
                aria-label={translate('common.search')}
                className='h-10 w-full rounded-xl border border-transparent bg-gray-50 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-primary/30 focus:bg-white'
              />
            </div>
          )}

          <ul ref={listRef} id={listId} role='listbox' className='max-h-60 overflow-auto overscroll-contain'>
            {filtered.length === 0 && <li className='px-3 py-6 text-center text-sm text-gray-400'>{translate('common.notFound')}</li>}

            {filtered.map((item, index) => {
              const isSelected = item.value === value

              return (
                <li
                  key={item.value ?? index}
                  role='option'
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-text transition-colors',
                    index === activeIndex && 'bg-primary/5',
                    isSelected && 'bg-primary/10 font-semibold text-primary'
                  )}
                >
                  <span className='truncate'>{item.label}</span>
                  {isSelected && <CheckIcon className='size-4 flex-shrink-0' strokeWidth={2.5} />}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
    </div>
  )
}
