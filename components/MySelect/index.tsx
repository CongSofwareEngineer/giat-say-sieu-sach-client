'use client'

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import useLanguage from '@/hooks/useLanguage'

export type MySelectItem = {
  value?: string | number
  label?: ReactNode
}

export type MySelectProps = {
  data: MySelectItem[]
  value?: string | number
  placeholder?: string
  className?: string
  style?: React.CSSProperties
  search?: boolean
  disabled?: boolean
  onSearch?: (keyword: string) => void
  onChange?: (item: MySelectItem) => void
  onClick?: () => void
}

export default function MySelect({
  data,
  value,
  placeholder,
  className,
  style,
  search = true,
  disabled = false,
  onSearch,
  onChange,
  onClick,
}: MySelectProps) {
  const { translate } = useLanguage()
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')

  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = useMemo(() => {
    return data.find((x) => x.value === value) ?? null
  }, [data, value])

  const filtered = useMemo(() => {
    return data.filter((x) => String(x.label).toLowerCase().includes(keyword.toLowerCase()))
  }, [data, keyword])

  const handleToggle = () => {
    if (disabled) return

    setOpen((v) => !v)
    onClick?.()
  }

  const handleSearch = (val: string) => {
    setKeyword(val)
    onSearch?.(val)
  }

  const handleSelect = (item: MySelectItem) => {
    onChange?.(item)
    setKeyword('')
    setOpen(false)
  }

  return (
    <div className={`relative w-72 ${className ?? ''}`} style={style} ref={wrapperRef}>
      <button
        type='button'
        onClick={handleToggle}
        disabled={disabled}
        className='cursor-pointer flex w-full items-center justify-between rounded-lg border bg-white px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60'
      >
        <span>{selected?.label ?? placeholder ?? translate('common.select')}</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      <div
        className={`
          absolute left-0 right-0 z-10 mt-2 origin-top rounded-lg border bg-white shadow-lg
          transition-all duration-200
          ${open ? 'visible opacity-100 scale-100' : 'invisible opacity-0 scale-95'}
        `}
      >
        {search && (
          <div className='p-2'>
            <input
              autoFocus={open}
              value={keyword}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={translate('common.search')}
              className='w-full rounded border px-3 py-2 outline-none placeholder:text-gray-500'
            />
          </div>
        )}

        <ul className='max-h-60 overflow-auto'>
          {filtered.length === 0 && <li className='px-4 py-3 text-gray-500'>{translate('common.notFound')}</li>}

          {filtered.map((item, index) => (
            <li
              key={item.value ?? index}
              onClick={() => handleSelect(item)}
              className={`cursor-pointer px-4 py-2 ${item.value === value ? 'bg-blue-50 font-medium' : ''}`}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
