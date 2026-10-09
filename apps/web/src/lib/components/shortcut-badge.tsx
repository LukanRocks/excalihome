import { useDevice } from '@/lib/hooks/use-device'
import { formatShortcut, ShortcutAction, shortcuts } from '@/lib/shortcuts'

interface ShortcutBadgeProps {
  action: ShortcutAction
}

export const ShortcutBadge = ({ action }: ShortcutBadgeProps) => {
  const { isMac, isTouch } = useDevice()

  if (isTouch) return null

  return (
    <kbd className='rounded bg-primary-foreground/15 px-1.5 py-0.5 font-sans text-[10px] leading-none font-medium text-primary-foreground/80'>
      {formatShortcut(shortcuts[action], isMac)}
    </kbd>
  )
}
