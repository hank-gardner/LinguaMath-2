import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Play,
  Volume2,
  Edit2,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  Card,
  ChineseDirection,
  Deck,
  Difficulty,
  FilterOptions,
  MathTopic,
  Subject,
} from '../types';
import { ttsService } from '../utils/textToSpeech';
import { isCardDue } from '../utils/spacedRepetition';
import { recordAudioListen } from '../utils/achievementSystem';
import { getCardBopomofo } from '../utils/bopomofo';

interface SubjectViewProps {
  subject: Subject;
  cards: Card[];
  decks: Deck[];
  onStartStudy: (cardsToStudy: Card[], sessionTitle: string, chineseDirection?: ChineseDirection) => void;
  onAddCard: (subject: Subject) => void;
  onEditCard: (card: Card) => void;
  onDuplicateCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onOpenDeckManager: (subject: Subject) => void;
}

export const SubjectView: React.FC<SubjectViewProps> = ({
  subject,
  cards,
  decks,
  onStartStudy,
  onAddCard,
  onEditCard,
  onDuplicateCard,
  onDeleteCard,
  onOpenDeckManager,
}) => {
  // Local filters
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'hard' | 'forgot' | 'mastered'>('all');
  const [mathTopicFilter, setMathTopicFilter] = useState<MathTopic | 'all'>('all');
  const [chineseDirection, setChineseDirection] = useState<ChineseDirection>('zh-en');
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);

  // Decks for this subject
  const subjectDecks = decks.filter((d) => d.subject === subject);

  // Subject metadata configuration
  const config = {
    chinese: {
      title: 'Chinese Study',
      flag: '🇨🇳',
      color: 'rose',
      desc: 'Master Hanzi, Pinyin, tones, and natural phrasing.',
      themeBg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40',
      activeTabClass: 'bg-rose-600 text-white',
      badgeBg: 'bg-rose-500',
    },
    english: {
      title: 'English Vocabulary',
      flag: '🇬🇧',
      color: 'blue',
      desc: 'Elevate vocabulary with definitions, synonyms, and context.',
      themeBg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/40',
      activeTabClass: 'bg-blue-600 text-white',
      badgeBg: 'bg-blue-500',
    },
    math: {
      title: 'Mathematics Practice',
      flag: '➗',
      color: 'emerald',
      desc: 'Sharpen mental calculation, formulas, and procedural equations.',
      themeBg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40',
      activeTabClass: 'bg-emerald-600 text-white',
      badgeBg: 'bg-emerald-500',
    },
  }[subject];

  // Filtering cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (card.subject !== subject) return false;

      // Deck filter
      if (selectedDeckId !== 'all' && card.deckId !== selectedDeckId) {
        return false;
      }

      // Difficulty filter
      if (difficultyFilter !== 'all' && card.difficulty !== difficultyFilter) {
        return false;
      }

      // Math topic filter
      if (subject === 'math' && mathTopicFilter !== 'all' && card.topic !== mathTopicFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'due' && !isCardDue(card)) {
        return false;
      }
      if (statusFilter === 'hard' && (!card.hardCount || card.hardCount === 0)) {
        return false;
      }
      if (statusFilter === 'forgot' && (!card.forgotCount || card.forgotCount === 0)) {
        return false;
      }
      if (statusFilter === 'mastered' && (card.interval || 0) < 14) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTags = (card.tags || []).some((t) => t.toLowerCase().includes(query));
        const matchesNotes = (card.notes || '').toLowerCase().includes(query);

        if (subject === 'chinese') {
          return (
            matchesTags ||
            matchesNotes ||
            (card.chineseWord || '').toLowerCase().includes(query) ||
            (card.pinyin || '').toLowerCase().includes(query) ||
            (card.englishMeaning || '').toLowerCase().includes(query) ||
            (card.exampleSentence || '').toLowerCase().includes(query)
          );
        } else if (subject === 'english') {
          return (
            matchesTags ||
            matchesNotes ||
            (card.word || '').toLowerCase().includes(query) ||
            (card.definition || '').toLowerCase().includes(query) ||
            (card.synonyms || []).some((s) => s.toLowerCase().includes(query)) ||
            (card.exampleSentence || '').toLowerCase().includes(query)
          );
        } else {
          return (
            matchesTags ||
            matchesNotes ||
            (card.question || '').toLowerCase().includes(query) ||
            (card.answer || '').toLowerCase().includes(query) ||
            (card.formula || '').toLowerCase().includes(query) ||
            (card.explanation || '').toLowerCase().includes(query)
          );
        }
      }

      return true;
    });
  }, [cards, subject, selectedDeckId, difficultyFilter, mathTopicFilter, statusFilter, searchQuery]);

  const dueCount = useMemo(() => {
    return cards.filter((c) => c.subject === subject && isCardDue(c)).length;
  }, [cards, subject]);

  const playSpeech = async (cardId: string, text: string) => {
    setPlayingCardId(cardId);
    recordAudioListen();
    if (subject === 'chinese') {
      await ttsService.speak(text, 'zh-CN', 0.85);
    } else {
      await ttsService.speak(text, 'en-US', 0.9);
    }
    setPlayingCardId(null);
  };

  const handleStartReview = () => {
    if (filteredCards.length === 0) return;
    const title =
      selectedDeckId !== 'all'
        ? subjectDecks.find((d) => d.id === selectedDeckId)?.name || config.title
        : `${config.title} (${filteredCards.length} cards)`;
    onStartStudy(filteredCards, title, chineseDirection);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Subject Header Banner */}
      <div className={`p-6 rounded-2xl border ${config.themeBg} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{config.flag}</span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {config.title}
            </h1>
            {dueCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                {dueCount} due
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {config.desc}
          </p>
        </div>

        {/* Action Buttons: Study & Add Card */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleStartReview}
            disabled={filteredCards.length === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
              filteredCards.length > 0
                ? `${config.activeTabClass} hover:opacity-90 active:scale-95`
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Study Selected ({filteredCards.length})</span>
          </button>

          <button
            onClick={() => onAddCard(subject)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Add Card</span>
          </button>

          <button
            onClick={() => onOpenDeckManager(subject)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Manage Decks"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Decks</span>
          </button>
        </div>
      </div>

      {/* Chinese Direction Selector (if Chinese) */}
      {subject === 'chinese' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Study Direction:
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {(
              [
                { id: 'zh-en', label: '🇨🇳 Hanzi → 🇬🇧 Meaning' },
                { id: 'en-zh', label: '🇬🇧 Meaning → 🇨🇳 Hanzi' },
                { id: 'zh-pinyin', label: '🇨🇳 Hanzi → Pinyin' },
                { id: 'pinyin-zh', label: 'Pinyin → 🇨🇳 Hanzi' },
              ] as { id: ChineseDirection; label: string }[]
            ).map((dir) => (
              <button
                key={dir.id}
                onClick={() => setChineseDirection(dir.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  chineseDirection === dir.id
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {dir.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${subject} cards by keyword, tag, or note...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Deck Filter */}
          <select
            value={selectedDeckId}
            onChange={(e) => setSelectedDeckId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
          >
            <option value="all">All Decks ({subjectDecks.length})</option>
            {subjectDecks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Badges Row: Status, Difficulty, Math Topic */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Filter:</span>

          {/* Status buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'due', label: 'Due' },
                { id: 'hard', label: 'Hard' },
                { id: 'forgot', label: 'Forgot' },
                { id: 'mastered', label: 'Mastered' },
              ] as { id: typeof statusFilter; label: string }[]
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  statusFilter === st.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="ultra-hard">🔥 Ultra-Hard</option>
          </select>

          {/* Math Topic filter if Math */}
          {subject === 'math' && (
            <select
              value={mathTopicFilter}
              onChange={(e) => setMathTopicFilter(e.target.value as any)}
              className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Math Topics</option>
              <option value="Arithmetic">Arithmetic</option>
              <option value="Fractions">Fractions</option>
              <option value="Percentages">Percentages</option>
              <option value="Ratios">Ratios</option>
              <option value="Algebra">Algebra</option>
              <option value="Equations">Equations</option>
              <option value="Geometry">Geometry</option>
              <option value="Graphs">Graphs</option>
              <option value="Basic Statistics">Basic Statistics</option>
            </select>
          )}

          <div className="ml-auto text-[11px] text-slate-400">
            Showing {filteredCards.length} of {cards.filter((c) => c.subject === subject).length} cards
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            No cards found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or adding a new card to this subject.
          </p>
          <button
            onClick={() => onAddCard(subject)}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
          >
            Create a Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const due = isCardDue(card);
            const deckName = subjectDecks.find((d) => d.id === card.deckId)?.name || 'General';

            return (
              <div
                key={card.id}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                {/* Card Top Metadata: Zero-pill discipline */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {deckName}
                    </span>
                    <span aria-hidden="true">·</span>
                    {card.difficulty === 'ultra-hard' ? (
                      <span className="text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-0.5">
                        🔥 Ultra
                      </span>
                    ) : (
                      <span className="capitalize">{card.difficulty}</span>
                    )}
                    {due && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">Due</span>
                      </>
                    )}
                  </div>

                  {/* Audio button for language cards */}
                  {(subject === 'chinese' || subject === 'english') && (
                    <button
                      onClick={() =>
                        playSpeech(card.id, subject === 'chinese' ? card.chineseWord || '' : card.word || '')
                      }
                      title="Pronounce word"
                      className={`p-1.5 rounded-lg transition-all ${
                        playingCardId === card.id
                          ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/70 ring-2 ring-indigo-400 animate-pulse'
                          : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${playingCardId === card.id ? 'animate-bounce' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Card Main Body */}
                <div className="space-y-2 py-1">
                  {subject === 'chinese' && (
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                          {card.chineseWord}
                        </span>
                        {getCardBopomofo(card) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 rounded-md border border-rose-200/70 dark:border-rose-900/60 tracking-wider">
                            <span className="text-[9px] text-rose-400 font-semibold">注音</span>
                            <span>{getCardBopomofo(card)}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                        {card.pinyin}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                        {card.englishMeaning}
                      </div>
                      {card.exampleSentence && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-2 line-clamp-2">
                          &ldquo;{card.exampleSentence}&rdquo;
                        </div>
                      )}
                    </div>
                  )}

                  {subject === 'english' && (
                    <div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {card.word}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium line-clamp-3">
                        {card.definition}
                      </div>
                      {card.exampleSentence && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-2 line-clamp-2">
                          &ldquo;{card.exampleSentence}&rdquo;
                        </div>
                      )}
                      {card.synonyms && card.synonyms.length > 0 && (
                        <div className="text-[10px] text-slate-400 mt-1.5 truncate">
                          Synonyms: {card.synonyms.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  {subject === 'math' && (
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        <span>{card.topic || 'Math'}</span>
                        {card.isProcedural && (
                          <span className="flex items-center gap-0.5 text-slate-400">
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                            <span>Procedural</span>
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                        {card.question}
                      </div>
                      <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
                        Answer: {card.answer}
                      </div>
                      {card.explanation && (
                        <div className="text-[11px] text-slate-500 mt-2 line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg font-mono">
                          {card.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: SRS Stats & Action Buttons */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>
                      {card.reviewCount === 0 ? 'New' : `${card.reviewCount} revs`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Interval: {card.interval}d</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onDuplicateCard(card)}
                      title="Duplicate card"
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditCard(card)}
                      title="Edit card"
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this card?')) {
                          onDeleteCard(card.id);
                        }
                      }}
                      title="Delete card"
                      className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
