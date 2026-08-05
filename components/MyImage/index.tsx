import Image, { ImageProps } from 'next/image'

import { cn } from '@/utils/tailwind'
import { images } from '@/config/images'

type Props = {
  noAnimation?: boolean
} & Omit<ImageProps, 'alt' | 'src'> & {
    alt?: string
    src?: string
  }

const MyImage = ({ noAnimation = false, src, alt = 'thay-hong-toan', ...props }: Props) => {
  return (
    <Image
      fill
      alt={alt}
      draggable={false}
      loading='lazy'
      priority={false}
      placeholder='blur'
      {...props}
      className={cn('relative! overflow-hidden', props?.className)}
      style={props?.style}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = images.icons.avatarDefault
      }}
      src={src || images.icons.avatarDefault}
      blurDataURL='https://res.cloudinary.com/tc-store/image/upload/w_100/v1734883048/tc-store/bgWhiteBlur_yxlqi7.png'
    />
  )
}

export default MyImage
