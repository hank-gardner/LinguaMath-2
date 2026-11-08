import React from 'react';
import { Flame, Sparkles, Shield, Zap, Award } from 'lucide-react';
import { Difficulty } from '../types';

export type SessionDifficulty = 'all' | Difficulty;

interface DifficultyDialProps {
  value: SessionDifficulty;
  onChange: (val: SessionDifficulty) => void;
  counts?: Partial<Record<SessionDifficulty, number>>;
  compact?: boolean;
  className?: string;
  label?: string;
}

interface StepConfig {
  id: SessionDifficulty;
  label: string;
  shortLabel: string;
  tagline: string;
  angle: number; // degrees for rotary visual
  color: string;
  activeBg: string;
  ringColor: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  {
    id: 'all',
    label: 'All / Dynamic',
    shortLabel: 'All',
    tagline: 'Adaptive mix of all card levels',
    angle: -60,
    color: 'text-indigo-600 dark:text-indigo-400',
    activeBg: 'bg-indigo-600 text-white',
    ringColor: 'ring-indigo-500',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  {
    id: 'beginner',
    label: 'Beginner / Easy',
    shortLabel: 'Easy',
    tagline: 'Fundamental vocabulary & basics',
    angle: -30,
    color: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-600 text-white',
    ringColor: 'ring-emerald-500',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    shortLabel: 'Med',
    tagline: 'Standard high-yield curriculum',
    angle: 0,
    color: 'text-amber-600 dark:text-amber-400',
    activeBg: 'bg-amber-600 text-white',
    ringColor: 'ring-amber-500',
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  {
    id: 'advanced',
    label: 'Advanced',
    shortLabel: 'Hard',
    tagline: 'Rigorous multi-step & academic vocabulary',
    angle: 30,
    color: 'text-orange-600 dark:text-orange-400',
    activeBg: 'bg-orange-600 text-white',
    ringColor: 'ring-orange-500',
    icon: <Award className="w-3.5 h-3.5" />,
  },
  {
    id: 'ultra-hard',
    label: '🔥 Ultra-Hard',
    shortLabel: 'Ultra 🔥',
    tagline: 'Elite mastery, nuanced idioms & complex problem solving',
    angle: 60,
    color: 'text-rose-600 dark:text-rose-400',
    activeBg: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/20',
    ringColor: 'ring-rose-500',
    icon: <Flame className="w-3.5 h-3.5 fill-rose-500" />,
  },
];

export const DifficultyDial: React.FC<DifficultyDialProps> = ({
  value,
  onChange,
  counts,
  compact = false,
  className = '',
  label = 'Session Difficulty Dial',
}) => {
  const currentStep = STEPS.find((s) => s.id === value) || STEPS[0];
  const currentIndex = STEPS.findIndex((s) => s.id === value);

  const handleStepChange = (stepId: SessionDifficulty) => {
    onChange(stepId);
  };

  const handlePrevious = () => {
    const nextIdx = (currentIndex - 1 + STEPS.length) % STEPS.length;
    onChange(STEPS[nextIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % STEPS.length;
    onChange(STEPS[nextIdx].id);
  };

  // Compact Mode (for Study Session Toolbar or Headers)
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <span>Dial:</span>
        </span>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          {STEPS.map((s) => {
            const isSelected = s.id === value;
            const count = counts?.[s.id];

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStepChange(s.id)}
                title={`${s.label}: ${s.tagline}${count !== undefined ? ` (${count} cards)` : ''}`}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 select-none ${
                  isSelected
                    ? `${s.activeBg} shadow-xs scale-102`
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
              >
                <span>{s.shortLabel}</span>
                {count !== undefined && (
                  <span
                    className={`text-[9px] px-1 rounded-full ${
                      isSelected
                        ? 'bg-black/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Full Rotary / Stepped Dial Widget (for Dashboard, Modals, Quick Start)
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-4 sm:p-5 shadow-xs transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shadow-inner">
            🎛️
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {label}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Set target challenge level for this session
            </p>
          </div>
        </div>

        {/* Selected Tier Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
            value === 'ultra-hard'
              ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border-rose-300 dark:border-rose-700 shadow-xs ring-2 ring-rose-400/30'
              : value === 'advanced'
              ? 'bg-orange-50 dark:bg-orange-950/80 text-orange-600 dark:text-orange-300 border-orange-300 dark:border-orange-700'
              : value === 'intermediate'
              ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              : value === 'beginner'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
              : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
          }`}
        >
          {currentStep.icon}
          <span>{currentStep.label}</span>
          {counts?.[value] !== undefined && (
            <span className="text-[10px] opacity-75 font-normal">
              ({counts[value]} cards)
            </span>
          )}
        </div>
      </div>

      {/* Visual Dial Track & Notches */}
      <div className="relative pt-2 pb-1">
        {/* Track Line */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full relative overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              value === 'ultra-hard'
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600'
                : value === 'advanced'
                ? 'bg-gradient-to-r from-emerald-400 via-amber-500 to-orange-500'
                : value === 'intermediate'
                ? 'bg-gradient-to-r from-emerald-400 to-amber-500'
                : value === 'beginner'
                ? 'bg-emerald-500'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${((currentIndex + 0.5) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Clickable Notches Row */}
        <div className="grid grid-cols-5 gap-1 pt-3">
          {STEPS.map((s, idx) => {
            const isSelected = s.id === value;
            const count = counts?.[s.id];

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStepChange(s.id)}
                className={`group flex flex-col items-center text-center p-2 rounded-xl transition-all select-none ${
                  isSelected
                    ? `${s.activeBg} font-bold shadow-sm scale-102 ring-2 ring-offset-2 ${s.ringColor} dark:ring-offset-slate-900`
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="text-xs mb-1 transition-transform group-hover:scale-110">
                  {s.icon}
                </div>
                <span className="text-[11px] font-bold leading-tight">
                  {s.shortLabel}
                </span>
                {count !== undefined && (
                  <span
                    className={`text-[9px] mt-0.5 px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description readout of selected dial setting */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="italic flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping inline-block" />
          <span>{currentStep.tagline}</span>
        </span>
        <span className="text-[10px] text-slate-400">
          Dial Level {currentIndex + 1} of {STEPS.length}
        </span>
      </div>
    </div>
  );
};
