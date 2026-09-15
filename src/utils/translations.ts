export type AppLanguage = 'en' | 'fa';
export type ThemeMode = 'dark' | 'light';

export interface TranslationDict {
  brand: string;
  tagline: string;
  tabEngine: string;
  tabTelemetry: string;
  tabArchives: string;
  desktopApp: string;
  settings: string;
  modeLabel: string;
  testLangLabel: string;
  english: string;
  persian: string;
  modeTime: string;
  modeWords: string;
  modeQuote: string;
  modeCode: string;
  modeCustom: string;
  themeLabel: string;
  themeWarmAmber: string;
  themeNordicSage: string;
  themeTokyoDusk: string;
  themeSepiaCraft: string;
  themeMonochromeChalk: string;
  switchesLabel: string;
  switchCherryBlue: string;
  switchCherryBrown: string;
  switchCherryRed: string;
  switchCyberLaser: string;
  switchTypewriter: string;
  switchMute: string;
  statVelocity: string;
  statPrecision: string;
  statLatency: string;
  statConsistency: string;
  statBurst: string;
  statStreak: string;
  keysUnit: string;
  wpmUnit: string;
  msUnit: string;
  remaining: string;
  tabRestartHint: string;
  readyToType: string;
  cleanHits: string;
  scorecardTitle: string;
  scorecardSubtitle: string;
  tabSummary: string;
  tabDeepTelemetry: string;
  btnInspectMatrix: string;
  btnRetest: string;
  btnClose: string;
  netSpeed: string;
  precision: string;
  keystrokeFlight: string;
  consistencyScore: string;
  bilateralBalance: string;
  errorTypology: string;
  viewDeepTelemetry: string;
  sessionDuration: string;
  settingsTitle: string;
  appearance: string;
  darkMode: string;
  lightMode: string;
  systemLang: string;
  typingLang: string;
  audioFeedback: string;
  sub5msNotice: string;
  recalibrateView: string;
  heatmapNormal: string;
  heatmapError: string;
  heatmapLatency: string;
  noTelemetryTitle: string;
  noTelemetryDesc: string;
  startTypingSession: string;
  peakVelocity: string;
  historicalAvg: string;
  totalRuns: string;
  recentLogs: string;
  clearHistory: string;
  colTime: string;
  colMode: string;
  colNetWpm: string;
  colAccuracy: string;
  colFlight: string;
  colConsistency: string;
  colInspect: string;
  details: string;
  noHistory: string;
  saveAndClose: string;
  tip: string;
  punctuation: string;
  numbers: string;
}

export const translations: Record<AppLanguage, TranslationDict> = {
  en: {
    brand: 'Nima Typing test app',
    tagline: 'CLEVER & DISTRACTION-FREE TYPING ENGINE',
    tabEngine: '01. ENGINE',
    tabTelemetry: '02. TELEMETRY',
    tabArchives: '03. ARCHIVES',
    desktopApp: 'DESKTOP APP',
    settings: 'SETTINGS',
    modeLabel: 'MODE:',
    testLangLabel: 'LANGUAGE:',
    english: 'English',
    persian: 'فارسی (Persian)',
    modeTime: 'time',
    modeWords: 'words',
    modeQuote: 'quote',
    modeCode: 'code',
    modeCustom: 'custom',
    themeLabel: 'COLOR THEME:',
    themeWarmAmber: 'Warm Amber',
    themeNordicSage: 'Nordic Sage',
    themeTokyoDusk: 'Tokyo Dusk',
    themeSepiaCraft: 'Vintage Sepia',
    themeMonochromeChalk: 'Monochrome Chalk',
    switchesLabel: 'SWITCHES:',
    switchCherryBlue: 'Cherry MX Blue (Clicky)',
    switchCherryBrown: 'Cherry MX Brown (Tactile)',
    switchCherryRed: 'Cherry MX Red (Linear)',
    switchCyberLaser: 'Cyber Laser (Synthesizer)',
    switchTypewriter: 'Vintage Typewriter',
    switchMute: 'Mute / Off',
    statVelocity: 'VELOCITY',
    statPrecision: 'PRECISION',
    statLatency: 'FLIGHT LATENCY',
    statConsistency: 'CONSISTENCY',
    statBurst: 'BURST PEAK',
    statStreak: 'ACTIVE STREAK',
    keysUnit: 'KEYS',
    wpmUnit: 'WPM',
    msUnit: 'ms',
    remaining: 'REMAINING',
    tabRestartHint: 'RECALIBRATE',
    readyToType: 'READY TO TYPE',
    cleanHits: 'CLEAN HITS',
    scorecardTitle: 'PERFORMANCE SCORECARD',
    scorecardSubtitle: 'FLIGHT LOG // SESSION COMPLETED',
    tabSummary: 'SUMMARY',
    tabDeepTelemetry: 'DEEP TELEMETRY',
    btnInspectMatrix: 'Inspect Matrix',
    btnRetest: 'Retest [TAB]',
    btnClose: 'Close',
    netSpeed: 'Net Speed',
    precision: 'Precision',
    keystrokeFlight: 'Keystroke Latency',
    consistencyScore: 'Consistency',
    bilateralBalance: 'Bilateral Finger Balance',
    errorTypology: 'Error Typology',
    viewDeepTelemetry: 'View Full Biometric Telemetry & Visualizations →',
    sessionDuration: 'SESSION DURATION',
    settingsTitle: 'SYSTEM SETTINGS // PREFERENCES',
    appearance: 'Color Theme & Appearance',
    darkMode: 'Dark Mode (Obsidian & Radiant Platinum)',
    lightMode: 'Light Mode (Pearl & Polished Chrome)',
    systemLang: 'Interface Language',
    typingLang: 'Typing Test Language',
    audioFeedback: 'Mechanical Sound Synthesis',
    sub5msNotice: 'Sub-5ms response with physical audio simulation',
    recalibrateView: 'Recalibrate Angle',
    heatmapNormal: 'Normal',
    heatmapError: 'Error Heatmap',
    heatmapLatency: 'Latency Heatmap',
    noTelemetryTitle: 'NO TELEMETRY DATA LOGGED YET',
    noTelemetryDesc: 'Complete your first test session in the Engine to generate multi-dimensional keystroke latency, finger load distribution, and error typology diagnostics.',
    startTypingSession: 'Start Typing Session',
    peakVelocity: 'Peak Velocity',
    historicalAvg: 'Historical Average',
    totalRuns: 'Total Runs Logged',
    recentLogs: 'Recent Flight Logs',
    clearHistory: 'Clear History',
    colTime: 'Time',
    colMode: 'Mode',
    colNetWpm: 'Net WPM',
    colAccuracy: 'Accuracy',
    colFlight: 'Flight Latency',
    colConsistency: 'Consistency',
    colInspect: 'Inspect',
    details: 'Details',
    noHistory: 'No historical sessions recorded. Run a test in Engine to log telemetry.',
    saveAndClose: 'Apply & Close',
    tip: 'Touch typing standard distributes ~45% left, ~45% right, ~10% thumb.',
    punctuation: 'Punctuation',
    numbers: 'Numbers',
  },
  fa: {
    brand: 'آزمون تایپ نیما',
    tagline: 'سامانه هوشمند و سریع سنجش سرعت تایپ',
    tabEngine: '۰۱. موتور تایپ',
    tabTelemetry: '۰۲. بیومتریک و تله‌متری',
    tabArchives: '۰۳. آرشیو و تاریخچه',
    desktopApp: 'نسخه دسکتاپ',
    settings: 'تنظیمات',
    modeLabel: 'حالت:',
    testLangLabel: 'زبان آزمون:',
    english: 'English (انگلیسی)',
    persian: 'فارسی (Persian)',
    modeTime: 'زمانی',
    modeWords: 'کلمات',
    modeQuote: 'نقل‌قول',
    modeCode: 'کد',
    modeCustom: 'دلخواه',
    themeLabel: 'پوسته رنگی:',
    themeWarmAmber: 'کهربایی گرم',
    themeNordicSage: 'مریم‌گلی نوردیک',
    themeTokyoDusk: 'شفق توکیو',
    themeSepiaCraft: 'سپیا کلاسیک',
    themeMonochromeChalk: 'گچی مینیمال',
    switchesLabel: 'سوئیچ مکانیکی:',
    switchCherryBlue: 'چری آبی (کلیکی)',
    switchCherryBrown: 'چری قهوه‌ای (لمسی)',
    switchCherryRed: 'چری قرمز (خطی)',
    switchCyberLaser: 'لیزر سایبرنتیک (سنتز)',
    switchTypewriter: 'ماشین تحریر کلاسیک',
    switchMute: 'بی‌صدا / خاموش',
    statVelocity: 'سرعت تایپ',
    statPrecision: 'دقت ضربات',
    statLatency: 'مکث بین کلیدها',
    statConsistency: 'یکنواختی ریتم',
    statBurst: 'اوج سرعت لحظه‌ای',
    statStreak: 'زنجیره بدون خطا',
    keysUnit: 'کلید',
    wpmUnit: 'کلمه/دقیقه',
    msUnit: 'میلی‌ثانیه',
    remaining: 'باقی‌مانده',
    tabRestartHint: 'شروع مجدد',
    readyToType: 'آماده تایپ کردن',
    cleanHits: 'ضربه متوالی صحیح',
    scorecardTitle: 'کارنامه عملکرد و تحلیل پرواز',
    scorecardSubtitle: 'گزارش جلسه // آزمون با موفقیت پایان یافت',
    tabSummary: 'خلاصه نتایج',
    tabDeepTelemetry: 'تله‌متری عمیق',
    btnInspectMatrix: 'بررسی ماتریس',
    btnRetest: 'آزمون مجدد [TAB]',
    btnClose: 'بستن',
    netSpeed: 'سرعت خالص',
    precision: 'دقت',
    keystrokeFlight: 'مکث پرواز کلیدها',
    consistencyScore: 'یکنواختی ریتم',
    bilateralBalance: 'تعادل دودستی انگشتان',
    errorTypology: 'تحلیل گونه‌های خطا',
    viewDeepTelemetry: 'مشاهده کامل نمودارهای بیومتریک و تله‌متری →',
    sessionDuration: 'مدت آزمون',
    settingsTitle: 'تنظیمات سامانه // سفارشی‌سازی',
    appearance: 'پوسته و حالت نمایش',
    darkMode: 'حالت تاریک (آبسیدین و پلاتینیوم درخشان)',
    lightMode: 'حالت روشن (مرواریدی و کروم براق)',
    systemLang: 'زبان رابط کاربری',
    typingLang: 'زبان محتوای تایپ',
    audioFeedback: 'شبیه‌ساز صوتی کلیدهای مکانیکی',
    sub5msNotice: 'تأخیر کمتر از ۵ میلی‌ثانیه با سنتز صوتی فیزیکی',
    recalibrateView: 'تنظیم مجدد زاویه',
    heatmapNormal: 'عادی',
    heatmapError: 'نقشه حرارتی خطاها',
    heatmapLatency: 'نقشه حرارتی سرعت',
    noTelemetryTitle: 'هنوز تله‌متری ثبت نشده است',
    noTelemetryDesc: 'اولین جلسه آزمون خود را در بخش موتور تایپ به پایان برسانید تا داده‌های کامل مکث پرواز، تعادل انگشتان و نمودارها نمایش داده شوند.',
    startTypingSession: 'شروع جلسه آزمون تایپ',
    peakVelocity: 'بیشترین سرعت ثبت‌شده',
    historicalAvg: 'میانگین تاریخی',
    totalRuns: 'تعداد کل آزمون‌ها',
    recentLogs: 'گزارش آزمون‌های اخیر',
    clearHistory: 'پاک کردن تاریخچه',
    colTime: 'زمان',
    colMode: 'حالت',
    colNetWpm: 'سرعت خالص',
    colAccuracy: 'دقت',
    colFlight: 'مکث کلید',
    colConsistency: 'یکنواختی',
    colInspect: 'بررسی',
    details: 'جزئیات',
    noHistory: 'هیچ آزمونی ثبت نشده است. در بخش موتور یک آزمون انجام دهید.',
    saveAndClose: 'اعمال و بستن',
    tip: 'استاندارد تایپ ده‌انگشتی: ۴۵٪ دست چپ، ۴۵٪ دست راست و ۱۰٪ انگشتان شست.',
    punctuation: 'علائم نگارشی',
    numbers: 'اعداد',
  },
};
