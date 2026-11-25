import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

export default function CtaHeroSection() {
  return (
    <section className="relative z-10 w-full bg-[#FBF9F5] border-t border-[#ede5d8] py-20 sm:py-28 px-5 sm:px-10 overflow-hidden">
      {/* Subtle oriental geometry watermark - strictly minimalist, no image */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Very faint rice paper texture dots */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #292723 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        />
        {/* Soft watermark character '学' in the background */}
        <span className="absolute -bottom-10 right-8 sm:right-20 font-serif text-[180px] sm:text-[240px] text-charcoal/[0.02] leading-none select-none">
          学
        </span>
      </div>

      {/* Main Content Container - Clean & Minimalist */}
      <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
        {/* Minimalist Cinnabar Scholar Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-[3px] text-cinnabar uppercase mb-3"
        >
          <span className="h-px w-5 bg-cinnabar/60" />
          <span>START YOUR JOURNEY</span>
          <span className="h-px w-5 bg-cinnabar/60" />
        </motion.div>

        {/* Minimalist Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-charcoal tracking-tight leading-tight"
        >
          Every character has a story.
          <br />
          <span className="font-serif italic font-normal text-cinnabar">
            Begin writing yours today.
          </span>
        </motion.h2>

        {/* Clean, Single-Sentence Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mt-4 max-w-md text-xs sm:text-sm text-charcoal/70 font-normal leading-relaxed"
        >
          Explore HSK vocabulary, practice stroke handwriting with instant AI feedback, and learn at your own pace.
        </motion.p>

        {/* Action Button: Get Started -> /register */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.22 }}
          className="mt-8 flex flex-col items-center gap-2.5"
        >
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-cinnabar hover:bg-[#8f2720] text-white px-8 py-3.5 text-xs sm:text-sm font-semibold shadow-xs transition-all duration-200 hover:scale-102 active:scale-98"
          >
            <span>Get Started</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 font-mono text-sm">
              →
            </span>
          </Link>

          <span className="text-[11px] text-muted font-normal">
            Free forever · Instant guest access
          </span>
        </motion.div>
      </div>
    </section>
  )
}
