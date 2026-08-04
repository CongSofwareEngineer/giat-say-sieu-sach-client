import { ReactNode } from 'react'

import { cn } from '@/utils/tailwind'

export type MyBadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

export type MyBadgeProps = {
  variant?: MyBadgeVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<MyBadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
}

const MyBadge = ({ variant = 'default', children, className }: MyBadgeProps) => {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variantStyles[variant], className)}>
      {children}
    </span>
  )
}

export default MyBadge
