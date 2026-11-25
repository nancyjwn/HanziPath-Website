import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { flashcardService, savedCharacterService } from '../services/api'
import flashcardBg from '../assets/flashcard-bg.jpg'

// Floating Ambient Chinese Characters in Background (Minimalist Tian Zi Ge Tiles)
const FLOATING_CHARACTERS = [
  { char: '忆', pinyin: 'yì', top: '10%', left: '2%', duration: 10, delay: 0 },
  { char: '读', pinyin: 'dú', top: '12%', right: '14%', duration: 9, delay: 0.5, hideOnMobile: true },
  { char: '学', pinyin: 'xué', top: '48%', right: '2%', duration: 11, delay: 1.2 },
  { char: '念', pinyin: 'niàn', top: '75%', left: '2%', duration: 9.5, delay: 2 },
  { char: '通', pinyin: 'tōng', top: '85%', right: '2.5%', duration: 10.5, delay: 1.5 },
]

// HSK Levels data with representative Hanzi motif for oriental character cards
const HSK_LEVELS = [
  {
    level: 1,
    name: 'HSK 1',
    hanziMotif: '一',
    pinyinMotif: 'yī',
    vocabCount: 150,
    desc: 'Basic daily vocabulary & beginner sentence patterns',
    accent: '#B83A30',
  },
  {
    level: 2,
    name: 'HSK 2',
    hanziMotif: '见',
    pinyinMotif: 'jiàn',
    vocabCount: 147,
    desc: 'Simple communication & daily routine interactions',
    accent: '#9E2A2B',
  },
  {
    level: 3,
    name: 'HSK 3',
    hanziMotif: '学',
    pinyinMotif: 'xué',
    vocabCount: 300,
    desc: 'Conversations on studies, work, and social life',
    accent: '#84271F',
  },
  {
    level: 4,
    name: 'HSK 4',
    hanziMotif: '复',
    pinyinMotif: 'fù',
    vocabCount: 600,
    desc: 'Broader topic discussions & intermediate text comprehension',
    accent: '#6E1E17',
  },
  {
    level: 5,
    name: 'HSK 5',
    hanziMotif: '简',
    pinyinMotif: 'jiǎn',
    vocabCount: 1300,
    desc: 'Read newspapers, news articles & enjoy Chinese films',
    accent: '#5A1813',
  },
  {
    level: 6,
    name: 'HSK 6',
    hanziMotif: '博',
    pinyinMotif: 'bó',
    vocabCount: 2500,
    desc: 'Advanced fluency in oral expression & written works',
    accent: '#47120E',
  },
]

function ToastNotification({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-center rounded-2xl border border-charcoal/15 bg-[#292723] px-5 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md select-none pointer-events-none"
        >
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function FlashcardPage() {
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  // Setup State (Supports URL query ?level=X or route state)
  const [selectedLevel, setSelectedLevel] = useState(() => {
    const queryLvl = parseInt(searchParams.get('level') || location.state?.level, 10)
    if (queryLvl >= 1 && queryLvl <= 6) return queryLvl
    return 1
  })
  const [questionCount, setQuestionCount] = useState(10)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  // Active Quiz State
  const [activeSession, setActiveSession] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [answeredState, setAnsweredState] = useState(null) // null | { isCorrect, correctDisplay, correctNumbered, meanings, ... }
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [answersList, setAnswersList] = useState([])
  const [showExitModal, setShowExitModal] = useState(false)

  // Track saved character IDs & notifications
  const [savedEntries, setSavedEntries] = useState(new Set())
  const [savingId, setSavingId] = useState(null)
  const [toastNotice, setToastNotice] = useState(null)

  // Synchronize previously saved characters for logged-in user
  useEffect(() => {
    if (!isAuthenticated) {
      setSavedEntries(new Set())
      return
    }
    savedCharacterService
      .getSaved('', 1, 100)
      .then((res) => {
        if (res.data?.data) {
          const ids = new Set(res.data.data.map((c) => c.entry_id))
          setSavedEntries(ids)
        }
      })
      .catch(() => {})
  }, [isAuthenticated])

  // Progress State (Only loaded and cached when user is authenticated)
  const [progressData, setProgressData] = useState(() => {
    if (!isAuthenticated) return null
    try {
      const cached = localStorage.getItem('chinese_flashcard_progress') || localStorage.getItem('mandarin_flashcard_progress')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  // Summary State
  const [isFinished, setIsFinished] = useState(false)

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

  const fetchProgress = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await flashcardService.getProgress()
      if (res.data?.status === 'success') {
        setProgressData(res.data.data)
        try {
          localStorage.setItem('chinese_flashcard_progress', JSON.stringify(res.data.data))
          localStorage.setItem('mandarin_flashcard_progress', JSON.stringify(res.data.data))
        } catch {
          // ignore storage quota error
        }
      }
    } catch {
      // ignore silently
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setProgressData(null)
      try {
        localStorage.removeItem('chinese_flashcard_progress')
        localStorage.removeItem('mandarin_flashcard_progress')
      } catch {
        // ignore
      }
    } else {
      fetchProgress()
    }
  }, [isAuthenticated, fetchProgress])

  // Auto-synchronize level from URL query or skip completed levels if default Level 1 is done
  useEffect(() => {
    const queryLvl = parseInt(searchParams.get('level') || location.state?.level, 10)
    if (queryLvl >= 1 && queryLvl <= 6) {
      setSelectedLevel(queryLvl)
      return
    }

    if (isAuthenticated && progressData?.levels && Array.isArray(progressData.levels)) {
      const isLvlDone = (l) => {
        const pct = l.percentage ?? 0
        const studied = l.studied_count ?? 0
        const total = l.total_words || 150
        return pct >= 100 || (studied > 0 && studied >= total)
      }

      // If currently selected level is already 100% finished, skip to next incomplete level
      const currentStat = progressData.levels.find((l) => l.level === selectedLevel)
      if (currentStat && isLvlDone(currentStat)) {
        const nextIncomplete = progressData.levels.find((l) => !isLvlDone(l))
        if (nextIncomplete) {
          setSelectedLevel(nextIncomplete.level)
        }
      }
    }
  }, [searchParams, location.state, progressData, isAuthenticated, selectedLevel])

  // Prevent accidental navigation during active quiz
  useEffect(() => {
    if (!activeSession || isFinished) return

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = 'Quiz in progress. You have not finished all questions.'
      return e.returnValue
    }

    window.history.pushState({ inQuiz: true }, '', window.location.href)

    const handlePopState = () => {
      window.history.pushState({ inQuiz: true }, '', window.location.href)
      setShowExitModal(true)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [activeSession, isFinished])

  const handleStartQuiz = async () => {
    if (!isAuthenticated) return
    setError('')
    setStarting(true)
    try {
      const res = await flashcardService.createSession(selectedLevel, questionCount)
      if (res.data?.status === 'success') {
        const sessionData = res.data.data
        setActiveSession(sessionData)
        setCurrentIndex(0)
        setSelectedOption(null)
        setAnsweredState(null)
        setAnswersList([])
        setIsFinished(false)
      } else {
        setError(res.data?.message || 'Failed to start quiz session.')
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'An error occurred while creating the quiz session.'
      )
    } finally {
      setStarting(false)
    }
  }

  const handleSelectOption = useCallback(
    async (option) => {
      if (submittingAnswer || answeredState || !activeSession) return

      const currentQuestion = activeSession.questions[currentIndex]
      const sessionId = activeSession.session_id || activeSession.id
      const questionId = currentQuestion.question_id || currentQuestion.id
      const chosenValue = option.pinyin || option.value || option.label || option

      setSelectedOption(chosenValue)
      setSubmittingAnswer(true)
      setError('')

      try {
        const res = await flashcardService.submitAnswer(
          sessionId,
          questionId,
          chosenValue
        )

        if (res.data?.status === 'success') {
          const data = res.data.data
          const isCorrect = data.benar !== undefined ? data.benar : data.is_correct
          const resultInfo = {
            isCorrect: !!isCorrect,
            correctDisplay: data.jawaban_benar || data.pinyin_display || '',
            correctNumbered: data.pinyin_numbered || '',
            meanings: data.meanings || [],
            userAnswer: chosenValue,
            selectedOption: option,
            simplified: currentQuestion.simplified,
            traditional: currentQuestion.traditional,
            questionId: questionId,
            entryId: data.entry_id || currentQuestion.entry_id || currentQuestion.entryId || data.entryId,
          }
          setAnsweredState(resultInfo)
          setAnswersList((prev) => [...prev, resultInfo])

          // Pronounce character upon answer reveal for auditory reinforcement
          handlePlayAudio(currentQuestion.simplified)
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to submit answer.')
      } finally {
        setSubmittingAnswer(false)
      }
    },
    [submittingAnswer, answeredState, activeSession, currentIndex, handlePlayAudio]
  )

  const handleNextQuestion = useCallback(() => {
    if (!activeSession) return
    if (currentIndex + 1 < activeSession.questions.length) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setAnsweredState(null)
      setError('')
    } else {
      setIsFinished(true)
      fetchProgress()
    }
  }, [activeSession, currentIndex, fetchProgress])

  const handleSaveCharacter = async (entryId) => {
    if (!entryId) return
    if (!isAuthenticated) {
      setToastNotice('Please sign in to save characters to your profile.')
      setTimeout(() => setToastNotice(null), 3000)
      return
    }

    setSavingId(entryId)
    try {
      await savedCharacterService.saveCharacter(entryId, 'flashcard')
      setSavedEntries((prev) => new Set([...prev, entryId]))
      setToastNotice('Vocabulary saved to your profile!')
      setTimeout(() => setToastNotice(null), 2500)
    } catch (err) {
      const isAlready =
        err.response?.status === 409 ||
        err.response?.data?.message?.toLowerCase().includes('sudah') ||
        err.response?.data?.message?.toLowerCase().includes('already')

      if (isAlready) {
        setSavedEntries((prev) => new Set([...prev, entryId]))
        setToastNotice('This vocabulary is already saved in your profile.')
      } else {
        setToastNotice(err.response?.data?.message || 'Failed to save vocabulary.')
      }
      setTimeout(() => setToastNotice(null), 2500)
    } finally {
      setSavingId(null)
    }
  }

  const resetQuiz = () => {
    setActiveSession(null)
    setIsFinished(false)
    setCurrentIndex(0)
    setSelectedOption(null)
    setAnsweredState(null)
    setAnswersList([])
    setError('')
    setShowExitModal(false)
    fetchProgress()
  }

  // Keyboard navigation for active quiz (1/2/3/4 or A/B/C/D to choose, Space/Enter to advance)
  useEffect(() => {
    if (!activeSession || isFinished || showExitModal) return

    const handleKeyDown = (e) => {
      // If modal or form is open, ignore
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const currentQ = activeSession.questions?.[currentIndex]
      const options = currentQ?.options || []

      // If answered already, Enter or Space advances
      if (answeredState) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleNextQuestion()
        } else if (e.key.toLowerCase() === 'l' || e.key.toLowerCase() === 'r') {
          e.preventDefault()
          handlePlayAudio(currentQ?.simplified)
        }
        return
      }

      // If answering question: keys 1-4 or a-d
      const key = e.key.toLowerCase()
      let optionIdx = -1
      if (['1', 'a'].includes(key)) optionIdx = 0
      else if (['2', 'b'].includes(key)) optionIdx = 1
      else if (['3', 'c'].includes(key)) optionIdx = 2
      else if (['4', 'd'].includes(key)) optionIdx = 3

      if (optionIdx >= 0 && optionIdx < options.length) {
        e.preventDefault()
        handleSelectOption(options[optionIdx])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    activeSession,
    isFinished,
    showExitModal,
    currentIndex,
    answeredState,
    handleSelectOption,
    handleNextQuestion,
    handlePlayAudio,
  ])

  // =========================================================================
  // VIEW 1: FINISHED / SUMMARY EXAMINATION SCREEN
  // =========================================================================
  if (isFinished) {
    const total = answersList.length
    const correct = answersList.filter((a) => a.isCorrect).length
    const incorrect = total - correct
    const scorePct = total > 0 ? Math.round((correct / total) * 100) : 0

    return (
      <div className="relative min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8">
        <ToastNotification message={toastNotice} />
        {/* Background Texture (Base #F6F0E5 + Tian Zi Ge Grid + Crumpled Paper + Floating Practice Tiles) */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#F6F0E5] select-none">
          {/* Subtle Manuscript Paper Grid Lines */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#292723_1px,transparent_1px),linear-gradient(to_bottom,#292723_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.03]" />

          {/* Crumpled Paper Texture Pasted on Top of #F6F0E5 (Softened & Lowered Opacity) */}
          <img
            src={flashcardBg}
            alt="Crumpled Xuan Paper Texture"
            className="h-full w-full object-cover object-center mix-blend-multiply opacity-60 contrast-105 blur-[1px]"
          />

          {/* Floating Ambient Tian Zi Ge (田字格) Character Tiles */}
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
                opacity: [0.24, 0.40, 0.24],
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: item.delay,
              }}
              className={`pointer-events-none absolute flex-col items-center select-none ${
                item.hideOnMobile ? 'hidden md:flex' : 'flex'
              }`}
            >
              {/* Tian Zi Ge (田字格) Practice Tile with Rounded Dashed Border & Crosshairs */}
              <div className="relative flex size-28 sm:size-36 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D4C8B8]/60 bg-[#FAF8F5]/30 shadow-[0_2px_12px_rgba(41,39,35,0.02)] backdrop-blur-[0.5px]">
                {/* Dashed Horizontal & Vertical Crosshairs */}
                <div className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 border-t border-dashed border-[#D4C8B8]/35" />
                <div className="pointer-events-none absolute inset-y-3 left-1/2 -translate-x-1/2 border-l border-dashed border-[#D4C8B8]/35" />

                {/* Hanzi Character (Larger & Soft Faded Ink) */}
                <span className="relative z-10 font-serif text-5xl sm:text-6xl font-normal text-charcoal/30 leading-none">
                  {item.char}
                </span>
                {/* Pinyin */}
                <span className="relative z-10 text-[11px] sm:text-xs font-mono tracking-widest text-charcoal/25 uppercase mt-2 leading-none">
                  {item.pinyin}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-auto max-w-3xl overflow-hidden rounded-3xl border border-[#E7DFD3] bg-paper/95 p-6 sm:p-10 shadow-xl backdrop-blur-xs"
        >
          {/* Header Seal & Trophy Stamp */}
          <div className="text-center">
            <div className="mx-auto inline-flex items-center rounded-full border border-cinnabar/30 bg-cinnabar/[0.06] px-3.5 py-1 text-[11px] font-bold tracking-widest text-cinnabar uppercase">
              <span>成绩单 · FLASHCARD EVALUATION RESULTS</span>
            </div>

            <h1 className="mt-4 font-serif text-3xl sm:text-4xl font-medium text-charcoal">
              HSK Practice Session Completed!
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-charcoal/60">
              Your Leitner Box algorithm progress has been updated automatically.
            </p>
          </div>

          {/* Score Badge Circle */}
          <div className="my-8 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: 0.15,
              }}
              className={`relative flex size-36 items-center justify-center rounded-full border-4 shadow-inner ${
                scorePct >= 70
                  ? 'border-emerald-600/30 bg-emerald-500/[0.07] text-emerald-800'
                  : 'border-cinnabar/30 bg-cinnabar/[0.07] text-cinnabar'
              }`}
            >
              <div className="text-center">
                <span className="font-serif text-4xl sm:text-5xl font-black tracking-tight">
                  {scorePct}%
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-wider opacity-75">
                  {scorePct >= 80 ? 'Excellent' : scorePct >= 60 ? 'Good' : 'Needs Practice'}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-[#E7DFD3] bg-[#FAF8F5]/80 p-4 text-center">
            <div className="border-r border-[#E7DFD3]/80 pr-2">
              <span className="text-[10px] font-bold tracking-wider text-charcoal/50 uppercase">
                TOTAL QUESTIONS
              </span>
              <p className="mt-1 font-serif text-xl sm:text-2xl font-bold text-charcoal">
                {total}
              </p>
            </div>
            <div className="border-r border-[#E7DFD3]/80 px-2">
              <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                CORRECT ANSWERS
              </span>
              <p className="mt-1 font-serif text-xl sm:text-2xl font-bold text-emerald-700">
                {correct}
              </p>
            </div>
            <div className="pl-2">
              <span className="text-[10px] font-bold tracking-wider text-cinnabar uppercase">
                NEEDS REVIEW
              </span>
              <p className="mt-1 font-serif text-xl sm:text-2xl font-bold text-cinnabar">
                {incorrect}
              </p>
            </div>
          </div>

          {/* Missed Characters Section */}
          {incorrect > 0 && (
            <div className="mt-8">
              <div className="flex items-center mb-3">
                <h3 className="text-xs font-bold tracking-wider text-charcoal/70 uppercase">
                  Vocabulary to Review ({incorrect}):
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {answersList
                  .filter((a) => !a.isCorrect)
                  .map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      className="flex items-center justify-between rounded-xl border border-[#E7DFD3] bg-white/70 p-3 shadow-2xs hover:border-cinnabar/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => handlePlayAudio(item.simplified, e)}
                          title="Listen to pronunciation"
                          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#E7DFD3] bg-[#FAF8F5] text-charcoal/70 hover:bg-cinnabar hover:text-white transition-colors cursor-pointer"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                          </svg>
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-xl font-bold text-charcoal">
                              {item.simplified}
                            </span>
                            <span className="text-xs font-bold text-cinnabar">
                              {item.correctDisplay}
                            </span>
                          </div>
                          <p className="text-[11px] text-charcoal/60 truncate">
                            {item.meanings?.join(', ') || 'No definition available'}
                          </p>
                        </div>
                      </div>

                      {item.entryId && (
                        <motion.button
                          type="button"
                          whileHover={savedEntries.has(item.entryId) ? {} : { scale: 1.04 }}
                          whileTap={savedEntries.has(item.entryId) ? {} : { scale: 0.96 }}
                          disabled={savingId === item.entryId || savedEntries.has(item.entryId)}
                          onClick={() => handleSaveCharacter(item.entryId)}
                          className={`shrink-0 ml-2 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                            savedEntries.has(item.entryId)
                              ? 'border border-emerald-600/30 bg-emerald-500/15 text-emerald-800 cursor-default'
                              : 'border border-cinnabar/30 bg-cinnabar/5 text-cinnabar hover:bg-cinnabar hover:text-white'
                          }`}
                        >
                          {savingId === item.entryId
                            ? 'Saving...'
                            : savedEntries.has(item.entryId)
                            ? '✓ Saved'
                            : '+ Save'}
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              type="button"
              onClick={resetQuiz}
              whileHover={{
                scale: 1.04,
                y: -2,
                boxShadow: '0 10px 25px -5px rgba(158, 42, 43, 0.4)',
              }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-cinnabar px-8 py-3 text-xs font-bold text-white shadow-md cursor-pointer select-none"
            >
              <span>Back</span>
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/profile"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-[#E7DFD3] bg-[#FAF8F5] px-7 py-3 text-xs font-bold text-charcoal hover:bg-[#EDE5D8] transition-colors cursor-pointer select-none"
              >
                <span>View Profile Stats</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: ACTIVE QUIZ SCHOLAR IMMERSION VIEW
  // =========================================================================
  if (activeSession) {
    const currentQ = activeSession.questions[currentIndex]
    const totalQ = activeSession.questions.length
    const progressPercent = ((currentIndex + 1) / totalQ) * 100

    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#F6F0E5] text-charcoal overflow-y-auto">
        <ToastNotification message={toastNotice} />
        {/* Background Texture (Base #F6F0E5 + Tian Zi Ge Grid + Crumpled Paper + Floating Practice Tiles) */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#F6F0E5] select-none">
          {/* Subtle Manuscript Paper Grid Lines */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#292723_1px,transparent_1px),linear-gradient(to_bottom,#292723_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.03]" />

          <img
            src={flashcardBg}
            alt="Crumpled Paper Texture"
            className="h-full w-full object-cover object-center mix-blend-multiply opacity-60 contrast-105 blur-[1px]"
          />

          {/* Floating Ambient Tian Zi Ge (田字格) Character Tiles */}
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
                opacity: [0.24, 0.40, 0.24],
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: item.delay,
              }}
              className={`pointer-events-none absolute flex-col items-center select-none ${
                item.hideOnMobile ? 'hidden md:flex' : 'flex'
              }`}
            >
              {/* Tian Zi Ge (田字格) Practice Tile with Rounded Dashed Border & Crosshairs */}
              <div className="relative flex size-28 sm:size-36 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D4C8B8]/60 bg-[#FAF8F5]/30 shadow-[0_2px_12px_rgba(41,39,35,0.02)] backdrop-blur-[0.5px]">
                {/* Dashed Horizontal & Vertical Crosshairs */}
                <div className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 border-t border-dashed border-[#D4C8B8]/35" />
                <div className="pointer-events-none absolute inset-y-3 left-1/2 -translate-x-1/2 border-l border-dashed border-[#D4C8B8]/35" />

                {/* Hanzi Character (Larger & Soft Faded Ink) */}
                <span className="relative z-10 font-serif text-5xl sm:text-6xl font-normal text-charcoal/30 leading-none">
                  {item.char}
                </span>
                {/* Pinyin */}
                <span className="relative z-10 text-[11px] sm:text-xs font-mono tracking-widest text-charcoal/25 uppercase mt-2 leading-none">
                  {item.pinyin}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 border-b border-[#E7DFD3] bg-paper/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
            {/* Left Seal & Title */}
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-cinnabar font-serif text-lg font-bold text-white shadow-xs">
                文
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-tight text-charcoal">
                    HSK {activeSession.level} Flashcard
                  </span>
                  <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                    In Progress
                  </span>
                </div>
                <p className="text-[11px] text-charcoal/50">
                  Question {currentIndex + 1} of {totalQ}
                </p>
              </div>
            </div>

            {/* Right Action: Quit Confirmation */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitModal(true)}
                className="rounded-lg border border-[#E7DFD3] bg-[#FAF8F5] px-3 py-1.5 text-xs font-medium text-charcoal/70 hover:border-cinnabar/40 hover:text-cinnabar transition-colors cursor-pointer"
                title="Quit quiz session"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Animated Smooth Progress Track */}
          <div className="h-1.5 w-full bg-[#E7DFD3]/60">
            <motion.div
              className="h-full bg-cinnabar"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </header>

        {/* Main Quiz Viewport */}
        <main className="flex-1 px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-xl">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 rounded-xl border border-cinnabar/30 bg-cinnabar/10 p-3.5 text-xs font-medium text-cinnabar"
              >
                {error}
              </motion.div>
            )}

            {/* Question Showcase Card with Tian Zi Ge (田字格) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-3xl border border-[#E7DFD3] bg-paper p-6 sm:p-8 shadow-sm text-center relative overflow-hidden"
              >
                {/* Traditional Corner Framing Elements */}
                <span className="absolute top-3 left-3 text-xs text-cinnabar/30 select-none font-mono">⌜</span>
                <span className="absolute top-3 right-3 text-xs text-cinnabar/30 select-none font-mono">⌝</span>
                <span className="absolute bottom-3 left-3 text-xs text-cinnabar/30 select-none font-mono">⌞</span>
                <span className="absolute bottom-3 right-3 text-xs text-cinnabar/30 select-none font-mono">⌟</span>

                <div className="flex items-center justify-between text-[11px] font-bold text-charcoal/50 tracking-widest uppercase mb-4">
                  <span>GUESS PINYIN & TONE</span>
                  <span>HSK LEVEL {activeSession.level}</span>
                </div>

                {/* Tian Zi Ge Character Showcase Tile - Subtle Authentic Scholar Grid (1, 2, 3+ Characters) */}
                {(() => {
                  const chars = Array.from(currentQ.simplified || '')
                  const charLength = chars.length || 1

                  let cellClass = ''
                  let fontClasses = ''

                  if (charLength === 1) {
                    // 1 character: Classic Tian Zi Ge square tile (e.g. 穿)
                    cellClass = 'size-32 sm:size-36'
                    fontClasses = 'text-5xl sm:text-6xl'
                  } else if (charLength === 2) {
                    // 2 characters: Two compact square-ish cells side-by-side
                    cellClass = 'size-24 sm:size-28'
                    fontClasses = 'text-4xl sm:text-5xl'
                  } else if (charLength === 3) {
                    // 3 characters: Three proportionate cells side-by-side
                    cellClass = 'w-20 sm:w-24 h-22 sm:h-26'
                    fontClasses = 'text-3xl sm:text-4xl'
                  } else if (charLength === 4) {
                    // 4 characters: Four compact cells side-by-side (e.g. 公共汽车)
                    cellClass = 'w-18 sm:w-22 h-22 sm:h-26'
                    fontClasses = 'text-2xl sm:text-3xl'
                  } else {
                    // 5+ characters
                    cellClass = 'w-16 sm:w-20 h-20 sm:h-24'
                    fontClasses = 'text-xl sm:text-2xl'
                  }

                  return (
                    <div className="flex justify-center my-3">
                      <div className="relative inline-flex items-center justify-center rounded-2xl border-2 border-cinnabar/25 bg-[#FAF8F5] shadow-inner overflow-hidden transition-all duration-300">
                        {chars.map((char, idx) => (
                          <div
                            key={idx}
                            className={`relative flex ${cellClass} items-center justify-center select-none ${
                              idx > 0 ? 'border-l border-dashed border-[#292723]/15' : ''
                            }`}
                          >
                            {/* Subtle Gray Horizontal Dashed Guideline */}
                            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-[#292723]/15" />
                            {/* Subtle Gray Vertical Dashed Guideline */}
                            <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-[#292723]/15" />

                            {/* Character */}
                            <span
                              className={`relative z-10 font-serif ${fontClasses} font-medium text-charcoal leading-none`}
                            >
                              {char}
                            </span>
                          </div>
                        ))}

                        {/* Audio button floating in bottom-right corner of tile */}
                        <button
                          type="button"
                          onClick={(e) => handlePlayAudio(currentQ.simplified, e)}
                          className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 z-20 flex size-6 sm:size-7 items-center justify-center rounded-full border border-[#E7DFD3] bg-white/90 text-charcoal/60 hover:bg-cinnabar hover:text-white transition-all shadow-2xs cursor-pointer active:scale-95"
                          title="Listen to pronunciation (Press L)"
                          aria-label={`Listen to pronunciation of ${currentQ.simplified}`}
                        >
                          <svg className="size-3 sm:size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {/* Traditional Hanzi subtext if different */}
                {currentQ.traditional && currentQ.traditional !== currentQ.simplified && (
                  <p className="mt-1 text-xs text-charcoal/50">
                    Traditional Character:{' '}
                    <span className="font-serif text-sm font-semibold text-charcoal/80">
                      {currentQ.traditional}
                    </span>
                  </p>
                )}

                <p className="mt-4 text-xs text-charcoal/60">
                  Select the most accurate Pinyin pronunciation:
                </p>

                {/* Multiple-Choice Options Grid */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {(currentQ.options && currentQ.options.length > 0
                    ? currentQ.options
                    : [
                        { label: `${currentQ.simplified} 1`, value: `${currentQ.simplified} 1` },
                        { label: `${currentQ.simplified} 2`, value: `${currentQ.simplified} 2` },
                        { label: `${currentQ.simplified} 3`, value: `${currentQ.simplified} 3` },
                        { label: `${currentQ.simplified} 4`, value: `${currentQ.simplified} 4` },
                      ]
                  ).map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx) // A, B, C, D
                    const optValue = opt.pinyin || opt.value || opt.label || opt
                    const optLabel = opt.label || optValue
                    const isSelected = selectedOption === optValue

                    let containerStyle =
                      'border-[#E7DFD3] bg-[#FAF8F5] text-charcoal hover:border-cinnabar hover:bg-white hover:shadow-xs'
                    let badgeStyle = 'bg-[#EDE5D8] text-charcoal/80'
                    let icon = null

                    if (answeredState) {
                      const isCorrectOption =
                        optValue === answeredState.correctDisplay ||
                        optLabel.startsWith(answeredState.correctDisplay) ||
                        (answeredState.isCorrect && isSelected)

                      if (isSelected) {
                        if (answeredState.isCorrect) {
                          containerStyle =
                            'border-emerald-600 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/20'
                          badgeStyle = 'bg-white/20 text-white'
                          icon = '✓'
                        } else {
                          containerStyle =
                            'border-cinnabar bg-cinnabar text-white shadow-md ring-2 ring-cinnabar/20'
                          badgeStyle = 'bg-white/20 text-white'
                          icon = '✕'
                        }
                      } else if (isCorrectOption) {
                        containerStyle =
                          'border-emerald-600 bg-emerald-500/10 text-emerald-900 font-bold ring-2 ring-emerald-500/30'
                        badgeStyle = 'bg-emerald-600 text-white'
                        icon = '✓'
                      } else {
                        containerStyle =
                          'border-[#E7DFD3]/60 bg-gray-50/50 text-charcoal/30 opacity-50 cursor-not-allowed'
                        badgeStyle = 'bg-gray-200 text-gray-400'
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        type="button"
                        whileHover={!answeredState && !submittingAnswer ? { y: -2 } : {}}
                        whileTap={!answeredState && !submittingAnswer ? { scale: 0.98 } : {}}
                        onClick={() => handleSelectOption(opt)}
                        disabled={!!answeredState || submittingAnswer}
                        className={`group relative flex items-center justify-between rounded-2xl border p-3.5 transition-all duration-150 cursor-pointer disabled:cursor-default ${containerStyle}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${badgeStyle}`}
                          >
                            {letter}
                          </span>
                          <span className="font-medium text-sm sm:text-base tracking-wide truncate">
                            {optLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-[10px] font-mono text-charcoal/35 group-hover:text-charcoal/60">
                            [{idx + 1}]
                          </span>
                          {icon && (
                            <span className="text-sm font-bold ml-1">{icon}</span>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {submittingAnswer && (
                  <p className="mt-4 text-xs font-medium text-cinnabar animate-pulse">
                    Checking answer...
                  </p>
                )}

                {/* Answer Feedback & Spaced Repetition Meaning Box */}
                {answeredState && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-6 rounded-2xl border border-[#E7DFD3] bg-[#FAF8F5] p-4 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider ${
                          answeredState.isCorrect
                            ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-600/30'
                            : 'bg-rose-500/15 text-rose-800 border border-rose-600/30'
                        }`}
                      >
                        <span>
                          {answeredState.isCorrect
                            ? '✓ Correct!'
                            : '✕ Incorrect Answer'}
                        </span>
                      </div>

                      {answeredState.entryId && (
                        <div className="flex items-center gap-2">
                          <motion.button
                            type="button"
                            whileHover={savedEntries.has(answeredState.entryId) ? {} : { scale: 1.03 }}
                            whileTap={savedEntries.has(answeredState.entryId) ? {} : { scale: 0.97 }}
                            disabled={savingId === answeredState.entryId || savedEntries.has(answeredState.entryId)}
                            onClick={() => handleSaveCharacter(answeredState.entryId)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                              savedEntries.has(answeredState.entryId)
                                ? 'border border-emerald-600/30 bg-emerald-500/15 text-emerald-800 cursor-default'
                                : 'border border-cinnabar/30 bg-cinnabar/5 text-cinnabar hover:bg-cinnabar hover:text-white'
                            }`}
                          >
                            {savingId === answeredState.entryId
                              ? 'Saving...'
                              : savedEntries.has(answeredState.entryId)
                              ? '✓ Saved to Profile'
                              : '+ Save to Profile'}
                          </motion.button>
                        </div>
                      )}
                    </div>

                    {/* Correct Details */}
                    <div className="mt-3 pt-3 border-t border-[#E7DFD3]/80">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-charcoal/60">Correct Pronunciation:</span>
                        <span className="font-serif text-lg font-bold text-cinnabar">
                          {answeredState.correctDisplay}
                        </span>
                        {answeredState.correctNumbered && (
                          <span className="text-xs font-mono text-charcoal/50">
                            ({answeredState.correctNumbered})
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handlePlayAudio(answeredState.simplified, e)}
                          title="Listen to pronunciation"
                          className="flex size-6 items-center justify-center rounded-full bg-white text-charcoal/60 hover:text-cinnabar border border-[#E7DFD3] cursor-pointer"
                        >
                          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                          </svg>
                        </button>
                      </div>

                      {/* Definitions (Horizontal flow without bullet dots) */}
                      {answeredState.meanings?.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal/80">
                          <span className="font-semibold text-charcoal/60">Meaning:</span>
                          {answeredState.meanings.map((meaning, mIdx) => (
                            <span key={mIdx} className="inline-flex items-center">
                              {meaning}{mIdx < answeredState.meanings.length - 1 ? ';' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Next Action Button */}
                    <div className="mt-5 flex items-center justify-end gap-3 pt-2">
                      <span className="hidden sm:inline-block text-[11px] text-charcoal/40 font-mono">
                        Press Enter ↵
                      </span>
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        autoFocus
                        className="inline-flex items-center gap-2 rounded-xl bg-cinnabar px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#84271f] transition cursor-pointer active:scale-[0.98]"
                      >
                        <span>
                          {currentIndex + 1 < totalQ
                            ? 'Next Question'
                            : 'View Quiz Summary'}
                        </span>
                        <span>→</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Exit Confirmation Dialog */}
        <AnimatePresence>
          {showExitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md rounded-3xl border border-[#E7DFD3] bg-paper p-6 sm:p-8 shadow-2xl text-center"
              >
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/15 text-2xl font-bold text-amber-700">
                  ⚠️
                </div>
                <h2 className="mt-4 font-serif text-2xl font-bold text-charcoal">
                  Quit Quiz Session?
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-charcoal/65 leading-relaxed">
                  You are on question <strong className="text-cinnabar">{currentIndex + 1}</strong> of{' '}
                  <strong>{totalQ}</strong>. If you exit now, this session's progress will not be fully saved.
                </p>

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExitModal(false)
                      resetQuiz()
                    }}
                    className="rounded-xl border border-[#E7DFD3] bg-[#FAF8F5] px-5 py-2.5 text-xs font-bold text-charcoal/70 hover:bg-[#EDE5D8] transition cursor-pointer"
                  >
                    Yes, Quit & Exit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExitModal(false)}
                    className="rounded-xl bg-cinnabar px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#84271f] transition cursor-pointer"
                  >
                    Continue Quiz →
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // =========================================================================
  // VIEW 3: SELECTION & SETUP DASHBOARD SCREEN
  // =========================================================================
  const selectedLvlStat = isAuthenticated
    ? progressData?.levels?.find((l) => l.level === selectedLevel)
    : null
  const selectedLvlTotal =
    selectedLvlStat?.total_words ||
    HSK_LEVELS.find((h) => h.level === selectedLevel)?.vocabCount ||
    150
  const selectedLvlStudied = isAuthenticated ? (selectedLvlStat?.studied_count || 0) : 0
  const selectedLvlRemaining = isAuthenticated
    ? (selectedLvlStat?.remaining_count !== undefined
        ? selectedLvlStat.remaining_count
        : Math.max(0, selectedLvlTotal - selectedLvlStudied))
    : selectedLvlTotal

  return (
    <div className="relative min-h-[85vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ToastNotification message={toastNotice} />
      {/* Background Texture (Base #F6F0E5 + Tian Zi Ge Grid + Crumpled Paper + Floating Practice Tiles) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#F6F0E5] select-none">
        {/* Subtle Manuscript Paper Grid Lines */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#292723_1px,transparent_1px),linear-gradient(to_bottom,#292723_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.03]" />

        {/* Crumpled Paper Texture Pasted on Top of #F6F0E5 (Softened & Lowered Opacity) */}
        <img
          src={flashcardBg}
          alt="Ambient Crumpled Paper Texture"
          className="h-full w-full object-cover object-center mix-blend-multiply opacity-60 contrast-105 blur-[1px]"
        />

        {/* Floating Ambient Tian Zi Ge (田字格) Character Tiles */}
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
              opacity: [0.24, 0.40, 0.24],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay,
            }}
            className={`pointer-events-none absolute flex-col items-center select-none ${
              item.hideOnMobile ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Tian Zi Ge (田字格) Practice Tile with Rounded Dashed Border & Crosshairs */}
            <div className="relative flex size-28 sm:size-36 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#D4C8B8]/60 bg-[#FAF8F5]/30 shadow-[0_2px_12px_rgba(41,39,35,0.02)] backdrop-blur-[0.5px]">
              {/* Dashed Horizontal & Vertical Crosshairs */}
              <div className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 border-t border-dashed border-[#D4C8B8]/35" />
              <div className="pointer-events-none absolute inset-y-3 left-1/2 -translate-x-1/2 border-l border-dashed border-[#D4C8B8]/35" />

              {/* Hanzi Character (Larger & Soft Faded Ink) */}
              <span className="relative z-10 font-serif text-5xl sm:text-6xl font-normal text-charcoal/30 leading-none">
                {item.char}
              </span>
              {/* Pinyin */}
              <span className="relative z-10 text-[11px] sm:text-xs font-mono tracking-widest text-charcoal/25 uppercase mt-2 leading-none">
                {item.pinyin}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Foreground Content (z-10 to stay strictly above the z-0 background) */}
      <div className="relative z-10">
        {/* Artisanal Scholar Header (Unboxed, Tangible Mini Flashcards Fan & Brush Underline) */}
        <div className="relative mb-12 pb-8 border-b border-[#E7DFD3]/80">
        {/* Subtle Floating Watermark Character in Header Background */}
        <span className="pointer-events-none absolute -left-4 -top-8 font-serif text-[110px] sm:text-[140px] font-bold text-charcoal/[0.025] select-none leading-none">
          知
        </span>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          {/* Left Side: Traditional Rubric Stamp, Title with Interactive Floating Miniature Flashcards */}
          <div className="max-w-2xl text-left">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-3 mb-3"
            >
              {/* Interactive Vermilion Seal Stamp with Spring Touch */}
              <motion.button
                type="button"
                whileHover={{ rotate: 10, scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className="flex size-7 items-center justify-center rounded-[2px] bg-cinnabar text-white font-serif text-xs font-bold shadow-xs cursor-pointer select-none transition-transform"
                title="HSK Flashcard System"
                aria-label="HSK Flashcard Seal"
              >
                卡
              </motion.button>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xs font-bold text-cinnabar tracking-wider">
                  温故知新
                </span>
                <span className="text-[10px] text-charcoal/30 font-mono">/</span>
                <span className="text-[11px] font-sans font-medium tracking-widest text-charcoal/60 uppercase">
                  LEITNER SPACED REPETITION
                </span>
              </div>
            </motion.div>

            {/* Title Row with Animated Calligraphic Brush Underline & Interactive Mini Flashcards */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-charcoal leading-none select-none"
              >
                HSK{' '}
                <span className="relative inline-block">
                  <span className="italic font-serif text-cinnabar">Flashcards</span>
                  {/* Dynamic Hand-Drawn Calligraphic Brush Underline */}
                  <svg
                    className="absolute -bottom-2.5 left-0 w-full h-3.5 text-cinnabar/80 pointer-events-none overflow-visible"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <motion.path
                      d="M2 8.5C45 4 125 3.5 198 7.5C155 11 75 10.5 8 9"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.85 }}
                      transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
                    />
                  </svg>
                </span>
              </motion.h1>

              {/* Tangible Miniature Flashcard Fan (Interactive: Click to Hear Audio / Hover to Lift) */}
              <div className="flex items-center -space-x-2 py-1">
                {[
                  { char: '学', pinyin: 'xué', deg: '-6deg', mean: 'Learn' },
                  { char: '习', pinyin: 'xí', deg: '0deg', mean: 'Practice' },
                  { char: '通', pinyin: 'tōng', deg: '6deg', mean: 'Master' },
                ].map((c, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    onClick={() => handlePlayAudio(c.char)}
                    initial={{ opacity: 0, scale: 0.8, rotate: c.deg }}
                    animate={{ opacity: 1, scale: 1, rotate: c.deg }}
                    whileHover={{ y: -8, rotate: 0, scale: 1.15, zIndex: 30 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="group relative flex flex-col items-center justify-center size-11 sm:size-12 rounded-xl border border-[#E7DFD3] bg-paper shadow-2xs cursor-pointer select-none transition-shadow hover:shadow-md hover:border-cinnabar/40"
                    title={`Click to listen: ${c.char} (${c.pinyin}) · ${c.mean}`}
                    aria-label={`Listen to character ${c.char}`}
                  >
                    <span className="font-serif text-sm sm:text-base font-bold text-charcoal group-hover:text-cinnabar transition-colors leading-none">
                      {c.char}
                    </span>
                    <span className="text-[8px] font-mono text-cinnabar/80 leading-none mt-0.5">
                      {c.pinyin}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Subtitle - Short & Concise */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-3 text-xs sm:text-sm text-charcoal/65 font-normal leading-relaxed max-w-xl"
            >
              Adaptive HSK 1–6 vocabulary practice for long-term memory retention.
            </motion.p>
          </div>

          {/* Right Side: Unboxed Milestone Progress Meter */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="w-full lg:w-88 shrink-0 text-left"
          >
            {/* Top Stat Row */}
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs font-medium text-charcoal/60">
                Vocabulary Mastery
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-2xl font-bold text-charcoal tracking-tight">
                  {isAuthenticated ? (progressData?.overall?.studied_count ?? 0) : 0}
                </span>
                <span className="text-xs font-mono text-charcoal/40">
                  / {progressData?.overall?.total_words ?? 4991} words
                </span>
              </div>
            </div>

            {/* Sliding Progress Bar with Brush/Ink Gradient */}
            <div className="relative h-2 w-full rounded-full bg-[#EDE5D8] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-charcoal via-[#55524C] to-cinnabar"
                initial={{ width: 0 }}
                animate={{
                  width: `${isAuthenticated ? (progressData?.overall?.percentage ?? 0) : 0}%`,
                }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {/* Bottom Status indicator */}
            <div className="mt-3 flex items-center justify-between border-t border-[#E7DFD3]/60 pt-2.5">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${isAuthenticated ? 'bg-cinnabar animate-pulse' : 'bg-charcoal/35'}`} />
                <span className="font-sans text-xs sm:text-sm font-medium text-charcoal/80">
                  {isAuthenticated
                    ? `${progressData?.overall?.percentage ?? 0}% Completed`
                    : '0% Completed'}
                </span>
              </div>
              {!isAuthenticated && (
                <span className="font-sans text-xs sm:text-sm font-medium text-charcoal/60">
                  Guest Mode
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-cinnabar/30 bg-cinnabar/10 p-4 text-xs font-medium text-cinnabar">
          {error}
        </div>
      )}

      {/* Main 2-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (8 cols): Level Selector Cards */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-wider text-charcoal/60 uppercase">
              SELECT TARGET HSK LEVEL:
            </span>
            <span className="text-xs text-charcoal/45">
              HSK 1 - 6 Standard Curriculum
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HSK_LEVELS.map((item, idx) => {
              const lvlStat = isAuthenticated
                ? progressData?.levels?.find((l) => l.level === item.level)
                : null
              const total = lvlStat?.total_words || item.vocabCount
              const studied = isAuthenticated ? (lvlStat?.studied_count || 0) : 0
              const remaining = isAuthenticated
                ? (lvlStat?.remaining_count !== undefined
                    ? lvlStat.remaining_count
                    : Math.max(0, total - studied))
                : total
              const pct = isAuthenticated ? (lvlStat?.percentage || 0) : 0
              const isSelected = selectedLevel === item.level

              return (
                <motion.div
                  key={item.level}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedLevel(item.level)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 cursor-pointer transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? 'border-cinnabar bg-paper shadow-md ring-2 ring-cinnabar/20'
                      : 'border-[#E7DFD3] bg-paper/70 hover:bg-paper hover:border-[#D4C7B5] hover:shadow-xs'
                  }`}
                >
                  {/* Subtle Chinese Character Watermark */}
                  <span className="pointer-events-none absolute -bottom-3 -right-2 font-serif text-7xl font-bold text-charcoal/[0.04] select-none group-hover:text-cinnabar/[0.08] transition-colors">
                    {item.hanziMotif}
                  </span>

                  <div>
                    {/* Header Row: Level name & Selected Radio */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg border border-cinnabar/30 bg-cinnabar/10 font-serif text-xs font-bold text-cinnabar">
                          {item.hanziMotif}
                        </span>
                        <h4 className="font-serif text-lg font-medium text-charcoal">
                          {item.name}
                        </h4>
                      </div>

                      <div
                        className={`flex size-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-cinnabar text-white shadow-2xs'
                            : 'border border-[#E7DFD3] bg-[#FAF8F5] text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-charcoal/60 leading-relaxed min-h-[32px]">
                      {item.desc}
                    </p>
                  </div>

                  {/* Progress Meter */}
                  <div className="mt-5 border-t border-[#E7DFD3]/80 pt-3 relative z-10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-charcoal/80">
                        {isAuthenticated && studied > 0 ? `${studied} / ${total} words` : `${total} Words`}
                      </span>
                      <span className={`font-bold ${pct > 0 ? 'text-cinnabar' : 'text-charcoal/40'}`}>
                        {pct}%
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 w-full rounded-full bg-[#EDE5D8] overflow-hidden">
                      <motion.div
                        className="h-full bg-cinnabar rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-charcoal/50 pt-2 border-t border-[#E7DFD3]/60">
                      <span>
                        {isAuthenticated
                          ? `${remaining} new words remaining`
                          : `${total} words available`}
                      </span>
                      <Link
                        to={`/flashcards/detail/${item.level}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center font-bold text-xs text-cinnabar hover:text-[#84271f] transition-all cursor-pointer py-1 px-3 rounded-lg bg-cinnabar/5 hover:bg-cinnabar/10 border border-cinnabar/20"
                        title={`View all HSK ${item.level} vocabulary details`}
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Right Column (4 cols): Sticky Quiz Configuration & Launch Panel */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-[#E7DFD3] bg-paper p-6 shadow-sm"
          >
            {/* Selected Level Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E7DFD3]">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-cinnabar uppercase">
                  QUIZ SESSION TARGET
                </span>
                <h3 className="font-serif text-2xl font-medium text-charcoal">
                  HSK Level {selectedLevel}
                </h3>
              </div>
              <span className="flex size-11 items-center justify-center rounded-2xl border border-cinnabar/30 bg-cinnabar/10 font-serif text-xl font-bold text-cinnabar shadow-2xs">
                {HSK_LEVELS.find((h) => h.level === selectedLevel)?.hanziMotif}
              </span>
            </div>

            {/* Level Stats Breakdown */}
            {isAuthenticated ? (
              <div className="my-5 rounded-2xl border border-[#E7DFD3] bg-[#FAF8F5] p-3.5 text-xs">
                <div className="flex items-center justify-between text-charcoal/70 mb-1.5">
                  <span>New Words Available:</span>
                  <span className="font-bold text-cinnabar">{selectedLvlRemaining} words</span>
                </div>
                <div className="flex items-center justify-between text-charcoal/70">
                  <span>Already Studied:</span>
                  <span className="font-semibold text-charcoal">{selectedLvlStudied} words</span>
                </div>
              </div>
            ) : (
              <div className="my-5 rounded-2xl border border-[#E7DFD3] bg-[#FAF8F5] p-3.5 text-xs text-charcoal/70">
                <div className="flex items-center justify-between mb-1">
                  <span>HSK {selectedLevel} Vocabulary:</span>
                  <span className="font-bold text-cinnabar">{selectedLvlTotal} words</span>
                </div>
                <p className="text-[11px] text-charcoal/50 leading-relaxed mt-1">
                  You can start practicing right away. Sign in to save your quiz history and Leitner progress.
                </p>
              </div>
            )}

            {/* Question Count Selector */}
            <div className="mt-5">
              <label className="block text-xs font-bold tracking-wider text-charcoal/60 uppercase mb-3">
                SELECT NUMBER OF QUESTIONS:
              </label>

              <div className="relative grid grid-cols-3 gap-1.5 p-1 rounded-2xl border border-[#E7DFD3] bg-[#FAF8F5]">
                {[10, 20, 30].map((num) => {
                  const isCurCount = questionCount === num
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`relative z-10 rounded-xl py-2.5 text-xs font-bold transition-colors cursor-pointer select-none active:scale-[0.97] ${
                        isCurCount
                          ? 'text-white'
                          : 'text-charcoal/70 hover:text-charcoal'
                      }`}
                    >
                      {/* Smooth Gliding Active Pill with Spring Physics */}
                      {isCurCount && (
                        <motion.div
                          layoutId="activeQuestionCountPill"
                          transition={{
                            type: 'spring',
                            stiffness: 450,
                            damping: 32,
                          }}
                          className="absolute inset-0 rounded-xl bg-cinnabar shadow-sm -z-10"
                        />
                      )}
                      <span className="relative z-10">{num} Questions</span>
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] text-charcoal/50">
                <span>Estimated duration: ~{Math.round(questionCount * 0.4)} mins</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-6 pt-4 border-t border-[#E7DFD3]">
              {isAuthenticated ? (
                <button
                  type="button"
                  disabled={starting}
                  onClick={handleStartQuiz}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cinnabar py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#84271f] transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {starting ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Preparing Quiz Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Start HSK {selectedLevel} Quiz ({questionCount} Questions)</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-charcoal/60 mb-3">
                    Sign in to take quizzes and track your Leitner algorithm progress.
                  </p>
                  <Link
                    to="/login"
                    className="block w-full rounded-2xl bg-cinnabar py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#84271f] transition-all text-center"
                  >
                    Sign In to Start Quiz →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  )
}
