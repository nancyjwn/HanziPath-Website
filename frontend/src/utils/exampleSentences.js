// Concise, beginner-friendly everyday conversational sentences for HSK & CC-CEDICT words

const CURATED_SENTENCES = {
  // HSK 1
  '学': {
    chinese: '我喜欢学中文。',
    pinyin: 'Wǒ xǐhuan xué zhōngwén.',
    translation: 'I like learning Chinese.'
  },
  '学习': {
    chinese: '我们要好好学习。',
    pinyin: 'Wǒmen yào hǎohǎo xuéxí.',
    translation: 'We need to study well.'
  },
  '爱': {
    chinese: '我爱我的家人。',
    pinyin: 'Wǒ ài wǒ de jiārén.',
    translation: 'I love my family.'
  },
  '好': {
    chinese: '今天天气很好。',
    pinyin: 'Jīntiān tiānqì hěn hǎo.',
    translation: 'The weather is very good today.'
  },
  '吃': {
    chinese: '你想吃什么？',
    pinyin: 'Nǐ xiǎng chī shénme?',
    translation: 'What do you want to eat?'
  },
  '喝': {
    chinese: '请喝一杯茶。',
    pinyin: 'Qǐng hē yībēi chá.',
    translation: 'Please have a cup of tea.'
  },
  '看': {
    chinese: '我喜欢看书。',
    pinyin: 'Wǒ xǐhuan kàn shū.',
    translation: 'I like reading books.'
  },
  '买': {
    chinese: '我想买这个。',
    pinyin: 'Wǒ xiǎng mǎi zhège.',
    translation: 'I want to buy this.'
  },
  '做': {
    chinese: '你在做什么？',
    pinyin: 'Nǐ zài zuò shénme?',
    translation: 'What are you doing?'
  },
  '去': {
    chinese: '我们去学校吧。',
    pinyin: 'Wǒmen qù xuéxiào ba.',
    translation: 'Let\'s go to school.'
  },
  '来': {
    chinese: '请过来坐。',
    pinyin: 'Qǐng guòlái zuò.',
    translation: 'Please come and sit here.'
  },
  '朋友': {
    chinese: '他是我的好朋友。',
    pinyin: 'Tā shì wǒ de hǎo péngyou.',
    translation: 'He is my good friend.'
  },
  '老师': {
    chinese: '李老师教我们汉语。',
    pinyin: 'Lǐ lǎoshī jiāo wǒmen hànyǔ.',
    translation: 'Teacher Li teaches us Chinese.'
  },
  '书': {
    chinese: '这是一本好书。',
    pinyin: 'Zhè shì yī běn hǎo shū.',
    translation: 'This is a good book.'
  },
  '水': {
    chinese: '请给我一杯水。',
    pinyin: 'Qǐng gěi wǒ yī bēi shuǐ.',
    translation: 'Please give me a glass of water.'
  },
  '钱': {
    chinese: '这个多少钱？',
    pinyin: 'Zhège duōshao qián?',
    translation: 'How much is this?'
  },
  '明天': {
    chinese: '我们明天见！',
    pinyin: 'Wǒmen míngtiān jiàn!',
    translation: 'See you tomorrow!'
  },
  '今天': {
    chinese: '今天星期一。',
    pinyin: 'Jīntiān xīngqīyī.',
    translation: 'Today is Monday.'
  },
  '昨天': {
    chinese: '昨天我去了商店。',
    pinyin: 'Zuótiān wǒ qù le shāngdiàn.',
    translation: 'Yesterday I went to the store.'
  },
  '人': {
    chinese: '这里有很多朋友。',
    pinyin: 'Zhèlǐ yǒu hěn duō péngyou.',
    translation: 'There are many friends here.'
  },
  '家': {
    chinese: '我想回家了。',
    pinyin: 'Wǒ xiǎng huíjiā le.',
    translation: 'I want to go home.'
  },
  '爸爸': {
    chinese: '我爸爸是医生。',
    pinyin: 'Wǒ bàba shì yīshēng.',
    translation: 'My father is a doctor.'
  },
  '妈妈': {
    chinese: '妈妈在做饭。',
    pinyin: 'Māma zài zuòfàn.',
    translation: 'Mom is cooking.'
  },
  '喜欢': {
    chinese: '我很喜欢学中文。',
    pinyin: 'Wǒ hěn xǐhuan xué zhōngwén.',
    translation: 'I really like learning Chinese.'
  },
  '高兴': {
    chinese: '认识你很高兴！',
    pinyin: 'Rènshi nǐ hěn gāoxìng!',
    translation: 'Nice to meet you!'
  },
  '说': {
    chinese: '请慢一点说。',
    pinyin: 'Qǐng màn yīdiǎn shuō.',
    translation: 'Please speak a little slower.'
  },
  '听': {
    chinese: '你在听什么？',
    pinyin: 'Nǐ zài tīng shénme?',
    translation: 'What are you listening to?'
  },
  '写': {
    chinese: '我会写汉字。',
    pinyin: 'Wǒ huì xiě hànzì.',
    translation: 'I can write Chinese characters.'
  },
  '读': {
    chinese: '请跟我读。',
    pinyin: 'Qǐng gēn wǒ dú.',
    translation: 'Please read after me.'
  },
  '字': {
    chinese: '这个字怎么读？',
    pinyin: 'Zhège zì zěnme dú?',
    translation: 'How do you read this character?'
  },
  '茶': {
    chinese: '中国人喜欢喝茶。',
    pinyin: 'Zhōngguó rén xǐhuan hē chá.',
    translation: 'Chinese people like drinking tea.'
  },

  // HSK 2
  '明': {
    chinese: '明天的天气很好。',
    pinyin: 'Míngtiān de tiānqì hěn hǎo.',
    translation: 'Tomorrow\'s weather is very good.'
  },
  '咖啡': {
    chinese: '我想喝一杯热咖啡。',
    pinyin: 'Wǒ xiǎng hē yībēi rè kāfēi.',
    translation: 'I want to drink a cup of hot coffee.'
  },
  '帮助': {
    chinese: '谢谢你的帮助！',
    pinyin: 'Xièxie nǐ de bāngzhù!',
    translation: 'Thank you for your help!'
  },
  '时间': {
    chinese: '你现在有时间吗？',
    pinyin: 'Nǐ xiànzài yǒu shíjiān ma?',
    translation: 'Do you have time right now?'
  },
  '事情': {
    chinese: '今天有很多事情要做。',
    pinyin: 'Jīntiān yǒu hěn duō shìqing yào zuò.',
    translation: 'There are many things to do today.'
  },
  '身体': {
    chinese: '祝你身体健康！',
    pinyin: 'Zhù nǐ shēntǐ jiànkāng!',
    translation: 'Wishing you good health!'
  },
  '便宜': {
    chinese: '这本书很便宜。',
    pinyin: 'Zhè běn shū hěn piányi.',
    translation: 'This book is very cheap.'
  },
  '贵': {
    chinese: '这件衣服有点贵。',
    pinyin: 'Zhè jiàn yīfu yǒudiǎn guì.',
    translation: 'This piece of clothing is a bit expensive.'
  },
  '运动': {
    chinese: '多做运动对身体好。',
    pinyin: 'Duō zuò yùndòng duì shēntǐ hǎo.',
    translation: 'Exercising more is good for your health.'
  },
  '跑步': {
    chinese: '我每天早上跑步。',
    pinyin: 'Wǒ měitiān zǎoshang pǎobù.',
    translation: 'I go running every morning.'
  },
  '机场': {
    chinese: '我坐出租车去机场。',
    pinyin: 'Wǒ zuò chūzūchē qù jīchǎng.',
    translation: 'I am taking a taxi to the airport.'
  },
  '旅游': {
    chinese: '我喜欢去中国旅游。',
    pinyin: 'Wǒ xǐhuan qù Zhōngguó lǚyóu.',
    translation: 'I like traveling to China.'
  },
  '手机': {
    chinese: '这是我的新手机。',
    pinyin: 'Zhè shì wǒ de xīn shǒujī.',
    translation: 'This is my new phone.'
  },
  '电脑': {
    chinese: '我用电脑学中文。',
    pinyin: 'Wǒ yòng diànnǎo xué zhōngwén.',
    translation: 'I use a computer to learn Chinese.'
  },
  '准备': {
    chinese: '你准备好了吗？',
    pinyin: 'Nǐ zhǔnbèi hǎo le ma?',
    translation: 'Are you ready?'
  },

  // HSK 3
  '明白': {
    chinese: '现在我明白了。',
    pinyin: 'Xiànzài wǒ míngbai le.',
    translation: 'Now I understand.'
  },
  '发现': {
    chinese: '我发现了一个新词。',
    pinyin: 'Wǒ fāxiàn le yī gè xīn cí.',
    translation: 'I found a new word.'
  },
  '容易': {
    chinese: '这个汉字很容易写。',
    pinyin: 'Zhège hànzì hěn róngyì xiě.',
    translation: 'This Chinese character is very easy to write.'
  },
  '难': {
    chinese: '这个问题不难。',
    pinyin: 'Zhège wèntí bù nán.',
    translation: 'This question is not difficult.'
  },
  '解决': {
    chinese: '我们能解决这个问题。',
    pinyin: 'Wǒmen néng jiějué zhège wèntí.',
    translation: 'We can solve this problem.'
  },
  '需要': {
    chinese: '你需要帮助吗？',
    pinyin: 'Nǐ xūyào bāngzhù ma?',
    translation: 'Do you need help?'
  },
  '希望': {
    chinese: '希望你天天开心！',
    pinyin: 'Xīwàng nǐ tiāntiān kāixīn!',
    translation: 'Hope you are happy every day!'
  },
  '环境': {
    chinese: '这里的环境真安静。',
    pinyin: 'Zhèlǐ de huánjìng zhēn ānjìng.',
    translation: 'The environment here is really quiet.'
  },
  '热情': {
    chinese: '老师对大家很热情。',
    pinyin: 'Lǎoshī duì dàjiā hěn rèqíng.',
    translation: 'The teacher is very warm to everyone.'
  },
  '方便': {
    chinese: '坐地铁非常方便。',
    pinyin: 'Zuò dìtiě fēicháng fāngbiàn.',
    translation: 'Taking the subway is very convenient.'
  },
  '健康': {
    chinese: '多吃水果对健康好。',
    pinyin: 'Duō chī shuǐguǒ duì jiànkāng hǎo.',
    translation: 'Eating more fruit is good for your health.'
  },

  // HSK 4 - 6
  '坚持': {
    chinese: '坚持每天练习写字。',
    pinyin: 'Jiānchí měitiān liànxí xiězì.',
    translation: 'Persist in practicing writing every day.'
  },
  '成功': {
    chinese: '祝贺你取得成功！',
    pinyin: 'Zhùhè nǐ qǔdé chénggōng!',
    translation: 'Congratulations on your success!'
  },
  '经验': {
    chinese: '他有丰富的学习经验。',
    pinyin: 'Tā yǒu fēngfù de xuéxí jīngyàn.',
    translation: 'He has rich learning experience.'
  },
  '影响': {
    chinese: '好习惯会影响一生。',
    pinyin: 'Hǎo xíguàn huì yǐngxiǎng yīshēng.',
    translation: 'Good habits influence your whole life.'
  },
  '复杂': {
    chinese: '这个问题并不复杂。',
    pinyin: 'Zhège wèntí bìng bù fùzá.',
    translation: 'This problem is not complex.'
  },
  '交流': {
    chinese: '我们多用汉语交流吧。',
    pinyin: 'Wǒmen duō yòng hànyǔ jiāoliú ba.',
    translation: 'Let\'s communicate more in Chinese.'
  },
  '文化': {
    chinese: '中国传统文化很有趣。',
    pinyin: 'Zhōngguó chuántǒng wénhuà hěn yǒuqù.',
    translation: 'Traditional Chinese culture is very interesting.'
  },
  '甚至': {
    chinese: '他甚至忘记了吃午饭。',
    pinyin: 'Tā shènzhì wàngjì le chī wǔfàn.',
    translation: 'He even forgot to eat lunch.'
  },
  '几乎': {
    chinese: '今天我几乎学完了。',
    pinyin: 'Jīntiān wǒ jīhū xué wán le.',
    translation: 'Today I have almost finished studying.'
  },
  '关键': {
    chinese: '多练习是最关键的。',
    pinyin: 'Duō liànxí shì zuì guānjiàn de.',
    translation: 'Practicing often is the key.'
  },
  '责任': {
    chinese: '我们要对自己负责任。',
    pinyin: 'Wǒmen yào duì zìjǐ fù zérèn.',
    translation: 'We must be responsible for ourselves.'
  },
  '态度': {
    chinese: '认真的态度很重要。',
    pinyin: 'Rènzhēn de tàidu hěn zhòngyào.',
    translation: 'A serious attitude is very important.'
  },
  '发展': {
    chinese: '这个城市发展很快。',
    pinyin: 'Zhège chéngshì fāzhǎn hěn kuài.',
    translation: 'This city is developing very fast.'
  },
  '精彩': {
    chinese: '昨天的故事很精彩。',
    pinyin: 'Zuótiān de gùshi hěn jīngcǎi.',
    translation: 'Yesterday\'s story was wonderful.'
  },
  '丰富': {
    chinese: '生活每天都很丰富。',
    pinyin: 'Shēnghuó měitiān dōu hěn fēngfù.',
    translation: 'Life is rich and fulfilling every day.'
  },
  '值得': {
    chinese: '这本书很值得读。',
    pinyin: 'Zhè běn shū hěn zhídé dú.',
    translation: 'This book is well worth reading.'
  }
}

// Simple, concise fallback sentence templates for verbs, adjectives, and nouns
const VERB_TEMPLATES = [
  (w, m) => ({
    chinese: `我想学会${w}。`,
    pinyin: `Wǒ xiǎng xuéhuì ${w}.`,
    translation: `I want to learn to ${m}.`
  }),
  (w, m) => ({
    chinese: `我们一起${w}吧。`,
    pinyin: `Wǒmen yīqǐ ${w} ba.`,
    translation: `Let's ${m} together.`
  }),
  (w, m) => ({
    chinese: `他每天都${w}。`,
    pinyin: `Tā měitiān dōu ${w}.`,
    translation: `He ${m}s every day.`
  }),
  (w, m) => ({
    chinese: `你喜欢${w}吗？`,
    pinyin: `Nǐ xǐhuan ${w} ma?`,
    translation: `Do you like to ${m}?`
  })
]

const ADJ_TEMPLATES = [
  (w, m) => ({
    chinese: `这个东西很${w}。`,
    pinyin: `Zhège dōngxi hěn ${w}.`,
    translation: `This thing is very ${m}.`
  }),
  (w, m) => ({
    chinese: `今天感觉真${w}。`,
    pinyin: `Jīntiān gǎnjué zhēn ${w}.`,
    translation: `Today feels really ${m}.`
  }),
  (w, m) => ({
    chinese: `它看起来很${w}。`,
    pinyin: `Tā kàn qǐlái hěn ${w}.`,
    translation: `It looks very ${m}.`
  }),
  (w, m) => ({
    chinese: `大家都很${w}。`,
    pinyin: `Dàjiā dōu hěn ${w}.`,
    translation: `Everyone is very ${m}.`
  })
]

const NOUN_TEMPLATES = [
  (w, m) => ({
    chinese: `这是一个${w}。`,
    pinyin: `Zhè shì yī gè ${w}.`,
    translation: `This is a ${m}.`
  }),
  (w, m) => ({
    chinese: `我喜欢这个${w}。`,
    pinyin: `Wǒ xǐhuan zhège ${w}.`,
    translation: `I like this ${m}.`
  }),
  (w, m) => ({
    chinese: `你知道这个${w}吗？`,
    pinyin: `Nǐ zhīdào zhège ${w} ma?`,
    translation: `Do you know this ${m}?`
  }),
  (w, m) => ({
    chinese: `学中文离不开${w}。`,
    pinyin: `Xué zhōngwén lí bù kāi ${w}.`,
    translation: `Learning Chinese involves ${m}.`
  })
]

// Simple string hash to pick distinct templates deterministically per word
function hashWord(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Returns a simple, concise conversational sentence for any word.
 */
export function getWordExample(word) {
  if (!word) return null

  // 1. If backend API already provided an example object with chinese
  if (word.example && word.example.chinese) {
    return word.example
  }

  const simplified = word.simplified || ''
  if (CURATED_SENTENCES[simplified]) {
    return CURATED_SENTENCES[simplified]
  }

  // Clean primary meaning definition
  const rawMeaning = Array.isArray(word.meanings) && word.meanings.length > 0
    ? word.meanings[0].split(';')[0].split(',')[0].replace(/\(.*?\)/g, '').trim()
    : 'this word'

  const hash = hashWord(simplified || 'word')

  // Check if meaning is a verb (starts with 'to ')
  if (rawMeaning.toLowerCase().startsWith('to ')) {
    const verbClean = rawMeaning.replace(/^to\s+/i, '')
    const template = VERB_TEMPLATES[hash % VERB_TEMPLATES.length]
    return template(simplified, verbClean)
  }

  // Check if likely adjective
  const isAdj = /ful$|able$|ible$|ous$|ish$|ive$|wide$|deep$|high$|quick$|slow$|easy$|hard$|cold$|hot$|clean$|tired$/i.test(rawMeaning)
  if (isAdj) {
    const template = ADJ_TEMPLATES[hash % ADJ_TEMPLATES.length]
    return template(simplified, rawMeaning)
  }

  // Default to noun / general topic
  const template = NOUN_TEMPLATES[hash % NOUN_TEMPLATES.length]
  return template(simplified, rawMeaning)
}
