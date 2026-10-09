export type DeviceOS = 'macos' | 'ios' | 'android' | 'windows' | 'linux' | 'unknown'

const detectOS = (): DeviceOS => {
  const ua = navigator.userAgent

  if (/iPhone|iPad|iPod/.test(ua)) return 'ios'
  // iPadOS masquerades as macOS but reports touch points
  if (/Mac/.test(ua)) return navigator.maxTouchPoints > 1 ? 'ios' : 'macos'
  if (/Android/.test(ua)) return 'android'
  if (/Win/.test(ua)) return 'windows'
  if (/Linux/.test(ua)) return 'linux'

  return 'unknown'
}

export const useDevice = () => {
  const os = detectOS()
  // Coarse primary pointer means touch-first — a laptop with a touchscreen still counts as fine
  const isTouch = window.matchMedia('(pointer: coarse)').matches

  return { os, isTouch, isMac: os === 'macos' }
}
