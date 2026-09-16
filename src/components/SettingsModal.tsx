import React from 'react';
import {
  AppLanguage,
  ThemeMode,
  SoundProfile,
  ColorTheme,
} from '../types';
import {
  Sliders,
  Volume2,
  X,
  Check,
  Globe,
  Hash,
  AtSign,
  Sun,
  Moon,
  Mail,
  Sparkles,
} from 'lucide-react';
import { getPalette } from '../utils/themeConfig';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onToggleTheme: (mode: ThemeMode) => void;
  theme: ColorTheme;
  onSelectTheme: (t: ColorTheme) => void;
  appLang: AppLanguage;
  onSelectAppLang: (lang: AppLanguage) => void;
  testLang: AppLanguage;
  onSelectTestLang: (lang: AppLanguage) => void;
  soundProfile: SoundProfile;
  onChangeSoundProfile: (p: SoundProfile) => void;
  punctuation: boolean;
  onTogglePunctuation: (val: boolean) => void;
  numbers: boolean;
  onToggleNumbers: (val: boolean) => void;
  onOpenContact?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  themeMode = 'light',
  onToggleTheme,
  appLang,
  onSelectAppLang,
  testLang,
  onSelectTestLang,
  soundProfile,
  onChangeSoundProfile,
  punctuation,
  onTogglePunctuation,
  numbers,
  onToggleNumbers,
  onOpenContact,
}) => {
  if (!isOpen) return null;

  const p = getPalette(themeMode);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border transition-all duration-200 p-6 sm:p-8 my-auto font-mono shadow-2xl select-none"
        style={{
          backgroundColor: p.cardSurface,
          borderColor: p.border,
          color: p.text,
          boxShadow: `0 20px 50px -10px rgba(0,0,0,0.5), ${p.tubelightGlow}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between border-b pb-4 mb-6"
          style={{ borderColor: p.border }}
        >
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold" style={{ color: p.text }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.primary }} />
              Configuration
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: p.text }}>
                <Sliders className="w-5 h-5" style={{ color: p.text }} />
                Settings
              </h2>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border flex items-center gap-1.5"
                style={{
                  backgroundColor: p.cardBg,
                  borderColor: p.border,
                  color: p.text,
                  boxShadow: p.tubelightGlow,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                Sigma
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border transition-all cursor-pointer hover:opacity-80"
            style={{
              borderColor: p.border,
              color: p.text,
              backgroundColor: p.isDark ? '#172012' : '#F2E8CF',
            }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Theme Mode Toggle (Light vs Dark with colors reversed) */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: p.cardBg,
              borderColor: p.border,
              color: p.text,
            }}
          >
            <span className="text-xs uppercase font-bold tracking-wider block mb-3">
              Appearance / Theme Mode
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onToggleTheme('light')}
                className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: themeMode === 'light' ? p.primary : p.cardSurface,
                  borderColor: p.border,
                  color: themeMode === 'light' ? p.activeBtnText : p.text,
                  boxShadow: themeMode === 'light' ? p.tubelightGlow : undefined,
                }}
              >
                <span className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Light Mode (Default)
                </span>
                {themeMode === 'light' && <Check className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => onToggleTheme('dark')}
                className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: themeMode === 'dark' ? p.primary : p.cardSurface,
                  borderColor: p.border,
                  color: themeMode === 'dark' ? p.activeBtnText : p.text,
                  boxShadow: themeMode === 'dark' ? p.tubelightGlow : undefined,
                }}
              >
                <span className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Dark Mode (Reversed)
                </span>
                {themeMode === 'dark' && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Permanent Palette Display */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: p.cardBg,
              borderColor: p.border,
              color: p.text,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">
                Permanent Theme Palette
              </span>
              <span
                className="text-[10px] px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1.5"
                style={{
                  backgroundColor: p.isDark ? '#172012' : '#EDE8F3',
                  borderColor: p.border,
                  color: p.text,
                  boxShadow: p.tubelightGlow,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                TUBELIGHT SIGMA
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
              <div
                className="flex items-center gap-2 p-2 rounded-lg border"
                style={{ backgroundColor: p.cardSurface, borderColor: p.border }}
              >
                <div className="w-5 h-5 rounded-md border border-[#A3B18A] bg-[#A3B18A] shadow-xs flex-shrink-0" />
                <div>
                  <div className="font-bold">Primary</div>
                  <div className="text-[10px] opacity-80">Sage #A3B18A</div>
                </div>
              </div>
              <div
                className="flex items-center gap-2 p-2 rounded-lg border"
                style={{ backgroundColor: p.cardSurface, borderColor: p.border }}
              >
                <div className="w-5 h-5 rounded-md border border-[#A3B18A] bg-[#F2E8CF] shadow-xs flex-shrink-0" />
                <div>
                  <div className="font-bold">Secondary</div>
                  <div className="text-[10px] opacity-80">Cream #F2E8CF</div>
                </div>
              </div>
              <div
                className="flex items-center gap-2 p-2 rounded-lg border"
                style={{ backgroundColor: p.cardSurface, borderColor: p.border }}
              >
                <div className="w-5 h-5 rounded-md border border-[#A3B18A] bg-[#EDE8F3] shadow-xs flex-shrink-0" />
                <div>
                  <div className="font-bold">Accent</div>
                  <div className="text-[10px] opacity-80">#EDE8F3</div>
                </div>
              </div>
              <div
                className="flex items-center gap-2 p-2 rounded-lg border"
                style={{ backgroundColor: p.cardSurface, borderColor: p.border }}
              >
                <div
                  className="w-5 h-5 rounded-md border border-[#38BDF8] bg-[#38BDF8] flex-shrink-0"
                  style={{ boxShadow: p.tubelightGlow }}
                />
                <div>
                  <div className="font-bold">Sigma Glow</div>
                  <div className="text-[10px] opacity-80">20px / 70%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Controls (Punctuation & Numbers) */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: p.cardBg,
              borderColor: p.border,
              color: p.text,
            }}
          >
            <span className="text-xs uppercase font-bold tracking-wider block mb-3">
              Test Elements
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onTogglePunctuation(!punctuation)}
                className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: punctuation ? p.primary : p.cardSurface,
                  borderColor: p.border,
                  color: punctuation ? p.activeBtnText : p.text,
                  boxShadow: punctuation ? p.tubelightGlow : undefined,
                }}
              >
                <span className="flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  Punctuation
                </span>
                {punctuation && <Check className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => onToggleNumbers(!numbers)}
                className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: numbers ? p.primary : p.cardSurface,
                  borderColor: p.border,
                  color: numbers ? p.activeBtnText : p.text,
                  boxShadow: numbers ? p.tubelightGlow : undefined,
                }}
              >
                <span className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Numbers
                </span>
                {numbers && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Language Options */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: p.cardBg,
              borderColor: p.border,
              color: p.text,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language Settings
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1 opacity-90">
                  Interface Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectAppLang('en')}
                    className="p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: appLang === 'en' ? p.primary : p.cardSurface,
                      borderColor: p.border,
                      color: appLang === 'en' ? p.activeBtnText : p.text,
                      boxShadow: appLang === 'en' ? p.tubelightGlow : undefined,
                    }}
                  >
                    <span>English (Default)</span>
                    {appLang === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAppLang('fa')}
                    className="p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: appLang === 'fa' ? p.primary : p.cardSurface,
                      borderColor: p.border,
                      color: appLang === 'fa' ? p.activeBtnText : p.text,
                      boxShadow: appLang === 'fa' ? p.tubelightGlow : undefined,
                    }}
                  >
                    <span>فارسی (Persian)</span>
                    {appLang === 'fa' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1 opacity-90">
                  Typing Test Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectTestLang('en')}
                    className="p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: testLang === 'en' ? p.primary : p.cardSurface,
                      borderColor: p.border,
                      color: testLang === 'en' ? p.activeBtnText : p.text,
                      boxShadow: testLang === 'en' ? p.tubelightGlow : undefined,
                    }}
                  >
                    <span>English Words</span>
                    {testLang === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTestLang('fa')}
                    className="p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: testLang === 'fa' ? p.primary : p.cardSurface,
                      borderColor: p.border,
                      color: testLang === 'fa' ? p.activeBtnText : p.text,
                      boxShadow: testLang === 'fa' ? p.tubelightGlow : undefined,
                    }}
                  >
                    <span>واژگان فارسی</span>
                    {testLang === 'fa' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sound Profile */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: p.cardBg,
              borderColor: p.border,
              color: p.text,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Mechanical Sound Profile
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'cherry_blue', label: 'Cherry MX Blue' },
                { id: 'cherry_brown', label: 'Cherry MX Brown' },
                { id: 'cherry_red', label: 'Cherry MX Red' },
                { id: 'typewriter', label: 'Vintage Typewriter' },
                { id: 'cyber_laser', label: 'Laser Click' },
                { id: 'off', label: 'Muted (Off)' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onChangeSoundProfile(s.id as SoundProfile)}
                  className="p-2.5 rounded-xl border font-bold text-center transition-all cursor-pointer"
                  style={{
                    backgroundColor: soundProfile === s.id ? p.primary : p.cardSurface,
                    borderColor: p.border,
                    color: soundProfile === s.id ? p.activeBtnText : p.text,
                    boxShadow: soundProfile === s.id ? p.tubelightGlow : undefined,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Creator Card */}
          {onOpenContact && (
            <div
              className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3"
              style={{
                backgroundColor: p.cardBg,
                borderColor: p.border,
                color: p.text,
              }}
            >
              <div>
                <div className="text-xs uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Designed by Nima Nabizada</span>
                </div>
                <p className="text-[11px] opacity-80 mt-0.5" style={{ color: p.textMuted }}>
                  Email, phone, GitHub, portfolio &amp; LinkedIn details
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenContact();
                }}
                className="tubelight-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer flex-shrink-0"
                style={{
                  backgroundColor: p.primary,
                  borderColor: p.border,
                  color: p.activeBtnText,
                  boxShadow: p.tubelightGlow,
                }}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Nima</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="pt-5 mt-5 border-t flex items-center justify-between"
          style={{ borderColor: p.border }}
        >
          <span className="text-[11px] font-bold" style={{ color: p.textMuted }}>
            Designed by Nima Nabizada
          </span>
          <button
            type="button"
            onClick={onClose}
            className="tubelight-btn px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border"
            style={{
              backgroundColor: p.primary,
              borderColor: p.border,
              color: p.activeBtnText,
              boxShadow: p.tubelightGlow,
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
