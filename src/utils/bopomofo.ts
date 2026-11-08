/**
 * Bopomofo (Zhuyin / 注音符號) conversion and formatting utility.
 * Accurately translates standard Pinyin with tone marks into standard Taiwanese/Traditional Bopomofo phonetic symbols.
 */

// Tone marks lookup
const TONE_MAP: Record<string, { base: string; tone: number }> = {
  ā: { base: 'a', tone: 1 },
  á: { base: 'a', tone: 2 },
  ǎ: { base: 'a', tone: 3 },
  à: { base: 'a', tone: 4 },
  ē: { base: 'e', tone: 1 },
  é: { base: 'e', tone: 2 },
  ě: { base: 'e', tone: 3 },
  è: { base: 'e', tone: 4 },
  ī: { base: 'i', tone: 1 },
  í: { base: 'i', tone: 2 },
  ǐ: { base: 'i', tone: 3 },
  ì: { base: 'i', tone: 4 },
  ō: { base: 'o', tone: 1 },
  ó: { base: 'o', tone: 2 },
  ǒ: { base: 'o', tone: 3 },
  ò: { base: 'o', tone: 4 },
  ū: { base: 'u', tone: 1 },
  ú: { base: 'u', tone: 2 },
  ǔ: { base: 'u', tone: 3 },
  ù: { base: 'u', tone: 4 },
  ǖ: { base: 'v', tone: 1 },
  ǘ: { base: 'v', tone: 2 },
  ǚ: { base: 'v', tone: 3 },
  ǜ: { base: 'v', tone: 4 },
  ü: { base: 'v', tone: 5 },
};

// Standard Zhuyin Tone Marks (Tone 1 has no mark in standard Zhuyin)
const TONE_SYMBOLS: Record<number, string> = {
  1: '',
  2: 'ˊ',
  3: 'ˇ',
  4: 'ˋ',
  5: '˙',
};

// Special standalone whole syllables
const WHOLE_SYLLABLES: Record<string, string> = {
  zhi: 'ㄓ',
  chi: 'ㄔ',
  shi: 'ㄕ',
  ri: 'ㄖ',
  zi: 'ㄗ',
  ci: 'ㄘ',
  si: 'ㄙ',
  yi: 'ㄧ',
  ya: 'ㄧㄚ',
  ye: 'ㄧㄝ',
  yao: 'ㄧㄠ',
  you: 'ㄧㄡ',
  yan: 'ㄧㄢ',
  yin: 'ㄧㄣ',
  yang: 'ㄧㄤ',
  ying: 'ㄧㄥ',
  yong: 'ㄩㄥ',
  wu: 'ㄨ',
  wa: 'ㄨㄚ',
  wo: 'ㄨㄛ',
  wai: 'ㄨㄞ',
  wei: 'ㄨㄟ',
  wan: 'ㄨㄢ',
  wen: 'ㄨㄣ',
  wang: 'ㄨㄤ',
  weng: 'ㄨㄥ',
  yu: 'ㄩ',
  yue: 'ㄩㄝ',
  yuan: 'ㄩㄢ',
  yun: 'ㄩㄣ',
  er: 'ㄦ',
};

// Initials (声母)
const INITIALS: [string, string][] = [
  ['zh', 'ㄓ'],
  ['ch', 'ㄔ'],
  ['sh', 'ㄕ'],
  ['b', 'ㄅ'],
  ['p', 'ㄆ'],
  ['m', 'ㄇ'],
  ['f', 'ㄈ'],
  ['d', 'ㄉ'],
  ['t', 'ㄊ'],
  ['n', 'ㄋ'],
  ['l', 'ㄌ'],
  ['g', 'ㄍ'],
  ['k', 'ㄎ'],
  ['h', 'ㄏ'],
  ['j', 'ㄐ'],
  ['q', 'ㄑ'],
  ['x', 'ㄒ'],
  ['r', 'ㄖ'],
  ['z', 'ㄗ'],
  ['c', 'ㄘ'],
  ['s', 'ㄙ'],
  ['w', 'ㄨ'],
  ['y', 'ㄧ'],
];

// Finals (韵母)
const FINALS: Record<string, string> = {
  a: 'ㄚ',
  o: 'ㄛ',
  e: 'ㄜ',
  ê: 'ㄝ',
  ai: 'ㄞ',
  ei: 'ㄟ',
  ao: 'ㄠ',
  ou: 'ㄡ',
  an: 'ㄢ',
  en: 'ㄣ',
  ang: 'ㄤ',
  eng: 'ㄥ',
  er: 'ㄦ',
  i: 'ㄧ',
  ia: 'ㄧㄚ',
  io: 'ㄧㄛ',
  ie: 'ㄧㄝ',
  iao: 'ㄧㄠ',
  iu: 'ㄧㄡ',
  ian: 'ㄧㄢ',
  in: 'ㄧㄣ',
  iang: 'ㄧㄤ',
  ing: 'ㄧㄥ',
  iong: 'ㄩㄥ',
  u: 'ㄨ',
  ua: 'ㄨㄚ',
  uo: 'ㄨㄛ',
  uai: 'ㄨㄞ',
  ui: 'ㄨㄟ',
  uan: 'ㄨㄢ',
  un: 'ㄨㄣ',
  uang: 'ㄨㄤ',
  ueng: 'ㄨㄥ',
  ong: 'ㄨㄥ',
  v: 'ㄩ',
  ve: 'ㄩㄝ',
  van: 'ㄩㄢ',
  vn: 'ㄩㄣ',
};

/**
 * Converts a single Pinyin syllable (e.g. "píng", "guǒ", "xué", "xí") into Bopomofo symbols with tone.
 */
export function syllableToBopomofo(syllable: string): string {
  if (!syllable || !syllable.trim()) return '';

  let cleaned = syllable.trim().toLowerCase();
  let tone = 5; // default neutral unless marked

  // Check if numbered tone (e.g. ping2)
  const numMatch = cleaned.match(/([a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+)([1-5])/);
  if (numMatch) {
    cleaned = numMatch[1];
    tone = parseInt(numMatch[2], 10);
  }

  // Decompose accented vowels to extract tone
  let baseSyllable = '';
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (TONE_MAP[char]) {
      baseSyllable += TONE_MAP[char].base;
      if (tone === 5) {
        tone = TONE_MAP[char].tone;
      }
    } else {
      baseSyllable += char;
    }
  }

  // Normalize 'ü' to 'v'
  baseSyllable = baseSyllable.replace(/ü/g, 'v');

  // Check whole syllables first
  if (WHOLE_SYLLABLES[baseSyllable]) {
    const zhuyin = WHOLE_SYLLABLES[baseSyllable];
    const toneMark = TONE_SYMBOLS[tone] || '';
    return tone === 5 ? `˙${zhuyin}` : `${zhuyin}${toneMark}`;
  }

  // Handle j/q/x/y with u -> ü (v)
  if (/^[jqxy]u/.test(baseSyllable)) {
    baseSyllable = baseSyllable[0] + 'v' + baseSyllable.slice(2);
  }

  let initialZhuyin = '';
  let remainingFinal = baseSyllable;

  for (const [pinyinInit, zhuyinInit] of INITIALS) {
    if (baseSyllable.startsWith(pinyinInit)) {
      initialZhuyin = zhuyinInit;
      remainingFinal = baseSyllable.slice(pinyinInit.length);
      break;
    }
  }

  let finalZhuyin = '';
  if (remainingFinal) {
    finalZhuyin = FINALS[remainingFinal] || remainingFinal;
  }

  const combined = `${initialZhuyin}${finalZhuyin}`;
  const toneMark = TONE_SYMBOLS[tone] || '';

  if (tone === 5) {
    return `˙${combined}`;
  }
  return `${combined}${toneMark}`;
}

/**
 * Splits a full Pinyin phrase (e.g. "píngguǒ", "xuéxí", "hē shuǐ", "xièxie")
 * into syllables and converts each to Bopomofo symbols with spaces.
 */
export function pinyinToBopomofo(pinyin: string): string {
  if (!pinyin || !pinyin.trim()) return '';

  // Replace common punctuation
  const cleanInput = pinyin.trim();

  // If input is space-separated or apostrophe-separated
  const tokens = cleanInput.split(/[\s,，]+/);

  const results: string[] = [];

  for (const token of tokens) {
    // If the token is already a single syllable or compound
    // Check if token has multiple syllables combined without space (e.g., "píngguǒ")
    const syllables = splitPinyinSyllables(token);
    for (const syl of syllables) {
      const bopomofo = syllableToBopomofo(syl);
      if (bopomofo) {
        results.push(bopomofo);
      }
    }
  }

  return results.join(' ');
}

/**
 * Splits glued pinyin words like "píngguǒ", "diànnǎo", "gāoxìng" into syllables.
 */
function splitPinyinSyllables(word: string): string[] {
  if (!word) return [];

  // If already contains separator like apostrophe or space
  if (word.includes("'")) {
    return word.split("'");
  }

  // Regex for pinyin syllables with tone marks or base letters
  const pinyinRegex = /(?:[bcdfghjklmnpqrstwxyz]|zh|ch|sh)?(?:[aeiouvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+)(?:ng|n|r)?/gi;

  const matches = word.match(pinyinRegex);
  if (matches && matches.join('').length === word.length) {
    return matches;
  }

  // Fallback: return as single token
  return [word];
}

/**
 * Safely extracts or calculates Bopomofo for any Chinese flashcard.
 */
export function getCardBopomofo(card?: { bopomofo?: string; pinyin?: string }): string {
  if (!card) return '';
  if (card.bopomofo && card.bopomofo.trim()) {
    return card.bopomofo.trim();
  }
  if (card.pinyin && card.pinyin.trim()) {
    return pinyinToBopomofo(card.pinyin);
  }
  return '';
}
