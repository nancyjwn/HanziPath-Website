import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { hskService } from '../services/api'
import flashcardBg from '../assets/flashcard-bg.jpg'

// Minimalist Floating Background Characters for Ambience
const FLOATING_BG_CHARS = [
  { char: '读', pinyin: 'dú', top: '10%', right: '14%', duration: 9, delay: 0 },
  { char: '学', pinyin: 'xué', top: '48%', right: '2%', duration: 11, delay: 1.2 },
  { char: '忆', pinyin: 'yì', top: '10%', left: '2%', duration: 10, delay: 0.5 },
  { char: '念', pinyin: 'niàn', top: '75%', left: '2%', duration: 9.5, delay: 2 },
  { char: '通', pinyin: 'tōng', top: '85%', right: '2.5%', duration: 10.5, delay: 1.5 },
]

const HSK_TABS = [
  { level: 1, name: 'HSK 1', count: 150 },
  { level: 2, name: 'HSK 2', count: 147 },
  { level: 3, name: 'HSK 3', count: 300 },
  { level: 4, name: 'HSK 4', count: 600 },
  { level: 5, name: 'HSK 5', count: 1300 },
  { level: 6, name: 'HSK 6', count: 2500 },
]

const HSK_METADATA = {
  1: { numeral: '一', label: 'Beginner Level', desc: 'Beginner A1' },
  2: { numeral: '二', label: 'Elementary Level', desc: 'Elementary A2' },
  3: { numeral: '三', label: 'Intermediate Level', desc: 'Intermediate B1' },
  4: { numeral: '四', label: 'Upper Intermediate', desc: 'Independent B2' },
  5: { numeral: '五', label: 'Advanced Level', desc: 'Advanced C1' },
  6: { numeral: '六', label: 'Mastery Level', desc: 'Proficient C2' },
}

// Extract strictly 1 clean, shortest semantic meaning (filtering out dictionary cross-references/meta-definitions)
function getCleanShortMeaning(meanings) {
  if (!meanings || !Array.isArray(meanings) || meanings.length === 0) return 'HSK Word'

  const isMetaDefinition = (text) => {
    if (!text || typeof text !== 'string') return true
    const t = text.toLowerCase().trim()
    return (
      t.startsWith('used in') ||
      t.startsWith('variant of') ||
      t.startsWith('see ') ||
      t.startsWith('see also') ||
      t.startsWith('also written') ||
      t.startsWith('same as') ||
      t.startsWith('abbr. for') ||
      t.startsWith('abbreviation for') ||
      t.startsWith('cl:') ||
      t.startsWith('classifier:') ||
      t.startsWith('classifier for') ||
      t.startsWith('surname') ||
      t.startsWith('old variant') ||
      t.includes('|') // character variants or compound pointers like 傢伙|家伙
    )
  }

  // Find the first meaning that is NOT a meta reference
  let candidate = meanings.find((m) => typeof m === 'string' && !isMetaDefinition(m))

  // Fallback to first meaning if all entries are considered meta
  if (!candidate) {
    candidate = meanings[0]
  }

  if (typeof candidate !== 'string') return String(candidate || 'HSK Word')

  // Clean brackets, parentheticals, and residual references
  let cleaned = candidate
    .replace(/\[[^\]]*\]/g, '') // remove [pinyin/hanzi]
    .replace(/\([^)]*\)/g, '') // remove (notes)
    .replace(/[\u4e00-\u9fa5]+[|/][\u4e00-\u9fa5]+/g, '') // remove any residual Hanzi|Hanzi
    .replace(/\s+/g, ' ')
    .trim()

  // Split candidate by common separators: comma, semicolon, slash, or " and "
  const parts = cleaned
    .split(/[,;/]|\band\b/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !isMetaDefinition(p))

  // Choose the shortest, cleanest definition that is informative
  let primary = parts[0] || cleaned

  // If there are multiple parts, find the shortest one that is at least 2 chars
  for (const part of parts) {
    if (part.length >= 2 && part.length < primary.length && !part.toLowerCase().includes('used in')) {
      primary = part
    }
  }

  primary = primary.trim()
  if (!primary) return 'HSK Word'

  // Capitalize first character
  return primary.charAt(0).toUpperCase() + primary.slice(1)
}

export default function FlashcardDetailPage() {
  const { level: paramLevel } = useParams()
  const navigate = useNavigate()

  // Initial Level from URL or default to 1
  const initialLevel = useMemo(() => {
    const parsed = parseInt(paramLevel, 10)
    return parsed >= 1 && parsed <= 6 ? parsed : 1
  }, [paramLevel])

  const [activeLevel, setActiveLevel] = useState(initialLevel)
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Track registered word count per level (defaults with known DB count 147 for HSK 2)
  const [levelCounts, setLevelCounts] = useState({
    1: 150,
    2: 147,
    3: 300,
    4: 600,
    5: 1300,
    6: 2500,
  })

  // Synchronize dynamic registered character counts across all levels on mount
  useEffect(() => {
    let isMounted = true
    const syncLevelCounts = async () => {
      try {
        const promises = [1, 2, 3, 4, 5, 6].map((lvl) =>
          hskService.getWordsByLevel(lvl, '', 1, 1).catch(() => null)
        )
        const responses = await Promise.all(promises)
        if (!isMounted) return
        const newCounts = {}
        responses.forEach((res, index) => {
          const lvl = index + 1
          const total = res?.data?.pagination?.total
          if (typeof total === 'number' && total > 0) {
            newCounts[lvl] = total
          }
        })
        if (Object.keys(newCounts).length > 0) {
          setLevelCounts((prev) => ({ ...prev, ...newCounts }))
        }
      } catch {
        // preserve defaults
      }
    }
    syncLevelCounts()
    return () => {
      isMounted = false
    }
  }, [])

  // Set of revealed word IDs (clicked to show pinyin & single meaning)
  const [revealedIds, setRevealedIds] = useState(new Set())

  // Sync activeLevel if URL param changes
  useEffect(() => {
    if (paramLevel) {
      const parsed = parseInt(paramLevel, 10)
      if (parsed >= 1 && parsed <= 6 && parsed !== activeLevel) {
        setActiveLevel(parsed)
      }
    }
  }, [paramLevel, activeLevel])

  // Fetch words for the active HSK level
  const fetchWords = useCallback(async (lvl) => {
    try {
      setLoading(true)
      setError('')
      setRevealedIds(new Set()) // Reset revealed states when changing level
      
      // Request up to 3000 words to cover the full level
      const res = await hskService.getWordsByLevel(lvl, '', 1, 3000)
      if (res.data?.status === 'success') {
        const dataWords = res.data.data || []
        setWords(dataWords)
        const total = res.data.pagination?.total ?? dataWords.length
        if (typeof total === 'number' && total > 0) {
          setLevelCounts((prev) => ({ ...prev, [lvl]: total }))
        }
      } else {
        setError('Failed to load HSK vocabulary.')
      }
    } catch {
      setError('Unable to load vocabulary data. Please ensure the server is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWords(activeLevel)
  }, [activeLevel, fetchWords])

  // Change Level Tab handler
  const handleSelectLevel = (lvl) => {
    if (lvl === activeLevel) return
    setActiveLevel(lvl)
    navigate(`/flashcards/detail/${lvl}`, { replace: true })
  }

  // Toggle reveal for a single card
  const handleToggleCard = (id) => {
    setRevealedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Audio pronunciation helper
  const handlePlayAudio = useCallback((text, e) => {
    if (e) e.stopPropagation()
    if (!('speechSynthesis' in window) || !text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }, [])

  // Filter words by search query
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return words
    const q = searchQuery.toLowerCase().trim()
    return words.filter((w) => {
      const hanzi = (w.simplified || '').toLowerCase()
      const pinyin = (w.pinyin_display || '').toLowerCase()
      const meaning = (w.meanings || []).join(' ').toLowerCase()
      return hanzi.includes(q) || pinyin.includes(q) || meaning.includes(q)
    })
  }, [words, searchQuery])

  // Toggle Reveal All / Hide All
  const isAllRevealed = filteredWords.length > 0 && filteredWords.every((w) => revealedIds.has(w.id))
  
  const handleToggleAll = () => {
    if (isAllRevealed) {
      setRevealedIds(new Set())
    } else {
      const allIds = new Set(filteredWords.map((w) => w.id))
      setRevealedIds(allIds)
    }
  }

  return (
    <div className="relative min-h-[85vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Texture (Base #F6F0E5 + Crumpled Paper + Soft Floating Tiles) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#F6F0E5] select-none">
        {/* Subtle Manuscript Paper Grid Lines */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#292723_1px,transparent_1px),linear-gradient(to_bottom,#292723_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.03]" />

        {/* Crumpled Paper Texture */}
        <img
          src={flashcardBg}
          alt="Ambient Crumpled Paper Texture"
          className="h-full w-full object-cover object-center mix-blend-multiply opacity-60 contrast-105 blur-[1px]"
        />

        {/* Ambient Floating Tian Zi Ge Tiles */}
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
              opacity: [0.24, 0.40, 0.24],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
            className="pointer-events-none absolute hidden lg:flex flex-col items-center select-none"
          >
            <div className="relative flex size-28 sm:size-36 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D4C8B8]/60 bg-[#FAF8F5]/30 shadow-[0_2px_12px_rgba(41,39,35,0.02)] backdrop-blur-[0.5px]">
              <div className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 border-t border-dashed border-[#D4C8B8]/35" />
              <div className="pointer-events-none absolute inset-y-3 left-1/2 -translate-x-1/2 border-l border-dashed border-[#D4C8B8]/35" />
              <span className="relative z-10 font-serif text-5xl sm:text-6xl font-normal text-charcoal/30 leading-none">
                {item.char}
              </span>
              <span className="text-[11px] sm:text-xs font-mono tracking-widest text-charcoal/25 uppercase mt-2 leading-none">
                {item.pinyin}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">
        {/* Navigation Breadcrumb Back to Main Flashcards */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/flashcards"
            className="group inline-flex items-center rounded-xl border border-[#E7DFD3] bg-paper/85 px-4 py-2 text-xs font-bold text-charcoal/75 shadow-2xs backdrop-blur-xs transition-all hover:border-cinnabar/40 hover:text-cinnabar hover:bg-paper cursor-pointer"
          >
            <span>Back to HSK Flashcards</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-charcoal/45">
            <span className="hidden sm:inline">HSK 1 - 6 Standardized Curriculum</span>
          </div>
        </div>

        {/* Page Title & Scholar Header */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#E7DFD3]/80 bg-linear-to-br from-[#FAF8F5]/90 via-[#F5EFEB]/80 to-[#EFE7DC]/60 p-5 sm:p-7 shadow-xs backdrop-blur-xs">
          {/* Subtle Calligraphic Character Watermark */}
          <div className="pointer-events-none absolute -right-4 -bottom-6 select-none font-serif text-[110px] sm:text-[140px] font-bold text-charcoal/[0.035] leading-none">
            词
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            {/* Left: Scholar Seal Stamp + Dynamic Heading */}
            <div className="flex items-start gap-4 sm:gap-5 min-w-0">
              {/* Archaic Rubric Stamp Seal (印章) */}
              <motion.div
                whileHover={{ rotate: 0, scale: 1.05 }}
                className="relative shrink-0 rotate-[-2.5deg] transition-transform duration-300"
                title="Vocabulary Calligraphy Seal"
              >
                <div className="relative flex size-14 sm:size-16 flex-col items-center justify-center rounded-2xl bg-linear-to-br from-[#A62B2B] via-cinnabar to-[#84211D] p-1 text-white shadow-md shadow-cinnabar/25 ring-2 ring-amber-200/40 ring-offset-2 ring-offset-[#F6F0E5]">
                  {/* Inner Fine Border */}
                  <div className="flex size-full flex-col items-center justify-center rounded-xl border border-white/30 bg-black/5">
                    <span className="font-serif text-2xl sm:text-3xl font-extrabold leading-none text-white drop-shadow-xs">
                      词
                    </span>
                    <span className="text-[9px] font-mono tracking-tighter text-white/80 scale-90 uppercase mt-0.5">
                      HSK
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Title & Scholar Badges */}
              <div className="flex-1 min-w-0">
                {/* Archaic Motto Tag & Numeral Motif (No dot) */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-flex items-center rounded-full border border-cinnabar/20 bg-cinnabar/5 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-cinnabar uppercase">
                    字里行间 · HSK ATLAS
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#E0D4C3] bg-paper/90 px-2 py-0.5 text-[10px] font-mono text-charcoal/60">
                    <span className="font-serif font-bold text-cinnabar">
                      {HSK_METADATA[activeLevel]?.numeral || '一'}
                    </span>
                    <span>{HSK_METADATA[activeLevel]?.label || `Level ${activeLevel}`}</span>
                  </span>
                </div>

                {/* Main Heading: "HSK {activeLevel} Vocabulary List" */}
                <h1 className="relative font-heading text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-charcoal flex items-baseline gap-2">
                  <span>HSK {activeLevel}</span>
                  <span className="relative inline-block text-cinnabar font-serif font-bold">
                    Vocabulary List
                    {/* SVG Calligraphic Brush Underline */}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 140 12"
                      fill="none"
                      className="absolute -bottom-1.5 left-0 w-full h-2.5 text-cinnabar/35"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M2 7C32 2 95 3 138 6C105 8.5 45 9 2 7Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </h1>

                {/* Subtitle - STRICTLY 1 SINGLE LINE (No dot) */}
                <div className="mt-2.5 overflow-hidden">
                  <p
                    className="text-xs sm:text-sm text-charcoal/70 truncate font-normal"
                    title="Displaying all vocabulary characters for this level. Click a card to reveal pinyin and definition."
                  >
                    Displaying all vocabulary characters for this level. Click a card to reveal pinyin and definition.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Quick Scholar Metric Badge */}
            <div className="hidden lg:flex items-center gap-2 shrink-0 self-end pb-1">
              <div className="flex flex-col items-end rounded-2xl border border-[#E7DFD3] bg-white/70 px-4 py-2 shadow-2xs backdrop-blur-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal/45">
                  Total Registered Characters
                </span>
                <span className="font-serif text-lg font-bold text-charcoal">
                  {levelCounts[activeLevel] ?? words.length ?? HSK_TABS.find((t) => t.level === activeLevel)?.count ?? 0}{' '}
                  <span className="text-xs font-sans font-normal text-charcoal/50">Words</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Selector Tabs */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {HSK_TABS.map((tab) => {
            const isActive = tab.level === activeLevel
            return (
              <button
                key={tab.level}
                type="button"
                onClick={() => handleSelectLevel(tab.level)}
                className={`relative shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.97] ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'border border-[#E7DFD3] bg-paper/70 text-charcoal/70 hover:border-cinnabar/40 hover:text-charcoal'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeHskDetailTab"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-2xl bg-cinnabar -z-10 shadow-xs"
                  />
                )}
                <span>{tab.name}</span>
                <span className={`ml-1.5 text-[10px] font-mono ${isActive ? 'text-white/80' : 'text-charcoal/40'}`}>
                  ({levelCounts[tab.level] ?? tab.count})
                </span>
              </button>
            )
          })}
        </div>

        {/* Controls Bar: Search & Action Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#E7DFD3] bg-paper/90 p-3 shadow-2xs backdrop-blur-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search character (Hanzi, Pinyin, or Meaning)..."
              className="w-full rounded-xl border border-[#E7DFD3] bg-white/70 px-3.5 py-2 text-xs text-charcoal placeholder:text-charcoal/40 focus:border-cinnabar focus:bg-white focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-charcoal/40 hover:text-charcoal cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action: Reveal/Hide All & Count */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <span className="font-mono text-charcoal/50 text-[11px]">
              {filteredWords.length} words ({revealedIds.size} revealed)
            </span>

            <button
              type="button"
              onClick={handleToggleAll}
              disabled={filteredWords.length === 0}
              className="rounded-xl border border-[#E7DFD3] bg-[#FAF8F5] px-3.5 py-2 font-bold text-charcoal/75 hover:border-cinnabar/40 hover:text-cinnabar transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {isAllRevealed ? 'Hide All' : 'Reveal All'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-cinnabar/30 bg-cinnabar/10 p-4 text-xs font-medium text-cinnabar">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
            {Array.from({ length: 24 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-2xl border border-[#E7DFD3] bg-paper/60 p-4 animate-pulse flex flex-col items-center justify-center"
              >
                <div className="size-12 rounded-xl bg-warm-sand/40" />
              </div>
            ))}
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#E7DFD3] bg-paper/50 p-12 text-center text-charcoal/60">
            <span className="font-serif text-4xl text-charcoal/30">无</span>
            <p className="mt-2 text-xs font-medium">No vocabulary found matching your search.</p>
          </div>
        ) : (
          /* Main Vocabulary Grid: ONLY HANZI by Default, Flips to Hanzi + Pinyin + 1 Arti on Click */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
            {filteredWords.map((item) => {
              const isRevealed = revealedIds.has(item.id)
              const singleMeaning = getCleanShortMeaning(item.meanings)

              return (
                <motion.div
                  key={item.id}
                  layout
                  onClick={() => handleToggleCard(item.id)}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`group relative aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden select-none p-2.5 ${
                    isRevealed
                      ? 'border-cinnabar/50 bg-[#FFFDF9] shadow-sm ring-1 ring-cinnabar/15'
                      : 'border-[#E7DFD3] bg-paper/90 hover:border-cinnabar/30 hover:bg-paper hover:shadow-xs'
                  }`}
                  title={isRevealed ? 'Click to close' : 'Click to reveal pinyin and meaning'}
                >
                  <AnimatePresence mode="wait">
                    {!isRevealed ? (
                      /* STATE 1: CUMAN HANZI SAJA */
                      <motion.div
                        key="hanzi-only"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="flex h-full w-full flex-col items-center justify-center text-center"
                      >
                        {/* Tian Zi Ge subtle crosshairs */}
                        <div className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 border-t border-dashed border-[#E7DFD3]/60" />
                        <div className="pointer-events-none absolute inset-y-3 left-1/2 -translate-x-1/2 border-l border-dashed border-[#E7DFD3]/60" />

                        {/* Large Hanzi Character */}
                        <span className="relative z-10 font-serif text-3xl sm:text-4xl font-normal text-charcoal group-hover:text-cinnabar transition-colors leading-none">
                          {item.simplified}
                        </span>

                        <span className="relative z-10 text-[9px] font-mono text-charcoal/30 tracking-wider mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          open
                        </span>
                      </motion.div>
                    ) : (
                      /* STATE 2: REVEALED: HANZI + PINYIN + ARTI 1 SAJA */
                      <motion.div
                        key="revealed"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="flex h-full w-full flex-col items-center justify-between text-center py-1"
                      >
                        {/* Top: Audio Icon Button */}
                        <div className="flex w-full items-center justify-end pr-0.5">
                          <button
                            type="button"
                            onClick={(e) => handlePlayAudio(item.simplified, e)}
                            className="flex size-5 items-center justify-center rounded-full bg-cinnabar/10 text-[10px] text-cinnabar hover:bg-cinnabar/20 transition cursor-pointer"
                            title="Listen to pronunciation"
                            aria-label={`Listen to ${item.simplified}`}
                          >
                            🔊
                          </button>
                        </div>

                        {/* Center: Hanzi + Pinyin */}
                        <div className="flex flex-col items-center">
                          <span className="font-serif text-2xl sm:text-3xl font-bold text-cinnabar leading-none">
                            {item.simplified}
                          </span>
                          <span className="text-[11px] font-mono font-medium text-charcoal/70 tracking-wide mt-1 leading-none">
                            {item.pinyin_display}
                          </span>
                        </div>

                        {/* Bottom: ARTI 1 SAJA */}
                        <div className="w-full px-1">
                          <span className="block text-[11px] font-sans font-semibold text-charcoal leading-tight line-clamp-2">
                            {singleMeaning}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

