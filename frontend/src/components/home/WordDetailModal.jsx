import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../../context/AuthContext'
import { getWordExample } from '../../utils/exampleSentences'

export default function WordDetailModal({ word, isOpen, onClose, onSave, saveMsg }) {
  const { isAuthenticated } = useAuth()

  if (!isOpen || !word) return null

  const example = getWordExample(word)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Card with max-h-[90vh] and flex-col to never overflow screen */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="relative z-10 w-full max-w-[480px] max-h-[90vh] flex flex-col rounded-[26px] border border-[#e5dccd] bg-paper shadow-2xl overflow-hidden"
        >
          {/* 1. Fixed Top Header: Badge + Close Button (Never cut off) */}
          <div className="flex items-center justify-between px-5 sm:px-6 pt-4 pb-3 border-b border-[#f0eae0] shrink-0 bg-paper">
            <div className="inline-flex items-center rounded-full bg-cinnabar/10 px-3 py-0.5 text-xs font-bold tracking-wider text-cinnabar uppercase">
              <span>HSK {word.level || 1}</span>
            </div>

            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-full text-charcoal/45 hover:bg-cinnabar/10 hover:text-cinnabar transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 2. Scrollable Body: Fits any screen height smoothly */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 text-center">
            {/* Character Showcase */}
            <div className="py-1">
              <div className="font-serif text-5xl sm:text-6xl text-charcoal font-normal select-none leading-tight">
                {word.simplified}
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-cinnabar">
                {word.pinyin_display}
              </p>
              {word.pinyin_numbered && (
                <p className="text-[11px] text-muted mt-0.5">
                  Numbered Pinyin: <span className="font-medium text-charcoal">{word.pinyin_numbered}</span>
                </p>
              )}
            </div>

            {/* Character Comparison Info Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl bg-[#eee5d7]/50 p-2.5 text-center">
                <span className="text-[10px] font-bold tracking-wider text-muted uppercase">
                  SIMPLIFIED
                </span>
                <p className="mt-0.5 font-serif text-xl text-charcoal font-medium">
                  {word.simplified}
                </p>
              </div>
              <div className="rounded-xl bg-[#eee5d7]/50 p-2.5 text-center">
                <span className="text-[10px] font-bold tracking-wider text-muted uppercase">
                  TRADITIONAL
                </span>
                <p className="mt-0.5 font-serif text-xl text-charcoal font-medium">
                  {word.traditional || word.simplified}
                </p>
              </div>
            </div>

            {/* Full Meanings / Definitions */}
            <div className="text-left rounded-2xl bg-[#eee5d7]/40 border border-[#e5dccd] p-3">
              <h4 className="text-[10px] font-bold tracking-wider text-muted uppercase">
                DEFINITIONS / MEANINGS
              </h4>
              <ul className="mt-1.5 space-y-1 text-xs text-charcoal max-h-28 overflow-y-auto pr-1">
                {Array.isArray(word.meanings) && word.meanings.length > 0 ? (
                  word.meanings.map((meaning, index) => (
                    <li key={index} className="flex items-start gap-1.5">
                      <span className="text-cinnabar font-bold">•</span>
                      <span className="leading-snug">{meaning}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted italic">No definitions available.</li>
                )}
              </ul>
            </div>

            {/* Example Sentence Usage Box */}
            {example && (
              <div className="rounded-2xl bg-[#eee5d7]/60 border border-[#e5dccd] p-3 text-left">
                <h4 className="text-[10px] font-bold tracking-wider text-cinnabar uppercase mb-1">
                  EXAMPLE USAGE (例句)
                </h4>
                <p className="font-serif text-xs sm:text-sm font-normal text-charcoal leading-snug">
                  {example.chinese}
                </p>
                <p className="text-[10px] text-muted italic mt-0.5 leading-snug">
                  {example.pinyin}
                </p>
                <p className="text-[11px] text-charcoal/85 mt-1 leading-snug">
                  "{example.translation}"
                </p>
              </div>
            )}

            {/* Toast Notification message */}
            {saveMsg && (
              <div className="rounded-lg bg-cinnabar/10 p-2 text-center text-xs font-semibold text-cinnabar border border-cinnabar/20 animate-fadeIn">
                {saveMsg}
              </div>
            )}
          </div>

          {/* 3. Fixed Bottom Action Buttons Footer (Pinned, never cut off) */}
          <div className="px-5 sm:px-6 py-3 border-t border-[#e5dccd] bg-[#fbf7f0] shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
            <Link
              to={`/dictionary?q=${encodeURIComponent(word.simplified)}`}
              onClick={onClose}
              className="rounded-full border border-[#dcd2c3] bg-paper hover:bg-[#ede5d8] px-3.5 py-1.5 text-xs font-semibold text-charcoal transition shrink-0"
            >
              Open in Dictionary →
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to="/handwriting"
                onClick={onClose}
                className="rounded-full border border-cinnabar/30 bg-cinnabar/5 hover:bg-cinnabar/15 px-3.5 py-1.5 text-xs font-semibold text-cinnabar transition whitespace-nowrap"
              >
                Practice Writing
              </Link>

              {isAuthenticated ? (
                <button
                  onClick={() => onSave && onSave(word.id || word.entry_id)}
                  className="rounded-full bg-cinnabar hover:bg-[#88271e] text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer whitespace-nowrap"
                >
                  + Save
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={onClose}
                  className="rounded-full bg-cinnabar hover:bg-[#88271e] text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition whitespace-nowrap"
                >
                  Log in to Save
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
