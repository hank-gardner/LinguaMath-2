/**
 * Universal LLM Service
 * Direct browser-to-API integration with server proxy fallback for CORS resilience.
 * Supports OpenAI GPT-OSS (120B & 20B) via Groq, OpenRouter, and standard endpoints.
 * Employs token-conserving system hints and strips reasoning <think> blocks cleanly.
 */

const STORAGE_KEYS = {
  API_KEY: 'linguamath_groq_api_key_v1',
  MODEL: 'linguamath_groq_model_v1',
  PROVIDER: 'linguamath_llm_provider_v1',
  CUSTOM_ENDPOINT: 'linguamath_custom_endpoint_v1',
};

export type LLMProvider = 'auto' | 'groq' | 'openrouter' | 'openai' | 'custom';

export interface GroqModelOption {
  id: string;
  name: string;
  description: string;
  speed: string;
  isRecommended?: boolean;
}

export const GROQ_MODELS: GroqModelOption[] = [
  {
    id: 'openai/gpt-oss-120b',
    name: 'OpenAI GPT-OSS 120B (openai/gpt-oss-120b)',
    description: 'Flagship 120B MoE open-weight reasoning model by OpenAI. High accuracy, step-by-step problem breakdown, and nuanced explanations.',
    speed: 'Fast (~200 t/s)',
    isRecommended: true,
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'OpenAI GPT-OSS 20B (openai/gpt-oss-20b)',
    description: 'High-efficiency 20B MoE model by OpenAI. Ultra-low latency, blazing fast responses, and minimal token usage.',
    speed: 'Blazing (~500 t/s)',
  },
];

export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';

/**
 * TOKEN-CONSERVING SYSTEM HINTS
 * Devised specifically to:
 * 1. Keep system prompt below 30 tokens (saving input tokens on every single call)
 * 2. Forbid conversational filler (e.g. "Sure!", "Here is your answer:", "Hope this helps!")
 * 3. Enforce strictly raw, compact JSON without markdown backticks or wrappers
 * 4. Yield the most concise step-by-step explanation and concise final answer (saving output tokens)
 */
export const TOKEN_CONSERVING_SYSTEM_HINTS = {
  math: 'Concise math solver. Output ONLY raw JSON: {"answer":"final concise result","explanation":"1. step\\n2. step","formula":"optional core formula"}. No markdown, no filler, maximum brevity.',
  chinese: 'Concise Chinese lexicographer. Output ONLY raw JSON: {"pinyin":"accented pinyin","bopomofo":"zhuyin symbols","englishMeaning":"concise meaning","exampleSentence":"short natural sentence"}. No markdown, no filler, maximum brevity.',
  english: 'Concise lexicographer. Output ONLY raw JSON: {"definition":"crisp meaning","exampleSentence":"short natural sentence","synonyms":["syn1","syn2"],"antonyms":["ant1","ant2"]}. No markdown, no filler, maximum brevity.',
};

export class GroqService {
  public static getApiKey(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    } catch {
      return '';
    }
  }

  public static setApiKey(key: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
    } catch (e) {
      console.error('Failed to save API key', e);
    }
  }

  public static getModel(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MODEL);
      if (stored && GROQ_MODELS.some((m) => m.id === stored)) {
        return stored;
      }
      return DEFAULT_GROQ_MODEL;
    } catch {
      return DEFAULT_GROQ_MODEL;
    }
  }

  public static setModel(model: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MODEL, model.trim());
    } catch (e) {
      console.error('Failed to save LLM model', e);
    }
  }

  public static getProvider(): LLMProvider {
    try {
      return (localStorage.getItem(STORAGE_KEYS.PROVIDER) as LLMProvider) || 'auto';
    } catch {
      return 'auto';
    }
  }

  public static setProvider(provider: LLMProvider): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
    } catch (e) {
      console.error('Failed to save LLM provider', e);
    }
  }

  public static getCustomEndpoint(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.CUSTOM_ENDPOINT) || '';
    } catch {
      return '';
    }
  }

  public static setCustomEndpoint(endpoint: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ENDPOINT, endpoint.trim());
    } catch (e) {
      console.error('Failed to save custom endpoint', e);
    }
  }

  public static hasApiKey(): boolean {
    return Boolean(this.getApiKey());
  }

  /**
   * Resolves the target completion endpoint based on provider or key pattern
   */
  public static resolveEndpoint(apiKey: string, provider?: LLMProvider): string {
    const activeProvider = provider || this.getProvider();
    const custom = this.getCustomEndpoint();

    if (activeProvider === 'custom' && custom) {
      return custom;
    }
    if (activeProvider === 'openrouter') {
      return 'https://openrouter.ai/api/v1/chat/completions';
    }
    if (activeProvider === 'openai') {
      return 'https://api.openai.com/v1/chat/completions';
    }
    if (activeProvider === 'groq') {
      return 'https://api.groq.com/openai/v1/chat/completions';
    }

    // 'auto' mode: check API key prefix
    const cleanKey = apiKey.trim();
    if (cleanKey.startsWith('sk-or-')) {
      return 'https://openrouter.ai/api/v1/chat/completions';
    }
    if (cleanKey.startsWith('gsk_')) {
      return 'https://api.groq.com/openai/v1/chat/completions';
    }
    if (cleanKey.startsWith('sk-proj-') || cleanKey.startsWith('sk-')) {
      return 'https://openrouter.ai/api/v1/chat/completions';
    }

    // Default to Groq endpoint
    return 'https://api.groq.com/openai/v1/chat/completions';
  }

  /**
   * Dispatches chat completion with dual direct-browser + backend proxy fallback
   */
  private static async dispatchChat(
    apiKey: string,
    endpoint: string,
    body: Record<string, any>
  ): Promise<any> {
    // 1. Attempt direct browser fetch first
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify(body),
      });

      const responseText = await response.text();
      let responseJson: any;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = { error: { message: responseText } };
      }

      if (!response.ok) {
        const errMsg =
          responseJson?.error?.message ||
          responseJson?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errMsg);
      }

      return responseJson;
    } catch (directErr: any) {
      const isNetworkOrCors =
        directErr instanceof TypeError ||
        directErr?.message?.includes('Failed to fetch') ||
        directErr?.message?.includes('NetworkError');

      // If it was a network/CORS error, attempt relay via local server proxy
      if (isNetworkOrCors && typeof window !== 'undefined') {
        try {
          const proxyRes = await fetch('/api/llm/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint, apiKey, body }),
          });

          const proxyJson = await proxyRes.json();
          if (!proxyRes.ok) {
            throw new Error(proxyJson?.error?.message || `Proxy HTTP ${proxyRes.status}`);
          }
          return proxyJson;
        } catch (proxyErr: any) {
          throw new Error(`Connection error: ${directErr.message} (Proxy also failed: ${proxyErr.message})`);
        }
      }

      // If it was an API error (e.g. 401, 404), rethrow
      throw directErr;
    }
  }

  /**
   * Tests the connection with Groq / OpenRouter API
   */
  public static async testConnection(
    apiKey: string,
    model: string,
    provider?: LLMProvider
  ): Promise<{ success: boolean; message: string }> {
    if (!apiKey.trim()) {
      return { success: false, message: 'Please enter an API Key.' };
    }

    const endpoint = this.resolveEndpoint(apiKey, provider);
    const chosenModel = model || DEFAULT_GROQ_MODEL;

    try {
      const body: any = {
        model: chosenModel,
        messages: [
          { role: 'user', content: 'Say OK.' },
        ],
        max_tokens: 300,
        max_completion_tokens: 300,
        temperature: 0.1,
      };

      if (endpoint.includes('groq.com') && (chosenModel.includes('gpt-oss') || chosenModel.includes('r1'))) {
        body.reasoning_format = 'hidden';
        body.reasoning_effort = 'low';
      }

      try {
        await this.dispatchChat(apiKey, endpoint, body);
      } catch (firstErr: any) {
        if (body.reasoning_format && firstErr.message?.includes('reasoning_format')) {
          delete body.reasoning_format;
          delete body.reasoning_effort;
          await this.dispatchChat(apiKey, endpoint, body);
        } else {
          throw firstErr;
        }
      }

      const endpointHost = new URL(endpoint).hostname;
      return {
        success: true,
        message: `Connected successfully to ${chosenModel} (${endpointHost})!`,
      };
    } catch (err: any) {
      let friendly = err.message || 'Network error connecting to API.';
      if (friendly.includes('Invalid API Key') || friendly.includes('User not found')) {
        friendly += " — Tip: Groq keys start with 'gsk_', OpenRouter keys start with 'sk-or-'.";
      }
      return { success: false, message: friendly };
    }
  }

  /**
   * Auto-analyzes a question or word with token-conserving prompts & reasoning tag stripping.
   */
  public static async autoAnalyze({
    subject,
    input,
    topic,
  }: {
    subject: 'math' | 'chinese' | 'english';
    input: string;
    topic?: string;
  }): Promise<{
    answer?: string;
    explanation?: string;
    formula?: string;
    pinyin?: string;
    bopomofo?: string;
    englishMeaning?: string;
    exampleSentence?: string;
    definition?: string;
    synonyms?: string[];
    antonyms?: string[];
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('LLM API Key is not configured. Please open LLM Key Management to enter your key.');
    }

    const model = this.getModel();
    const endpoint = this.resolveEndpoint(apiKey);
    const systemPrompt = TOKEN_CONSERVING_SYSTEM_HINTS[subject];
    const userPrompt = topic ? `Topic: ${topic}\nQuery: ${input}` : `Query: ${input}`;

    const body: Record<string, any> = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 1200,
      max_completion_tokens: 1200,
    };

    // For reasoning models like openai/gpt-oss-120b and 20b on Groq:
    // attempt hidden reasoning to conserve output tokens and avoid bloating the response
    if (endpoint.includes('groq.com') && (model.includes('gpt-oss') || model.includes('r1'))) {
      body.reasoning_format = 'hidden';
      body.reasoning_effort = 'low';
    }

    let data: any;
    try {
      data = await this.dispatchChat(apiKey, endpoint, body);
    } catch (firstErr: any) {
      // If reasoning_format caused an unrecognized parameter error on a non-Groq endpoint, retry without it
      if (body.reasoning_format && firstErr.message?.includes('reasoning_format')) {
        delete body.reasoning_format;
        delete body.reasoning_effort;
        data = await this.dispatchChat(apiKey, endpoint, body);
      } else {
        throw firstErr;
      }
    }

    const rawContent = data.choices?.[0]?.message?.content || '';

    // 1. Strip reasoning chain-of-thought <think> ... </think> tags
    let content = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    if (!content && rawContent) {
      content = rawContent;
    }

    // 2. Strip potential markdown code fence wrappers (```json ... ```)
    content = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/, '')
      .trim();

    // 3. Parse JSON
    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try substring between { and }
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = null;
        }
      }
    }

    if (parsed && typeof parsed === 'object') {
      return parsed;
    }

    // 4. Regex fallback if model didn't return valid JSON
    if (subject === 'math') {
      const ansMatch = content.match(/["']?answer["']?\s*:\s*["']([^"']+)["']/i);
      const expMatch = content.match(/["']?explanation["']?\s*:\s*["']([^"']+)["']/i);
      const formMatch = content.match(/["']?formula["']?\s*:\s*["']([^"']+)["']/i);
      return {
        answer: ansMatch ? ansMatch[1] : content.split('\n')[0] || content,
        explanation: expMatch ? expMatch[1].replace(/\\n/g, '\n') : content,
        formula: formMatch ? formMatch[1] : undefined,
      };
    } else if (subject === 'chinese') {
      const pinyinMatch = content.match(/["']?pinyin["']?\s*:\s*["']([^"']+)["']/i);
      const bopomofoMatch = content.match(/["']?bopomofo["']?\s*:\s*["']([^"']+)["']/i);
      const engMatch = content.match(/["']?englishMeaning["']?\s*:\s*["']([^"']+)["']/i);
      const exMatch = content.match(/["']?exampleSentence["']?\s*:\s*["']([^"']+)["']/i);
      return {
        pinyin: pinyinMatch ? pinyinMatch[1] : undefined,
        bopomofo: bopomofoMatch ? bopomofoMatch[1] : undefined,
        englishMeaning: engMatch ? engMatch[1] : content,
        exampleSentence: exMatch ? exMatch[1] : undefined,
      };
    } else {
      const defMatch = content.match(/["']?definition["']?\s*:\s*["']([^"']+)["']/i);
      const exMatch = content.match(/["']?exampleSentence["']?\s*:\s*["']([^"']+)["']/i);
      return {
        definition: defMatch ? defMatch[1] : content,
        exampleSentence: exMatch ? exMatch[1] : undefined,
      };
    }
  }
}
