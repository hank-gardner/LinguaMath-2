import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  Sparkles,
  Copy,
  Check,
  Shield,
  Layers,
  Globe,
} from 'lucide-react';
import {
  GroqService,
  GROQ_MODELS,
  DEFAULT_GROQ_MODEL,
  TOKEN_CONSERVING_SYSTEM_HINTS,
  LLMProvider,
} from '../utils/groqService';

interface LLMKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const LLMKeyModal: React.FC<LLMKeyModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_GROQ_MODEL);
  const [provider, setProvider] = useState<LLMProvider>('auto');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showHintsSection, setShowHintsSection] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(GroqService.getApiKey());
      setSelectedModel(GroqService.getModel());
      setProvider(GroqService.getProvider());
      setCustomEndpoint(GroqService.getCustomEndpoint());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    GroqService.setApiKey(apiKey.trim());
    GroqService.setModel(selectedModel);
    GroqService.setProvider(provider);
    GroqService.setCustomEndpoint(customEndpoint.trim());
    onSaved?.();
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await GroqService.testConnection(apiKey, selectedModel, provider);
    setTesting(false);
    setTestResult(result);
  };

  const copyHint = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentModelObj = GROQ_MODELS.find((m) => m.id === selectedModel) || GROQ_MODELS[0];

  // Helper detection for key prefix
  const trimmedKey = apiKey.trim();
  const detectedType = trimmedKey.startsWith('gsk_')
    ? 'groq'
    : trimmedKey.startsWith('sk-or-')
    ? 'openrouter'
    : trimmedKey.startsWith('sk-')
    ? 'openai'
    : 'unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-labelledby="llm-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-inner">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 id="llm-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                LLM API Key Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage Groq / OpenRouter credentials &amp; OpenAI GPT-OSS models
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Lightweight Local Persistence Callout */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200 text-xs leading-relaxed">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Zero External Database &amp; Local Persistence:</strong> Your API key is stored securely in your browser&apos;s local storage (<code className="font-mono text-[10px] bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">localStorage</code>). No cloud servers or external language packs are required.
            </span>
          </div>

          {/* Provider Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>API Provider / Endpoint Route</span>
            </label>

            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value as LLMProvider);
                setTestResult(null);
              }}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="auto">Auto-Detect (Recommended: Groq gsk_ or OpenRouter sk-or-)</option>
              <option value="groq">Groq Cloud (api.groq.com)</option>
              <option value="openrouter">OpenRouter (openrouter.ai)</option>
              <option value="openai">OpenAI Compatible (api.openai.com)</option>
              <option value="custom">Custom Endpoint URL</option>
            </select>
          </div>

          {/* Custom Endpoint Input (if custom selected) */}
          {provider === 'custom' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Custom Chat Completions URL
              </label>
              <input
                type="text"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://your-custom-endpoint/v1/chat/completions"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>API Key</span>
                <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-3">
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Groq Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>OpenRouter Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="gsk_... or sk-or-v1-..."
                className="w-full pl-3.5 pr-11 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Key Format Detection Badge */}
            <div className="flex items-center gap-1.5 text-[11px] px-1 pt-0.5">
              {detectedType === 'groq' && (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Groq key format detected (<code className="font-mono text-[10px]">gsk_...</code>) → Routing to Groq Cloud API
                </span>
              )}
              {detectedType === 'openrouter' && (
                <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> OpenRouter key format detected (<code className="font-mono text-[10px]">sk-or-v1-...</code>) → Routing to OpenRouter
                </span>
              )}
              {detectedType === 'openai' && (
                <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  OpenAI format detected (<code className="font-mono text-[10px]">sk-...</code>)
                </span>
              )}
              {detectedType === 'unknown' && trimmedKey.length > 0 && (
                <span className="text-slate-500 dark:text-slate-400">
                  Custom key format. Ensure your provider or endpoint is set correctly.
                </span>
              )}
              {!trimmedKey && (
                <span className="text-slate-400">
                  Paste your Groq API key (<code className="font-mono">gsk_...</code>) or OpenRouter key (<code className="font-mono">sk-or-...</code>)
                </span>
              )}
            </div>
          </div>

          {/* Model Selection Dropdown (openai/gpt-oss-120b & openai/gpt-oss-20b) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>Selected LLM Model</span>
            </label>

            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {GROQ_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} — {model.speed} {model.isRecommended ? '★ Recommended' : ''}
                </option>
              ))}
            </select>

            {/* Model description tag */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 px-1 leading-relaxed">
              {currentModelObj?.description}
            </div>
          </div>

          {/* Test Connection Action & Status */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <button
                type="button"
                disabled={testing || !apiKey.trim()}
                onClick={handleTestConnection}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed self-start cursor-pointer"
              >
                <Zap className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-indigo-500' : 'text-amber-500'}`} />
                <span>{testing ? 'Testing Endpoint...' : 'Test Connection'}</span>
              </button>

              {testResult && (
                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold max-w-sm ${
                    testResult.success
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span className="leading-snug">{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Token-Conserving System Hints Section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowHintsSection(!showHintsSection)}
              className="w-full p-3.5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Token-Conserving System Hints (Devised Prompts)
                </span>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                {showHintsSection ? 'Hide' : 'View Prompts'}
              </span>
            </button>

            {showHintsSection && (
              <div className="p-4 bg-white dark:bg-slate-900 space-y-3.5 text-xs border-t border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                  These prompts enforce strict raw JSON with zero conversational filler, keeping both prompt input tokens and response output tokens under 100 tokens:
                </p>

                {/* Math Prompt */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                    <span>Mathematics System Hint (~28 tokens)</span>
                    <button
                      type="button"
                      onClick={() => copyHint('math', TOKEN_CONSERVING_SYSTEM_HINTS.math)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'math' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[10px]">{copiedKey === 'math' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {TOKEN_CONSERVING_SYSTEM_HINTS.math}
                  </pre>
                </div>

                {/* Chinese Prompt */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-[11px] text-rose-600 dark:text-rose-400">
                    <span>Chinese System Hint (~26 tokens)</span>
                    <button
                      type="button"
                      onClick={() => copyHint('chinese', TOKEN_CONSERVING_SYSTEM_HINTS.chinese)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'chinese' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[10px]">{copiedKey === 'chinese' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {TOKEN_CONSERVING_SYSTEM_HINTS.chinese}
                  </pre>
                </div>

                {/* English Prompt */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-[11px] text-blue-600 dark:text-blue-400">
                    <span>English System Hint (~24 tokens)</span>
                    <button
                      type="button"
                      onClick={() => copyHint('english', TOKEN_CONSERVING_SYSTEM_HINTS.english)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'english' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span className="text-[10px]">{copiedKey === 'english' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {TOKEN_CONSERVING_SYSTEM_HINTS.english}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors active:scale-95 cursor-pointer"
          >
            Save &amp; Apply
          </button>
        </div>
      </div>
    </div>
  );
};
