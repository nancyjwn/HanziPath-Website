import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import {
  statisticsService,
  savedCharacterService,
  authService,
} from '../services/api'
import LogoutModal from '../components/LogoutModal'
import profileInkBg2 from '../assets/profile-ink-bg2.png'

// Floating Ambient Chinese Scholar Practice Tiles
const FLOATING_BG_CHARS = [
  { char: '学', pinyin: 'xué', top: '8%', left: '2%', duration: 11, delay: 0 },
  { char: '志', pinyin: 'zhì', top: '15%', right: '3%', duration: 9.5, delay: 0.8 },
  { char: '行', pinyin: 'xíng', top: '55%', left: '1.5%', duration: 10.5, delay: 1.5 },
  { char: '知', pinyin: 'zhī', top: '78%', right: '2%', duration: 10, delay: 0.4 },
]

const DAY_LETTER_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_NAME_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Rotating Classical Scholar Idioms & Literary Mottos (成语雅训)
const SCHOLAR_IDIOMS = [
  {
    hanzi: '敏而好学 · 不耻下问',
    pinyin: 'Mǐn ér hào xué · bù chǐ xià wèn',
    meaning: 'Diligent in learning and humble in asking questions.',
    watermark: '学',
  },
  {
    hanzi: '温故知新 · 可以为师',
    pinyin: 'Wēn gù zhī xīn · kě yǐ wéi shī',
    meaning: 'Reviewing the old to discover new insights.',
    watermark: '新',
  },
  {
    hanzi: '持之以恒 · 水滴石穿',
    pinyin: 'Chí zhī yǐ héng · shuǐ dī shí chuān',
    meaning: 'Perseverance can pierce through stone.',
    watermark: '恒',
  },
  {
    hanzi: '千里之行 · 始于足下',
    pinyin: 'Qiān lǐ zhī xíng · shǐ yú zú xià',
    meaning: 'A journey of a thousand miles begins with a single step.',
    watermark: '行',
  },
  {
    hanzi: '博学笃志 · 切问近思',
    pinyin: 'Bó xué dǔ zhì · qiè wèn jìn sī',
    meaning: 'Broaden your knowledge with steadfast determination.',
    watermark: '博',
  },
]

// Floating Toast Notification Component (Zero emoji, sleek scholar dark pill)
function ToastNotification({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[120] flex items-center justify-center rounded-2xl border border-charcoal/15 bg-[#292723] px-5 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md select-none pointer-events-none"
        >
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// MODAL 1: EDIT PROFILE & CHANGE PASSWORD MODAL (No emojis, highly crafted)
// =============================================================================
function EditProfileModal({ isOpen, onClose, user, onUserUpdated, onToast }) {
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'password'

  // Name Update State
  const [name, setName] = useState(user?.name || '')
  const [updatingName, setUpdatingName] = useState(false)
  const [nameError, setNameError] = useState('')

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Sync initial user name
  useEffect(() => {
    if (user?.name) {
      setName(user.name)
    }
  }, [user])

  const handleUpdateName = async (e) => {
    e.preventDefault()
    setNameError('')

    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Full name cannot be empty.')
      return
    }
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters.')
      return
    }

    setUpdatingName(true)
    try {
      const res = await authService.updateProfile(trimmed)
      if (res.data?.status === 'success') {
        const updatedUser = res.data.data
        onUserUpdated(updatedUser)
        onToast('Profile name updated successfully!')
        onClose()
      } else {
        setNameError(res.data?.message || 'Failed to update profile.')
      }
    } catch (err) {
      setNameError(
        err.response?.data?.message || 'Failed to update profile. Please try again.'
      )
    } finally {
      setUpdatingName(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')

    if (!currentPassword) {
      setPasswordError('Current password is required.')
      return
    }
    if (!newPassword) {
      setPasswordError('New password is required.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password confirmation does not match.')
      return
    }
    if (currentPassword == newPassword) {
      setPasswordError('New password cannot be the same as current password.')
      return
    }

    setChangingPassword(true)
    try {
      const res = await authService.changePassword(currentPassword, newPassword)
      if (res.data?.status === 'success') {
        onToast('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        onClose()
      } else {
        setPasswordError(res.data?.message || 'Failed to update password.')
      }
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          'Failed to update password. Please check your current password.'
      )
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-[#e5dccd] bg-paper p-6 sm:p-8 shadow-2xl"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 flex size-8 items-center justify-center rounded-full text-charcoal/40 hover:bg-cinnabar/10 hover:text-cinnabar transition cursor-pointer"
              aria-label="Close settings modal"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header Badge & Title */}
            <div className="flex items-center gap-2 mb-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-cinnabar/10 text-cinnabar font-serif font-bold text-xs">
                户
              </span>
              <span className="text-[10px] font-bold tracking-widest text-cinnabar uppercase font-mono">
                USER ACCOUNT SETTINGS
              </span>
            </div>
            <h2 className="font-heading text-2xl font-semibold text-charcoal">
              Manage Profile & Security
            </h2>
            <p className="mt-1 text-xs text-charcoal/60">
              Update your display name or change your learning account password.
            </p>

            {/* Segmented Pill Navigation */}
            <div className="mt-6 grid grid-cols-2 gap-1.5 p-1 rounded-2xl border border-[#E7DFD3] bg-[#FAF8F5]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile')
                  setNameError('')
                  setPasswordError('')
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-cinnabar text-white shadow-xs'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Change Name</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('password')
                  setNameError('')
                  setPasswordError('')
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'password'
                    ? 'bg-cinnabar text-white shadow-xs'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Change Password</span>
              </button>
            </div>

            {/* TAB 1: CHANGE NAME */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateName} className="mt-6 space-y-4">
                {nameError && (
                  <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-3 text-xs text-rose-800">
                    {nameError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold tracking-wider text-charcoal/70 uppercase mb-1.5">
                    Email Address (Registered)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full rounded-xl border border-[#E7DFD3] bg-[#FAF8F5]/80 px-4 py-2.5 text-xs text-charcoal/60 cursor-not-allowed select-none"
                  />
                  <span className="block mt-1 text-[10px] text-charcoal/45">
                    Registered email cannot be modified directly.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-charcoal/70 uppercase mb-1.5">
                    Full Name / Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your new display name..."
                    maxLength={100}
                    className="w-full rounded-xl border border-[#E7DFD3] bg-white px-4 py-2.5 text-xs text-charcoal placeholder:text-charcoal/35 focus:border-cinnabar focus:outline-none focus:ring-1 focus:ring-cinnabar transition"
                    autoFocus
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-[#E7DFD3] bg-paper px-4 py-2.5 text-xs font-semibold text-charcoal hover:bg-[#EDE5D8] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingName}
                    className="inline-flex items-center gap-2 rounded-xl bg-cinnabar px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#84271f] transition cursor-pointer disabled:opacity-50"
                  >
                    {updatingName ? (
                      <>
                        <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: CHANGE PASSWORD */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                {passwordError && (
                  <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-3 text-xs text-rose-800">
                    {passwordError}
                  </div>
                )}

                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-charcoal/70 uppercase mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password..."
                      className="w-full rounded-xl border border-[#E7DFD3] bg-white px-4 py-2.5 text-xs text-charcoal placeholder:text-charcoal/35 focus:border-cinnabar focus:outline-none focus:ring-1 focus:ring-cinnabar transition pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-charcoal/45 hover:text-charcoal transition cursor-pointer"
                      tabIndex={-1}
                      aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {showCurrentPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-charcoal/70 uppercase mb-1.5">
                    New Password (Min. 6 Characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password..."
                      className="w-full rounded-xl border border-[#E7DFD3] bg-white px-4 py-2.5 text-xs text-charcoal placeholder:text-charcoal/35 focus:border-cinnabar focus:outline-none focus:ring-1 focus:ring-cinnabar transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-charcoal/45 hover:text-charcoal transition cursor-pointer"
                      tabIndex={-1}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {showNewPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-charcoal/70 uppercase mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password..."
                      className="w-full rounded-xl border border-[#E7DFD3] bg-white px-4 py-2.5 text-xs text-charcoal placeholder:text-charcoal/35 focus:border-cinnabar focus:outline-none focus:ring-1 focus:ring-cinnabar transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-charcoal/45 hover:text-charcoal transition cursor-pointer"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {showConfirmPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-[#E7DFD3] bg-paper px-4 py-2.5 text-xs font-semibold text-charcoal hover:bg-[#EDE5D8] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex items-center gap-2 rounded-xl bg-cinnabar px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#84271f] transition cursor-pointer disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <>
                        <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// HELPER: CLEAN MEANINGS (FILTER HANZI, CL: CLASSIFIERS, META REFERENCES)
// =============================================================================
function getCleanMeaningsList(meanings) {
  if (!meanings) return []
  const rawList = Array.isArray(meanings)
    ? meanings
    : typeof meanings === 'string'
      ? meanings.split(/[,;\n]/)
      : []

  const hanziRegex = /[\u4e00-\u9fff]/
  const cleanedItems = []

  for (const item of rawList) {
    if (!item || typeof item !== 'string') continue
    const trimmed = item.trim()
    if (!trimmed) continue

    // 1. Skip pure classifiers (e.g. "CL:臺|台[tai2]", "classifier: ...")
    if (/^cl\s*:/i.test(trimmed) || /^classifier\b/i.test(trimmed)) {
      continue
    }

    // 2. Skip pure meta cross-references containing Hanzi (e.g. "see 电脑", "variant of ...")
    if (
      /^(?:see|see also|variant of|also written|same as|abbr\. for|surname)\b/i.test(trimmed) &&
      hanziRegex.test(trimmed)
    ) {
      continue
    }

    // 3. Remove inline CL: annotations (e.g. "computer, CL:臺|台[tai2]" -> "computer")
    let cleaned = trimmed
      .replace(/,?\s*CL:[^;,]+/gi, '')
      .replace(/\[[^\]]*\]/g, '') // remove bracketed pinyin/notes
      .replace(/\([^)]*[\u4e00-\u9fff][^)]*\)/g, '') // remove parens with Hanzi
      .replace(/[\u4e00-\u9fff|]+/g, '') // remove any residual Hanzi / pipes
      .replace(/^\s*[,;:\-\s]+\s*/, '')
      .replace(/\s*[,;:\-\s]+\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim()

    // 4. If after cleaning it has meaningful text and doesn't contain Hanzi, keep it
    if (cleaned && cleaned.length > 1 && !hanziRegex.test(cleaned)) {
      cleanedItems.push(cleaned)
    }
  }

  // Fallback if all were stripped
  if (cleanedItems.length === 0) {
    for (const item of rawList) {
      if (typeof item === 'string') {
        const fallback = item
          .replace(/CL:[^\s,]+/gi, '')
          .replace(/[\u4e00-\u9fff|[\]]/g, '')
          .trim()
        if (fallback.length > 1) {
          cleanedItems.push(fallback)
        }
      }
    }
  }

  return cleanedItems
}

function formatCleanMeaningSnippet(meanings) {
  const list = getCleanMeaningsList(meanings)
  if (list.length === 0) return 'Chinese Vocabulary'
  return list.join(', ')
}

// =============================================================================
// COMPONENT: CHARACTER TILE (AUTO-FIT 1, 2, OR 3+ CHINESE CHARACTERS)
// =============================================================================
function CharacterTile({ char, size = 'md' }) {
  const len = char?.length || 1

  let baseClass
  if (size === 'xl') {
    baseClass =
      len === 1
        ? 'w-20 h-20 text-4xl'
        : len === 2
        ? 'h-20 min-w-[92px] px-4 text-2xl sm:text-3xl tracking-normal'
        : 'h-20 min-w-[100px] px-4 text-xl sm:text-2xl tracking-tight'
  } else if (size === 'lg') {
    baseClass =
      len === 1
        ? 'w-14 h-14 text-2xl'
        : len === 2
        ? 'h-14 min-w-[64px] px-3 text-lg sm:text-xl tracking-normal'
        : 'h-14 min-w-[72px] px-3 text-sm sm:text-base tracking-tight'
  } else {
    // 'md' default (h-12)
    baseClass =
      len === 1
        ? 'w-12 h-12 text-2xl'
        : len === 2
        ? 'h-12 min-w-[56px] px-2.5 text-base sm:text-lg tracking-normal'
        : 'h-12 min-w-[64px] px-2.5 text-xs sm:text-sm tracking-tight'
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-xl border border-cinnabar/20 bg-white font-serif font-bold text-charcoal shadow-inner select-none whitespace-nowrap overflow-hidden transition-transform leading-none ${baseClass}`}
    >
      {len === 1 && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-[#292723]/15" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-[#292723]/15" />
        </>
      )}
      <span className="relative z-10 leading-none">{char}</span>
    </div>
  )
}

// =============================================================================
// MODAL 2: SAVED CHARACTERS COLLECTION MODAL (Separate dedicated modal view)
// =============================================================================
function SavedCharactersModal({
  isOpen,
  onClose,
  savedList,
  totalSaved,
  savedCounts,
  selectedSource,
  onSelectSource,
  loadingSaved,
  onDeleteSaved,
  onPlayAudio,
}) {
  // Category Tabs without Emojis (pure SVG icons & clean typography)
  const SOURCE_TABS = [
    {
      key: '',
      label: 'All',
      countKey: 'semua',
      svgPath:
        'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
      key: 'pengenalan',
      label: 'AI Recognition',
      countKey: 'pengenalan',
      svgPath:
        'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    },
    {
      key: 'kamus',
      label: 'Chinese Dictionary',
      countKey: 'kamus',
      svgPath:
        'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
    {
      key: 'flashcard',
      label: 'HSK Flashcards',
      countKey: 'flashcard',
      svgPath: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      key: 'kata_harian',
      label: 'Daily Words',
      countKey: 'kata_harian',
      svgPath:
        'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="relative z-10 flex flex-col w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-[#e5dccd] bg-paper shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7DFD3] bg-[#FAF8F5]/80 p-5 sm:p-6">
              <div className="flex items-center gap-3.5">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-[#A62B2B] via-cinnabar to-[#84211D] font-serif text-xl font-bold text-white shadow-md shadow-cinnabar/20 ring-2 ring-amber-200/40 select-none">
                  藏
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">
                      Saved Character Collection
                    </h2>
                    <span className="rounded-full bg-cinnabar/10 border border-cinnabar/25 px-2.5 py-0.5 text-xs font-bold text-cinnabar">
                      {totalSaved} Words
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-charcoal/60">
                    Chinese vocabulary saved from quizzes, dictionary, AI recognition, and daily words.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="self-end sm:self-center flex size-9 items-center justify-center rounded-full text-charcoal/40 hover:bg-cinnabar/10 hover:text-cinnabar transition cursor-pointer"
                aria-label="Close saved collection"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter Toolbar without Search Input */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#E7DFD3] bg-white/70 px-5 py-3">
              {SOURCE_TABS.map((tab) => {
                const count = savedCounts[tab.countKey] || 0
                const isActive = selectedSource === tab.key

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onSelectSource(tab.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#193b2d] text-white shadow-xs'
                        : 'border border-[#E7DFD3] bg-[#FAF8F5] text-charcoal/70 hover:bg-[#EDE5D8]'
                    }`}
                  >
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={tab.svgPath} />
                    </svg>
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] rounded-full px-1.5 py-0.2 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#E7DFD3] text-charcoal/60'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Modal Body: Scrollable Cards Grid */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {loadingSaved ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
                  <div className="size-8 animate-spin rounded-full border-3 border-cinnabar border-t-transparent" />
                  <span className="text-xs text-charcoal/60">Loading saved character collection...</span>
                </div>
              ) : savedList.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {savedList.map((item) => {
                    const meaningsText = formatCleanMeaningSnippet(item.meanings)

                    return (
                      <div
                        key={item.id}
                        className="relative flex flex-col justify-between rounded-2xl border border-[#E7DFD3] bg-[#FAF8F5]/90 p-5 shadow-2xs hover:border-cinnabar/40 hover:shadow-md transition-all group"
                      >
                        {/* Remove Bookmark Button (Top Right) */}
                        <button
                          type="button"
                          onClick={() => onDeleteSaved(item)}
                          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full border border-[#E7DFD3] bg-white text-charcoal/40 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer shadow-2xs group-hover:scale-105"
                          title="Remove from saved collection"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        <div>
                          {/* Character Card Header */}
                          <div className="flex items-start gap-3.5 pr-10">
                            {/* Auto-Fit Character Tile */}
                            <CharacterTile char={item.simplified} size="lg" />

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-heading text-lg font-bold text-charcoal truncate">
                                  {item.simplified}
                                </h3>
                                <button
                                  type="button"
                                  onClick={(e) => onPlayAudio(item.simplified, e)}
                                  className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#E7DFD3] bg-white text-charcoal/60 hover:bg-cinnabar hover:text-white transition cursor-pointer shadow-2xs"
                                  title="Listen to pronunciation"
                                >
                                  <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                                  </svg>
                                </button>
                              </div>

                              <span className="block font-sans text-xs font-bold text-cinnabar">
                                {item.pinyin_display}
                                {item.pinyin_numbered && (
                                  <span className="ml-1 text-[10px] font-mono text-charcoal/45 font-normal">
                                    ({item.pinyin_numbered})
                                  </span>
                                )}
                              </span>

                              {/* Source Chip */}
                              <div className="mt-1">
                                {item.source === 'pengenalan' && (
                                  <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200/70 px-2 py-0.2 text-[9px] font-semibold text-indigo-700">
                                    AI Recognition
                                  </span>
                                )}
                                {item.source === 'kamus' && (
                                  <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/70 px-2 py-0.2 text-[9px] font-semibold text-emerald-800">
                                    Chinese Dictionary
                                  </span>
                                )}
                                {(item.source === 'flashcard' || item.source === 'hasil_kuis') && (
                                  <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200/70 px-2 py-0.2 text-[9px] font-semibold text-amber-900">
                                    Flashcard HSK
                                  </span>
                                )}
                                {item.source === 'kata_harian' && (
                                  <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-200/70 px-2 py-0.2 text-[9px] font-semibold text-cinnabar">
                                    Daily Words
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Meaning snippet */}
                          <p className="mt-3 text-xs text-charcoal/65 leading-relaxed line-clamp-2">
                            {meaningsText}
                          </p>
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-4 flex items-center justify-between border-t border-[#E7DFD3]/80 pt-3">
                          <span className="text-[10px] font-mono text-charcoal/45">
                            {item.traditional && item.traditional !== item.simplified
                              ? `Trad: ${item.traditional}`
                              : `${item.simplified.length} Characters`}
                          </span>

                          <Link
                            to={`/dictionary?q=${encodeURIComponent(item.simplified)}`}
                            className="inline-flex items-center rounded-lg bg-charcoal hover:bg-black text-white px-3 py-1.5 text-[11px] font-semibold shadow-xs transition group-hover:bg-cinnabar cursor-pointer"
                          >
                            <span>Open Dictionary</span>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#E7DFD3] p-8 text-center bg-white/40">
                  <span className="flex size-12 items-center justify-center rounded-full bg-charcoal/5 font-serif text-xl font-bold text-charcoal/40 mb-2">
                    空
                  </span>
                  <p className="text-xs font-semibold text-charcoal/70">
                    No saved vocabulary in this category.
                  </p>
                  <p className="mt-1 text-[11px] text-charcoal/45 max-w-sm">
                    Save interesting characters while learning from the dictionary, flashcard quizzes, or stroke recognition.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#E7DFD3] bg-[#FAF8F5] px-6 py-3.5 text-xs">
              <span className="text-charcoal/60">
                Showing <strong>{savedList.length}</strong> of <strong>{totalSaved}</strong> saved words
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E7DFD3] bg-white px-4 py-2 font-semibold text-charcoal hover:bg-[#EDE5D8] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// MODAL: SAVED CHARACTER DETAIL (Character Details & Storage Origin)
// =============================================================================
function SavedCharacterDetailModal({
  isOpen,
  onClose,
  item,
  onPlayAudio,
  onDeleteSaved,
}) {
  if (!isOpen || !item) return null

  const getSourceMeta = (source) => {
    switch (source) {
      case 'pengenalan':
        return {
          title: 'AI Character Recognition',
          desc: 'Saved from handwriting identification on the interactive canvas.',
          badgeBg: 'bg-indigo-50 border-indigo-200/70 text-indigo-700',
        }
      case 'kamus':
        return {
          title: 'Chinese Dictionary',
          desc: 'Saved while searching vocabulary in the Chinese dictionary.',
          badgeBg: 'bg-emerald-50 border-emerald-200/70 text-emerald-800',
        }
      case 'flashcard':
      case 'hasil_kuis':
        return {
          title: 'HSK Flashcards & Quiz',
          desc: 'Saved from flashcards or after an HSK quiz session evaluation.',
          badgeBg: 'bg-amber-50 border-amber-200/70 text-amber-900',
        }
      case 'kata_harian':
        return {
          title: 'Daily Words',
          desc: 'Saved from daily featured vocabulary recommendations.',
          badgeBg: 'bg-rose-50 border-rose-200/70 text-cinnabar',
        }
      default:
        return {
          title: 'Vocabulary Collection',
          desc: 'Saved to your personal study collection.',
          badgeBg: 'bg-charcoal/5 border-[#E7DFD3] text-charcoal/80',
        }
    }
  }

  const sourceMeta = getSourceMeta(item.source)
  const meaningsArray = getCleanMeaningsList(item.meanings)

  const formattedDate = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#292723]/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#E7DFD3] bg-[#FAF8F5] p-6 sm:p-7 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E7DFD3]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-cinnabar uppercase font-mono">
                SAVED VOCABULARY DETAILS
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full border border-[#E7DFD3] bg-white text-charcoal/50 hover:bg-[#EDE5D8] hover:text-charcoal transition cursor-pointer"
              aria-label="Close details modal"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Hero Character Tile + Audio + Pronunciation */}
          <div className="mt-5 flex items-center gap-5 rounded-2xl border border-[#E7DFD3] bg-white/80 p-5 shadow-xs">
            {/* Auto-Fit Character Tile */}
            <CharacterTile char={item.simplified} size="xl" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <h3 className="font-heading text-2xl font-bold text-charcoal">
                  {item.simplified}
                </h3>
                <button
                  type="button"
                  onClick={(e) => onPlayAudio(item.simplified, e)}
                  className="flex size-7 items-center justify-center rounded-full border border-cinnabar/30 bg-cinnabar/5 text-cinnabar hover:bg-cinnabar hover:text-white transition cursor-pointer shadow-2xs"
                  title="Listen to audio pronunciation"
                >
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                  </svg>
                </button>
              </div>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-sans text-base font-bold text-cinnabar">
                  {item.pinyin_display}
                </span>
                {item.pinyin_numbered && (
                  <span className="text-xs font-mono text-charcoal/50">
                    ({item.pinyin_numbered})
                  </span>
                )}
              </div>

              {item.traditional && item.traditional !== item.simplified && (
                <p className="mt-0.5 text-xs text-charcoal/60 font-serif">
                  Traditional: <span className="font-bold text-charcoal">{item.traditional}</span>
                </p>
              )}
            </div>
          </div>

          {/* Source & Origin Info Box ("Dari Mana") */}
          <div className="mt-4 rounded-2xl border border-[#E7DFD3] bg-[#F7F2EB]/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-charcoal/50 uppercase font-mono">
                STORAGE SOURCE
              </span>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${sourceMeta.badgeBg}`}>
                {sourceMeta.title}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-charcoal/70 leading-relaxed">
              {sourceMeta.desc}
            </p>
            <div className="mt-2.5 pt-2 border-t border-[#E7DFD3]/70 flex items-center justify-between text-[11px] text-charcoal/50 font-mono">
              <span>Saved on:</span>
              <span>{formattedDate} WITA</span>
            </div>
          </div>

          {/* Meanings / Definisi */}
          <div className="mt-4">
            <span className="text-[10px] font-bold tracking-wider text-charcoal/50 uppercase font-mono">
              DEFINITIONS & MEANINGS
            </span>
            <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {meaningsArray.length > 0 ? (
                meaningsArray.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 rounded-xl border border-[#E7DFD3] bg-white px-3 py-2 text-xs text-charcoal"
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#193b2d]/10 text-[9px] font-bold text-[#193b2d] font-mono">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{m}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs italic text-charcoal/50">No definition details available.</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E7DFD3]">
            <button
              type="button"
              onClick={() => {
                onClose()
                onDeleteSaved(item)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Remove from Saved</span>
            </button>

            <div className="flex items-center gap-2">
              <Link
                to={`/dictionary?q=${encodeURIComponent(item.simplified)}`}
                className="inline-flex items-center rounded-xl bg-charcoal text-white px-4 py-2 text-xs font-semibold hover:bg-cinnabar transition shadow-xs cursor-pointer"
              >
                <span>View in Dictionary</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// =============================================================================
// MODAL: QUIZ SESSION DETAIL (Quiz Session Evaluation Sheet)
// =============================================================================
function QuizSessionDetailModal({
  isOpen,
  onClose,
  sessionSummary,
  onPlayAudio,
}) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState('all') // 'all' | 'wrong' | 'correct'

  const sessionId = sessionSummary?.session_id

  useEffect(() => {
    if (!isOpen || !sessionId) {
      setDetail(null)
      setError(null)
      setFilterType('all')
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    statisticsService
      .getHistoryDetail(sessionId)
      .then((res) => {
        if (isMounted) {
          setDetail(res.data?.data || null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err.response?.data?.message || 'Failed to load quiz session details.'
          )
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, sessionId])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const filteredQuestions = useMemo(() => {
    const list = detail?.soal || []
    if (filterType === 'wrong') return list.filter((q) => q.benar === false)
    if (filterType === 'correct') return list.filter((q) => q.benar === true)
    return list
  }, [detail?.soal, filterType])
  const questions = detail?.soal || []

  const countCorrect = detail?.total_benar ?? sessionSummary?.total_benar ?? 0
  const countWrong = detail?.total_salah ?? sessionSummary?.total_salah ?? 0
  const totalCount = detail?.total_soal ?? sessionSummary?.jumlah_soal ?? questions.length
  const accuracy =
    detail?.akurasi ??
    (totalCount > 0 ? Math.round((countCorrect / totalCount) * 100) : 0)

  const dateFormatted = sessionSummary?.started_at
    ? new Date(sessionSummary.started_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WITA'
    : '-'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/50 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#E7DFD3] bg-paper shadow-2xl z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-detail-title"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E7DFD3] bg-[#FAF8F5] px-6 py-5">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-cinnabar/20 bg-cinnabar/5 px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-widest text-cinnabar uppercase">
                  <span>QUIZ DETAILS · HSK {detail?.level ?? sessionSummary?.level ?? 1}</span>
                </div>
                <h2
                  id="quiz-detail-title"
                  className="mt-1 font-heading font-serif text-xl sm:text-2xl font-bold text-charcoal"
                >
                  Question Evaluation Sheet
                </h2>
                <p className="mt-0.5 text-xs text-charcoal/60">
                  Completed on {dateFormatted}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid size-8 place-items-center rounded-full border border-[#E7DFD3] bg-white text-charcoal/60 hover:text-cinnabar hover:border-cinnabar/30 transition cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Score & Summary Metrics Ribbon */}
            <div className="border-b border-[#E7DFD3]/70 bg-white/60 px-6 py-3.5">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-xl border border-[#E7DFD3]/60 bg-paper-light/50 p-2">
                  <span className="block text-[9px] font-mono font-bold tracking-wider text-charcoal/50 uppercase">
                    TOTAL QUESTIONS
                  </span>
                  <p className="mt-0.5 font-serif text-lg font-bold text-charcoal">
                    {totalCount}
                  </p>
                </div>

                <div className="rounded-xl border border-[#E7DFD3]/60 bg-paper-light/50 p-2">
                  <span className="block text-[9px] font-mono font-bold tracking-wider text-emerald-800 uppercase">
                    BENAR
                  </span>
                  <p className="mt-0.5 font-serif text-lg font-bold text-emerald-800">
                    {countCorrect}
                  </p>
                </div>

                <div className="rounded-xl border border-[#E7DFD3]/60 bg-paper-light/50 p-2">
                  <span className="block text-[9px] font-mono font-bold tracking-wider text-cinnabar uppercase">
                    SALAH
                  </span>
                  <p className="mt-0.5 font-serif text-lg font-bold text-cinnabar">
                    {countWrong}
                  </p>
                </div>

                <div className="rounded-xl border border-[#E7DFD3]/60 bg-paper-light/50 p-2">
                  <span className="block text-[9px] font-mono font-bold tracking-wider text-charcoal/50 uppercase">
                    ACCURACY
                  </span>
                  <p className="mt-0.5 font-serif text-lg font-bold text-charcoal">
                    {accuracy}%
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E7DFD3]/50">
                <div className="inline-flex rounded-xl border border-[#E7DFD3] bg-[#FAF8F5] p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                      filterType === 'all'
                        ? 'bg-white text-charcoal font-semibold shadow-2xs'
                        : 'text-charcoal/60 hover:text-charcoal'
                    }`}
                  >
                    All ({questions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('wrong')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                      filterType === 'wrong'
                        ? 'bg-rose-50 text-cinnabar font-semibold shadow-2xs'
                        : 'text-charcoal/60 hover:text-cinnabar'
                    }`}
                  >
                    Incorrect ({countWrong})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('correct')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                      filterType === 'correct'
                        ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-2xs'
                        : 'text-charcoal/60 hover:text-emerald-800'
                    }`}
                  >
                    Correct ({countCorrect})
                  </button>
                </div>

                <span className="text-[11px] font-mono text-charcoal/50">
                  {filteredQuestions.length} Questions displayed
                </span>
              </div>
            </div>

            {/* Questions List Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="inline-block size-6 animate-spin rounded-full border-2 border-cinnabar border-t-transparent" />
                  <p className="mt-3 text-xs font-mono text-charcoal/50">
                    Loading question evaluation sheet...
                  </p>
                </div>
              ) : error ? (
                <div className="py-16 text-center">
                  <p className="text-xs text-cinnabar">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true)
                      setError(null)
                      statisticsService
                        .getHistoryDetail(sessionId)
                        .then((res) => {
                          setDetail(res.data?.data || null)
                          setLoading(false)
                        })
                        .catch((err) => {
                          setError(
                            err.response?.data?.message ||
                              'Gagal memuat rincian sesi kuis.'
                          )
                          setLoading(false)
                        })
                    }}
                    className="mt-3 inline-flex items-center gap-1 rounded-xl border border-cinnabar/30 bg-cinnabar/5 px-3 py-1.5 text-xs font-semibold text-cinnabar hover:bg-cinnabar/10 transition cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : filteredQuestions.length > 0 ? (
                filteredQuestions.map((q, idx) => {
                  const isCorrect = q.benar === true
                  const isWrong = q.benar === false
                  const isUnanswered = q.benar === null

                  return (
                    <div
                      key={q.question_id || idx}
                      className={`rounded-2xl border p-4 transition-all duration-150 ${
                        isCorrect
                          ? 'border-emerald-200/80 bg-emerald-50/20'
                          : isWrong
                          ? 'border-rose-200/80 bg-rose-50/25'
                          : 'border-[#E7DFD3] bg-white/70'
                      }`}
                    >
                      {/* Top bar: Question Number + Status Pill + TTS Audio */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#E7DFD3]/60">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-charcoal/70">
                            Question #{q.nomor_soal}
                          </span>

                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/80 bg-emerald-100/70 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-900">
                              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Correct</span>
                            </span>
                          )}

                          {isWrong && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-300/80 bg-rose-100/70 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-900">
                              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Incorrect</span>
                            </span>
                          )}

                          {isUnanswered && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-stone-100 px-2 py-0.5 text-[10px] font-mono font-bold text-stone-700">
                              <span>Unanswered</span>
                            </span>
                          )}
                        </div>

                        {onPlayAudio && q.simplified && (
                          <button
                            type="button"
                            onClick={(e) => onPlayAudio(q.simplified, e)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E7DFD3] bg-white/80 px-2 py-1 text-[10px] font-mono text-charcoal/70 hover:text-cinnabar hover:border-cinnabar/30 transition cursor-pointer"
                            aria-label={`Listen to pronunciation for ${q.simplified}`}
                          >
                            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            <span>Audio</span>
                          </button>
                        )}
                      </div>

                      {/* Character Details & Answers Comparison */}
                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Hanzi + Meaning */}
                        <div className="flex items-center gap-3">
                          <span className="font-serif text-3xl font-bold text-charcoal select-none">
                            {q.simplified}
                          </span>
                          <div>
                            <p className="font-mono text-sm font-semibold text-charcoal/80">
                              {q.pinyin}
                            </p>
                            <p className="text-xs text-charcoal/60 mt-0.5 line-clamp-1">
                              {Array.isArray(q.meanings)
                                ? q.meanings.slice(0, 2).join('; ')
                                : q.meanings || '-'}
                            </p>
                          </div>
                        </div>

                        {/* Answer Comparison */}
                        <div className="rounded-xl border border-[#E7DFD3]/80 bg-white/90 p-2.5 sm:min-w-[200px] text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-charcoal/50">Your Answer:</span>
                            {isUnanswered ? (
                              <span className="font-mono text-xs italic text-charcoal/40">
                                (Empty)
                              </span>
                            ) : (
                              <span
                                className={`font-mono text-xs font-bold ${
                                  isCorrect ? 'text-emerald-800' : 'text-rose-800 line-through'
                                }`}
                              >
                                {q.jawaban_pengguna}
                              </span>
                            )}
                          </div>

                          {isWrong && (
                            <div className="mt-1 flex items-center justify-between gap-2 pt-1 border-t border-[#E7DFD3]/50">
                              <span className="text-[11px] text-charcoal/50">Correct Key:</span>
                              <span className="font-mono text-xs font-bold text-emerald-800">
                                {q.jawaban_benar}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-16 text-center text-xs text-charcoal/50 font-mono">
                  No questions in this category.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#E7DFD3] bg-[#FAF8F5] px-6 py-3.5 text-xs">
              <span className="text-charcoal/60 font-mono text-[11px]">
                Session Status: <strong>{detail?.status === 'completed' ? 'Completed' : 'In Progress / Incomplete'}</strong>
              </span>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E7DFD3] bg-white px-4 py-2 font-semibold text-charcoal hover:bg-[#EDE5D8] transition cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Smooth Catmull-Rom to Cubic Bezier Spline Path Generator for SVG Line Chart
function generateSplinePath(points) {
  if (!points || points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`

  let d = `M ${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }
  return d
}

// =============================================================================
// MAIN PAGE COMPONENT: PROFILE DASHBOARD (Bento Grid Inspired Layout)
// =============================================================================
export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState(null)
  const [showSessionDetailModal, setShowSessionDetailModal] = useState(false)

  const handleConfirmLogout = () => {
    setShowLogoutModal(false)
    logout()
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    navigate('/', { replace: true })
  }

  // Dynamic Rotating Classical Scholar Idiom State
  const [idiomIdx, setIdiomIdx] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setIdiomIdx((prev) => (prev + 1) % SCHOLAR_IDIOMS.length)
    }, 6500)
    return () => clearInterval(timer)
  }, [])
  const currentIdiom = SCHOLAR_IDIOMS[idiomIdx]

  const handleOpenSessionDetail = (session) => {
    setSelectedSessionForDetail(session)
    setShowSessionDetailModal(true)
  }

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = useCallback((msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2800)
  }, [])

  // Audio Pronunciation Handler
  const handlePlayAudio = (text, e) => {
    if (e) e.stopPropagation()
    if (!text || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }

  // Stats State
  const [stats, setStats] = useState(null)
  const [weeklyStats, setWeeklyStats] = useState([])
  const [dailyStats, setDailyStats] = useState(null)
  const [historyList, setHistoryList] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingStats, setLoadingStats] = useState(true)
  const [activeBarIndex, setActiveBarIndex] = useState(null)

  // Fetch paginated quiz history
  const fetchHistory = useCallback(async (page = 1) => {
    setLoadingHistory(true)
    try {
      const res = await statisticsService.getHistory(page, 5)
      if (res.data?.status === 'success') {
        const historyData = res.data.data
        setHistoryList(Array.isArray(historyData) ? historyData : historyData?.items || [])
        if (res.data.pagination) {
          setHistoryPage(res.data.pagination.page || page)
          setHistoryTotalPages(res.data.pagination.pages || 1)
        }
      }
    } catch (err) {
      console.warn('History fetch notice:', err?.message)
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  // Saved Characters State
  const [savedList, setSavedList] = useState([])
  const [selectedSource, setSelectedSource] = useState('')
  const [savedPage, setSavedPage] = useState(1)
  const [totalSaved, setTotalSaved] = useState(0)
  const [savedCounts, setSavedCounts] = useState({
    semua: 0,
    pengenalan: 0,
    kamus: 0,
    flashcard: 0,
    kata_harian: 0,
  })
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [selectedCharacterDetail, setSelectedCharacterDetail] = useState(null)

  // Fetch all analytics stats
  useEffect(() => {
    let isMounted = true

    const fetchAllStats = async () => {
      try {
        setLoadingStats(true)
        const [overviewRes, weeklyRes, dailyRes, , historyRes] =
          await Promise.allSettled([
            statisticsService.getOverview(),
            statisticsService.getWeekly(),
            statisticsService.getDaily(),
            statisticsService.getProgress(),
            statisticsService.getHistory(1, 5),
          ])

        if (isMounted) {
          if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.data) {
            setStats(overviewRes.value.data.data)
          }
          if (weeklyRes.status === 'fulfilled' && weeklyRes.value.data?.data) {
            setWeeklyStats(weeklyRes.value.data.data || [])
          }
          if (dailyRes.status === 'fulfilled' && dailyRes.value.data?.data) {
            setDailyStats(dailyRes.value.data.data)
          }
          if (historyRes.status === 'fulfilled' && historyRes.value.data?.data) {
            const historyData = historyRes.value.data.data
            setHistoryList(Array.isArray(historyData) ? historyData : historyData?.items || [])
            if (historyRes.value.data.pagination) {
              setHistoryPage(historyRes.value.data.pagination.page || 1)
              setHistoryTotalPages(historyRes.value.data.pagination.pages || 1)
            }
          }
        }
      } catch (err) {
        console.warn('Stats fetch notice:', err?.message)
      } finally {
        if (isMounted) setLoadingStats(false)
      }
    }

    fetchAllStats()

    return () => {
      isMounted = false
    }
  }, [])

  // Fetch saved characters list
  const fetchSaved = useCallback(async (source = '', page = 1) => {
    setLoadingSaved(true)
    try {
      const res = await savedCharacterService.getSaved(source, page, 50)
      if (res.data?.status === 'success') {
        setSavedList(res.data.data || [])
        setTotalSaved(res.data.total ?? res.data.pagination?.total_items ?? 0)
        if (res.data.counts) {
          setSavedCounts(res.data.counts)
        }
        setSavedPage(page)
      }
    } catch (err) {
      console.warn('Saved fetch notice:', err?.message)
    } finally {
      setLoadingSaved(false)
    }
  }, [])

  useEffect(() => {
    fetchSaved(selectedSource, 1)
  }, [selectedSource, fetchSaved])

  const handleDeleteSaved = async (item) => {
    const targetId = item.entry_id || item.id
    if (!window.confirm(`Remove character "${item.simplified}" from saved collection?`)) return
    try {
      await savedCharacterService.deleteSaved(targetId)
      triggerToast(`Character "${item.simplified}" successfully removed from collection.`)
      if (selectedCharacterDetail?.id === item.id || selectedCharacterDetail?.entry_id === targetId) {
        setSelectedCharacterDetail(null)
      }
      fetchSaved(selectedSource, savedPage)
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to remove character.')
    }
  }

  // --- Perhitungan Data Diagram Batang (Weekly Bar Chart) ---
  const weeklyTotalQuestions = useMemo(
    () => weeklyStats.reduce((sum, item) => sum + (item.total_dijawab || 0), 0),
    [weeklyStats]
  )
  const maxWeeklyCount = useMemo(
    () => Math.max(...weeklyStats.map((item) => item.total_dijawab || 0), 10),
    [weeklyStats]
  )

  const maxDayIndex = useMemo(
    () =>
      weeklyStats.reduce((maxIdx, item, idx, arr) => {
        return (item.total_dijawab || 0) > (arr[maxIdx]?.total_dijawab || 0) ? idx : maxIdx
      }, 0),
    [weeklyStats]
  )

  // --- Daily & Weekly Learning Goal Computations ---
  const DAILY_TARGET_GOAL = 30
  const WEEKLY_TARGET_GOAL = 200

  const dailyCount = dailyStats?.total_dijawab || 0
  const dailyProgressPct = Math.min(100, Math.round((dailyCount / DAILY_TARGET_GOAL) * 100))
  const dailyRemaining = Math.max(0, DAILY_TARGET_GOAL - dailyCount)
  const dailyAchieved = dailyCount >= DAILY_TARGET_GOAL

  const weeklyProgressPct = Math.min(100, Math.round((weeklyTotalQuestions / WEEKLY_TARGET_GOAL) * 100))
  const weeklyAchieved = weeklyTotalQuestions >= WEEKLY_TARGET_GOAL

  const weeklyActiveDays = useMemo(
    () => weeklyStats.filter((item) => (item.total_dijawab || 0) > 0).length,
    [weeklyStats]
  )

  const weeklyTotalBenar = useMemo(
    () => weeklyStats.reduce((sum, item) => sum + (item.total_benar || 0), 0),
    [weeklyStats]
  )

  const weeklyAccuracy = useMemo(
    () => (weeklyTotalQuestions > 0 ? Math.round((weeklyTotalBenar / weeklyTotalQuestions) * 100) : 0),
    [weeklyTotalQuestions, weeklyTotalBenar]
  )

  const dailyAverage = useMemo(
    () => Math.round(weeklyTotalQuestions / 7),
    [weeklyTotalQuestions]
  )

  // Line Chart Points & Spline Curve Computations
  const chartPoints = useMemo(() => {
    if (!weeklyStats || weeklyStats.length === 0) return []
    const paddingLeft = 38
    const chartWidth = 424
    const baselineY = 145
    const availableHeight = 110
    const maxVal = Math.max(...weeklyStats.map((item) => item.total_dijawab || 0), 10)

    return weeklyStats.map((item, idx) => {
      const count = item.total_dijawab || 0
      const x = paddingLeft + (idx / 6) * chartWidth
      const y = baselineY - (count / maxVal) * availableHeight
      const dateObj = new Date(item.tanggal)
      const dayIndex = dateObj.getDay()
      const dayLetter = DAY_LETTER_LABELS[dayIndex]
      const dayName = DAY_NAME_LABELS[dayIndex]
      const dateNum = dateObj.getDate()
      const dateMonth = dateObj.getMonth() + 1
      const formattedDate = `${String(dateNum).padStart(2, '0')}/${String(dateMonth).padStart(2, '0')}`

      return {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        count,
        total_benar: item.total_benar || 0,
        dayLetter,
        dayName,
        formattedDate,
        isMax: idx === maxDayIndex && count > 0,
      }
    })
  }, [weeklyStats, maxDayIndex])

  const splineLinePath = useMemo(
    () => generateSplinePath(chartPoints),
    [chartPoints]
  )
  const splineAreaPath = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0) return ''
    return `${splineLinePath} L ${chartPoints[chartPoints.length - 1].x},145 L ${chartPoints[0].x},145 Z`
  }, [chartPoints, splineLinePath])

  return (
    <div className="relative min-h-[90vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast Notification Container */}
      <ToastNotification message={toastMessage} />

      {/* Background: Solid Scholar Rice Paper Color (#F6F0E5) + Crisp Watercolor Ink Texture */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#F6F0E5] select-none">
        {/* Soft Organic Watercolor Ink Mist Texture (Crisp, No Blur) */}
        <img
          src={profileInkBg2}
          alt="Watercolor Ink Mist Texture"
          className="absolute inset-0 h-full w-full object-cover object-center mix-blend-multiply opacity-50"
        />

        {/* Subtle Oriental Coordinate Grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#292723_1px,transparent_1px),linear-gradient(to_bottom,#292723_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.015]" />
        {FLOATING_BG_CHARS.map((item, idx) => (
          <motion.div
            key={idx}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
            }}
            animate={{
              y: [0, -18, 0],
              rotate: [-2, 2.5, -2],
              opacity: [0.22, 0.38, 0.22],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
            className="pointer-events-none absolute hidden lg:flex flex-col items-center select-none"
          >
            <div className="relative flex size-28 sm:size-32 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D4C8B8]/60 bg-[#FAF8F5]/30 shadow-xs backdrop-blur-[0.5px]">
              <span className="font-serif text-5xl font-normal text-charcoal/25 leading-none">
                {item.char}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-charcoal/20 uppercase mt-1.5 leading-none">
                {item.pinyin}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">
        {/* ========================================================================= */}
        {/* SECTION 1: EDITORIAL SCHOLAR MASTHEAD (ANIMATED & CREATIVE SCHOLAR ATELIER) */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative pt-2 pb-6 border-b border-[#E2D7C5]"
        >
          {/* Animated Watermark Calligraphy Motif that floats and crossfades with active motto */}
          <div className="pointer-events-none absolute right-4 -top-3 overflow-hidden select-none">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentIdiom.watermark}
                initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
                animate={{
                  opacity: [0.03, 0.065, 0.03],
                  scale: [0.98, 1.04, 0.98],
                  rotate: [-1.5, 1.5, -1.5],
                }}
                exit={{ opacity: 0, scale: 1.1, rotate: 6 }}
                transition={{
                  opacity: { duration: 1.2 },
                  scale: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
                }}
                className="block font-serif text-8xl sm:text-9xl font-black text-charcoal"
              >
                {currentIdiom.watermark}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            {/* Identity Left Column: Rubric Seal Avatar & Scholar Credentials */}
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Carved Rubric Seal Avatar (朱砂文印) with stamp spring & 3D tilt */}
              <motion.div
                initial={{ scale: 0.75, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
                whileHover={{ scale: 1.08, rotate: -3, y: -2 }}
                whileTap={{ scale: 0.94, rotate: 1 }}
                className="group relative flex size-16 sm:size-18 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B3261E] via-cinnabar to-[#6E1917] font-serif text-2xl sm:text-3xl font-bold text-amber-50 shadow-md shadow-cinnabar/25 ring-2 ring-amber-300/40 select-none border border-amber-200/35 cursor-pointer"
                title="Hanlin Scholar Seal"
              >
                {/* Inset Seal Stamp Border with hover micro-reaction */}
                <div className="absolute inset-1 rounded-xl border border-white/25 pointer-events-none transition-transform duration-300 group-hover:scale-95" />

                {/* Subtle animated light sweep across the seal avatar */}
                <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <span className="relative z-10 drop-shadow-sm">{user?.name?.charAt(0)?.toUpperCase() || '文'}</span>

                {/* Rubric Chop Seal Stamp Mark in Corner */}
                <span className="absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-xs bg-amber-200/35 text-[8px] font-serif font-bold text-amber-100/90 leading-none shadow-xs">
                  印
                </span>

                {/* Active Jade Status Dot with breathing pulse */}
                <span
                  className="absolute -bottom-1 -left-1 flex size-4 items-center justify-center rounded-full bg-white shadow-xs ring-1 ring-[#193b2d]/20"
                  title="Active Account"
                >
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#193b2d] opacity-50" />
                    <span className="relative inline-flex size-2 rounded-full bg-[#193b2d]" />
                  </span>
                </span>
              </motion.div>

              <div>
                {/* Scholar Classification Badges (No dot, no checkmark) */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-cinnabar/25 bg-cinnabar/5 px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-widest text-cinnabar uppercase hover:bg-cinnabar/10 transition-colors cursor-default">
                    <span>翰林学籍 · SCHOLAR DOSSIER</span>
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#193b2d]/25 bg-[#193b2d]/5 px-2.5 py-0.5 text-[10px] font-medium text-[#193b2d] hover:bg-[#193b2d]/10 transition-colors cursor-default">
                    <span>Verified Scholar</span>
                  </span>
                </div>

                {/* Personalized Scholar Name & Greeting Subtitle */}
                <div className="mt-1.5">
                  <h1 className="font-heading font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal tracking-tight flex flex-wrap items-baseline gap-2">
                    <span>Hello, {user?.name || 'Chinese Scholar'}</span>
                    <span className="font-sans text-xs sm:text-sm font-medium text-cinnabar/85 tracking-normal">
                      (Welcome Back)
                    </span>
                  </h1>
                </div>

                {/* Metadata Pills Strip */}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal/65">
                  <span className="inline-flex items-center gap-1 font-mono text-charcoal/80">
                    <svg className="size-3.5 text-charcoal/45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{user?.email || 'Active Scholar Account'}</span>
                  </span>
                  <span className="text-charcoal/25">|</span>
                  <span className="hover:text-charcoal transition-colors">HSK 1 - 6 Curriculum</span>
                  <span className="text-charcoal/25">|</span>
                  <span className="inline-flex items-center gap-1.5 text-cinnabar/85 font-medium">
                    <span className="size-1 rounded-full bg-cinnabar" />
                    <span>Leitner Box Algorithm</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Toolbar: Practice CTA First, Settings Icon Swapped, Logout Icon */}
            <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
              {/* 1. Launch Practice CTA with shimmering light beam */}
              <motion.div
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/flashcards"
                  className="group relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-cinnabar hover:bg-[#84211D] px-4.5 sm:px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:shadow-cinnabar/25 hover:brightness-105 transition cursor-pointer"
                >
                  {/* Subtle animated beam of light passing through on hover */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent ease-out" />

                  <svg className="size-3.5 fill-current text-white/90" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Start Quiz</span>
                </Link>
              </motion.div>

              {/* 2. Account Settings Button (Icon-Only, Swapped Position) */}
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setShowEditProfileModal(true)}
                className="group flex size-9 sm:size-10 items-center justify-center rounded-xl border border-[#D8CBBA] bg-white hover:bg-[#FAF8F5] text-charcoal/70 hover:text-cinnabar hover:border-cinnabar/40 transition cursor-pointer shadow-2xs"
                title="Profile & Password Settings"
                aria-label="Profile & Password Settings"
              >
                <svg className="size-4 text-charcoal/70 group-hover:rotate-90 group-hover:text-cinnabar transition-transform duration-500 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </motion.button>

              {/* 3. Logout Trigger */}
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="group flex size-9 sm:size-10 items-center justify-center rounded-xl border border-[#D8CBBA] bg-white hover:bg-[#FAF8F5] text-charcoal/60 hover:text-cinnabar hover:border-cinnabar/40 transition cursor-pointer shadow-2xs"
                title="Log Out"
                aria-label="Log Out"
              >
                <svg className="size-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Sub-Banner Strip: Daily Practice Reminder on Left & Live Counters on Right */}
          <div className="mt-5 pt-4 border-t border-[#E2D7C5]/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-charcoal/65">
            {/* Daily Practice Reminder Nudge on Left (Clean Font-Sans, No Box, No Dot) */}
            <div className="flex items-center text-xs sm:text-[13px] min-h-[22px]">
              {dailyAchieved ? (
                <span className="font-sans font-medium text-emerald-800 select-none">
                  Today's practice is complete! Well done, see you tomorrow.
                </span>
              ) : dailyCount > 0 ? (
                <Link
                  to="/flashcards"
                  className="font-sans font-medium text-charcoal/75 hover:text-cinnabar transition-colors cursor-pointer"
                  title="Continue daily practice"
                >
                  Practice in progress ({dailyCount}/30 questions). Keep going, complete {dailyRemaining} more today!
                </Link>
              ) : (
                <Link
                  to="/flashcards"
                  className="font-sans font-medium text-cinnabar/90 hover:text-cinnabar transition-colors cursor-pointer"
                  title="Start today's practice"
                >
                  No practice recorded today. Don't forget to take a quick quiz session!
                </Link>
              )}
            </div>

            {/* Live Stats Ticker with Pulsing Status Dots on Right */}
            <div className="flex items-center gap-4 text-[11px] font-mono font-medium text-charcoal/70 self-end sm:self-auto shrink-0">
              <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-950/5 px-2.5 py-1 border border-emerald-800/10">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
                </span>
                <span>{loadingStats ? '0' : stats?.total_dijawab ?? 0} Questions Practiced</span>
              </span>

              <span className="text-charcoal/20">|</span>

              <span className="inline-flex items-center gap-2 rounded-lg bg-cinnabar/5 px-2.5 py-1 border border-cinnabar/15">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cinnabar opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-cinnabar" />
                </span>
                <span>{totalSaved} Characters Saved</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* SECTION 2: BENTO ROW 1 (Scholar Mastery + Weekly Activity Spline Graph) */}
        {/* ========================================================================= */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Card A: Saved Characters Spotlight Widget (lg:col-span-7) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -3, transition: { duration: 0.22, ease: 'easeOut' } }}
            className="relative overflow-hidden rounded-3xl border border-[#E7DFD3] bg-paper p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-cinnabar/30 transition-all duration-300 lg:col-span-7 flex flex-col justify-between">
            {/* Watermark Calligraphy Motif */}
            <div className="pointer-events-none absolute -right-4 -bottom-6 select-none font-serif text-[120px] sm:text-[140px] font-bold text-charcoal/[0.03] leading-none">
              藏
            </div>

            <div>
              {/* Header */}
              <div className="pb-3 border-b border-[#E7DFD3]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-cinnabar uppercase font-mono">
                    PERSONAL COLLECTION
                  </span>
                  <span className="text-xs text-charcoal/40">·</span>
                  <span className="text-xs text-charcoal/60">Saved Characters</span>
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-charcoal mt-0.5">
                  Saved Characters
                </h3>
              </div>

              {/* Source Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 py-2.5">
                {[
                  { key: '', label: 'All', count: totalSaved },
                  { key: 'pengenalan', label: 'AI Recognition', count: savedCounts.pengenalan || 0 },
                  { key: 'kamus', label: 'Dictionary', count: savedCounts.kamus || 0 },
                  { key: 'flashcard', label: 'Flashcards', count: savedCounts.flashcard || 0 },
                  { key: 'kata_harian', label: 'Daily Words', count: savedCounts.kata_harian || 0 },
                ].map((tab) => {
                  const isActive = selectedSource === tab.key
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSelectedSource(tab.key)}
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-charcoal text-white shadow-xs'
                          : 'border border-[#E7DFD3] bg-[#FAF8F5] text-charcoal/70 hover:bg-white hover:text-charcoal'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono ${
                          isActive ? 'bg-white/20 text-white' : 'bg-charcoal/5 text-charcoal/50'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Cards Grid */}
              <div className="pt-1">
                {loadingSaved ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="h-20 animate-pulse rounded-2xl border border-[#E7DFD3] bg-[#FAF8F5]/60"
                      />
                    ))}
                  </div>
                ) : savedList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedList.slice(0, 4).map((item) => {
                      const meaningsText = formatCleanMeaningSnippet(item.meanings)

                      return (
                        <motion.div
                          key={item.id}
                          onClick={() => setSelectedCharacterDetail(item)}
                          whileHover={{ y: -2, scale: 1.01, transition: { duration: 0.15 } }}
                          whileTap={{ scale: 0.98 }}
                          className="group relative flex items-start gap-3 rounded-2xl border border-[#E7DFD3] bg-[#FAF8F5]/80 p-3 shadow-2xs hover:border-cinnabar/40 hover:bg-white hover:shadow-md transition-all cursor-pointer"
                        >
                          {/* Auto-Fit Character Tile */}
                          <CharacterTile char={item.simplified} size="md" />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 truncate">
                                <h4 className="font-heading text-sm font-bold text-charcoal">
                                  {item.simplified}
                                </h4>
                                <span className="font-sans text-xs font-bold text-cinnabar">
                                  {item.pinyin_display}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePlayAudio(item.simplified, e)
                                }}
                                className="flex size-5 shrink-0 items-center justify-center rounded-full text-charcoal/40 hover:bg-cinnabar/10 hover:text-cinnabar transition cursor-pointer"
                                title="Dengarkan pelafalan audio"
                              >
                                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                                </svg>
                              </button>
                            </div>

                            <p className="mt-0.5 text-[11px] text-charcoal/65 truncate leading-tight">
                              {meaningsText}
                            </p>

                            <div className="mt-2 flex items-center justify-between">
                              {item.source === 'pengenalan' && (
                                <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200/70 px-2 py-0.2 text-[9px] font-semibold text-indigo-700">
                                  AI Recognition
                                </span>
                              )}
                              {item.source === 'kamus' && (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/70 px-2 py-0.2 text-[9px] font-semibold text-emerald-800">
                                  Chinese Dictionary
                                </span>
                              )}
                              {(item.source === 'flashcard' || item.source === 'hasil_kuis') && (
                                <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200/70 px-2 py-0.2 text-[9px] font-semibold text-amber-900">
                                  Flashcard HSK
                                </span>
                              )}
                              {item.source === 'kata_harian' && (
                                <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-200/70 px-2 py-0.2 text-[9px] font-semibold text-cinnabar">
                                  Daily Words
                                </span>
                              )}
                              <span className="text-[10px] font-semibold text-cinnabar/80 group-hover:text-cinnabar transition-colors">
                                Details
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-[140px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#E7DFD3] bg-[#FAF8F5]/50 p-5 text-center">
                    <span className="flex size-9 items-center justify-center rounded-full bg-charcoal/5 font-serif text-base font-bold text-charcoal/40 mb-1.5">
                      字
                    </span>
                    <p className="text-xs font-bold text-charcoal">
                      No characters saved yet {selectedSource ? `in this category` : ''}
                    </p>
                    <p className="mt-0.5 text-[11px] text-charcoal/60 max-w-xs">
                      Save characters from the Dictionary or Handwriting Recognition to view them here.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Link
                        to="/dictionary"
                        className="rounded-xl border border-[#E7DFD3] bg-white px-3 py-1 text-[11px] font-semibold text-charcoal hover:bg-[#EDE5D8] transition"
                      >
                        Open Dictionary
                      </Link>
                      <Link
                        to="/handwriting"
                        className="rounded-xl bg-charcoal text-white px-3 py-1 text-[11px] font-semibold hover:bg-cinnabar transition"
                      >
                        AI Recognition
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Summary Strip */}
            <div className="mt-4 flex items-center justify-between border-t border-[#E7DFD3] pt-3 text-[11px] text-charcoal/55">
              <span>
                Showing {Math.min(4, savedList.length)} of {totalSaved} saved words
              </span>
              <button
                type="button"
                onClick={() => setShowSavedModal(true)}
                className="font-bold text-cinnabar hover:underline cursor-pointer"
              >
                Manage All Characters
              </button>
            </div>
          </motion.div>

          {/* Card B: Weekly Activity Spline Line Chart (lg:col-span-5) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -3, transition: { duration: 0.22, ease: 'easeOut' } }}
            className="rounded-3xl border border-[#E7DFD3] bg-paper p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-cinnabar/30 transition-all duration-300 lg:col-span-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7DFD3]">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-cinnabar uppercase font-mono">
                  WEEKLY ACTIVITY
                </span>
                <h3 className="font-heading text-lg font-bold text-charcoal">
                  Last 7 Days Practice Graph
                </h3>
              </div>
              <span className="rounded-full bg-[#193b2d]/10 border border-[#193b2d]/20 px-2.5 py-1 text-xs font-bold text-[#193b2d]">
                {weeklyTotalQuestions} Questions
              </span>
            </div>

            {/* Line Chart Container */}
            <div className="py-4">
              <div className="relative w-full">
                <svg
                  viewBox="0 0 500 160"
                  className="w-full h-40 sm:h-44 overflow-visible"
                >
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9E2A2B" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#9E2A2B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Guidelines */}
                  <line x1="32" y1="35" x2="468" y2="35" stroke="#E7DFD3" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="26" y="38" textAnchor="end" fontSize="9" fill="#292723" opacity="0.45" fontFamily="monospace">
                    {maxWeeklyCount}
                  </text>

                  <line x1="32" y1="90" x2="468" y2="90" stroke="#E7DFD3" strokeDasharray="3 3" strokeWidth="1" />
                  <text x="26" y="93" textAnchor="end" fontSize="9" fill="#292723" opacity="0.45" fontFamily="monospace">
                    {Math.round(maxWeeklyCount / 2)}
                  </text>

                  <line x1="32" y1="145" x2="468" y2="145" stroke="#E7DFD3" strokeWidth="1.2" />
                  <text x="26" y="148" textAnchor="end" fontSize="9" fill="#292723" opacity="0.45" fontFamily="monospace">
                    0
                  </text>

                  {/* Area Fill */}
                  {splineAreaPath && (
                    <motion.path
                      d={splineAreaPath}
                      fill="url(#areaGrad)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    />
                  )}

                  {/* Spline Curve Line */}
                  {splineLinePath && (
                    <motion.path
                      d={splineLinePath}
                      fill="none"
                      stroke="#9E2A2B"
                      strokeWidth="2.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}

                  {/* Interactive Nodes & Tooltip */}
                  {chartPoints.map((pt, idx) => {
                    const isHovered = activeBarIndex === idx
                    const isMax = pt.isMax
                    return (
                      <motion.g
                        key={idx}
                        className="cursor-pointer"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.25 + idx * 0.07, type: 'spring', stiffness: 350, damping: 20 }}
                        onMouseEnter={() => setActiveBarIndex(idx)}
                        onMouseLeave={() => setActiveBarIndex(null)}
                        onClick={() => setActiveBarIndex(activeBarIndex === idx ? null : idx)}
                      >
                        {/* Vertical guide line on active/hover */}
                        {(isHovered || (activeBarIndex === null && isMax)) && pt.count > 0 && (
                          <line
                            x1={pt.x}
                            y1={pt.y}
                            x2={pt.x}
                            y2="145"
                            stroke="#9E2A2B"
                            strokeDasharray="2 2"
                            strokeWidth="1.2"
                            opacity="0.6"
                          />
                        )}

                        {/* Glow halo */}
                        {(isHovered || isMax) && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 9 : 7}
                            fill="#9E2A2B"
                            opacity={isHovered ? 0.22 : 0.12}
                          />
                        )}

                        {/* Node circle */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 5.5 : isMax ? 4.5 : 3.5}
                          fill={pt.count > 0 ? (isMax || isHovered ? '#9E2A2B' : '#193b2d') : '#EDE5D8'}
                          stroke="#FAF6F0"
                          strokeWidth="1.75"
                        />

                        {/* Touch/hover target */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="18"
                          fill="transparent"
                        />
                      </motion.g>
                    )
                  })}

                  {/* SVG Tooltip Box for hovered or top max node */}
                  {chartPoints.map((pt, idx) => {
                    const isHovered = activeBarIndex === idx
                    const shouldShow = (isHovered || (activeBarIndex === null && pt.isMax)) && pt.count > 0
                    if (!shouldShow) return null
                    const tooltipText = `${pt.count} Questions (${pt.total_benar} Correct)`
                    const textWidth = tooltipText.length * 6.5 + 16
                    const clampedX = Math.max(textWidth / 2 + 8, Math.min(500 - textWidth / 2 - 8, pt.x))
                    const tipY = Math.max(22, pt.y - 14)
                    return (
                      <g key={`tip-${idx}`} className="pointer-events-none transition-all duration-200">
                        <rect
                          x={clampedX - textWidth / 2}
                          y={tipY - 18}
                          width={textWidth}
                          height="20"
                          rx="6"
                          fill="#292723"
                          stroke="#E7DFD3"
                          strokeWidth="0.75"
                        />
                        <text
                          x={clampedX}
                          y={tipY - 5}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {tooltipText}
                        </text>
                      </g>
                    )
                  })}
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between items-center px-4 sm:px-6 pt-1">
                  {chartPoints.map((pt, idx) => {
                    const isHovered = activeBarIndex === idx
                    const isMax = pt.isMax
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveBarIndex(activeBarIndex === idx ? null : idx)}
                        onMouseEnter={() => setActiveBarIndex(idx)}
                        onMouseLeave={() => setActiveBarIndex(null)}
                        className="flex flex-col items-center cursor-pointer px-1 py-0.5 rounded-lg transition"
                      >
                        <span
                          className={`text-xs font-bold transition-colors ${
                            isMax || isHovered ? 'text-cinnabar' : 'text-charcoal/70'
                          }`}
                        >
                          {pt.dayLetter}
                        </span>
                        <span className="text-[9px] text-charcoal/40 font-mono">
                          {pt.formattedDate}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-between border-t border-[#E7DFD3] pt-3 text-[11px] text-charcoal/50">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-3.5 bg-cinnabar rounded-full" /> Practice Activity
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-cinnabar" /> Peak Day
                </span>
              </div>
              <span className="font-mono text-[10px]">Time: WITA</span>
            </div>
          </motion.div>
        </div>



        {/* ========================================================================= */}
        {/* SECTION 3: DUAL TARGET & RECENT SESSIONS (Creative Bento & Insights) */}
        {/* ========================================================================= */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Card 1: Learning Goals & Consistency */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -3, transition: { duration: 0.22, ease: 'easeOut' } }}
            className="rounded-3xl border border-[#E7DFD3] bg-paper p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-cinnabar/30 transition-all duration-300 h-fit">
            {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E7DFD3]/80">
                <div>
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-cinnabar uppercase">
                    LEARNING GOALS
                  </span>
                  <h3 className="mt-0.5 font-heading font-serif text-xl sm:text-2xl font-bold text-charcoal">
                    Goals & Consistency
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-900/15 bg-amber-900/5 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-charcoal/70">
                  HSK 1–6 Curriculum
                </span>
              </div>

              {/* Dual Circular Progress Bento Widgets */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Daily Goal Circular Bento */}
                <div className="flex items-center gap-3.5 rounded-2xl border border-[#E7DFD3] bg-white/75 p-3.5 shadow-2xs hover:bg-white hover:border-cinnabar/30 transition-all duration-200">
                  <div className="relative size-14 shrink-0 flex items-center justify-center">
                    <svg className="size-full -rotate-90 transform" viewBox="0 0 36 36">
                      <path
                        className="text-[#E7DFD3]/80"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <motion.path
                        className="text-cinnabar"
                        strokeDasharray="100, 100"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: Math.min(1, dailyProgressPct / 100) }}
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-mono text-xs font-bold text-charcoal">
                        {dailyProgressPct}%
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-charcoal">
                        Daily Goal
                      </span>
                      {dailyAchieved && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-800">
                          <svg className="size-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs font-bold text-charcoal mt-0.5">
                      {dailyCount} <span className="font-sans font-normal text-charcoal/50">/ {DAILY_TARGET_GOAL} Questions</span>
                    </p>
                    <p className="text-[11px] text-charcoal/55 mt-0.5 truncate">
                      {dailyAchieved ? 'Daily goal reached' : `${dailyRemaining} questions remaining`}
                    </p>
                  </div>
                </div>

                {/* Weekly Goal Circular Bento */}
                <div className="flex items-center gap-3.5 rounded-2xl border border-[#E7DFD3] bg-white/75 p-3.5 shadow-2xs hover:bg-white hover:border-[#193b2d]/30 transition-all duration-200">
                  <div className="relative size-14 shrink-0 flex items-center justify-center">
                    <svg className="size-full -rotate-90 transform" viewBox="0 0 36 36">
                      <path
                        className="text-[#E7DFD3]/80"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <motion.path
                        className="text-[#193b2d]"
                        strokeDasharray="100, 100"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: Math.min(1, weeklyProgressPct / 100) }}
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-mono text-xs font-bold text-charcoal">
                        {weeklyProgressPct}%
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-charcoal">
                        Weekly Goal
                      </span>
                      {weeklyAchieved && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-800">
                          <svg className="size-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs font-bold text-charcoal mt-0.5">
                      {weeklyTotalQuestions} <span className="font-sans font-normal text-charcoal/50">/ {WEEKLY_TARGET_GOAL} Questions</span>
                    </p>
                    <p className="text-[11px] text-charcoal/55 mt-0.5 truncate">
                      {weeklyAchieved ? 'Weekly goal reached' : `${WEEKLY_TARGET_GOAL - weeklyTotalQuestions} questions remaining`}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Consistency Metric Pillars */}
              <div className="mt-3.5 grid grid-cols-3 gap-2.5">
                {/* 1. Active Days */}
                <motion.div whileHover={{ y: -2, scale: 1.02, transition: { duration: 0.15 } }} className="rounded-2xl border border-[#E7DFD3] bg-white/70 p-3 hover:bg-white hover:border-cinnabar/30 transition-all shadow-2xs cursor-default">
                  <div className="flex items-center gap-1.5 text-charcoal/50">
                    <svg className="size-3 text-cinnabar" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase">
                      ACTIVE DAYS
                    </span>
                  </div>
                  <p className="mt-1 font-serif text-xl font-bold text-charcoal">
                    {weeklyActiveDays}{' '}
                    <span className="font-sans text-xs font-normal text-charcoal/50">
                      / 7
                    </span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-charcoal/50">This week</p>
                </motion.div>

                {/* 2. Average */}
                <motion.div whileHover={{ y: -2, scale: 1.02, transition: { duration: 0.15 } }} className="rounded-2xl border border-[#E7DFD3] bg-white/70 p-3 hover:bg-white hover:border-cinnabar/30 transition-all shadow-2xs cursor-default">
                  <div className="flex items-center gap-1.5 text-charcoal/50">
                    <svg className="size-3 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase">
                      AVERAGE
                    </span>
                  </div>
                  <p className="mt-1 font-serif text-xl font-bold text-charcoal">
                    ~{dailyAverage}{' '}
                    <span className="font-sans text-xs font-normal text-charcoal/50">
                      Questions
                    </span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-charcoal/50">Per active day</p>
                </motion.div>

                {/* 3. Accuracy */}
                <motion.div whileHover={{ y: -2, scale: 1.02, transition: { duration: 0.15 } }} className="rounded-2xl border border-[#E7DFD3] bg-white/70 p-3 hover:bg-white hover:border-cinnabar/30 transition-all shadow-2xs cursor-default">
                  <div className="flex items-center gap-1.5 text-charcoal/50">
                    <svg className="size-3 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase">
                      ACCURACY
                    </span>
                  </div>
                  <p className="mt-1 font-serif text-xl font-bold text-emerald-800">
                    {weeklyAccuracy}%
                  </p>
                  <p className="mt-0.5 text-[10px] text-charcoal/50">Overall accuracy</p>
                </motion.div>
              </div>
          </motion.div>

          {/* Card 2: Quiz Session History */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -3, transition: { duration: 0.22, ease: 'easeOut' } }}
            className="rounded-3xl border border-[#E7DFD3] bg-paper p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-cinnabar/30 transition-all duration-300 h-fit flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E7DFD3]/80">
                <div>
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-cinnabar uppercase">
                    RECENT ACTIVITY
                  </span>
                  <h3 className="mt-0.5 font-heading font-serif text-xl sm:text-2xl font-bold text-charcoal">
                    Quiz Session History
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-charcoal/50">
                  5 Sessions / Page
                </span>
              </div>

              {/* 5 Sessions Clean List (Interactive: Click to view details) */}
              <div className="mt-4 divide-y divide-[#E7DFD3]/70">
                {loadingHistory ? (
                  <div className="py-16 text-center text-xs text-charcoal/50 font-mono">
                    Loading session history...
                  </div>
                ) : historyList.length > 0 ? (
                  historyList.slice(0, 5).map((session, idx) => {
                    const totalAns = session.total_dijawab || 0
                    const correctAns = session.total_benar || 0
                    const accuracy =
                      totalAns > 0 ? Math.round((correctAns / totalAns) * 100) : 0
                    const isFinished = session.status === 'completed'
                    const dateStr = session.started_at
                      ? new Date(session.started_at).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now'

                    return (
                      <motion.div
                        key={session.session_id || idx}
                        onClick={() => handleOpenSessionDetail(session)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleOpenSessionDetail(session)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        whileHover={{ x: 3, transition: { duration: 0.15 } }}
                        whileTap={{ scale: 0.99 }}
                        className="group flex items-center justify-between py-2.5 px-2 -mx-2 rounded-xl hover:bg-[#F2ECE1]/60 cursor-pointer transition-colors duration-150 select-none"
                        aria-label={`View HSK ${session.level} quiz evaluation details`}
                      >
                        {/* Left: Pill H1/H2 + Title + Date */}
                        <div className="flex items-center gap-3">
                          <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-cinnabar/10 text-cinnabar font-serif font-bold text-xs select-none group-hover:bg-cinnabar group-hover:text-white transition-colors">
                            H{session.level}
                          </div>
                          <div>
                            <p className="font-serif font-bold text-sm text-charcoal leading-snug group-hover:text-cinnabar transition-colors">
                              HSK {session.level} Flashcards
                            </p>
                            <p className="text-[10px] font-mono text-charcoal/50">
                              {dateStr}
                            </p>
                          </div>
                        </div>

                        {/* Right: Score + Accuracy + Status + Arrow */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-serif font-bold text-xs sm:text-sm text-charcoal">
                              {correctAns}/{totalAns}{' '}
                              <span className="font-sans text-[10px] font-normal text-charcoal/50">
                                Questions
                              </span>
                            </span>
                            <span className="block text-[10px] font-mono text-charcoal/55">
                              Accuracy {accuracy}%
                            </span>
                          </div>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${
                              isFinished
                                ? 'bg-emerald-100/70 text-emerald-800'
                                : 'bg-amber-100/70 text-amber-900'
                            }`}
                          >
                            {isFinished ? 'Completed' : 'In Progress'}
                          </span>

                          <svg
                            className="size-3.5 text-charcoal/30 group-hover:text-cinnabar group-hover:translate-x-0.5 transition-all"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </motion.div>
                    )
                  })
                ) : (
                  <div className="py-16 text-center text-xs text-charcoal/50 font-mono">
                    No quiz sessions yet.
                  </div>
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 pt-3 border-t border-[#E7DFD3]/70 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => fetchHistory(historyPage - 1)}
                disabled={historyPage <= 1 || loadingHistory}
                className="font-mono text-xs text-charcoal/70 hover:text-cinnabar disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                aria-label="Previous page"
              >
                Previous
              </button>

              <span className="font-mono text-[11px] text-charcoal/60">
                Page {historyPage} of {Math.max(1, historyTotalPages)}
              </span>

              <button
                type="button"
                onClick={() => fetchHistory(historyPage + 1)}
                disabled={historyPage >= historyTotalPages || loadingHistory}
                className="font-mono text-xs text-charcoal/70 hover:text-cinnabar disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quiz Session Detail Modal */}
      <QuizSessionDetailModal
        isOpen={showSessionDetailModal}
        onClose={() => setShowSessionDetailModal(false)}
        sessionSummary={selectedSessionForDetail}
        onPlayAudio={handlePlayAudio}
      />

      {/* Edit Profile & Password Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        user={user}
        onUserUpdated={updateUser}
        onToast={triggerToast}
      />

      {/* Saved Characters Full List Modal */}
      <SavedCharactersModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        savedList={savedList}
        totalSaved={totalSaved}
        savedCounts={savedCounts}
        selectedSource={selectedSource}
        onSelectSource={setSelectedSource}
        loadingSaved={loadingSaved}
        onDeleteSaved={handleDeleteSaved}
        onPlayAudio={handlePlayAudio}
      />

      {/* Saved Character Single Detail Modal */}
      <SavedCharacterDetailModal
        isOpen={Boolean(selectedCharacterDetail)}
        item={selectedCharacterDetail}
        onClose={() => setSelectedCharacterDetail(null)}
        onPlayAudio={handlePlayAudio}
        onDeleteSaved={handleDeleteSaved}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  )
}
