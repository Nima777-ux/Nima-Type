import React, { useState, useEffect, useCallback } from 'react';
import {
  TestMode,
  TimeDuration,
  WordCount,
  QuoteLength,
  CodeLanguage,
  SoundProfile,
  ColorTheme,
  TestResult,
  AdvancedMetrics,
  AppLanguage,
  ThemeMode,
  UserAccount,
} from './types';
import { LiveKeyRhythm } from './components/LiveKeyRhythm';
import { TypingArea } from './components/TypingArea';
import { AdvancedMetricsDashboard } from './components/AdvancedMetricsDashboard';
import { MonkeytypeResults } from './components/MonkeytypeResults';
import { DesktopAppModal } from './components/DesktopAppModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ContactModal } from './components/ContactModal';
import { getPalette } from './utils/themeConfig';
import { soundEngine } from './utils/audio';
import { translations } from './utils/translations';
import {
  getCurrentSession,
  getCurrentSessionAsync,
  clearSession,
  updateUserStats,
  mapSupabaseUserToUserAccount,
} from './utils/authStorage';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  Settings,
  Moon,
  Sun,
  Globe,
  BarChart3,
  Keyboard,
  Crown,
  Info,
  Clock,
  Type,
  Quote,
  Code2,
  Wrench,
  Mail,
  Heart,
  Github,
  MessageSquare,
  Twitter,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'engine' | 'telemetry' | 'history' | 'settings'>('engine');

  // App & Theming State (Strictly Sage #A3B18A, Cream #F2E8CF, Lavender #EDE8F3, Tubelight #38BDF8)
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('kinetic_theme_mode');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem('kinetic_theme_mode', mode);
    } catch {
      // ignore
    }
  }, []);

  // Default language is strictly English as requested
  const [appLang, setAppLang] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('kinetic_app_lang');
      return saved === 'fa' ? 'fa' : 'en';
    } catch {
      return 'en';
    }
  });

  const [testLang, setTestLang] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('kinetic_test_lang');
      return saved === 'fa' ? 'fa' : 'en';
    } catch {
      return 'en';
    }
  });

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Authentication State: Pop up on start if not logged in
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const session = getCurrentSession();
    return session ? session.user : null;
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(() => {
    return !getCurrentSession();
  });
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Test configuration
  const [testMode, setTestMode] = useState<TestMode>('time');
  const [timeDuration, setTimeDuration] = useState<TimeDuration>(30);
  const [wordCount, setWordCount] = useState<WordCount>(25);
  const [quoteLength, setQuoteLength] = useState<QuoteLength>('medium');
  const [codeLang, setCodeLang] = useState<CodeLanguage>('javascript');
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);
  const [customText, setCustomText] = useState('');

  // Fixed palette
  const theme: ColorTheme = 'nima_custom';

  // Sound Profile
  const [soundProfile, setSoundProfile] = useState<SoundProfile>('cherry_blue');

  // Live typing state
  const [isTestActive, setIsTestActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [streak, setStreak] = useState(0);
  const [burstWpm, setBurstWpm] = useState(0);
  const [instantLatency, setInstantLatency] = useState(0);
  const [liveConsistency, setLiveConsistency] = useState(100);
  const [activeKeyCode, setActiveKeyCode] = useState<string | null>(null);
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState(0);
  const [keyStats, setKeyStats] = useState<Record<string, { total: number; errors: number; totalLatencyMs: number }>>({});
  const [resetTrigger, setResetTrigger] = useState(0);

  // Results & History
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<TestResult[]>(() => {
    try {
      const saved = localStorage.getItem('kinetic_typing_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist Theme Mode
  useEffect(() => {
    try {
      localStorage.setItem('nima_color_theme', 'nima_custom');
      localStorage.setItem('kinetic_theme_mode', themeMode);
    } catch (err) {
      console.error('Failed to save theme settings:', err);
    }
  }, [themeMode]);

  // Persist App Language
  useEffect(() => {
    try {
      localStorage.setItem('kinetic_app_lang', appLang);
    } catch (err) {
      console.error('Failed to save app language:', err);
    }
  }, [appLang]);

  // Persist Test Language
  useEffect(() => {
    try {
      localStorage.setItem('kinetic_test_lang', testLang);
    } catch (err) {
      console.error('Failed to save test language:', err);
    }
  }, [testLang]);

  // Synchronize with Supabase Auth session & auth state changes
  useEffect(() => {
    getCurrentSessionAsync().then((session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setShowAuthModal(false);
      }
    });

    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, sbSession) => {
        if (sbSession?.user) {
          const user = mapSupabaseUserToUserAccount(sbSession.user);
          setCurrentUser(user);
          setShowAuthModal(false);
        } else {
          setCurrentUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Sound Profile change effect
  useEffect(() => {
    soundEngine.setProfile(soundProfile);
  }, [soundProfile]);

  // Handle keypress forwarded from TypingArea
  const handleKeypress = useCallback((code: string) => {
    setActiveKeyCode(code);
    setLastKeystrokeTime(Date.now());
  }, []);

  // Update live metrics from TypingArea
  const handleUpdateMetrics = useCallback(
    (
      newWpm: number,
      newRaw: number,
      newAcc: number,
      newStreak: number,
      newBurst: number,
      newLatency?: number,
      newConsistency?: number
    ) => {
      setWpm(newWpm);
      setRawWpm(newRaw);
      setAccuracy(Math.round(newAcc));
      setStreak(newStreak);
      setBurstWpm(newBurst);
      if (newLatency !== undefined) setInstantLatency(newLatency);
      if (newConsistency !== undefined) setLiveConsistency(newConsistency);
    },
    []
  );

  // Handle test completion
  const handleTestComplete = useCallback((result: TestResult) => {
    setCurrentResult(result);
    setHistory((prev) => {
      const next = [result, ...prev.slice(0, 99)];
      try {
        localStorage.setItem('kinetic_typing_history', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save history:', err);
      }
      return next;
    });

    // Update account profile stats if user is logged in
    const session = getCurrentSession();
    if (session) {
      const updated = updateUserStats(session.user.id, result.wpm, result.accuracy);
      if (updated) setCurrentUser(updated);
    }

    setShowResultModal(true);
    soundEngine.playSuccessBell();
  }, []);

  // Restart / next test handler
  const handleRestart = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
    setIsTestActive(false);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setStreak(0);
    setBurstWpm(0);
    setInstantLatency(0);
    setLiveConsistency(100);
    setKeyStats({});
    setActiveKeyCode(null);
    setShowResultModal(false);
  }, []);

  // Translation bundle
  const t = translations[appLang];
  const isRTL = appLang === 'fa';

  // Stats summaries
  const bestWpm = history.length > 0 ? Math.max(...history.map((h) => h.wpm)) : 0;
  const avgWpm = history.length > 0 ? Math.round(history.reduce((a, b) => a + b.wpm, 0) / history.length) : 0;
  const avgAccuracy = history.length > 0 ? Math.round(history.reduce((a, b) => a + b.accuracy, 0) / history.length) : 0;

  // Latest telemetry fallback for telemetry view tab
  const latestTelemetry: AdvancedMetrics | null = currentResult?.advancedMetrics || history[0]?.advancedMetrics || null;

  const p = getPalette(themeMode);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col font-mono transition-colors duration-200"
      style={{
        backgroundColor: p.pageBg,
        color: p.text,
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER                                                 */}
      {/* ------------------------------------------------------------- */}
      <header
        className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between font-mono select-none"
        style={{ color: p.text }}
      >
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              setShowResultModal(false);
              setActiveTab('engine');
            }}
            className="flex flex-col cursor-pointer group"
          >
            <span
              className="text-[10px] leading-none mb-0.5 tracking-wider font-bold"
              style={{ color: p.textMuted }}
            >
              nima see
            </span>
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7" style={{ color: p.text }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
              </svg>
              <span className="text-xl sm:text-2xl font-bold tracking-tight lowercase" style={{ color: p.text }}>
                nima type
              </span>
            </div>
          </div>

          {/* Action Icons next to Logo */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setShowResultModal(false);
                setActiveTab('engine');
              }}
              className="p-2 rounded-xl border transition-all cursor-pointer"
              style={
                activeTab === 'engine' && !showResultModal
                  ? {
                      backgroundColor: p.primary,
                      borderColor: p.border,
                      color: p.activeBtnText,
                      boxShadow: p.tubelightGlow,
                      fontWeight: 'bold',
                    }
                  : {
                      borderColor: p.border,
                      color: p.text,
                    }
              }
              title="Typing Test"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {currentResult && (
              <button
                onClick={() => {
                  setShowResultModal(true);
                  setActiveTab('engine');
                }}
                className="p-2 rounded-xl border transition-all cursor-pointer"
                style={
                  showResultModal && activeTab === 'engine'
                    ? {
                        backgroundColor: p.primary,
                        borderColor: p.border,
                        color: p.activeBtnText,
                        boxShadow: p.tubelightGlow,
                        fontWeight: 'bold',
                      }
                    : {
                        borderColor: p.border,
                        color: p.text,
                      }
                }
                title="View Results Panel"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                setShowResultModal(false);
                setActiveTab('history');
              }}
              className="p-2 rounded-xl border transition-all cursor-pointer"
              style={
                activeTab === 'history'
                  ? {
                      backgroundColor: p.primary,
                      borderColor: p.border,
                      color: p.activeBtnText,
                      boxShadow: p.tubelightGlow,
                      fontWeight: 'bold',
                    }
                  : {
                      borderColor: p.border,
                      color: p.text,
                    }
              }
              title="Test History / Leaderboards"
            >
              <Crown className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setShowResultModal(false);
                setActiveTab('telemetry');
              }}
              className="p-2 rounded-xl border transition-all cursor-pointer"
              style={
                activeTab === 'telemetry'
                  ? {
                      backgroundColor: p.primary,
                      borderColor: p.border,
                      color: p.activeBtnText,
                      boxShadow: p.tubelightGlow,
                      fontWeight: 'bold',
                    }
                  : {
                      borderColor: p.border,
                      color: p.text,
                    }
              }
              title="Telemetry & Diagnostics"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl border transition-colors cursor-pointer hover:opacity-80"
              style={{
                borderColor: p.border,
                color: p.text,
              }}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prominent Contact Creator Button in Header */}
          <button
            onClick={() => setShowContactModal(true)}
            className="tubelight-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs"
            style={{
              backgroundColor: p.cardBg,
              borderColor: p.border,
              color: p.text,
              boxShadow: p.tubelightGlow,
            }}
            title="Contact Nima Nabizada (Email, GitHub, LinkedIn, Portfolio)"
          >
            <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden md:inline">Contact</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
          </button>

          {/* User Account / Sign In Button */}
          {currentUser ? (
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs"
              style={{
                backgroundColor: p.cardBg,
                borderColor: p.border,
                color: p.text,
                boxShadow: p.tubelightGlow,
              }}
              title="Account Profile & Security"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: p.primary, color: p.activeBtnText }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[90px] truncate hidden sm:inline">{currentUser.name}</span>
              <ShieldCheck className="w-3.5 h-3.5 hidden md:inline" style={{ color: p.textMuted }} />
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="tubelight-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border"
              style={{
                backgroundColor: p.primary,
                borderColor: p.border,
                color: p.activeBtnText,
                boxShadow: p.tubelightGlow,
              }}
            >
              <User className="w-3.5 h-3.5" />
              <span>{appLang === 'fa' ? 'ورود / عضویت' : 'Sign In'}</span>
            </button>
          )}

          {/* Quick Theme Mode Toggle */}
          <button
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border transition-colors cursor-pointer hover:opacity-80"
            style={{
              borderColor: p.border,
              color: p.text,
            }}
            title={themeMode === 'dark' ? t.lightMode : t.darkMode}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Language Toggle (EN / FA) */}
          <button
            onClick={() => setAppLang(appLang === 'en' ? 'fa' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer hover:opacity-80"
            style={{
              borderColor: p.border,
              color: p.text,
            }}
            title="Switch Language"
          >
            {appLang === 'en' ? 'FA' : 'EN'}
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN APPLICATION CONTENT                                   */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col justify-center">
        {activeTab === 'engine' && (
          <>
            {/* Show Results Screen OR Floating Pill + Typing Area */}
            {showResultModal && currentResult ? (
              <MonkeytypeResults
                result={currentResult}
                onRestart={handleRestart}
                onNextTest={handleRestart}
                appLang={appLang}
                themeMode={themeMode}
              />
            ) : (
              <>
                {/* Floating Mode Selection Pill */}
                <div className="flex flex-col items-center justify-center gap-3 my-4">
                  <div
                    className="rounded-2xl border px-4 py-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-mono shadow-sm select-none"
                    style={{
                      backgroundColor: p.cardBg,
                      borderColor: p.border,
                      color: p.text,
                    }}
                  >
                    {/* Punctuation & Numbers */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setPunctuation(!punctuation);
                          handleRestart();
                        }}
                        className="flex items-center gap-1 cursor-pointer transition-all px-2 py-0.5 rounded"
                        style={
                          punctuation
                            ? {
                                backgroundColor: p.primary,
                                color: p.activeBtnText,
                                fontWeight: 'bold',
                                boxShadow: p.tubelightGlow,
                              }
                            : {
                                color: p.textMuted,
                              }
                        }
                      >
                        <span>@</span>
                        <span>punctuation</span>
                      </button>

                      <button
                        onClick={() => {
                          setNumbers(!numbers);
                          handleRestart();
                        }}
                        className="flex items-center gap-1 cursor-pointer transition-all px-2 py-0.5 rounded"
                        style={
                          numbers
                            ? {
                                backgroundColor: p.primary,
                                color: p.activeBtnText,
                                fontWeight: 'bold',
                                boxShadow: p.tubelightGlow,
                              }
                            : {
                                color: p.textMuted,
                              }
                        }
                      >
                        <span>#</span>
                        <span>numbers</span>
                      </button>
                    </div>

                    <div className="w-[2px] h-3 rounded-full hidden sm:block" style={{ backgroundColor: p.border }} />

                    {/* Mode Types */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        onClick={() => {
                          setTestMode('time');
                          handleRestart();
                        }}
                        className="flex items-center gap-1.5 cursor-pointer transition-all px-2 py-0.5 rounded"
                        style={
                          testMode === 'time'
                            ? {
                                backgroundColor: p.primary,
                                color: p.activeBtnText,
                                fontWeight: 'bold',
                                boxShadow: p.tubelightGlow,
                              }
                            : {
                                color: p.textMuted,
                              }
                        }
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>time</span>
                      </button>

                      <button
                        onClick={() => {
                          setTestMode('words');
                          handleRestart();
                        }}
                        className="flex items-center gap-1.5 cursor-pointer transition-all px-2 py-0.5 rounded"
                        style={
                          testMode === 'words'
                            ? {
                                backgroundColor: p.primary,
                                color: p.activeBtnText,
                                fontWeight: 'bold',
                                boxShadow: p.tubelightGlow,
                              }
                            : {
                                color: p.textMuted,
                              }
                        }
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>words</span>
                      </button>

                      <button
                        onClick={() => {
                          setTestMode('quote');
                          handleRestart();
                        }}
                        className="flex items-center gap-1.5 cursor-pointer transition-all px-2 py-0.5 rounded"
                        style={
                          testMode === 'quote'
                            ? {
                                backgroundColor: p.primary,
                                color: p.activeBtnText,
                                fontWeight: 'bold',
                                boxShadow: p.tubelightGlow,
                              }
                            : {
                                color: p.textMuted,
                              }
                        }
                      >
                        <Quote className="w-3.5 h-3.5" />
                        <span>quote</span>
                      </button>

                      <button
                        onClick={() => {
                          setTestMode('code');
                          handleRestart();
                        }}
                        className="flex items-center gap-1.5 cursor-pointer transition-all px-2 py-0.5 rounded"
                        style={
                          testMode === 'code'
                            ? {
                                backgroundColor: p.primary,
                                color: p.activeBtnText,
                                fontWeight: 'bold',
                                boxShadow: p.tubelightGlow,
                              }
                            : {
                                color: p.textMuted,
                              }
                        }
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>code</span>
                      </button>

                      <button
                        onClick={() => {
                          setTestMode('custom');
                          handleRestart();
                        }}
                        className="flex items-center gap-1.5 cursor-pointer transition-all px-2 py-0.5 rounded"
                        style={
                          testMode === 'custom'
                            ? {
                                backgroundColor: p.primary,
                                color: p.activeBtnText,
                                fontWeight: 'bold',
                                boxShadow: p.tubelightGlow,
                              }
                            : {
                                color: p.textMuted,
                              }
                        }
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>custom</span>
                      </button>
                    </div>

                    <div className="w-[2px] h-3 rounded-full hidden sm:block" style={{ backgroundColor: p.border }} />

                    {/* Quantities */}
                    <div className="flex items-center gap-3">
                      {testMode === 'time' && (
                        <>
                          {([15, 30, 60, 120] as TimeDuration[]).map((dur) => (
                            <button
                              key={dur}
                              onClick={() => {
                                setTimeDuration(dur);
                                handleRestart();
                              }}
                              className="cursor-pointer transition-all px-1.5 py-0.5 rounded"
                              style={
                                timeDuration === dur
                                  ? {
                                      backgroundColor: p.primary,
                                      color: p.activeBtnText,
                                      fontWeight: 'bold',
                                      boxShadow: p.tubelightGlow,
                                    }
                                  : {
                                      color: p.textMuted,
                                    }
                              }
                            >
                              {dur}
                            </button>
                          ))}
                        </>
                      )}

                      {testMode === 'words' && (
                        <>
                          {([10, 25, 50, 100] as WordCount[]).map((cnt) => (
                            <button
                              key={cnt}
                              onClick={() => {
                                setWordCount(cnt);
                                handleRestart();
                              }}
                              className="cursor-pointer transition-all px-1.5 py-0.5 rounded"
                              style={
                                wordCount === cnt
                                  ? {
                                      backgroundColor: p.primary,
                                      color: p.activeBtnText,
                                      fontWeight: 'bold',
                                      boxShadow: p.tubelightGlow,
                                    }
                                  : {
                                      color: p.textMuted,
                                    }
                              }
                            >
                              {cnt}
                            </button>
                          ))}
                        </>
                      )}

                      {testMode === 'quote' && (
                        <>
                          {(['short', 'medium', 'long'] as QuoteLength[]).map((ql) => (
                            <button
                              key={ql}
                              onClick={() => {
                                setQuoteLength(ql);
                                handleRestart();
                              }}
                              className="capitalize cursor-pointer transition-all px-1.5 py-0.5 rounded"
                              style={
                                quoteLength === ql
                                  ? {
                                      backgroundColor: p.primary,
                                      color: p.activeBtnText,
                                      fontWeight: 'bold',
                                      boxShadow: p.tubelightGlow,
                                    }
                                  : {
                                      color: p.textMuted,
                                    }
                              }
                            >
                              {ql}
                            </button>
                          ))}
                        </>
                      )}

                      {testMode === 'code' && (
                        <>
                          {(['javascript', 'python', 'html'] as CodeLanguage[]).map((lang) => (
                            <button
                              key={lang}
                              onClick={() => {
                                setCodeLang(lang);
                                handleRestart();
                              }}
                              className="capitalize cursor-pointer transition-all px-1.5 py-0.5 rounded"
                              style={
                                codeLang === lang
                                  ? {
                                      backgroundColor: p.primary,
                                      color: p.activeBtnText,
                                      fontWeight: 'bold',
                                      boxShadow: p.tubelightGlow,
                                    }
                                  : {
                                      color: p.textMuted,
                                    }
                              }
                            >
                              {lang}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sub-bar below pill */}
                  <div
                    className="flex items-center gap-6 text-xs font-mono select-none font-bold"
                    style={{ color: p.text }}
                  >
                    <button
                      onClick={() => {
                        setTestLang(testLang === 'en' ? 'fa' : 'en');
                        handleRestart();
                      }}
                      className="flex items-center gap-1.5 transition-colors cursor-pointer hover:opacity-80"
                      title="Switch test language"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{testLang === 'en' ? 'english' : 'فارسی'}</span>
                    </button>

                    <div className="flex items-center gap-1 text-[11px]">
                      <span style={{ color: p.textMuted }}>daily pace:</span>
                      <span className="font-bold" style={{ color: p.text }}>
                        {bestWpm > 0 ? `${bestWpm} wpm` : '0 wpm'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Interactive Typing Area */}
                <TypingArea
                  testMode={testMode}
                  timeDuration={timeDuration}
                  wordCount={wordCount}
                  quoteLength={quoteLength}
                  codeLang={codeLang}
                  punctuation={punctuation}
                  numbers={numbers}
                  customText={customText}
                  onKeypress={handleKeypress}
                  onUpdateMetrics={handleUpdateMetrics}
                  onKeyStatsUpdate={setKeyStats}
                  onTestComplete={handleTestComplete}
                  isTestActive={isTestActive}
                  setIsTestActive={setIsTestActive}
                  resetTrigger={resetTrigger}
                  onRestart={handleRestart}
                  testLang={testLang}
                  appLang={appLang}
                  themeMode={themeMode}
                  theme={theme}
                />
              </>
            )}

            {/* Flat Clever Live Key Rhythm Visualizer (2D Matrix) */}
            <div className="w-full mt-4" dir="ltr" style={{ direction: 'ltr' }}>
              <LiveKeyRhythm
                activeKeyCode={activeKeyCode}
                keyStats={keyStats}
                wpm={wpm}
                streak={streak}
                burstWpm={burstWpm}
                instantLatency={instantLatency}
                lastKeystrokeTime={lastKeystrokeTime}
                themeMode={themeMode}
              />
            </div>
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: ADVANCED TELEMETRY ARCHIVE                             */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            {latestTelemetry ? (
              <AdvancedMetricsDashboard
                metrics={latestTelemetry}
                wpm={currentResult?.wpm || avgWpm}
                accuracy={currentResult?.accuracy || avgAccuracy}
                highestStreak={currentResult?.highestStreak || 0}
                onClose={() => setActiveTab('engine')}
                themeMode={themeMode}
              />
            ) : (
              <div
                className="p-12 rounded-3xl border text-center space-y-4 shadow-sm"
                style={{
                  backgroundColor: p.cardBg,
                  borderColor: p.border,
                  color: p.text,
                }}
              >
                <div className="text-4xl">⚡</div>
                <h3 className="text-2xl font-bold tracking-tight" style={{ color: p.text }}>
                  NO TELEMETRY DATA LOGGED YET
                </h3>
                <p className="text-sm max-w-md mx-auto font-bold" style={{ color: p.textMuted }}>
                  Complete your first test session in the Engine to generate multi-dimensional keystroke latency,
                  finger load distribution, and error typology diagnostics.
                </p>
                <button
                  onClick={() => setActiveTab('engine')}
                  className="tubelight-btn px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 border cursor-pointer"
                  style={{
                    backgroundColor: p.primary,
                    borderColor: p.border,
                    color: p.activeBtnText,
                    boxShadow: p.tubelightGlow,
                  }}
                >
                  Start Typing Session
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: ARCHIVES & SESSION LOGS                                */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Lifetime Aggregate Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                className="p-6 rounded-2xl border shadow-sm"
                style={{
                  backgroundColor: p.cardBg,
                  borderColor: p.border,
                  color: p.text,
                }}
              >
                <span className="text-xs uppercase tracking-wider font-bold" style={{ color: p.textMuted }}>
                  Peak Velocity
                </span>
                <div className="text-5xl font-extrabold mt-1" style={{ color: p.text }}>
                  {bestWpm} <span className="text-sm opacity-75 font-normal">WPM</span>
                </div>
              </div>

              <div
                className="p-6 rounded-2xl border shadow-sm"
                style={{
                  backgroundColor: p.cardBg,
                  borderColor: p.border,
                  color: p.text,
                }}
              >
                <span className="text-xs uppercase tracking-wider font-bold" style={{ color: p.textMuted }}>
                  Historical Average
                </span>
                <div className="text-5xl font-extrabold mt-1" style={{ color: p.text }}>
                  {avgWpm} <span className="text-sm opacity-75 font-normal">WPM</span>
                </div>
              </div>

              <div
                className="p-6 rounded-2xl border shadow-sm"
                style={{
                  backgroundColor: p.cardBg,
                  borderColor: p.border,
                  color: p.text,
                }}
              >
                <span className="text-xs uppercase tracking-wider font-bold" style={{ color: p.textMuted }}>
                  Total Runs Logged
                </span>
                <div className="text-5xl font-extrabold mt-1" style={{ color: p.text }}>
                  {history.length}
                </div>
              </div>
            </div>

            {/* History Table */}
            <div
              className="rounded-2xl border overflow-hidden shadow-sm"
              style={{
                backgroundColor: p.cardBg,
                borderColor: p.border,
                color: p.text,
              }}
            >
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: p.border }}
              >
                <h3 className="text-xs uppercase tracking-wider font-bold">
                  Recent Flight Logs
                </h3>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem('kinetic_typing_history');
                    }}
                    className="text-xs hover:underline transition-colors uppercase font-bold cursor-pointer"
                    style={{ color: p.textMuted }}
                  >
                    Clear History
                  </button>
                )}
              </div>

              {history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead
                      className="border-b uppercase text-[10px]"
                      style={{
                        backgroundColor: p.cardSurface,
                        color: p.text,
                        borderColor: p.border,
                      }}
                    >
                      <tr>
                        <th className="p-3.5">Time</th>
                        <th className="p-3.5">Mode</th>
                        <th className="p-3.5 text-right">Net WPM</th>
                        <th className="p-3.5 text-right">Accuracy</th>
                        <th className="p-3.5 text-right">Latency</th>
                        <th className="p-3.5 text-right">Consistency</th>
                        <th className="p-3.5 text-center">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: p.border }}>
                      {history.map((h) => (
                        <tr
                          key={h.id}
                          className="transition hover:bg-black/5"
                        >
                          <td className="p-3.5 opacity-80">
                            {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3.5 uppercase font-bold" style={{ color: p.textMuted }}>
                            {h.testMode}
                          </td>
                          <td className="p-3.5 text-right font-bold text-sm">
                            {h.wpm}
                          </td>
                          <td className="p-3.5 text-right font-bold">
                            {h.accuracy}%
                          </td>
                          <td className="p-3.5 text-right">
                            {h.advancedMetrics?.meanLatencyMs || '—'}ms
                          </td>
                          <td className="p-3.5 text-right font-bold">
                            {h.consistency}%
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => {
                                setCurrentResult(h);
                                setShowResultModal(true);
                              }}
                              className="tubelight-btn px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer border"
                              style={{
                                backgroundColor: p.primary,
                                borderColor: p.border,
                                color: p.activeBtnText,
                                boxShadow: p.tubelightGlow,
                              }}
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs opacity-60">
                  No historical sessions recorded. Run a test in Engine to log telemetry.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 3. FOOTER (Strictly Contact Nima Nabizada & Designed by...)   */}
      {/* ------------------------------------------------------------- */}
      <footer
        className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 mt-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono select-none font-bold border-t"
        style={{
          borderColor: p.border,
          color: p.text,
        }}
      >
        {/* Left: Contact Trigger with Tubelight Glow */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setShowContactModal(true)}
            className="tubelight-btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-sm active:scale-95"
            style={{
              backgroundColor: p.cardBg,
              borderColor: p.border,
              color: p.text,
              boxShadow: p.tubelightGlow,
            }}
            title="View Nima Nabizada Contact Info (Email, Phone, GitHub, LinkedIn, Portfolio)"
          >
            <Mail className="w-4 h-4 text-[#38BDF8]" />
            <span className="tracking-wide">Contact</span>
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
          </button>

          {/* Direct Quick Contact Links */}
          <a
            href="mailto:nimaalkantra7@gmail.com"
            className="hover:underline transition-colors flex items-center gap-1.5 opacity-80 hover:opacity-100"
            style={{ color: p.text }}
          >
            <span>nimaalkantra7@gmail.com</span>
          </a>

          <a
            href="tel:+93797355027"
            className="hidden sm:flex hover:underline transition-colors items-center gap-1.5 opacity-80 hover:opacity-100"
            style={{ color: p.text }}
          >
            <span>+93797355027</span>
          </a>
        </div>

        {/* Center/Right: "Designed by Nima Nabizada." as requested */}
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="text-sm font-extrabold tracking-wide" style={{ color: p.text }}>
            Designed by Nima Nabizada.
          </span>

          {currentUser && (
            <span className="hidden md:flex items-center gap-1.5 opacity-80">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: p.primary, border: `1px solid ${p.border}` }}
              />
              {currentUser.email}
            </span>
          )}
          <span style={{ color: p.textMuted }}>v26.32.0</span>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODALS (AUTH, PROFILE, SETTINGS, DESKTOP & CONTACT MODAL)  */}
      {/* ------------------------------------------------------------- */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setShowAuthModal(false);
        }}
        canClose={!!currentUser}
        appLang={appLang}
        themeMode={themeMode}
      />

      <UserProfileModal
        isOpen={showProfileModal}
        user={currentUser}
        onClose={() => setShowProfileModal(false)}
        onLogout={async () => {
          await clearSession();
          setCurrentUser(null);
          setShowProfileModal(false);
          setShowAuthModal(true);
        }}
        appLang={appLang}
        themeMode={themeMode}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        themeMode={themeMode}
        onToggleTheme={(mode) => setThemeMode(mode)}
        theme={theme}
        onSelectTheme={() => {}}
        appLang={appLang}
        onSelectAppLang={(lang) => setAppLang(lang)}
        testLang={testLang}
        onSelectTestLang={(lang) => {
          setTestLang(lang);
          handleRestart();
        }}
        soundProfile={soundProfile}
        onChangeSoundProfile={setSoundProfile}
        punctuation={punctuation}
        onTogglePunctuation={(p) => {
          setPunctuation(p);
          handleRestart();
        }}
        numbers={numbers}
        onToggleNumbers={(n) => {
          setNumbers(n);
          handleRestart();
        }}
      />

      <DesktopAppModal
        isOpen={showDesktopModal}
        onClose={() => setShowDesktopModal(false)}
        themeMode={themeMode}
      />

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        themeMode={themeMode}
      />
    </div>
  );
}
