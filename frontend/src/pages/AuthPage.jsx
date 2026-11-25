import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import authBg from '../assets/auth-bg2.png'

export default function AuthPage({ initialMode = 'login' }) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  // Synchronize state when URL changes
  useEffect(() => {
    setIsSignUp(initialMode === 'register' || location.pathname === '/register')
    setError('')
  }, [initialMode, location.pathname])

  const handleModeChange = (signUpMode) => {
    if (isSignUp === signUpMode) return
    setError('')
    setIsSignUp(signUpMode)
    navigate(signUpMode ? '/register' : '/login', { replace: true })
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await login(email.trim(), password)
      if (res.success) {
        navigate(from, { replace: true })
      } else {
        setError(res.message || 'Login failed. Please check your email and password.')
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'An error occurred while connecting to the server.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.')
      return
    }

    if (!agreedTerms) {
      setError('You must agree to the Terms and Conditions of Service.')
      return
    }

    setSubmitting(true)
    try {
      const res = await register(name.trim(), email.trim(), password)
      if (res.success) {
        navigate('/', { replace: true })
      } else {
        setError(res.message || 'Registration failed. Please check your information.')
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'An error occurred during registration. Make sure the email is not already registered.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center font-sans py-8">
      {/* 1. HD Fit Background Image (Always Cover & Crisp) */}
      <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden select-none pointer-events-none">
        <img
          src={authBg}
          alt="HanziPath Background HD"
          className="h-full w-full object-cover object-center"
        />
        {/* Subtle glass wash to enhance light reflection without dimming artwork */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px]" />
      </div>

      {/* 2. Floating Minimal Back to Home Icon Button */}
      <Link
        to="/"
        title="Back to Home"
        aria-label="Back to Home"
        className="fixed top-6 left-6 sm:top-8 sm:left-10 z-30"
      >
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="size-11 rounded-full border border-white/60 bg-white/40 shadow-sm backdrop-blur-md flex items-center justify-center text-charcoal transition hover:bg-white hover:border-white hover:shadow-md cursor-pointer"
        >
          <svg
            className="size-5 text-charcoal"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </motion.div>
      </Link>

      {/* 3. Main Content Split Section */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 my-auto">
        <div className="grid w-full items-center gap-8 lg:gap-12 lg:grid-cols-12">
          {/* Left Column: Slower, Cinematic Statement & Animated Idiom */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="max-w-xl min-h-0 lg:min-h-[290px] flex items-center">
              <AnimatePresence mode="wait">
                {isSignUp ? (
                  <motion.div
                    key="register-headline"
                    initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -18, filter: 'blur(8px)' }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <div className="inline-flex items-center rounded-full border border-white/70 bg-white/40 px-3.5 py-1 text-[11px] font-semibold text-charcoal shadow-xs backdrop-blur-md mb-6">
                      <span>Create New Account</span>
                    </div>

                    <h1 className="font-heading text-4xl font-light tracking-tight text-charcoal sm:text-5xl lg:text-6xl leading-tight">
                      Don't Have An<br />
                      <span className="font-bold text-cinnabar">Account?</span>
                    </h1>

                    <p className="mt-4 text-sm sm:text-base font-medium text-charcoal/80 max-w-md">
                      Sign up for free and start learning Chinese today.
                    </p>

                    {/* Animated Chinese Idiom Card (Hover More White Glow, No Red Dot) */}
                    <motion.div
                      initial={{ opacity: 0, y: 22, scale: 0.96 }}
                      animate={{
                        opacity: 1,
                        y: [0, -4, 0],
                        scale: 1,
                      }}
                      transition={{
                        opacity: { duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
                        scale: { duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
                        y: { repeat: Infinity, duration: 4.8, ease: 'easeInOut' },
                      }}
                      whileHover={{ scale: 1.03 }}
                      className="group mt-6 inline-block rounded-2xl border border-white/60 bg-white/40 px-5 py-3.5 shadow-sm backdrop-blur-md cursor-pointer select-none transition-all duration-300 hover:bg-white/85 hover:border-white hover:shadow-lg"
                    >
                      <p className="font-serif text-base font-bold text-cinnabar tracking-wider transition-colors duration-300 group-hover:text-[#88271e]">
                        千里之行，始于足下
                      </p>
                      <p className="mt-1 text-xs text-charcoal/75 italic transition-colors duration-300 group-hover:text-charcoal font-medium">
                        "A journey of a thousand miles begins with a single step."
                      </p>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="login-headline"
                    initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -18, filter: 'blur(8px)' }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                  >
                    <div className="inline-flex items-center rounded-full border border-white/70 bg-white/40 px-3.5 py-1 text-[11px] font-semibold text-charcoal shadow-xs backdrop-blur-md mb-6">
                      <span>Welcome Back</span>
                    </div>

                    <h1 className="font-heading text-4xl font-light tracking-tight text-charcoal sm:text-5xl lg:text-6xl leading-tight">
                      Welcome<br />
                      <span className="font-bold text-cinnabar">Back!</span>
                    </h1>

                    <p className="mt-4 text-sm sm:text-base font-medium text-charcoal/80 max-w-md">
                      Sign in to continue your HanziPath journey.
                    </p>

                    {/* Animated Chinese Idiom Card (Hover More White Glow, No Red Dot) */}
                    <motion.div
                      initial={{ opacity: 0, y: 22, scale: 0.96 }}
                      animate={{
                        opacity: 1,
                        y: [0, -4, 0],
                        scale: 1,
                      }}
                      transition={{
                        opacity: { duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
                        scale: { duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] },
                        y: { repeat: Infinity, duration: 4.8, ease: 'easeInOut' },
                      }}
                      whileHover={{ scale: 1.03 }}
                      className="group mt-6 inline-block rounded-2xl border border-white/60 bg-white/40 px-5 py-3.5 shadow-sm backdrop-blur-md cursor-pointer select-none transition-all duration-300 hover:bg-white/85 hover:border-white hover:shadow-lg"
                    >
                      <p className="font-serif text-base font-bold text-cinnabar tracking-wider transition-colors duration-300 group-hover:text-[#88271e]">
                        学而时习之，不亦说乎
                      </p>
                      <p className="mt-1 text-xs text-charcoal/75 italic transition-colors duration-300 group-hover:text-charcoal font-medium">
                        "To learn and regularly practice, is that not a joy?"
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Slower Spring Tab Switcher & Smooth Layout Morph */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              layout
              transition={{
                layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
              }}
              className="w-full max-w-md rounded-3xl border border-white/60 bg-white/30 p-6 sm:p-8 lg:p-10 shadow-[0_8px_32px_0_rgba(31,38,135,0.12)] backdrop-blur-xl"
            >
              {/* Slower, Calmer Spring Sliding Pill Tab Switcher */}
              <div className="relative mb-8 flex rounded-full border border-white/70 bg-white/40 p-1.5 backdrop-blur-md shadow-xs select-none">
                <button
                  type="button"
                  onClick={() => handleModeChange(false)}
                  className={`relative z-10 w-1/2 py-2 text-center text-xs font-bold tracking-wider transition-colors duration-300 cursor-pointer ${
                    !isSignUp ? 'text-charcoal' : 'text-charcoal/50 hover:text-charcoal'
                  }`}
                >
                  {!isSignUp && (
                    <motion.div
                      layoutId="activeAuthPill"
                      className="absolute inset-0 rounded-full bg-white shadow-md"
                      transition={{
                        type: 'spring',
                        stiffness: 170,
                        damping: 24,
                        mass: 1,
                      }}
                    />
                  )}
                  <span className="relative z-20">LOGIN</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange(true)}
                  className={`relative z-10 w-1/2 py-2 text-center text-xs font-bold tracking-wider transition-colors duration-300 cursor-pointer ${
                    isSignUp ? 'text-charcoal' : 'text-charcoal/50 hover:text-charcoal'
                  }`}
                >
                  {isSignUp && (
                    <motion.div
                      layoutId="activeAuthPill"
                      className="absolute inset-0 rounded-full bg-white shadow-md"
                      transition={{
                        type: 'spring',
                        stiffness: 170,
                        damping: 24,
                        mass: 1,
                      }}
                    />
                  )}
                  <span className="relative z-20">SIGN UP</span>
                </button>
              </div>

              {/* Header Title with Slower Smooth Fade */}
              <div className="mb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSignUp ? 'signup-title' : 'login-title'}
                    initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h2 className="text-3xl font-heading font-bold tracking-tight text-charcoal">
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </h2>
                    <p className="mt-1 text-xs text-charcoal/70">
                      {isSignUp
                        ? 'Create your new account to begin your journey'
                        : 'Enter your credentials to access your account'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Error Alert Box (No Emoji, Animated Slide-Down) */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-6 rounded-xl border border-rose-300 bg-rose-50/95 px-4 py-2.5 text-xs font-medium text-rose-800 backdrop-blur-md shadow-xs overflow-hidden"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Content Transition: Slow & Gentle */}
              <AnimatePresence mode="wait">
                {isSignUp ? (
                  <motion.form
                    key="form-signup"
                    initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                    transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-5"
                  >
                    {/* Email Field with Underline Style & Mail Icon */}
                    <div className="group border-b border-charcoal/25 pb-1 transition focus-within:border-cinnabar">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                        Email
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@email.com"
                          className="w-full bg-transparent py-1.5 text-sm font-medium text-charcoal placeholder-stone-400 outline-none"
                        />
                        <svg
                          className="size-4 shrink-0 text-charcoal/50 group-focus-within:text-cinnabar transition"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Username / Name Field with User Icon */}
                    <div className="group border-b border-charcoal/25 pb-1 transition focus-within:border-cinnabar">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                        Username / Full Name
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Nancy Jiwono"
                          className="w-full bg-transparent py-1.5 text-sm font-medium text-charcoal placeholder-stone-400 outline-none"
                        />
                        <svg
                          className="size-4 shrink-0 text-charcoal/50 group-focus-within:text-cinnabar transition"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Password Field with Padlock Icon & Show/Hide Toggle */}
                    <div className="group border-b border-charcoal/25 pb-1 transition focus-within:border-cinnabar">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                        Password
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full bg-transparent py-1.5 text-sm font-medium text-charcoal placeholder-stone-400 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-charcoal/50 hover:text-cinnabar transition cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="group border-b border-charcoal/25 pb-1 transition focus-within:border-cinnabar">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                        Confirm Password
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat your password"
                          className="w-full bg-transparent py-1.5 text-sm font-medium text-charcoal placeholder-stone-400 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-charcoal/50 hover:text-cinnabar transition cursor-pointer"
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Terms Agreement Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 text-xs text-charcoal/80 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          required
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="mt-0.5 size-4 rounded border-charcoal/30 bg-white/60 text-cinnabar focus:ring-0 cursor-pointer"
                        />
                        <span className="leading-snug">
                          I Agree To <span className="font-semibold text-charcoal">Terms</span> And{' '}
                          <span className="font-semibold text-charcoal">Conditions</span> Of Service
                        </span>
                      </label>
                    </div>

                    {/* Actions: Pill Button & Have An Account Link */}
                    <div className="flex items-center justify-between gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-full bg-cinnabar hover:bg-[#88271e] text-white px-7 py-2.5 text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <span>{submitting ? 'Processing...' : 'Sign Up'}</span>
                        <span className="text-sm font-bold">›</span>
                      </motion.button>

                      <button
                        type="button"
                        onClick={() => handleModeChange(false)}
                        className="text-xs font-semibold text-charcoal/80 hover:text-cinnabar underline underline-offset-4 transition cursor-pointer"
                      >
                        Have An Account?
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="form-login"
                    initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                    transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-5"
                  >
                    {/* Email Field with Underline Style & Mail Icon */}
                    <div className="group border-b border-charcoal/25 pb-1 transition focus-within:border-cinnabar">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                        Email
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@email.com"
                          className="w-full bg-transparent py-1.5 text-sm font-medium text-charcoal placeholder-stone-400 outline-none"
                        />
                        <svg
                          className="size-4 shrink-0 text-charcoal/50 group-focus-within:text-cinnabar transition"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Password Field with Padlock Icon & Show/Hide Toggle */}
                    <div className="group border-b border-charcoal/25 pb-1 transition focus-within:border-cinnabar">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal/70">
                        Password
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full bg-transparent py-1.5 text-sm font-medium text-charcoal placeholder-stone-400 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-charcoal/50 hover:text-cinnabar transition cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-charcoal/80 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="size-4 rounded border-charcoal/30 bg-white/60 text-cinnabar focus:ring-0 cursor-pointer"
                        />
                        <span>Remember me on this device</span>
                      </label>
                    </div>

                    {/* Actions: Pill Button & Don't Have An Account Link */}
                    <div className="flex items-center justify-between gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-full bg-cinnabar hover:bg-[#88271e] text-white px-7 py-2.5 text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <span>{submitting ? 'Processing...' : 'Sign In'}</span>
                        <span className="text-sm font-bold">›</span>
                      </motion.button>

                      <button
                        type="button"
                        onClick={() => handleModeChange(true)}
                        className="text-xs font-semibold text-charcoal/80 hover:text-cinnabar underline underline-offset-4 transition cursor-pointer"
                      >
                        Don't Have An Account?
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
