import { useEffect, useRef, useState } from 'react'

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
  cancelIdleCallback?: (id: number) => void
}

/** Mount non-critical work after the browser has painted and gone idle. */
export function useIdleReady(timeout = 1200): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const win = window as IdleWindow
    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(() => setReady(true), { timeout })
      return () => win.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(() => setReady(true), Math.min(timeout, 200))
    return () => window.clearTimeout(id)
  }, [timeout])

  return ready
}

/**
 * Mount a section shortly before it scrolls into view.
 *
 * IntersectionObserver is the fast path. A small probe installs a scroll-based
 * fallback if no callback arrives, so content still appears in browsers or
 *embedded webviews that throttle observers. Direct links to a section mount it
 * immediately.
 */
export function useNearViewport<T extends HTMLElement>(rootMargin = '700px', id?: string) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible) return
    const node = ref.current
    if (!node) return
    if (id && window.location.hash === `#${id}`) {
      const immediate = window.setTimeout(() => setVisible(true), 0)
      return () => window.clearTimeout(immediate)
    }

    let observer: IntersectionObserver | undefined
    let fired = false
    let fallback: (() => void) | undefined

    const show = () => setVisible(true)

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            fired = true
            show()
            observer?.disconnect()
          }
        },
        { rootMargin },
      )
      observer.observe(node)
    }

    const probe = window.setTimeout(() => {
      if (fired) return
      observer?.disconnect()
      fallback = () => {
        const rect = node.getBoundingClientRect()
        if (rect.top < window.innerHeight + 700 && rect.bottom > -700) show()
      }
      fallback()
      window.addEventListener('scroll', fallback, { passive: true })
      window.addEventListener('resize', fallback)
    }, 600)

    // Final safety net: mount shortly after idle even if observers are throttled.
    const force = window.setTimeout(show, 2000)

    return () => {
      window.clearTimeout(probe)
      window.clearTimeout(force)
      observer?.disconnect()
      if (fallback) {
        window.removeEventListener('scroll', fallback)
        window.removeEventListener('resize', fallback)
      }
    }
  }, [visible, rootMargin, id])

  return { ref, visible }
}
