import { motion } from 'motion/react'

/**
 * ScrollReveal
 * Elegant reveal-on-scroll wrapper for cards, headers, and sections.
 * Automatically animates elements smoothly into view when scrolled into the viewport.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  y = 22,
  duration = 0.55,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

