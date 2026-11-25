import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import hanzipathLogo from '../assets/hanzipath-logo.png'

// ==========================================
// 1. ANIMATE UI: LOOPING TYPEWRITER TEXT
// ==========================================
function TypewriterText({ text = 'Be a Part of Our Journey', speed = 80, deleteSpeed = 40, pauseTime = 2200 }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let timer

    if (!isDeleting && displayedText === text) {
      timer = setTimeout(() => setIsDeleting(true), pauseTime)
    } else if (isDeleting && displayedText === '') {
      timer = setTimeout(() => setIsDeleting(false), 500)
    } else {
      const nextSpeed = isDeleting ? deleteSpeed : speed
      timer = setTimeout(() => {
        setDisplayedText((prev) =>
          isDeleting ? text.slice(0, prev.length - 1) : text.slice(0, prev.length + 1)
        )
      }, nextSpeed)
    }

    return () => clearTimeout(timer)
  }, [displayedText, isDeleting, text, speed, deleteSpeed, pauseTime])

  return (
    <span className="inline-flex items-center justify-center">
      <span>{displayedText}</span>
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
        className="inline-block ml-1 w-[2px] h-[0.9em] bg-cinnabar rounded-full align-middle"
      />
    </span>
  )
}

// ==========================================
// 2. ANIMATE UI: RIPPLE BUTTON COMPONENT
// ==========================================
function RippleButton({ children, to, className = '', ...props }) {
  const [ripples, setRipples] = useState([])

  const createRipple = (e) => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = {
      x,
      y,
      size,
      id: Date.now() + Math.random()
    }

    setRipples((prev) => [...prev, newRipple])
  }

  const removeRipple = (id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <Link
      to={to}
      onClick={createRipple}
      className={`relative overflow-hidden cursor-pointer ${className}`}
      {...props}
    >
      <span className="relative z-10 select-none">{children}</span>
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.55 }}
            animate={{ scale: 3.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => removeRipple(ripple.id)}
            className="absolute rounded-full bg-white/40 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              marginLeft: -ripple.size / 2,
              marginTop: -ripple.size / 2
            }}
          />
        ))}
      </AnimatePresence>
    </Link>
  )
}

// ==========================================
// 3. MAIN COMPONENT: COMPACT FOOTER
// ==========================================
export default function Footer() {
  const { isAuthenticated } = useAuth()

  // Track cursor position ONLY inside the center card ("Be a Part of Our Journey")
  const cardRef = useRef(null)
  const [cardCursorPos, setCardCursorPos] = useState({ x: 0, y: 0 })
  const [isHoveringCard, setIsHoveringCard] = useState(false)

  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setCardCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  return (
    <footer className="relative z-20 w-full overflow-hidden bg-[#FAF7F0] border-t-2 border-cinnabar/30 mt-0 text-charcoal">
      {/* ============================================================== */}
      {/* DECORATIVE ELEMENTS (Rich Oriental Atmosphere - No Images!)    */}
      {/* ============================================================== */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Subtle Tian Zi Ge Scholar Paper Texture Dots */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #2b2823 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Faint Floating Tian Zi Ge Character Practice Grids */}
        <div className="absolute top-6 left-12 size-16 border border-dashed border-charcoal/10 rounded-md opacity-40 hidden lg:block">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-2xl text-charcoal/15">字</span>
          </div>
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-charcoal/10" />
          <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-charcoal/10" />
        </div>

        <div className="absolute bottom-6 right-16 size-16 border border-dashed border-charcoal/10 rounded-md opacity-40 hidden lg:block">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-2xl text-charcoal/15">墨</span>
          </div>
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-charcoal/10" />
          <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-charcoal/10" />
        </div>

        {/* Soft Ambient Warm Cinnabar Center Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-cinnabar/[0.035] rounded-full blur-3xl" />

        {/* Watermark Calligraphy: '学' (Study) at Left */}
        <span className="absolute -bottom-10 left-2 font-serif text-[190px] sm:text-[240px] text-charcoal/[0.03] leading-none">
          学
        </span>

        {/* Watermark Calligraphy: '知' (Knowledge) at Mid-Left */}
        <span className="absolute top-2 left-1/4 font-serif text-[110px] text-charcoal/[0.02] leading-none hidden xl:block">
          知
        </span>

        {/* Watermark Calligraphy: '通' (Mastery) at Right */}
        <span className="absolute -top-12 right-2 font-serif text-[200px] sm:text-[250px] text-charcoal/[0.03] leading-none">
          通
        </span>

        {/* Traditional Scholar Corner Accents */}
        <div className="absolute top-2.5 left-3 size-5 border-t-2 border-l-2 border-cinnabar/35" />
        <div className="absolute top-2.5 right-3 size-5 border-t-2 border-r-2 border-cinnabar/35" />
        <div className="absolute bottom-2.5 left-3 size-5 border-b-2 border-l-2 border-cinnabar/35" />
        <div className="absolute bottom-2.5 right-3 size-5 border-b-2 border-r-2 border-cinnabar/35" />
      </div>

      {/* ============================================================== */}
      {/* MAIN CONTENT CONTAINER                                         */}
      {/* ============================================================== */}
      <div className="relative z-10 max-w-[1260px] mx-auto px-5 sm:px-10 lg:px-14 pt-9 sm:pt-11 pb-6 sm:pb-7">
        {/* 3-Column Compact Grid: Left Links, Center Card, Right Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* LEFT SECTION (Columns 1 & 2): Explore & Curriculum */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4 sm:gap-6 relative">
            {/* Column 1: Explore */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="size-1.5 rounded-full bg-cinnabar/70" />
                <h4 className="font-heading text-xs font-bold text-charcoal tracking-wider uppercase">
                  Explore
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs text-charcoal/75">
                <li>
                  <Link to="/#daily-words" className="hover:text-cinnabar transition">Daily Words</Link>
                </li>
                <li>
                  <Link to="/handwriting" className="hover:text-cinnabar transition">Handwriting</Link>
                </li>
                <li>
                  <Link to="/dictionary" className="hover:text-cinnabar transition">120k+ Dictionary</Link>
                </li>
                <li>
                  <Link to="/flashcards" className="hover:text-cinnabar transition">HSK Flashcards</Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Curriculum */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="size-1.5 rounded-full bg-cinnabar/70" />
                <h4 className="font-heading text-xs font-bold text-charcoal tracking-wider uppercase">
                  Curriculum
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs text-charcoal/75">
                <li>
                  <Link to="/#hsk-explore" className="hover:text-cinnabar transition">HSK 1–2 (Beginner)</Link>
                </li>
                <li>
                  <Link to="/#hsk-explore" className="hover:text-cinnabar transition">HSK 3–4 (Intermediate)</Link>
                </li>
                <li>
                  <Link to="/#hsk-explore" className="hover:text-cinnabar transition">HSK 5–6 (Advanced)</Link>
                </li>
                <li>
                  <Link to="/flashcards" className="hover:text-cinnabar transition">Spaced Repetition</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* CENTER SECTION: Compact Elevated Card with Typewriter + Center Card Cursor */}
          <div className="lg:col-span-4 flex justify-center w-full my-1 sm:my-0">
            <div
              ref={cardRef}
              onMouseMove={handleCardMouseMove}
              onMouseEnter={() => setIsHoveringCard(true)}
              onMouseLeave={() => setIsHoveringCard(false)}
              className="relative w-full max-w-sm rounded-2xl bg-[#fffdf9]/95 backdrop-blur-xs border border-[#d8cfbe] p-4 sm:p-5 shadow-[0_10px_30px_rgba(40,30,25,0.07)] text-center text-charcoal transition-all duration-300 hover:border-cinnabar/40 hover:shadow-[0_12px_35px_rgba(168,50,40,0.12)] cursor-default overflow-hidden"
            >
              {/* Traditional Scholar Mounting Corner Brackets for Center Card */}
              <div className="absolute top-2 left-2 size-2.5 border-t border-l border-cinnabar/40 pointer-events-none" />
              <div className="absolute top-2 right-2 size-2.5 border-t border-r border-cinnabar/40 pointer-events-none" />
              <div className="absolute bottom-2 left-2 size-2.5 border-b border-l border-cinnabar/40 pointer-events-none" />
              <div className="absolute bottom-2 right-2 size-2.5 border-b border-r border-cinnabar/40 pointer-events-none" />

              {/* ANIMATE UI: Floating "Join Now" Cursor Follower (ONLY inside this center card!) */}
              <AnimatePresence>
                {isHoveringCard && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: cardCursorPos.x + 10,
                      y: cardCursorPos.y + 10
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      type: 'spring',
                      damping: 24,
                      stiffness: 380,
                      mass: 0.4
                    }}
                    className="pointer-events-none absolute z-50 hidden md:flex items-center rounded-full bg-[#F5EFE4] px-3 py-0.5 text-[10px] font-bold text-cinnabar shadow-md border border-cinnabar/25 select-none"
                  >
                    <span className="tracking-wide">Join Now</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Brand Header */}
              <div className="inline-flex items-center gap-2 relative z-10">
                <img
                  src={hanzipathLogo}
                  alt="HanziPath Logo"
                  className="h-6 w-auto object-contain"
                />
                <span className="font-serif text-xs font-bold tracking-wider text-charcoal">
                  Hanzi<span className="text-cinnabar">Path</span>
                </span>
              </div>

              {/* Animate UI: Looping Typewriter Heading */}
              <h3 className="font-heading text-base sm:text-lg font-bold text-charcoal mt-1 tracking-tight min-h-[1.75rem] flex items-center justify-center relative z-10">
                <TypewriterText text="Be a Part of Our Journey" speed={75} deleteSpeed={35} pauseTime={2200} />
              </h3>

              {/* Subtext */}
              <p className="text-[11px] text-charcoal/70 mt-0.5 leading-snug font-normal relative z-10">
                Sign up free to access AI handwriting & HSK spaced repetition.
              </p>

              {/* Animate UI: Ripple Button (Clean, No Arrow) */}
              <div className="mt-3.5 flex justify-center relative z-10">
                <RippleButton
                  to={isAuthenticated ? "/dashboard" : "/register"}
                  className="inline-flex items-center justify-center rounded-xl bg-cinnabar hover:bg-[#8f2720] text-white px-7 py-2.5 text-xs font-bold tracking-wide transition shadow-xs hover:scale-105 active:scale-95"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                </RippleButton>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION (Columns 3 & 4): Important Links & Connect */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4 sm:gap-6">
            {/* Column 3: Important Links */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="size-1.5 rounded-full bg-cinnabar/70" />
                <h4 className="font-heading text-xs font-bold text-charcoal tracking-wider uppercase">
                  Important Links
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs text-charcoal/75">
                <li>
                  <Link to="/#how-it-works" className="hover:text-cinnabar transition">How It Works</Link>
                </li>
                <li>
                  <Link to="/#how-it-works" className="hover:text-cinnabar transition">Learning FAQ</Link>
                </li>
                <li>
                  <Link to="/dictionary" className="hover:text-cinnabar transition">Radical Breakdown</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-cinnabar transition">Student Sign Up</Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Connect & Quality Seal */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="size-1.5 rounded-full bg-cinnabar/70" />
                  <h4 className="font-heading text-xs font-bold text-charcoal tracking-wider uppercase">
                    Connect With Us
                  </h4>
                </div>
                {/* Social icons */}
                <div className="flex items-center gap-2.5 text-charcoal/70">
                  <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-cinnabar transition">
                    <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-cinnabar transition">
                    <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X Twitter" className="hover:text-cinnabar transition">
                    <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quality Guarantee Seal Badge */}
              <div className="mt-2 flex items-center gap-2 pt-1.5 border-t border-[#d8cdbc]/50">
                <div className="size-7 rounded-full border border-cinnabar/40 bg-cinnabar/10 flex items-center justify-center shrink-0">
                  <span className="font-serif text-[10px] font-bold text-cinnabar">HSK</span>
                </div>
                <div className="text-[9px] leading-tight text-charcoal/70">
                  <span className="block font-semibold text-charcoal">Official 3.0 Standard</span>
                  <span>Verified Curriculum</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM SUB-BAR: Compact Copyright & Back to Top */}
        <div className="mt-5 pt-3 border-t border-[#d8cdbc]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-[11px] text-charcoal/60">
          <p>© {new Date().getFullYear()}, All Rights Reserved HanziPath.</p>

          {/* Quick Back to Top Button in Footer */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#d8cfbe] bg-white/70 hover:bg-white text-charcoal hover:text-cinnabar transition shadow-2xs hover:shadow-xs cursor-pointer font-medium text-[11px]"
            title="Scroll to top"
            aria-label="Scroll back to top"
          >
            <span>Back to Top</span>
            <svg className="size-3 text-cinnabar" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>

          <p className="flex items-center gap-1">
            <span>Made with</span>
            <span className="text-cinnabar">♥</span>
            <span>for Chinese scholars worldwide</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
