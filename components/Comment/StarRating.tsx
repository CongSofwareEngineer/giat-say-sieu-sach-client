import StarIcon from '@/components/Icons/Star'
import { cn } from '@/utils/tailwind'

type StarRatingProps = {
  value: number // 0-5
  className?: string
}

// Read-only star rating display (0-5)
const StarRating = ({ value, className }: StarRatingProps) => (
  <div className={cn('flex items-center gap-0.5', className)}>
    {Array.from({ length: 5 }).map((_, index) => (
      <StarIcon
        key={index}
        className={cn('h-4 w-4', index < Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200')}
      />
    ))}
  </div>
)

export default StarRating
