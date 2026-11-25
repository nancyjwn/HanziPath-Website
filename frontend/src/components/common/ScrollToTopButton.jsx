import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

/**
 * ScrollToTopButton
 * Floating Oriental Scholar seal button that appears specifically
 * when the user has scrolled to the bottom of the page (near footer).
 * Smoothly scrolls the window back to the very top upon click.
 */
export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      )

      // Distance remaining to the bottom of the page
      const distanceFromBottom = docHeight - (scrollY + windowHeight)

      // Show specifically when user is near or at the bottom (within 450px)
      // and has scrolled down past the initial screen (scrollY > 200)
      if (scrollY > 200 && distanceFromBottom <= 450) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    // Check initial position
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={handleScrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 flex size-11 sm:size-12 items-center justify-center rounded-full bg-cinnabar hover:bg-[#8f2720] text-white shadow-[0_8px_25px_rgba(168,50,40,0.35)] border border-white/20 transition-all cursor-pointer group select-none focus:outline-none focus:ring-2 focus:ring-cinnabar/40"
          aria-label="Scroll back to top"
          title="Scroll back to top"
        >
          {/* Minimalist Up Arrow Icon */}
          <svg
            className="size-5 transition-transform duration-200 group-hover:-translate-y-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.4}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

