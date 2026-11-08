import React from 'react';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Plus,
} from 'lucide-react';
import { DailyProgressSummary, Subject } from '../types';

interface DashboardProps {
  progress: DailyProgressSummary;
  onStartDailyReview: () => void;
  onSelectSubject: (subject: Subject) => void;
  onAddNewCard: (subject?: Subject) => void;
  onNavigate: (tab: any) => void;
  unlockedAchievementsCount?: number;
  totalAchievementsCount?: number;
  achievementProgressPercent?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  onStartDailyReview,
  onSelectSubject,
  onAddNewCard,
  onNavigate,
  unlockedAchievementsCount = 0,
  totalAchievementsCount = 15,
  achievementProgressPercent = 0,
}) => {
  const percentComplete = Math.min(
    100,
    Math.round((progress.reviewedTodayCount / Math.max(1, progress.dailyTarget)) * 100)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Hero Daily Review Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white p-6 sm:p-8 shadow-lg shadow-indigo-500/10">
        {/* Subtle decorative background elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 right-24 w-48 h-48 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Daily Mixed Spaced Repetition</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ready for your daily practice session?
            </h1>

            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Consolidate Chinese characters, English vocabulary, and procedural math questions.
              Struggled cards return more frequently to lock in retention.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-indigo-100">
              <span className="font-semibold text-white">Due right now:</span>
              <span>{progress.dueCount} cards waiting</span>
              <span aria-hidden="true" className="opacity-60">·</span>
              <span>Daily Target: {progress.dailyTarget} cards</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={onStartDailyReview}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white text-indigo-900 font-bold text-base shadow-md hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:ring-4 focus-visible:ring-white/40 focus-visible:outline-none"
            >
              <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-600" />
              <span>Start Daily Review</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </button>

            <button
              onClick={() => onAddNewCard()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-800/60 hover:bg-indigo-800/80 border border-indigo-400/30 text-white font-medium text-xs transition-colors focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Card</span>
            </button>
          </div>
        </div>
      </section>

      {/* Today's Progress Bar & Key Metrics */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today&apos;s Progress</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{progress.reviewedTodayCount} of {progress.dailyTarget} cards reviewed</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{percentComplete}% complete</span>
            </div>
          </div>

          {percentComplete >= 100 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Daily Goal Met!</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Reviewed Today</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {progress.reviewedTodayCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ {progress.dailyTarget}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Accuracy Today</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {progress.accuracyRate}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">easy rate</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Current Streak</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {progress.currentStreak}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                days (best {progress.longestStreak})
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>Due for Review</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {progress.dueCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">cards</span>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Showcase Banner */}
      <section className="rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-indigo-500/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shadow-inner shrink-0">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Study Achievements &amp; Badges
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                {unlockedAchievementsCount} / {totalAchievementsCount} Unlocked
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              40 cards in a day, 100 cards lifetime, ultra-hard cards, streaks, and audio milestones.
            </p>

            {/* Live Milestone Progress Bar */}
            <div className="mt-2.5 flex items-center gap-2.5 max-w-xs">
              <div className="flex-1 bg-amber-200/50 dark:bg-amber-950/70 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(achievementProgressPercent > 0 ? 5 : 0, achievementProgressPercent)}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 shrink-0">
                {achievementProgressPercent}% Milestone XP
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('achievements')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors shrink-0 active:scale-95"
        >
          <span>View Badges</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Subject Breakdown Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subject Breakdown</h2>
          <button
            onClick={() => onNavigate('progress')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View detailed analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Chinese Card */}
          <div className="group rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-950/60 p-5 shadow-xs hover:border-rose-300 dark:hover:border-rose-800 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
                    中
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">🇨🇳 Chinese</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Hanzi &amp; Pinyin Vocab</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Reviewed today:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {progress.subjectBreakdown.chinese.reviewedToday} cards
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Due for review:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {progress.subjectBreakdown.chinese.dueCount} cards
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Total in library:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {progress.subjectBreakdown.chinese.totalCount} cards
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 flex items-center gap-2">
              <button
                onClick={() => onSelectSubject('chinese')}
                className="flex-1 py-2 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors text-center"
              >
                Practice Chinese
              </button>
              <button
                onClick={() => onAddNewCard('chinese')}
                title="Add Chinese card"
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* English Card */}
          <div className="group rounded-2xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-950/60 p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    EN
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">🇬🇧 English</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Definitions &amp; Synonyms</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Reviewed today:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {progress.subjectBreakdown.english.reviewedToday} cards
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Due for review:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {progress.subjectBreakdown.english.dueCount} cards
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Total in library:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {progress.subjectBreakdown.english.totalCount} cards
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 flex items-center gap-2">
              <button
                onClick={() => onSelectSubject('english')}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors text-center"
              >
                Practice English
              </button>
              <button
                onClick={() => onAddNewCard('english')}
                title="Add English card"
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mathematics Card */}
          <div className="group rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-950/60 p-5 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                    ∑
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">➗ Mathematics</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Formulas &amp; Procedural</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Reviewed today:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {progress.subjectBreakdown.math.reviewedToday} cards
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Due for review:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {progress.subjectBreakdown.math.dueCount} cards
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Total in library:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {progress.subjectBreakdown.math.totalCount} cards
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 flex items-center gap-2">
              <button
                onClick={() => onSelectSubject('math')}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors text-center"
              >
                Practice Math
              </button>
              <button
                onClick={() => onAddNewCard('math')}
                title="Add Math card"
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Spaced Repetition Study Advice Box */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Spaced Repetition Tip
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
              Mark cards as <strong>Hard</strong> or <strong>Forgot</strong> when you hesitate. The algorithm will resurface them today and tomorrow until recall is immediate and effortless.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
