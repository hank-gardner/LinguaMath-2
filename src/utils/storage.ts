import { AppSettings, Card, Deck, ReviewLog, Subject } from '../types';
import { getCardBopomofo } from './bopomofo';

const STORAGE_KEYS = {
  CARDS: 'linguamath_cards_v1',
  DECKS: 'linguamath_decks_v1',
  LOGS: 'linguamath_logs_v1',
  SETTINGS: 'linguamath_settings_v1',
  STREAK: 'linguamath_streak_v1',
};

export const DEFAULT_DECKS: Deck[] = [
  { id: 'deck-zh-hsk1', name: 'HSK 1 & 2 Essentials', subject: 'chinese', description: 'Fundamental vocabulary for daily communication', createdAt: '2026-01-01' },
  { id: 'deck-zh-daily', name: 'Daily Life & School', subject: 'chinese', description: 'Words for school, study, and daily activities', createdAt: '2026-01-01' },
  { id: 'deck-en-advanced', name: 'Academic & SAT Vocabulary', subject: 'english', description: 'High-frequency words for essays and exams', createdAt: '2026-01-01' },
  { id: 'deck-en-idioms', name: 'Verbs & Connectors', subject: 'english', description: 'Transitions and expressive vocabulary', createdAt: '2026-01-01' },
  { id: 'deck-math-algebra', name: 'Algebra & Equations', subject: 'math', description: 'Linear equations, expressions, and problem solving', createdAt: '2026-01-01' },
  { id: 'deck-math-geom', name: 'Geometry & Statistics', subject: 'math', description: 'Shapes, angles, Pythagoras, and basic statistics', createdAt: '2026-01-01' },
  { id: 'deck-math-arith', name: 'Arithmetic & Fractions', subject: 'math', description: 'Fractions, percentages, ratios, mental math', createdAt: '2026-01-01' },
];

export const DEFAULT_CARDS: Card[] = [
  // --- CHINESE ---
  {
    id: 'zh-1',
    subject: 'chinese',
    deckId: 'deck-zh-hsk1',
    chineseWord: '苹果',
    pinyin: 'píngguǒ',
    englishMeaning: 'apple',
    exampleSentence: '我喜欢吃新鲜的苹果。',
    difficulty: 'beginner',
    tags: ['food', 'fruit', 'noun'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'zh-2',
    subject: 'chinese',
    deckId: 'deck-zh-daily',
    chineseWord: '学习',
    pinyin: 'xuéxí',
    englishMeaning: 'to study / to learn',
    exampleSentence: '每天认真学习，一定能取得好成绩。',
    difficulty: 'beginner',
    tags: ['school', 'verb'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'zh-3',
    subject: 'chinese',
    deckId: 'deck-zh-hsk1',
    chineseWord: '朋友',
    pinyin: 'péngyou',
    englishMeaning: 'friend',
    exampleSentence: '他是我在学校认识的好朋友。',
    difficulty: 'beginner',
    tags: ['people', 'noun'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'zh-4',
    subject: 'chinese',
    deckId: 'deck-zh-hsk1',
    chineseWord: '谢谢',
    pinyin: 'xièxie',
    englishMeaning: 'thank you / thanks',
    exampleSentence: '非常感谢你的热心帮助！',
    difficulty: 'beginner',
    tags: ['politeness', 'greeting'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'zh-5',
    subject: 'chinese',
    deckId: 'deck-zh-daily',
    chineseWord: '喝水',
    pinyin: 'hē shuǐ',
    englishMeaning: 'to drink water',
    exampleSentence: '运动之后要记得多喝水。',
    difficulty: 'beginner',
    tags: ['health', 'daily'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'zh-6',
    subject: 'chinese',
    deckId: 'deck-zh-daily',
    chineseWord: '电脑',
    pinyin: 'diànnǎo',
    englishMeaning: 'computer',
    exampleSentence: '学生们用电脑上网查找学习资料。',
    difficulty: 'beginner',
    tags: ['technology', 'noun'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'zh-7',
    subject: 'chinese',
    deckId: 'deck-zh-hsk1',
    chineseWord: '高兴',
    pinyin: 'gāoxìng',
    englishMeaning: 'happy / pleased / glad',
    exampleSentence: '今天听到了好消息，大家都很高兴。',
    difficulty: 'intermediate',
    tags: ['emotion', 'adjective'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'zh-8',
    subject: 'chinese',
    deckId: 'deck-zh-daily',
    chineseWord: '努力',
    pinyin: 'nǔlì',
    englishMeaning: 'hardworking / to strive',
    exampleSentence: '只要坚持努力，梦想就能实现。',
    difficulty: 'intermediate',
    tags: ['character', 'adjective'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'zh-9',
    subject: 'chinese',
    deckId: 'deck-zh-daily',
    chineseWord: '准备',
    pinyin: 'zhǔnbèi',
    englishMeaning: 'to prepare / get ready',
    exampleSentence: '你准备好明天的期末考试了吗？',
    difficulty: 'intermediate',
    tags: ['verb', 'school'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'zh-10',
    subject: 'chinese',
    deckId: 'deck-zh-hsk1',
    chineseWord: '勇敢',
    pinyin: 'yǒnggǎn',
    englishMeaning: 'brave / courageous',
    exampleSentence: '面对未知时，我们要保持勇敢。',
    difficulty: 'advanced',
    tags: ['personality', 'adjective'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },

  // --- ENGLISH ---
  {
    id: 'en-1',
    subject: 'english',
    deckId: 'deck-en-idioms',
    word: 'Nevertheless',
    definition: 'In spite of that; however',
    exampleSentence: 'It was raining heavily; nevertheless, we decided to proceed with the hike.',
    synonyms: ['nonetheless', 'however', 'still', 'yet'],
    antonyms: ['therefore', 'consequently'],
    difficulty: 'intermediate',
    tags: ['connector', 'formal', 'writing'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'en-2',
    subject: 'english',
    deckId: 'deck-en-advanced',
    word: 'Serendipity',
    definition: 'The occurrence of events by chance in a happy or beneficial way',
    exampleSentence: 'Finding my favorite out-of-print book in a roadside cafe was pure serendipity.',
    synonyms: ['chance', 'fluke', 'good fortune', 'luck'],
    antonyms: ['misfortune', 'catastrophe'],
    difficulty: 'advanced',
    tags: ['noun', 'literature', 'expressive'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'en-3',
    subject: 'english',
    deckId: 'deck-en-advanced',
    word: 'Meticulous',
    definition: 'Showing great attention to detail; very careful and precise',
    exampleSentence: 'The researcher kept meticulous records of every variable during the experiment.',
    synonyms: ['thorough', 'diligent', 'scrupulous', 'exact'],
    antonyms: ['careless', 'sloppy', 'negligent'],
    difficulty: 'intermediate',
    tags: ['adjective', 'academic'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'en-4',
    subject: 'english',
    deckId: 'deck-en-advanced',
    word: 'Ephemeral',
    definition: 'Lasting for a very short time; transitory',
    exampleSentence: 'The beauty of the morning mist over the valley proved ephemeral.',
    synonyms: ['fleeting', 'transient', 'momentary', 'brief'],
    antonyms: ['permanent', 'enduring', 'eternal'],
    difficulty: 'advanced',
    tags: ['adjective', 'poetry', 'sat'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'en-5',
    subject: 'english',
    deckId: 'deck-en-advanced',
    word: 'Resilient',
    definition: 'Able to withstand or recover quickly from difficult conditions',
    exampleSentence: 'The small community showed how resilient it was following the storm.',
    synonyms: ['tough', 'adaptable', 'buoyant', 'strong'],
    antonyms: ['fragile', 'vulnerable', 'weak'],
    difficulty: 'intermediate',
    tags: ['adjective', 'character'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'en-6',
    subject: 'english',
    deckId: 'deck-en-advanced',
    word: 'Ubiquitous',
    definition: 'Present, appearing, or found everywhere at once',
    exampleSentence: 'In the digital era, wireless internet connectivity has become ubiquitous.',
    synonyms: ['omnipresent', 'pervasive', 'widespread', 'universal'],
    antonyms: ['rare', 'scarce', 'isolated'],
    difficulty: 'advanced',
    tags: ['adjective', 'academic'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'en-7',
    subject: 'english',
    deckId: 'deck-en-advanced',
    word: 'Pragmatic',
    definition: 'Dealing with things sensibly and realistically based on practical factors',
    exampleSentence: 'Rather than debating theory, they adopted a pragmatic plan to meet the deadline.',
    synonyms: ['practical', 'sensible', 'realistic', 'functional'],
    antonyms: ['idealistic', 'impractical', 'visionary'],
    difficulty: 'intermediate',
    tags: ['adjective', 'decision-making'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'en-8',
    subject: 'english',
    deckId: 'deck-en-advanced',
    word: 'Lucid',
    definition: 'Expressed clearly; easy to understand; or thinking with clarity',
    exampleSentence: 'The lecture offered a lucid explanation of complex thermodynamic principles.',
    synonyms: ['clear', 'coherent', 'articulate', 'luminous'],
    antonyms: ['confusing', 'obscure', 'muddled'],
    difficulty: 'intermediate',
    tags: ['adjective', 'communication'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },

  // --- MATHEMATICS ---
  {
    id: 'math-1',
    subject: 'math',
    deckId: 'deck-math-algebra',
    question: 'Solve for x: 3x + 7 = 22',
    answer: 'x = 5',
    formula: 'ax + b = c  ⟹  ax = c - b  ⟹  x = (c - b) / a',
    explanation: 'Step 1: Subtract 7 from both sides: 3x = 22 - 7 = 15.\nStep 2: Divide both sides by 3: x = 15 ÷ 3 = 5.',
    topic: 'Equations',
    difficulty: 'beginner',
    tags: ['algebra', 'linear-equations'],
    isProcedural: true,
    generatorType: 'linear-eq',
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'math-2',
    subject: 'math',
    deckId: 'deck-math-arith',
    question: 'Calculate: 17 × 6 = ?',
    answer: '102',
    explanation: 'Mental Breakdown: 17 × 6 = (10 × 6) + (7 × 6) = 60 + 42 = 102.',
    topic: 'Arithmetic',
    difficulty: 'beginner',
    tags: ['multiplication', 'mental-math'],
    isProcedural: true,
    generatorType: 'arithmetic-mult',
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'math-3',
    subject: 'math',
    deckId: 'deck-math-arith',
    question: 'Add and simplify: 2/3 + 1/4 = ?',
    answer: '11/12',
    explanation: 'Step 1: Find common denominator of 3 and 4, which is 12.\nStep 2: 2/3 = 8/12 and 1/4 = 3/12.\nStep 3: 8/12 + 3/12 = 11/12.',
    topic: 'Fractions',
    difficulty: 'intermediate',
    tags: ['fractions', 'addition'],
    isProcedural: true,
    generatorType: 'fractions-add',
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'math-4',
    subject: 'math',
    deckId: 'deck-math-arith',
    question: 'What is 15% of 160?',
    answer: '24',
    formula: 'Percentage = (Rate / 100) × Base',
    explanation: '10% of 160 is 16. 5% of 160 is half of 16, which is 8.\nTherefore, 15% = 16 + 8 = 24.',
    topic: 'Percentages',
    difficulty: 'beginner',
    tags: ['percentages', 'mental-math'],
    isProcedural: true,
    generatorType: 'percent-calc',
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'math-5',
    subject: 'math',
    deckId: 'deck-math-arith',
    question: 'Divide $120 in the ratio 2 : 3.',
    answer: '$48 and $72',
    formula: 'Value per part = Total / (Ratio A + Ratio B)',
    explanation: 'Total parts = 2 + 3 = 5 parts.\nValue of 1 part = $120 ÷ 5 = $24.\nPart 1: 2 × $24 = $48\nPart 2: 3 × $24 = $72',
    topic: 'Ratios',
    difficulty: 'intermediate',
    tags: ['ratios', 'proportions'],
    isProcedural: true,
    generatorType: 'ratios-divide',
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'math-6',
    subject: 'math',
    deckId: 'deck-math-geom',
    question: 'In a right-angled triangle with legs a = 6 cm and b = 8 cm, find hypotenuse c.',
    answer: 'c = 10 cm',
    formula: 'a² + b² = c²  ⟹  c = √(a² + b²)',
    explanation: 'c² = 6² + 8² = 36 + 64 = 100.\nc = √100 = 10 cm.',
    topic: 'Geometry',
    difficulty: 'intermediate',
    tags: ['pythagoras', 'triangles'],
    isProcedural: true,
    generatorType: 'geometry-pythagoras',
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'math-7',
    subject: 'math',
    deckId: 'deck-math-geom',
    question: 'Find the area of a circle with radius r = 7 cm (take π ≈ 22/7).',
    answer: 'Area = 154 cm²',
    formula: 'Area = πr²',
    explanation: 'Area = (22 / 7) × 7² = (22 / 7) × 49 = 22 × 7 = 154 cm².',
    topic: 'Geometry',
    difficulty: 'beginner',
    tags: ['geometry', 'circle', 'area'],
    isProcedural: true,
    generatorType: 'geometry-circle',
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'math-8',
    subject: 'math',
    deckId: 'deck-math-geom',
    question: 'Find the mean of the data set: [4, 7, 9, 12, 18]',
    answer: 'Mean = 10',
    formula: 'Mean = Sum of elements ÷ Number of elements',
    explanation: 'Sum = 4 + 7 + 9 + 12 + 18 = 50.\nCount = 5 numbers.\nMean = 50 ÷ 5 = 10.',
    topic: 'Basic Statistics',
    difficulty: 'beginner',
    tags: ['statistics', 'averages'],
    isProcedural: true,
    generatorType: 'stats-mean',
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'math-9',
    subject: 'math',
    deckId: 'deck-math-algebra',
    question: 'Expand and simplify: (x + 3)(x - 5)',
    answer: 'x² - 2x - 15',
    formula: '(x + a)(x + b) = x² + (a + b)x + ab',
    explanation: 'FOIL method:\nFirst: x · x = x²\nOutside: x · (-5) = -5x\nInside: 3 · x = 3x\nLast: 3 · (-5) = -15\nCombine like terms: x² - 2x - 15',
    topic: 'Algebra',
    difficulty: 'intermediate',
    tags: ['algebra', 'expansion', 'polynomials'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
  {
    id: 'math-10',
    subject: 'math',
    deckId: 'deck-math-arith',
    question: 'A jacket originally costing $80 is discounted by 25%. What is the sale price?',
    answer: '$60',
    formula: 'Sale Price = Original - (Discount Rate × Original)',
    explanation: 'Discount amount = 25% of $80 = 0.25 × $80 = $20.\nSale price = $80 - $20 = $60.',
    topic: 'Percentages',
    difficulty: 'intermediate',
    tags: ['percentages', 'finance', 'word-problem'],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    reviewCount: 0,
    forgotCount: 0,
    hardCount: 0,
    easyCount: 0,
    createdAt: '2026-01-01',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  dailyTarget: 20,
  includedSubjects: ['chinese', 'english', 'math'],
  prioritizeDifficult: true,
  randomizeOrder: true,
  chineseDirection: 'zh-en',
  englishDirection: 'word-def',
  soundEnabled: true,
  speechRate: 0.9,
  theme: 'light',
};

export class StorageService {
  public static getCards(): Card[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CARDS);
      if (!data) {
        this.saveCards(DEFAULT_CARDS);
        return DEFAULT_CARDS;
      }
      const parsed = JSON.parse(data) as Card[];
      return parsed.map((c) => {
        if (c.subject === 'chinese' && !c.bopomofo) {
          return { ...c, bopomofo: getCardBopomofo(c) };
        }
        return c;
      });
    } catch {
      return DEFAULT_CARDS;
    }
  }

  public static saveCards(cards: Card[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    } catch (e) {
      console.error('Failed to save cards to localStorage', e);
    }
  }

  public static getDecks(): Deck[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DECKS);
      if (!data) {
        this.saveDecks(DEFAULT_DECKS);
        return DEFAULT_DECKS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_DECKS;
    }
  }

  public static saveDecks(decks: Deck[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
    } catch (e) {
      console.error('Failed to save decks', e);
    }
  }

  public static getLogs(): ReviewLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static addReviewLog(log: ReviewLog): void {
    try {
      const logs = this.getLogs();
      logs.push(log);
      // Keep last 1000 logs to prevent bloat
      const trimmed = logs.slice(-1000);
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(trimmed));
      this.updateStreak();
    } catch (e) {
      console.error('Failed to append log', e);
    }
  }

  public static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  public static getStreakData(): { currentStreak: number; longestStreak: number; lastStudyDate: string } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (!data) {
        return { currentStreak: 1, longestStreak: 1, lastStudyDate: new Date().toISOString().split('T')[0] };
      }
      return JSON.parse(data);
    } catch {
      return { currentStreak: 1, longestStreak: 1, lastStudyDate: new Date().toISOString().split('T')[0] };
    }
  }

  public static updateStreak(): { currentStreak: number; longestStreak: number } {
    const today = new Date().toISOString().split('T')[0];
    const prev = this.getStreakData();

    if (prev.lastStudyDate === today) {
      return { currentStreak: prev.currentStreak, longestStreak: prev.longestStreak };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentStreak = prev.currentStreak;
    if (prev.lastStudyDate === yesterdayStr) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    const longestStreak = Math.max(prev.longestStreak, currentStreak);
    const newStreak = { currentStreak, longestStreak, lastStudyDate: today };

    try {
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(newStreak));
    } catch (e) {
      console.error('Streak update failed', e);
    }

    return { currentStreak, longestStreak };
  }

  public static resetToDefaults(): void {
    this.saveCards(DEFAULT_CARDS);
    this.saveDecks(DEFAULT_DECKS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.STREAK);
    this.saveSettings(DEFAULT_SETTINGS);
  }

  // --- Export and Import ---
  public static exportAllJSON(): string {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      decks: this.getDecks(),
      cards: this.getCards(),
      settings: this.getSettings(),
      logs: this.getLogs(),
      streak: this.getStreakData(),
    };
    return JSON.stringify(payload, null, 2);
  }

  public static importAllJSON(jsonString: string): { success: boolean; message: string; count?: number } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || (!Array.isArray(parsed.cards) && !Array.isArray(parsed.decks))) {
        return { success: false, message: 'Invalid file format. Missing cards or decks.' };
      }

      if (Array.isArray(parsed.decks)) {
        this.saveDecks(parsed.decks);
      }
      if (Array.isArray(parsed.cards)) {
        this.saveCards(parsed.cards);
      }
      if (parsed.settings) {
        this.saveSettings(parsed.settings);
      }
      if (Array.isArray(parsed.logs)) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(parsed.logs));
      }

      return {
        success: true,
        message: `Successfully imported ${parsed.cards?.length || 0} cards and ${parsed.decks?.length || 0} decks.`,
        count: parsed.cards?.length || 0,
      };
    } catch (err: unknown) {
      return { success: false, message: 'Failed to parse JSON file: ' + (err instanceof Error ? err.message : 'Unknown error') };
    }
  }

  public static exportCardsCSV(cards: Card[]): string {
    const headers = ['id', 'subject', 'deckId', 'difficulty', 'front', 'back', 'extra', 'tags'];
    const rows = cards.map((c) => {
      let front = '';
      let back = '';
      let extra = '';

      if (c.subject === 'chinese') {
        front = c.chineseWord || '';
        back = `${c.pinyin || ''} | ${c.englishMeaning || ''}`;
        extra = c.exampleSentence || '';
      } else if (c.subject === 'english') {
        front = c.word || '';
        back = c.definition || '';
        extra = (c.synonyms || []).join('; ');
      } else {
        front = c.question || '';
        back = c.answer || '';
        extra = c.explanation || '';
      }

      const escape = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

      return [
        escape(c.id),
        escape(c.subject),
        escape(c.deckId),
        escape(c.difficulty),
        escape(front),
        escape(back),
        escape(extra),
        escape((c.tags || []).join(',')),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  public static importCardsCSV(csvString: string, targetSubject: Subject, targetDeckId: string): { success: boolean; count: number; message: string } {
    try {
      const lines = csvString.trim().split(/\r?\n/);
      if (lines.length < 2) {
        return { success: false, count: 0, message: 'CSV file is empty or missing data rows.' };
      }

      const newCards: Card[] = [];
      // Simple CSV row parser handling quotes
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      // Check header
      const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
      const hasFront = header.includes('front') || header.includes('word') || header.includes('question') || header.includes('chinese');

      const startIndex = hasFront ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 2) continue;

        const id = 'card-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        const col0 = cols[0] || '';
        const col1 = cols[1] || '';
        const col2 = cols[2] || '';

        const card: Card = {
          id,
          subject: targetSubject,
          deckId: targetDeckId,
          difficulty: 'intermediate',
          tags: ['imported'],
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          reviewCount: 0,
          forgotCount: 0,
          hardCount: 0,
          easyCount: 0,
          createdAt: new Date().toISOString(),
        };

        if (targetSubject === 'chinese') {
          card.chineseWord = col0;
          card.englishMeaning = col1;
          card.pinyin = col2;
        } else if (targetSubject === 'english') {
          card.word = col0;
          card.definition = col1;
          if (col2) card.exampleSentence = col2;
        } else {
          card.question = col0;
          card.answer = col1;
          if (col2) card.explanation = col2;
          card.topic = 'General';
        }

        newCards.push(card);
      }

      if (newCards.length === 0) {
        return { success: false, count: 0, message: 'No valid flashcard rows found in CSV.' };
      }

      const existing = this.getCards();
      this.saveCards([...existing, ...newCards]);

      return { success: true, count: newCards.length, message: `Imported ${newCards.length} cards successfully.` };
    } catch (e: unknown) {
      return { success: false, count: 0, message: 'CSV parse error: ' + (e instanceof Error ? e.message : 'Unknown') };
    }
  }
}
