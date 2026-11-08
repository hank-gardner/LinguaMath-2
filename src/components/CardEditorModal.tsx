import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { Card, Deck, Difficulty, MathTopic, Subject } from '../types';
import { pinyinToBopomofo } from '../utils/bopomofo';
import { GroqService } from '../utils/groqService';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: Partial<Card>) => void;
  cardToEdit?: Card | null;
  defaultSubject: Subject;
  decks: Deck[];
  onOpenLLMKeyModal?: () => void;
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cardToEdit,
  defaultSubject,
  decks,
  onOpenLLMKeyModal,
}) => {
  const [subject, setSubject] = useState<Subject>(cardToEdit?.subject || defaultSubject);
  const [deckId, setDeckId] = useState<string>(cardToEdit?.deckId || '');
  const [difficulty, setDifficulty] = useState<Difficulty>(cardToEdit?.difficulty || 'beginner');
  const [tagsInput, setTagsInput] = useState<string>(cardToEdit?.tags?.join(', ') || '');
  const [notes, setNotes] = useState<string>(cardToEdit?.notes || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  // Chinese fields
  const [chineseWord, setChineseWord] = useState(cardToEdit?.chineseWord || '');
  const [pinyin, setPinyin] = useState(cardToEdit?.pinyin || '');
  const [bopomofo, setBopomofo] = useState(cardToEdit?.bopomofo || '');
  const [englishMeaning, setEnglishMeaning] = useState(cardToEdit?.englishMeaning || '');
  const [chineseExample, setChineseExample] = useState(cardToEdit?.exampleSentence || '');

  // English fields
  const [englishWord, setEnglishWord] = useState(cardToEdit?.word || '');
  const [englishDef, setEnglishDef] = useState(cardToEdit?.definition || '');
  const [englishExample, setEnglishExample] = useState(cardToEdit?.exampleSentence || '');
  const [synonymsInput, setSynonymsInput] = useState(cardToEdit?.synonyms?.join(', ') || '');
  const [antonymsInput, setAntonymsInput] = useState(cardToEdit?.antonyms?.join(', ') || '');

  // Math fields
  const [mathQuestion, setMathQuestion] = useState(cardToEdit?.question || '');
  const [mathAnswer, setMathAnswer] = useState(cardToEdit?.answer || '');
  const [mathFormula, setMathFormula] = useState(cardToEdit?.formula || '');
  const [mathExplanation, setMathExplanation] = useState(cardToEdit?.explanation || '');
  const [mathTopic, setMathTopic] = useState<MathTopic>(cardToEdit?.topic || 'Arithmetic');
  const [isProcedural, setIsProcedural] = useState(cardToEdit?.isProcedural || false);
  const [generatorType, setGeneratorType] = useState(cardToEdit?.generatorType || 'arithmetic-mult');

  // Filter decks for selected subject
  const subjectDecks = decks.filter((d) => d.subject === subject);

  useEffect(() => {
    if (cardToEdit) {
      setSubject(cardToEdit.subject);
      setDeckId(cardToEdit.deckId);
      setDifficulty(cardToEdit.difficulty);
      setTagsInput(cardToEdit.tags?.join(', ') || '');
      setNotes(cardToEdit.notes || '');

      setChineseWord(cardToEdit.chineseWord || '');
      setPinyin(cardToEdit.pinyin || '');
      setBopomofo(cardToEdit.bopomofo || (cardToEdit.pinyin ? pinyinToBopomofo(cardToEdit.pinyin) : ''));
      setEnglishMeaning(cardToEdit.englishMeaning || '');
      setChineseExample(cardToEdit.exampleSentence || '');

      setEnglishWord(cardToEdit.word || '');
      setEnglishDef(cardToEdit.definition || '');
      setEnglishExample(cardToEdit.exampleSentence || '');
      setSynonymsInput(cardToEdit.synonyms?.join(', ') || '');
      setAntonymsInput(cardToEdit.antonyms?.join(', ') || '');

      setMathQuestion(cardToEdit.question || '');
      setMathAnswer(cardToEdit.answer || '');
      setMathFormula(cardToEdit.formula || '');
      setMathExplanation(cardToEdit.explanation || '');
      setMathTopic(cardToEdit.topic || 'Arithmetic');
      setIsProcedural(cardToEdit.isProcedural || false);
      setGeneratorType(cardToEdit.generatorType || 'arithmetic-mult');
    } else {
      setSubject(defaultSubject);
      const available = decks.filter((d) => d.subject === defaultSubject);
      setDeckId(available[0]?.id || '');
      setDifficulty('beginner');
      setTagsInput('');
      setNotes('');
      setChineseWord('');
      setPinyin('');
      setBopomofo('');
      setEnglishMeaning('');
      setChineseExample('');
      setEnglishWord('');
      setEnglishDef('');
      setEnglishExample('');
      setSynonymsInput('');
      setAntonymsInput('');
      setMathQuestion('');
      setMathAnswer('');
      setMathFormula('');
      setMathExplanation('');
      setMathTopic('Arithmetic');
      setIsProcedural(false);
      setGeneratorType('arithmetic-mult');
    }
  }, [cardToEdit, defaultSubject, decks, isOpen]);

  // Ensure deckId is valid when subject changes
  useEffect(() => {
    if (!deckId || !subjectDecks.some((d) => d.id === deckId)) {
      if (subjectDecks.length > 0) {
        setDeckId(subjectDecks[0].id);
      }
    }
  }, [subject, subjectDecks, deckId]);

  if (!isOpen) return null;

  const handleAIAutoAnalyze = async () => {
    setAiStatus({ type: 'idle', message: '' });
    let input = '';
    if (subject === 'math') input = mathQuestion.trim();
    else if (subject === 'chinese') input = chineseWord.trim();
    else if (subject === 'english') input = englishWord.trim();

    if (!input) {
      setAiStatus({
        type: 'error',
        message: `Please type a ${subject === 'math' ? 'question' : 'word'} above first before clicking Auto-Analyze.`,
      });
      return;
    }

    if (!GroqService.hasApiKey()) {
      setAiStatus({
        type: 'error',
        message: 'No LLM API Key found. Click "Configure Key" to add your Groq / OpenRouter key.',
      });
      if (onOpenLLMKeyModal) {
        onOpenLLMKeyModal();
      }
      return;
    }

    setIsAnalyzing(true);
    const activeModel = GroqService.getModel();
    setAiStatus({
      type: 'loading',
      message: `Analyzing with ${activeModel}...`,
    });

    try {
      const res = await GroqService.autoAnalyze({
        subject,
        input,
        topic: subject === 'math' ? mathTopic : undefined,
      });

      if (subject === 'math') {
        if (res.answer) setMathAnswer(res.answer);
        if (res.explanation) setMathExplanation(res.explanation);
        if (res.formula) setMathFormula(res.formula);
      } else if (subject === 'chinese') {
        if (res.pinyin) {
          setPinyin(res.pinyin);
          setBopomofo(res.bopomofo || pinyinToBopomofo(res.pinyin));
        }
        if (res.englishMeaning) setEnglishMeaning(res.englishMeaning);
        if (res.exampleSentence) setChineseExample(res.exampleSentence);
      } else if (subject === 'english') {
        if (res.definition) setEnglishDef(res.definition);
        if (res.exampleSentence) setEnglishExample(res.exampleSentence);
        if (res.synonyms && res.synonyms.length > 0) setSynonymsInput(res.synonyms.join(', '));
        if (res.antonyms && res.antonyms.length > 0) setAntonymsInput(res.antonyms.join(', '));
      }

      setAiStatus({
        type: 'success',
        message: 'Analysis complete! Fields populated with concise results.',
      });
      setTimeout(() => setAiStatus({ type: 'idle', message: '' }), 4000);
    } catch (err: any) {
      setAiStatus({
        type: 'error',
        message: err.message || 'Auto-Analyze failed. Please check your API key & model settings.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAIStatusBanner = () => {
    if (aiStatus.type === 'idle') return null;
    return (
      <div
        className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2.5 transition-all animate-in fade-in duration-150 ${
          aiStatus.type === 'loading'
            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
            : aiStatus.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}
      >
        <div className="flex items-center gap-2 leading-relaxed">
          {aiStatus.type === 'loading' && <Sparkles className="w-4 h-4 animate-spin shrink-0 text-indigo-500" />}
          {aiStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />}
          {aiStatus.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />}
          <span className="font-medium">{aiStatus.message}</span>
        </div>
        {aiStatus.type === 'error' && onOpenLLMKeyModal && (
          <button
            type="button"
            onClick={onOpenLLMKeyModal}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-xs"
          >
            <Key className="w-3 h-3" />
            <span>Configure Key</span>
          </button>
        )}
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const baseData: Partial<Card> = {
      subject,
      deckId: deckId || (subjectDecks[0] ? subjectDecks[0].id : 'default'),
      difficulty,
      tags,
      notes: notes.trim() || undefined,
    };

    if (subject === 'chinese') {
      if (!chineseWord.trim() || !englishMeaning.trim()) {
        alert('Please fill in both Chinese characters and English meaning.');
        return;
      }
      baseData.chineseWord = chineseWord.trim();
      baseData.pinyin = pinyin.trim();
      baseData.bopomofo = bopomofo.trim() || (pinyin.trim() ? pinyinToBopomofo(pinyin.trim()) : undefined);
      baseData.englishMeaning = englishMeaning.trim();
      baseData.exampleSentence = chineseExample.trim() || undefined;
    } else if (subject === 'english') {
      if (!englishWord.trim() || !englishDef.trim()) {
        alert('Please fill in both word and definition.');
        return;
      }
      baseData.word = englishWord.trim();
      baseData.definition = englishDef.trim();
      baseData.exampleSentence = englishExample.trim() || undefined;
      baseData.synonyms = synonymsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      baseData.antonyms = antonymsInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);
    } else {
      if (!mathQuestion.trim() || !mathAnswer.trim()) {
        alert('Please provide both question and answer for mathematics.');
        return;
      }
      baseData.question = mathQuestion.trim();
      baseData.answer = mathAnswer.trim();
      baseData.formula = mathFormula.trim() || undefined;
      baseData.explanation = mathExplanation.trim() || undefined;
      baseData.topic = mathTopic;
      baseData.isProcedural = isProcedural;
      baseData.generatorType = isProcedural ? generatorType : undefined;
    }

    onSave(baseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Plus className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {cardToEdit ? 'Edit Flashcard' : 'Create New Flashcard'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Picker (if creating new) */}
          {!cardToEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subject
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'chinese', label: '🇨🇳 Chinese' },
                    { id: 'english', label: '🇬🇧 English' },
                    { id: 'math', label: '➗ Mathematics' },
                  ] as { id: Subject; label: string }[]
                ).map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSubject(sub.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      subject === sub.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deck Selector & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deck
              </label>
              <select
                value={deckId}
                onChange={(e) => setDeckId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subjectDecks.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="beginner">Beginner / Easy</option>
                <option value="intermediate">Intermediate / Medium</option>
                <option value="advanced">Advanced / Hard</option>
                <option value="ultra-hard">🔥 Ultra-Hard / Mastery</option>
              </select>
            </div>
          </div>

          {/* SUBJECT SPECIFIC FIELDS */}
          {subject === 'chinese' && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chinese Word / Characters *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 苹果"
                    value={chineseWord}
                    onChange={(e) => setChineseWord(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Pinyin and Bopomofo fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pinyin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. píngguǒ"
                    value={pinyin}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPinyin(val);
                      if (!bopomofo || bopomofo === pinyinToBopomofo(pinyin)) {
                        setBopomofo(pinyinToBopomofo(val));
                      }
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Bopomofo (注音符號)
                    </label>
                    <button
                      type="button"
                      onClick={() => setBopomofo(pinyinToBopomofo(pinyin))}
                      className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                    >
                      Convert Pinyin
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. ㄆㄧㄥˊ ㄍㄨㄛˇ"
                    value={bopomofo}
                    onChange={(e) => setBopomofo(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Meaning & Example Sentence with AI Auto-Analyze Button */}
              <div className="pt-1 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Meaning &amp; Example Sentence *
                  </span>
                  <button
                    type="button"
                    onClick={handleAIAutoAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white shadow-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title={GroqService.hasApiKey() ? "Auto-analyze Chinese word with AI to fill Pinyin, Bopomofo, and concise English translation" : "Configure API key to enable AI Auto-Analyze"}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzing ? 'Analyzing...' : 'AI Auto-Analyze'}</span>
                  </button>
                </div>

                {renderAIStatusBanner()}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    English Meaning *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. apple"
                    value={englishMeaning}
                    onChange={(e) => setEnglishMeaning(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Example Sentence (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 我喜欢吃新鲜的苹果。"
                    value={chineseExample}
                    onChange={(e) => setChineseExample(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {subject === 'english' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Word / Phrase *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Serendipity"
                  value={englishWord}
                  onChange={(e) => setEnglishWord(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Definition &amp; Context *
                </span>
                <button
                  type="button"
                  onClick={handleAIAutoAnalyze}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white shadow-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title={GroqService.hasApiKey() ? "Auto-analyze English word with AI to fill concise definition, example, synonyms, and antonyms" : "Configure API key to enable AI Auto-Analyze"}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analyzing...' : 'AI Auto-Analyze'}</span>
                </button>
              </div>

              {renderAIStatusBanner()}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Definition *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Occurrence of events by chance in a happy or beneficial way"
                  value={englishDef}
                  onChange={(e) => setEnglishDef(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Example Sentence
                </label>
                <input
                  type="text"
                  placeholder="e.g. Finding this quaint bookstore was pure serendipity."
                  value={englishExample}
                  onChange={(e) => setEnglishExample(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Synonyms (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="chance, fluke, luck"
                    value={synonymsInput}
                    onChange={(e) => setSynonymsInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Antonyms (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="misfortune, bad luck"
                    value={antonymsInput}
                    onChange={(e) => setAntonymsInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {subject === 'math' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic
                </label>
                <select
                  value={mathTopic}
                  onChange={(e) => setMathTopic(e.target.value as MathTopic)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Arithmetic">Arithmetic</option>
                  <option value="Fractions">Fractions</option>
                  <option value="Percentages">Percentages</option>
                  <option value="Ratios">Ratios</option>
                  <option value="Algebra">Algebra</option>
                  <option value="Equations">Equations</option>
                  <option value="Geometry">Geometry</option>
                  <option value="Graphs">Graphs</option>
                  <option value="Basic Statistics">Basic Statistics</option>
                  <option value="General">General Math</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve for x: 3x + 7 = 22"
                  value={mathQuestion}
                  onChange={(e) => setMathQuestion(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Answer & Step-by-Step Explanation with AI Auto-Analyze Button right to the right of the title */}
              <div className="pt-1 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Answer &amp; Step-by-Step Explanation *
                  </span>
                  <button
                    type="button"
                    onClick={handleAIAutoAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-95 text-white shadow-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title={GroqService.hasApiKey() ? "Auto-analyze with AI to input the most concise answer & step-by-step solution" : "Configure API key to enable AI Auto-Analyze"}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzing ? 'Analyzing...' : 'AI Auto-Analyze'}</span>
                  </button>
                </div>

                {renderAIStatusBanner()}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Answer *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. x = 5"
                      value={mathAnswer}
                      onChange={(e) => setMathAnswer(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Formula (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ax + b = c"
                      value={mathFormula}
                      onChange={(e) => setMathFormula(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Worked Solution / Step-by-Step Explanation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Step 1: Subtract 7...\nStep 2: Divide by 3..."
                    value={mathExplanation}
                    onChange={(e) => setMathExplanation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px] leading-relaxed"
                  />
                </div>
              </div>

              {/* Procedural generator toggle */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isProcedural}
                    onChange={(e) => setIsProcedural(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Randomized Procedural Question Generator</span>
                  </span>
                </label>
                {isProcedural && (
                  <select
                    value={generatorType}
                    onChange={(e) => setGeneratorType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="arithmetic-mult">Arithmetic: Multi-digit Mental Math</option>
                    <option value="arithmetic-order">Arithmetic: Order of Operations (PEMDAS)</option>
                    <option value="linear-eq">Equations: Linear ax + b = c</option>
                    <option value="fractions-add">Fractions: Adding &amp; Simplifying</option>
                    <option value="percent-calc">Percentages: Discount &amp; Value of Base</option>
                    <option value="ratios-divide">Ratios: Dividing Totals into Parts</option>
                    <option value="geometry-pythagoras">Geometry: Pythagorean Theorem</option>
                    <option value="geometry-circle">Geometry: Circle Area &amp; Circumference</option>
                    <option value="stats-mean">Statistics: Data Set Mean</option>
                    <option value="graphs-slope">Graphs: Line Slope between 2 Points</option>
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Tags & Notes */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="exam, chapter1, core"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Optional Notes
              </label>
              <input
                type="text"
                placeholder="Mnemonics or exam tips"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              {cardToEdit ? 'Save Changes' : 'Create Flashcard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
