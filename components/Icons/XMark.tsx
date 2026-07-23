import { SVGProps } from 'react'

import { cn } from '@/utils/tailwind'

type IconProps = SVGProps<SVGSVGElement>

export const XMarkIcon = ({ ...props }: IconProps) => {
  return (
    <svg className={cn('size-6', props.className)} height={24} viewBox='0 0 24 24' width={24} xmlns='http://www.w3.org/2000/svg' {...props}>
      <path d='M6 18 18 6M6 6l12 12' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}
