'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/utils/tailwind'

export type MyInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  required?: boolean
}

const MyInput = forwardRef<HTMLInputElement, MyInputProps>(({ label, error, required, className, id, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className='w-full'>
      {label && (
        <label htmlFor={inputId} className='block text-sm font-medium text-text mb-1.5'>
          {label}
          {required && <span className='text-red-600 ml-1'>*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border bg-white text-text placeholder-gray-500',
          'border-primary',
          'transition-colors',
          error ? 'border-red-500' : 'border-border',
          className
        )}
        {...props}
      />
      {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
    </div>
  )
})

MyInput.displayName = 'MyInput'

export default MyInput
