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
    name: 'Nima Trio Palette',
    nameFa: 'پالت نیما',
    description: 'Primary (#F6F5EF), Secondary (#315C45), Third (#B59B7A)',
    descriptionFa: 'رنگ‌های F6F5EF و 315C45 و B59B7A',
    swatchHex: '#F6F5EF',
    accentName: 'Primary F6F5EF / Secondary 315C45 / Third B59B7A',
    dark: {
      bg: 'bg-[#F6F5EF]',
      bgStyle: '#F6F5EF',
      cardBg: 'bg-[#F6F5EF]',
      cardBorder: 'border-[#315C45]',
      textPrimary: 'text-[#315C45]',
      textUpcoming: 'text-[#B59B7A]',
      textPast: 'text-[#315C45]/80',
      textError: 'text-[#B59B7A] underline decoration-[#B59B7A]',
      errorBg: 'bg-[#B59B7A]/20',
      accent: 'text-[#315C45]',
      accentBg: 'bg-[#315C45]/15',
      accentBorder: 'border-[#315C45]',
      activeWordBg: 'bg-[#315C45]/15 ring-1 ring-[#315C45]',
      activeWordText: 'text-[#315C45]',
      caret: 'bg-[#315C45]',
      badgeBg: 'bg-[#315C45]',
      headerBg: 'bg-[#F6F5EF] border-[#315C45]',
    },
    light: {
      bg: 'bg-[#F6F5EF]',
      bgStyle: '#F6F5EF',
      cardBg: 'bg-[#F6F5EF]',
      cardBorder: 'border-[#315C45]',
      textPrimary: 'text-[#315C45]',
      textUpcoming: 'text-[#B59B7A]',
      textPast: 'text-[#315C45]/80',
      textError: 'text-[#B59B7A] underline decoration-[#B59B7A]',
      errorBg: 'bg-[#B59B7A]/20',
      accent: 'text-[#315C45]',
      accentBg: 'bg-[#315C45]/15',
      accentBorder: 'border-[#315C45]',
      activeWordBg: 'bg-[#315C45]/15 ring-1 ring-[#315C45]',
      activeWordText: 'text-[#315C45]',
      caret: 'bg-[#315C45]',
      badgeBg: 'bg-[#315C45]',
      headerBg: 'bg-[#F6F5EF] border-[#315C45]',
    },
  },
};

export const THEME_LIST = Object.values(THEMES);
