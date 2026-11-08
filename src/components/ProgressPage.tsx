import React, { useMemo } from 'react';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';
import { Card, ReviewLog, Subject } from '../types';
import { isCardDue } from '../utils/spacedRepetition';

interface ProgressPageProps {
  cards: Card[];
  logs: ReviewLog[];
  streakData: { currentStreak: number; longestStreak: number };
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  cards,
  logs,
  streakData,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const reviewedTodayCount = useMemo(() => {
    return logs.filter((log) => log.timestamp.startsWith(todayStr)).length;
  }, [logs, todayStr]);

  const totalReviewsCount = logs.length;

  const easyReviewsCount = logs.filter((l) => l.rating === 'easy').length;
  const hardReviewsCount = logs.filter((l) => l.rating === 'hard').length;
  const forgotReviewsCount = logs.filter((l) => l.rating === 'forgot').length;

  const overallAccuracy =
    totalReviewsCount > 0
      ? Math.round((easyReviewsCount / totalReviewsCount) * 100)
      : 0;

  // Mastered cards: interval >= 14 days and at least 3 reviews
  const masteredCards = useMemo(() => {
    return cards.filter((c) => (c.interval || 0) >= 14 && (c.reviewCount || 0) >= 2);
  }, [cards]);

  // Cards needing review: currently due or previously forgot/hard
  const needingReviewCards = useMemo(() => {
    return cards.filter((c) => isCardDue(c) || (c.interval || 0) <= 1);
  }, [cards]);

  // Subject Stats Calculation
  const subjectStats = useMemo(() => {
    const calc = (sub: Subject) => {
      const subCards = cards.filter((c) => c.subject === sub);
      const subLogs = logs.filter((l) => l.subject === sub);
      const subEasy = subLogs.filter((l) => l.rating === 'easy').length;
      const subMastered = subCards.filter((c) => (c.interval || 0) >= 14);
      const subDue = subCards.filter((c) => isCardDue(c)).length;
      const acc = subLogs.length > 0 ? Math.round((subEasy / subLogs.length) * 100) : 0;

      return {
        total: subCards.length,
        reviews: subLogs.length,
        mastered: subMastered.length,
        due: subDue,
        accuracy: acc,
      };
    };

    return {
      chinese: calc('chinese'),
      english: calc('english'),
      math: calc('math'),
    };
  }, [cards, logs]);

  // Weekly 7-Day Activity Chart Data
  const weeklyActivity = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : dayNames[d.getDay()];

      const count = logs.filter((l) => l.timestamp.startsWith(dateString)).length;
      days.push({
        date: dateString,
        label: dayName,
        count,
      });
    }
    return days;
  }, [logs]);

  const maxDailyCount = Math.max(10, ...weeklyActivity.map((d) => d.count));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Study Analytics &amp; Progress
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor your retention curves, consistency streak, and subject mastery over time.
        </p>
      </div>

      {/* Top 4 Key Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Library</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {cards.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Active cards in collection
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Reviewed Today</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {reviewedTodayCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {totalReviewsCount} total lifetime reviews
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Accuracy Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {overallAccuracy}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {easyReviewsCount} Easy · {hardReviewsCount} Hard · {forgotReviewsCount} Forgot
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {streakData.currentStreak}
            <span className="text-sm font-normal text-slate-500 ml-1">days</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Longest streak: {streakData.longestStreak} days
          </div>
        </div>
      </div>

      {/* Weekly Activity Graph */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              7-Day Activity Chart
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cards reviewed each day over the past week
            </p>
          </div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {weeklyActivity.reduce((acc, curr) => acc + curr.count, 0)} cards this week
          </div>
        </div>

        {/* Clean Bar Visualization */}
        <div className="pt-6 pb-2">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            {weeklyActivity.map((day, idx) => {
              const heightPercent =
                maxDailyCount > 0 ? Math.round((day.count / maxDailyCount) * 100) : 0;
              const isToday = idx === weeklyActivity.length - 1;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-lg h-full flex items-end overflow-hidden p-0.5">
                    <div
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-indigo-600 to-purple-500'
                          : day.count > 0
                          ? 'bg-indigo-400/80 dark:bg-indigo-500/80 group-hover:bg-indigo-500'
                          : 'bg-slate-200 dark:bg-slate-700/60'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      isToday
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subject-by-Subject Breakdown */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Subject Performance Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Chinese */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-950/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇨🇳</span>
                <h3 className="font-bold text-slate-900 dark:text-white">Chinese</h3>
              </div>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {subjectStats.chinese.accuracy}% accuracy
              </span>
            </div>

            <div className="space-y-2 text-xs border-y border-slate-100 dark:border-slate-800 py-3">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Cards:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {subjectStats.chinese.total}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Mastered (Interval ≥ 14d):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {subjectStats.chinese.mastered}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Due for Review:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {subjectStats.chinese.due}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Reviews:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {subjectStats.chinese.reviews}
                </span>
              </div>
            </div>
          </div>

          {/* English */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-950/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇬🇧</span>
                <h3 className="font-bold text-slate-900 dark:text-white">English</h3>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {subjectStats.english.accuracy}% accuracy
              </span>
            </div>

            <div className="space-y-2 text-xs border-y border-slate-100 dark:border-slate-800 py-3">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Cards:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {subjectStats.english.total}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Mastered (Interval ≥ 14d):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {subjectStats.english.mastered}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Due for Review:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {subjectStats.english.due}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Reviews:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {subjectStats.english.reviews}
                </span>
              </div>
            </div>
          </div>

          {/* Mathematics */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-950/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">➗</span>
                <h3 className="font-bold text-slate-900 dark:text-white">Mathematics</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {subjectStats.math.accuracy}% accuracy
              </span>
            </div>

            <div className="space-y-2 text-xs border-y border-slate-100 dark:border-slate-800 py-3">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Cards:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {subjectStats.math.total}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Mastered (Interval ≥ 14d):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {subjectStats.math.mastered}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Due for Review:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {subjectStats.math.due}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Reviews:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {subjectStats.math.reviews}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mastery & Retention Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Cards Mastered ({masteredCards.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Cards with strong spaced intervals (14+ days) that you consistently answer easily.
          </p>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {cards.length > 0 ? Math.round((masteredCards.length / cards.length) * 100) : 0}%
            <span className="text-xs font-normal text-slate-500 ml-2">of total collection</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Cards Needing Revision ({needingReviewCards.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Cards due today or recently rated Hard / Forgot requiring prompt reinforcement.
          </p>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {needingReviewCards.length}
            <span className="text-xs font-normal text-slate-500 ml-2">ready to study</span>
          </div>
        </div>
      </section>
    </div>
  );
};
