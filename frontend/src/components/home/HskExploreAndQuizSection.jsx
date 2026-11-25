import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'

// ==========================================
// 1. ALL HSK LEVELS GRID DATA (HSK 1 - 6)
// ==========================================
const ALL_HSK_LIST = [
  {
    level: 1,
    title: 'HSK 1',
    tier: 'Beginner',
    wordsCount: '150 Words',
    previewChars: '你好 · 谢谢 · 学',
  },
  {
    level: 2,
    title: 'HSK 2',
    tier: 'Beginner',
    wordsCount: '300 Words',
    previewChars: '便宜 · 机场 · 准备',
  },
  {
    level: 3,
    title: 'HSK 3',
    tier: 'Intermediate',
    wordsCount: '600 Words',
    previewChars: '打算 · 历史 · 环境',
  },
  {
    level: 4,
    title: 'HSK 4',
    tier: 'Intermediate',
    wordsCount: '1,200 Words',
    previewChars: '成功 · 坚持 · 礼貌',
  },
  {
    level: 5,
    title: 'HSK 5',
    tier: 'Advanced',
    wordsCount: '2,500 Words',
    previewChars: '挑战 · 逻辑 · 哲学',
  },
  {
    level: 6,
    title: 'HSK 6',
    tier: 'Advanced',
    wordsCount: '5,000+ Words',
    previewChars: '渊博 · 融会贯通 · 崇高',
  }
]

// ==========================================
// 2. 4 TABS DATA (All, Beginner, Intermediate, Advanced)
// Clean & streamlined: No long descriptive sentences
// With Focus topics for Beginner, Intermediate, and Advanced
// ==========================================
const TABS_CONFIG = [
  {
    id: 'all',
    name: 'All'
  },
  {
    id: 'beginner',
    name: 'Beginner',
    levels: [
      {
        level: 1,
        title: 'HSK 1',
        wordsCount: '150 Words',
        topics: ['Pinyin & 4 Tones', 'Greetings & Introductions', 'Numbers & Dates', 'Daily Basics'],
        sampleWords: [
          { hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'Hello' },
          { hanzi: '谢谢', pinyin: 'xièxie', meaning: 'Thank you' },
          { hanzi: '学', pinyin: 'xué', meaning: 'To learn' },
          { hanzi: '朋友', pinyin: 'péngyou', meaning: 'Friend' },
        ]
      },
      {
        level: 2,
        title: 'HSK 2',
        wordsCount: '300 Words',
        topics: ['Shopping & Dining', 'Directions & Transit', 'Weather & Daily Plans'],
        sampleWords: [
          { hanzi: '便宜', pinyin: 'piányi', meaning: 'Cheap' },
          { hanzi: '机场', pinyin: 'jīchǎng', meaning: 'Airport' },
          { hanzi: '准备', pinyin: 'zhǔnbèi', meaning: 'To prepare' },
          { hanzi: '晴天', pinyin: 'qíngtiān', meaning: 'Sunny day' },
        ]
      }
    ]
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    levels: [
      {
        level: 3,
        title: 'HSK 3',
        wordsCount: '600 Words',
        topics: ['Independent Travel', 'Campus & Work Life', 'Personal Opinions'],
        sampleWords: [
          { hanzi: '打算', pinyin: 'dǎsuàn', meaning: 'To plan' },
          { hanzi: '历史', pinyin: 'lìshǐ', meaning: 'History' },
          { hanzi: '环境', pinyin: 'huánjìng', meaning: 'Environment' },
          { hanzi: '解决', pinyin: 'jiějué', meaning: 'To resolve' },
        ]
      },
      {
        level: 4,
        title: 'HSK 4',
        wordsCount: '1,200 Words',
        topics: ['Social & Cultural', 'Job Interviews', 'Technology & Media'],
        sampleWords: [
          { hanzi: '成功', pinyin: 'chénggōng', meaning: 'Success' },
          { hanzi: '坚持', pinyin: 'jiānchí', meaning: 'To persist' },
          { hanzi: '礼貌', pinyin: 'lǐmào', meaning: 'Polite' },
          { hanzi: '丰富', pinyin: 'fēngfù', meaning: 'Abundant' },
        ]
      }
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced',
    levels: [
      {
        level: 5,
        title: 'HSK 5',
        wordsCount: '2,500 Words',
        topics: ['Formal Debates & Speeches', 'News & Economics', 'Philosophy & Values'],
        sampleWords: [
          { hanzi: '挑战', pinyin: 'tiǎozhàn', meaning: 'Challenge' },
          { hanzi: '逻辑', pinyin: 'luójí', meaning: 'Logic' },
          { hanzi: '哲学', pinyin: 'zhéxué', meaning: 'Philosophy' },
          { hanzi: '吸收', pinyin: 'xīshōu', meaning: 'To absorb' },
        ]
      },
      {
        level: 6,
        title: 'HSK 6',
        wordsCount: '5,000+ Words',
        topics: ['Classical Literature', 'Academic Research', 'Chengyu Idioms'],
        sampleWords: [
          { hanzi: '渊博', pinyin: 'yuānbó', meaning: 'Profound' },
          { hanzi: '精益求精', pinyin: 'jīng yì qiú jīng', meaning: 'Perfection' },
          { hanzi: '融会贯通', pinyin: 'róng huì guàn tōng', meaning: 'Comprehensive' },
          { hanzi: '崇高', pinyin: 'chónggāo', meaning: 'Sublime' },
        ]
      }
    ]
  }
]

// ==========================================
// 3. MINI CHINESE CHALLENGE QUESTION BANK (HSK 1 - 3)
// 60 authentic, diverse vocabulary questions with balanced randomization
// ==========================================
const CHALLENGE_QUESTION_BANK = [
  // --- HSK 1 (20 Questions) ---
  {
    id: 1,
    level: 1,
    hanzi: '学',
    pinyin: 'xué',
    options: ['To learn / study', 'To teach', 'To write', 'To speak'],
    correctIndex: 0,
    explanation: '学 (xué) means to learn or study. Example: 学习 (xuéxí - to study).'
  },
  {
    id: 2,
    level: 1,
    hanzi: '水',
    pinyin: 'shuǐ',
    options: ['Fire', 'Water', 'Earth', 'Wind'],
    correctIndex: 1,
    explanation: '水 (shuǐ) means water. Example: 喝水 (hē shuǐ - drink water).'
  },
  {
    id: 3,
    level: 1,
    hanzi: '好',
    pinyin: 'hǎo',
    options: ['Difficult', 'Good / Well', 'Bad', 'Distant'],
    correctIndex: 1,
    explanation: '好 (hǎo) means good, fine, or well. Example: 你好 (nǐ hǎo - hello).'
  },
  {
    id: 4,
    level: 1,
    hanzi: '爱',
    pinyin: 'ài',
    options: ['Angry', 'Afraid', 'To love', 'To hate'],
    correctIndex: 2,
    explanation: '爱 (ài) means to love or adore. Example: 我爱你 (wǒ ài nǐ - I love you).'
  },
  {
    id: 5,
    level: 1,
    hanzi: '吃',
    pinyin: 'chī',
    options: ['To drink', 'To eat', 'To sleep', 'To run'],
    correctIndex: 1,
    explanation: '吃 (chī) means to eat. Example: 吃饭 (chī fàn - have a meal / eat).'
  },
  {
    id: 6,
    level: 1,
    hanzi: '看',
    pinyin: 'kàn',
    options: ['To hear', 'To speak', 'To see / read', 'To touch'],
    correctIndex: 2,
    explanation: '看 (kàn) means to see, look, or read. Example: 看书 (kàn shū - read a book).'
  },
  {
    id: 7,
    level: 1,
    hanzi: '友',
    pinyin: 'yǒu',
    options: ['Teacher', 'Enemy', 'Stranger', 'Friend'],
    correctIndex: 3,
    explanation: '友 (yǒu) means friend or companion. Example: 朋友 (péngyou - friend).'
  },
  {
    id: 8,
    level: 1,
    hanzi: '家',
    pinyin: 'jiā',
    options: ['Home / Family', 'School', 'Office', 'Market'],
    correctIndex: 0,
    explanation: '家 (jiā) means family or home. Example: 回家 (huí jiā - go home).'
  },
  {
    id: 9,
    level: 1,
    hanzi: '月',
    pinyin: 'yuè',
    options: ['Star', 'Sun', 'Cloud', 'Moon / Month'],
    correctIndex: 3,
    explanation: '月 (yuè) means moon or month. Example: 月亮 (yuèliang - moon).'
  },
  {
    id: 10,
    level: 1,
    hanzi: '日',
    pinyin: 'rì',
    options: ['Sun / Day', 'Rain', 'Night', 'Lightning'],
    correctIndex: 0,
    explanation: '日 (rì) means sun or day. Example: 日期 (rìqī - date).'
  },
  {
    id: 11,
    level: 1,
    hanzi: '茶',
    pinyin: 'chá',
    options: ['Coffee', 'Milk', 'Tea', 'Water'],
    correctIndex: 2,
    explanation: '茶 (chá) means tea. Example: 中国茶 (zhōngguó chá - Chinese tea).'
  },
  {
    id: 12,
    level: 1,
    hanzi: '书',
    pinyin: 'shū',
    options: ['Pen', 'Book', 'Table', 'Paper'],
    correctIndex: 1,
    explanation: '书 (shū) means book. Example: 中文书 (zhōngwén shū - Chinese book).'
  },
  {
    id: 13,
    level: 1,
    hanzi: '买',
    pinyin: 'mǎi',
    options: ['To sell', 'To buy', 'To give', 'To borrow'],
    correctIndex: 1,
    explanation: '买 (mǎi) means to buy. Example: 买东西 (mǎi dōngxi - shopping).'
  },
  {
    id: 14,
    level: 1,
    hanzi: '来',
    pinyin: 'lái',
    options: ['To go', 'To come', 'To leave', 'To stay'],
    correctIndex: 1,
    explanation: '来 (lái) means to come or arrive. Example: 进来 (jìn lái - come in).'
  },
  {
    id: 15,
    level: 1,
    hanzi: '去',
    pinyin: 'qù',
    options: ['To go', 'To stay', 'To return', 'To wait'],
    correctIndex: 0,
    explanation: '去 (qù) means to go. Example: 去学校 (qù xuéxiào - go to school).'
  },
  {
    id: 16,
    level: 1,
    hanzi: '人',
    pinyin: 'rén',
    options: ['Animal', 'Tree', 'Person / People', 'Mountain'],
    correctIndex: 2,
    explanation: '人 (rén) means person or people. Example: 中国人 (zhōngguó rén - Chinese person).'
  },
  {
    id: 17,
    level: 1,
    hanzi: '大',
    pinyin: 'dà',
    options: ['Small', 'Big / Large', 'Short', 'Thin'],
    correctIndex: 1,
    explanation: '大 (dà) means big or large. Example: 大家 (dàjiā - everyone).'
  },
  {
    id: 18,
    level: 1,
    hanzi: '小',
    pinyin: 'xiǎo',
    options: ['Big', 'Heavy', 'Small / Little', 'Fast'],
    correctIndex: 2,
    explanation: '小 (xiǎo) means small or little. Example: 小朋友 (xiǎopéngyou - little child).'
  },
  {
    id: 19,
    level: 1,
    hanzi: '钱',
    pinyin: 'qián',
    options: ['Time', 'Money', 'Gold', 'Card'],
    correctIndex: 1,
    explanation: '钱 (qián) means money. Example: 多少钱 (duōshao qián - how much money).'
  },
  {
    id: 20,
    level: 1,
    hanzi: '雨',
    pinyin: 'yǔ',
    options: ['Snow', 'Wind', 'Rain', 'Fog'],
    correctIndex: 2,
    explanation: '雨 (yǔ) means rain. Example: 下雨 (xià yǔ - to rain).'
  },

  // --- HSK 2 (20 Questions) ---
  {
    id: 21,
    level: 2,
    hanzi: '便宜',
    pinyin: 'piányi',
    options: ['Expensive', 'Cheap / Inexpensive', 'Heavy', 'Clean'],
    correctIndex: 1,
    explanation: '便宜 (piányi) means cheap or inexpensive. Example: 很便宜 (very cheap).'
  },
  {
    id: 22,
    level: 2,
    hanzi: '贵',
    pinyin: 'guì',
    options: ['Cheap', 'Old', 'Expensive', 'Pretty'],
    correctIndex: 2,
    explanation: '贵 (guì) means expensive or costly. Example: 太贵了 (tài guì le - too expensive).'
  },
  {
    id: 23,
    level: 2,
    hanzi: '准备',
    pinyin: 'zhǔnbèi',
    options: ['To finish', 'To prepare', 'To forget', 'To cancel'],
    correctIndex: 1,
    explanation: '准备 (zhǔnbèi) means to prepare or get ready. Example: 准备考试 (prepare for exam).'
  },
  {
    id: 24,
    level: 2,
    hanzi: '机场',
    pinyin: 'jīchǎng',
    options: ['Train station', 'Airport', 'Harbor', 'Subway stop'],
    correctIndex: 1,
    explanation: '机场 (jīchǎng) means airport. Example: 去机场 (qù jīchǎng - go to airport).'
  },
  {
    id: 25,
    level: 2,
    hanzi: '时间',
    pinyin: 'shíjiān',
    options: ['Date', 'Time', 'Place', 'Season'],
    correctIndex: 1,
    explanation: '时间 (shíjiān) means time. Example: 有时间 (yǒu shíjiān - have time).'
  },
  {
    id: 26,
    level: 2,
    hanzi: '跑步',
    pinyin: 'pǎobù',
    options: ['To swim', 'To walk', 'To dance', 'To run / jog'],
    correctIndex: 3,
    explanation: '跑步 (pǎobù) means to run or jog. Example: 早上跑步 (run in the morning).'
  },
  {
    id: 27,
    level: 2,
    hanzi: '咖啡',
    pinyin: 'kāfēi',
    options: ['Tea', 'Juice', 'Coffee', 'Milk'],
    correctIndex: 2,
    explanation: '咖啡 (kāfēi) means coffee. Example: 喝热咖啡 (drink hot coffee).'
  },
  {
    id: 28,
    level: 2,
    hanzi: '帮助',
    pinyin: 'bāngzhù',
    options: ['To help / assist', 'To ask', 'To teach', 'To thank'],
    correctIndex: 0,
    explanation: '帮助 (bāngzhù) means to help or assist. Example: 谢谢你的帮助 (thank you for your help).'
  },
  {
    id: 29,
    level: 2,
    hanzi: '运动',
    pinyin: 'yùndòng',
    options: ['Music', 'Exercise / Sports', 'Reading', 'Cooking'],
    correctIndex: 1,
    explanation: '运动 (yùndòng) means sports or exercise. Example: 喜欢运动 (like sports).'
  },
  {
    id: 30,
    level: 2,
    hanzi: '晴天',
    pinyin: 'qíngtiān',
    options: ['Rainy day', 'Cloudy day', 'Sunny day', 'Snowy day'],
    correctIndex: 2,
    explanation: '晴天 (qíngtiān) means sunny or clear day. Example: 明天是晴天 (tomorrow is sunny).'
  },
  {
    id: 31,
    level: 2,
    hanzi: '唱歌',
    pinyin: 'chànggē',
    options: ['To sing', 'To dance', 'To draw', 'To listen'],
    correctIndex: 0,
    explanation: '唱歌 (chànggē) means to sing songs. Example: 唱歌很好听 (sings very well).'
  },
  {
    id: 32,
    level: 2,
    hanzi: '跳舞',
    pinyin: 'tiàowǔ',
    options: ['To sing', 'To sleep', 'To dance', 'To swim'],
    correctIndex: 2,
    explanation: '跳舞 (tiàowǔ) means to dance. Example: 学跳舞 (xué tiàowǔ - learn to dance).'
  },
  {
    id: 33,
    level: 2,
    hanzi: '生病',
    pinyin: 'shēngbìng',
    options: ['To recover', 'To fall ill / sick', 'To feel hungry', 'To exercise'],
    correctIndex: 1,
    explanation: '生病 (shēngbìng) means to get sick or ill. Example: 他生病了 (he is sick).'
  },
  {
    id: 34,
    level: 2,
    hanzi: '旅游',
    pinyin: 'lǚyóu',
    options: ['To travel', 'To study abroad', 'To relocate', 'To work'],
    correctIndex: 0,
    explanation: '旅游 (lǚyóu) means to travel or tour. Example: 去中国旅游 (travel to China).'
  },
  {
    id: 35,
    level: 2,
    hanzi: '休息',
    pinyin: 'xiūxi',
    options: ['To work', 'To rush', 'To rest', 'To practice'],
    correctIndex: 2,
    explanation: '休息 (xiūxi) means to rest or take a break. Example: 好好休息 (rest well).'
  },
  {
    id: 36,
    level: 2,
    hanzi: '送',
    pinyin: 'sòng',
    options: ['To receive', 'To give / escort', 'To borrow', 'To buy'],
    correctIndex: 1,
    explanation: '送 (sòng) means to give as a gift or see off. Example: 送礼物 (give a gift).'
  },
  {
    id: 37,
    level: 2,
    hanzi: '穿',
    pinyin: 'chuān',
    options: ['To remove', 'To buy', 'To wear / put on', 'To wash'],
    correctIndex: 2,
    explanation: '穿 (chuān) means to wear or put on clothes. Example: 穿新衣服 (wear new clothes).'
  },
  {
    id: 38,
    level: 2,
    hanzi: '欢迎',
    pinyin: 'huānyíng',
    options: ['Farewell', 'Welcome', 'Apology', 'Congratulations'],
    correctIndex: 1,
    explanation: '欢迎 (huānyíng) means to welcome. Example: 欢迎你来 (welcome you here).'
  },
  {
    id: 39,
    level: 2,
    hanzi: '事情',
    pinyin: 'shìqing',
    options: ['Thing / Matter', 'Person', 'Food', 'Building'],
    correctIndex: 0,
    explanation: '事情 (shìqing) means matter, affair, or task. Example: 很多事情 (many things).'
  },
  {
    id: 40,
    level: 2,
    hanzi: '身体',
    pinyin: 'shēntǐ',
    options: ['Mind', 'Body / Health', 'Spirit', 'Emotion'],
    correctIndex: 1,
    explanation: '身体 (shēntǐ) means body or health. Example: 身体健康 (good health).'
  },

  // --- HSK 3 (20 Questions) ---
  {
    id: 41,
    level: 3,
    hanzi: '环境',
    pinyin: 'huánjìng',
    options: ['Weather', 'Society', 'Environment', 'Nature'],
    correctIndex: 2,
    explanation: '环境 (huánjìng) means environment or surroundings. Example: 这里的环境很好 (the environment here is nice).'
  },
  {
    id: 42,
    level: 3,
    hanzi: '打算',
    pinyin: 'dǎsuàn',
    options: ['To forget', 'To plan / intend', 'To decide', 'To promise'],
    correctIndex: 1,
    explanation: '打算 (dǎsuàn) means to plan or intend to. Example: 你有什么打算 (what are your plans).'
  },
  {
    id: 43,
    level: 3,
    hanzi: '明白',
    pinyin: 'míngbai',
    options: ['To doubt', 'To forget', 'To discover', 'To understand'],
    correctIndex: 3,
    explanation: '明白 (míngbai) means to understand clearly. Example: 现在我明白了 (now I understand).'
  },
  {
    id: 44,
    level: 3,
    hanzi: '解决',
    pinyin: 'jiějué',
    options: ['To create', 'To solve / settle', 'To postpone', 'To cancel'],
    correctIndex: 1,
    explanation: '解决 (jiějué) means to resolve or settle. Example: 解决问题 (solve a problem).'
  },
  {
    id: 45,
    level: 3,
    hanzi: '发现',
    pinyin: 'fāxiàn',
    options: ['To discover / find', 'To lose', 'To search', 'To remember'],
    correctIndex: 0,
    explanation: '发现 (fāxiàn) means to discover or notice. Example: 发现新事物 (discover new things).'
  },
  {
    id: 46,
    level: 3,
    hanzi: '容易',
    pinyin: 'róngyì',
    options: ['Difficult', 'Easy / Simple', 'Important', 'Boring'],
    correctIndex: 1,
    explanation: '容易 (róngyì) means easy or simple. Example: 这个字很容易写 (this character is easy to write).'
  },
  {
    id: 47,
    level: 3,
    hanzi: '难',
    pinyin: 'nán',
    options: ['Easy', 'Fast', 'Difficult / Hard', 'Slow'],
    correctIndex: 2,
    explanation: '难 (nán) means difficult or hard. Example: 学汉语不难 (learning Chinese is not hard).'
  },
  {
    id: 48,
    level: 3,
    hanzi: '热情',
    pinyin: 'rèqíng',
    options: ['Cold', 'Shy', 'Enthusiastic / Warm', 'Polite'],
    correctIndex: 2,
    explanation: '热情 (rèqíng) means enthusiastic or warm. Example: 热情待客 (warm hospitality).'
  },
  {
    id: 49,
    level: 3,
    hanzi: '健康',
    pinyin: 'jiànkāng',
    options: ['Sick', 'Healthy / Health', 'Tired', 'Weak'],
    correctIndex: 1,
    explanation: '健康 (jiànkāng) means healthy or health. Example: 保持健康 (stay healthy).'
  },
  {
    id: 50,
    level: 3,
    hanzi: '历史',
    pinyin: 'lìshǐ',
    options: ['Geography', 'History', 'Culture', 'Science'],
    correctIndex: 1,
    explanation: '历史 (lìshǐ) means history. Example: 中国历史 (Chinese history).'
  },
  {
    id: 51,
    level: 3,
    hanzi: '习惯',
    pinyin: 'xíguàn',
    options: ['Hobby', 'Dream', 'Habit / Accustomed', 'Goal'],
    correctIndex: 2,
    explanation: '习惯 (xíguàn) means habit or accustomed to. Example: 好习惯 (good habit).'
  },
  {
    id: 52,
    level: 3,
    hanzi: '希望',
    pinyin: 'xīwàng',
    options: ['To hope / wish', 'To regret', 'To refuse', 'To request'],
    correctIndex: 0,
    explanation: '希望 (xīwàng) means to hope or wish. Example: 希望你快乐 (hope you are happy).'
  },
  {
    id: 53,
    level: 3,
    hanzi: '方便',
    pinyin: 'fāngbiàn',
    options: ['Complicated', 'Crowded', 'Convenient', 'Expensive'],
    correctIndex: 2,
    explanation: '方便 (fāngbiàn) means convenient. Example: 坐地铁很方便 (taking subway is convenient).'
  },
  {
    id: 54,
    level: 3,
    hanzi: '聪明',
    pinyin: 'cōngming',
    options: ['Foolish', 'Clever / Smart', 'Honest', 'Funny'],
    correctIndex: 1,
    explanation: '聪明 (cōngming) means smart or clever. Example: 他很聪明 (he is very smart).'
  },
  {
    id: 55,
    level: 3,
    hanzi: '努力',
    pinyin: 'nǔlì',
    options: ['Lazy', 'Hardworking / Diligent', 'Careless', 'Passive'],
    correctIndex: 1,
    explanation: '努力 (nǔlì) means hardworking or to make effort. Example: 努力学习 (study hard).'
  },
  {
    id: 56,
    level: 3,
    hanzi: '满意',
    pinyin: 'mǎnyì',
    options: ['Disappointed', 'Satisfied / Pleased', 'Confused', 'Bored'],
    correctIndex: 1,
    explanation: '满意 (mǎnyì) means satisfied or pleased. Example: 很满意 (very satisfied).'
  },
  {
    id: 57,
    level: 3,
    hanzi: '选择',
    pinyin: 'xuǎnzé',
    options: ['To refuse', 'To choose / choice', 'To change', 'To compare'],
    correctIndex: 1,
    explanation: '选择 (xuǎnzé) means to choose or choice. Example: 做出选择 (make a choice).'
  },
  {
    id: 58,
    level: 3,
    hanzi: '声音',
    pinyin: 'shēngyīn',
    options: ['Sight', 'Taste', 'Smell', 'Voice / Sound'],
    correctIndex: 3,
    explanation: '声音 (shēngyīn) means sound or voice. Example: 优美的声音 (beautiful sound).'
  },
  {
    id: 59,
    level: 3,
    hanzi: '特别',
    pinyin: 'tèbié',
    options: ['Ordinary', 'Special / Especially', 'Common', 'Boring'],
    correctIndex: 1,
    explanation: '特别 (tèbié) means special or especially. Example: 特别喜欢 (especially like).'
  },
  {
    id: 60,
    level: 3,
    hanzi: '注意',
    pinyin: 'zhùyì',
    options: ['To ignore', 'To pay attention to', 'To forget', 'To allow'],
    correctIndex: 1,
    explanation: '注意 (zhùyì) means to pay attention to. Example: 注意安全 (pay attention to safety).'
  }
]

// True Fisher-Yates shuffle helper
function shuffleArray(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy
}

// Balanced random picker: guaranteed 1 from HSK 1, 1 from HSK 2, 1 from HSK 3
function pickRandomQuestions() {
  const pool1 = shuffleArray(CHALLENGE_QUESTION_BANK.filter((q) => q.level === 1))
  const pool2 = shuffleArray(CHALLENGE_QUESTION_BANK.filter((q) => q.level === 2))
  const pool3 = shuffleArray(CHALLENGE_QUESTION_BANK.filter((q) => q.level === 3))

  const selected = [pool1[0], pool2[0], pool3[0]]
  return shuffleArray(selected)
}

export default function HskExploreAndQuizSection() {
  // Left side: Active Tab Index (0: All, 1: Beginner, 2: Intermediate, 3: Advanced)
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)

  // Right side: Quiz state
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState(() => pickRandomQuestions(3))
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [answersHistory, setAnswersHistory] = useState([])
  const [isShaking, setIsShaking] = useState(false)

  const canvasRef = useRef(null)
  const currentTab = TABS_CONFIG[selectedTabIndex]
  const currentQuestion = quizQuestions[currentQIndex]

  // ==========================================
  // CELEBRATORY CONFETTI PARTICLE ANIMATION
  // ==========================================
  useEffect(() => {
    if (!quizCompleted) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    const particles = []
    const colors = ['#a83228', '#d97706', '#f59e0b', '#292723', '#10b981', '#fcd34d']

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Create 45 colorful confetti pieces
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 60,
        y: canvas.height / 3 + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 7,
        vy: -Math.random() * 6 - 2,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 8,
        opacity: 1
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let activeCount = 0

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.22
        p.rotation += p.vRot
        p.opacity -= 0.007

        if (p.opacity > 0 && p.y < canvas.height + 20) {
          activeCount++
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.globalAlpha = Math.max(0, p.opacity)
          ctx.fillStyle = p.color
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7)
          ctx.restore()
        }
      })

      if (activeCount > 0) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [quizCompleted])

  // Speech pronunciation helper
  const handlePlayAudio = (hanzi) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(hanzi)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.85
      window.speechSynthesis.speak(utterance)
    }
  }

  // Answer selection handler with feedback animation
  const handleSelectOption = (idx) => {
    if (selectedOption !== null) return

    setSelectedOption(idx)
    const isCorrect = idx === currentQuestion.correctIndex
    if (isCorrect) {
      setScore((prev) => prev + 1)
      setIsShaking(false)
    } else {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }

    setAnswersHistory((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        hanzi: currentQuestion.hanzi,
        pinyin: currentQuestion.pinyin,
        userOption: idx,
        isCorrect
      }
    ])
  }

  // Advance question
  const handleNextQuestion = () => {
    if (currentQIndex < quizQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsShaking(false)
    } else {
      setQuizCompleted(true)
    }
  }

  // Start challenge handler
  const handleStartQuiz = () => {
    setQuizQuestions(pickRandomQuestions(3))
    setCurrentQIndex(0)
    setSelectedOption(null)
    setScore(0)
    setQuizCompleted(false)
    setAnswersHistory([])
    setIsShaking(false)
    setQuizStarted(true)
  }

  return (
    <section className="relative z-10 w-full bg-[#fbf9f5] border-t border-[#ede5d8] pt-20 sm:pt-24 pb-16 sm:pb-20 px-5 sm:px-10 lg:px-16 overflow-hidden">
      {/* Background Atmospheric Artwork: Shanshui Mountains, Auspicious Clouds & Bamboo (No Hanzi Characters!) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Full-bleed Rice Paper Dot Grid Texture with Feathered Radial Fade (8% Opacity, No Cutoffs) */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(circle, #292723 1.25px, transparent 1.25px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 85% 80% at 50% 50%, #000 45%, transparent 98%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at 50% 50%, #000 45%, transparent 98%)'
          }}
        />

        {/* Soft Ambient Warm Scholar Glow */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cinnabar/[0.025] rounded-full blur-3xl" />


        {/* Top-Right: Delicate Ink Wash Bamboo Foliage Silhouette (竹影) */}
        <svg
          className="absolute -top-6 -right-6 w-60 sm:w-80 h-60 sm:h-80 text-charcoal/[0.03] pointer-events-none"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M165 0 L163 50 L164 52 L162 110 L163 112 L160 180 L163 180 L166 112 L165 110 L167 52 L166 50 L168 0 Z" />
          <path d="M163 45 Q135 50 115 68 Q138 60 163 48 Z" />
          <path d="M163 48 Q128 62 105 85 Q132 72 163 52 Z" />
          <path d="M163 52 Q142 72 125 100 Q148 82 164 55 Z" />
          <path d="M188 15 L186 65 L187 67 L185 130 L186 132 L183 200 L186 200 L189 132 L188 130 L190 67 L189 65 L191 15 Z" />
          <path d="M186 58 Q155 62 135 80 Q162 70 186 60 Z" />
          <path d="M186 62 Q150 78 128 100 Q160 85 186 66 Z" />
          <path d="M185 125 Q145 132 118 155 Q152 142 185 128 Z" />
        </svg>

        {/* Bottom: Flowing Layered Shanshui Mountain Mist (山水墨韵) */}
        <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-60 pointer-events-none select-none overflow-hidden">
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1440 240"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="shanshui-mist-back" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#292723" stopOpacity="0.04" />
                <stop offset="50%" stopColor="#292723" stopOpacity="0.015" />
                <stop offset="100%" stopColor="#292723" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="shanshui-mist-front" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a83228" stopOpacity="0.04" />
                <stop offset="60%" stopColor="#a83228" stopOpacity="0.01" />
                <stop offset="100%" stopColor="#a83228" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Back Distant Peaks */}
            <path
              d="M0,130 Q180,60 380,105 T760,70 T1140,95 T1440,65 L1440,240 L0,240 Z"
              fill="url(#shanshui-mist-back)"
            />
            <path
              d="M0,130 Q180,60 380,105 T760,70 T1140,95 T1440,65"
              stroke="#292723"
              strokeOpacity="0.07"
              strokeWidth="1.2"
              fill="none"
            />

            {/* Front Undulating Mist Ridge */}
            <path
              d="M0,165 Q240,115 520,150 T1040,125 T1440,140 L1440,240 L0,240 Z"
              fill="url(#shanshui-mist-front)"
            />
            <path
              d="M0,165 Q240,115 520,150 T1040,125 T1440,140"
              stroke="#a83228"
              strokeOpacity="0.07"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-[1260px] mx-auto">
        {/* Section Header: 1 Single Clean Line */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-medium text-charcoal tracking-tight">
            Explore HSK Levels & <span className="italic font-serif text-cinnabar">Test Your Chinese</span>
          </h2>
        </div>

        {/* 2-Column Layout: Uncoupled during quiz so left "All" card stays at natural height */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 ${quizStarted ? 'items-start' : 'items-stretch'}`}>
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: SEAMLESS FOLDER TABS + FOCUS + COMPACT CARDS */}
          {/* ========================================================= */}
          <div className={`lg:col-span-7 flex flex-col ${quizStarted ? '' : 'h-full'}`}>
            {/* Contiguous Folder-style Top Tabs (Seamless connection to card below) */}
            <div className="flex items-end -mb-px z-10 pl-2 overflow-x-auto scrollbar-none max-w-full">
              {TABS_CONFIG.map((tab, idx) => {
                const isActive = selectedTabIndex === idx

                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTabIndex(idx)}
                    className={`relative px-3 sm:px-6 py-2 sm:py-3 rounded-t-xl sm:rounded-t-2xl text-[11px] sm:text-sm font-semibold shrink-0 transition-all duration-200 cursor-pointer border-t border-x ${
                      isActive
                        ? 'bg-paper text-charcoal border-[#dcd2c3] z-20 shadow-xs font-bold'
                        : 'bg-[#ede5d6]/80 text-charcoal/65 hover:bg-[#ede5d6] hover:text-charcoal border-[#dcd2c3]/60 z-10'
                    }`}
                  >
                    <span className="relative">
                      {tab.name}
                      {isActive && (
                        <motion.span
                          layoutId="tabUnderline"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-cinnabar rounded-full"
                        />
                      )}
                    </span>

                    {/* Seamless bottom mask covering the top border of the card underneath */}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-paper z-30" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Folder Body Container */}
            <div className={`rounded-b-3xl rounded-tr-3xl border border-[#dcd2c3] bg-paper p-5 sm:p-6 shadow-[0_12px_32px_rgba(41,39,35,0.04)] flex flex-col justify-between ${quizStarted ? '' : 'flex-1'}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  {/* TAB 1: ALL - 6 Cards Grid (HSK 1 to 6) */}
                  {currentTab.id === 'all' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {ALL_HSK_LIST.map((hsk) => (
                        <motion.div
                          key={hsk.level}
                          whileHover={{ y: -3, scale: 1.015 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          className="group rounded-2xl border border-[#e8dfd2] bg-[#fffdfa] p-4 flex flex-col justify-between hover:border-cinnabar/40 hover:shadow-xs transition duration-200 cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-heading text-lg font-bold text-charcoal group-hover:text-cinnabar transition">
                                {hsk.title}
                              </span>
                              <span className="rounded-full bg-[#f4ece0] px-2 py-0.5 text-[10px] font-mono font-bold text-charcoal">
                                {hsk.wordsCount}
                              </span>
                            </div>

                            <span className="text-[11px] font-semibold text-cinnabar block mb-2">
                              {hsk.tier}
                            </span>

                            <div className="font-serif text-base text-charcoal/85 tracking-wider my-2">
                              {hsk.previewChars}
                            </div>
                          </div>

                          <div className="pt-2.5 border-t border-[#f0eae0] flex items-center justify-between">
                            <span className="text-[11px] text-muted">Core Vocab</span>
                            <Link
                              to="/flashcards"
                              className="text-xs font-semibold text-cinnabar group-hover:underline"
                            >
                              Practice →
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* TABS 2-4: Clean level breakdown with Focus & 4 Character Cards */
                    <div className="space-y-4">
                      {currentTab.levels.map((lvl) => (
                        <div
                          key={lvl.level}
                          className="rounded-2xl border border-[#e8dfd2] bg-[#fffdfa] p-4 sm:p-4.5 shadow-2xs space-y-2.5"
                        >
                          {/* Level Header: Clean & Direct (No subtitle description sentence) */}
                          <div className="flex items-center justify-between border-b border-[#f0eae0] pb-2.5">
                            <div className="flex items-center gap-2.5">
                              <span className="grid size-7 place-items-center rounded-lg bg-charcoal text-paper font-serif font-bold text-xs shadow-2xs">
                                {lvl.level}
                              </span>
                              <h4 className="font-heading text-base font-semibold text-charcoal leading-none">
                                {lvl.title}
                              </h4>
                              <span className="rounded-full bg-[#f4ece0] border border-[#e5dccd] px-2.5 py-0.5 text-[10px] font-mono font-bold text-charcoal">
                                {lvl.wordsCount}
                              </span>
                            </div>

                            <Link
                              to="/flashcards"
                              className="text-xs font-semibold text-cinnabar hover:underline"
                            >
                              Practice Flashcards →
                            </Link>
                          </div>

                          {/* Focus Section (Requested by user) */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                              Focus:
                            </span>
                            {lvl.topics.map((topic, i) => (
                              <span
                                key={i}
                                className="rounded-md bg-[#f6eee0] border border-[#ebe0d0] px-2 py-0.5 text-[10px] font-medium text-charcoal/80"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>

                          {/* 4 Spacious Character Flashcard Tiles */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                            {lvl.sampleWords.map((word, idx) => (
                              <motion.div
                                key={idx}
                                whileHover={{ y: -2, scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="rounded-xl bg-paper border border-[#e8dfd2] p-2.5 text-center shadow-2xs group hover:border-cinnabar/40 transition cursor-default"
                              >
                                <div className="flex items-center justify-center gap-1.5">
                                  <span className="font-serif text-xl font-medium text-charcoal group-hover:text-cinnabar transition">
                                    {word.hanzi}
                                  </span>
                                  <button
                                    onClick={() => handlePlayAudio(word.hanzi)}
                                    className="text-muted hover:text-cinnabar transition cursor-pointer p-0.5"
                                    title="Listen to pronunciation"
                                    aria-label={`Listen to ${word.hanzi}`}
                                  >
                                    <svg className="size-3 text-muted hover:text-cinnabar" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                  </button>
                                </div>
                                <p className="text-xs font-bold text-cinnabar mt-0.5">
                                  {word.pinyin}
                                </p>
                                <p className="text-[11px] text-charcoal/70 truncate mt-0.5 font-medium">
                                  {word.meaning}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Bottom Footer Note */}
              <div className="mt-4 pt-3 border-t border-[#f0eae0] flex items-center justify-between text-xs text-muted">
                <span className="text-[11px]">
                  Master full HSK vocabulary with Leitner spaced repetition.
                </span>
                <Link
                  to="/flashcards"
                  className="font-semibold text-cinnabar hover:underline text-xs"
                >
                  View All Decks →
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: MINI CHINESE CHALLENGE */}
          {/* ========================================================= */}
          <div className={`lg:col-span-5 flex flex-col ${quizStarted ? '' : 'h-full'}`}>
            <div className={`rounded-3xl border border-[#e5dccd] bg-paper p-5 sm:p-6 shadow-[0_12px_32px_rgba(41,39,35,0.06)] relative overflow-hidden flex flex-col justify-between ${quizStarted ? '' : 'flex-1'}`}>
              {/* Traditional Oriental Window Grille Lattice Medallion (No Hanzi Characters) */}
              <svg
                className="absolute -bottom-8 -right-8 size-48 text-charcoal/[0.035] pointer-events-none select-none"
                viewBox="0 0 160 160"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <circle cx="80" cy="80" r="70" strokeWidth="1.5" />
                <circle cx="80" cy="80" r="62" />
                <circle cx="80" cy="80" r="46" strokeDasharray="3 3" />
                <circle cx="80" cy="80" r="28" />
                <circle cx="80" cy="80" r="12" />
                <line x1="10" y1="80" x2="150" y2="80" />
                <line x1="80" y1="10" x2="80" y2="150" />
                <line x1="31" y1="31" x2="129" y2="129" strokeDasharray="4 4" />
                <line x1="129" y1="31" x2="31" y2="129" strokeDasharray="4 4" />
                <rect x="52" y="52" width="56" height="56" rx="4" />
              </svg>

              {/* Decorative Corner Accents */}
              <div className="absolute top-2.5 left-2.5 size-3 border-t-2 border-l-2 border-cinnabar/30 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 size-3 border-t-2 border-r-2 border-cinnabar/30 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 size-3 border-b-2 border-l-2 border-cinnabar/30 pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 size-3 border-b-2 border-r-2 border-cinnabar/30 pointer-events-none" />

              {/* Celebratory Confetti Canvas (Only active on completion) */}
              {quizCompleted && (
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 size-full pointer-events-none z-30"
                />
              )}

              {/* Top Accent Ribbon */}
              <div className="flex items-center justify-between pb-3 border-b border-[#f0eae0] text-xs relative z-10">
                <div className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-cinnabar animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cinnabar">
                    MINI CHINESE CHALLENGE
                  </span>
                </div>
                {quizStarted && !quizCompleted ? (
                  <button
                    onClick={() => setQuizStarted(false)}
                    className="text-[10px] text-muted hover:text-cinnabar transition-colors cursor-pointer"
                    title="Exit challenge"
                  >
                    Exit ✕
                  </button>
                ) : quizCompleted ? (
                  <button
                    onClick={() => {
                      setQuizStarted(false)
                      setQuizCompleted(false)
                    }}
                    className="text-[10px] text-muted hover:text-cinnabar transition-colors cursor-pointer"
                  >
                    Back to Intro
                  </button>
                ) : (
                  <span className="text-[10px] text-muted font-medium">HSK 1–3 Quick Test</span>
                )}
              </div>

              {/* Content: Start Screen OR Active Question OR Final Results */}
              <div className="my-auto py-2 relative z-10">
                {!quizStarted ? (
                  /* START SCREEN */
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="py-1 flex flex-col items-center text-center space-y-3.5 my-auto"
                  >
                    {/* Tian Zi Ge Mockup Icon with Seal Stamp */}
                    <div className="relative size-24 sm:size-28 rounded-2xl border-2 border-dashed border-cinnabar/30 bg-[#fffdfa] flex flex-col items-center justify-center shadow-inner select-none">
                      {/* Grid lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-0 right-0 h-px border-b border-dashed border-charcoal/10" />
                        <div className="absolute top-0 bottom-0 left-1/2 w-px border-r border-dashed border-charcoal/10" />
                      </div>
                      <span className="font-serif text-5xl sm:text-6xl text-cinnabar leading-none z-10">
                        测
                      </span>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider mt-1 z-10">
                        cè · challenge
                      </span>

                      {/* Oriental Red Seal Stamp */}
                      <span className="absolute -top-1.5 -right-1.5 rounded-sm border border-cinnabar/60 bg-cinnabar/10 px-1 py-0.5 font-serif text-[9px] font-bold text-cinnabar leading-none shadow-2xs">
                        初试
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1 max-w-sm">
                      <h3 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">
                        Ready to Test Your <span className="italic font-serif text-cinnabar">Chinese?</span>
                      </h3>
                      <p className="text-xs text-charcoal/70 leading-relaxed">
                        Test your vocabulary recognition in 3 quick questions.
                      </p>
                    </div>

                    {/* Format Sample Preview Card */}
                    <div className="w-full max-w-sm rounded-xl border border-[#e8dfd2] bg-[#fffdfa] p-2.5 flex items-center justify-between text-left shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-[#f6eee0] border border-[#e5dccd] grid place-items-center font-serif text-base text-charcoal font-semibold shadow-2xs">
                          好
                        </div>
                        <div>
                          <p className="text-xs font-bold text-charcoal leading-none">Format: Character Quiz</p>
                          <p className="text-[10px] text-muted mt-0.5">Identify meanings with instant feedback</p>
                        </div>
                      </div>
                      <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
                        Instant
                      </span>
                    </div>

                    {/* Start Button */}
                    <div className="pt-1">
                      <motion.button
                        onClick={handleStartQuiz}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center justify-center rounded-full bg-cinnabar hover:bg-[#88271e] text-white px-8 py-2.5 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        Start the Challenge Now
                      </motion.button>
                    </div>
                  </motion.div>
                ) : !quizCompleted ? (
                <div>
                  {/* Progress Header: Clean, "Score: 0" removed as requested */}
                  <div className="flex items-center justify-between text-[11px] mb-2 font-mono text-muted">
                    <span>Question {currentQIndex + 1} of {quizQuestions.length}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-[#f0eae0] rounded-full overflow-hidden mb-5">
                    <motion.div
                      className="h-full bg-cinnabar rounded-full"
                      initial={{ width: `${(currentQIndex / quizQuestions.length) * 100}%` }}
                      animate={{ width: `${((currentQIndex + 1) / quizQuestions.length) * 100}%` }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Character Flash Display (Tian Zi Ge Mockup) with smooth entry animation */}
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ scale: 0.94, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="relative mx-auto size-28 sm:size-32 rounded-2xl border-2 border-dashed border-[#dcd2c3] bg-[#fffdfa] flex flex-col items-center justify-center shadow-inner select-none mb-3"
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-0 right-0 h-px border-b border-dashed border-charcoal/10" />
                      <div className="absolute top-0 bottom-0 left-1/2 w-px border-r border-dashed border-charcoal/10" />
                    </div>

                    <span className="font-serif text-5xl sm:text-6xl text-charcoal leading-none z-10">
                      {currentQuestion.hanzi}
                    </span>
                    <span className="text-sm font-bold text-cinnabar mt-1 z-10">
                      {currentQuestion.pinyin}
                    </span>

                    {/* Audio pronunciation button with clean SVG icon */}
                    <button
                      onClick={() => handlePlayAudio(currentQuestion.hanzi)}
                      className="absolute bottom-1.5 right-1.5 size-7 rounded-full bg-paper border border-[#e5dccd] text-muted hover:text-cinnabar hover:border-cinnabar flex items-center justify-center text-xs transition shadow-2xs cursor-pointer z-20"
                      title="Listen to pronunciation"
                      aria-label="Listen to audio"
                    >
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  </motion.div>

                  {/* Question Prompt */}
                  <p className="text-center font-heading text-sm sm:text-base font-semibold text-charcoal mb-3">
                    What is the meaning of <span className="font-serif text-cinnabar font-bold">{currentQuestion.hanzi}</span> ({currentQuestion.pinyin})?
                  </p>

                  {/* 4 Multiple Choice Answer Options with Shake / Bounce Animation */}
                  <motion.div
                    animate={isShaking ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
                    transition={{ duration: 0.45 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {currentQuestion.options.map((optionText, optIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][optIdx]
                      const isChosen = selectedOption === optIdx
                      const isCorrect = optIdx === currentQuestion.correctIndex
                      const hasAnswered = selectedOption !== null

                      let buttonStyle = 'border-[#e5dccd] bg-[#fbf7f0] text-charcoal hover:border-cinnabar hover:bg-[#f6eee0]'
                      if (hasAnswered) {
                        if (isCorrect) {
                          buttonStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-500'
                        } else if (isChosen && !isCorrect) {
                          buttonStyle = 'border-rose-500 bg-rose-50 text-rose-800 font-bold'
                        } else {
                          buttonStyle = 'border-[#e8dfd2] bg-paper/50 text-charcoal/40'
                        }
                      }

                      return (
                        <motion.button
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          disabled={hasAnswered}
                          whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                          whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                          animate={hasAnswered && isChosen && isCorrect ? { scale: [1, 1.05, 1] } : {}}
                          className={`relative flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-colors duration-200 cursor-pointer ${buttonStyle}`}
                        >
                          <span className={`grid size-5 shrink-0 place-items-center rounded-md font-mono text-[10px] font-bold ${
                            hasAnswered && isCorrect
                              ? 'bg-emerald-600 text-white'
                              : hasAnswered && isChosen && !isCorrect
                              ? 'bg-rose-600 text-white'
                              : 'bg-paper text-muted border border-[#e5dccd]'
                          }`}>
                            {hasAnswered && isCorrect ? '✓' : hasAnswered && isChosen && !isCorrect ? '✕' : letter}
                          </span>
                          <span className="font-medium truncate">{optionText}</span>
                        </motion.button>
                      )
                    })}
                  </motion.div>

                  {/* Feedback / Explanation Box */}
                  <AnimatePresence>
                    {selectedOption !== null && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-3.5 pt-3 border-t border-[#f0eae0]"
                      >
                        <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2.5 ${
                          selectedOption === currentQuestion.correctIndex
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}>
                          {selectedOption === currentQuestion.correctIndex ? (
                            <svg className="size-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="size-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                          <div className="text-[11px] leading-snug">
                            <strong className="block mb-0.5">
                              {selectedOption === currentQuestion.correctIndex ? 'Spot On!' : 'Not Quite Right'}
                            </strong>
                            <p className="text-charcoal/80">{currentQuestion.explanation}</p>
                          </div>
                        </div>

                        {/* Next Question CTA Button */}
                        <div className="mt-3 text-right">
                          <motion.button
                            onClick={handleNextQuestion}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-1.5 rounded-full bg-cinnabar hover:bg-[#88271e] text-white px-5 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
                          >
                            <span>
                              {currentQIndex < quizQuestions.length - 1 ? 'Next Question' : 'View Results'}
                            </span>
                            <span>→</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* ================= QUIZ COMPLETED SUMMARY WITH CONFETTI ================= */
                <motion.div
                  initial={{ opacity: 0, scale: 0.93 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="text-center py-2 space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                    className="size-16 rounded-full bg-cinnabar/10 text-cinnabar mx-auto flex items-center justify-center shadow-xs"
                  >
                    <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.003 0H9.497m5.003 0a6 6 0 005.5-5.5V6.75a2.25 2.25 0 00-2.25-2.25H6.25A2.25 2.25 0 004 6.75v3.125a6 6 0 005.497 5.5m5.003 0H9.497" />
                    </svg>
                  </motion.div>

                  <div>
                    <span className="text-[10px] font-bold text-cinnabar uppercase tracking-wider">
                      CHALLENGE RESULTS
                    </span>
                    <h4 className="font-heading text-2xl font-bold text-charcoal mt-0.5">
                      Your Score: {score} / {quizQuestions.length} Correct
                    </h4>
                    <p className="text-xs text-charcoal/70 mt-1 max-w-xs mx-auto">
                      {score === 3
                        ? 'Outstanding! Your fundamental Chinese vocabulary is solid.'
                        : score >= 1
                        ? 'Great effort! Regular spaced repetition on our platform will quickly reinforce your memory.'
                        : 'Every journey begins with a single step. Start exploring HSK flashcards today!'}
                    </p>
                  </div>

                  {/* Quick Recap */}
                  <div className="rounded-2xl bg-[#fffdfa] border border-[#e8dfd2] p-3 text-left space-y-1.5">
                    {answersHistory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#f0eae0] last:border-b-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-charcoal text-sm">{item.hanzi}</span>
                          <span className="text-muted text-[11px]">({item.pinyin})</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.isCorrect ? '✓ Correct' : '✕ Incorrect'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <button
                      onClick={() => {
                        setQuizStarted(false)
                        setQuizCompleted(false)
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-[#dcd2c3] bg-paper hover:bg-[#f6eee0] text-charcoal px-5 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      Back to Intro
                    </button>

                    <Link
                      to="/register"
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-cinnabar hover:bg-[#88271e] text-white px-6 py-2 text-xs font-semibold shadow-sm transition hover:scale-102 active:scale-95 cursor-pointer"
                    >
                      Continue Practice
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        </div>
      </div>
    </section>
  )
}
