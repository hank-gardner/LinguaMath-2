import React, { useState, useMemo } from 'react';
import {
  Trophy,
  CheckCircle2,
  Lock,
  Sparkles,
  Flame,
  Award,
  Zap,
  Target,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Achievement, AchievementCategory } from '../types';

interface AchievementsViewProps {
  achievements: Achievement[];
  onStartDailyReview: () => void;
}

const CATEGORY_NAMES: Record<AchievementCategory | 'all', string> = {
  all: 'Overall',
  volume: 'Volume',
  streak: 'Streak',
  mastery: 'Mastery',
  habit: 'Habit',
  special: 'Special',
};

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  achievements,
  onStartDailyReview,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [metricMode, setMetricMode] = useState<'xp' | 'badges'>('xp');

  // Total global unlocked stats
  const totalGlobalCount = achievements.length;
  const totalGlobalUnlocked = achievements.filter((a) => a.unlocked).length;

  // Active achievements list based on category filter
  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') return achievements;
    return achievements.filter((a) => a.category === selectedCategory);
  }, [achievements, selectedCategory]);

  const activeTotalCount = filteredAchievements.length;
  const activeUnlockedCount = filteredAchievements.filter((a) => a.unlocked).length;
  const activeUnlockedPercent =
    activeTotalCount > 0 ? Math.round((activeUnlockedCount / activeTotalCount) * 100) : 0;

  // Aggregate milestone XP percentage for the filtered category or all
  const activeMilestonePoints = useMemo(() => {
    return filteredAchievements.reduce((acc, a) => {
      const pct = Math.min(100, Math.round((a.current / Math.max(1, a.target)) * 100));
      return acc + pct;
    }, 0);
  }, [filteredAchievements]);

  const activeExperiencePercent =
    activeTotalCount > 0 ? Math.round(activeMilestonePoints / activeTotalCount) : 0;

  // Global XP percentage across all categories
  const globalMilestonePoints = useMemo(() => {
    return achievements.reduce((acc, a) => {
      const pct = Math.min(100, Math.round((a.current / Math.max(1, a.target)) * 100));
      return acc + pct;
    }, 0);
  }, [achievements]);
  const globalExperiencePercent =
    totalGlobalCount > 0 ? Math.round(globalMilestonePoints / totalGlobalCount) : 0;

  // Determine current active bar value (Milestone XP or Badges Unlocked)
  const currentBarPercent =
    metricMode === 'xp' ? activeExperiencePercent : activeUnlockedPercent;

  // Rank determination based on total badges and global experience
  const rank = useMemo(() => {
    if (totalGlobalUnlocked >= 14 || globalExperiencePercent >= 80)
      return { title: 'Grandmaster PolyMath', color: 'text-amber-500' };
    if (totalGlobalUnlocked >= 10 || globalExperiencePercent >= 60)
      return { title: 'Knowledge Champion', color: 'text-purple-500' };
    if (totalGlobalUnlocked >= 6 || globalExperiencePercent >= 40)
      return { title: 'Dedicated Scholar', color: 'text-indigo-500' };
    if (totalGlobalUnlocked >= 2 || globalExperiencePercent >= 20)
      return { title: 'Disciplined Apprentice', color: 'text-blue-500' };
    return { title: 'Aspiring Learner', color: 'text-emerald-500' };
  }, [totalGlobalUnlocked, globalExperiencePercent]);

  const tierStyles = {
    bronze:
      'border-amber-700/30 bg-amber-950/5 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300',
    silver:
      'border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200',
    gold: 'border-amber-400/60 dark:border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 shadow-xs shadow-amber-500/5',
    diamond:
      'border-cyan-400/60 dark:border-cyan-500/40 bg-cyan-500/5 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 shadow-xs shadow-cyan-500/5',
  };

  const categoryLabel = CATEGORY_NAMES[selectedCategory];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Showcase Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 right-28 w-48 h-48 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold tracking-wider uppercase">
              <Trophy className="w-4 h-4 fill-amber-300" />
              <span>Study Milestones &amp; Badges</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Achievements Showcase
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Earn badges by hitting daily targets, maintaining streaks, solving ultra-hard cards, and
              sharpening mental recall across subjects.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs">
              <span className="font-semibold text-slate-200">Your Rank:</span>
              <span
                className={`font-extrabold text-sm ${rank.color} bg-white/10 px-2.5 py-1 rounded-lg`}
              >
                {rank.title}
              </span>
            </div>
          </div>

          {/* Progress Counters & Actions */}
          <div className="flex flex-col items-center sm:items-end justify-center shrink-0 space-y-2 bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/15">
            <div className="text-3xl font-black text-amber-300">
              {activeUnlockedCount}{' '}
              <span className="text-lg font-semibold text-indigo-200">/ {activeTotalCount}</span>
            </div>
            <div className="text-xs text-indigo-200 font-medium">
              {activeUnlockedCount} Unlocked · {activeExperiencePercent}% Milestone XP
            </div>
            <button
              onClick={onStartDailyReview}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition-all shadow-md active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              <span>Review to Unlock</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            </button>
          </div>
        </div>

        {/* Dynamic Responsive Progress Bar with Metric Toggle */}
        <div className="mt-6 pt-4 border-t border-white/15 space-y-2">
          <div className="flex flex-wrap justify-between items-center text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="text-indigo-100 font-semibold">
                {categoryLabel} Milestone Progress
              </span>
              <span className="font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded-md text-xs">
                {currentBarPercent}%
              </span>
            </div>

            {/* Interactive Toggle for Milestone XP vs Badges Unlocked */}
            <div className="flex items-center gap-1 bg-black/25 p-0.5 rounded-lg text-[11px] font-semibold border border-white/10">
              <button
                onClick={() => setMetricMode('xp')}
                title="View granular milestone experience percentage based on card reviews"
                className={`px-2 py-0.5 rounded-md transition-all ${
                  metricMode === 'xp'
                    ? 'bg-amber-400 text-indigo-950 font-extrabold shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                Milestone XP ({activeExperiencePercent}%)
              </button>
              <button
                onClick={() => setMetricMode('badges')}
                title="View percentage of badges fully unlocked"
                className={`px-2 py-0.5 rounded-md transition-all ${
                  metricMode === 'badges'
                    ? 'bg-amber-400 text-indigo-950 font-extrabold shadow-xs'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                Badges Unlocked ({activeUnlockedPercent}%)
              </button>
            </div>
          </div>

          <div className="w-full bg-white/15 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-300 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.max(currentBarPercent > 0 ? 3 : 0, currentBarPercent)}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {(
            [
              { id: 'all', label: 'All Badges' },
              { id: 'volume', label: '⚡ Volume' },
              { id: 'streak', label: '🔥 Streaks' },
              { id: 'mastery', label: '🎯 Mastery' },
              { id: 'habit', label: '🗓️ Habits' },
              { id: 'special', label: '✨ Special' },
            ] as { id: AchievementCategory | 'all'; label: string }[]
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 shrink-0">
          Showing {filteredAchievements.length} achievements
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((item) => {
          const percent = Math.min(100, Math.round((item.current / Math.max(1, item.target)) * 100));
          const isComplete = item.unlocked;

          return (
            <div
              key={item.id}
              className={`relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                isComplete
                  ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md'
                  : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-90'
              }`}
            >
              <div>
                {/* Header: Icon & Tier Tag */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                        tierStyles[item.tier]
                      } ${isComplete ? 'scale-105' : 'grayscale-50 opacity-80'}`}
                    >
                      {item.badge}
                    </div>
                    <div>
                      <h3
                        className={`font-bold text-sm leading-tight ${
                          isComplete
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
                        {item.tier} Milestone
                      </div>
                    </div>
                  </div>

                  {isComplete ? (
                    <div
                      title="Achievement unlocked!"
                      className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0"
                    >
                      <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
                    </div>
                  ) : (
                    <div
                      title="Locked"
                      className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 shrink-0"
                    >
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[36px]">
                  {item.description}
                </p>
              </div>

              {/* Bottom Progress & Metadata */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {isComplete ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed!</span>
                      </span>
                    ) : (
                      <span>
                        Progress:{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {item.current}
                        </strong>{' '}
                        / {item.target}
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{percent}%</span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${isComplete ? 100 : Math.max(item.current > 0 ? 4 : 0, percent)}%`,
                    }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isComplete ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                  />
                </div>

                {item.unlockedAt && (
                  <div className="text-[10px] text-slate-400 text-right">
                    Unlocked on {new Date(item.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
