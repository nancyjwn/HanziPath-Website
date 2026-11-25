import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import howItWorksBg from '../../assets/how-it-works-bg2.png'

// ==========================================
// FAQ DATA (5 Key Questions)
// ==========================================
const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'What is HanziPath?',
    answer: 'HanziPath is an intelligent web platform engineered to make Chinese mastery intuitive, structured, and enjoyable. It seamlessly combines a real-time AI handwriting recognition canvas, a comprehensive 120,000+ word CC-CEDICT smart dictionary with radical breakdowns, and adaptive HSK 1–6 spaced repetition flashcards into one unified learning environment.',
    highlight: 'All-in-one ecosystem for characters, dictionary & spaced repetition.'
  },
  {
    id: 'faq-2',
    question: 'Is HanziPath suitable for beginners?',
    answer: 'Yes, absolutely. The platform is designed from the ground up to welcome complete beginners. You can start directly with Pinyin pronunciation, the 4 tones with audio guides, radical component breakdowns, and foundational HSK 1 vocabulary before advancing to complex sentence patterns and advanced discourse.',
    highlight: 'Zero prior knowledge required — start from Pinyin and HSK 1 basics.'
  },
  {
    id: 'faq-3',
    question: 'What are HSK levels?',
    answer: 'HSK (Hànyǔ Shuǐpíng Kǎoshì) is China\'s official standardized Chinese proficiency examination framework. It spans 6 progressive levels: HSK 1–2 for Beginners (150–300 words), HSK 3–4 for Intermediate learners (600–1,200 words), and HSK 5–6 for Advanced fluency (2,500–5,000+ words) required for university study and professional employment in China.',
    highlight: 'Official 6-tier global benchmark for Chinese language proficiency.'
  },
  {
    id: 'faq-4',
    question: 'Do I need an account to use the features?',
    answer: 'No account is required to start exploring. As a guest, you can immediately test the AI handwriting canvas, search the 120,000+ word dictionary, explore HSK roadmaps, and take the mini vocabulary challenge. Creating a free account allows you to save vocabulary to your personal profile, maintain review schedules, and track accuracy statistics.',
    highlight: 'Instant guest access — register anytime to save personal progress.'
  },
  {
    id: 'faq-5',
    question: 'How does handwriting recognition work?',
    answer: 'Our browser-based AI handwriting engine analyzes your digital brush strokes on the Tian Zi Ge grid in real time. It evaluates stroke trajectory, direction, curvature, and relative proportions to match your drawing against standard Hanzi character models, providing instant recognition and stroke accuracy scoring without sending video streams to an external server.',
    highlight: 'Real-time on-device machine learning evaluation with instant feedback.'
  }
]

export default function HowItWorksAndFaqSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  return (
    <section className="relative z-10 w-full bg-[#F6F0E5] border-t border-[#e8decb] py-14 sm:py-18 lg:py-20 px-5 sm:px-10 lg:px-16 overflow-hidden">
      {/* Background Oriental Ink Landscape Layer */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Desktop View: Full-width proportional landscape ink painting */}
        <div
          className="hidden lg:block absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-multiply opacity-75"
          style={{ backgroundImage: `url(${howItWorksBg})` }}
        />

        {/* Mobile & Tablet View: Proportional Edge Motifs (Zero vertical distortion or spiky stretching) */}
        <div className="block lg:hidden absolute inset-0">
          {/* Top-Left Bamboo: True aspect ratio hanging naturally from top-left */}
          <div
            className="absolute top-0 -left-4 sm:left-0 w-44 sm:w-56 h-72 sm:h-96 bg-no-repeat mix-blend-multiply opacity-25 sm:opacity-35 pointer-events-none"
            style={{
              backgroundImage: `url(${howItWorksBg})`,
              backgroundPosition: 'left top',
              backgroundSize: 'auto 100%',
            }}
          />

          {/* Bottom-Right Mountain: True aspect ratio rising softly from bottom-right */}
          <div
            className="absolute bottom-0 -right-4 sm:right-0 w-48 sm:w-64 h-80 sm:h-104 bg-no-repeat mix-blend-multiply opacity-25 sm:opacity-35 pointer-events-none"
            style={{
              backgroundImage: `url(${howItWorksBg})`,
              backgroundPosition: 'right bottom',
              backgroundSize: 'auto 100%',
            }}
          />

          {/* Center ambient paper wash for pristine text contrast */}
          <div className="absolute inset-0 bg-[#F6F0E5]/50 pointer-events-none" />
        </div>

        {/* Feathered Top & Bottom Seam Blends */}
        <div className="absolute inset-x-0 top-0 h-16 sm:h-24 bg-gradient-to-b from-[#F6F0E5] via-[#F6F0E5]/80 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-[#F6F0E5] via-[#F6F0E5]/80 to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-[1260px] mx-auto">
        {/* Section Header: Single Clean Line */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[3px] text-cinnabar uppercase mb-2">
            <span className="h-px w-6 bg-cinnabar" />
            <span>HOW IT WORKS & FAQ</span>
            <span className="h-px w-6 bg-cinnabar" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-medium text-charcoal tracking-tight">
            How It Works & <span className="italic font-serif text-cinnabar">Frequently Asked Questions</span>
          </h2>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: HOW IT WORKS (Un-boxed, Organic Flowing Path) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between relative">
            <div className="mb-6">
              <span className="text-[10px] font-bold tracking-wider text-cinnabar uppercase">
                THREE SIMPLE STEPS
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-charcoal mt-1">
                How It Works
              </h3>
              <p className="text-xs sm:text-sm text-charcoal/70 mt-1 leading-relaxed font-normal">
                Start your HanziPath journey in three simple steps.
              </p>
            </div>

            {/* Organic Flowing Journey Spine (No repetitive boxes!) */}
            <div className="relative pl-12 sm:pl-16 space-y-8 sm:space-y-10 my-auto py-2">
              {/* Continuous Vertical Ink Wash Spine */}
              <div className="absolute left-[19px] sm:left-[23px] top-4 bottom-4 w-[1.5px] bg-gradient-to-b from-cinnabar via-[#e2d5c3] to-cinnabar/40" />

              {/* STEP 1: Explore */}
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="relative group cursor-default"
              >
                {/* Cinnabar Seal Stamp Marker */}
                <div className="absolute -left-12 sm:-left-16 top-0 size-10 sm:size-11 rounded-full border-2 border-cinnabar/30 bg-[#fbf7f0] flex items-center justify-center shadow-2xs group-hover:border-cinnabar group-hover:shadow-[0_0_12px_rgba(168,50,40,0.25)] transition duration-300">
                  <span className="font-mono text-xs sm:text-sm font-bold text-cinnabar">01</span>
                </div>

                <div>
                  <h4 className="font-heading text-lg sm:text-xl font-bold text-charcoal group-hover:text-cinnabar transition">
                    1. Explore
                  </h4>
                  <p className="text-xs sm:text-sm text-charcoal/75 mt-1 leading-relaxed font-normal">
                    Discover Chinese vocabulary, explore learning features, and get familiar with the platform.
                  </p>

                  {/* Clean Visual Action Pills */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f4ece0] border border-[#e2d5c3] px-3 py-1 text-[11px] font-medium text-charcoal/80 shadow-2xs">
                      Daily Words
                    </span>
                    <span className="rounded-full bg-[#f4ece0] border border-[#e2d5c3] px-3 py-1 text-[11px] font-medium text-charcoal/80 shadow-2xs">
                      120k+ CC-CEDICT Dictionary
                    </span>
                    <span className="rounded-full bg-paper border border-[#e5dccd] px-2.5 py-1 text-[10px] font-semibold text-cinnabar shadow-2xs">
                      Guest Friendly · No Login
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* STEP 2: Choose Your Level */}
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="relative group cursor-default"
              >
                {/* Cinnabar Seal Stamp Marker */}
                <div className="absolute -left-12 sm:-left-16 top-0 size-10 sm:size-11 rounded-full border-2 border-cinnabar/30 bg-[#fbf7f0] flex items-center justify-center shadow-2xs group-hover:border-cinnabar group-hover:shadow-[0_0_12px_rgba(168,50,40,0.25)] transition duration-300">
                  <span className="font-mono text-xs sm:text-sm font-bold text-cinnabar">02</span>
                </div>

                <div>
                  <h4 className="font-heading text-lg sm:text-xl font-bold text-charcoal group-hover:text-cinnabar transition">
                    2. Choose Your Level
                  </h4>
                  <p className="text-xs sm:text-sm text-charcoal/75 mt-1 leading-relaxed font-normal">
                    Select your preferred HSK level and find learning materials that match your ability.
                  </p>

                  {/* Interactive HSK Level Chips Preview */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'].map((lvl, i) => (
                      <span
                        key={lvl}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-semibold transition shadow-2xs ${
                          i === 0
                            ? 'bg-cinnabar text-white'
                            : 'bg-paper border border-[#e5dccd] text-charcoal/80 hover:border-cinnabar/50'
                        }`}
                      >
                        {lvl}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* STEP 3: Start Learning */}
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="relative group cursor-default"
              >
                {/* Cinnabar Seal Stamp Marker */}
                <div className="absolute -left-12 sm:-left-16 top-0 size-10 sm:size-11 rounded-full border-2 border-cinnabar/30 bg-[#fbf7f0] flex items-center justify-center shadow-2xs group-hover:border-cinnabar group-hover:shadow-[0_0_12px_rgba(168,50,40,0.25)] transition duration-300">
                  <span className="font-mono text-xs sm:text-sm font-bold text-cinnabar">03</span>
                </div>

                <div>
                  <h4 className="font-heading text-lg sm:text-xl font-bold text-charcoal group-hover:text-cinnabar transition">
                    3. Start Learning
                  </h4>
                  <p className="text-xs sm:text-sm text-charcoal/75 mt-1 leading-relaxed font-normal">
                    Create an account to access learning activities, practice Chinese, and keep track of your progress.
                  </p>

                  {/* Clean Visual Action Pill & Badges */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 rounded-full bg-paper border border-[#dcd2c3] hover:border-cinnabar hover:text-cinnabar px-3.5 py-1 text-xs font-semibold text-charcoal shadow-2xs transition"
                    >
                      <span>Create Free Account</span>
                      <span className="text-cinnabar">→</span>
                    </Link>
                    <span className="rounded-full bg-[#f4ece0] border border-[#e2d5c3] px-2.5 py-1 text-[11px] font-medium text-charcoal shadow-2xs">
                      AI Handwriting
                    </span>
                    <span className="rounded-full bg-[#f4ece0] border border-[#e2d5c3] px-2.5 py-1 text-[11px] font-medium text-charcoal shadow-2xs">
                      Spaced Repetition
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: UNIQUE SCHOLAR'S SEAL ACCORDION FAQ        */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="mb-4">
              <span className="text-[10px] font-bold tracking-wider text-cinnabar uppercase">
                CLEAR ANSWERS
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-semibold text-charcoal mt-1">
                Frequently Asked Questions
              </h3>
              <p className="text-xs sm:text-sm text-charcoal/70 mt-1 leading-relaxed font-normal">
                Everything you need to know about our tools, beginner readiness, HSK levels, and features.
              </p>
            </div>

            {/* Unique Interactive Accordion */}
            <div className="space-y-3 mt-2">
              {FAQ_ITEMS.map((faq, index) => {
                const isOpen = openFaqIndex === index

                return (
                  <motion.div
                    key={faq.id}
                    initial={false}
                    animate={{
                      backgroundColor: isOpen ? '#fffdfa' : '#fcfaf6',
                      borderColor: isOpen ? '#a83228' : '#e5dccd'
                    }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-2xl border transition-all duration-200 shadow-2xs overflow-hidden ${
                      isOpen ? 'ring-1 ring-cinnabar/25' : 'hover:border-charcoal/30'
                    }`}
                  >
                    {/* Accordion Header / Trigger Button */}
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-4 sm:p-4.5 text-left cursor-pointer gap-3 select-none"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Unique Numbered Oriental Stamp Pill */}
                        <span className={`grid size-7 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold transition ${
                          isOpen
                            ? 'bg-cinnabar text-white shadow-xs'
                            : 'bg-[#f4ece0] text-charcoal/75 border border-[#e5dccd]'
                        }`}>
                          0{index + 1}
                        </span>

                        <h4 className="font-heading text-sm sm:text-base font-semibold text-charcoal leading-snug">
                          {faq.question}
                        </h4>
                      </div>

                      {/* Morphing Expanding Icon */}
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className={`size-7 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                          isOpen
                            ? 'border-cinnabar bg-cinnabar/10 text-cinnabar'
                            : 'border-[#dcd2c3] text-charcoal/60 bg-paper'
                        }`}
                      >
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </button>

                    {/* Accordion Collapsible Answer */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="relative px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-1 border-t border-[#f0eae0] text-xs sm:text-sm text-charcoal/80 leading-relaxed font-normal">
                            {/* Watermark character inside answer */}
                            <span className="absolute bottom-1 right-3 font-serif text-6xl text-charcoal/[0.03] select-none pointer-events-none">
                              答
                            </span>

                            <p className="relative z-10 leading-relaxed">
                              {faq.answer}
                            </p>

                            {/* Key Highlight Pill */}
                            <div className="mt-3 relative z-10 flex items-center gap-2 rounded-xl bg-[#f8f2e7] border border-[#e8dfd2] p-2 text-xs text-charcoal/90">
                              <svg className="size-3.5 text-cinnabar shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium text-[11px] leading-tight">
                                {faq.highlight}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
