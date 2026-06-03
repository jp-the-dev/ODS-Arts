import { cn } from '@/lib/utils'

interface EyebrowLabelProps {
  children: React.ReactNode
  color?: 'gold' | 'pewter' | 'ivory' | 'obsidian'
  className?: string
}

export default function EyebrowLabel({
  children,
  color = 'gold',
  className,
}: EyebrowLabelProps) {
  const colors = {
    gold: 'text-gold',
    pewter: 'text-pewter',
    ivory: 'text-ivory',
    obsidian: 'text-obsidian',
  }

  return (
    <span
      className={cn(
        'font-body text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-medium',
        colors[color],
        className
      )}
    >
      {children}
    </span>
  )
}
