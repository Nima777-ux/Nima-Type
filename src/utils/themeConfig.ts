import { ColorTheme } from '../types';

export interface ThemeColors {
  id: ColorTheme;
  name: string;
  nameFa: string;
  description: string;
  descriptionFa: string;
  swatchHex: string;
  accentName: string;

  dark: {
    bg: string;
    bgStyle: string;
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textUpcoming: string;
    textPast: string;
    textError: string;
    errorBg: string;
    accent: string;
    accentBg: string;
    accentBorder: string;
    activeWordBg: string;
    activeWordText: string;
    caret: string;
    badgeBg: string;
    headerBg: string;
  };

  light: {
    bg: string;
    bgStyle: string;
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textUpcoming: string;
    textPast: string;
    textError: string;
    errorBg: string;
    accent: string;
    accentBg: string;
    accentBorder: string;
    activeWordBg: string;
    activeWordText: string;
    caret: string;
    badgeBg: string;
    headerBg: string;
  };
}

export const THEMES: Record<ColorTheme, ThemeColors> = {
  nima_custom: {
    id: 'nima_custom',
    name: 'Sage & Cream (Nima Palette)',
    nameFa: 'پالت نیما (سیج و کرم)',
    description: 'Primary Sage (#A3B18A), Secondary Cream (#F2E8CF), Lavender (#EDE8F3)',
    descriptionFa: 'رنگ‌های سیج A3B18A، کرم F2E8CF و اسطوخودوسی EDE8F3',
    swatchHex: '#A3B18A',
    accentName: 'Primary Sage #A3B18A / Secondary Cream #F2E8CF / Touch of #EDE8F3',
    dark: {
      bg: 'bg-[#172012]',
      bgStyle: '#172012',
      cardBg: 'bg-[#232E1A]',
      cardBorder: 'border-[#4A5B38]',
      textPrimary: 'text-[#F2E8CF]',
      textUpcoming: 'text-[#A3B18A]/60',
      textPast: 'text-[#F2E8CF]/80',
      textError: 'text-[#EF4444] underline decoration-[#EF4444]',
      errorBg: 'bg-[#EF4444]/20',
      accent: 'text-[#A3B18A]',
      accentBg: 'bg-[#A3B18A]/20',
      accentBorder: 'border-[#A3B18A]',
      activeWordBg: 'bg-[#A3B18A]/20 ring-1 ring-[#A3B18A]',
      activeWordText: 'text-[#F2E8CF]',
      caret: 'bg-[#38BDF8]',
      badgeBg: 'bg-[#A3B18A]',
      headerBg: 'bg-[#172012] border-[#4A5B38]',
    },
    light: {
      bg: 'bg-[#F2E8CF]',
      bgStyle: '#F2E8CF',
      cardBg: 'bg-[#F2E8CF]',
      cardBorder: 'border-[#A3B18A]',
      textPrimary: 'text-[#283618]',
      textUpcoming: 'text-[#586B54]',
      textPast: 'text-[#283618]/75',
      textError: 'text-[#9A3B3B] underline decoration-[#9A3B3B]',
      errorBg: 'bg-[#9A3B3B]/15',
      accent: 'text-[#283618]',
      accentBg: 'bg-[#A3B18A]/25',
      accentBorder: 'border-[#A3B18A]',
      activeWordBg: 'bg-[#A3B18A]/25 ring-1 ring-[#A3B18A]',
      activeWordText: 'text-[#283618]',
      caret: 'bg-[#283618]',
      badgeBg: 'bg-[#A3B18A]',
      headerBg: 'bg-[#F2E8CF] border-[#A3B18A]',
    },
  },
};

export const THEME_LIST = Object.values(THEMES);

export interface AppPalette {
  isDark: boolean;
  bg: string;
  pageBg: string;
  cardBg: string;
  cardSurface: string;
  lavender: string;
  text: string;
  textMuted: string;
  border: string;
  borderLight: string;
  primary: string;
  activeBtnBg: string;
  activeBtnText: string;
  tubelightGlow: string;
}

export function getPalette(themeMode?: string): AppPalette {
  const isDark = themeMode === 'dark';
  const pageBg = isDark ? '#172012' : '#F2E8CF';
  return {
    isDark,
    // Page canvas background: Cream in light mode, reversed deep olive-black in dark mode
    bg: pageBg,
    pageBg,
    // Card / surface background: Soft lavender in light mode, rich forest olive in dark mode
    cardBg: isDark ? '#232E1A' : '#EDE8F3',
    // Card surface variant: Cream in light mode, dark olive in dark mode
    cardSurface: isDark ? '#1C2515' : '#F2E8CF',
    // Lavender accent
    lavender: isDark ? '#2B2538' : '#EDE8F3',
    // Main text: Deep forest olive in light mode, warm Cream in dark mode
    text: isDark ? '#F2E8CF' : '#283618',
    // Secondary / muted text: Muted olive in light mode, Sage in dark mode
    textMuted: isDark ? '#A3B18A' : '#586B54',
    // Borders
    border: isDark ? '#4A5B38' : '#A3B18A',
    borderLight: isDark ? '#384628' : '#A3B18A',
    // Accent / Primary (Sage)
    primary: '#A3B18A',
    // Button active background
    activeBtnBg: '#A3B18A',
    activeBtnText: isDark ? '#172012' : '#283618',
    // Tubelight glow
    tubelightGlow: '0 0 20px rgba(56, 189, 248, 0.7)',
  };
}
