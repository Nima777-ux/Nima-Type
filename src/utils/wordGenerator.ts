import { CodeLanguage, QuoteLength, AppLanguage } from '../types';

export const COMMON_WORDS = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it',
  'that', 'for', 'they', 'with', 'as', 'not', 'on', 'she', 'at', 'by',
  'this', 'we', 'you', 'do', 'but', 'his', 'from', 'they', 'say', 'her',
  'or', 'will', 'an', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'speed', 'dimension', 'space', 'light', 'matrix', 'crystal', 'energy', 'quantum',
  'cyber', 'neon', 'pulse', 'circuit', 'signal', 'vector', 'horizon', 'nebula',
  'galaxy', 'orbit', 'velocity', 'tesseract', 'frequency', 'virtual', 'hyper',
  'focus', 'flow', 'rhythm', 'precision', 'mastery', 'keystroke', 'tactile', 'switch',
  'sound', 'resonance', 'engine', 'future', 'portal', 'infinite', 'system', 'core',
  'logic', 'syntax', 'render', 'frame', 'motion', 'nexus', 'vertex', 'dynamic',
  'chronos', 'spectrum', 'prism', 'vortex', 'warp', 'drive', 'stellar', 'phase',
  'stream', 'binary', 'glitch', 'harmonic', 'sync', 'laser', 'reactor', 'flux'
];

export const QUOTES: { text: string; source: string; length: 'short' | 'medium' | 'long' }[] = [
  {
    text: "I've seen things you people wouldn't believe. Attack ships on fire off the shoulder of Orion. All those moments will be lost in time, like tears in rain.",
    source: "Roy Batty, Blade Runner",
    length: 'medium',
  },
  {
    text: "The mystery of life isn't a problem to solve, but a reality to experience. A process that cannot be understood by stopping it.",
    source: "Frank Herbert, Dune",
    length: 'medium',
  },
  {
    text: "We can only see a short distance ahead, but we can see plenty there that needs to be done.",
    source: "Alan Turing",
    length: 'short',
  },
  {
    text: "The future is already here, it is just not evenly distributed.",
    source: "William Gibson",
    length: 'short',
  },
  {
    text: "Do not go gentle into that good night. Rage, rage against the dying of the light.",
    source: "Dylan Thomas",
    length: 'short',
  },
  {
    text: "The saddest aspect of life right now is that science gathers knowledge faster than society gathers wisdom.",
    source: "Isaac Asimov",
    length: 'medium',
  },
  {
    text: "Somewhere, something incredible is waiting to be known. Imagination will often carry us to worlds that never were, but without it we go nowhere.",
    source: "Carl Sagan, Cosmos",
    length: 'medium',
  },
  {
    text: "There is a theory which states that if ever anyone discovers exactly what the Universe is for and why it is here, it will instantly disappear and be replaced by something even more bizarre and inexplicable. There is another theory which states that this has already happened.",
    source: "Douglas Adams, The Restaurant at the End of the Universe",
    length: 'long',
  },
  {
    text: "Real artists ship. Design is not just what it looks like and feels like. Design is how it works. Simplicity is the ultimate sophistication.",
    source: "Steve Jobs",
    length: 'medium',
  },
];

export const CODE_SNIPPETS: Record<CodeLanguage, string[]> = {
  javascript: [
    `const matrix = Array.from({ length: 4 }, () => Math.random());
const warp = matrix.map((val, idx) => Math.sin(val * Math.PI * idx));
export const computeWpm = (chars, sec) => Math.round((chars / 5) / (sec / 60));`,
    `async function fetchHyperspaceCoordinates(dimension = 4) {
  const response = await fetch('/api/quantum/telemetry');
  const { vectors } = await response.json();
  return vectors.filter((v) => v.magnitude > 0.95);
}`,
    `document.addEventListener('keydown', (event) => {
  const { key, code, timeStamp } = event;
  soundEngine.playKey(key);
  activate3DKey(code);
});`,
  ],
  python: [
    `def calculate_tesseract_rotation(angle_rad, dimension=4):
    import numpy as np
    c, s = np.cos(angle_rad), np.sin(angle_rad)
    rotation_matrix = np.eye(dimension)
    rotation_matrix[0, 0] = c
    rotation_matrix[0, 3] = -s
    rotation_matrix[3, 0] = s
    rotation_matrix[3, 3] = c
    return rotation_matrix`,
    `class TypingEngine:
    def __init__(self, target_wpm=120):
        self.target = target_wpm
        self.keystrokes = []
        self.active_streak = 0

    def register_key(self, char: str, is_valid: bool):
        if is_valid:
            self.active_streak += 1`,
  ],
  html: [
    `<div id="cyber-deck" class="deck-matrix" data-speed="120">
  <canvas id="three-dimension-viewport"></canvas>
  <div class="hud-display gauge-neon">
    <span class="wpm-counter">0 WPM</span>
  </div>
</div>`,
    `<section class="tesseract-chamber" aria-label="4D Hypercube">
  <div class="glow-field filter-blur-xl"></div>
  <svg viewBox="0 0 100 100" class="polytope-lines">
    <polygon points="10,10 90,10 90,90 10,90" fill="none" stroke="#00f3ff"/>
  </svg>
</section>`,
  ],
};

export const PERSIAN_WORDS = [
  'و', 'در', 'به', 'از', 'که', 'این', 'را', 'با', 'است', 'برای', 'آن', 'یک', 'خود', 'تا',
  'کرد', 'بر', 'هم', 'نیز', 'گفت', 'می', 'شد', 'داشت', 'چون', 'ما', 'او', 'باید', 'هر',
  'دیگر', 'اما', 'پس', 'اگر', 'همه', 'یا', 'بین', 'دو', 'بود', 'روز', 'سال', 'کار', 'دست',
  'زمان', 'راه', 'دل', 'جان', 'ایران', 'جهان', 'زندگی', 'دانش', 'اندیشه', 'انسان', 'سرعت',
  'روشن', 'آینده', 'تلاش', 'هنر', 'سخن', 'امید', 'نور', 'نگاه', 'آسمان', 'زمین', 'کتاب',
  'حرکت', 'ستاره', 'آرامش', 'قدرت', 'زیبا', 'پرتو', 'آغاز', 'پایان', 'روان', 'هستی',
  'طبیعت', 'بهار', 'باران', 'خورشید', 'سایه', 'دریا', 'کوه', 'شب', 'صبح', 'جاودان',
  'فناوری', 'شبکه', 'سامانه', 'داده', 'هوش', 'حافظه', 'پردازش', 'برنامه', 'فرهنگ', 'تاریخ',
  'پیروزی', 'پرواز', 'آزادی', 'دوست', 'یار', 'عشق', 'مهر', 'وفا', 'پیمان', 'شوق', 'راز',
  'ساز', 'آوا', 'نوا', 'سرود', 'سکوت', 'فریاد', 'گوهر', 'صداقت', 'پاکی', 'پویایی',
  'آفرینش', 'کوشش', 'بینش', 'حقیقت', 'حکمت', 'بزرگ', 'فردا', 'تابش', 'کهکشان', 'شگفتی'
];

export const PERSIAN_QUOTES: { text: string; source: string; length: 'short' | 'medium' | 'long' }[] = [
  {
    text: "بنی‌آدم اعضای یکدیگرند، که در آفرینش ز یک گوهرند. چو عضوی به درد آورد روزگار، دگر عضوها را نماند قرار.",
    source: "سعدی شیرازی",
    length: 'medium',
  },
  {
    text: "درخت دوستی بنشان که کام دل به بار آرد، نهال دشمنی برکن که رنج بی‌شمار آرد.",
    source: "حافظ شیرازی",
    length: 'medium',
  },
  {
    text: "توانا بود هر که دانا بود، ز دانش دل پیر برنا بود.",
    source: "ابوالقاسم فردوسی",
    length: 'short',
  },
  {
    text: "تو مگو همه به جنگند و ز صلح من چه آید، تو یکی نه‌ای هزاری، تو چراغ خود برافروز.",
    source: "مولانا جلال‌الدین بلخی",
    length: 'medium',
  },
  {
    text: "برخیز و مخور غم جهان گذران، بنشین و دمی به شادمانی گذران.",
    source: "عمر خیام نیشابوری",
    length: 'short',
  },
  {
    text: "چشم‌ها را باید شست، جور دیگر باید دید. واژه‌ها را باید شست، واژه باید خود باد، واژه باید خود باران باشد.",
    source: "سهراب سپهری",
    length: 'medium',
  },
  {
    text: "نشان عقل انسان، گفتار سنجیده اوست و نشان ادب و فرزانگی، کردار شایسته او در مواجهه با چالش‌های دشوار روزگار است.",
    source: "ابوعلی سینا",
    length: 'long',
  },
  {
    text: "انسان‌های بزرگ با اندیشه‌های بلند شناخته می‌شوند و جهان با نور دانایی به پیش می‌رود.",
    source: "حکمت معاصر",
    length: 'short',
  },
];

export function getRandomWords(
  count: number,
  punctuation: boolean = false,
  numbers: boolean = false,
  language: AppLanguage = 'en'
): string[] {
  const words: string[] = [];
  const punctuationMarks = language === 'fa' ? ['،', '؛', '.', '!', '؟'] : ['.', ',', '!', '?', ';', ':'];
  const wordPool = language === 'fa' ? PERSIAN_WORDS : COMMON_WORDS;

  for (let i = 0; i < count; i++) {
    let word = wordPool[Math.floor(Math.random() * wordPool.length)];

    if (numbers && Math.random() < 0.15) {
      if (language === 'fa') {
        const faNums = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const num = Math.floor(Math.random() * 999).toString();
        word = num.split('').map((d) => faNums[parseInt(d, 10)] || d).join('');
      } else {
        word = Math.floor(Math.random() * 999).toString();
      }
    } else {
      if (punctuation && Math.random() < 0.15) {
        const p = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
        word = word + p;
      }
      if (language === 'en' && (i === 0 || (punctuation && Math.random() < 0.12))) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
    }

    words.push(word);
  }
  return words;
}

export function getRandomQuote(
  length: QuoteLength = 'all',
  language: AppLanguage = 'en'
): { text: string; source: string } {
  const quotePool = language === 'fa' ? PERSIAN_QUOTES : QUOTES;
  const filtered = length === 'all' ? quotePool : quotePool.filter((q) => q.length === length);
  const selected = filtered[Math.floor(Math.random() * filtered.length)] || quotePool[0];
  return selected;
}

export function getRandomCodeSnippet(lang: CodeLanguage): string {
  const snippets = CODE_SNIPPETS[lang];
  return snippets[Math.floor(Math.random() * snippets.length)] || snippets[0];
}
