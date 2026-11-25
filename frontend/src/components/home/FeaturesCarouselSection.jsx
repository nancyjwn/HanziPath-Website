import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import featuresBg from '../../assets/features-carousel-bg2.png'

// ==========================================
// MASTER POOL OF 60 SINGLE-CHARACTER WORDS (HSK 1 - 6)
// ==========================================
const SINGLE_CHAR_WORDS = [
  // --- HSK 1 ---
  {
    hanzi: '学',
    pinyin: 'xué',
    level: 1,
    toneDesc: 'Tone 2 (Rising)',
    english: 'to learn, to study',
    radical1Name: 'RADICAL',
    radical1Text: '子 (Child)',
    radical2Name: 'COMPONENTS',
    radical2Text: '冖 + 爻 (Crown)',
    definition: '1. to learn; to study 2. science; -ology',
    example: '我想学好汉语口语。',
    cardNum: 12
  },
  {
    hanzi: '爱',
    pinyin: 'ài',
    level: 1,
    toneDesc: 'Tone 4 (Falling)',
    english: 'to love, affection',
    radical1Name: 'RADICAL',
    radical1Text: '爫 (Claw)',
    radical2Name: 'CORE',
    radical2Text: '心 (Heart)',
    definition: '1. to love; affection 2. to like; to be fond of',
    example: '我爱和家人在周末散步。',
    cardNum: 24
  },
  {
    hanzi: '水',
    pinyin: 'shuǐ',
    level: 1,
    toneDesc: 'Tone 3 (Dipping)',
    english: 'water, liquid',
    radical1Name: 'RADICAL',
    radical1Text: '水 (Water)',
    radical2Name: 'VARIANT',
    radical2Text: '氵 (Three Drops)',
    definition: '1. water; river 2. liquid; beverage',
    example: '运动之后记得多喝温开水。',
    cardNum: 31
  },
  {
    hanzi: '大',
    pinyin: 'dà',
    level: 1,
    toneDesc: 'Tone 4 (Falling)',
    english: 'big, great, vast',
    radical1Name: 'RADICAL',
    radical1Text: '大 (Big)',
    radical2Name: 'SYMBOL',
    radical2Text: 'Person with spread arms',
    definition: '1. big; large; vast 2. major; great',
    example: '今天的天气变化很大。',
    cardNum: 40
  },
  {
    hanzi: '天',
    pinyin: 'tiān',
    level: 1,
    toneDesc: 'Tone 1 (Flat)',
    english: 'sky, day, heaven',
    radical1Name: 'RADICAL',
    radical1Text: '大 (Big)',
    radical2Name: 'OVERHEAD',
    radical2Text: '一 (Horizon)',
    definition: '1. sky; heaven 2. day; weather',
    example: '今天天空一片晴朗无云。',
    cardNum: 45
  },
  {
    hanzi: '人',
    pinyin: 'rén',
    level: 1,
    toneDesc: 'Tone 2 (Rising)',
    english: 'person, human',
    radical1Name: 'RADICAL',
    radical1Text: '人 (Person)',
    radical2Name: 'VARIANT',
    radical2Text: '亻 (Standing Person)',
    definition: '1. person; people; human 2. adult',
    example: '这位年轻人很有礼貌。',
    cardNum: 52
  },
  {
    hanzi: '中',
    pinyin: 'zhōng',
    level: 1,
    toneDesc: 'Tone 1 (Flat)',
    english: 'center, middle, China',
    radical1Name: 'RADICAL',
    radical1Text: '丨 (Vertical Line)',
    radical2Name: 'COMPONENT',
    radical2Text: '口 (Mouth / Enclosure)',
    definition: '1. center; middle 2. China; Chinese',
    example: '他在学习中国书法艺术。',
    cardNum: 58
  },
  {
    hanzi: '日',
    pinyin: 'rì',
    level: 1,
    toneDesc: 'Tone 4 (Falling)',
    english: 'sun, day, date',
    radical1Name: 'RADICAL',
    radical1Text: '日 (Sun)',
    radical2Name: 'SYMBOL',
    radical2Text: 'Sun disk with sunspot',
    definition: '1. sun; day 2. date; daytime',
    example: '新的一天充满无限生机。',
    cardNum: 62
  },
  {
    hanzi: '月',
    pinyin: 'yuè',
    level: 1,
    toneDesc: 'Tone 4 (Falling)',
    english: 'moon, month',
    radical1Name: 'RADICAL',
    radical1Text: '月 (Moon)',
    radical2Name: 'SYMBOL',
    radical2Text: 'Crescent moon with clouds',
    definition: '1. moon; moonlight 2. month',
    example: '今晚的月光格外明亮皎洁。',
    cardNum: 66
  },
  {
    hanzi: '车',
    pinyin: 'chē',
    level: 1,
    toneDesc: 'Tone 1 (Flat)',
    english: 'vehicle, car, cart',
    radical1Name: 'RADICAL',
    radical1Text: '车 (Cart / Vehicle)',
    radical2Name: 'SYMBOL',
    radical2Text: 'Chariot with wheels & axle',
    definition: '1. vehicle; car 2. to carry in a vehicle',
    example: '学校门口有直达车很方便。',
    cardNum: 70
  },

  // --- HSK 2 ---
  {
    hanzi: '明',
    pinyin: 'míng',
    level: 2,
    toneDesc: 'Tone 2 (Rising)',
    english: 'bright, clear; understand',
    radical1Name: 'RADICAL 1',
    radical1Text: '日 (Sun)',
    radical2Name: 'RADICAL 2',
    radical2Text: '月 (Moon)',
    definition: '1. bright; clear 2. to understand 3. next day',
    example: '明天天气非常晴朗。',
    cardNum: 75
  },
  {
    hanzi: '好',
    pinyin: 'hǎo',
    level: 2,
    toneDesc: 'Tone 3 (Dipping)',
    english: 'good, fine, well',
    radical1Name: 'RADICAL 1',
    radical1Text: '女 (Woman)',
    radical2Name: 'RADICAL 2',
    radical2Text: '子 (Child)',
    definition: '1. good; well; fine 2. proper; friendly',
    example: '祝你今天有个好心情。',
    cardNum: 80
  },
  {
    hanzi: '休',
    pinyin: 'xiū',
    level: 2,
    toneDesc: 'Tone 1 (Flat)',
    english: 'to rest, to stop',
    radical1Name: 'RADICAL 1',
    radical1Text: '亻 (Person)',
    radical2Name: 'RADICAL 2',
    radical2Text: '木 (Tree)',
    definition: '1. to rest; to relax 2. to stop; to cease',
    example: '工作累了就休息一会儿。',
    cardNum: 85
  },
  {
    hanzi: '林',
    pinyin: 'lín',
    level: 2,
    toneDesc: 'Tone 2 (Rising)',
    english: 'woods, forest',
    radical1Name: 'RADICAL 1',
    radical1Text: '木 (Tree)',
    radical2Name: 'RADICAL 2',
    radical2Text: '木 (Tree)',
    definition: '1. woods; forest 2. gathering of trees',
    example: '我们在清幽的森林里漫步。',
    cardNum: 90
  },
  {
    hanzi: '和',
    pinyin: 'hé',
    level: 2,
    toneDesc: 'Tone 2 (Rising)',
    english: 'harmony, peace; with',
    radical1Name: 'RADICAL 1',
    radical1Text: '禾 (Grain)',
    radical2Name: 'RADICAL 2',
    radical2Text: '口 (Mouth)',
    definition: '1. harmony; peaceful 2. and; together with',
    example: '人与自然应当和谐共处。',
    cardNum: 94
  },
  {
    hanzi: '心',
    pinyin: 'xīn',
    level: 2,
    toneDesc: 'Tone 1 (Flat)',
    english: 'heart, mind, core',
    radical1Name: 'RADICAL',
    radical1Text: '心 (Heart)',
    radical2Name: 'VARIANT',
    radical2Text: '忄 (Vertical Heart)',
    definition: '1. heart; mind; feeling 2. center; core',
    example: '用真心去做好每件事。',
    cardNum: 98
  },
  {
    hanzi: '山',
    pinyin: 'shān',
    level: 2,
    toneDesc: 'Tone 1 (Flat)',
    english: 'mountain, hill',
    radical1Name: 'RADICAL',
    radical1Text: '山 (Mountain)',
    radical2Name: 'SYMBOL',
    radical2Text: 'Three mountain peaks',
    definition: '1. mountain; hill 2. towering peak',
    example: '周末我们一起去爬山。',
    cardNum: 102
  },
  {
    hanzi: '门',
    pinyin: 'mén',
    level: 2,
    toneDesc: 'Tone 2 (Rising)',
    english: 'door, gate, gateway',
    radical1Name: 'RADICAL',
    radical1Text: '门 (Door / Gate)',
    radical2Name: 'SYMBOL',
    radical2Text: 'Two door leaves',
    definition: '1. door; gate 2. entrance; gateway',
    example: '出门前请随手关好房门。',
    cardNum: 106
  },
  {
    hanzi: '文',
    pinyin: 'wén',
    level: 2,
    toneDesc: 'Tone 2 (Rising)',
    english: 'culture, writing, script',
    radical1Name: 'RADICAL',
    radical1Text: '文 (Script / Culture)',
    radical2Name: 'SYMBOL',
    radical2Text: 'Intertwined pattern',
    definition: '1. culture; literature 2. writing; character',
    example: '中华文化历史悠久深厚。',
    cardNum: 110
  },
  {
    hanzi: '白',
    pinyin: 'bái',
    level: 2,
    toneDesc: 'Tone 2 (Rising)',
    english: 'white, pure, clear',
    radical1Name: 'RADICAL',
    radical1Text: '白 (White)',
    radical2Name: 'SYMBOL',
    radical2Text: 'Sunray shining / clean grain',
    definition: '1. white; clear 2. pure; plain',
    example: '冬天的雪花洁白而美丽。',
    cardNum: 114
  },

  // --- HSK 3 ---
  {
    hanzi: '福',
    pinyin: 'fú',
    level: 3,
    toneDesc: 'Tone 2 (Rising)',
    english: 'blessing, good fortune',
    radical1Name: 'RADICAL',
    radical1Text: '礻 (Spirit / Altar)',
    radical2Name: 'COMPONENT',
    radical2Text: '畐 (Full / Abundant)',
    definition: '1. good fortune; happiness 2. blessing; luck',
    example: '祝大家新年幸福安康！',
    cardNum: 118
  },
  {
    hanzi: '春',
    pinyin: 'chūn',
    level: 3,
    toneDesc: 'Tone 1 (Flat)',
    english: 'spring season, vitality',
    radical1Name: 'RADICAL',
    radical1Text: '日 (Sun)',
    radical2Name: 'UPPER',
    radical2Text: '三 + 人 (Sprouting)',
    definition: '1. spring season 2. youth; vitality; joy',
    example: '春天万物复苏，生机盎然。',
    cardNum: 122
  },
  {
    hanzi: '风',
    pinyin: 'fēng',
    level: 3,
    toneDesc: 'Tone 1 (Flat)',
    english: 'wind, breeze, style',
    radical1Name: 'RADICAL',
    radical1Text: '风 (Wind)',
    radical2Name: 'SYMBOL',
    radical2Text: 'Air movement; atmosphere',
    definition: '1. wind; breeze 2. customs; style; scene',
    example: '湖面上吹来阵阵凉爽的清风。',
    cardNum: 126
  },
  {
    hanzi: '力',
    pinyin: 'lì',
    level: 3,
    toneDesc: 'Tone 4 (Falling)',
    english: 'strength, power, effort',
    radical1Name: 'RADICAL',
    radical1Text: '力 (Power / Plow)',
    radical2Name: 'SYMBOL',
    radical2Text: 'Muscular arm; strength',
    definition: '1. power; strength; ability 2. effort; force',
    example: '只要坚持努力就会看到进步。',
    cardNum: 130
  },
  {
    hanzi: '花',
    pinyin: 'huā',
    level: 3,
    toneDesc: 'Tone 1 (Flat)',
    english: 'flower, blossom, bloom',
    radical1Name: 'RADICAL',
    radical1Text: '艹 (Grass / Plant)',
    radical2Name: 'PHONETIC',
    radical2Text: '化 (Transform)',
    definition: '1. flower; blossom 2. to spend time/money',
    example: '公园里的鲜花盛开格外芬芳。',
    cardNum: 134
  },
  {
    hanzi: '香',
    pinyin: 'xiāng',
    level: 3,
    toneDesc: 'Tone 1 (Flat)',
    english: 'fragrant, aromatic, sweet',
    radical1Name: 'RADICAL 1',
    radical1Text: '禾 (Grain)',
    radical2Name: 'RADICAL 2',
    radical2Text: '日 (Sun)',
    definition: '1. fragrant; sweet-smelling 2. appetizing',
    example: '热茶散发着清雅的香气。',
    cardNum: 138
  },
  {
    hanzi: '信',
    pinyin: 'xìn',
    level: 3,
    toneDesc: 'Tone 4 (Falling)',
    english: 'letter, trust, message',
    radical1Name: 'RADICAL',
    radical1Text: '亻 (Person)',
    radical2Name: 'COMPONENT',
    radical2Text: '言 (Speech / Words)',
    definition: '1. letter; mail 2. to believe; trust; faith',
    example: '自信是迈向成功的第一步。',
    cardNum: 142
  },

  // --- HSK 4 ---
  {
    hanzi: '道',
    pinyin: 'dào',
    level: 4,
    toneDesc: 'Tone 4 (Falling)',
    english: 'way, path, principle',
    radical1Name: 'RADICAL',
    radical1Text: '辶 (Walking / Road)',
    radical2Name: 'COMPONENT',
    radical2Text: '首 (Head / Leader)',
    definition: '1. road; path 2. method; principle; the Dao',
    example: '追求真理是人生的最高大道。',
    cardNum: 145
  },
  {
    hanzi: '静',
    pinyin: 'jìng',
    level: 4,
    toneDesc: 'Tone 4 (Falling)',
    english: 'quiet, peaceful, calm',
    radical1Name: 'RADICAL 1',
    radical1Text: '青 (Nature / Blue)',
    radical2Name: 'RADICAL 2',
    radical2Text: '争 (Contend / Reconcile)',
    definition: '1. quiet; still; calm 2. peaceful; silent',
    example: '图书馆里环境十分安静。',
    cardNum: 148
  },
  {
    hanzi: '清',
    pinyin: 'qīng',
    level: 4,
    toneDesc: 'Tone 1 (Flat)',
    english: 'clear, pure, distinct',
    radical1Name: 'RADICAL',
    radical1Text: '氵 (Water)',
    radical2Name: 'PHONETIC',
    radical2Text: '青 (Pure Green)',
    definition: '1. clear; pure; clean 2. distinct; peaceful',
    example: '清晨的空气格外清新舒畅。',
    cardNum: 150
  },
  {
    hanzi: '真',
    pinyin: 'zhēn',
    level: 4,
    toneDesc: 'Tone 1 (Flat)',
    english: 'true, real, genuine',
    radical1Name: 'RADICAL',
    radical1Text: '目 (Eye)',
    radical2Name: 'BASE',
    radical2Text: '匕 + 八 (Upright)',
    definition: '1. real; genuine 2. true; sincere',
    example: '真心相待能赢得长久的友谊。',
    cardNum: 153
  },
  {
    hanzi: '深',
    pinyin: 'shēn',
    level: 4,
    toneDesc: 'Tone 1 (Flat)',
    english: 'deep, profound, dark',
    radical1Name: 'RADICAL',
    radical1Text: '氵 (Water)',
    radical2Name: 'PHONETIC',
    radical2Text: '罙 (Deep cave exploration)',
    definition: '1. deep; profound 2. dark color; late time',
    example: '这本书的思想内涵非常深远。',
    cardNum: 156
  },
  {
    hanzi: '重',
    pinyin: 'zhòng',
    level: 4,
    toneDesc: 'Tone 4 (Falling)',
    english: 'heavy, important, deep',
    radical1Name: 'RADICAL',
    radical1Text: '里 (Village / Weight)',
    radical2Name: 'SYMBOL',
    radical2Text: 'Heavy bundle tied tight',
    definition: '1. heavy; weighty 2. important; serious',
    example: '身体健康是生活中最重要的事情。',
    cardNum: 159
  },

  // --- HSK 5 ---
  {
    hanzi: '博',
    pinyin: 'bó',
    level: 5,
    toneDesc: 'Tone 2 (Rising)',
    english: 'broad, scholarly, vast',
    radical1Name: 'RADICAL',
    radical1Text: '十 (Ten / Complete)',
    radical2Name: 'COMPONENT',
    radical2Text: '尃 (Extensive / Wide)',
    definition: '1. broad; extensive 2. rich in learning',
    example: '他博览群书，知识极其渊博。',
    cardNum: 162
  },
  {
    hanzi: '诚',
    pinyin: 'chéng',
    level: 5,
    toneDesc: 'Tone 2 (Rising)',
    english: 'sincere, honest, faithful',
    radical1Name: 'RADICAL',
    radical1Text: '讠 (Speech)',
    radical2Name: 'PHONETIC',
    radical2Text: '成 (Accomplish)',
    definition: '1. sincere; honest 2. genuine; truly',
    example: '为人处世最重要的是真诚实在。',
    cardNum: 165
  },
  {
    hanzi: '德',
    pinyin: 'dé',
    level: 5,
    toneDesc: 'Tone 2 (Rising)',
    english: 'virtue, morality, heart',
    radical1Name: 'RADICAL',
    radical1Text: '彳 (Step / Journey)',
    radical2Name: 'CORE',
    radical2Text: '十 + 目 + 心 (Moral Vision)',
    definition: '1. virtue; morality 2. kindness; favor',
    example: '品德端正才能受人由衷敬重。',
    cardNum: 168
  },
  {
    hanzi: '雅',
    pinyin: 'yǎ',
    level: 5,
    toneDesc: 'Tone 3 (Dipping)',
    english: 'elegant, refined, graceful',
    radical1Name: 'RADICAL',
    radical1Text: '隹 (Short-tailed Bird)',
    radical2Name: 'COMPONENT',
    radical2Text: '牙 (Harmonious cadence)',
    definition: '1. elegant; refined 2. standard; proper',
    example: '这首古筝曲韵味格外清雅。',
    cardNum: 171
  },
  {
    hanzi: '敏',
    pinyin: 'mǐn',
    level: 5,
    toneDesc: 'Tone 3 (Dipping)',
    english: 'quick, sharp, alert',
    radical1Name: 'RADICAL',
    radical1Text: '攵 (Action / Tap)',
    radical2Name: 'PHONETIC',
    radical2Text: '每 (Agility)',
    definition: '1. quick; agile 2. sharp; clever; sensitive',
    example: '他思维敏捷，善于解决难题。',
    cardNum: 174
  },

  // --- HSK 6 ---
  {
    hanzi: '慧',
    pinyin: 'huì',
    level: 6,
    toneDesc: 'Tone 4 (Falling)',
    english: 'wisdom, intelligence',
    radical1Name: 'RADICAL',
    radical1Text: '心 (Heart / Mind)',
    radical2Name: 'UPPER',
    radical2Text: '彗 (Broom / Sweeping clear)',
    definition: '1. wisdom; intelligence 2. bright; insightful',
    example: '阅读经典能启迪内心的深层智慧。',
    cardNum: 178
  },
  {
    hanzi: '墨',
    pinyin: 'mò',
    level: 6,
    toneDesc: 'Tone 4 (Falling)',
    english: 'Chinese ink, calligraphy',
    radical1Name: 'RADICAL',
    radical1Text: '土 (Earth)',
    radical2Name: 'UPPER',
    radical2Text: '黑 (Black)',
    definition: '1. ink; inkstone 2. writing; scholarship; art',
    example: '宣纸上的水墨画意境深邃悠远。',
    cardNum: 181
  },
  {
    hanzi: '禅',
    pinyin: 'chán',
    level: 6,
    toneDesc: 'Tone 2 (Rising)',
    english: 'Zen, meditation, calm',
    radical1Name: 'RADICAL',
    radical1Text: '礻 (Spirit / Ritual)',
    radical2Name: 'PHONETIC',
    radical2Text: '单 (Simple / Pure)',
    definition: '1. Zen; contemplation 2. tranquility; stillness',
    example: '在幽静的山谷中体会禅意之美。',
    cardNum: 185
  },
  {
    hanzi: '韵',
    pinyin: 'yùn',
    level: 6,
    toneDesc: 'Tone 4 (Falling)',
    english: 'rhyme, charm, cadence',
    radical1Name: 'RADICAL',
    radical1Text: '音 (Sound / Music)',
    radical2Name: 'COMPONENT',
    radical2Text: '匀 (Balanced / Harmonious)',
    definition: '1. rhyme; vowel 2. musical charm; lingering grace',
    example: '传统诗词诵读起来格外富有韵律。',
    cardNum: 188
  },
  {
    hanzi: '悟',
    pinyin: 'wù',
    level: 6,
    toneDesc: 'Tone 4 (Falling)',
    english: 'comprehend, realize, awaken',
    radical1Name: 'RADICAL',
    radical1Text: '忄 (Heart / Mind)',
    radical2Name: 'PHONETIC',
    radical2Text: '吾 (Self)',
    definition: '1. to comprehend; realize 2. to awaken to truth',
    example: '经过反复琢磨，他终于有所顿悟。',
    cardNum: 192
  }
]

// Fisher-Yates pure shuffle function
function shuffleArray(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// ==========================================
// PREVIEW CARD COMPONENTS
// ==========================================

// 1. AI Handwriting Preview Component (Non-repeating random 1-character, no stroke info)
function HandwritingPreviewCard({ word }) {
  return (
    <div className="relative flex flex-col h-full justify-between select-none overflow-hidden">
      {/* Top bar with AI STROKE ENGINE and HSK badge at top right */}
      <div className="flex items-center justify-between shrink-0">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cinnabar/10 px-2.5 py-0.5 text-[10px] font-bold text-cinnabar tracking-wider uppercase">
          <span className="size-1.5 rounded-full bg-cinnabar animate-pulse" />
          AI STROKE ENGINE
        </span>
        <span className="rounded-md bg-cinnabar/10 px-2 py-0.5 text-[9px] font-bold text-cinnabar">
          HSK {word.level} Level
        </span>
      </div>

      {/* Canvas Tian Zi Ge Mockup with Real-time Calligraphy Brush Simulation */}
      <div className="relative my-2 aspect-square max-h-[160px] sm:max-h-[175px] mx-auto w-full rounded-2xl border-2 border-dashed border-[#dcd2c3] bg-[#fffdfa] p-2 flex items-center justify-center overflow-hidden shadow-inner">
        {/* Tian Zi Ge Grid Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-px border-b border-dashed border-charcoal/15" />
          <div className="absolute top-0 bottom-0 left-1/2 w-px border-r border-dashed border-charcoal/15" />
          <div className="absolute inset-2.5 border border-charcoal/10 rounded-lg" />
        </div>

        {/* Character Centerpiece (Authentic 1-Character Hanzi) */}
        <motion.div
          key={word.hanzi}
          initial={{ opacity: 0.2, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-6xl sm:text-7xl font-normal text-charcoal select-none leading-none z-10"
        >
          {word.hanzi}
        </motion.div>

        {/* Animated Calligraphy Brush Cursor (Simulates live handwriting strokes across the grid) */}
        <motion.div
          key={`brush-${word.hanzi}`}
          animate={{
            x: [-28, -8, 18, 0, -20, 24, 0],
            y: [-24, -8, -18, 14, 20, 24, 0],
            opacity: [0, 1, 1, 1, 1, 1, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
          className="absolute size-2.5 rounded-full bg-cinnabar shadow-[0_0_8px_rgba(168,50,40,0.6)] pointer-events-none z-20"
        />

        {/* Floating AI Confidence pill */}
        <div className="absolute bottom-2 right-2 rounded-lg bg-paper/95 border border-[#e5dccd] px-2 py-0.5 text-[9px] font-bold text-cinnabar shadow-2xs backdrop-blur-xs z-20">
          Recognized: {word.hanzi} ({word.pinyin})
        </div>
      </div>

      {/* Bottom card details (Clean, HSK moved to top right) */}
      <div className="rounded-xl bg-[#f5ede0]/80 border border-[#e5dccd] p-2.5 text-left shrink-0">
        <span className="font-semibold text-charcoal text-[11px] block">
          {word.hanzi} ({word.pinyin})
        </span>
        <p className="mt-0.5 text-[11px] font-serif text-charcoal/80 leading-snug">
          "{word.english}" — Interactive digital canvas with real-time recognition.
        </p>
      </div>
    </div>
  )
}

// 2. Smart Chinese Dictionary Preview Component (Non-repeating random 1-character, no CC-CEDICT credit)
function DictionaryPreviewCard({ word }) {
  return (
    <div className="relative flex flex-col h-full justify-between select-none overflow-hidden">
      {/* Top search bar mockup */}
      <div className="flex items-center gap-2 rounded-xl bg-paper border border-[#dcd2c3] px-3 py-1.5 shadow-2xs shrink-0">
        <svg className="size-3.5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="font-serif text-xs font-semibold text-charcoal">
          {word.hanzi} ({word.pinyin})
        </span>
        <span className="ml-auto rounded-md bg-cinnabar/10 px-1.5 py-0.5 text-[9px] font-bold text-cinnabar">
          HSK {word.level}
        </span>
      </div>

      {/* Character Card Centerpiece with Radicals */}
      <div className="my-2 rounded-2xl bg-[#fffdfa] border border-[#e5dccd] p-3.5 shadow-2xs text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="font-serif text-4xl sm:text-5xl font-medium text-charcoal">
            {word.hanzi}
          </span>
          <div className="text-left">
            <p className="text-base sm:text-lg font-bold text-cinnabar leading-none">
              {word.pinyin}
            </p>
            <p className="text-[10px] text-muted font-mono mt-1">
              {word.toneDesc}
            </p>
          </div>
        </div>

        {/* Radical Component Decomposition */}
        <div className="mt-2.5 pt-2 border-t border-[#f0eae0] grid grid-cols-2 gap-2 text-left text-xs">
          <div className="rounded-lg bg-[#f6f0e5] p-1.5">
            <span className="text-[9px] font-bold text-muted uppercase">{word.radical1Name}</span>
            <p className="font-serif text-xs font-semibold text-charcoal mt-0.5">{word.radical1Text}</p>
          </div>
          <div className="rounded-lg bg-[#f6f0e5] p-1.5">
            <span className="text-[9px] font-bold text-muted uppercase">{word.radical2Name}</span>
            <p className="font-serif text-xs font-semibold text-charcoal mt-0.5">{word.radical2Text}</p>
          </div>
        </div>
      </div>

      {/* Definition Preview (Clean, without CC-CEDICT credit or stroke text) */}
      <div className="rounded-xl bg-[#f5ede0]/80 border border-[#e5dccd] p-2.5 text-left shrink-0">
        <div className="flex items-center justify-between text-[10px] font-bold text-cinnabar uppercase mb-0.5">
          <span>DEFINITIONS</span>
        </div>
        <p className="text-[11px] text-charcoal/90 leading-snug">
          {word.definition}
        </p>
      </div>
    </div>
  )
}

// 3. Adaptive HSK Flashcards Preview Component (Non-repeating random 1-character, quick auto-flip)
function FlashcardsPreviewCard({ word, isActive }) {
  const [internalFlipped, setInternalFlipped] = useState(false)
  const isFlipped = isActive && internalFlipped

  // Auto-flip swiftly after 1.4 seconds without user needing to click
  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setInternalFlipped((prev) => !prev)
    }, 1400) // quick, snappy flip duration

    return () => clearInterval(timer)
  }, [isActive, word])

  return (
    <div className="relative flex flex-col h-full justify-between select-none overflow-hidden">
      {/* Top Deck Info */}
      <div className="flex items-center justify-between text-[10px] shrink-0">
        <span className="rounded-full bg-cinnabar/10 px-2.5 py-0.5 font-bold text-cinnabar">
          HSK {word.level} DECK
        </span>
        <div className="flex items-center gap-1 font-mono text-muted">
          <span>CARD {word.cardNum}/150</span>
        </div>
      </div>

      {/* 3D Flipping Card Stage */}
      <div
        onClick={() => setInternalFlipped((prev) => !prev)}
        className="my-2 relative aspect-[4/3] max-h-[170px] sm:max-h-[185px] w-full cursor-pointer perspective-1000 select-none"
        title="Click to flip card"
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="relative size-full rounded-2xl border border-[#e5dccd] bg-[#fffdfa] p-3 shadow-2xs transform-style-preserve-3d flex flex-col items-center justify-center text-center"
        >
          {/* Front Side */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 backface-hidden">
            <span className="font-serif text-5xl font-medium text-charcoal">
              {word.hanzi}
            </span>
            <span className="mt-1 text-sm font-bold text-cinnabar">
              {word.pinyin}
            </span>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 backface-hidden rotate-y-180 bg-[#fbf6ed] rounded-2xl border border-cinnabar/30">
            <span className="text-[9px] font-bold text-cinnabar uppercase tracking-wider">
              MEANING
            </span>
            <p className="mt-0.5 font-serif text-base font-semibold text-charcoal">
              {word.english}
            </p>
            <p className="text-[10px] text-muted italic mt-0.5 line-clamp-1">
              "{word.example}"
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5">
                ✓ Remembered
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom info banner (Clean, no "auto flipping" text, no mastery progress) */}
      <div className="rounded-xl bg-[#f5ede0]/80 border border-[#e5dccd] p-2.5 text-left shrink-0">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-bold text-cinnabar uppercase">SPACED REPETITION</span>
        </div>
        <p className="mt-0.5 text-[11px] text-charcoal/80 leading-snug">
          Adaptive review intervals based on your personal memory retention.
        </p>
      </div>
    </div>
  )
}

// 3 Core Features definition
const FEATURES = [
  {
    id: 'handwriting',
    number: '01',
    category: 'AI RECOGNITION · 手写识别',
    title: 'AI Handwriting Canvas',
    description: 'Practice writing Hanzi characters on a digital canvas with instant AI stroke recognition.',
    tags: ['田字格 Grid', 'Real-time AI Scoring', 'Stroke Order Guide'],
    ctaText: 'Try Writing Canvas',
    ctaLink: '/handwriting',
    previewBadge: 'AI STROKE ENGINE',
    CardComponent: HandwritingPreviewCard
  },
  {
    id: 'dictionary',
    number: '02',
    category: 'CC-CEDICT · 权威词典',
    title: 'Smart Chinese Dictionary',
    description: 'Search 120,000+ words with radical breakdown, character composition, and HSK levels.',
    tags: ['120,000+ Words', 'Radical Breakdown', 'HSK 1-6 Levels'],
    ctaText: 'Explore Dictionary',
    ctaLink: '/dictionary',
    previewBadge: 'COMPREHENSIVE LEXICON',
    CardComponent: DictionaryPreviewCard
  },
  {
    id: 'flashcards',
    number: '03',
    category: 'SPACED REPETITION · 记忆卡片',
    title: 'Adaptive HSK Flashcards',
    description: 'Master HSK vocabulary faster through scientifically proven spaced repetition flip cards.',
    tags: ['Leitner System', 'HSK 1-6 Study Decks', 'Retention Tracking'],
    ctaText: 'Practice Flashcards',
    ctaLink: '/flashcards',
    previewBadge: 'LEITNER ALGORITHM',
    CardComponent: FlashcardsPreviewCard
  }
]

export default function FeaturesCarouselSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = slide right to left, -1 = slide left to right
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [progressKey, setProgressKey] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const autoPlayRef = useRef(null)

  // ==============================================================
  // DECK QUEUE WITHOUT REPETITION (Shuffle deck without replacement)
  // Ensures NO word can ever repeat until ALL 60 words have been exhausted!
  // ==============================================================
  const deckRef = useRef(null)

  const drawThreeUniqueWords = () => {
    // If fewer than 3 words remain in the unviewed deck, reshuffle all 60 words!
    if (!deckRef.current || deckRef.current.length < 3) {
      deckRef.current = shuffleArray(SINGLE_CHAR_WORDS)
    }
    // Shift 3 words out of the remaining unviewed pool
    const word1 = deckRef.current.shift()
    const word2 = deckRef.current.shift()
    const word3 = deckRef.current.shift()
    return [word1, word2, word3]
  }

  // Initialize roundWords with 3 words drawn from freshly shuffled array
  const [roundWords, setRoundWords] = useState(() => {
    const shuffled = shuffleArray(SINGLE_CHAR_WORDS)
    return [shuffled[0], shuffled[1], shuffled[2]]
  })

  const activeFeature = FEATURES[currentIndex]
  const currentWord = roundWords[currentIndex]
  const secondaryWord = roundWords[(currentIndex + 1) % roundWords.length]

  // Auto-play advances slide every 6 seconds, and draws next 3 non-repeating words when a round ends
  useEffect(() => {
    if (!isAutoPlaying) return

    autoPlayRef.current = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => {
        const next = (prev + 1) % FEATURES.length
        if (next === 0) {
          // Completed 1 full round! Draw next 3 non-repeating words from unviewed deck!
          setRoundWords(drawThreeUniqueWords())
          setCycleCount((c) => c + 1)
        }
        return next
      })
      setProgressKey((prev) => prev + 1)
    }, 6000)

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [isAutoPlaying])

  const goToSlide = (idx) => {
    if (idx === currentIndex) return
    setDirection(idx > currentIndex ? 1 : -1)
    setCurrentIndex(idx)
    setProgressKey((prev) => prev + 1)
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => {
      const next = (prev + 1) % FEATURES.length
      if (next === 0) {
        setRoundWords(drawThreeUniqueWords())
        setCycleCount((c) => c + 1)
      }
      return next
    })
    setProgressKey((prev) => prev + 1)
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + FEATURES.length) % FEATURES.length)
    setProgressKey((prev) => prev + 1)
  }

  // Slide animation variants (smooth horizontal slide / geser)
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.22 },
        scale: { duration: 0.22 }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.22 },
        scale: { duration: 0.22 }
      }
    })
  }

  return (
    <section className="relative z-10 w-full min-h-screen flex items-center justify-center px-5 sm:px-10 lg:px-16 py-16 sm:py-24 overflow-hidden">
      {/* ================= SOFT BLURRED ORIENTAL LANDSCAPE BACKGROUND ================= */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Softly blurred traditional Chinese landscape painting - very soft atmospheric blur */}
        <div
          className="absolute -inset-2 bg-cover bg-center bg-no-repeat blur-[0.8px] sm:blur-[1px] scale-[1.015] opacity-85"
          style={{ backgroundImage: `url(${featuresBg})` }}
        />

        {/* Soft parchment wash overlay to maintain perfect contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f4ec]/60 via-[#f5efe4]/30 to-[#f4eee2]/75" />

        {/* Character 1 (Top-Right Corner - Soft Hanzi Watermark) */}
        <span className="absolute -top-10 -right-6 sm:top-2 sm:right-10 font-serif text-[200px] sm:text-[270px] text-charcoal/[0.038] select-none pointer-events-none leading-none">
          {secondaryWord.hanzi}
        </span>

        {/* Character 2 (Bottom-Left Corner - Soft Hanzi Watermark) */}
        <span className="absolute -bottom-10 -left-6 sm:bottom-0 sm:left-10 font-serif text-[210px] sm:text-[280px] text-charcoal/[0.038] select-none pointer-events-none leading-none">
          {currentWord.hanzi}
        </span>
      </div>

      {/* Main Full-Screen Fit Stage Container */}
      <div className="relative z-10 w-full max-w-[1260px] mx-auto">
        {/* Section Mini Top Label */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[3px] text-cinnabar uppercase">
            <span className="h-px w-6 bg-cinnabar" />
            <span>INTERACTIVE PLATFORM TOUR</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-charcoal/70">
              {activeFeature.number} <span className="text-muted">/ 0{FEATURES.length}</span>
            </span>
          </div>
        </div>

        {/* Two-Column Layout: Left Stepper & Text Details, Right Clean Fitted Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ================= LEFT COLUMN: Vertical Stepper + Concise Text ================= */}
          <div className="lg:col-span-6 flex gap-5 sm:gap-7 items-start">
            {/* Vertical Dots Stepper Track (1, 2, 3) */}
            <div className="flex flex-col items-center pt-2 select-none shrink-0">
              {FEATURES.map((feat, idx) => {
                const isActive = idx === currentIndex
                return (
                  <div key={feat.id} className="flex flex-col items-center">
                    {/* Stepper Dot or Numbered Bubble */}
                    <button
                      onClick={() => goToSlide(idx)}
                      className={`relative flex items-center justify-center transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'size-7 sm:size-8 rounded-full bg-charcoal text-paper font-bold text-[11px] shadow-sm scale-110'
                          : 'size-3 sm:size-3.5 rounded-full bg-[#dcd2c3] hover:bg-cinnabar/60 hover:scale-125'
                      }`}
                      aria-label={`Jump to slide ${idx + 1}`}
                    >
                      {isActive && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          {idx + 1}
                        </motion.span>
                      )}
                    </button>

                    {/* Connecting vertical line segment between dots */}
                    {idx < FEATURES.length - 1 && (
                      <div className="my-2 h-10 sm:h-12 w-[1.5px] bg-[#dcd2c3]" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Slide Information & Action (Concise text) */}
            <div className="flex-1 min-w-0">
              <div className="min-h-[170px] sm:min-h-[190px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeFeature.id}-${currentWord.hanzi}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p className="text-[10px] font-bold tracking-[2.5px] text-cinnabar uppercase">
                      {activeFeature.category}
                    </p>

                    <h3 className="mt-2 font-heading text-3xl sm:text-4xl lg:text-[42px] font-medium text-charcoal tracking-tight leading-[1.14]">
                      {activeFeature.title}
                    </h3>

                    {/* Concise, short text right after the title */}
                    <p className="mt-3 text-xs sm:text-sm text-charcoal/75 leading-relaxed max-w-md font-normal">
                      {activeFeature.description}
                    </p>

                    {/* Feature Perks Pill Tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {activeFeature.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-[#e5dccd] bg-paper px-2.5 py-0.5 text-[10px] font-medium text-charcoal/80 shadow-2xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA Action Button */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Link
                        to={activeFeature.ctaLink}
                        className="inline-flex items-center gap-2 rounded-full bg-cinnabar hover:bg-[#88271e] text-white px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <span>{activeFeature.ctaText}</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Controls: Arrows + Auto-play Progress */}
              <div className="mt-8 flex items-center gap-3 border-t border-[#e5dccd] pt-4">
                <button
                  onClick={handlePrev}
                  className="grid size-9 place-items-center rounded-full border border-[#dcd2c3] bg-paper text-charcoal hover:border-cinnabar hover:text-cinnabar transition-colors shadow-2xs cursor-pointer active:scale-90"
                  aria-label="Previous feature"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={handleNext}
                  className="grid size-9 place-items-center rounded-full border border-[#dcd2c3] bg-paper text-charcoal hover:border-cinnabar hover:text-cinnabar transition-colors shadow-2xs cursor-pointer active:scale-90"
                  aria-label="Next feature"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Subtle Auto-play Progress Bar */}
                <div className="relative h-1 flex-1 rounded-full bg-[#dcd2c3]/60 overflow-hidden ml-2 max-w-[140px]">
                  {isAutoPlaying && (
                    <motion.div
                      key={progressKey}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 6, ease: 'linear' }}
                      className="h-full bg-cinnabar rounded-full"
                    />
                  )}
                </div>

                {/* Pause/Resume Autoplay */}
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="text-[10px] font-mono text-muted hover:text-charcoal cursor-pointer ml-1"
                  title={isAutoPlaying ? 'Pause autoplay' : 'Resume autoplay'}
                >
                  {isAutoPlaying ? '❚❚' : '▶'}
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Completely Fitted Card (Pas, Tidak Terpotong) ================= */}
          <div className="lg:col-span-6 flex items-center justify-center lg:justify-end py-3">
            {/* The Featured Card: Perfectly Fitted, No Sliced Edges */}
            <div className="w-full max-w-[390px] sm:max-w-[420px]">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={`${activeFeature.id}-${currentWord.hanzi}-${cycleCount}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full h-[385px] sm:h-[405px] rounded-3xl border border-[#e5dccd] bg-paper p-5 sm:p-6 shadow-[0_16px_36px_rgba(41,39,35,0.08)] ring-1 ring-cinnabar/20 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Corner Ribbon */}
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#f0eae0] text-[10px] shrink-0">
                    <span className="font-mono font-bold text-muted">
                      FEATURE #{activeFeature.number}
                    </span>
                    <span className="font-bold tracking-wider text-cinnabar uppercase">
                      {activeFeature.previewBadge}
                    </span>
                  </div>

                  {/* Active Card Body: passes non-repeating 1-character word */}
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <activeFeature.CardComponent
                      word={currentWord}
                      isActive={true}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
