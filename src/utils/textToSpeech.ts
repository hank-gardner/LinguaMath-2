/**
 * Text-to-Speech Service for LinguaMath.
 * 
 * Uses server-side /api/tts proxy for reliable, crystal-clear pronunciation of Chinese (zh-CN)
 * and English words across all operating systems without requiring locally installed voice packages.
 * Automatically falls back to native Web Speech API if offline or if preferred.
 */

let globalAudio: HTMLAudioElement | null = null;
let globalUtterance: SpeechSynthesisUtterance | null = null;

export class TextToSpeechService {
  private isSpeaking = false;
  private onStateChangeListeners: Array<(isSpeaking: boolean) => void> = [];
  private voicesLoaded = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
    }
  }

  private initVoices() {
    this.cachedVoices = window.speechSynthesis.getVoices();
    if (this.cachedVoices.length > 0) {
      this.voicesLoaded = true;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      this.cachedVoices = window.speechSynthesis.getVoices();
      this.voicesLoaded = true;
    };
  }

  public addStateListener(listener: (isSpeaking: boolean) => void): () => void {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
    };
  }

  private setSpeaking(speaking: boolean) {
    this.isSpeaking = speaking;
    this.onStateChangeListeners.forEach((fn) => {
      try {
        fn(speaking);
      } catch (e) {
        console.warn('Listener error:', e);
      }
    });
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Main speech method:
   * 1. Plays high-quality pronunciation via /api/tts (works across all browsers and devices).
   * 2. Falls back to native Web Speech API if /api/tts is unreachable.
   */
  public async speak(
    text: string,
    lang: 'zh-CN' | 'en-US' | 'en-GB' = 'en-US',
    rate: number = 0.9
  ): Promise<boolean> {
    if (!text || !text.trim()) return false;
    const cleanText = text.trim();

    this.stop();

    // 1. Try our direct high-fidelity audio proxy
    try {
      const success = await this.playFromProxy(cleanText, lang, rate);
      if (success) return true;
    } catch (err) {
      console.warn('Audio proxy play error, trying Web Speech API fallback:', err);
    }

    // 2. Fallback to native Web Speech API
    try {
      const nativeSuccess = await this.playFromWebSpeech(cleanText, lang, rate);
      return nativeSuccess;
    } catch (err) {
      console.warn('Web Speech fallback error:', err);
      this.setSpeaking(false);
      return false;
    }
  }

  private playFromProxy(
    text: string,
    lang: 'zh-CN' | 'en-US' | 'en-GB',
    rate: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const langParam = lang.startsWith('zh') ? 'zh-CN' : 'en';
        const url = `/api/tts?text=${encodeURIComponent(text)}&lang=${langParam}`;

        const audio = new Audio(url);
        globalAudio = audio;
        audio.playbackRate = Math.max(0.7, Math.min(1.3, rate));

        let hasStarted = false;

        audio.onplay = () => {
          hasStarted = true;
          this.setSpeaking(true);
        };

        audio.onended = () => {
          globalAudio = null;
          this.setSpeaking(false);
          resolve(true);
        };

        audio.onerror = (e) => {
          console.warn('Audio proxy playback failed:', e);
          if (globalAudio === audio) globalAudio = null;
          if (hasStarted) this.setSpeaking(false);
          resolve(false);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('audio.play() rejection:', err);
            if (globalAudio === audio) globalAudio = null;
            if (hasStarted) this.setSpeaking(false);
            resolve(false);
          });
        }
      } catch (e) {
        console.warn('playFromProxy initialization error:', e);
        resolve(false);
      }
    });
  }

  private async playFromWebSpeech(
    text: string,
    lang: 'zh-CN' | 'en-US' | 'en-GB',
    rate: number
  ): Promise<boolean> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    // Ensure voices are fetched
    if (!this.voicesLoaded && this.cachedVoices.length === 0) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }

    return new Promise((resolve) => {
      try {
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = Math.max(0.6, Math.min(1.4, rate));

        // Find voice
        if (this.cachedVoices.length > 0) {
          if (lang === 'zh-CN') {
            const zh = this.cachedVoices.find(
              (v) =>
                v.lang.toLowerCase().replace('_', '-').startsWith('zh') ||
                v.name.toLowerCase().includes('chinese') ||
                v.lang.toLowerCase().startsWith('cmn')
            );
            if (zh) utterance.voice = zh;
          } else {
            const en = this.cachedVoices.find(
              (v) =>
                v.lang.toLowerCase().replace('_', '-').startsWith('en') &&
                (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Enhanced'))
            ) || this.cachedVoices.find((v) => v.lang.toLowerCase().startsWith('en'));
            if (en) utterance.voice = en;
          }
        }

        utterance.onstart = () => {
          this.setSpeaking(true);
          window.speechSynthesis.resume();
        };

        utterance.onend = () => {
          globalUtterance = null;
          this.setSpeaking(false);
          resolve(true);
        };

        utterance.onerror = (e) => {
          console.warn('Utterance error:', e);
          globalUtterance = null;
          this.setSpeaking(false);
          resolve(false);
        };

        globalUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        window.speechSynthesis.resume();
      } catch (err) {
        console.warn('speak utterance catch:', err);
        resolve(false);
      }
    });
  }

  public stop() {
    if (globalAudio) {
      try {
        globalAudio.pause();
        globalAudio.currentTime = 0;
      } catch {
        // ignore
      }
      globalAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }

    globalUtterance = null;
    this.setSpeaking(false);
  }
}

export const ttsService = new TextToSpeechService();
