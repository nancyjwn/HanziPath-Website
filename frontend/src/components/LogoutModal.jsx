import { motion, AnimatePresence } from 'motion/react'
import logoutImg from '../assets/logout-character.png'

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Overlay with Soft Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Card (Styled with Oriental Theme & Cute Traditional Character) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="relative z-10 w-full max-w-[390px] overflow-hidden rounded-[28px] border border-[#e5dccd] bg-paper p-7 sm:p-8 text-center shadow-2xl"
          >
            {/* Close Button X */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-charcoal/40 hover:bg-cinnabar/10 hover:text-cinnabar transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Traditional Character Illustration */}
            <div className="mx-auto mb-3 flex size-40 sm:size-44 items-center justify-center select-none">
              <img
                src={logoutImg}
                alt="Are you leaving?"
                className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Oriental Theme Sub-badge */}
            <p className="text-[10px] font-bold tracking-[3px] text-cinnabar uppercase mb-1">
              再见 · SIGN OUT
            </p>

            {/* Title */}
            <h3 className="font-heading text-2xl font-bold tracking-tight text-charcoal sm:text-[26px]">
              Are you logging out?
            </h3>

            {/* Subtitle Message */}
            <p className="mt-2 text-xs sm:text-[13px] text-charcoal/70 leading-relaxed max-w-[310px] mx-auto">
              You can always log back in at any time. Your study streak and saved vocabulary will remain safely stored.
            </p>

            {/* Action Buttons: Cancel and Log out */}
            <div className="mt-7 flex items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={onClose}
                className="w-32 rounded-full border border-[#dcd2c3] bg-paper hover:bg-[#ede5d8] py-2.5 text-xs sm:text-sm font-semibold text-charcoal shadow-xs transition-all cursor-pointer"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={onConfirm}
                className="w-32 rounded-full bg-cinnabar hover:bg-[#88271e] py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_4px_14px_rgba(168,50,40,0.35)] hover:shadow-[0_6px_18px_rgba(168,50,40,0.45)] transition-all cursor-pointer"
              >
                Log out
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
