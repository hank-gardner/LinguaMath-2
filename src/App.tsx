import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { FlashcardReview } from './components/FlashcardReview';
import { SubjectView } from './components/SubjectView';
import { ProgressPage } from './components/ProgressPage';
import { SettingsPage } from './components/SettingsPage';
import { CardEditorModal } from './components/CardEditorModal';
import { DeckManagerModal } from './components/DeckManagerModal';
import { AchievementsView } from './components/AchievementsView';
import { AchievementUnlockedModal } from './components/AchievementUnlockedModal';
import { LLMKeyModal } from './components/LLMKeyModal';
import {
  Achievement,
  AppSettings,
  Card,
  ChineseDirection,
  DailyProgressSummary,
  Deck,
  Difficulty,
  Rating,
  ReviewLog,
  Subject,
} from './types';
import { StorageService } from './utils/storage';
import {
  buildDailyMixDeck,
  evaluateCardReview,
  isCardDue,
} from './utils/spacedRepetition';
import { calculateAchievements } from './utils/achievementSystem';

export default function App() {
  // Navigation & UI state
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('linguamath_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Data state
  const [cards, setCards] = useState<Card[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [logs, setLogs] = useState<ReviewLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [streakData, setStreakData] = useState<{ currentStreak: number; longestStreak: number }>({
    currentStreak: 1,
    longestStreak: 1,
  });

  // Active Review Session State
  const [activeReviewSession, setActiveReviewSession] = useState<{
    cards: Card[];
    title: string;
    chineseDirection?: ChineseDirection;
  } | null>(null);

  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [cardModalDefaultSubject, setCardModalDefaultSubject] = useState<Subject>('chinese');

  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [deckModalSubject, setDeckModalSubject] = useState<Subject>('chinese');
  const [isLLMKeyModalOpen, setIsLLMKeyModalOpen] = useState(false);

  // Load data from localStorage on mount
  const loadData = useCallback(() => {
    const loadedCards = StorageService.getCards();
    const loadedDecks = StorageService.getDecks();
    const loadedLogs = StorageService.getLogs();
    const loadedSettings = StorageService.getSettings();
    const loadedStreak = StorageService.getStreakData();

    setCards(loadedCards);
    setDecks(loadedDecks);
    setLogs(loadedLogs);
    setSettings(loadedSettings);
    setStreakData({
      currentStreak: loadedStreak.currentStreak,
      longestStreak: loadedStreak.longestStreak,
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Achievements Calculation
  const { achievements, newlyUnlocked } = useMemo(() => {
    return calculateAchievements(cards, logs, streakData);
  }, [cards, logs, streakData]);

  // Overall milestone progress across all badges
  const overallMilestonePercent = useMemo(() => {
    if (!achievements || achievements.length === 0) return 0;
    const totalPoints = achievements.reduce((acc, a) => {
      const pct = Math.min(100, Math.round((a.current / Math.max(1, a.target)) * 100));
      return acc + pct;
    }, 0);
    return Math.round(totalPoints / achievements.length);
  }, [achievements]);

  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (newlyUnlocked && newlyUnlocked.length > 0) {
      setCelebratingAchievement(newlyUnlocked[0]);
    }
  }, [newlyUnlocked]);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('linguamath_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('linguamath_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      setSettings((s) => {
        const updated: AppSettings = { ...s, theme: next ? 'dark' : 'light' };
        StorageService.saveSettings(updated);
        return updated;
      });
      return next;
    });
  };

  // Due counts
  const totalDueCount = useMemo(() => {
    return cards.filter((c) => isCardDue(c)).length;
  }, [cards]);

  // Dashboard Progress Summary Calculation
  const progressSummary: DailyProgressSummary = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter((l) => l.timestamp.startsWith(today));
    const easyCount = todayLogs.filter((l) => l.rating === 'easy').length;
    const accuracy = todayLogs.length > 0 ? Math.round((easyCount / todayLogs.length) * 100) : 100;

    const calcSub = (sub: Subject) => {
      const subCards = cards.filter((c) => c.subject === sub);
      const subToday = todayLogs.filter((l) => l.subject === sub).length;
      const subDue = subCards.filter((c) => isCardDue(c)).length;
      return {
        reviewedToday: subToday,
        dueCount: subDue,
        totalCount: subCards.length,
      };
    };

    return {
      reviewedTodayCount: todayLogs.length,
      dailyTarget: settings.dailyTarget || 20,
      accuracyRate: accuracy,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      dueCount: totalDueCount,
      subjectBreakdown: {
        chinese: calcSub('chinese'),
        english: calcSub('english'),
        math: calcSub('math'),
      },
    };
  }, [cards, logs, settings.dailyTarget, streakData, totalDueCount]);

  // Start Daily Mix Review
  const startDailyReview = useCallback(() => {
    let mixCards = buildDailyMixDeck(cards, settings);

    if (mixCards.length === 0) {
      // If no cards match, take all active cards up to target
      mixCards = cards
        .filter((c) => settings.includedSubjects.includes(c.subject))
        .slice(0, settings.dailyTarget || 20);
    }

    if (mixCards.length === 0) {
      alert('No cards available to review. Try creating some cards first!');
      return;
    }

    setActiveReviewSession({
      cards: mixCards,
      title: 'Daily Mix Review',
      chineseDirection: settings.chineseDirection || 'zh-en',
    });
  }, [cards, settings]);

  // Start Custom Session (e.g. from Subject view)
  const startSubjectSession = useCallback(
    (cardsToStudy: Card[], sessionTitle: string, chineseDirection?: ChineseDirection) => {
      setActiveReviewSession({
        cards: cardsToStudy,
        title: sessionTitle,
        chineseDirection: chineseDirection || settings.chineseDirection || 'zh-en',
      });
    },
    [settings.chineseDirection]
  );

  // Handle card rated live in review session - updates achievement and progress instantly
  const handleCardRated = useCallback((card: Card, rating: Rating) => {
    // 1. Evaluate spaced repetition for this card
    const evaluated = evaluateCardReview(card, rating);

    // 2. Persist card state
    setCards((prevCards) => {
      const updated = prevCards.map((c) => (c.id === card.id ? evaluated : c));
      StorageService.saveCards(updated);
      return updated;
    });

    // 3. Persist review log immediately
    const log: ReviewLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      cardId: card.id,
      subject: card.subject,
      rating,
      timestamp: new Date().toISOString(),
    };
    StorageService.addReviewLog(log);
    setLogs(StorageService.getLogs());

    // 4. Update streak
    const streak = StorageService.updateStreak();
    setStreakData(streak);
  }, []);

  // Complete review session
  const handleFinishSession = useCallback(() => {
    setCards(StorageService.getCards());
    setLogs(StorageService.getLogs());
    setStreakData(StorageService.getStreakData());
    setActiveReviewSession(null);
  }, []);

  // Card Operations
  const handleSaveCard = useCallback(
    (cardData: Partial<Card>) => {
      let updated: Card[];
      if (cardToEdit) {
        updated = cards.map((c) =>
          c.id === cardToEdit.id ? ({ ...c, ...cardData } as Card) : c
        );
      } else {
        const newCard: Card = {
          id: 'card-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          subject: cardData.subject || 'chinese',
          deckId: cardData.deckId || 'default',
          createdAt: new Date().toISOString(),
          difficulty: cardData.difficulty || 'beginner',
          tags: cardData.tags || [],
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
          reviewCount: 0,
          forgotCount: 0,
          hardCount: 0,
          easyCount: 0,
          ...cardData,
        };
        updated = [newCard, ...cards];
      }
      StorageService.saveCards(updated);
      setCards(updated);
      setCardToEdit(null);
    },
    [cardToEdit, cards]
  );

  const handleDuplicateCard = useCallback(
    (card: Card) => {
      const duplicated: Card = {
        ...card,
        id: 'card-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
        reviewCount: 0,
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date().toISOString(),
        forgotCount: 0,
        hardCount: 0,
        easyCount: 0,
      };
      if (duplicated.word) duplicated.word = `${duplicated.word} (Copy)`;
      if (duplicated.question) duplicated.question = `${duplicated.question} (Copy)`;
      if (duplicated.chineseWord) duplicated.chineseWord = `${duplicated.chineseWord} (副本)`;

      const updated = [duplicated, ...cards];
      StorageService.saveCards(updated);
      setCards(updated);
    },
    [cards]
  );

  const handleDeleteCard = useCallback(
    (cardId: string) => {
      const updated = cards.filter((c) => c.id !== cardId);
      StorageService.saveCards(updated);
      setCards(updated);
    },
    [cards]
  );

  // Deck Operations
  const handleCreateDeck = useCallback(
    (name: string, description?: string) => {
      const newDeck: Deck = {
        id: 'deck-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        name,
        subject: deckModalSubject,
        description,
        createdAt: new Date().toISOString(),
      };
      const updated = [...decks, newDeck];
      StorageService.saveDecks(updated);
      setDecks(updated);
    },
    [deckModalSubject, decks]
  );

  const handleRenameDeck = useCallback(
    (deckId: string, newName: string) => {
      const updated = decks.map((d) => (d.id === deckId ? { ...d, name: newName } : d));
      StorageService.saveDecks(updated);
      setDecks(updated);
    },
    [decks]
  );

  const handleDeleteDeck = useCallback(
    (deckId: string) => {
      const updated = decks.filter((d) => d.id !== deckId);
      StorageService.saveDecks(updated);
      setDecks(updated);
    },
    [decks]
  );

  // Update card difficulty rating in real-time
  const handleUpdateCardDifficulty = useCallback(
    (cardId: string, difficulty: Difficulty) => {
      setCards((prev) => {
        const updated = prev.map((c) => (c.id === cardId ? { ...c, difficulty } : c));
        StorageService.saveCards(updated);
        return updated;
      });
    },
    []
  );

  // Card count mapping per deck
  const deckCardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach((c) => {
      counts[c.deckId] = (counts[c.deckId] || 0) + 1;
    });
    return counts;
  }, [cards]);

  // Open Add Card modal
  const openAddCardModal = (subject: Subject = 'chinese') => {
    setCardToEdit(null);
    setCardModalDefaultSubject(subject);
    setIsCardModalOpen(true);
  };

  // Open Edit Card modal
  const openEditCardModal = (card: Card) => {
    setCardToEdit(card);
    setCardModalDefaultSubject(card.subject);
    setIsCardModalOpen(true);
  };

  // Open Deck Manager modal
  const openDeckModal = (subject: Subject) => {
    setDeckModalSubject(subject);
    setIsDeckModalOpen(true);
  };

  // Direct navigation handler
  const handleNavSelect = (tab: NavTab) => {
    if (tab === 'daily-review') {
      startDailyReview();
    } else {
      setActiveReviewSession(null);
      setCurrentTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={activeReviewSession ? 'daily-review' : currentTab}
        onSelectTab={handleNavSelect}
        currentStreak={streakData.currentStreak}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        dueCount={totalDueCount}
        unlockedAchievementsCount={achievements.filter((a) => a.unlocked).length}
        onOpenLLMKeyModal={() => setIsLLMKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeReviewSession ? (
          <FlashcardReview
            cards={activeReviewSession.cards}
            sessionTitle={activeReviewSession.title}
            defaultChineseDirection={activeReviewSession.chineseDirection}
            onFinishSession={handleFinishSession}
            onExit={() => setActiveReviewSession(null)}
            onUpdateCardDifficulty={handleUpdateCardDifficulty}
            onRateCard={handleCardRated}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                progress={progressSummary}
                onStartDailyReview={startDailyReview}
                onSelectSubject={(sub) => {
                  setCurrentTab(sub);
                }}
                onAddNewCard={(sub) => openAddCardModal(sub || 'chinese')}
                onNavigate={(tab) => setCurrentTab(tab)}
                unlockedAchievementsCount={achievements.filter((a) => a.unlocked).length}
                totalAchievementsCount={achievements.length}
                achievementProgressPercent={overallMilestonePercent}
              />
            )}

            {(currentTab === 'chinese' ||
              currentTab === 'english' ||
              currentTab === 'math') && (
              <SubjectView
                subject={currentTab}
                cards={cards}
                decks={decks}
                onStartStudy={startSubjectSession}
                onAddCard={(sub) => openAddCardModal(sub)}
                onEditCard={openEditCardModal}
                onDuplicateCard={handleDuplicateCard}
                onDeleteCard={handleDeleteCard}
                onOpenDeckManager={openDeckModal}
              />
            )}

            {currentTab === 'progress' && (
              <ProgressPage
                cards={cards}
                logs={logs}
                streakData={streakData}
              />
            )}

            {currentTab === 'achievements' && (
              <AchievementsView
                achievements={achievements}
                onStartDailyReview={startDailyReview}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsPage
                settings={settings}
                cards={cards}
                decks={decks}
                onUpdateSettings={(newSettings) => {
                  StorageService.saveSettings(newSettings);
                  setSettings(newSettings);
                  setIsDark(newSettings.theme === 'dark');
                }}
                onDataReload={loadData}
                onOpenLLMKeyModal={() => setIsLLMKeyModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Achievement Unlocked Popup Modal */}
      <AchievementUnlockedModal
        achievement={celebratingAchievement}
        onClose={() => setCelebratingAchievement(null)}
      />

      {/* Card Editor Modal */}
      <CardEditorModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setCardToEdit(null);
        }}
        onSave={handleSaveCard}
        cardToEdit={cardToEdit}
        defaultSubject={cardModalDefaultSubject}
        decks={decks}
        onOpenLLMKeyModal={() => setIsLLMKeyModalOpen(true)}
      />

      {/* Deck Manager Modal */}
      <DeckManagerModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        subject={deckModalSubject}
        decks={decks}
        cardCounts={deckCardCounts}
        onCreateDeck={handleCreateDeck}
        onRenameDeck={handleRenameDeck}
        onDeleteDeck={handleDeleteDeck}
      />

      {/* LLM API Key Management Modal */}
      <LLMKeyModal
        isOpen={isLLMKeyModalOpen}
        onClose={() => setIsLLMKeyModalOpen(false)}
      />
    </div>
  );
}
