export type Subject = 'chinese' | 'english' | 'math';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'ultra-hard';

export type Rating = 'forgot' | 'hard' | 'easy';

export type ChineseDirection = 'zh-en' | 'en-zh' | 'zh-pinyin' | 'pinyin-zh';

export type EnglishDirection = 'word-def' | 'def-word';

export type MathTopic =
  | 'Arithmetic'
  | 'Fractions'
  | 'Percentages'
  | 'Ratios'
  | 'Algebra'
  | 'Equations'
  | 'Geometry'
  | 'Graphs'
  | 'Basic Statistics'
  | 'General';

export interface Card {
  id: string;
  subject: Subject;
  deckId: string;
  createdAt: string;
  difficulty: Difficulty;
  tags: string[];
  notes?: string;

  // Spaced Repetition (SRS)
  interval: number; // in days
  repetitions: number;
  easeFactor: number; // starts at ~2.5
  lastReviewed?: string;
  nextReviewDate: string; // ISO date string
  reviewCount: number;
  forgotCount: number;
  hardCount: number;
  easyCount: number;

  // Chinese-specific
  chineseWord?: string;
  pinyin?: string;
  bopomofo?: string;
  englishMeaning?: string;
  exampleSentence?: string;

  // English-specific
  word?: string;
  definition?: string;
  synonyms?: string[];
  antonyms?: string[];

  // Math-specific
  question?: string;
  answer?: string;
  formula?: string;
  explanation?: string; // step-by-step solution
  topic?: MathTopic;
  isProcedural?: boolean; // If true, questions will be dynamically regenerated
  generatorType?: string; // e.g., 'arithmetic-mult', 'linear-eq', 'fractions-add', 'percent-calc', 'pythagoras', 'stats-mean'
}

export interface Deck {
  id: string;
  name: string;
  subject: Subject;
  description?: string;
  createdAt: string;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  subject: Subject;
  rating: Rating;
  timestamp: string; // ISO date
}

export interface AppSettings {
  dailyTarget: number;
  includedSubjects: Subject[];
  prioritizeDifficult: boolean;
  randomizeOrder: boolean;
  chineseDirection: ChineseDirection;
  englishDirection: EnglishDirection;
  soundEnabled: boolean;
  speechRate: number;
  theme: 'light' | 'dark';
}

export interface DailyProgressSummary {
  reviewedTodayCount: number;
  dailyTarget: number;
  accuracyRate: number; // 0 - 100
  currentStreak: number;
  longestStreak: number;
  dueCount: number;
  subjectBreakdown: {
    chinese: { reviewedToday: number; dueCount: number; totalCount: number };
    english: { reviewedToday: number; dueCount: number; totalCount: number };
    math: { reviewedToday: number; dueCount: number; totalCount: number };
  };
}

export interface FilterOptions {
  search: string;
  subject: Subject | 'all';
  deckId: string | 'all';
  topic: MathTopic | 'all';
  difficulty: Difficulty | 'all';
  status: 'all' | 'due' | 'hard' | 'forgot' | 'mastered';
  tag: string | 'all';
}

export type AchievementCategory = 'volume' | 'streak' | 'mastery' | 'habit' | 'special';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  badge: string; // Emoji
  target: number;
  current: number;
  unlocked: boolean;
  unlockedAt?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}
