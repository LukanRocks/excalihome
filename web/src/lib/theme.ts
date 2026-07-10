import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'excalihome-theme'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const THEME_CYCLE: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' }

const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

const listeners = new Set<() => void>()

const getTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY)

  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

const getResolvedTheme = (): ResolvedTheme => {
  const theme = getTheme()

  return theme === 'system' ? (systemDark.matches ? 'dark' : 'light') : theme
}

const applyTheme = () => {
  document.documentElement.classList.toggle('dark', getResolvedTheme() === 'dark')

  listeners.forEach((listener) => listener())
}

export const initTheme = () => {
  applyTheme()

  systemDark.addEventListener('change', applyTheme)
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getTheme)
  const resolvedTheme = useSyncExternalStore(subscribe, getResolvedTheme)

  const toggleTheme = () => {
    const next = THEME_CYCLE[theme]

    if (next === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, next)

    applyTheme()
  }

  return { theme, resolvedTheme, toggleTheme }
}
