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
} from 'lucide-react';

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
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
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
}) => {
  if (!isOpen) return null;

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
          backgroundColor: '#F6F5EF', // Primary (swapped)
          borderColor: '#315C45', // Secondary
          color: '#315C45', // Text
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between border-b pb-4 mb-6"
          style={{ borderColor: '#315C45' }}
        >
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#315C45]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#315C45]" />
              Configuration
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 flex items-center gap-2 text-[#315C45]">
              <Sliders className="w-5 h-5 text-[#315C45]" />
              Settings
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#315C45] hover:bg-[#315C45] hover:text-[#F6F5EF] transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Active Palette (Only the 3 colors requested) */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: '#315C45',
              borderColor: '#B59B7A',
              color: '#F6F5EF',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">
                Exclusive 3-Color Palette
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold border"
                style={{
                  backgroundColor: '#F6F5EF',
                  borderColor: '#B59B7A',
                  color: '#315C45',
                }}
              >
                ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg border border-[#B59B7A] bg-[#F6F5EF]" />
                <span className="text-xs">Primary (#F6F5EF)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg border border-[#B59B7A] bg-[#315C45]" />
                <span className="text-xs">Secondary (#315C45)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg border border-[#315C45] bg-[#B59B7A]" />
                <span className="text-xs text-[#B59B7A]">Third (#B59B7A)</span>
              </div>
            </div>
          </div>

          {/* Test Controls (Punctuation & Numbers) */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: '#315C45',
              borderColor: '#B59B7A',
              color: '#F6F5EF',
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
                  backgroundColor: punctuation ? '#F6F5EF' : '#315C45',
                  borderColor: '#B59B7A',
                  color: punctuation ? '#315C45' : '#F6F5EF',
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
                  backgroundColor: numbers ? '#F6F5EF' : '#315C45',
                  borderColor: '#B59B7A',
                  color: numbers ? '#315C45' : '#F6F5EF',
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
              backgroundColor: '#315C45',
              borderColor: '#B59B7A',
              color: '#F6F5EF',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F6F5EF]" />
                Language Settings
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1 text-[#F6F5EF]/80">
                  Interface Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectAppLang('en')}
                    className="p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: appLang === 'en' ? '#F6F5EF' : '#315C45',
                      borderColor: '#B59B7A',
                      color: appLang === 'en' ? '#315C45' : '#F6F5EF',
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
                      backgroundColor: appLang === 'fa' ? '#F6F5EF' : '#315C45',
                      borderColor: '#B59B7A',
                      color: appLang === 'fa' ? '#315C45' : '#F6F5EF',
                    }}
                  >
                    <span>فارسی (Persian)</span>
                    {appLang === 'fa' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1 text-[#F6F5EF]/80">
                  Typing Test Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectTestLang('en')}
                    className="p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: testLang === 'en' ? '#F6F5EF' : '#315C45',
                      borderColor: '#B59B7A',
                      color: testLang === 'en' ? '#315C45' : '#F6F5EF',
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
                      backgroundColor: testLang === 'fa' ? '#F6F5EF' : '#315C45',
                      borderColor: '#B59B7A',
                      color: testLang === 'fa' ? '#315C45' : '#F6F5EF',
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
              backgroundColor: '#315C45',
              borderColor: '#B59B7A',
              color: '#F6F5EF',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#F6F5EF]" />
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
                    backgroundColor: soundProfile === s.id ? '#F6F5EF' : '#315C45',
                    borderColor: '#B59B7A',
                    color: soundProfile === s.id ? '#315C45' : '#F6F5EF',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="pt-5 mt-5 border-t flex items-center justify-end"
          style={{ borderColor: '#315C45' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md"
            style={{
              backgroundColor: '#315C45',
              borderColor: '#B59B7A',
              borderWidth: '1px',
              color: '#F6F5EF',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
