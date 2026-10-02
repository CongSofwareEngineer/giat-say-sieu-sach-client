import { cn } from '@/utils/tailwind'

export type MyLoadingProps = {
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
  className?: string
}

const sizeStyles = {
  small: 'w-5 h-5',
  medium: 'w-8 h-8',
  large: 'w-12 h-12',
}

const MyLoading = ({ size = 'medium', fullScreen = false, className }: MyLoadingProps) => {
  const spinner = <div className={cn('animate-spin rounded-full border-[3px] border-primary/15 border-t-primary', sizeStyles[size], className)} />

  if (fullScreen) {
    return <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm'>{spinner}</div>
  }

  return <div className='flex items-center justify-center py-8'>{spinner}</div>
}

export default MyLoading
