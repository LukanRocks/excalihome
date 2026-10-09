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
} satisfies Record<string, Shortcut>

export type ShortcutAction = keyof typeof shortcuts

export const matchesShortcut = (event: KeyboardEvent, shortcut: Shortcut) =>
  event.code === shortcut.code &&
  (event.metaKey || event.ctrlKey) === !!shortcut.meta &&
  event.altKey === !!shortcut.alt &&
  event.shiftKey === !!shortcut.shift
