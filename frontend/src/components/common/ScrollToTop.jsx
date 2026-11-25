import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop
 * Automatically resets window scroll position to the top (0, 0)
 * on every route change or hash navigation.
 * Also configures history.scrollRestoration = 'manual' to prevent
 * browser caching the previous scroll position on SPAs.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    // Enforce manual scroll restoration so the browser does not remember previous scroll offsets
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // If there is a hash anchor (e.g. #daily-words), scroll to the targeted section
    if (hash) {
      const element = document.querySelector(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }

    // Instantly scroll window and root containers to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    // Frame-delayed fallback to ensure top position even after DOM render/reflow
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })

    return () => cancelAnimationFrame(rafId)
  }, [pathname, search, hash])

  return null
}

