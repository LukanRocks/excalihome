import { useDevice } from '@/lib/hooks/use-device'
import { Shortcut, ShortcutAction, shortcuts } from '@/lib/shortcuts'

interface ShortcutBadgeProps {
  action: ShortcutAction
}

export const ShortcutBadge = ({ action }: ShortcutBadgeProps) => {
  const { isMac, isTouch } = useDevice()

  if (isTouch) return null

  const shortcut: Shortcut = shortcuts[action]

  const parts = [
    shortcut.meta && (isMac ? '⌘' : 'Ctrl'),
    shortcut.alt && (isMac ? '⌥' : 'Alt'),
    shortcut.shift && (isMac ? '⇧' : 'Shift'),
    shortcut.label,
  ].filter(Boolean)

  return (
    <kbd className='rounded bg-primary-foreground/15 px-1.5 py-0.5 font-sans text-[10px] font-medium leading-none text-primary-foreground/80'>
      {parts.join('')}
    </kbd>
  )
}
