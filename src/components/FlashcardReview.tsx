import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Shuffle,
  RotateCcw,
  Check,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Trophy,
  ArrowLeft,
  Settings2,
} from 'lucide-react';
import { Card, ChineseDirection, Difficulty, Rating, Subject } from '../types';
import { ttsService } from '../utils/textToSpeech';
import { getProceduralMath, ProceduralMathResult } from '../utils/mathGenerators';
import { recordAudioListen, recordFlawlessSession } from '../utils/achievementSystem';
import { getCardBopomofo } from '../utils/bopomofo';

interface FlashcardReviewProps {
  cards: Card[];
  sessionTitle: string;
  defaultChineseDirection?: ChineseDirection;
  onFinishSession: (reviewedCards: { card: Card; rating: Rating }[]) => void;
  onExit: () => void;
  onUpdateCardDifficulty?: (cardId: string, difficulty: Difficulty) => void;
  onRateCard?: (card: Card, rating: Rating) => void;
}

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({
  cards: initialCards,
  sessionTitle,
  defaultChineseDirection = 'zh-en',
  onFinishSession,
  onExit,
  onUpdateCardDifficulty,
  onRateCard,
}) => {
  const [deck, setDeck] = useState<Card[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedHistory, setReviewedHistory] = useState<
    { card: Card; rating: Rating; originalSubject: Subject }[]
  >([]);
  const [isFinished, setIsFinished] = useState(false);
  const [chineseDirection, setChineseDirection] = useState<ChineseDirection>(
    defaultChineseDirection
  );
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    const unsubscribe = ttsService.addStateListener((speaking) => {
      setIsAudioPlaying(speaking);
    });
    return unsubscribe;
  }, []);

  // Cache generated math problems per card index so they stay consistent on flip
  const [proceduralMathCache, setProceduralMathCache] = useState<
    Record<number, ProceduralMathResult>
  >({});

  const currentCard: Card | undefined = deck[currentIndex];

  // Procedural math generator for current card if applicable
  const currentMathData: ProceduralMathResult | null = useMemo(() => {
    if (!currentCard || currentCard.subject !== 'math') return null;
    if (currentCard.isProcedural) {
      if (proceduralMathCache[currentIndex]) {
        return proceduralMathCache[currentIndex];
      }
      const generated = getProceduralMath(currentCard.generatorType);
      setProceduralMathCache((prev) => ({ ...prev, [currentIndex]: generated }));
      return generated;
    }
    return {
      question: currentCard.question || '',
      answer: currentCard.answer || '',
      explanation: currentCard.explanation || '',
      formula: currentCard.formula,
      topic: currentCard.topic || 'General',
    };
  }, [currentCard, currentIndex, proceduralMathCache]);

  const regenerateCurrentMath = useCallback(() => {
    if (!currentCard || !currentCard.isProcedural) return;
    const fresh = getProceduralMath(currentCard.generatorType);
    setProceduralMathCache((prev) => ({ ...prev, [currentIndex]: fresh }));
    setIsFlipped(false);
  }, [currentCard, currentIndex]);

  // Audio Playback
  const playAudio = useCallback(
    (textToSpeak?: string) => {
      if (!currentCard) return;

      recordAudioListen();
      if (currentCard.subject === 'chinese') {
        const text = textToSpeak || currentCard.chineseWord || '';
        ttsService.speak(text, 'zh-CN', 0.85);
      } else if (currentCard.subject === 'english') {
        const text = textToSpeak || currentCard.word || '';
        ttsService.speak(text, 'en-US', 0.9);
      }
    },
    [currentCard]
  );

  // Play audio on initial card load if language card and setting allows
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  // Handle rating a card
  const handleRating = useCallback(
    (rating: Rating) => {
      if (!currentCard) return;

      const record = {
        card: currentCard,
        rating,
        originalSubject: currentCard.subject,
      };

      // Real-time synchronization: immediately save card status and log review
      onRateCard?.(currentCard, rating);

      const updatedHistory = [...reviewedHistory, record];
      setReviewedHistory(updatedHistory);

      if (currentIndex + 1 < deck.length) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        // Session complete!
        setIsFinished(true);
        const total = updatedHistory.length;
        const easyCount = updatedHistory.filter((h) => h.rating === 'easy').length;
        if (total >= 10 && easyCount === total) {
          recordFlawlessSession();
        }

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    },
    [currentCard, currentIndex, deck.length, reviewedHistory]
  );

  // Shuffle remaining cards in deck
  const handleShuffle = useCallback(() => {
    const unreviewed = deck.slice(currentIndex);
    for (let i = unreviewed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unreviewed[i], unreviewed[j]] = [unreviewed[j], unreviewed[i]];
    }
    const newDeck = [...deck.slice(0, currentIndex), ...unreviewed];
    setDeck(newDeck);
  }, [currentIndex, deck]);

  // Restart current session
  const handleRestart = useCallback(() => {
    setDeck(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedHistory([]);
    setIsFinished(false);
    setProceduralMathCache({});
  }, [initialCards]);

  // Review only difficult cards from this session
  const handleReviewDifficultOnly = useCallback(() => {
    const difficultCards = reviewedHistory
      .filter((h) => h.rating === 'forgot' || h.rating === 'hard')
      .map((h) => h.card);

    if (difficultCards.length === 0) return;

    setDeck(difficultCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedHistory([]);
    setIsFinished(false);
    setProceduralMathCache({});
  }, [reviewedHistory]);

  // Rate/Change card difficulty
  const handleSetCardDifficulty = useCallback(
    (newDifficulty: Difficulty) => {
      if (!currentCard) return;
      const updatedCard = { ...currentCard, difficulty: newDifficulty };
      setDeck((prev) => prev.map((c, i) => (i === currentIndex ? updatedCard : c)));
      onUpdateCardDifficulty?.(currentCard.id, newDifficulty);
    },
    [currentCard, currentIndex, onUpdateCardDifficulty]
  );

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or modal, or key is auto-repeating from being held down
      if (
        e.repeat ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isFinished
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        handleRating('forgot');
      } else if (e.key === '2') {
        e.preventDefault();
        handleRating('hard');
      } else if (e.key === '3') {
        e.preventDefault();
        handleRating('easy');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        playAudio();
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        const nextDiff = currentCard?.difficulty === 'ultra-hard' ? 'advanced' : 'ultra-hard';
        handleSetCardDifficulty(nextDiff);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        const order: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'ultra-hard'];
        const currentIdx = order.indexOf(currentCard?.difficulty || 'intermediate');
        const nextDiff = order[(currentIdx + 1) % order.length];
        handleSetCardDifficulty(nextDiff);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!isFlipped) {
          setIsFlipped(true);
        } else if (currentIndex + 1 < deck.length) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isFlipped,
    currentIndex,
    deck.length,
    handleRating,
    isFinished,
    playAudio,
    currentCard,
    handleSetCardDifficulty,
  ]);

  // If no cards in session
  if (!deck || deck.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Sparkles className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          No Cards in this Session
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          There are currently no cards due or matching your selected criteria.
        </p>
        <button
          onClick={onExit}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // --- Session Completed Summary View ---
  if (isFinished) {
    const totalCount = reviewedHistory.length;
    const easyCount = reviewedHistory.filter((h) => h.rating === 'easy').length;
    const hardCount = reviewedHistory.filter((h) => h.rating === 'hard').length;
    const forgotCount = reviewedHistory.filter((h) => h.rating === 'forgot').length;
    const accuracy = totalCount > 0 ? Math.round((easyCount / totalCount) * 100) : 0;

    const subjectsSummary = {
      chinese: reviewedHistory.filter((h) => h.originalSubject === 'chinese'),
      english: reviewedHistory.filter((h) => h.originalSubject === 'english'),
      math: reviewedHistory.filter((h) => h.originalSubject === 'math'),
    };

    const difficultCards = reviewedHistory.filter(
      (h) => h.rating === 'forgot' || h.rating === 'hard'
    );

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Session Completed!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Outstanding work on {sessionTitle}. Spaced repetition intervals have been updated.
            </p>
          </div>

          {/* Key Outcome Numbers */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cards Reviewed
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {accuracy}%
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                Known / Easy
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800/50">
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {difficultCards.length}
              </div>
              <div className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Need Practice
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
            <div className="flex justify-between font-medium text-slate-600 dark:text-slate-300">
              <span>Performance Breakdown</span>
              <span>{totalCount} total</span>
            </div>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
              <div
                style={{ width: `${(easyCount / totalCount) * 100}%` }}
                className="bg-emerald-500"
                title={`Easy: ${easyCount}`}
              />
              <div
                style={{ width: `${(hardCount / totalCount) * 100}%` }}
                className="bg-amber-500"
                title={`Hard: ${hardCount}`}
              />
              <div
                style={{ width: `${(forgotCount / totalCount) * 100}%` }}
                className="bg-rose-500"
                title={`Forgot: ${forgotCount}`}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Easy: {easyCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Hard: {hardCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Forgot: {forgotCount}
              </span>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Subject Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20">
                <div className="font-semibold text-rose-700 dark:text-rose-300">🇨🇳 Chinese</div>
                <div className="text-slate-600 dark:text-slate-400 mt-1">
                  {subjectsSummary.chinese.length} cards studied
                </div>
              </div>
              <div className="p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20">
                <div className="font-semibold text-blue-700 dark:text-blue-300">🇬🇧 English</div>
                <div className="text-slate-600 dark:text-slate-400 mt-1">
                  {subjectsSummary.english.length} cards studied
                </div>
              </div>
              <div className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20">
                <div className="font-semibold text-emerald-700 dark:text-emerald-300">➗ Math</div>
                <div className="text-slate-600 dark:text-slate-400 mt-1">
                  {subjectsSummary.math.length} cards studied
                </div>
              </div>
            </div>
          </div>

          {/* Cards Needing Practice List */}
          {difficultCards.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cards to Reinforce ({difficultCards.length})
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {difficultCards.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.card.subject === 'chinese'
                          ? item.card.chineseWord
                          : item.card.subject === 'english'
                          ? item.card.word
                          : item.card.question?.substring(0, 30) + '...'}
                      </span>
                      <span className="text-slate-500 truncate">
                        {item.card.subject === 'chinese'
                          ? item.card.englishMeaning
                          : item.card.subject === 'english'
                          ? item.card.definition
                          : item.card.answer}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.rating === 'forgot'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {difficultCards.length > 0 && (
              <button
                onClick={handleReviewDifficultOnly}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Review Difficult Cards ({difficultCards.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                onFinishSession(reviewedHistory.map((h) => ({ card: h.card, rating: h.rating })));
                onExit();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              <span>Finish &amp; Save Progress</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Flashcard Front / Back Content Renderers ---
  const renderCardFront = () => {
    if (!currentCard) return null;

    if (currentCard.subject === 'chinese') {
      let mainText = currentCard.chineseWord;
      let hintText = 'Chinese Hanzi';
      const bopomofo = getCardBopomofo(currentCard);

      if (chineseDirection === 'en-zh') {
        mainText = currentCard.englishMeaning;
        hintText = 'English Meaning (Recall Chinese)';
      } else if (chineseDirection === 'pinyin-zh') {
        mainText = currentCard.pinyin;
        hintText = 'Pinyin (Recall Characters)';
      }

      return (
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
          <div className="text-xs uppercase tracking-wider font-semibold text-rose-500">
            {hintText}
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-5xl sm:text-6xl font-extrabold tracking-wide text-slate-900 dark:text-white select-none">
              {mainText}
            </div>

            {/* Bopomofo symbol display next to / under characters */}
            {bopomofo && chineseDirection === 'zh-en' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/70 dark:border-rose-900/60 text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300 tracking-widest shadow-2xs">
                <span className="text-[10px] font-semibold text-rose-400">注音</span>
                <span>{bopomofo}</span>
              </div>
            )}

            {bopomofo && chineseDirection === 'pinyin-zh' && (
              <div className="text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 tracking-wider">
                注音: {bopomofo}
              </div>
            )}
          </div>

          {chineseDirection === 'zh-en' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playAudio(currentCard.chineseWord);
              }}
              className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isAudioPlaying
                  ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-300 animate-pulse'
                  : 'bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300'
              }`}
              title="Pronounce Chinese (Web Speech API / Cloud Audio)"
            >
              <Volume2 className={`w-4 h-4 ${isAudioPlaying ? 'animate-bounce' : ''}`} />
              <span>{isAudioPlaying ? 'Speaking...' : 'Pronounce (zh-CN)'}</span>
            </button>
          )}

          {currentCard.tags && currentCard.tags.length > 0 && (
            <div className="text-xs text-slate-400 dark:text-slate-500 pt-2">
              Topic: {currentCard.tags.join(' · ')}
            </div>
          )}
        </div>
      );
    }

    if (currentCard.subject === 'english') {
      return (
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
          <div className="text-xs uppercase tracking-wider font-semibold text-blue-500">
            Vocabulary Word
          </div>

          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white select-none">
            {currentCard.word}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playAudio(currentCard.word);
            }}
            className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isAudioPlaying
                ? 'bg-blue-500 text-white shadow-sm ring-2 ring-blue-300 animate-pulse'
                : 'bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300'
            }`}
            title="Pronounce English (Web Speech API / Cloud Audio)"
          >
            <Volume2 className={`w-4 h-4 ${isAudioPlaying ? 'animate-bounce' : ''}`} />
            <span>{isAudioPlaying ? 'Speaking...' : 'Pronounce (en-US)'}</span>
          </button>

          {currentCard.tags && currentCard.tags.length > 0 && (
            <div className="text-xs text-slate-400 dark:text-slate-500 pt-2">
              Category: {currentCard.tags.join(' · ')}
            </div>
          )}
        </div>
      );
    }

    // Math front
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
            {currentMathData?.topic || 'Mathematics'}
          </span>
          {currentCard.isProcedural && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">· Randomized</span>
          )}
        </div>

        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white max-w-lg leading-snug px-4">
          {currentMathData?.question}
        </div>

        {currentCard.isProcedural && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              regenerateCurrentMath();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors"
            title="Generate new random numbers for this problem"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Numbers</span>
          </button>
        )}
      </div>
    );
  };

  const renderCardBack = () => {
    if (!currentCard) return null;

    if (currentCard.subject === 'chinese') {
      const bopomofo = getCardBopomofo(currentCard);

      return (
        <div className="space-y-4 text-center py-4">
          <div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {currentCard.chineseWord}
              </span>
              {bopomofo && (
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2.5 py-0.5 rounded-lg border border-rose-200/70 dark:border-rose-900/60 tracking-wider">
                  <span className="text-[10px] text-rose-400 font-semibold">注音</span>
                  <span>{bopomofo}</span>
                </span>
              )}
            </div>
            <div className="text-lg font-medium text-rose-600 dark:text-rose-400 mt-1">
              {currentCard.pinyin}
            </div>
            <div className="text-base font-semibold text-slate-700 dark:text-slate-200 mt-2">
              {currentCard.englishMeaning}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playAudio(currentCard.chineseWord);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isAudioPlaying
                ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-300 animate-pulse'
                : 'bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isAudioPlaying ? 'animate-bounce' : ''}`} />
            <span>{isAudioPlaying ? 'Speaking...' : 'Replay Pronunciation (R)'}</span>
          </button>

          {currentCard.exampleSentence && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-left border border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Example Sentence
              </div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {currentCard.exampleSentence}
              </div>
            </div>
          )}

          {currentCard.notes && (
            <div className="text-xs text-slate-500 italic text-left px-1">
              Note: {currentCard.notes}
            </div>
          )}
        </div>
      );
    }

    if (currentCard.subject === 'english') {
      return (
        <div className="space-y-4 text-center py-4">
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentCard.word}
            </div>
            <div className="text-base font-medium text-slate-700 dark:text-slate-200 mt-2 max-w-lg mx-auto">
              {currentCard.definition}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playAudio(currentCard.word);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isAudioPlaying
                ? 'bg-blue-500 text-white shadow-sm ring-2 ring-blue-300 animate-pulse'
                : 'bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isAudioPlaying ? 'animate-bounce' : ''}`} />
            <span>{isAudioPlaying ? 'Speaking...' : 'Replay Pronunciation (R)'}</span>
          </button>

          {currentCard.exampleSentence && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-left border border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Example Sentence
              </div>
              <div className="text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                &ldquo;{currentCard.exampleSentence}&rdquo;
              </div>
            </div>
          )}

          {(currentCard.synonyms && currentCard.synonyms.length > 0) ||
          (currentCard.antonyms && currentCard.antonyms.length > 0) ? (
            <div className="grid grid-cols-2 gap-2 text-left text-xs pt-1">
              {currentCard.synonyms && currentCard.synonyms.length > 0 && (
                <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Synonyms:
                  </span>{' '}
                  <span className="text-slate-600 dark:text-slate-400">
                    {currentCard.synonyms.join(', ')}
                  </span>
                </div>
              )}
              {currentCard.antonyms && currentCard.antonyms.length > 0 && (
                <div className="p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                  <span className="font-semibold text-rose-800 dark:text-rose-300">
                    Antonyms:
                  </span>{' '}
                  <span className="text-slate-600 dark:text-slate-400">
                    {currentCard.antonyms.join(', ')}
                  </span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      );
    }

    // Math back
    return (
      <div className="space-y-4 text-center py-3">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            Answer
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {currentMathData?.answer}
          </div>
        </div>

        {currentMathData?.formula && (
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-mono font-medium text-emerald-900 dark:text-emerald-200 text-center">
            {currentMathData.formula}
          </div>
        )}

        {currentMathData?.explanation && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-left border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Worked Solution / Step-by-Step
            </div>
            <pre className="text-xs sm:text-sm font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {currentMathData.explanation}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 animate-in fade-in duration-200">
      {/* Top Header: Navigation back, Subject badge, Progress, Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Session</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Subject indicator */}
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md ${
              currentCard?.subject === 'chinese'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                : currentCard?.subject === 'english'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            {currentCard?.subject === 'chinese'
              ? '🇨🇳 Chinese'
              : currentCard?.subject === 'english'
              ? '🇬🇧 English'
              : '➗ Mathematics'}
          </span>

          {/* Shuffle button */}
          <button
            onClick={handleShuffle}
            title="Shuffle remaining cards (S)"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Restart button */}
          <button
            onClick={handleRestart}
            title="Restart session"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>{sessionTitle}</span>
          <span>
            Card <strong className="text-slate-900 dark:text-white">{currentIndex + 1}</strong> of{' '}
            {deck.length} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Optional Chinese Direction Toggle for Chinese cards */}
      {currentCard?.subject === 'chinese' && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="font-medium flex items-center gap-1">
            <Settings2 className="w-3.5 h-3.5" />
            <span>Direction:</span>
          </span>
          <div className="flex items-center gap-1">
            {(
              [
                { id: 'zh-en', label: '汉字 → EN' },
                { id: 'en-zh', label: 'EN → 汉字' },
                { id: 'zh-pinyin', label: '汉字 → Pinyin' },
                { id: 'pinyin-zh', label: 'Pinyin → 汉字' },
              ] as { id: ChineseDirection; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setChineseDirection(opt.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  chineseDirection === opt.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Flashcard Container with Smooth Interactive Flip */}
      <div
        onClick={() => setIsFlipped((prev) => !prev)}
        className="w-full min-h-[340px] sm:min-h-[380px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer select-none shadow-sm transition-all duration-200 hover:shadow-md"
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Answer revealed. Click to flip back' : 'Question shown. Click or press Space to reveal answer'}
      >
        {/* Card Header Tag / Level & Interactive Difficulty Rating */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <span className="text-[11px] font-semibold text-slate-400 mr-0.5">Rating:</span>
              {(
                [
                  { id: 'beginner' as Difficulty, label: 'Beginner', activeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 shadow-xs' },
                  { id: 'intermediate' as Difficulty, label: 'Med', activeClass: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 shadow-xs' },
                  { id: 'advanced' as Difficulty, label: 'Hard', activeClass: 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/70 border-orange-300 dark:border-orange-700 shadow-xs' },
                  { id: 'ultra-hard' as Difficulty, label: '🔥 Ultra', activeClass: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 border-rose-400 dark:border-rose-700 shadow-xs ring-1 ring-rose-400' },
                ]
              ).map((d) => {
                const isActive = (currentCard?.difficulty || 'intermediate') === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => handleSetCardDifficulty(d.id)}
                    title={`Rate card difficulty as ${d.label} (Press D to cycle, U for Ultra)`}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                      isActive
                        ? `${d.activeClass} font-extrabold`
                        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-[11px] text-slate-400">
              Reviews: {currentCard?.reviewCount || 0}
            </span>
          </div>

          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            {isFlipped ? 'Answer Revealed' : 'Click / Space to Flip'}
          </div>
        </div>

        {/* Card Body */}
        <div className="py-6 flex items-center justify-center">
          {isFlipped ? renderCardBack() : renderCardFront()}
        </div>

        {/* Card Footer prompt */}
        <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          {isFlipped ? (
            <span className="text-slate-500">How well did you know this card? Rate below</span>
          ) : (
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              Tap card or press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Space</kbd> to reveal answer
            </span>
          )}
        </div>
      </div>

      {/* Review Action Controls */}
      <div className="space-y-3">
        {!isFlipped ? (
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-indigo-300"
          >
            <span>Reveal Answer</span>
            <span className="text-xs opacity-75 font-normal">(Space)</span>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleRating('forgot')}
              className="py-3.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold border-2 border-rose-200 dark:border-rose-800/60 shadow-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <div className="flex items-center gap-1.5">
                <X className="w-5 h-5 text-rose-600" />
                <span className="text-sm sm:text-base">Forgot</span>
              </div>
              <span className="text-[11px] font-normal text-rose-600/80">Press 1 · Review today</span>
            </button>

            <button
              onClick={() => handleRating('hard')}
              className="py-3.5 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold border-2 border-amber-200 dark:border-amber-800/60 shadow-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm sm:text-base">Hard</span>
              </div>
              <span className="text-[11px] font-normal text-amber-600/80">Press 2 · In 1 day</span>
            </button>

            <button
              onClick={() => handleRating('easy')}
              className="py-3.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold border-2 border-emerald-200 dark:border-emerald-800/60 shadow-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div className="flex items-center gap-1.5">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-sm sm:text-base">Easy</span>
              </div>
              <span className="text-[11px] font-normal text-emerald-600/80">Press 3 · Level up</span>
            </button>
          </div>
        )}
      </div>

      {/* Unobtrusive Keyboard Shortcuts Footnote */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex flex-wrap items-center gap-2.5">
          <span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Space</kbd> Flip</span>
          <span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">1</kbd> Forgot</span>
          <span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">2</kbd> Hard</span>
          <span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">3</kbd> Easy</span>
          <span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">D</kbd> Rate Diff</span>
          <span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">U</kbd> Ultra-Hard</span>
          <span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">R</kbd> Audio</span>
        </div>

        <button
          onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
          className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Shortcuts</span>
        </button>
      </div>
    </div>
  );
};
