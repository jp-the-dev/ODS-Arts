import { cn } from '@/lib/utils'

export default function Container({
  children,
  size = 'content',
  className,
}: {
  children: React.ReactNode
  size?: 'text' | 'content' | 'wide' | 'full'
  className?: string
}) {
  const sizeClasses = {
    text: 'max-w-text',
    content: 'max-w-content',
    wide: 'max-w-wide',
    full: 'max-w-full',
  }

  return (
    <div
      className={cn(
        'w-full mx-auto',
        // Gutter padding based on breakpoints
        'px-4 sm:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 3xl:px-20 4xl:px-[120px] 5xl:px-40',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  )
}
