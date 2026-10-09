export interface Shortcut {
  /** KeyboardEvent.code — layout-independent, avoids macOS Option dead keys */
  code: string
  /** Key label for display */
  label: string
  /** Cmd on macOS, Ctrl elsewhere */
  meta?: boolean
  alt?: boolean
  shift?: boolean
}

export const shortcuts = {
  createBoard: { code: 'KeyO', label: 'O', meta: true, shift: true },
  // Cmd+. is unused by Excalidraw and browsers
  toggleFocusMode: { code: 'Period', label: '.', meta: true },
} satisfies Record<string, Shortcut>

export type ShortcutAction = keyof typeof shortcuts

export const formatShortcut = (shortcut: Shortcut, isMac: boolean) =>
  [shortcut.meta && (isMac ? '⌘' : 'Ctrl'), shortcut.alt && (isMac ? '⌥' : 'Alt'), shortcut.shift && (isMac ? '⇧' : 'Shift'), shortcut.label].filter(Boolean).join('')

export const matchesShortcut = (event: KeyboardEvent, shortcut: Shortcut) =>
  event.code === shortcut.code && (event.metaKey || event.ctrlKey) === !!shortcut.meta && event.altKey === !!shortcut.alt && event.shiftKey === !!shortcut.shift
