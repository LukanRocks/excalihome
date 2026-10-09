import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Adapted from https://ui.8starlabs.com/docs/components/system-banner
const labelVariants = cva('absolute -bottom-4 rounded font-bold text-white shadow-md', {
  variants: {
    size: {
      xs: 'px-1 py-0.5 text-[10px]',
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    },
  },
  defaultVariants: {
    size: 'xs',
  },
})

interface SystemBannerProps extends VariantProps<typeof labelVariants> {
  text?: string
  color?: string
}

export const SystemBanner = ({ text = 'Development Mode', color = 'bg-orange-500', size }: SystemBannerProps) => {
  return (
    <div className={cn('pointer-events-none fixed top-0 left-0 z-50 flex h-0.5 w-full justify-center', color)}>
      <span className={cn(labelVariants({ size }), color)}>{text}</span>
    </div>
  )
}
