/** Theme state shared by the header toggle and React Bits components. */
import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'verifypoint-theme'

let currentTheme: Theme = 'dark'
let initialized = false
const listeners = new Set<() => void>()

export function normalizeTheme(value: unknown): Theme | null {
  return value === 'dark' || value === 'light' ? value : null
}

function readStoredTheme(): Theme | null {
  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return null
  }
}

function readSystemTheme(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function resolveInitialTheme(): Theme {
  return readStoredTheme() ?? readSystemTheme()
}

export function getTheme(): Theme {
  return currentTheme
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function applyTheme(theme: Theme): void {
  currentTheme = theme
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#050c18' : '#f8fafc')
}

/** Apply the initial theme once. index.html also does this to avoid a flash. */
export function initTheme(): void {
  if (initialized) return
  initialized = true
  applyTheme(resolveInitialTheme())
}

/** Switch theme and remember only this preference on the device. */
export function setTheme(theme: Theme, persist = true): void {
  applyTheme(theme)
  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Storage can be disabled; the theme still works for this visit.
    }
  }
  listeners.forEach((listener) => listener())
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, getTheme, () => 'dark')
}
