import React, { useState, useRef } from 'react';
import {
  Settings,
  Download,
  Upload,
  Volume2,
  RotateCcw,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Moon,
  Sun,
  ShieldCheck,
  Sparkles,
  Key,
  Cpu,
  FileCode2,
  HardDrive,
} from 'lucide-react';
import { AppSettings, Card, Deck, Subject } from '../types';
import { StorageService } from '../utils/storage';
import { ttsService } from '../utils/textToSpeech';
import { GroqService, GROQ_MODELS } from '../utils/groqService';

interface SettingsPageProps {
  settings: AppSettings;
  cards: Card[];
  decks: Deck[];
  onUpdateSettings: (newSettings: AppSettings) => void;
  onDataReload: () => void;
  onOpenLLMKeyModal?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  cards,
  decks,
  onUpdateSettings,
  onDataReload,
  onOpenLLMKeyModal,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Standalone HTML Exporter (runs without any language packs)
  const handleExportStandaloneHTML = () => {
    const cardsData = StorageService.getCards();
    const decksData = StorageService.getDecks();
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinguaMath - Standalone Offline Study System</title>
  <style>
    :root { --primary: #4f46e5; --bg: #f8fafc; --text: #0f172a; --card: #ffffff; --border: #e2e8f0; }
    @media (prefers-color-scheme: dark) {
      :root { --primary: #6366f1; --bg: #090d16; --text: #f8fafc; --card: #131b2e; --border: #1e293b; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 20px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
    .container { max-width: 680px; width: 100%; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
    h1 { font-size: 20px; font-weight: 800; color: var(--primary); }
    .card-box { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 32px; min-height: 280px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 20px; cursor: pointer; transition: transform 0.2s; position: relative; }
    .card-box:hover { transform: translateY(-2px); }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: rgba(99,102,241,0.1); color: var(--primary); margin-bottom: 12px; }
    .main-text { font-size: 32px; font-weight: 700; margin-bottom: 12px; }
    .sub-text { font-size: 15px; opacity: 0.85; margin-bottom: 8px; line-height: 1.5; }
    .extra-text { font-size: 13px; opacity: 0.65; margin-top: 8px; font-style: italic; }
    .hint-label { font-size: 11px; opacity: 0.5; margin-top: 16px; }
    .controls { display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; }
    button { padding: 10px 18px; border-radius: 12px; border: none; font-weight: 600; font-size: 13px; cursor: pointer; transition: opacity 0.15s; }
    button:hover { opacity: 0.9; }
    .btn-prev { background: #e2e8f0; color: #334155; }
    .btn-flip { background: var(--primary); color: white; }
    .btn-next { background: #e2e8f0; color: #334155; }
    .btn-easy { background: #10b981; color: white; }
    .btn-hard { background: #ef4444; color: white; }
    .footer { font-size: 11px; opacity: 0.6; text-align: center; margin-top: 20px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>LinguaMath Standalone</h1>
      <span id="counter" style="font-size: 12px; font-weight: 600;"></span>
    </header>
    <div id="cardBox" class="card-box" onclick="toggleFlip()">
      <div id="cardContent"></div>
    </div>
    <div class="controls">
      <button class="btn-prev" onclick="prevCard()">← Prev</button>
      <button class="btn-flip" onclick="toggleFlip()">Space / Flip</button>
      <button class="btn-next" onclick="nextCard()">Next →</button>
    </div>
    <div class="controls">
      <button class="btn-hard" onclick="rateCard('hard')">Hard / Forgot</button>
      <button class="btn-easy" onclick="rateCard('easy')">Easy / Mastered</button>
    </div>
    <div class="footer">
      Pure Standalone HTML • Zero Language Packs Required • Data saved in local browser storage
    </div>
  </div>
  <script>
    const INITIAL_CARDS = ${JSON.stringify(cardsData)};
    let cards = JSON.parse(localStorage.getItem('linguamath_standalone_cards') || 'null') || INITIAL_CARDS;
    let idx = 0;
    let flipped = false;

    function render() {
      if (!cards.length) {
        document.getElementById('cardContent').innerHTML = '<h2>No cards found.</h2>';
        return;
      }
      const c = cards[idx];
      document.getElementById('counter').innerText = 'Card ' + (idx + 1) + ' of ' + cards.length + ' (' + c.subject.toUpperCase() + ')';
      let html = '<span class="badge">' + (c.difficulty || 'Normal').toUpperCase() + '</span>';
      if (!flipped) {
        if (c.subject === 'chinese') {
          html += '<div class="main-text">' + (c.chineseWord || '') + '</div>';
          if (c.bopomofo) html += '<div class="sub-text" style="color:#ef4444">' + c.bopomofo + '</div>';
          html += '<div class="hint-label">Click or press Space to reveal meaning</div>';
        } else if (c.subject === 'english') {
          html += '<div class="main-text">' + (c.word || '') + '</div>';
          html += '<div class="hint-label">Click or press Space to reveal definition</div>';
        } else {
          html += '<div class="main-text" style="font-size:22px">' + (c.question || '') + '</div>';
          if (c.formula) html += '<div class="sub-text">Formula: ' + c.formula + '</div>';
          html += '<div class="hint-label">Click or press Space to reveal solution</div>';
        }
      } else {
        if (c.subject === 'chinese') {
          html += '<div class="main-text" style="color:var(--primary)">' + (c.englishMeaning || '') + '</div>';
          html += '<div class="sub-text">' + (c.pinyin || '') + (c.bopomofo ? ' · ' + c.bopomofo : '') + '</div>';
          if (c.exampleSentence) html += '<div class="extra-text">"' + c.exampleSentence + '"</div>';
        } else if (c.subject === 'english') {
          html += '<div class="main-text" style="font-size:20px; color:var(--primary)">' + (c.definition || '') + '</div>';
          if (c.exampleSentence) html += '<div class="extra-text">"' + c.exampleSentence + '"</div>';
          if (c.synonyms && c.synonyms.length) html += '<div class="sub-text" style="margin-top:8px">Synonyms: ' + c.synonyms.join(', ') + '</div>';
        } else {
          html += '<div class="main-text" style="color:#10b981">' + (c.answer || '') + '</div>';
          if (c.explanation) html += '<div class="sub-text" style="white-space:pre-wrap;text-align:left;font-size:13px;margin-top:12px">' + c.explanation + '</div>';
        }
      }
      document.getElementById('cardContent').innerHTML = html;
    }

    function toggleFlip() { flipped = !flipped; render(); }
    function nextCard() { idx = (idx + 1) % cards.length; flipped = false; render(); }
    function prevCard() { idx = (idx - 1 + cards.length) % cards.length; flipped = false; render(); }
    function rateCard(rating) {
      cards[idx].reviewCount = (cards[idx].reviewCount || 0) + 1;
      if (rating === 'easy') cards[idx].easyCount = (cards[idx].easyCount || 0) + 1;
      else cards[idx].hardCount = (cards[idx].hardCount || 0) + 1;
      localStorage.setItem('linguamath_standalone_cards', JSON.stringify(cards));
      nextCard();
    }

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') { e.preventDefault(); toggleFlip(); }
      else if (e.code === 'ArrowRight') nextCard();
      else if (e.code === 'ArrowLeft') prevCard();
      else if (e.code === 'Digit1') rateCard('hard');
      else if (e.code === 'Digit2') rateCard('easy');
    });

    render();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linguamath-standalone-app.html';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'Standalone HTML application downloaded! Double-click to run anywhere.', type: 'success' });
  };

  // CSV Import State
  const [csvSubject, setCsvSubject] = useState<Subject>('chinese');
  const [csvDeckId, setCsvDeckId] = useState<string>('');

  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const availableDecksForCsv = decks.filter((d) => d.subject === csvSubject);

  const handleSettingChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleToggleSubject = (sub: Subject) => {
    let current = [...localSettings.includedSubjects];
    if (current.includes(sub)) {
      if (current.length === 1) {
        setStatusMessage({ text: 'At least one subject must be active for Daily Mix.', type: 'error' });
        return;
      }
      current = current.filter((s) => s !== sub);
    } else {
      current.push(sub);
    }
    handleSettingChange('includedSubjects', current);
  };

  const handleTestSpeech = (lang: 'zh-CN' | 'en-US') => {
    if (lang === 'zh-CN') {
      ttsService.speak('你好，欢迎使用灵语数研每日复习系统！', 'zh-CN', localSettings.speechRate);
    } else {
      ttsService.speak('Welcome to LinguaMath daily study companion!', 'en-US', localSettings.speechRate);
    }
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const jsonStr = StorageService.exportAllJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linguamath-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'Complete JSON backup downloaded successfully.', type: 'success' });
  };

  // Import JSON backup
  const handleJSONFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const result = StorageService.importAllJSON(content);
      if (result.success) {
        setStatusMessage({ text: result.message, type: 'success' });
        onDataReload();
      } else {
        setStatusMessage({ text: result.message, type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export CSV
  const handleExportCSV = (sub: Subject | 'all') => {
    const toExport = sub === 'all' ? cards : cards.filter((c) => c.subject === sub);
    const csvContent = StorageService.exportCardsCSV(toExport);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linguamath-${sub}-cards.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ text: `Exported ${toExport.length} cards to CSV.`, type: 'success' });
  };

  // Import CSV
  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetDeck = csvDeckId || availableDecksForCsv[0]?.id || 'default';

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const res = StorageService.importCardsCSV(content, csvSubject, targetDeck);
      if (res.success) {
        setStatusMessage({ text: res.message, type: 'success' });
        onDataReload();
      } else {
        setStatusMessage({ text: res.message, type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to Demo Data
  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all cards, decks, and logs to the original default library?'
      )
    ) {
      StorageService.resetToDefaults();
      onDataReload();
      setStatusMessage({ text: 'Reset completed to default flashcard collection.', type: 'success' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Settings className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            System Settings &amp; Data
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure spaced repetition parameters, daily review targets, audio speech synthesis, and backup options.
        </p>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="hover:opacity-75 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Section 0: Appearance & Theme */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {localSettings.theme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span>Appearance &amp; Theme</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Color Theme
            </div>
            <div className="text-xs text-slate-500">
              Switch between Light and Dark interface modes (or use the toggle in the top bar)
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => handleSettingChange('theme', 'light')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                localSettings.theme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light Mode</span>
            </button>
            <button
              onClick={() => handleSettingChange('theme', 'dark')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                localSettings.theme === 'dark'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-200" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>
      </section>

      {/* Section: LLM API Key Management (Groq) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              <span>LLM API Key Management (Groq)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure your Groq API credentials, pick the active LLM model, and inspect token-conserving hints.
            </p>
          </div>

          <button
            onClick={onOpenLLMKeyModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Manage Groq API Keys</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Key Status</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                {GroqService.hasApiKey() ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-emerald-600 dark:text-emerald-400">API Key Configured</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    <span className="text-amber-600 dark:text-amber-400">No Key Set (Click Manage)</span>
                  </>
                )}
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Local Storage</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Selected LLM Model</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                <span>{GROQ_MODELS.find(m => m.id === GroqService.getModel())?.name || GroqService.getModel()}</span>
              </div>
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
              {GROQ_MODELS.find(m => m.id === GroqService.getModel())?.speed || 'High Speed'}
            </span>
          </div>
        </div>
      </section>

      {/* Section 1: Daily Review Settings */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Daily Mix Review Preferences</span>
        </h2>

        {/* Daily Target */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Daily Target Cards
            </div>
            <div className="text-xs text-slate-500">
              Total number of cards generated in each Daily Review session
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[10, 15, 20, 25, 30, 40].map((num) => (
              <button
                key={num}
                onClick={() => handleSettingChange('dailyTarget', num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  localSettings.dailyTarget === num
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Included Subjects */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Subjects in Daily Mix
            </div>
            <div className="text-xs text-slate-500">
              Select which subjects participate in the randomized daily session
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: 'chinese' as Subject, label: '🇨🇳 Chinese' },
              { id: 'english' as Subject, label: '🇬🇧 English' },
              { id: 'math' as Subject, label: '➗ Mathematics' },
            ].map((sub) => {
              const active = localSettings.includedSubjects.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => handleToggleSubject(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {sub.label} {active ? '✓' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prioritize Difficult Cards Toggle */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Prioritize Difficult Cards
            </div>
            <div className="text-xs text-slate-500">
              Cards marked Hard or Forgot receive higher selection weight in daily sessions
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.prioritizeDifficult}
              onChange={(e) => handleSettingChange('prioritizeDifficult', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Randomize Order Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Randomize Card Order
            </div>
            <div className="text-xs text-slate-500">
              Interleave subjects randomly during daily review for better retention
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.randomizeOrder}
              onChange={(e) => handleSettingChange('randomizeOrder', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </section>

      {/* Section 2: Speech Synthesis & Audio Settings */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Pronunciation &amp; Audio (Web Speech API)</span>
        </h2>

        {/* Speech Rate Slider */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Pronunciation Speed: {localSettings.speechRate}x
            </div>
            <div className="text-xs text-slate-500">
              Comfortable learning playback speed (0.7x – 1.2x recommended)
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={localSettings.speechRate}
              onChange={(e) => handleSettingChange('speechRate', parseFloat(e.target.value))}
              className="w-36 accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Audio Test Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Test Audio Pronunciation
            </div>
            <div className="text-xs text-slate-500">
              Plays pronunciation test using Web Speech API or Cloud Audio Fallback
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTestSpeech('zh-CN')}
              className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Chinese (苹果)</span>
            </button>
            <button
              onClick={() => handleTestSpeech('en-US')}
              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test English (Serendipity)</span>
            </button>
          </div>
        </div>

        {/* Audio Troubleshooting Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-500" />
            <span>Audio Troubleshooting Guide</span>
          </div>
          <ul className="text-slate-600 dark:text-slate-400 space-y-1 text-[11px] list-disc list-inside">
            <li><strong>Browser Tab Sound:</strong> Check if your browser tab is muted (look for a mute icon on the browser tab bar).</li>
            <li><strong>System Volume:</strong> Ensure your computer / phone speakers or headphones are unmuted and volume is turned up.</li>
            <li><strong>Dual Audio Engine:</strong> LinguaMath attempts your device&apos;s native Web Speech synthesis first. If your OS lacks a Chinese or English voice pack, it seamlessly switches to an online pronunciation stream.</li>
          </ul>
        </div>
      </section>

      {/* Section 3: Data Management & Import / Export */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Local Storage &amp; Backup / Export</span>
        </h2>

        {/* Full JSON Backup */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Full System Backup (JSON)
            </div>
            <div className="text-xs text-slate-500">
              Exports all {cards.length} cards, {decks.length} decks, review history, and settings into a single JSON file.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => jsonFileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
            </button>
            <input
              type="file"
              ref={jsonFileInputRef}
              onChange={handleJSONFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Pure HTML Architecture & Standalone HTML Exporter */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 to-purple-50/60 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Zero-Dependency Standalone HTML Application</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Runs natively in standard HTML format on any local computer without requiring Python, Ruby, PHP, Java, Node, or language packs. All cards, decks, and logs persist automatically in your browser&apos;s lightweight database (<code className="font-mono text-[11px] bg-white/70 dark:bg-slate-800 px-1 py-0.5 rounded">localStorage</code>).
              </p>
            </div>
            <button
              onClick={handleExportStandaloneHTML}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Standalone HTML App</span>
            </button>
          </div>
        </div>

        {/* CSV Import/Export */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>CSV Spreadsheet Exchange</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Export cards as CSV or import bulk flashcard lists directly into a deck.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Subject for CSV
              </label>
              <select
                value={csvSubject}
                onChange={(e) => setCsvSubject(e.target.value as Subject)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="chinese">🇨🇳 Chinese</option>
                <option value="english">🇬🇧 English</option>
                <option value="math">➗ Mathematics</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Deck
              </label>
              <select
                value={csvDeckId}
                onChange={(e) => setCsvDeckId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {availableDecksForCsv.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => handleExportCSV(csvSubject)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export {csvSubject} (CSV)</span>
            </button>
            <button
              onClick={() => csvFileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import to Deck (CSV)</span>
            </button>
            <input
              type="file"
              ref={csvFileInputRef}
              onChange={handleCSVFileChange}
              accept=".csv"
              className="hidden"
            />
          </div>
        </div>

        {/* Danger Zone: Reset to Defaults */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
              Restore Starter Library
            </div>
            <div className="text-[11px] text-slate-400">
              Resets collection back to the default curated cards across Chinese, English, and Math.
            </div>
          </div>
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Library</span>
          </button>
        </div>
      </section>
    </div>
  );
};
