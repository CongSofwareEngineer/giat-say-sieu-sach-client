import { SVGProps } from 'react'

import { cn } from '@/utils/tailwind'

type IconProps = SVGProps<SVGSVGElement>

const GiftIcon = ({ ...props }: IconProps) => {
  return (
    <svg
      className={cn('size-6', props.className)}
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
      strokeLinejoin='round'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <rect x='3' y='8' width='18' height='4' rx='1' />
      <path d='M12 8v13' />
      <path d='M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7' />
      <path d='M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5' />
    </svg>
  )
}

export default GiftIcon
