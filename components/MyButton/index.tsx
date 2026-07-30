'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utils/tailwind'

export type MyButtonVariant = 'default' | 'primary' | 'warning' | 'error'
export type MyButtonSize = 'default' | 'small' | 'large'

export type MyButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: MyButtonVariant
  size?: MyButtonSize
  loading?: boolean
  children?: ReactNode
}

const variantStyles: Record<MyButtonVariant, string> = {
  default: 'bg-gray-200 ',
  primary: 'bg-blue-600',
  warning: 'bg-yellow-500',
  error: 'bg-red-600',
}

const sizeStyles: Record<MyButtonSize, string> = {
  default: 'px-4 py-2 text-sm',
  small: 'px-2 py-1 text-xs',
  large: 'px-6 py-3 text-base',
}

export default function MyButton({ variant = 'default', size = 'default', loading = false, disabled, className, children, ...rest }: MyButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex relative  items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...rest}
    >
      {loading && (
        <div className={cn('absolute rounded-full flex w-full h-full justify-center items-center', variantStyles[variant])}>
          <svg className='mr-2 h-4 w-4 animate-spin' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
          </svg>
        </div>
      )}
      {children}
    </button>
  )
}
