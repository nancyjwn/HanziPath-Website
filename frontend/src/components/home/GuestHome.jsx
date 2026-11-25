import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { dailyWordService, savedCharacterService } from '../../services/api'
import homeHeroBg from '../../assets/home-hero-bg4.png'
import DailyWordsSection from './DailyWordsSection'
import FeaturesCarouselSection from './FeaturesCarouselSection'
import HskExploreAndQuizSection from './HskExploreAndQuizSection'
import HowItWorksAndFaqSection from './HowItWorksAndFaqSection'
import WordDetailModal from './WordDetailModal'

const FALLBACK_WORDS = [
  {
    id: 101,
    level: 1,
    urutan: 1,
    simplified: '学',
    traditional: '學',
    pinyin_display: 'xué',
    pinyin_numbered: 'xue2',
    meanings: ['to learn', 'to study', 'science', '-ology'],
  },
  {
    id: 102,
    level: 1,
    urutan: 2,
    simplified: '爱',
    traditional: '愛',
    pinyin_display: 'ài',
    pinyin_numbered: 'ai4',
    meanings: ['to love', 'to be fond of', 'to like', 'affection'],
  },
  {
    id: 103,
    level: 2,
    urutan: 3,
    simplified: '明',
    traditional: '明',
    pinyin_display: 'míng',
    pinyin_numbered: 'ming2',
    meanings: ['bright', 'clear', 'to understand', 'next (day, year)'],
  },
]

export default function GuestHome() {
  const [dailyWords, setDailyWords] = useState([])
  const [loadingDaily, setLoadingDaily] = useState(true)
  const [selectedWord, setSelectedWord] = useState(null)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchWords = async () => {
      try {
        const res = await dailyWordService.getDailyWords()
        if (isMounted && res.data?.status === 'success' && res.data?.data && res.data.data.length > 0) {
          setDailyWords(res.data.data)
        } else if (isMounted) {
          setDailyWords(FALLBACK_WORDS)
        }
      } catch (err) {
        console.warn('Daily words notice:', err?.message)
        if (isMounted) setDailyWords(FALLBACK_WORDS)
      } finally {
        if (isMounted) setLoadingDaily(false)
      }
    }

    fetchWords()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSaveWord = async (entryId) => {
    try {
      await savedCharacterService.saveCharacter(entryId, 'kata_harian')
      setSaveSuccessMsg('Character successfully saved to your profile!')
      setTimeout(() => setSaveSuccessMsg(''), 3000)
    } catch (err) {
      setSaveSuccessMsg(err.response?.data?.message || 'Character already saved.')
      setTimeout(() => setSaveSuccessMsg(''), 3000)
    }
  }

  return (
    <div className="overflow-x-hidden">
      {/* 1. Hero Landing Section (100% Full Viewport Screen) */}
      <section
        id="home"
        className="relative min-h-screen w-full flex flex-col justify-center items-center text-center px-6 pt-24 sm:pt-28 pb-16 sm:pb-20 overflow-hidden"
      >
        {/* Softly blurred oriental landscape background */}
        <div
          className="absolute -inset-2 bg-cover bg-[center_top] bg-no-repeat blur-[1.2px] scale-[1.015] pointer-events-none"
          style={{ backgroundImage: `url(${homeHeroBg})` }}
        />

        {/* Subtle luminous mist overlay with smooth bottom fade into cream */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-cream/80 pointer-events-none" />

        {/* Minimalist Centered Hero Content */}
        <div className="relative z-10 mx-auto max-w-3xl flex flex-col items-center">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-4xl sm:text-5xl lg:text-[58px] font-medium tracking-tight text-charcoal leading-[1.18] drop-shadow-xs"
          >
            Discover Chinese,<br />
            <span className="italic font-serif text-cinnabar">one character at a time.</span>
          </motion.h1>

          {/* Subtitle: Your journey starts here. */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3.5 font-serif italic text-base sm:text-lg text-cinnabar drop-shadow-xs"
          >
            Your journey starts here.
          </motion.p>

          {/* Description Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3.5 max-w-xl mx-auto text-sm sm:text-base text-charcoal/80 font-normal leading-relaxed drop-shadow-xs"
          >
            Explore characters, meanings, and HSK vocabulary — all in one place.
          </motion.p>

          {/* Prompt: No experience needed */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 text-xs sm:text-sm font-bold text-charcoal tracking-wide drop-shadow-xs"
          >
            No experience needed. Just explore and start learning.
          </motion.p>

          {/* 2 Buttons: Explore (scrolls directly to Daily Words) & Start Learning */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            {/* Button 1: Explore (Directly anchor to #daily-words) */}
            <a
              href="#daily-words"
              className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/60 hover:bg-white text-charcoal px-7 py-3 text-xs sm:text-sm font-semibold shadow-xs backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Explore</span>
            </a>

            {/* Button 2: Start Learning */}
            <Link
              to="/handwriting"
              className="inline-flex items-center justify-center rounded-full bg-cinnabar hover:bg-[#88271e] text-white px-7 py-3 text-xs sm:text-sm font-semibold shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Start Learning</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Daily Words Section (Directly after Landing Page for Guest) */}
      <DailyWordsSection
        dailyWords={dailyWords}
        loadingDaily={loadingDaily}
        onSelectWord={(word) => setSelectedWord(word)}
        onSaveWord={handleSaveWord}
        saveSuccessMsg={saveSuccessMsg}
      />

      {/* 3. Features Carousel Showcase Section (Directly below Daily Words) */}
      <FeaturesCarouselSection />

      {/* 4. Explore HSK Roadmap & Mini Challenge (Directly below Features Carousel) */}
      <HskExploreAndQuizSection />

      {/* 5. How It Works & FAQ (Directly below HSK Explore) */}
      <HowItWorksAndFaqSection />

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

