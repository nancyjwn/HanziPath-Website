import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import hanzipathLogo from '../assets/hanzipath-logo.png'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredPath, setHoveredPath] = useState(null)
  const [hoveredAuth, setHoveredAuth] = useState(null)
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Handwriting', path: '/handwriting' },
    { label: 'Dictionary', path: '/dictionary' },
    { label: 'HSK Flashcards', path: '/flashcards' },
  ]

  const handleNavClick = () => {
    setMenuOpen(false)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 mx-auto w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] max-w-[1140px] transition-all duration-300">
      {/* Floating Frosted Glass Glossy Pill Container (Sleek & Compact) */}
      <div className="flex h-[48px] sm:h-[52px] items-center justify-between rounded-full border border-white/60 bg-white/40 px-4 sm:px-6 shadow-[0_8px_30px_0_rgba(31,38,135,0.07)] backdrop-blur-xl transition-all duration-300">
        {/* Left: Brand Logo with subtle interactive animation */}
        <Link to="/" onClick={handleNavClick} className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer">
          <motion.img
            src={hanzipathLogo}
            alt="HanziPath Logo"
            whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.3 }}
            className="h-8 sm:h-9 w-auto object-contain shrink-0"
          />
          <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-charcoal transition-colors">
            Hanzi<span className="text-cinnabar font-serif">Path</span>
          </span>
        </Link>

        {/* Center: Desktop Navigation Links with animated hover & click effects */}
        <nav
          className="hidden md:flex items-center gap-6 lg:gap-7"
          onMouseLeave={() => setHoveredPath(null)}
        >
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className="relative py-1.5 focus:outline-none"
              onMouseEnter={() => setHoveredPath(item.path)}
              onClick={handleNavClick}
            >
              {({ isActive }) => (
                <motion.div
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                  className="relative flex items-center justify-center cursor-pointer select-none"
                >
                  <span
                    className={`text-xs font-semibold tracking-wide transition-colors duration-200 ${
                      isActive
                        ? 'text-cinnabar font-bold'
                        : hoveredPath === item.path
                        ? 'text-charcoal font-medium'
                        : 'text-charcoal/75'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Active Underline Indicator (Springs smoothly between tabs) */}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-cinnabar shadow-[0_1px_4px_rgba(168,50,40,0.35)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}

                  {/* Hover Underline Indicator (Appears and glides when hovering inactive tabs) */}
                  {!isActive && hoveredPath === item.path && (
                    <motion.span
                      layoutId="navbar-hover-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-cinnabar/40"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right: Desktop Auth Actions with animated buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <Link
                to="/profile"
                onClick={handleNavClick}
                className="flex items-center gap-2 rounded-full border border-charcoal/10 bg-white/70 hover:bg-white px-3 py-1 sm:py-1.5 text-xs font-semibold text-charcoal hover:text-cinnabar transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <span className="grid size-6 sm:size-6.5 place-items-center rounded-full bg-cinnabar/15 text-cinnabar text-[11px] font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="max-w-[120px] truncate">{user?.name}</span>
              </Link>
            </motion.div>
          ) : (
            <div
              className="flex items-center gap-1 sm:gap-1.5"
              onMouseLeave={() => setHoveredAuth(null)}
            >
              {/* Log in */}
              <Link
                to="/login"
                onMouseEnter={() => setHoveredAuth('login')}
                className="relative px-3 py-1 select-none focus:outline-none"
              >
                <motion.div
                  whileHover={{ y: -0.5 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                  className="relative flex items-center justify-center cursor-pointer"
                >
                  {/* Frosted Capsule Pill on Hover (No Underline) */}
                  {hoveredAuth === 'login' && (
                    <motion.span
                      layoutId="auth-hover-capsule"
                      className="absolute -inset-x-2 -inset-y-1 rounded-full bg-white/75 border border-white/80 shadow-xs backdrop-blur-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                  <span
                    className={`relative z-10 text-xs font-semibold tracking-wide transition-colors duration-200 ${
                      location.pathname === '/login'
                        ? 'text-cinnabar font-bold'
                        : hoveredAuth === 'login'
                        ? 'text-cinnabar'
                        : 'text-charcoal/75'
                    }`}
                  >
                    Log in
                  </span>
                </motion.div>
              </Link>

              {/* Sign up */}
              <Link
                to="/register"
                onMouseEnter={() => setHoveredAuth('register')}
                className="relative px-3 py-1 select-none focus:outline-none"
              >
                <motion.div
                  whileHover={{ y: -0.5 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                  className="relative flex items-center justify-center cursor-pointer"
                >
                  {/* Frosted Capsule Pill on Hover (No Underline) */}
                  {hoveredAuth === 'register' && (
                    <motion.span
                      layoutId="auth-hover-capsule"
                      className="absolute -inset-x-2 -inset-y-1 rounded-full bg-white/75 border border-white/80 shadow-xs backdrop-blur-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                  <span
                    className={`relative z-10 text-xs font-semibold tracking-wide transition-colors duration-200 ${
                      location.pathname === '/register'
                        ? 'text-cinnabar font-bold'
                        : hoveredAuth === 'register'
                        ? 'text-cinnabar'
                        : 'text-charcoal/75'
                    }`}
                  >
                    Sign up
                  </span>
                </motion.div>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex size-9 items-center justify-center rounded-full bg-white/70 hover:bg-white text-charcoal md:hidden border border-white/80 shadow-2xs focus:outline-none cursor-pointer active:scale-95 transition-all"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? (
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Mobile Menu Dropdown with Frosted Glass & Safe Scroll */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-3 flex flex-col gap-2 rounded-3xl border border-white/60 bg-white/95 p-5 shadow-xl backdrop-blur-2xl md:hidden max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-cinnabar/10 text-cinnabar font-bold'
                      : 'text-charcoal/80 hover:bg-black/5 hover:text-cinnabar'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="flex flex-col gap-3 pt-3 mt-1 border-t border-[#e5dccd]">
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  onClick={handleNavClick}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-sm font-semibold text-charcoal hover:bg-black/5 hover:text-cinnabar transition-colors"
                >
                  <span className="grid size-7.5 place-items-center rounded-full bg-cinnabar/15 text-cinnabar text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="truncate">{user?.name} (Profile)</span>
                </Link>
              ) : (
                <div className="flex items-center gap-3 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full text-xs font-semibold text-charcoal/80 hover:text-cinnabar hover:bg-black/5 active:scale-95 transition-all border border-charcoal/15 bg-white/60"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full text-xs font-semibold text-white bg-cinnabar hover:bg-[#88271e] active:scale-95 transition-all shadow-xs"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
