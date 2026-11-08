import confetti from 'canvas-confetti';
import { Achievement, Card, ReviewLog } from '../types';

const ACHIEVEMENTS_STORAGE_KEY = 'linguamath_unlocked_achievements_v1';
const AUDIO_LISTEN_COUNT_KEY = 'linguamath_audio_count_v1';
const FLAWLESS_SESSIONS_COUNT_KEY = 'linguamath_flawless_sessions_v1';

export interface UnlockedRecord {
  unlockedAt: string;
}

export function getAudioListenCount(): number {
  try {
    const val = localStorage.getItem(AUDIO_LISTEN_COUNT_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function recordAudioListen(): void {
  try {
    const current = getAudioListenCount();
    localStorage.setItem(AUDIO_LISTEN_COUNT_KEY, (current + 1).toString());
  } catch (e) {
    console.warn('Failed to record audio listen', e);
  }
}

export function getStoredUnlockedAchievements(): Record<string, UnlockedRecord> {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveUnlockedAchievements(records: Record<string, UnlockedRecord>): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save unlocked achievements', e);
  }
}

export function recordFlawlessSession(): void {
  try {
    const current = parseInt(localStorage.getItem(FLAWLESS_SESSIONS_COUNT_KEY) || '0', 10);
    localStorage.setItem(FLAWLESS_SESSIONS_COUNT_KEY, (current + 1).toString());
  } catch (e) {
    console.warn('Failed to record flawless session', e);
  }
}

export function getFlawlessSessionCount(): number {
  try {
    return parseInt(localStorage.getItem(FLAWLESS_SESSIONS_COUNT_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

export function calculateAchievements(
  cards: Card[],
  logs: ReviewLog[],
  streakData: { currentStreak: number; longestStreak: number }
): {
  achievements: Achievement[];
  newlyUnlocked: Achievement[];
} {
  const unlockedRecords = getStoredUnlockedAchievements();
  const todayStr = new Date().toISOString().split('T')[0];
  const audioCount = getAudioListenCount();
  const flawlessCount = getFlawlessSessionCount();

  // 1. Daily cards count: calculate maximum cards reviewed in ANY single calendar day
  const dailyCounts: Record<string, number> = {};
  logs.forEach((log) => {
    const day = log.timestamp.split('T')[0];
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });
  const maxInOneDay = Math.max(0, ...Object.values(dailyCounts));
  const cardsReviewedToday = cards.filter(
    (c) => c.lastReviewed && c.lastReviewed.split('T')[0] === todayStr
  ).length;
  const todayCount = Math.max(dailyCounts[todayStr] || 0, cardsReviewedToday);
  const bestDaily = Math.max(todayCount, maxInOneDay);

  // 2. Lifetime cards reviewed: combine logs and card review counters for bulletproof accuracy
  const totalFromCards = cards.reduce((sum, c) => sum + (c.reviewCount || 0), 0);
  const totalLifetimeReviews = Math.max(logs.length, totalFromCards);

  // 3. Ultra hard & Advanced cards mastered
  const ultraHardAndAdvancedMastered = cards.filter(
    (c) => (c.difficulty === 'ultra-hard' || c.difficulty === 'advanced') && (c.easyCount || 0) >= 1
  ).length;

  // 4. Ultra-Hard specific cards rated & conquered
  const ultraHardOnlyMastered = cards.filter(
    (c) => c.difficulty === 'ultra-hard' && (c.easyCount || 0) >= 1
  ).length;

  // 5. Comeback kid: cards that were marked 'forgot' and subsequently rated 'easy'
  const comebackCards = cards.filter(
    (c) => (c.forgotCount || 0) > 0 && (c.easyCount || 0) >= 1
  ).length;

  // 6. Days where user studied all 3 subjects
  const daysWithAllThreeSubjects = Object.keys(dailyCounts).filter((day) => {
    const subs = new Set(logs.filter((l) => l.timestamp.startsWith(day)).map((l) => l.subject));
    return subs.has('chinese') && subs.has('english') && subs.has('math');
  }).length;

  // 7. Procedural math cards mastered
  const mathProceduralMastered = cards.filter(
    (c) => c.subject === 'math' && c.isProcedural && (c.easyCount || 0) >= 1
  ).length;

  // 8. Time-based sessions: early morning (< 8 AM) or late evening (> 9 PM)
  let earlyMorningReviews = 0;
  let lateEveningReviews = 0;
  logs.forEach((l) => {
    const hour = new Date(l.timestamp).getHours();
    if (hour < 8) earlyMorningReviews++;
    if (hour >= 21) lateEveningReviews++;
  });
  const allHoursCount = earlyMorningReviews + lateEveningReviews;

  // 9. Custom cards created count
  const customCardsCount = cards.filter((c) => c.id.startsWith('card-')).length;

  // Laddered Definitions: Clear progression from early starter to ultra-hard master!
  const rawList: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
    // --- VOLUME MILESTONES ---
    {
      id: 'daily-10',
      title: 'Daily Spark (10 Cards)',
      description: 'Review 10 flashcards in a single calendar day.',
      category: 'volume',
      badge: '⚡',
      target: 10,
      current: bestDaily,
      tier: 'bronze',
    },
    {
      id: 'daily-25',
      title: 'Daily Grinder (25 Cards)',
      description: 'Review 25 flashcards in a single day.',
      category: 'volume',
      badge: '🔥',
      target: 25,
      current: bestDaily,
      tier: 'silver',
    },
    {
      id: 'daily-50',
      title: 'Powerhouse (50 Cards in One Day!)',
      description: 'Review 50 or more flashcards in a single calendar day.',
      category: 'volume',
      badge: '⚡',
      target: 50,
      current: bestDaily,
      tier: 'gold',
    },
    {
      id: 'daily-100',
      title: 'Centurion Day (100 Cards!)',
      description: 'Crush an extraordinary milestone: 100 cards reviewed in one day.',
      category: 'volume',
      badge: '💥',
      target: 100,
      current: bestDaily,
      tier: 'diamond',
    },
    {
      id: 'lifetime-25',
      title: 'First Flight (25 Lifetime)',
      description: 'Reach 25 total card reviews across all subjects.',
      category: 'volume',
      badge: '🌱',
      target: 25,
      current: totalLifetimeReviews,
      tier: 'bronze',
    },
    {
      id: 'century-100',
      title: 'Century Club (100 Lifetime)',
      description: 'Complete 100 flashcard reviews across Chinese, English, and Math.',
      category: 'volume',
      badge: '💯',
      target: 100,
      current: totalLifetimeReviews,
      tier: 'silver',
    },
    {
      id: 'lifetime-500',
      title: 'Knowledge Titan (500 Cards)',
      description: 'Reach an impressive 500 lifetime reviews.',
      category: 'volume',
      badge: '👑',
      target: 500,
      current: totalLifetimeReviews,
      tier: 'diamond',
    },

    // --- MASTERY & ULTRA-HARD MILESTONES ---
    {
      id: 'ultra-conquer-1',
      title: 'Brave Challenger (1 Ultra-Hard)',
      description: 'Conquer your first Ultra-Hard or Advanced card with an Easy rating.',
      category: 'mastery',
      badge: '🗡️',
      target: 1,
      current: ultraHardAndAdvancedMastered,
      tier: 'bronze',
    },
    {
      id: 'conquer-ultra-hard-5',
      title: 'Conquer Ultra Hard (5 Cards)',
      description: 'Rate 5 Ultra-Hard or Advanced cards with an Easy recall rating.',
      category: 'mastery',
      badge: '🏔️',
      target: 5,
      current: ultraHardAndAdvancedMastered,
      tier: 'silver',
    },
    {
      id: 'conquer-ultra-hard-15',
      title: 'Apex Conqueror (15 Ultra-Hard Cards)',
      description: 'Master 15 Ultra-Hard or Advanced cards with effortless recall.',
      category: 'mastery',
      badge: '🔥',
      target: 15,
      current: ultraHardAndAdvancedMastered,
      tier: 'gold',
    },
    {
      id: 'iron-will-ultra-25',
      title: 'Iron Will: Ultra-Hard Master',
      description: 'Conquer 25 Ultra-Hard or Advanced cards with effortless Easy recall.',
      category: 'mastery',
      badge: '🛡️',
      target: 25,
      current: ultraHardAndAdvancedMastered,
      tier: 'diamond',
    },
    {
      id: 'phoenix-redemption-3',
      title: 'Phoenix Redemption (3 Cards)',
      description: 'Turn 3 previously forgotten cards into retained cards rated Easy.',
      category: 'mastery',
      badge: '🔄',
      target: 3,
      current: comebackCards,
      tier: 'bronze',
    },
    {
      id: 'mental-math-prodigy-5',
      title: 'Mental Math Apprentice (5 Questions)',
      description: 'Answer 5 procedural math problems with an Easy rating.',
      category: 'mastery',
      badge: '➗',
      target: 5,
      current: mathProceduralMastered,
      tier: 'bronze',
    },
    {
      id: 'mental-math-prodigy-15',
      title: 'Mental Math Wizard (15 Questions)',
      description: 'Answer 15 randomized procedural math questions with an Easy rating.',
      category: 'mastery',
      badge: '✨',
      target: 15,
      current: mathProceduralMastered,
      tier: 'gold',
    },
    {
      id: 'flawless-sessions-1',
      title: 'Flawless Sprint (1 Perfect Session)',
      description: 'Complete a review session of 10+ cards with 100% Easy ratings.',
      category: 'mastery',
      badge: '🎯',
      target: 1,
      current: flawlessCount,
      tier: 'gold',
    },

    // --- STREAK MILESTONES ---
    {
      id: 'streak-3',
      title: 'Fire Starter (3-Day Streak)',
      description: 'Study 3 consecutive days without missing a day.',
      category: 'streak',
      badge: '🔥',
      target: 3,
      current: Math.max(streakData.currentStreak, streakData.longestStreak),
      tier: 'bronze',
    },
    {
      id: 'streak-7',
      title: 'Week of Fire (7-Day Streak)',
      description: 'Maintain study momentum for 7 consecutive days.',
      category: 'streak',
      badge: '🗓️',
      target: 7,
      current: Math.max(streakData.currentStreak, streakData.longestStreak),
      tier: 'silver',
    },
    {
      id: 'streak-21',
      title: 'Habit Master (21-Day Streak)',
      description: 'Solidify your learning routine with 21 unbroken days of study.',
      category: 'streak',
      badge: '🏆',
      target: 21,
      current: Math.max(streakData.currentStreak, streakData.longestStreak),
      tier: 'gold',
    },

    // --- HABIT & AUDIO MILESTONES ---
    {
      id: 'audio-master-5',
      title: 'Tuned In (5 Audio Listens)',
      description: 'Listen to native pronunciation audio clips 5 times.',
      category: 'habit',
      badge: '🔊',
      target: 5,
      current: audioCount,
      tier: 'bronze',
    },
    {
      id: 'audio-master-25',
      title: 'Pronunciation Scholar (25 Listens)',
      description: 'Drill pronunciation audio 25 times across Chinese and English vocabulary.',
      category: 'habit',
      badge: '🎙️',
      target: 25,
      current: audioCount,
      tier: 'silver',
    },
    {
      id: 'triple-threat-1',
      title: 'Triple Threat Scholar',
      description: 'Study Chinese, English, and Mathematics in the same day.',
      category: 'habit',
      badge: '🌐',
      target: 1,
      current: daysWithAllThreeSubjects > 0 ? 1 : 0,
      tier: 'silver',
    },
    {
      id: 'card-architect-1',
      title: 'Card Architect (First Custom Card)',
      description: 'Create your first custom flashcard.',
      category: 'special',
      badge: '📝',
      target: 1,
      current: customCardsCount,
      tier: 'bronze',
    },
    {
      id: 'all-hours-5',
      title: 'All-Hours Scholar',
      description: 'Review 5 cards during early morning (< 8 AM) or late evening (> 9 PM) sessions.',
      category: 'habit',
      badge: '🦉',
      target: 5,
      current: allHoursCount,
      tier: 'bronze',
    },
  ];

  const newlyUnlocked: Achievement[] = [];
  const updatedRecords = { ...unlockedRecords };
  let recordsChanged = false;

  const achievements: Achievement[] = rawList.map((item) => {
    const isUnlockedBefore = Boolean(unlockedRecords[item.id]);
    const isNowEligible = item.current >= item.target;

    let unlocked = isUnlockedBefore;
    let unlockedAt = unlockedRecords[item.id]?.unlockedAt;

    if (!isUnlockedBefore && isNowEligible) {
      unlocked = true;
      unlockedAt = new Date().toISOString();
      updatedRecords[item.id] = { unlockedAt };
      recordsChanged = true;
      newlyUnlocked.push({
        ...item,
        unlocked: true,
        unlockedAt,
      });
    }

    return {
      ...item,
      unlocked,
      unlockedAt,
    };
  });

  if (recordsChanged) {
    saveUnlockedAchievements(updatedRecords);
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#ec4899', '#6366f1', '#10b981', '#06b6d4'],
    });
  }

  return { achievements, newlyUnlocked };
}
