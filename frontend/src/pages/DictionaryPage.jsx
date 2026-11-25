import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { dictionaryService, handwritingService, savedCharacterService } from '../services/api'
import { getWordExample } from '../utils/exampleSentences'
import { getPinyinCandidates } from '../utils/pinyinIme'
import dictionaryBg3 from '../assets/dictionary-bg3.png'

// Floating Ambient Chinese Characters in Background
const FLOATING_CHARACTERS = [
  { char: '学', pinyin: 'xué', top: '10%', left: '3%', size: 'text-6xl sm:text-7xl', duration: 8, delay: 0 },
  { char: '墨', pinyin: 'mò', top: '22%', right: '4%', size: 'text-5xl sm:text-6xl', duration: 10, delay: 1.5 },
  { char: '书', pinyin: 'shū', top: '46%', left: '2%', size: 'text-6xl sm:text-7xl', duration: 9, delay: 0.8 },
  { char: '道', pinyin: 'dào', top: '64%', right: '3%', size: 'text-5xl sm:text-6xl', duration: 11, delay: 2 },
  { char: '典', pinyin: 'diǎn', top: '80%', left: '5%', size: 'text-6xl sm:text-7xl', duration: 8.5, delay: 1 },
  { char: '文', pinyin: 'wén', top: '14%', right: '15%', size: 'text-4xl sm:text-5xl', duration: 7.5, delay: 2.5 },
  { char: '智', pinyin: 'zhì', top: '74%', left: '16%', size: 'text-4xl sm:text-5xl', duration: 9.5, delay: 3 },
  { char: '和', pinyin: 'hé', top: '36%', right: '11%', size: 'text-5xl sm:text-6xl', duration: 12, delay: 0.5 },
  { char: '语', pinyin: 'yǔ', top: '54%', left: '11%', size: 'text-4xl sm:text-5xl', duration: 10.5, delay: 1.8 },
  { char: '汉', pinyin: 'hàn', top: '88%', right: '12%', size: 'text-5xl sm:text-6xl', duration: 8, delay: 2.2 },
]

// Extract clean English meaning without raw Hanzi cross-references for card preview
const getCleanCardMeaning = (meanings) => {
  if (!meanings) return ''
  const list = Array.isArray(meanings) ? meanings : [meanings]
  const hanziRegex = /[\u4e00-\u9fff]/

  // 1. Primary: an entry meaning without Hanzi and not starting with 'CL:'
  const pureEnglish = list.find((m) => m && !hanziRegex.test(m) && !m.startsWith('CL:'))
  if (pureEnglish) return pureEnglish

  // 2. Secondary: extract English part if present alongside Hanzi
  for (const m of list) {
    if (!m || m.startsWith('CL:')) continue
    const cleaned = m
      .replace(/(?:see|variant of|also written|also pr\.)\s+[^[\]]+\s*\[[^\]]*\]/gi, '')
      .replace(/[\u4e00-\u9fff]/g, '')
      .replace(/[|[\]]/g, '')
      .replace(/^\s*[,;:\-\s]+\s*/, '')
      .trim()
    if (cleaned && cleaned.length > 2) return cleaned
  }

  // 3. Fallback for pure cross-references containing Hanzi
  const first = list[0] || ''
  if (/^(?:see|variant of|also written)\b/i.test(first) || hanziRegex.test(first)) {
    return 'See details for full definition'
  }
  return first
}

export default function DictionaryPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saveMsg, setSaveMsg] = useState('')

  // Search input ref
  const searchInputRef = useRef(null)

  // Chinese Keyboard (IME) Autocomplete Candidates
  const imeCandidates = useMemo(() => {
    return getPinyinCandidates(query)
  }, [query])

  // Detail Spotlight Modal State
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [modalTab, setModalTab] = useState('translation') // 'translation' | 'definition'
  const [modalQuery, setModalQuery] = useState('')
  const [detailSaveMsg, setDetailSaveMsg] = useState('')

  // Handwriting Canvas Input Modal State
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false)
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [lineWidth, setLineWidth] = useState(14)
  const canvasHistoryRef = useRef([])
  const [canvasLoading, setCanvasLoading] = useState(false)
  const [canvasError, setCanvasError] = useState('')

  // Warm up AI model in background on page mount
  useEffect(() => {
    handwritingService.warmup()
  }, [])

  // Native Speech Synthesis for Pronunciation
  const handlePlayAudio = (text, e) => {
    if (e) e.stopPropagation()
    if (!('speechSynthesis' in window) || !text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }

  // Search execution
  const handleSearch = async (searchQuery, pageNum = 1) => {
    setLoading(true)
    setError('')
    try {
      const res = await dictionaryService.search(searchQuery, pageNum, 18)
      if (res.data?.status === 'success') {
        setResults(res.data.data || [])
        setTotalPages(res.data.pagination?.total_pages || 1)
        setTotalCount(res.data.pagination?.total ?? res.data.pagination?.total_items ?? 0)
        setPage(pageNum)
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'An error occurred while loading dictionary entries.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleSearch(initialQuery, 1)
  }, [initialQuery])

  // Global Keyboard Shortcuts (ESC to close modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedEntry(null)
        setIsCanvasModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const onSubmit = (e) => {
    if (e) e.preventDefault()
    setSearchParams(query ? { q: query } : {})
    handleSearch(query, 1)
  }

  // Handle selecting an IME recommendation candidate
  const handleSelectImeCandidate = (candidateChar) => {
    setQuery(candidateChar)
    setSearchParams({ q: candidateChar })
    searchInputRef.current?.focus()
  }

  // Shuffle random vocabulary when browsing (always stays on page 1)
  const handleShuffle = () => {
    handleSearch('', 1)
  }

  // Open Spotlight Modal
  const handleOpenDetail = async (entry) => {
    setSelectedEntry(entry)
    setModalQuery(entry.simplified)
    setModalTab('translation')
    setDetailSaveMsg('')
    try {
      const res = await dictionaryService.getDetail(entry.id)
      if (res.data?.status === 'success' && res.data?.data) {
        setSelectedEntry(res.data.data)
      }
    } catch (err) {
      console.warn('Using entry from search results list:', err?.message)
    }
  }

  // Execute search from Spotlight Modal input
  const handleModalSearchSubmit = (searchTerm) => {
    const term = (searchTerm !== undefined ? searchTerm : modalQuery).trim()
    if (term) {
      setQuery(term)
      setSearchParams({ q: term })
      setSelectedEntry(null)
      handleSearch(term, 1)
    } else {
      setQuery('')
      setSearchParams({})
      setSelectedEntry(null)
      handleSearch('', 1)
    }
  }

  // Save Character to Profile Notebook
  const handleSave = async (entryId, fromModal = false, e = null) => {
    if (e) e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    try {
      await savedCharacterService.saveCharacter(entryId, 'kamus')
      const successText = 'Saved to your notebook!'
      if (fromModal) {
        setDetailSaveMsg(successText)
        setTimeout(() => setDetailSaveMsg(''), 3000)
      } else {
        setSaveMsg(successText)
        setTimeout(() => setSaveMsg(''), 3000)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Character already saved in notebook.'
      if (fromModal) {
        setDetailSaveMsg(msg)
        setTimeout(() => setDetailSaveMsg(''), 3000)
      } else {
        setSaveMsg(msg)
        setTimeout(() => setSaveMsg(''), 3000)
      }
    }
  }

  // ==========================================
  // HANDWRITING CANVAS METHODS
  // ==========================================
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#292723'
    ctx.lineWidth = lineWidth
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    canvasHistoryRef.current = [canvas.toDataURL()]
    setHasDrawn(false)
    setCanvasError('')
  }, [lineWidth])

  useEffect(() => {
    if (isCanvasModalOpen) {
      const timer = setTimeout(initCanvas, 80)
      return () => clearTimeout(timer)
    }
  }, [isCanvasModalOpen, initCanvas])

  const saveCanvasStep = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (canvasHistoryRef.current.length > 20) canvasHistoryRef.current.shift()
    canvasHistoryRef.current.push(canvas.toDataURL())
  }

  const startCanvasDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = ((clientX - rect.left) / rect.width) * canvas.width
    const y = ((clientY - rect.top) / rect.height) * canvas.height

    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setHasDrawn(true)
  }

  const drawOnCanvas = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = ((clientX - rect.left) / rect.width) * canvas.width
    const y = ((clientY - rect.top) / rect.height) * canvas.height

    const ctx = canvas.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopCanvasDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    saveCanvasStep()
  }

  const clearModalCanvas = () => {
    initCanvas()
  }

  const undoModalCanvas = () => {
    if (canvasHistoryRef.current.length <= 1) {
      initCanvas()
      return
    }
    canvasHistoryRef.current.pop()
    const previousState = canvasHistoryRef.current[canvasHistoryRef.current.length - 1]
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = previousState
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
    }
  }

  // Submit handwriting image to AI recognition and populate search
  const handleRecognizeAndSearch = async () => {
    if (!hasDrawn) {
      setCanvasError('Please draw a Chinese character on the canvas first.')
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return

    setCanvasLoading(true)
    setCanvasError('')
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      const formData = new FormData()
      formData.append('image', blob, 'handwriting.png')

      const res = await handwritingService.recognize(formData)
      if (res.data?.status === 'success' && res.data.data?.character) {
        const recognized = res.data.data.character
        setQuery(recognized)
        setSearchParams({ q: recognized })
        setIsCanvasModalOpen(false)
        handleSearch(recognized, 1)
      } else {
        setCanvasError(res.data?.message || 'Could not recognize character. Please try drawing more clearly.')
      }
    } catch (err) {
      setCanvasError(
        err.response?.data?.message || 'Recognition error. Please check backend connection.'
      )
    } finally {
      setCanvasLoading(false)
    }
  }

  // Quick sample insert into canvas
  const handleApplySampleToCanvas = (sampleChar) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#292723'
    ctx.font = 'bold 220px "KaiTi", "STKaiti", "BiauKai", "SimSun", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(sampleChar, canvas.width / 2, canvas.height / 2 + 10)
    canvasHistoryRef.current = []
    saveCanvasStep()
    setHasDrawn(true)
    setCanvasError('')
  }

  // Get conversational example sentence for modal entry
  const modalExample = useMemo(() => {
    if (!selectedEntry?.simplified) return null
    return getWordExample({
      simplified: selectedEntry.simplified,
      meanings: Array.isArray(selectedEntry.meanings) ? selectedEntry.meanings : [],
    })
  }, [selectedEntry])

  // Extract primary English translation
  const primaryMeaning = useMemo(() => {
    if (!selectedEntry?.meanings?.length) return 'Definition'
    const first = selectedEntry.meanings[0]
    return first.split(';')[0].trim()
  }, [selectedEntry])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F5EFE4] -mt-20 sm:-mt-24 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* ============================================================== */}
      {/* 1. ATMOSPHERIC FIT BACKGROUND WITH SOFT BLUR & AMBIENT CHARS */}
      {/* ============================================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden select-none">
        {/* Background Image: Fit cover in front of #F5EFE4 with soft blur */}
        <img
          src={dictionaryBg3}
          alt="Dictionary Ambient Scholar Background"
          className="h-full w-full object-cover object-center scale-105 blur-[2.5px] opacity-80"
        />
        {/* Soft frosted parchment wash for seamless contrast & scholar tone */}
        <div className="absolute inset-0 bg-[#F5EFE4]/25" />

        {/* Subtle Concentric Scholar Ink Ripples */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full border border-cinnabar/[0.04]" />
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 size-[950px] rounded-full border border-charcoal/[0.03]" />

        {/* Floating Ambient Chinese Characters */}
        {FLOATING_CHARACTERS.map((item, idx) => (
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
              opacity: [0.012, 0.028, 0.012],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
            className="pointer-events-none absolute hidden lg:flex flex-col items-center font-serif text-charcoal/25 select-none"
          >
            <span className={`${item.size} drop-shadow-2xs`}>{item.char}</span>
            <span className="text-[10px] font-mono tracking-widest text-charcoal/20 uppercase -mt-1">
              {item.pinyin}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* ============================================================== */}
        {/* 2. HEADER: AUTHENTIC SEAL BADGE & TYPOGRAPHY */}
        {/* ============================================================== */}
        <div className="mb-7 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-cinnabar/20 bg-white/75 px-3 py-1 backdrop-blur-md shadow-2xs"
          >
            <span className="flex items-center justify-center rounded-[3px] bg-cinnabar px-1.5 py-0.5 text-[9px] font-serif font-bold text-white tracking-wider shadow-2xs">
              典
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-charcoal/80 uppercase">
              CC-CEDICT SCHOLAR CORPUS
            </span>
            <span className="size-1 rounded-full bg-cinnabar/60" />
            <span className="text-[10px] font-mono font-medium text-cinnabar">
              120,000+ ENTRIES
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-2.5 font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-charcoal leading-tight"
          >
            Scholar <span className="italic font-serif text-cinnabar">Lexicon</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-2 text-xs sm:text-sm text-charcoal/70 leading-relaxed font-normal"
          >
            Explore Chinese characters, Pinyin tones, and definitions across English, Hanzi, and Pinyin.
          </motion.p>
        </div>

        {/* ============================================================== */}
        {/* 3. DISTINCTIVE SCHOLAR SEARCH BAR WITH DRAW TOOL & CHINESE IME */}
        {/* ============================================================== */}
        <div className="mx-auto max-w-2xl mb-8">
          <form onSubmit={onSubmit} className="relative">
            <div className="group flex items-center rounded-full border-2 border-[#D8CEBF] bg-white/90 p-1.5 pl-4 sm:pl-5 pr-1.5 shadow-[0_10px_30px_rgba(41,39,35,0.06)] backdrop-blur-xl transition-all duration-300 focus-within:border-cinnabar focus-within:ring-4 focus-within:ring-cinnabar/10 hover:border-cinnabar/40">
              {/* Distinctive Search Icon */}
              <div className="text-charcoal/45 group-focus-within:text-cinnabar transition-colors mr-2 shrink-0">
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Input */}
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search English (hello, water), Hanzi (你好), or Pinyin (ni hao)..."
                className="w-full min-w-0 flex-1 bg-transparent px-1 py-2.5 text-xs sm:text-sm text-charcoal outline-none placeholder:text-charcoal/40 font-medium caret-cinnabar"
              />

              {/* Clear Button */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setSearchParams({})
                    handleSearch('', 1)
                  }}
                  className="p-1.5 text-charcoal/40 hover:text-charcoal transition-colors cursor-pointer mr-1.5 shrink-0"
                  title="Clear search"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Distinctive Canvas / Handwriting Draw Tool Button */}
              <button
                type="button"
                onClick={() => setIsCanvasModalOpen(true)}
                className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-[#FAF6F0] hover:bg-cinnabar/10 text-charcoal/75 hover:text-cinnabar transition-all cursor-pointer border border-[#E0D7C9] hover:border-cinnabar/30 shadow-2xs mr-1.5 active:scale-95 shrink-0 group/draw"
                title="Draw Chinese Character on Canvas"
                aria-label="Draw Chinese Character on Canvas"
              >
                <svg className="size-4 text-charcoal/60 group-hover/draw:text-cinnabar transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>

              {/* Search Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-full bg-gradient-to-r from-cinnabar via-[#a83025] to-[#87231a] px-4 sm:px-7 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_4px_14px_rgba(168,50,40,0.28)] hover:shadow-[0_6px_20px_rgba(168,50,40,0.4)] transition-all cursor-pointer shrink-0"
              >
                Search
              </motion.button>
            </div>
          </form>

          {/* CHINESE KEYBOARD (IME) RECOMMENDATION CANDIDATE BAR */}
          <AnimatePresence>
            {imeCandidates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-2.5 rounded-xl border border-[#DCD2C3] bg-white/95 p-2 shadow-xs backdrop-blur-md"
              >
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                  <span className="inline-flex items-center gap-1 rounded bg-cinnabar/10 px-2 py-0.5 text-[10px] font-bold text-cinnabar tracking-wider uppercase shrink-0">
                    <span>拼</span>
                    <span className="font-mono text-[9px]">IME</span>
                  </span>

                  <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
                    {imeCandidates.map((cand, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectImeCandidate(cand)}
                        className="group inline-flex items-center gap-1 rounded-lg border border-[#E7DFD3] bg-cream/40 hover:border-cinnabar hover:bg-cinnabar/10 px-2.5 py-1 text-xs transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
                        title={`Select "${cand}" & search`}
                      >
                        <span className="font-mono text-[10px] text-charcoal/45 font-bold">
                          {idx + 1}.
                        </span>
                        <span className="font-serif text-sm font-bold text-cinnabar group-hover:scale-110 transition-transform">
                          {cand}
                        </span>
                      </button>
                    ))}
                  </div>

                  <span className="hidden sm:inline-block text-[10px] font-mono text-charcoal/45 shrink-0 pl-1">
                    Select a candidate to search
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications & Error Alerts */}
        <AnimatePresence>
          {saveMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mx-auto mb-6 max-w-md rounded-xl border border-emerald-500/25 bg-emerald-50/90 p-3 text-center text-xs font-semibold text-emerald-800 shadow-2xs backdrop-blur-xs"
            >
              {saveMsg}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mx-auto mb-6 max-w-2xl rounded-xl border border-cinnabar/30 bg-cinnabar/5 p-3.5 text-xs text-cinnabar shadow-2xs"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between border-b border-[#E7DFD3] pb-3 text-xs text-charcoal/65 font-mono">
          <div className="flex items-center gap-2.5">
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-cinnabar animate-ping" />
                <span>Searching corpus...</span>
              </span>
            ) : query.trim() ? (
              <span>
                Found <strong className="text-charcoal font-semibold">{totalCount}</strong> matching entries for "{query}"
              </span>
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-charcoal/80">Random Vocabulary</span>
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-[#DCD2C3] bg-white/90 hover:bg-cream hover:border-cinnabar px-2.5 py-1 text-[11px] font-sans font-medium text-charcoal/75 hover:text-cinnabar transition-all shadow-2xs cursor-pointer active:scale-95"
                  title="Shuffle random vocabulary"
                  aria-label="Shuffle random vocabulary"
                >
                  <svg
                    className="size-3.5 text-charcoal/60 group-hover:text-cinnabar transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 3 21 3 21 8" />
                    <line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" />
                    <line x1="15" y1="15" x2="21" y2="21" />
                    <line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                  <span>Shuffle</span>
                </button>
              </div>
            )}
          </div>
          <span>
            Page {page} of {totalPages}
          </span>
        </div>

        {/* ============================================================== */}
        {/* 4. SCHOLAR LEXICON RESULTS GRID */}
        {/* ============================================================== */}
        <div className="mt-6">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <div className="size-8 animate-spin rounded-full border-2 border-cinnabar border-t-transparent" />
              <p className="text-xs text-charcoal/50 font-serif">Leafing through the classical lexicon...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4.5">
              {results.map((entry) => (
                <motion.div
                  key={entry.id}
                  whileHover={{ y: -3, scale: 1.005 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#E7DFD3] bg-white/85 p-4 sm:p-4.5 shadow-xs backdrop-blur-md hover:border-cinnabar/40 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Character Showcase Box (Consistent dimensions, strictly bounded) */}
                    {(() => {
                      const len = entry.simplified?.length || 1
                      const fontSize =
                        len === 1
                          ? 'text-3xl sm:text-4xl'
                          : len === 2
                          ? 'text-2xl sm:text-3xl'
                          : len === 3
                          ? 'text-xl sm:text-2xl'
                          : len === 4
                          ? 'text-base sm:text-lg'
                          : len <= 6
                          ? 'text-xs sm:text-sm'
                          : 'text-[11px] sm:text-xs leading-snug'

                      const isLong = len > 4

                      return (
                        <div
                          onClick={() => handleOpenDetail(entry)}
                          className="relative flex h-20 sm:h-22 w-24 sm:w-26 shrink-0 items-center justify-center rounded-xl border border-[#D8CEBF] bg-[#FAF8F5] cursor-pointer shadow-inner group-hover:border-cinnabar/50 transition-all p-1.5 overflow-hidden"
                          title="Click to view details"
                        >
                          {/* Corner Registration Brackets */}
                          <div className="pointer-events-none absolute inset-0">
                            <svg className="size-full" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
                              <path
                                d="M 6 14 L 6 6 L 14 6 M 86 6 L 94 6 L 94 14 M 6 86 L 6 94 L 14 94 M 86 94 L 94 94 L 94 86"
                                stroke="#9E2A2B"
                                strokeWidth="1.5"
                                strokeOpacity="0.25"
                              />
                            </svg>
                          </div>

                          <span
                            className={`font-serif ${fontSize} text-charcoal group-hover:text-cinnabar transition-colors select-none ${
                              isLong
                                ? 'line-clamp-3 text-center break-words max-w-full'
                                : 'whitespace-nowrap leading-none'
                            }`}
                          >
                            {entry.simplified}
                          </span>
                        </div>
                      )
                    })()}

                    {/* Character Metadata & Pronunciation (Consistent 3-line layout) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 overflow-hidden">
                      {/* Line 1: Audio Button + Pinyin Display */}
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => handlePlayAudio(entry.simplified, e)}
                          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cream/70 hover:bg-cinnabar text-charcoal/70 hover:text-white transition-colors cursor-pointer border border-[#E7DFD3] shadow-2xs"
                          title="Listen pronunciation"
                          aria-label={`Listen pronunciation of ${entry.simplified}`}
                        >
                          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                          </svg>
                        </button>

                        <span className="font-heading text-base sm:text-lg font-bold text-cinnabar tracking-wide truncate min-w-0">
                          {entry.pinyin_display}
                        </span>
                      </div>

                      {/* Line 2: Numbered Pinyin & HSK Badge */}
                      <div className="mt-1 flex items-center justify-between gap-1 text-[10px] font-mono text-charcoal/50 min-w-0">
                        <span className="truncate min-w-0 flex-1">
                          ({entry.pinyin_numbered})
                        </span>

                        {entry.hsk_level && (
                          <span className="shrink-0 rounded-full bg-cinnabar/10 border border-cinnabar/20 px-2 py-0.5 text-[9px] font-bold text-cinnabar font-sans">
                            HSK {entry.hsk_level}
                          </span>
                        )}
                      </div>

                      {/* Line 3: Single-line English Definition (Filtered of Hanzi & CL codes) */}
                      <div className="mt-1 text-xs text-charcoal/80 min-w-0">
                        {(() => {
                          const displayMeaning = getCleanCardMeaning(entry.meanings)
                          return (
                            <div className="flex items-center gap-1.5 truncate min-w-0" title={displayMeaning}>
                              <span className="size-1 shrink-0 rounded-full bg-cinnabar/75" />
                              <span className="truncate min-w-0">{displayMeaning}</span>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="mt-3.5 flex items-center justify-between border-t border-[#E7DFD3]/80 pt-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(entry)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-cinnabar hover:text-[#84271f] transition-colors cursor-pointer"
                    >
                      <span>View Details</span>
                      <span>→</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Practice Writing Link */}
                      <Link
                        to={`/handwriting?char=${encodeURIComponent(entry.simplified)}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E7DFD3] bg-white hover:bg-cream/60 px-2.5 py-1 text-[11px] text-charcoal/75 transition-colors cursor-pointer shadow-2xs"
                        title="Practice writing this character"
                      >
                        <svg className="size-3 text-charcoal/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Canvas</span>
                      </Link>

                      {/* Save to Notebook */}
                      {isAuthenticated ? (
                        <button
                          type="button"
                          onClick={(e) => handleSave(entry.id, false, e)}
                          className="rounded-lg border border-cinnabar/30 bg-cinnabar/5 hover:bg-cinnabar hover:text-white px-2.5 py-1 text-[11px] font-semibold text-cinnabar transition-colors cursor-pointer shadow-2xs"
                          title="Save to notebook"
                        >
                          + Save
                        </button>
                      ) : (
                        <Link
                          to="/login"
                          className="text-[11px] text-charcoal/50 hover:text-cinnabar transition-colors"
                        >
                          Sign in to save
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[#D8CEBF] bg-[#FAF8F5] text-charcoal/20 font-serif text-3xl">
                字
              </div>
              <h3 className="mt-4 font-heading text-lg font-medium text-charcoal">
                No matching entries found
              </h3>
              <p className="mt-1 text-xs text-charcoal/60 max-w-sm mx-auto">
                Try searching for simple English words like "water", "hello", or Pinyin like "ni hao".
              </p>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 5. ELEGANT SCHOLAR PAGINATION */}
        {/* ============================================================== */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => handleSearch(query, page - 1)}
              className="rounded-xl border border-[#DCD2C3] bg-white px-4 py-2 text-xs font-semibold text-charcoal shadow-2xs hover:bg-cream disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 cursor-pointer"
            >
              ← Previous
            </button>

            <span className="rounded-xl border border-[#E7DFD3] bg-white/70 px-4 py-2 text-xs font-mono text-charcoal/70 shadow-2xs">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => handleSearch(query, page + 1)}
              className="rounded-xl border border-[#DCD2C3] bg-white px-4 py-2 text-xs font-semibold text-charcoal shadow-2xs hover:bg-cream disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 6. HANDWRITING CANVAS SEARCH MODAL (TRANSPARENT GLOSSY GLASS) */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isCanvasModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setIsCanvasModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative w-full max-w-md rounded-3xl border border-white/80 bg-white/85 text-charcoal p-5 sm:p-6 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#E7DFD3]/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-cinnabar/10 text-cinnabar shadow-2xs">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-charcoal leading-tight">
                      Handwriting Search
                    </h3>
                    <p className="text-[10px] text-charcoal/60 font-mono">
                      AI Recognition · Draw character to search
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCanvasModalOpen(false)}
                  className="size-8 flex items-center justify-center rounded-xl text-charcoal/50 hover:text-charcoal hover:bg-cream transition-colors cursor-pointer border border-transparent hover:border-[#E7DFD3]"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>

              {/* Error Message */}
              {canvasError && (
                <div className="mt-3 rounded-xl border border-cinnabar/30 bg-cinnabar/10 p-2.5 text-xs text-cinnabar">
                  {canvasError}
                </div>
              )}

              {/* Tian Zi Ge Interactive Drawing Canvas */}
              <div className="mt-4 relative mx-auto aspect-square w-full max-w-[280px] rounded-2xl border-2 border-[#D8CEBF] bg-white shadow-inner overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  onMouseDown={startCanvasDrawing}
                  onMouseMove={drawOnCanvas}
                  onMouseUp={stopCanvasDrawing}
                  onMouseLeave={stopCanvasDrawing}
                  onTouchStart={startCanvasDrawing}
                  onTouchMove={drawOnCanvas}
                  onTouchEnd={stopCanvasDrawing}
                  className="touch-none cursor-crosshair w-full h-full block"
                />

                {/* Classical Practice Grid Overlay */}
                <svg
                  className="pointer-events-none absolute inset-0 size-full select-none"
                  viewBox="0 0 300 300"
                  preserveAspectRatio="none"
                >
                  {/* Corner Brackets */}
                  <g stroke="#9E2A2B" strokeWidth="1.5" strokeOpacity="0.2" fill="none">
                    <path d="M 10 22 L 10 10 L 22 10" />
                    <path d="M 278 10 L 290 10 L 290 22" />
                    <path d="M 10 278 L 10 290 L 22 290" />
                    <path d="M 278 290 L 290 290 L 290 278" />
                  </g>
                  {/* Crosshairs & Diagonals */}
                  <g stroke="#9E2A2B" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.16" fill="none">
                    <line x1="0" y1="150" x2="300" y2="150" />
                    <line x1="150" y1="0" x2="150" y2="300" />
                    <line x1="0" y1="0" x2="300" y2="300" strokeOpacity="0.1" />
                    <line x1="300" y1="0" x2="0" y2="300" strokeOpacity="0.1" />
                  </g>
                </svg>
              </div>

              {/* Canvas Controls */}
              <div className="mt-3.5 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={undoModalCanvas}
                    className="rounded-xl border border-[#E7DFD3] bg-white/90 px-3 py-1 text-xs font-medium text-charcoal/75 hover:bg-cream active:scale-95 transition-all cursor-pointer shadow-2xs"
                  >
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={clearModalCanvas}
                    className="rounded-xl border border-[#E7DFD3] bg-white/90 px-3 py-1 text-xs font-medium text-charcoal/75 hover:bg-cream active:scale-95 transition-all cursor-pointer shadow-2xs"
                  >
                    Clear
                  </button>
                </div>

                {/* Line Width */}
                <div className="flex items-center rounded-xl border border-[#E7DFD3] bg-white/90 p-0.5 shadow-2xs">
                  {[
                    { label: 'Fine', size: 10 },
                    { label: 'Mid', size: 14 },
                    { label: 'Bold', size: 20 },
                  ].map((item) => (
                    <button
                      key={item.size}
                      type="button"
                      onClick={() => setLineWidth(item.size)}
                      className={`rounded-lg px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                        lineWidth === item.size
                          ? 'bg-cinnabar text-white font-semibold shadow-2xs'
                          : 'text-charcoal/60 hover:text-charcoal'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Sample Characters */}
              <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] text-charcoal/50 shrink-0 font-medium">Samples:</span>
                {['你', '好', '他', '学', '水', '爱', '福', '道'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => handleApplySampleToCanvas(sample)}
                    className="font-serif text-sm font-bold text-cinnabar rounded-lg bg-white/90 border border-[#E7DFD3] hover:border-cinnabar px-2.5 py-0.5 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                    title={`Insert sample character ${sample}`}
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {/* Submit Recognition Action */}
              <motion.button
                type="button"
                disabled={canvasLoading || !hasDrawn}
                onClick={handleRecognizeAndSearch}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cinnabar via-[#a83025] to-[#87231a] py-2.5 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {canvasLoading ? (
                  <>
                    <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Recognizing Character...</span>
                  </>
                ) : (
                  <>
                    <span>Recognize & Search</span>
                    <span>→</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 7. SPOTLIGHT LEXICON MODAL (TRANSPARENT GLOSSY FROSTED GLASS) */}
      {/* ============================================================== */}
      <AnimatePresence>
        {selectedEntry && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/80 bg-white/85 text-charcoal p-5 sm:p-6 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Search & Actions Bar Inside Modal */}
              <div className="flex items-center justify-between gap-3 border-b border-[#E7DFD3]/80 pb-3.5">
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2 rounded-xl bg-white/80 border border-[#DCD2C3] px-3 py-1.5 flex-1 shadow-2xs focus-within:border-cinnabar transition-all">
                    <svg className="size-4 text-charcoal/45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={modalQuery}
                      onChange={(e) => setModalQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleModalSearchSubmit(modalQuery)
                        }
                      }}
                      className="w-full bg-transparent text-xs text-charcoal outline-none placeholder:text-charcoal/40 font-medium"
                      placeholder="Search vocabulary..."
                    />
                    {modalQuery && (
                      <button
                        type="button"
                        onClick={() => setModalQuery('')}
                        className="text-charcoal/40 hover:text-charcoal text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Practice Canvas Shortcut Icon */}
                  <Link
                    to={`/handwriting?char=${encodeURIComponent(selectedEntry.simplified)}`}
                    onClick={() => setSelectedEntry(null)}
                    className="flex size-8.5 items-center justify-center rounded-xl bg-white/80 border border-[#E7DFD3] text-charcoal/70 hover:text-white hover:bg-cinnabar hover:border-cinnabar transition-colors shadow-2xs"
                    title="Practice in Handwriting Canvas"
                  >
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Link>

                  {/* Close Modal Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedEntry(null)}
                    className="flex size-8.5 items-center justify-center rounded-xl bg-white/80 border border-[#E7DFD3] text-charcoal/50 hover:text-charcoal hover:bg-cream transition-colors cursor-pointer shadow-2xs"
                    title="Close (Esc)"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Segmented Tabs: Translation vs Character Details */}
              <div className="mt-3.5 flex gap-1.5 p-1 rounded-xl bg-black/[0.04] border border-[#E7DFD3]/70">
                <button
                  type="button"
                  onClick={() => setModalTab('translation')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    modalTab === 'translation'
                      ? 'bg-white text-cinnabar shadow-2xs font-bold'
                      : 'text-charcoal/60 hover:text-charcoal'
                  }`}
                >
                  Translation
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('definition')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    modalTab === 'definition'
                      ? 'bg-white text-cinnabar shadow-2xs font-bold'
                      : 'text-charcoal/60 hover:text-charcoal'
                  }`}
                >
                  Character Details
                </button>
              </div>

              {/* Tab 1: Translation */}
              {modalTab === 'translation' ? (
                <div className="mt-4 space-y-3.5">
                  {/* Your Search Section */}
                  <div className="rounded-2xl bg-white/70 border border-[#E7DFD3]/90 p-3.5 shadow-2xs">
                    <p className="text-[11px] font-semibold text-charcoal/50 uppercase tracking-wider">Your Search:</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-serif text-3xl sm:text-4xl text-charcoal tracking-wide">
                        {selectedEntry.simplified}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handlePlayAudio(selectedEntry.simplified, e)}
                        className="flex size-8 items-center justify-center rounded-full bg-cream/80 hover:bg-cinnabar text-charcoal/70 hover:text-white transition-colors cursor-pointer border border-[#E7DFD3] shadow-2xs"
                        title="Listen audio"
                      >
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Primary Translation */}
                  <div className="rounded-2xl bg-white/70 border border-[#E7DFD3]/90 p-3.5 shadow-2xs">
                    <p className="text-[11px] font-semibold text-charcoal/50 uppercase tracking-wider">Translation:</p>
                    <p className="mt-1 text-sm font-semibold text-charcoal leading-relaxed">
                      {primaryMeaning}
                    </p>
                  </div>

                  {/* Detailed Definitions */}
                  <div className="rounded-2xl bg-white/70 border border-[#E7DFD3]/90 p-3.5 shadow-2xs">
                    <p className="text-[11px] font-semibold text-charcoal/50 uppercase tracking-wider">Definitions:</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-serif text-2xl text-charcoal">
                        {selectedEntry.simplified}
                      </span>
                      <span className="text-sm font-bold text-cinnabar">
                        {selectedEntry.pinyin_display}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handlePlayAudio(selectedEntry.simplified, e)}
                        className="text-charcoal/45 hover:text-cinnabar cursor-pointer transition-colors"
                        title="Listen"
                      >
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                        </svg>
                      </button>
                    </div>

                    {/* Definitions (Horizontal side-by-side layout without boxes) */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-charcoal/85">
                      {Array.isArray(selectedEntry.meanings) && selectedEntry.meanings.length > 0 ? (
                        selectedEntry.meanings.map((meaning, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5"
                          >
                            <span className="size-1 rounded-full bg-cinnabar/80 shrink-0" />
                            <span>{meaning}</span>
                          </span>
                        ))
                      ) : (
                        <span className="italic text-xs text-charcoal/40">No listed definitions available.</span>
                      )}
                    </div>
                  </div>

                  {/* Daily Conversational Example Sentence */}
                  {modalExample && (
                    <div className="rounded-2xl bg-cinnabar/[0.04] border border-cinnabar/25 p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-cinnabar uppercase tracking-wider">
                          例句 · DAILY USAGE
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handlePlayAudio(modalExample.chinese, e)}
                          className="text-charcoal/60 hover:text-cinnabar text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                          </svg>
                          <span>Listen</span>
                        </button>
                      </div>
                      <p className="font-serif text-sm font-semibold text-charcoal">
                        {modalExample.chinese}
                      </p>
                      <p className="text-[11px] text-cinnabar/80 font-mono mt-0.5">
                        {modalExample.pinyin}
                      </p>
                      <p className="text-[11px] text-charcoal/75 mt-0.5 leading-relaxed">
                        "{modalExample.translation}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Tab 2: Character Details & Structural Breakdown */
                <div className="mt-4 space-y-3.5">
                  {/* Large Character Showcase Tile (Adaptive horizontal layout for multi-character words) */}
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-white/70 border border-[#E7DFD3]/90 p-5 shadow-2xs">
                    {(() => {
                      const len = selectedEntry.simplified?.length || 1
                      const fontSize =
                        len === 1
                          ? 'text-5xl sm:text-6xl'
                          : len === 2
                          ? 'text-4xl sm:text-5xl'
                          : len === 3
                          ? 'text-3xl sm:text-4xl'
                          : len === 4
                          ? 'text-2xl sm:text-3xl'
                          : 'text-xl sm:text-2xl'

                      return (
                        <div className="relative flex h-24 sm:h-28 min-w-[120px] max-w-full px-6 items-center justify-center rounded-2xl border-2 border-[#D8CEBF] bg-[#FAF8F5] shadow-inner overflow-hidden">
                          {/* Corner Registration Brackets */}
                          <div className="pointer-events-none absolute inset-0">
                            <svg className="size-full" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
                              <path
                                d="M 6 14 L 6 6 L 14 6 M 86 6 L 94 6 L 94 14 M 6 86 L 6 94 L 14 94 M 86 94 L 94 94 L 94 86"
                                stroke="#9E2A2B"
                                strokeWidth="1.5"
                                strokeOpacity="0.25"
                              />
                            </svg>
                          </div>

                          <span className={`font-serif ${fontSize} text-cinnabar select-none whitespace-nowrap leading-none tracking-wider`}>
                            {selectedEntry.simplified}
                          </span>
                        </div>
                      )
                    })()}

                    <div className="mt-3 text-center">
                      <span className="text-xl sm:text-2xl font-bold text-charcoal font-heading">
                        {selectedEntry.pinyin_display}
                      </span>
                    </div>
                  </div>

                  {/* Character Metadata Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-2xl bg-white/70 border border-[#E7DFD3]/90 p-3 shadow-2xs">
                      <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-wider">
                        Simplified Hanzi
                      </span>
                      <p className="mt-1 font-serif text-2xl text-charcoal">{selectedEntry.simplified}</p>
                    </div>
                    <div className="rounded-2xl bg-white/70 border border-[#E7DFD3]/90 p-3 shadow-2xs">
                      <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-wider">
                        Traditional Variant
                      </span>
                      <p className="mt-1 font-serif text-2xl text-charcoal">
                        {selectedEntry.traditional || selectedEntry.simplified}
                      </p>
                    </div>
                  </div>

                  {selectedEntry.hsk_level && (
                    <div className="flex items-center justify-between rounded-2xl bg-white/70 border border-[#E7DFD3]/90 p-3 text-xs shadow-2xs">
                      <span className="text-charcoal/70 font-medium">HSK Proficiency</span>
                      <span className="rounded-full bg-cinnabar/10 border border-cinnabar/30 px-2.5 py-0.5 text-xs font-bold text-cinnabar">
                        Level {selectedEntry.hsk_level}
                      </span>
                    </div>
                  )}

                  {/* Direct Practice Link */}
                  <Link
                    to={`/handwriting?char=${encodeURIComponent(selectedEntry.simplified)}`}
                    onClick={() => setSelectedEntry(null)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cinnabar via-[#a83025] to-[#87231a] py-3 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span>Practice Writing on Canvas</span>
                    <span>→</span>
                  </Link>
                </div>
              )}

              {detailSaveMsg && (
                <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-500/30 p-2.5 text-center text-xs font-semibold text-emerald-800">
                  {detailSaveMsg}
                </div>
              )}

              {/* Modal Footer with Actions */}
              <div className="mt-4 flex items-center justify-between border-t border-[#E7DFD3]/80 pt-3 text-[11px] text-charcoal/60">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-charcoal/50">
                    Press Enter to search · Esc to close
                  </span>
                </div>

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={(e) => handleSave(selectedEntry.id, true, e)}
                    className="text-cinnabar hover:text-[#84271f] font-semibold transition-colors cursor-pointer"
                  >
                    + Save to Notebook
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setSelectedEntry(null)}
                    className="text-charcoal/60 hover:text-cinnabar transition-colors"
                  >
                    Sign in to save
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
