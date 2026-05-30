import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'text'
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  href,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-body uppercase tracking-[0.2em] transition-all duration-300 ease-luxury focus:outline-none focus-visible:ring-2 focus-visible:ring-gold'
  
  const variants = {
    primary: 'bg-gold text-obsidian hover:bg-gold-light border border-transparent',
    ghost: 'bg-transparent text-gold border border-gold hover:bg-gold hover:text-obsidian',
    text: 'bg-transparent text-gold hover:text-gold-light underline-offset-4 hover:underline border-none p-0',
  }
  
  const sizes = {
    sm: 'text-[11px] px-5 py-3',
    md: 'text-[12px] px-6 py-4',
    lg: 'text-[13px] px-8 py-4 lg:py-5',
  }

  const classes = cn(
    baseStyles,
    variants[variant],
    variant !== 'text' && sizes[size],
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
