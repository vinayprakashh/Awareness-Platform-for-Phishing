/**
 * Privacy-preserving Web Vitals capture for staging.
 *
 * Values stay in memory on `window.__VERIFYPOINT_VITALS__`. Add `?vitals=1`
 * to print a snapshot to the console; nothing is sent to a server.
 */
export interface WebVitals {
  ttfb: number | null
  fcp: number | null
  lcp: number | null
  cls: number
  inp: number | null
  longTasks: number
  updatedAt: string
}

declare global {
  interface Window {
    __VERIFYPOINT_VITALS__?: WebVitals
  }
}

type VitalEntry = PerformanceEntry & {
  value?: number
  hadRecentInput?: boolean
  duration?: number
}

const state: WebVitals = {
  ttfb: null,
  fcp: null,
  lcp: null,
  cls: 0,
  inp: null,
  longTasks: 0,
  updatedAt: '',
}

let started = false

function update(): void {
  state.updatedAt = new Date().toISOString()
}

function observe(type: string, handler: (entries: VitalEntry[]) => void): void {
  if (typeof PerformanceObserver === 'undefined') return
  try {
    const observer = new PerformanceObserver((list) => handler(list.getEntries() as VitalEntry[]))
    observer.observe({ type, buffered: true } as PerformanceObserverInit)
  } catch {
    // Browser does not expose this entry type.
  }
}

/** Install observers once. Safe to call more than once. */
export function initWebVitals(): void {
  if (started || typeof window === 'undefined') return
  started = true
  window.__VERIFYPOINT_VITALS__ = state

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (navigation) state.ttfb = Math.round(navigation.responseStart - navigation.startTime)

  const fcp = performance.getEntriesByType('paint').find((entry) => entry.name === 'first-contentful-paint')
  if (fcp) state.fcp = Math.round(fcp.startTime)
  update()

  observe('paint', (entries) => {
    const entry = entries.find((item) => item.name === 'first-contentful-paint')
    if (entry) state.fcp = Math.round(entry.startTime)
    update()
  })

  observe('largest-contentful-paint', (entries) => {
    const entry = entries[entries.length - 1]
    if (entry) state.lcp = Math.round(entry.startTime)
    update()
  })

  observe('layout-shift', (entries) => {
    for (const entry of entries) {
      if (!entry.hadRecentInput) state.cls += entry.value ?? 0
    }
    state.cls = Math.round(state.cls * 10000) / 10000
    update()
  })

  observe('event', (entries) => {
    for (const entry of entries) {
      if (!['click', 'keydown', 'pointerdown'].includes(entry.name)) continue
      const duration = Math.round(entry.duration ?? 0)
      if (state.inp === null || duration > state.inp) state.inp = duration
    }
    update()
  })

  observe('longtask', (entries) => {
    state.longTasks += entries.length
    update()
  })

  if (new URLSearchParams(window.location.search).has('vitals')) {
    window.addEventListener('load', () => {
      window.setTimeout(() => console.info('[VerifyPoint vitals]', { ...state }), 1200)
    })
  }
}
