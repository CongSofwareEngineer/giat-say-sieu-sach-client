'use client'

import { useState } from 'react'

import StarIcon from '@/components/Icons/Star'
import { cn } from '@/utils/tailwind'

type RatingInputProps = {
  value: number // 0-5
  onChange: (value: number) => void
  disabled?: boolean
}

// Interactive star selector for the review form
const RatingInput = ({ value, onChange, disabled }: RatingInputProps) => {
  const [hover, setHover] = useState(0)

  const active = hover || value

  return (
    <div className={cn('flex items-center gap-0.5', disabled && 'pointer-events-none opacity-60')}>
      {Array.from({ length: 5 }).map((_, index) => (
        <button
          key={index}
          type='button'
          aria-label={`${index + 1} star`}
          disabled={disabled}
          onMouseEnter={() => setHover(index + 1)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(index + 1)}
          className='cursor-pointer p-0.5 transition-transform hover:scale-110'
        >
          <StarIcon className={cn('h-7 w-7', index < active ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200')} />
        </button>
      ))}
    </div>
  )
}

export default RatingInput
