import { useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../../context/AuthContext'
import { getWordExample } from '../../utils/exampleSentences'

// ==========================================
// SCATTERED TIAN ZI GE PRACTICE BOXES IN BACKGROUND (~5% OPACITY)
// ==========================================
const BACKGROUND_PRACTICE_BOXES = [
  {
    char: '字',
    pinyin: 'zì',
    top: '4%',
    left: '3%',
    size: 'size-20 sm:size-24',
    fontSize: 'text-3xl sm:text-4xl',
    rotation: '-rotate-3',
    opacity: 'opacity-[0.05]',
    borderColor: 'border-cinnabar',
    crossColor: 'border-cinnabar/60',
    textColor: 'text-cinnabar'
  },
  {
    char: '词',
    pinyin: 'cí',
    top: '4%',
    right: '4%',
    size: 'size-18 sm:size-22',
    fontSize: 'text-2xl sm:text-3xl',
    rotation: 'rotate-4',
    opacity: 'opacity-[0.05]',
    borderColor: 'border-charcoal',
    crossColor: 'border-charcoal/60',
    textColor: 'text-charcoal'
  },
  {
    char: '学',
    pinyin: 'xué',
    top: '38%',
    left: '2%',
    size: 'size-22 sm:size-26',
    fontSize: 'text-3xl sm:text-4xl',
    rotation: 'rotate-3',
    opacity: 'opacity-[0.05]',
    borderColor: 'border-charcoal',
    crossColor: 'border-charcoal/60',
    textColor: 'text-charcoal'
  },
  {
    char: '语',
    pinyin: 'yǔ',
    top: '40%',
    right: '2.5%',
    size: 'size-24 sm:size-28',
    fontSize: 'text-4xl sm:text-5xl',
    rotation: '-rotate-4',
    opacity: 'opacity-[0.05]',
    borderColor: 'border-cinnabar',
    crossColor: 'border-cinnabar/60',
    textColor: 'text-cinnabar'
  },
  {
    char: '日',
    pinyin: 'rì',
    bottom: '10%',
    left: '6%',
    size: 'size-16 sm:size-20',
    fontSize: 'text-2xl sm:text-3xl',
    rotation: '-rotate-6',
    opacity: 'opacity-[0.05]',
    borderColor: 'border-charcoal',
    crossColor: 'border-charcoal/60',
    textColor: 'text-charcoal'
  },
  {
    char: '文',
    pinyin: 'wén',
    bottom: '10%',
    right: '8%',
    size: 'size-20 sm:size-24',
    fontSize: 'text-3xl sm:text-4xl',
    rotation: 'rotate-6',
    opacity: 'opacity-[0.05]',
    borderColor: 'border-charcoal',
    crossColor: 'border-charcoal/60',
    textColor: 'text-charcoal'
  },
  {
    char: '读',
    pinyin: 'dú',
    top: '12%',
    left: '52%',
    size: 'size-16 sm:size-18',
    fontSize: 'text-2xl sm:text-3xl',
    rotation: 'rotate-3',
    opacity: 'opacity-[0.05]',
    borderColor: 'border-cinnabar',
    crossColor: 'border-cinnabar/60',
    textColor: 'text-cinnabar'
  },
  {
    char: '忆',
    pinyin: 'yì',
    bottom: '12%',
    left: '48%',
    size: 'size-16 sm:size-20',
    fontSize: 'text-2xl sm:text-3xl',
    rotation: '-rotate-3',
    opacity: 'opacity-[0.05]',
    borderColor: 'border-charcoal',
    crossColor: 'border-charcoal/60',
    textColor: 'text-charcoal'
  }
]

export default function DailyWordsSection({
  dailyWords,
  loadingDaily,
  onSelectWord,
  onSaveWord,
  saveSuccessMsg,
  onRefreshWords
}) {
  const { isAuthenticated } = useAuth()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <section id="daily-words" className="relative z-10 w-full py-20 sm:py-28 lg:pb-36 overflow-hidden">
      {/* ============================================================== */}
      {/* DECORATIVE BACKGROUND: FULL-BLEED GRID WITH SOFT FADE (NO HARSH CUTS) */}
      {/* ============================================================== */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Full-width Calligraphy Practice Paper Grid with Feathered Radial Fade */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #292723 1px, transparent 1px),
              linear-gradient(to bottom, #292723 1px, transparent 1px)
            `,
            backgroundSize: '52px 52px',
            maskImage: 'radial-gradient(ellipse 80% 75% at 50% 50%, #000 40%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 75% at 50% 50%, #000 40%, transparent 95%)'
          }}
        />

        {/* Soft Ambient Warm Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[380px] bg-cinnabar/[0.02] rounded-full blur-3xl" />

        {/* Scattered Tian Zi Ge Practice Grid Boxes with Faint Characters (~5% Opacity, Safely Padded) */}
        {BACKGROUND_PRACTICE_BOXES.map((box, i) => (
          <div
            key={i}
            style={{
              top: box.top,
              bottom: box.bottom,
              left: box.left,
              right: box.right
            }}
            className={`absolute ${box.size} rounded-2xl border-2 border-dashed ${box.borderColor} ${box.rotation} ${box.opacity} flex flex-col items-center justify-center transition-transform`}
          >
            {/* Crosshairs: Dashed horizontal & vertical practice lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className={`absolute top-1/2 left-0 right-0 h-px border-b border-dashed ${box.crossColor}`} />
              <div className={`absolute top-0 bottom-0 left-1/2 w-px border-r border-dashed ${box.crossColor}`} />
            </div>

            {/* Faint Character */}
            <span className={`font-serif ${box.fontSize} ${box.textColor} leading-none z-10 font-normal`}>
              {box.char}
            </span>

            {/* Subtle Pinyin label */}
            {box.pinyin && (
              <span className="text-[9px] font-sans font-medium text-muted/60 mt-1 z-10 leading-none">
                {box.pinyin}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Main Content Container (Centered max-w-[1240px]) */}
      <div className="relative z-10 mx-auto max-w-[1240px] px-5 lg:px-6">

      {/* Section Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[3px] text-cinnabar uppercase">
            <span className="h-px w-6 bg-cinnabar" />
            <span>A LITTLE PRACTICE EVERY DAY</span>
          </div>

          <h2 className="mt-4 font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-charcoal">
            Words worth <span className="italic text-cinnabar">remembering.</span>
          </h2>

          <p className="mt-3 max-w-xl text-xs sm:text-sm text-muted leading-relaxed">
            Discover three curated HSK vocabulary words every day. Click any card to explore full character details, Pinyin, and stroke information.
          </p>
        </div>

        {/* Optional Shuffle / Info Action */}
        {onRefreshWords && (
          <button
            onClick={onRefreshWords}
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-full border border-[#dcd2c3] bg-paper px-4 py-2 text-xs font-semibold text-charcoal hover:border-cinnabar hover:text-cinnabar transition shadow-xs cursor-pointer active:scale-95"
            title="Roll other words"
          >
            <span>🎲</span>
            <span>Shuffle Random Words</span>
          </button>
        )}
      </div>

      {/* Global save toast notification */}
      {saveSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-8 max-w-md rounded-2xl bg-cinnabar/10 p-3 text-center text-xs font-semibold text-cinnabar border border-cinnabar/20 shadow-xs"
        >
          {saveSuccessMsg}
        </motion.div>
      )}

      {/* 3 Interactive Daily Words Cards Grid */}
      {loadingDaily && dailyWords.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 rounded-3xl border border-[#e5dccd] bg-paper/60 p-7 animate-pulse flex flex-col justify-between"
            >
              <div className="h-4 bg-charcoal/10 rounded w-1/3" />
              <div className="size-20 bg-charcoal/10 rounded-full mx-auto" />
              <div className="space-y-2">
                <div className="h-3 bg-charcoal/10 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-charcoal/10 rounded w-1/2 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {dailyWords.slice(0, 3).map((item, idx) => {
            const example = getWordExample(item)

            return (
              <motion.article
                key={item.id || item.entry_id || idx}
                whileHover={{ y: -7, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectWord && onSelectWord(item)}
                className="group relative flex flex-col justify-between rounded-3xl border border-[#e5dccd] bg-paper p-5 sm:p-6 shadow-[0_4px_24px_rgba(41,39,35,0.06)] hover:shadow-[0_16px_38px_rgba(168,50,40,0.12)] hover:border-cinnabar/40 transition-all duration-300 cursor-pointer select-none overflow-hidden"
              >
                {/* Subtle top oriental corner accent */}
                <div className="absolute top-0 right-0 size-14 overflow-hidden pointer-events-none">
                  <div className="absolute top-[-10px] right-[-10px] size-10 rounded-full bg-cinnabar/5 group-hover:bg-cinnabar/15 transition-colors" />
                </div>

                {/* Card Header: Direct HSK {level} badge & Card Index */}
                <div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="rounded-full bg-cinnabar/10 px-2.5 py-0.5 font-bold tracking-wider text-cinnabar uppercase">
                      HSK {item.level || 1}
                    </span>
                    <span className="text-muted font-medium tracking-wide">
                      TODAY #{idx + 1}
                    </span>
                  </div>

                  {/* Character Centerpiece - Compact & balanced size */}
                  <div className="my-3 text-center">
                    <div className="font-serif text-3xl sm:text-4xl text-charcoal group-hover:text-cinnabar transition-colors duration-300 font-normal">
                      {item.simplified}
                    </div>
                    <p className="mt-1 text-sm sm:text-base font-bold text-cinnabar tracking-wide">
                      {item.pinyin_display}
                    </p>
                    {item.traditional && item.traditional !== item.simplified && (
                      <p className="text-[11px] text-muted mt-0.5">
                        Trad: <span className="font-serif">{item.traditional}</span>
                      </p>
                    )}
                  </div>

                  {/* Meanings Preview */}
                  <div className="border-t border-[#e5dccd] pt-2.5 text-xs text-charcoal/70">
                    <p className="line-clamp-2 leading-relaxed text-center font-normal">
                      {Array.isArray(item.meanings)
                        ? item.meanings.slice(0, 3).join(', ')
                        : item.meanings}
                    </p>
                  </div>

                  {/* Visible Example Sentence Usage Box on the Card */}
                  {example && (
                    <div className="mt-3.5 rounded-2xl bg-[#f5ede0]/70 border border-[#e5dccd] p-3 text-left group-hover:border-cinnabar/30 transition-colors">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-cinnabar uppercase tracking-wider mb-1">
                        <span>例句 · EXAMPLE</span>
                      </div>
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
                </div>

                {/* Card Footer: Interactive Detail CTA */}
                <div className="mt-5 flex items-center justify-between border-t border-[#f0eae0] pt-3 text-xs">
                  <span className="font-semibold text-charcoal group-hover:text-cinnabar transition-colors flex items-center gap-1.5">
                    <span>View Details</span>
                    <motion.span
                      animate={{ x: hoveredIndex === idx ? 3 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      →
                    </motion.span>
                  </span>

                  {/* Save action button */}
                  {isAuthenticated ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSaveWord && onSaveWord(item.entry_id || item.id)
                      }}
                      className="text-xs text-cinnabar hover:underline font-semibold cursor-pointer z-10"
                    >
                      + Save
                    </button>
                  ) : (
                    <span className="text-[11px] text-muted italic">
                      Click for full info
                    </span>
                  )}
                </div>
              </motion.article>
            )
          })}
        </div>
      )}
      </div>
    </section>
  )
}
