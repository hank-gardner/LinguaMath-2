import { AppSettings, Card, Rating, Subject } from '../types';

/**
 * Calculates new interval, repetitions, and next review date for a card
 * using a clean, student-friendly spaced repetition calculation.
 */
export function evaluateCardReview(card: Card, rating: Rating): Card {
  const now = new Date();
  let interval = card.interval || 0;
  let repetitions = card.repetitions || 0;
  let easeFactor = card.easeFactor || 2.5;

  let forgotCount = card.forgotCount || 0;
  let hardCount = card.hardCount || 0;
  let easyCount = card.easyCount || 0;

  if (rating === 'forgot') {
    forgotCount += 1;
    repetitions = 0;
    // Show again today (interval = 0 means due immediately or tomorrow)
    interval = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.25);
  } else if (rating === 'hard') {
    hardCount += 1;
    repetitions = Math.max(1, repetitions);
    // Hard cards come back in 1 day
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (rating === 'easy') {
    easyCount += 1;
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 3;
    } else {
      interval = Math.round((interval || 2) * easeFactor);
    }
    easeFactor = Math.min(3.0, easeFactor + 0.1);
  }

  // Next review date: now + interval in days (or +4 hours for interval=0 so it's due today)
  const nextDate = new Date(now.getTime());
  if (interval === 0) {
    nextDate.setHours(nextDate.getHours() + 1); // due in 1 hour if forgot
  } else {
    nextDate.setDate(nextDate.getDate() + interval);
    // Normalize to beginning of that day
    nextDate.setHours(4, 0, 0, 0);
  }

  return {
    ...card,
    interval,
    repetitions,
    easeFactor: Number(easeFactor.toFixed(2)),
    lastReviewed: now.toISOString(),
    nextReviewDate: nextDate.toISOString(),
    reviewCount: (card.reviewCount || 0) + 1,
    forgotCount,
    hardCount,
    easyCount,
  };
}

/**
 * Checks whether a card is currently due for review.
 */
export function isCardDue(card: Card): boolean {
  if (!card.lastReviewed) return true; // never reviewed -> due!
  const now = new Date();
  const nextReview = new Date(card.nextReviewDate);
  return nextReview <= now;
}

/**
 * Shuffles an array using Fisher-Yates.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Builds the Daily Mix deck prioritizing due & struggled cards,
 * respecting daily target and included subjects.
 */
export function buildDailyMixDeck(cards: Card[], settings: AppSettings): Card[] {
  const target = Math.max(5, settings.dailyTarget || 20);
  const includedSubjects = settings.includedSubjects.length > 0
    ? settings.includedSubjects
    : (['chinese', 'english', 'math'] as Subject[]);

  const eligibleCards = cards.filter((c) => includedSubjects.includes(c.subject));
  if (eligibleCards.length === 0) return [];

  // Group by subject
  const subjectBuckets: Record<Subject, Card[]> = {
    chinese: eligibleCards.filter((c) => c.subject === 'chinese'),
    english: eligibleCards.filter((c) => c.subject === 'english'),
    math: eligibleCards.filter((c) => c.subject === 'math'),
  };

  // Sort score: higher score = higher priority
  const scoreCard = (card: Card) => {
    let score = 0;
    const due = isCardDue(card);
    if (due) score += 100;
    if (!card.lastReviewed) score += 50; // new cards

    if (settings.prioritizeDifficult) {
      score += (card.forgotCount || 0) * 20;
      score += (card.hardCount || 0) * 10;
      score += Math.max(0, (2.5 - (card.easeFactor || 2.5)) * 20);
      if (card.difficulty === 'advanced') score += 5;
    }
    // slight random jitter to prevent static repetition
    score += Math.random() * 5;
    return score;
  };

  // Determine quotas per active subject
  const activeCount = includedSubjects.length;
  const basePerSubject = Math.floor(target / activeCount);
  let remainder = target % activeCount;

  const selectedCards: Card[] = [];

  includedSubjects.forEach((sub) => {
    const subCards = subjectBuckets[sub];
    if (subCards.length === 0) return;

    let quota = basePerSubject + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;

    // Sort by priority score descending
    const sorted = [...subCards].sort((a, b) => scoreCard(b) - scoreCard(a));
    const chosen = sorted.slice(0, quota);
    selectedCards.push(...chosen);
  });

  // If some subjects had fewer cards than quota, backfill from remaining pool
  if (selectedCards.length < target) {
    const selectedIds = new Set(selectedCards.map((c) => c.id));
    const remaining = eligibleCards
      .filter((c) => !selectedIds.has(c.id))
      .sort((a, b) => scoreCard(b) - scoreCard(a));

    const needed = target - selectedCards.length;
    selectedCards.push(...remaining.slice(0, needed));
  }

  // Shuffle final list if randomization is on
  if (settings.randomizeOrder) {
    return shuffleArray(selectedCards);
  }

  return selectedCards;
}
