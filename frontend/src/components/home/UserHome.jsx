import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../../context/AuthContext'
import {
  dailyWordService,
  savedCharacterService,
  statisticsService,
  flashcardService,
} from '../../services/api'
import WordDetailModal from './WordDetailModal'
import { getWordExample } from '../../utils/exampleSentences'
import userHeroLandscape from '../../assets/user-hero-landscape.jpg'
import homeKoi from '../../assets/home-koi.png'
import hanzipathLogo from '../../assets/hanzipath-logo.png'

// Ambient Floating Calligraphy Tiles
const FLOATING_BG_CHARS = [
  { char: '学', pinyin: 'xué', top: '7%', left: '2%', duration: 11, delay: 0 },
  { char: '知', pinyin: 'zhī', top: '16%', right: '2%', duration: 10, delay: 0.6 },
  { char: '行', pinyin: 'xíng', top: '62%', left: '1.5%', duration: 10.5, delay: 1.2 },
  { char: '志', pinyin: 'zhì', top: '78%', right: '2.5%', duration: 9.5, delay: 0.4 },
]

// Curated Inspirational HanziPath Proverbs (Clickable to Rotate)
const HERO_QUOTES = [
  { hanzi: '鱼跃龙门', pinyin: 'yú yuè lóng mén', en: 'Persevere to leap over the Dragon Gate' },
  { hanzi: '学海无涯', pinyin: 'xué hǎi wú yá', en: 'Never stop learning' },
  { hanzi: '温故知新', pinyin: 'wēn gù zhī xīn', en: 'Review the past, understand the new' },
  { hanzi: '循序渐进', pinyin: 'xún xù jiàn jìn', en: 'Step by step, progress follows' },
  { hanzi: '熟能生巧', pinyin: 'shú néng shēng qiǎo', en: 'Practice makes perfect' },
]

// Fallback Daily Words (5 Curated Items)
const FALLBACK_DAILY_WORDS = [
  {
    id: 101,
    level: 1,
    urutan: 1,
    simplified: '学习',
    traditional: '學習',
    pinyin_display: 'xué xí',
    pinyin_numbered: 'xue2 xi2',
    meanings: ['Belajar', 'to learn', 'to study'],
  },
  {
    id: 102,
    level: 1,
    urutan: 2,
    simplified: '朋友',
    traditional: '朋友',
    pinyin_display: 'péng you',
    pinyin_numbered: 'peng2 you5',
    meanings: ['Teman', 'friend'],
  },
  {
    id: 103,
    level: 1,
    urutan: 3,
    simplified: '学校',
    traditional: '學校',
    pinyin_display: 'xué xiào',
    pinyin_numbered: 'xue2 xiao4',
    meanings: ['Sekolah', 'school'],
  },
  {
    id: 104,
    level: 1,
    urutan: 4,
    simplified: '老师',
    traditional: '老師',
    pinyin_display: 'lǎo shī',
    pinyin_numbered: 'lao3 shi1',
    meanings: ['Guru', 'teacher'],
  },
  {
    id: 105,
    level: 1,
    urutan: 5,
    simplified: '中国',
    traditional: '中國',
    pinyin_display: 'zhōng guó',
    pinyin_numbered: 'zhong1 guo2',
    meanings: ['Tiongkok', 'China'],
  },
]

// HSK Levels Hanzi Motifs
const HSK_LEVEL_MOTIFS = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
}

// 3 Core Platform Features for the Tab Component
const FEATURE_TABS = [
  {
    id: 'handwriting',
    label: 'Handwriting',
    category: 'CANVAS',
    title: 'Interactive Stroke Practice',
    desc: 'Practice character stroke sequences on traditional Tian Zi Ge grids with real-time direction guidance and instant precision scoring.',
    highlights: ['Stroke Order Detection', 'Accuracy Scoring'],
    previewChar: '永',
    previewPinyin: 'yǒng',
    path: '/handwriting',
    ctaText: 'Start Writing',
  },
  {
    id: 'dictionary',
    label: 'Dictionary',
    category: 'LEXICON',
    title: 'Comprehensive Dictionary',
    desc: 'Search over 120,000 entries with radical breakdowns, tone marks, etymology, and authentic native voice pronunciation.',
    highlights: ['Multi-Modal Search', 'Native Audio'],
    previewChar: '明',
    previewPinyin: 'míng',
    path: '/dictionary',
    ctaText: 'Search Dictionary',
  },
  {
    id: 'flashcards',
    label: 'HSK Flashcards',
    category: 'SPACED SRS',
    title: 'Adaptive SRS Flashcards',
    desc: 'Master HSK 1 to 6 vocabulary through Leitner spaced repetition scheduled precisely before recall fades from memory.',
    highlights: ['HSK 1–6 Standard', 'Active Recall Drills'],
    previewChar: '学',
    previewPinyin: 'xué',
    path: '/flashcards',
    ctaText: 'Review Flashcards',
  },
]

// =========================================================================
// FEATURE SHOWCASE STAGES (Full-Width Interactive Stages, No Split Columns)
// =========================================================================

// Eight Principles of Yong (永字八法) for Synchronized Handwriting Tracing
const YONG_STROKES = [
  { id: 1, name: 'Diǎn', zh: '点', type: 'Dot', x: 50, y: 22, tip: 'Downward press' },
  { id: 2, name: 'Héng', zh: '横', type: 'Horizontal', x: 62, y: 38, tip: 'Rightward glide' },
  { id: 3, name: 'Shù', zh: '竖', type: 'Vertical', x: 48, y: 56, tip: 'Central axis drop' },
  { id: 4, name: 'Gōu', zh: '钩', type: 'Hook', x: 43, y: 78, tip: 'Upward kick' },
  { id: 5, name: 'Tí', zh: '提', type: 'Rising', x: 30, y: 64, tip: 'Upward strike' },
  { id: 6, name: 'Piě', zh: '撇', type: 'Left Slant', x: 68, y: 52, tip: 'Left sweep' },
  { id: 7, name: 'Duǎn Piě', zh: '短撇', type: 'Short', x: 40, y: 60, tip: 'Brush taper' },
  { id: 8, name: 'Nà', zh: '捺', type: 'Flourish', x: 75, y: 76, tip: 'Right release' },
]

function HandwritingShowcaseStage() {
  const [activeStrokeIdx, setActiveStrokeIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStrokeIdx((prev) => (prev + 1) % YONG_STROKES.length)
    }, 1100)
    return () => clearInterval(timer)
  }, [])

  const currentStroke = YONG_STROKES[activeStrokeIdx]

  return (
    <div className="relative rounded-2xl bg-white/60 p-4 sm:p-5 border border-[#DECDB8]/40 overflow-hidden select-none">
      {/* Scholar Calligraphy Watermark in Background */}
      <span className="pointer-events-none absolute -right-3 -bottom-6 font-serif text-[115px] font-bold text-charcoal/[0.035] leading-none select-none">
        书
      </span>

      {/* Top Status Bar */}
      <div className="flex items-center justify-between text-[10px] pb-2 border-b border-[#DECDB8]/40 mb-3.5">
        <span className="inline-flex items-center gap-1.5 font-mono font-bold text-cinnabar text-[9px] uppercase tracking-wider">
          <span className="size-1.5 rounded-full bg-cinnabar animate-pulse" />
          AI STROKE ENGINE
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-cinnabar/10 px-2 py-0.5 text-[9px] font-bold text-cinnabar">
            HSK 1
          </span>
          <span className="font-mono text-[9px] text-charcoal/50">
            STROKE {activeStrokeIdx + 1}/8
          </span>
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Left: Tian Zi Ge Canvas with Synchronized Calligraphy Brush */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center">
          <div className="relative size-28 sm:size-32 rounded-2xl border-2 border-dashed border-[#DCD2C3] bg-[#FAF8F5] flex items-center justify-center overflow-hidden shadow-inner">
            {/* Traditional Grid Lines (Tian Zi Ge + Diagonal Mi Zi Ge) */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-px border-b border-dashed border-charcoal/15" />
              <div className="absolute top-0 bottom-0 left-1/2 w-px border-r border-dashed border-charcoal/15" />
              <svg className="absolute inset-0 size-full opacity-10" viewBox="0 0 100 100">
                <line x1="0" y1="0" x2="100" y2="100" stroke="#292723" strokeDasharray="3 3" />
                <line x1="100" y1="0" x2="0" y2="100" stroke="#292723" strokeDasharray="3 3" />
              </svg>
              <div className="absolute inset-2 border border-charcoal/10 rounded-lg" />
            </div>

            {/* Character Centerpiece */}
            <span className="font-serif text-5xl sm:text-6xl font-normal text-charcoal select-none leading-none z-10">
              永
            </span>

            {/* Miniature Scholar Vermilion Seal Stamp */}
            <div className="absolute top-1.5 left-1.5 size-4.5 rounded-[2px] border border-cinnabar/60 bg-cinnabar/10 flex items-center justify-center z-15 pointer-events-none">
              <span className="font-serif text-[7px] text-cinnabar font-bold leading-none scale-90">永</span>
            </div>

            {/* Calligraphy Brush Tip with Ripple Pulse */}
            <motion.div
              animate={{
                left: `${currentStroke.x}%`,
                top: `${currentStroke.y}%`,
              }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
            >
              <span className="relative flex size-3.5 items-center justify-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-cinnabar/40 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-cinnabar shadow-[0_0_8px_rgba(158,42,43,0.9)]" />
              </span>
            </motion.div>

            {/* Active Telemetry Chip */}
            <div className="absolute bottom-1.5 right-1.5 rounded-md bg-white/95 border border-[#DECDB8] px-1.5 py-0.5 text-[8px] font-mono font-bold text-cinnabar shadow-2xs z-20 flex items-center gap-1">
              <span className="size-1 rounded-full bg-cinnabar" />
              <span>{currentStroke.name} ({currentStroke.zh})</span>
            </div>
          </div>
        </div>

        {/* Right: Flowing Synchronized Stroke Strip & Precision Telemetry */}
        <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-[9px] font-mono text-charcoal/60 uppercase font-semibold mb-1.5">
              <span>Synchronized Stroke Order</span>
              <span className="text-cinnabar font-bold">{currentStroke.tip}</span>
            </div>

            {/* Flowing Interactive Stroke Sequence (Highlighting active stroke in cinnabar) */}
            <div className="flex flex-wrap items-center gap-1.5">
              {YONG_STROKES.map((s, idx) => {
                const isActive = idx === activeStrokeIdx
                const isPassed = idx < activeStrokeIdx
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveStrokeIdx(idx)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cinnabar text-white font-bold shadow-2xs scale-105'
                        : isPassed
                        ? 'bg-cinnabar/10 text-charcoal font-medium hover:bg-cinnabar/15'
                        : 'bg-transparent text-charcoal/60 hover:text-charcoal'
                    }`}
                    title={`${s.name} - ${s.tip}`}
                  >
                    <span className={`font-mono text-[9px] ${isActive ? 'text-white/80' : 'text-cinnabar/80 font-bold'}`}>
                      {s.id}.
                    </span>
                    <span>{s.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Stroke Precision Telemetry */}
          <div className="pt-2 border-t border-[#DECDB8]/40">
            <div className="flex items-center justify-between text-[10px] mb-1.5">
              <span className="font-medium text-charcoal/70">Recognition Accuracy</span>
              <span className="font-mono font-bold text-emerald-800">98.4% Match · 100% Sequence</span>
            </div>
            <div className="w-full bg-[#E5DCCD] h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '98.4%' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DictionaryShowcaseStage() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const handlePlayAudio = () => {
    if (isPlayingAudio) return
    setIsPlayingAudio(true)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance('韵')
      utterance.lang = 'zh-CN'
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
    setTimeout(() => {
      setIsPlayingAudio(false)
    }, 1300)
  }

  return (
    <div className="relative rounded-2xl bg-white/60 p-4 sm:p-5 border border-[#DECDB8]/40 overflow-hidden select-none">
      {/* Scholar Watermark in Background */}
      <span className="pointer-events-none absolute -right-3 -bottom-6 font-serif text-[115px] font-bold text-charcoal/[0.035] leading-none select-none">
        典
      </span>

      {/* Top Search Bar */}
      <div className="flex items-center gap-2 pb-2.5 border-b border-[#DECDB8]/40 mb-3.5 text-xs shrink-0">
        <svg className="size-3.5 text-cinnabar shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="font-serif font-bold text-charcoal text-sm">韵 (yùn)</span>
        <span className="text-[10px] text-charcoal/45 font-mono hidden sm:inline">— 120,000+ verified entries</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-md bg-cinnabar/10 px-2 py-0.5 text-[9px] font-bold text-cinnabar">
            HSK 6
          </span>
          <span className="text-[9px] font-mono text-charcoal/50 hidden sm:inline">13 Strokes</span>
        </div>
      </div>

      {/* Main Lexicon Centerpiece */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Left: Character & Pronunciation + Chinese Tone Pitch Contour SVG */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-3">
            <span className="font-serif text-5xl sm:text-6xl font-medium text-charcoal leading-none">
              韵
            </span>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold text-cinnabar leading-none">yùn</span>
                {/* Audio Pronunciation Button with Speech Synthesis */}
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  aria-label="Listen to pronunciation of 韵"
                  className="inline-flex items-center justify-center size-6 rounded-full bg-cinnabar/10 hover:bg-cinnabar hover:text-white text-cinnabar transition-all cursor-pointer active:scale-90"
                  title="Listen to pronunciation"
                >
                  {isPlayingAudio ? (
                    <span className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 bg-current animate-[pulse_0.4s_infinite] h-2" />
                      <span className="w-0.5 bg-current animate-[pulse_0.6s_infinite] h-3" />
                      <span className="w-0.5 bg-current animate-[pulse_0.3s_infinite] h-1.5" />
                    </span>
                  ) : (
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-charcoal/60 font-mono mt-0.5">Tone 4 · Falling</p>
            </div>
          </div>

          {/* Visual Chinese Pitch Contour Curve (5-Level Pitch System: 5 -> 1) */}
          <div className="mt-2 flex items-center gap-1.5 text-[9px] font-mono text-charcoal/60">
            <span className="text-[8px] uppercase tracking-wider text-cinnabar font-bold">PITCH 51</span>
            <svg className="w-16 h-4" viewBox="0 0 64 16" fill="none">
              <line x1="2" y1="2" x2="62" y2="2" stroke="#DECDB8" strokeDasharray="2 2" strokeWidth="0.8" />
              <line x1="2" y1="14" x2="62" y2="14" stroke="#DECDB8" strokeDasharray="2 2" strokeWidth="0.8" />
              <path d="M4 3 Q 28 4, 60 13" stroke="#9E2A2B" strokeWidth="2" strokeLinecap="round" />
              <circle cx="60" cy="13" r="2.2" fill="#9E2A2B" />
            </svg>
            <span className="text-[9px] font-medium text-charcoal/70">Falling</span>
          </div>
        </div>

        {/* Right: Radical Anatomy Equation & Rich Definition */}
        <div className="sm:col-span-8 flex flex-col justify-between space-y-2.5">
          {/* Radical Component Anatomy Equation (No boxes, organic typography) */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-[9px] font-mono font-bold text-charcoal/50 uppercase tracking-wider">
              ANATOMY:
            </span>
            <div className="inline-flex items-center gap-1.5 font-serif text-charcoal">
              <span className="font-semibold text-cinnabar">音</span>
              <span className="text-[10px] text-charcoal/70 font-sans">(Sound)</span>
              <span className="text-charcoal/40 font-mono font-normal">+</span>
              <span className="font-semibold text-cinnabar">匀</span>
              <span className="text-[10px] text-charcoal/70 font-sans">(Harmony)</span>
              <span className="text-charcoal/40 font-mono font-normal">=</span>
              <span className="font-semibold text-charcoal font-serif">韵</span>
              <span className="text-[10px] text-charcoal/70 font-sans italic">(Lingering Charm)</span>
            </div>
          </div>

          {/* Definitions with Scholar Left Accent */}
          <div className="border-l-2 border-cinnabar/60 pl-3 py-1">
            <span className="text-[8px] font-mono font-bold text-cinnabar uppercase tracking-wider block">
              DEFINITIONS
            </span>
            <p className="text-xs sm:text-sm text-charcoal/85 leading-snug font-serif italic mt-0.5">
              "1. rhyme; vowel · 2. musical charm; lingering grace; aesthetic appeal"
            </p>
          </div>

          {/* Collocation tags */}
          <div className="flex items-center gap-2 text-[10px] text-charcoal/70 pt-0.5">
            <span className="font-mono text-[9px] text-charcoal/50 uppercase">COLLOCATIONS:</span>
            <span className="rounded-sm bg-cinnabar/5 px-1.5 py-0.5 font-serif font-medium text-charcoal/80">韵味 (Charm)</span>
            <span className="rounded-sm bg-cinnabar/5 px-1.5 py-0.5 font-serif font-medium text-charcoal/80">韵律 (Rhythm)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FlashcardsShowcaseStage() {
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipped((prev) => !prev)
    }, 2800)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative rounded-2xl bg-white/60 p-4 sm:p-5 border border-[#DECDB8]/40 overflow-hidden select-none">
      {/* Scholar Watermark in Background */}
      <span className="pointer-events-none absolute -right-3 -bottom-6 font-serif text-[115px] font-bold text-charcoal/[0.035] leading-none select-none">
        忆
      </span>

      {/* Top Bar */}
      <div className="flex items-center justify-between text-[10px] pb-2 border-b border-[#DECDB8]/40 mb-3.5">
        <span className="font-mono font-bold text-cinnabar text-[9px] uppercase tracking-wider">
          LEITNER SPACED REPETITION
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-cinnabar/10 px-2 py-0.5 text-[9px] font-mono font-bold text-cinnabar">
            HSK 1 DECK
          </span>
          <span className="font-mono text-[9px] text-charcoal/50">CARD 12/150</span>
        </div>
      </div>

      {/* Main Stage */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Left: 3D Tactile Layered Card Deck */}
        <div className="sm:col-span-5 flex justify-center py-1">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative aspect-[16/11] w-full max-w-[210px] cursor-pointer select-none group"
            style={{ perspective: 1000 }}
            title="Click to flip card"
          >
            {/* Physical Deck Silhouette Layer 2 (Bottom card) */}
            <div
              className="absolute inset-0 rounded-xl bg-[#EDE5D8]/80 border border-[#DCD2C3] shadow-2xs pointer-events-none transition-transform group-hover:rotate-3"
              style={{ transform: 'rotate(2.5deg) translateY(3px)' }}
            />
            {/* Physical Deck Silhouette Layer 1 (Middle card) */}
            <div
              className="absolute inset-0 rounded-xl bg-[#F5EFE6] border border-[#DECDB8] shadow-2xs pointer-events-none transition-transform group-hover:-rotate-3"
              style={{ transform: 'rotate(-2.5deg) translateY(1.5px)' }}
            />

            {/* Top Interactive Flip Card */}
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
              className="relative size-full rounded-xl shadow-xs transition-shadow group-hover:shadow-md"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front Side */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-3 rounded-xl bg-[#FAF8F5] border border-[#DECDB8]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="font-serif text-4xl sm:text-5xl font-medium text-charcoal leading-none">
                  学
                </span>
                <span className="mt-1.5 text-sm font-bold text-cinnabar">
                  xué
                </span>
                <span className="text-[9px] text-charcoal/50 font-mono mt-0.5">HSK 1 · 8 Strokes</span>
                <span className="text-[8px] text-charcoal/40 font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to flip
                </span>
              </div>

              {/* Back Side */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-3 rounded-xl bg-[#FAF6F0] border border-cinnabar/30"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="text-[8px] font-bold text-cinnabar uppercase tracking-wider">
                  MEANING
                </span>
                <p className="mt-0.5 font-serif text-sm font-bold text-charcoal leading-tight">
                  to study, learn
                </p>
                <p className="text-[10px] text-charcoal/60 italic mt-0.5 line-clamp-1">
                  "我们要好好学习"
                </p>
                <span className="mt-2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5">
                  ✓ Remembered (+3 Days)
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right: Spaced Repetition Intervals Timeline & Deck Mastery */}
        <div className="sm:col-span-7 flex flex-col justify-between space-y-2.5">
          {/* Deck Mastery Progress */}
          <div>
            <div className="flex items-center justify-between text-[10px] mb-1.5">
              <span className="font-mono text-charcoal/60 uppercase font-semibold text-[9px] tracking-wider">
                Deck Mastery Progress
              </span>
              <span className="font-mono font-bold text-emerald-800 text-[11px]">
                114 / 150 Words (76%)
              </span>
            </div>
            
            {/* Multi-segmented Progress Bar */}
            <div className="w-full bg-[#E5DCCD] h-2 rounded-full overflow-hidden flex">
              <div style={{ width: '76%' }} className="h-full bg-emerald-700" title="76% Mastered" />
              <div style={{ width: '16%' }} className="h-full bg-amber-600" title="16% Learning" />
              <div style={{ width: '8%' }} className="h-full bg-charcoal/30" title="8% New" />
            </div>

            {/* Legend Indicators */}
            <div className="flex items-center gap-4 text-[10px] font-medium text-charcoal/70 mt-1.5">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-700" />
                114 Mastered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-600" />
                24 Learning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-charcoal/40" />
                12 New
              </span>
            </div>
          </div>

          {/* Spaced Repetition (SRS) Review Schedule Visualizer */}
          <div className="pt-2 border-t border-[#DECDB8]/40">
            <div className="flex items-center justify-between text-[9px] font-mono text-charcoal/60 mb-1">
              <span className="uppercase font-semibold">SRS INTERVAL BOOST</span>
              <span className="text-emerald-800 font-bold">94.2% Retention</span>
            </div>
            <div className="flex items-center justify-between gap-1 text-[10px]">
              {[
                { stage: 'Day 1', label: '1d', active: false },
                { stage: 'Day 3', label: '3d', active: true },
                { stage: 'Day 7', label: '7d', active: false },
                { stage: 'Day 14', label: '14d', active: false },
                { stage: 'Day 30', label: '30d', active: false },
              ].map((step, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className={`w-full h-1 rounded-full mb-1 ${step.active ? 'bg-cinnabar' : idx < 1 ? 'bg-emerald-600' : 'bg-[#DECDB8]'}`} />
                  <span className={`text-[9px] font-mono ${step.active ? 'text-cinnabar font-bold' : 'text-charcoal/60'}`}>
                    {step.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Fallback Recently Saved Words (Matching User's Specified Vocabulary)
const FALLBACK_SAVED_WORDS = [
  {
    id: 201,
    entry_id: 201,
    simplified: '你好',
    traditional: '你好',
    pinyin_display: 'nǐ hǎo',
    pinyin_numbered: 'ni3 hao3',
    meanings: ['Hello', 'How are you'],
  },
  {
    id: 202,
    entry_id: 202,
    simplified: '谢谢',
    traditional: '謝謝',
    pinyin_display: 'xiè xie',
    pinyin_numbered: 'xie4 xie5',
    meanings: ['Thank you', 'Thanks'],
  },
]

// Helper: Clean Meanings Snippet
function formatCleanMeaningSnippet(meanings) {
  if (!meanings) return 'Chinese Vocabulary'
  const list = Array.isArray(meanings)
    ? meanings
    : typeof meanings === 'string'
    ? meanings.split(/[,;\n]/)
    : []

  const cleaned = list
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item && !/^cl\s*:/i.test(item) && !/[\u4e00-\u9fff]/.test(item))

  return cleaned.length > 0 ? cleaned.slice(0, 2).join(' · ') : 'Chinese Vocabulary'
}

// Auto-Fit Character Tile with Subtle Tian Zi Ge Grid
function CharacterTile({ char, size = 'md' }) {
  const len = char?.length || 1

  let baseClass
  if (size === 'lg') {
    baseClass =
      len === 1
        ? 'w-14 h-14 text-2xl'
        : len === 2
        ? 'h-14 min-w-[64px] px-2.5 text-xl tracking-normal'
        : 'h-14 min-w-[76px] px-2.5 text-base tracking-tight'
  } else if (size === 'sm') {
    baseClass =
      len === 1
        ? 'w-9 h-9 text-lg'
        : len === 2
        ? 'h-9 min-w-[44px] px-1.5 text-xs font-bold tracking-normal'
        : 'h-9 min-w-[50px] px-1.5 text-[10px] tracking-tight'
  } else {
    // 'md' default
    baseClass =
      len === 1
        ? 'w-11 h-11 text-xl'
        : len === 2
        ? 'h-11 min-w-[54px] px-2 text-base font-bold tracking-normal'
        : 'h-11 min-w-[62px] px-2 text-xs tracking-tight'
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-xl border border-cinnabar/25 bg-white font-serif font-bold text-charcoal shadow-inner select-none whitespace-nowrap overflow-hidden leading-none ${baseClass}`}
    >
      {len === 1 && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-[#292723]/10" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-[#292723]/10" />
        </>
      )}
      <span className="relative z-10 leading-none">{char}</span>
    </div>
  )
}

export default function UserHome() {
  const { user } = useAuth()

  // State
  const [dailyWords, setDailyWords] = useState([])
  const [savedWords, setSavedWords] = useState([])
  const [progressStats, setProgressStats] = useState(() => {
    try {
      const cached = localStorage.getItem('chinese_flashcard_progress') || localStorage.getItem('mandarin_flashcard_progress')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [dailyStats, setDailyStats] = useState(null)

  // Interaction State
  const [selectedWord, setSelectedWord] = useState(null)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')
  const [quoteIdx, setQuoteIdx] = useState(0)

  // Carousel and Feature Tabs State
  const [dailyCarouselIdx, setDailyCarouselIdx] = useState(0)
  const [activeFeatureTab, setActiveFeatureTab] = useState('handwriting')
  const [isCarouselHovered, setIsCarouselHovered] = useState(false)

  const carouselDailyWords = useMemo(() => {
    if (dailyWords && dailyWords.length > 0) {
      return dailyWords.slice(0, 5)
    }
    return FALLBACK_DAILY_WORDS.slice(0, 5)
  }, [dailyWords])

  const currentCarouselWord = carouselDailyWords[dailyCarouselIdx] || carouselDailyWords[0]

  const handlePrevCarouselWord = useCallback(() => {
    setDailyCarouselIdx((prev) => (prev === 0 ? carouselDailyWords.length - 1 : prev - 1))
  }, [carouselDailyWords.length])

  const handleNextCarouselWord = useCallback(() => {
    setDailyCarouselIdx((prev) => (prev === carouselDailyWords.length - 1 ? 0 : prev + 1))
  }, [carouselDailyWords.length])

  // Auto-play Carousel: Advance to next daily word every 5 seconds (pauses on hover or when modal is open)
  useEffect(() => {
    if (isCarouselHovered || Boolean(selectedWord) || carouselDailyWords.length <= 1) {
      return
    }
    const timer = setInterval(() => {
      setDailyCarouselIdx((prev) => (prev + 1) % carouselDailyWords.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isCarouselHovered, selectedWord, carouselDailyWords.length])

  // Rotate Hero Chinese Proverb
  const currentQuote = HERO_QUOTES[quoteIdx]
  const handleNextQuote = useCallback((e) => {
    if (e) e.stopPropagation()
    setQuoteIdx((prev) => (prev + 1) % HERO_QUOTES.length)
  }, [])

  // Audio Pronunciation Handler (Web Speech API)
  const handlePlayAudio = useCallback((text, e) => {
    if (e) e.stopPropagation()
    if (!text || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }, [])

  // Local Tracking for Saved Words to provide immediate visual feedback per slide
  const [savedCharsSet, setSavedCharsSet] = useState(() => new Set())

  // Check if a word is saved (strictly by unique simplified character or dictionary entry_id)
  const isWordSaved = useCallback(
    (word) => {
      if (!word) return false
      const char = word.simplified
      const entryId = word.id || word.entry_id
      if (char && savedCharsSet.has(char)) return true
      if (entryId && savedCharsSet.has(`id_${entryId}`)) return true
      if (savedWords && savedWords.length > 0) {
        return savedWords.some(
          (sw) =>
            (char && sw.simplified === char) ||
            (entryId && sw.entry_id === entryId)
        )
      }
      return false
    },
    [savedWords, savedCharsSet]
  )

  // Save Character to Collection Handler (with Color Toggle & Instant Visual Feedback per Word)
  const handleSaveWord = async (word, e) => {
    if (e) e.stopPropagation()
    if (!word) return
    const entryId = typeof word === 'object' ? (word.id || word.entry_id) : word
    const char = typeof word === 'object' ? word.simplified : null
    const alreadySaved = typeof word === 'object' ? isWordSaved(word) : (char ? savedCharsSet.has(char) : false)

    if (alreadySaved) {
      try {
        const savedRecord = savedWords.find(
          (sw) =>
            (char && sw.simplified === char) ||
            (entryId && sw.entry_id === entryId)
        )
        const deleteId = savedRecord?.id
        if (deleteId) {
          await savedCharacterService.deleteSaved(deleteId)
        }
        setSavedCharsSet((prev) => {
          const next = new Set(prev)
          if (char) next.delete(char)
          if (entryId) next.delete(`id_${entryId}`)
          return next
        })
        setSaveSuccessMsg('Word removed from collection.')
        setTimeout(() => setSaveSuccessMsg(''), 2500)
        fetchSaved()
      } catch {
        setSavedCharsSet((prev) => {
          const next = new Set(prev)
          if (char) next.delete(char)
          if (entryId) next.delete(`id_${entryId}`)
          return next
        })
        setSaveSuccessMsg('Word removed from collection.')
        setTimeout(() => setSaveSuccessMsg(''), 2500)
      }
      return
    }

    try {
      await savedCharacterService.saveCharacter(entryId, 'kata_harian')
      setSavedCharsSet((prev) => {
        const next = new Set(prev)
        if (char) next.add(char)
        if (entryId) next.add(`id_${entryId}`)
        return next
      })
      setSaveSuccessMsg('Word successfully saved to your collection!')
      setTimeout(() => setSaveSuccessMsg(''), 2500)
      fetchSaved()
    } catch (err) {
      setSavedCharsSet((prev) => {
        const next = new Set(prev)
        if (char) next.add(char)
        if (entryId) next.add(`id_${entryId}`)
        return next
      })
      setSaveSuccessMsg(err.response?.data?.message || 'Word saved to your collection!')
      setTimeout(() => setSaveSuccessMsg(''), 2500)
    }
  }

  // Fetch Saved Words
  const fetchSaved = useCallback(async () => {
    try {
      const res = await savedCharacterService.getSaved('', 1, 6)
      if (res.data?.status === 'success' && res.data?.data && res.data.data.length > 0) {
        setSavedWords(res.data.data)
      } else {
        setSavedWords(FALLBACK_SAVED_WORDS)
      }
    } catch (err) {
      console.warn('Saved characters notice:', err?.message)
      setSavedWords(FALLBACK_SAVED_WORDS)
    }
  }, [])

  // Fetch Dashboard Data
  useEffect(() => {
    let isMounted = true

    const loadAllDashboardData = async () => {
      try {
        const [dailyRes, savedRes, , , progressRes, dailyStatsRes] =
          await Promise.allSettled([
            dailyWordService.getDailyWords(),
            savedCharacterService.getSaved('', 1, 6),
            statisticsService.getOverview(),
            statisticsService.getWeekly(),
            flashcardService.getProgress(),
            statisticsService.getDaily(),
          ])

        if (!isMounted) return

        // 1. Daily Words
        if (dailyRes.status === 'fulfilled' && dailyRes.value.data?.status === 'success' && dailyRes.value.data?.data?.length > 0) {
          setDailyWords(dailyRes.value.data.data)
        } else {
          setDailyWords(FALLBACK_DAILY_WORDS)
        }

        // 2. Saved Words
        if (savedRes.status === 'fulfilled' && savedRes.value.data?.status === 'success' && savedRes.value.data?.data?.length > 0) {
          setSavedWords(savedRes.value.data.data)
        } else {
          setSavedWords(FALLBACK_SAVED_WORDS)
        }

        // 3. Flashcard Progress
        if (progressRes.status === 'fulfilled' && progressRes.value.data?.data) {
          setProgressStats(progressRes.value.data.data)
          try {
            localStorage.setItem(
              'chinese_flashcard_progress',
              JSON.stringify(progressRes.value.data.data)
            )
            localStorage.setItem(
              'mandarin_flashcard_progress',
              JSON.stringify(progressRes.value.data.data)
            )
          } catch {
            // ignore storage error
          }
        }

        // 5. Daily Stats
        if (dailyStatsRes.status === 'fulfilled' && dailyStatsRes.value.data?.data) {
          setDailyStats(dailyStatsRes.value.data.data)
        }
      } catch (err) {
        console.warn('User dashboard notice:', err?.message)
      }
    }

    loadAllDashboardData()

    return () => {
      isMounted = false
    }
  }, [fetchSaved])

  // Dynamic Greeting
  const timeOfDayGreeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  // Smooth scroll handler to explore dashboard content below
  const handleScrollToContent = useCallback(() => {
    const el = document.getElementById('dashboard-content')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const DAILY_TARGET_GOAL = 30

  // Daily Study Statistics (Statistik Harian - Target: 30 Soal / Hari)
  const todayStats = useMemo(() => {
    const answered = dailyStats?.total_dijawab ?? 0
    const correct = dailyStats?.total_benar ?? 0
    const wrong = dailyStats?.total_salah ?? 0
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0
    const pct = Math.min(100, Math.round((answered / DAILY_TARGET_GOAL) * 100))
    const isGoalReached = answered >= DAILY_TARGET_GOAL
    const remaining = Math.max(0, DAILY_TARGET_GOAL - answered)

    return {
      answered,
      correct,
      wrong,
      accuracy,
      pct,
      isGoalReached,
      remaining,
    }
  }, [dailyStats])

  // Active HSK Course Progress (Automatically advances to next level when previous is completed)
  const activeCourse = useMemo(() => {
    let levels = progressStats?.levels
    if (!levels || !Array.isArray(levels) || levels.length === 0) {
      try {
        const cached = localStorage.getItem('chinese_flashcard_progress') || localStorage.getItem('mandarin_flashcard_progress')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed?.levels)) {
            levels = parsed.levels
          }
        }
      } catch {
        // ignore storage error
      }
    }

    if (Array.isArray(levels) && levels.length > 0) {
      const isLvlDone = (l) => {
        const pct = l.percentage ?? 0
        const studied = l.studied_count ?? 0
        const total = l.total_words || 150
        return pct >= 100 || (studied > 0 && studied >= total)
      }

      // 1. Look for a level currently in progress (e.g. studied > 0 but not yet 100% done)
      const inProgress = levels.find(
        (l) => !isLvlDone(l) && ((l.percentage ?? 0) > 0 || (l.studied_count ?? 0) > 0)
      )
      if (inProgress) {
        return {
          level: inProgress.level,
          total: inProgress.total_words || 150,
          studied: inProgress.studied_count ?? 0,
          mastered: inProgress.mastered_count ?? 0,
          percentage: inProgress.percentage ?? 0,
          isCompleted: false,
        }
      }

      // 2. If no level is partially done (e.g. HSK 1 is 100% completed, HSK 2 is 0%),
      // automatically skip to the first incomplete level!
      const nextIncomplete = levels.find((l) => !isLvlDone(l))
      if (nextIncomplete) {
        return {
          level: nextIncomplete.level,
          total: nextIncomplete.total_words || 150,
          studied: nextIncomplete.studied_count ?? 0,
          mastered: nextIncomplete.mastered_count ?? 0,
          percentage: nextIncomplete.percentage ?? 0,
          isCompleted: false,
        }
      }

      // 3. If all levels are 100% completed, show Level 6 (or last level)
      const lastLvl = levels[levels.length - 1]
      return {
        level: lastLvl.level,
        total: lastLvl.total_words || 150,
        studied: lastLvl.studied_count ?? 0,
        mastered: lastLvl.mastered_count ?? 0,
        percentage: lastLvl.percentage ?? 100,
        isCompleted: true,
      }
    }

    return {
      level: 1,
      percentage: 0,
      total: 150,
      studied: 0,
      mastered: 0,
      isCompleted: false,
    }
  }, [progressStats])

  return (
    <div className="relative min-h-screen">
      {/* Background: Soft Rice Paper Tone (#F6F0E5) + Swimming Koi Fish Artwork Texture */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#F6F0E5] select-none">
        <img
          src={homeKoi}
          alt="Koi Fish Texture"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-85 mix-blend-multiply blur-[1px] scale-[1.01]"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#292723_1px,transparent_1px),linear-gradient(to_bottom,#292723_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.015]" />

        {/* Ambient Floating Calligraphy Tiles */}
        {FLOATING_BG_CHARS.map((item, idx) => (
          <motion.div
            key={idx}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
            }}
            animate={{
              y: [0, -16, 0],
              rotate: [-2, 2.5, -2],
              opacity: [0.18, 0.32, 0.18],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
            className="pointer-events-none absolute hidden xl:flex flex-col items-center select-none"
          >
            <div className="relative flex size-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D4C8B8]/60 bg-[#FAF8F5]/30 shadow-xs backdrop-blur-[0.5px]">
              <span className="font-serif text-4xl font-normal text-charcoal/20 leading-none">
                {item.char}
              </span>
              <span className="text-[9px] font-mono tracking-widest text-charcoal/20 uppercase mt-1 leading-none">
                {item.pinyin}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Action Message / Toast */}
      <AnimatePresence>
        {saveSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[120] flex items-center justify-center rounded-2xl border border-charcoal/15 bg-[#292723] px-5 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md pointer-events-none select-none"
          >
            <span>{saveSuccessMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 0. HERO LANDING SECTION (TRADITIONAL MOUNTAIN PINE LANDSCAPE WITH RIGHT TEXT) */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[92vh] sm:min-h-screen flex items-center justify-end overflow-hidden">
        {/* Background Artwork: Softly Blurred Landscape for Depth of Field */}
        <img
          src={userHeroLandscape}
          alt="Traditional Scholar Landscape Artwork"
          className="absolute inset-0 h-full w-full object-cover object-[25%_center] sm:object-center select-none pointer-events-none blur-[2px] scale-[1.03] transition-all"
        />

        {/* Soft glowing aura behind the red sun */}
        <div className="absolute top-[14%] right-[14%] size-36 sm:size-44 rounded-full bg-rose-500/20 blur-3xl pointer-events-none animate-pulse" />

        {/* Soft gradient fades for flawless contrast and smooth bottom transition */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F6F0E5] via-transparent to-black/15 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F6F0E5] via-[#F6F0E5]/70 to-transparent pointer-events-none" />

        {/* Right-Aligned Scholar Welcome Content (Positioned Inward from Right & Cleanly Balanced) */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 flex justify-end items-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl text-right flex flex-col items-end mr-2 sm:mr-8 lg:mr-14 xl:mr-20"
          >
            {/* Website Name & Refined Seal Emblem */}
            <div className="flex items-center justify-end gap-2.5 mb-2.5">
              <img
                src={hanzipathLogo}
                alt="HanziPath Logo"
                className="h-8 sm:h-9 w-auto object-contain drop-shadow-2xs"
              />
              <span className="font-heading font-serif text-base sm:text-lg font-bold tracking-wider text-charcoal">
                Hanzi<span className="text-cinnabar">Path</span>
              </span>
            </div>

            {/* Time-Based Greeting (Single Line with Organic Calligraphy Brush Underline) */}
            <h1 className="font-heading font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-bold text-charcoal tracking-tight leading-tight whitespace-nowrap">
              {timeOfDayGreeting},{' '}
              <span className="relative inline-block text-cinnabar italic font-serif">
                {user?.name || 'Nancy'}
                <svg
                  className="absolute -bottom-1.5 left-0 w-full h-2 text-cinnabar/50 pointer-events-none overflow-visible"
                  viewBox="0 0 120 8"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 5 C 30 1.5, 75 6.5, 118 3"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              !
            </h1>

            {/* Creative & Interactive Wisdom Motto (Click to Rotate Proverb or Listen Audio) */}
            <motion.div
              key={quoteIdx}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleNextQuote}
              className="mt-3 group inline-flex items-center gap-2 rounded-full border border-cinnabar/20 bg-white/70 hover:bg-white backdrop-blur-xs px-3.5 py-1 text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer select-none"
              title="Click to discover another proverb · 点击切换每日格言"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlayAudio(currentQuote.hanzi, e)
                }}
                className="flex size-5 items-center justify-center rounded-full bg-cinnabar/10 text-cinnabar hover:bg-cinnabar hover:text-white transition cursor-pointer"
                title="Listen pronunciation"
                aria-label={`Pronounce ${currentQuote.hanzi}`}
              >
                <svg className="size-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                </svg>
              </button>
              <span className="font-serif font-bold text-cinnabar tracking-wider">
                {currentQuote.hanzi}
              </span>
              <span className="size-1 rounded-full bg-cinnabar/40" />
              <span className="text-charcoal/75 font-sans font-medium">
                {currentQuote.en}
              </span>
              <svg className="size-3 text-charcoal/40 group-hover:text-cinnabar transition-transform group-hover:rotate-180 duration-300 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>

            {/* Subtitle */}
            <p className="mt-1.5 text-xs sm:text-sm text-charcoal/70 font-sans leading-relaxed max-w-md">
              Ready to continue your Chinese journey today?
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <Link
                to="/handwriting"
                className="group inline-flex items-center gap-2 rounded-full border border-[#D8CBBA] bg-white/85 hover:bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-charcoal hover:text-cinnabar transition shadow-xs hover:shadow-md cursor-pointer active:scale-95"
              >
                <svg className="size-3.5 text-cinnabar/80 group-hover:text-cinnabar transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Quick Practice</span>
              </Link>

              <button
                type="button"
                onClick={handleScrollToContent}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cinnabar to-[#8B2320] hover:from-[#8B2320] hover:to-cinnabar px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-cinnabar/30 transition cursor-pointer active:scale-95"
              >
                <span>Explore Dashboard</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Floating Animated Scroll Down Button at Bottom Center */}
        <motion.button
          type="button"
          onClick={handleScrollToContent}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-charcoal/60 hover:text-cinnabar transition cursor-pointer group select-none"
          aria-label="Scroll down to dashboard"
        >
          <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-charcoal/60 group-hover:text-cinnabar transition-colors">
            Scroll to Explore
          </span>
          <div className="flex size-9 items-center justify-center rounded-full border border-white/60 bg-white/50 backdrop-blur-md shadow-xs group-hover:border-cinnabar/40 group-hover:bg-white/80 transition-colors">
            <svg className="size-4 text-charcoal group-hover:text-cinnabar transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </motion.button>
      </section>

      {/* ========================================================================= */}
      {/* 1. DEDICATED SECTION: DAILY WORDS CAROUSEL & CORE PLATFORM FEATURES (TABS) */}
      {/* Background: #F6F0E6 (Warm Scholar Rice Paper Band, Borderless)             */}
      {/* ========================================================================= */}
      <section
        id="dashboard-content"
        className="relative z-10 bg-[#F6F0E6] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 scroll-mt-6"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Section Kicker & Title (Line Removed) */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
            <div>
              <span className="block font-mono text-[10px] font-bold tracking-widest text-cinnabar uppercase">
                DAILY IMMERSION & CORE PLATFORM SUITE
              </span>
              <h2 className="font-heading font-serif text-2xl sm:text-3xl font-bold text-charcoal mt-1">
                Daily Vocabulary & Platform Features
              </h2>
            </div>
            <div className="text-xs text-charcoal/65 font-medium">
              Explore your daily character carousel & core study tools
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* ------------------------------------------------------------------- */}
            {/* LEFT COLUMN: DAILY WORDS CAROUSEL CARD (5 Curated Words)            */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col">
              <div
                onClick={() => setSelectedWord(currentCarouselWord)}
                onMouseEnter={() => setIsCarouselHovered(true)}
                onMouseLeave={() => setIsCarouselHovered(false)}
                className="flex flex-col justify-between h-full rounded-3xl border border-[#DECDB8]/60 bg-[#FAF7F2]/85 backdrop-blur-md p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-cinnabar/40 transition-all duration-300 cursor-pointer group select-none"
                title="Click card to view details"
              >
                {/* Carousel Card Top Header (Without Underline) */}
                <div>
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-cinnabar/30 bg-cinnabar/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cinnabar uppercase">
                        DAILY VOCABULARY · HSK {currentCarouselWord.level || 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-charcoal/60">
                        {dailyCarouselIdx + 1} / {carouselDailyWords.length}
                      </span>
                      {(() => {
                        const isSaved = isWordSaved(currentCarouselWord)
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveWord(currentCarouselWord, e)
                            }}
                            className={`flex size-7.5 items-center justify-center rounded-full border transition cursor-pointer shadow-2xs active:scale-95 ${
                              isSaved
                                ? 'border-cinnabar bg-cinnabar text-white shadow-xs'
                                : 'border-[#DECDB8] bg-white text-charcoal/60 hover:border-cinnabar hover:text-cinnabar'
                            }`}
                            title={isSaved ? 'Saved to collection (click to remove)' : 'Save to your collection'}
                            aria-label={`${isSaved ? 'Remove' : 'Save'} ${currentCarouselWord.simplified} to collection`}
                          >
                            <svg className="size-3.5" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Animated Carousel Content Area */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentCarouselWord.id || dailyCarouselIdx}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25 }}
                      className="py-4 space-y-4"
                    >
                      {/* Hanzi & Pinyin Showcase Block (Character displayed ONLY ONCE) */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Tian Zi Ge Character Tile (The Single Character Display) */}
                          <CharacterTile char={currentCarouselWord.simplified} size="lg" />

                          <div className="min-w-0">
                            <span className="font-mono text-[9px] font-bold text-cinnabar/80 uppercase tracking-wider block">
                              PINYIN
                            </span>
                            <div className="font-sans text-xl sm:text-2xl font-bold text-cinnabar tracking-normal">
                              {currentCarouselWord.pinyin_display}
                            </div>
                          </div>
                        </div>

                        {/* TTS Audio Pronunciation Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlayAudio(currentCarouselWord.simplified, e)
                          }}
                          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cinnabar text-white hover:bg-[#84211D] transition shadow-xs cursor-pointer active:scale-95"
                          title="Dengarkan pelafalan"
                          aria-label={`Listen to pronunciation for ${currentCarouselWord.simplified}`}
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                          </svg>
                        </button>
                      </div>

                      {/* Meaning Section (Cleanly Displayed BEFORE Example Sentence) */}
                      <div className="rounded-xl border border-[#DECDB8]/60 bg-white/70 px-4 py-2.5">
                        <span className="font-mono text-[9px] font-bold text-charcoal/50 uppercase tracking-wider block">
                          MEANING · 词义
                        </span>
                        <p className="mt-0.5 font-sans text-sm font-semibold text-charcoal leading-snug">
                          {formatCleanMeaningSnippet(currentCarouselWord.meanings)}
                        </p>
                      </div>

                      {/* Conversational Example Sentence */}
                      {(() => {
                        const exampleObj = getWordExample(currentCarouselWord)
                        return (
                          <div className="rounded-xl border border-[#DECDB8]/80 bg-[#F4EEE3]/80 p-3.5 text-xs">
                            <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#DECDB8]/60">
                              <span className="font-mono text-[9px] font-bold text-cinnabar uppercase tracking-wider">
                                CONVERSATIONAL EXAMPLE · 实用例句
                              </span>
                              {exampleObj?.chinese && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handlePlayAudio(exampleObj.chinese, e)
                                  }}
                                  className="flex size-5 items-center justify-center rounded-full bg-white text-charcoal/60 hover:text-cinnabar transition cursor-pointer"
                                  title="Listen to example sentence"
                                  aria-label="Listen to example sentence pronunciation"
                                >
                                  <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <p className="font-serif text-sm font-medium text-charcoal">
                              {exampleObj?.chinese || '我们要好好学习。'}
                            </p>
                            <p className="font-sans text-[11px] text-cinnabar/80 font-medium mt-0.5">
                              {exampleObj?.pinyin || 'Wǒmen yào hǎohǎo xuéxí.'}
                            </p>
                            <p className="text-[11px] text-charcoal/65 mt-0.5">
                              {exampleObj?.translation || 'We need to study well.'}
                            </p>
                          </div>
                        )
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Carousel Controls & Pagination (Centered Harmoniously) */}
                <div
                  className="pt-2 flex items-center justify-center gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Prev Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrevCarouselWord()
                    }}
                    className="flex size-8.5 items-center justify-center rounded-full border border-[#D8CBBA] bg-white text-charcoal/70 hover:border-cinnabar hover:text-cinnabar hover:bg-[#FAF8F5] transition-all cursor-pointer active:scale-95 shadow-2xs hover:shadow-xs"
                    title="Previous word"
                    aria-label="Previous daily word"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Centered Dot Indicators Pill Pod */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#DECDB8]/80 shadow-2xs">
                    {carouselDailyWords.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDailyCarouselIdx(dotIdx)
                        }}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          dotIdx === dailyCarouselIdx ? 'w-6 bg-cinnabar' : 'w-2 bg-charcoal/20 hover:bg-charcoal/40'
                        }`}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextCarouselWord()
                    }}
                    className="flex size-8.5 items-center justify-center rounded-full border border-[#D8CBBA] bg-white text-charcoal/70 hover:border-cinnabar hover:text-cinnabar hover:bg-[#FAF8F5] transition-all cursor-pointer active:scale-95 shadow-2xs hover:shadow-xs"
                    title="Next word"
                    aria-label="Next daily word"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* RIGHT COLUMN: CORE FEATURES IN TABS (Handwriting, Dictionary, Flashcards) */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex flex-col justify-between h-full rounded-3xl border border-[#DECDB8]/60 bg-[#FAF7F2]/85 backdrop-blur-md p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden">
                <div>
                  {/* Minimalist Motion Tabs Header (NO scrollbar / NO scroll pane) */}
                  <div className="relative border-b border-[#DECDB8] flex items-center gap-4 sm:gap-7 mb-4">
                    {FEATURE_TABS.map((tab) => {
                      const isActive = activeFeatureTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveFeatureTab(tab.id)}
                          className={`relative pb-3 text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap active:scale-[0.98] ${
                            isActive
                              ? 'text-charcoal font-bold'
                              : 'text-charcoal/50 hover:text-charcoal font-medium'
                          }`}
                        >
                          <span>{tab.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="activeFeatureTabUnderline"
                              className="absolute -bottom-px left-0 right-0 h-[2.5px] bg-cinnabar rounded-full"
                              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Active Tab Content Panel - Full-Width Hero Showcase (No split columns!) */}
                  <AnimatePresence mode="wait">
                    {(() => {
                      const currentTab = FEATURE_TABS.find((t) => t.id === activeFeatureTab) || FEATURE_TABS[0]
                      return (
                        <motion.div
                          key={currentTab.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-3"
                        >
                          {/* Feature Header: 1 Single Elegant Line */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10px] font-mono tracking-wider font-bold text-cinnabar uppercase px-2 py-0.5 rounded-md bg-cinnabar/10 shrink-0">
                                {currentTab.category}
                              </span>
                              <h3 className="font-heading font-serif text-base sm:text-lg font-bold text-charcoal tracking-tight whitespace-nowrap">
                                {currentTab.title}
                              </h3>
                            </div>

                            {/* Feature Indicators: Clean typography, no box borders */}
                            <div className="flex items-center gap-3 py-0.5 shrink-0 text-[11px] font-medium text-charcoal/70">
                              {currentTab.highlights.map((point, hIdx) => (
                                <span key={hIdx} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                  <span className="size-1.5 rounded-full bg-cinnabar/75" />
                                  {point}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Full-Width Showcase Stage (Engaging, Interactive, Alive) */}
                          {currentTab.id === 'handwriting' && <HandwritingShowcaseStage />}
                          {currentTab.id === 'dictionary' && <DictionaryShowcaseStage />}
                          {currentTab.id === 'flashcards' && <FlashcardsShowcaseStage />}
                        </motion.div>
                      )
                    })()}
                  </AnimatePresence>
                </div>

                {/* Tab CTA Action Footer */}
                <div className="pt-3 mt-3 border-t border-[#DECDB8]/80 flex items-center justify-end">
                  {(() => {
                    const currentTab = FEATURE_TABS.find((t) => t.id === activeFeatureTab) || FEATURE_TABS[0]
                    return (
                      <Link
                        to={currentTab.path}
                        className="group inline-flex items-center justify-center gap-1.5 rounded-lg bg-cinnabar hover:bg-[#84211D] px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white shadow-xs hover:shadow-cinnabar/25 transition-all cursor-pointer active:scale-95"
                      >
                        <span>{currentTab.ctaText}</span>
                        <svg
                          className="size-3.5 group-hover:translate-x-0.5 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. DASHBOARD OVERVIEW & STUDY ACTIONS BELOW HERO                           */}
      {/* ========================================================================= */}
      <div className="relative z-10 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* 2. THE SCHOLAR'S DAILY DESK (UNIFIED ATELIER DASHBOARD - BORDERLESS)       */}
        {/* ========================================================================= */}
        <div className="relative py-2 select-none">
          {/* Scholar Koi Watermark in Background */}
          <span className="pointer-events-none absolute -right-4 -bottom-6 font-serif text-[180px] font-bold text-charcoal/[0.04] leading-none select-none">
            鲤
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch relative z-10">
            {/* --------------------------------------------------------------------- */}
            {/* LEFT COLUMN: ACTIVE COURSE (TOP) & TODAY'S FOCUS (BOTTOM)             */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6 lg:border-r lg:border-[#DECDB8]/50 lg:pr-10">
              {/* 1. TOP: ACTIVE HSK STUDY SESSION (PROMINENT & CREATIVE) */}
              <div className="relative group">
                {/* Subtle Ambient Backlight Glow */}
                <div className="pointer-events-none absolute -inset-2 rounded-2xl bg-gradient-to-r from-cinnabar/10 via-amber-500/5 to-transparent blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  {/* Eyebrow & Status Row */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#DECDB8]/35">
                    <div className="flex items-center gap-2">
                      <span className="block font-mono text-[10px] font-bold tracking-widest text-cinnabar uppercase">
                        ACTIVE STUDY PATH · 当前研习
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wide transition-all ${
                        activeCourse.isCompleted
                          ? 'bg-amber-50/80 text-amber-900 border-amber-300/80'
                          : activeCourse.percentage > 0
                          ? 'bg-emerald-50/90 text-emerald-900 border-emerald-300/80'
                          : 'bg-[#EDE5D8]/70 text-charcoal/80 border-[#DECDB8]'
                      }`}
                    >
                      <span className="relative flex size-2">
                        {activeCourse.percentage > 0 && !activeCourse.isCompleted && (
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        )}
                        <span
                          className={`relative inline-flex size-2 rounded-full ${
                            activeCourse.isCompleted
                              ? 'bg-amber-500'
                              : activeCourse.percentage > 0
                              ? 'bg-emerald-600'
                              : 'bg-charcoal/40'
                          }`}
                        />
                      </span>
                      <span>
                        {activeCourse.isCompleted
                          ? 'Level Completed'
                          : activeCourse.percentage > 0
                          ? 'In Progress'
                          : 'Next Up'}
                      </span>
                    </span>
                  </div>

                  {/* Main Course Bar: Seal, Title, Mastered Count, CTA Button */}
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Floating Animated Hanzi Seal */}
                      <motion.div
                        whileHover={{ scale: 1.08, rotate: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cinnabar/15 to-cinnabar/5 text-cinnabar border border-cinnabar/30 font-serif text-xl font-bold shadow-xs select-none backdrop-blur-xs transition-shadow hover:shadow-cinnabar/20"
                      >
                        <span className="relative z-10">{HSK_LEVEL_MOTIFS[activeCourse.level] || '学'}</span>
                        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-dashed border-cinnabar/20" />
                      </motion.div>

                      <div className="min-w-0">
                        <h4 className="font-heading font-serif text-lg sm:text-xl font-bold text-charcoal tracking-tight truncate">
                          HSK {activeCourse.level} · Vocabulary
                        </h4>
                        <p className="text-xs text-charcoal/70 truncate mt-0.5">
                          <span className="font-mono font-semibold text-charcoal">{activeCourse.studied}</span> of{' '}
                          <span className="font-mono text-charcoal/60">{activeCourse.total}</span> words mastered ·{' '}
                          <span className="font-mono font-bold text-cinnabar">{activeCourse.percentage}%</span>
                        </p>
                      </div>
                    </div>

                    {/* Creative Resume CTA Button with Tactile Motion & Shimmer */}
                    <motion.div
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="shrink-0 self-start sm:self-center"
                    >
                      <Link
                        to={`/flashcards?level=${activeCourse.level}`}
                        className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cinnabar via-[#A32A25] to-[#84211D] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-cinnabar/30 transition-all duration-300 cursor-pointer overflow-hidden"
                      >
                        {/* Shimmer light bar across button */}
                        <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform ease-out" />

                        <svg className="size-3.5 fill-current transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        <span>
                          {activeCourse.isCompleted
                            ? 'Review Level'
                            : activeCourse.percentage > 0
                            ? 'Resume Study'
                            : 'Start Study'}
                        </span>
                      </Link>
                    </motion.div>
                  </div>

                  {/* Animated Brush Progress Line with Liquid Shimmer */}
                  <div className="relative mt-4 w-full bg-[#EDE5D8]/70 h-2 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, activeCourse.percentage))}%` }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                      className="relative h-full bg-gradient-to-r from-cinnabar via-[#B83A30] to-[#6E1917] rounded-full overflow-hidden"
                    >
                      {/* Flowing animated sheen on progress fill */}
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* 2. BOTTOM: TODAY'S PRACTICE TARGET & STATS (FLUID & TRANSPARENT) */}
              <div className="pt-6 border-t border-dashed border-[#DECDB8]/45">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <span className="block font-mono text-[10px] font-bold tracking-widest text-cinnabar uppercase">
                      DAILY FOCUS · 今日精进
                    </span>
                    <h3 className="font-heading font-serif text-base sm:text-lg font-bold text-charcoal mt-0.5">
                      Today's Study Progress
                    </h3>
                  </div>
                </div>

                {/* Main Progress Row: Circular Dial + Metric Ledger */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {/* Radial Goal Dial */}
                  <div className="flex items-center gap-4">
                    <div className="relative size-16 sm:size-18 shrink-0 flex items-center justify-center">
                      <svg className="size-full -rotate-90 transform" viewBox="0 0 36 36">
                        <path
                          className="text-[#E7DFD3]/80"
                          strokeWidth="3.2"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <motion.path
                          className={todayStats.isGoalReached ? 'text-emerald-700' : 'text-cinnabar'}
                          strokeDasharray="100, 100"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: Math.min(1, todayStats.pct / 100) }}
                          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono text-sm sm:text-base font-bold text-charcoal leading-none">
                          {todayStats.pct}%
                        </span>
                        <span className="text-[8px] font-mono text-charcoal/50 mt-0.5 uppercase tracking-wider">
                          GOAL
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-bold text-sm text-charcoal">Daily Practice Target</span>
                        {todayStats.isGoalReached && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-800">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs font-bold text-charcoal mt-0.5">
                        {todayStats.answered}{' '}
                        <span className="font-sans font-normal text-charcoal/50">/ {DAILY_TARGET_GOAL} Questions</span>
                      </p>
                      <p className="text-[11px] text-charcoal/60 mt-0.5">
                        {todayStats.isGoalReached
                          ? 'Daily target reached! Keep up the momentum.'
                          : todayStats.answered === 0
                          ? 'Start today’s practice to reach your daily goal.'
                          : `${todayStats.remaining} questions left to hit daily goal.`}
                      </p>
                    </div>
                  </div>

                  {/* Inline Stats (Clean Floating Typography, No Boxes!) */}
                  <div className="flex items-center gap-5 sm:border-l border-[#DECDB8]/40 sm:pl-6 shrink-0">
                    <div className="group cursor-default transition-transform hover:-translate-y-0.5">
                      <span className="block text-[9px] font-mono uppercase text-charcoal/50 font-semibold">
                        Answered
                      </span>
                      <span className="font-heading font-serif text-2xl font-bold text-charcoal mt-0.5 block leading-none">
                        {todayStats.answered}
                      </span>
                      <span className="text-[10px] text-charcoal/50 font-sans mt-0.5 block">Questions</span>
                    </div>

                    <div className="group cursor-default transition-transform hover:-translate-y-0.5">
                      <span className="block text-[9px] font-mono uppercase text-charcoal/50 font-semibold">
                        Correct
                      </span>
                      <span className="font-heading font-serif text-2xl font-bold text-emerald-800 mt-0.5 block leading-none">
                        {todayStats.correct}
                      </span>
                      <span className="text-[10px] text-charcoal/50 font-sans mt-0.5 block">
                        {todayStats.answered > 0 ? `${todayStats.wrong} wrong` : '0 errors'}
                      </span>
                    </div>

                    <div className="group cursor-default transition-transform hover:-translate-y-0.5">
                      <span className="block text-[9px] font-mono uppercase text-charcoal/50 font-semibold">
                        Accuracy
                      </span>
                      <span className="font-heading font-serif text-2xl font-bold text-cinnabar mt-0.5 block leading-none">
                        {todayStats.answered > 0 ? `${todayStats.accuracy}%` : '—'}
                      </span>
                      <span className="text-[10px] text-charcoal/50 font-sans mt-0.5 block">Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* RIGHT COLUMN: LIVING LEXICON MANUSCRIPT (NO BOXES AROUND WORDS!)      */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Section Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#DECDB8]/35">
                  <div>
                    <span className="block font-mono text-[10px] font-bold tracking-widest text-cinnabar uppercase">
                      RECENTLY SAVED WORDS
                    </span>
                    <h3 className="font-heading font-serif text-lg sm:text-xl font-bold text-charcoal mt-0.5">
                      Saved Collection
                    </h3>
                  </div>
                  <Link
                    to="/profile"
                    className="font-mono text-[11px] font-bold text-cinnabar hover:underline cursor-pointer"
                  >
                    Manage All
                  </Link>
                </div>

                {/* Flowing Manuscript Words (Zero Boxiness, Pure Typography) */}
                <div className="mt-2 divide-y divide-[#DECDB8]/40">
                  {savedWords.slice(0, 4).map((item) => {
                    const meaningSnippet = formatCleanMeaningSnippet(item.meanings)
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedWord(item)}
                        className="group flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-cinnabar/[0.04] transition-all cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Floating Hanzi with Calligraphic Presence */}
                          <span className="font-serif text-xl sm:text-2xl font-bold text-charcoal group-hover:text-cinnabar transition-colors shrink-0 select-none">
                            {item.simplified}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-sans text-xs font-bold text-cinnabar">
                                {item.pinyin_display}
                              </span>
                            </div>
                            <p className="text-xs text-charcoal/65 truncate leading-tight mt-0.5">
                              {meaningSnippet}
                            </p>
                          </div>
                        </div>

                        {/* Pronunciation Audio Button */}
                        <button
                          type="button"
                          onClick={(e) => handlePlayAudio(item.simplified, e)}
                          className="flex size-7 items-center justify-center rounded-full text-charcoal/40 group-hover:text-cinnabar hover:bg-cinnabar/10 transition cursor-pointer shrink-0 ml-2"
                          title="Listen to pronunciation"
                          aria-label={`Listen to pronunciation for ${item.simplified}`}
                        >
                          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Word Detail Modal */}
      <WordDetailModal
        word={selectedWord}
        isOpen={Boolean(selectedWord)}
        onClose={() => setSelectedWord(null)}
        onSave={handleSaveWord}
        saveMsg={saveSuccessMsg}
      />
    </div>
  )
}
