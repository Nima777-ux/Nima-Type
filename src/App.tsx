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
import { soundEngine } from './utils/audio';
import { translations } from './utils/translations';
import { getCurrentSession, clearSession, updateUserStats } from './utils/authStorage';
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

  // App & Theming State (Strictly 3 Colors: #F6F5EF, #315C45, #B59B7A)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('kinetic_theme_mode');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

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

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col font-mono transition-colors duration-200"
      style={{
        backgroundColor: '#F6F5EF',
        color: '#315C45',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER                                                 */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between font-mono select-none">
        <div className="flex items-center gap-6">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              setShowResultModal(false);
              setActiveTab('engine');
            }}
            className="flex flex-col cursor-pointer group"
          >
            <span className="text-[10px] text-[#B59B7A] leading-none mb-0.5 tracking-wider font-bold">
              nima see
            </span>
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7 text-[#315C45]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
              </svg>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#315C45] lowercase">
                nima type
              </span>
            </div>
          </div>

          {/* Action Icons next to Logo */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setShowResultModal(false);
                setActiveTab('engine');
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                activeTab === 'engine' && !showResultModal
                  ? 'bg-[#315C45] text-[#F6F5EF] border-[#315C45] font-bold'
                  : 'border-[#315C45] text-[#315C45] hover:bg-[#315C45] hover:text-[#F6F5EF]'
              }`}
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
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  showResultModal && activeTab === 'engine'
                    ? 'bg-[#315C45] text-[#F6F5EF] border-[#315C45] font-bold'
                    : 'border-[#315C45] text-[#315C45] hover:bg-[#315C45] hover:text-[#F6F5EF]'
                }`}
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
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#315C45] text-[#F6F5EF] border-[#315C45] font-bold'
                  : 'border-[#315C45] text-[#315C45] hover:bg-[#315C45] hover:text-[#F6F5EF]'
              }`}
              title="Test History / Leaderboards"
            >
              <Crown className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setShowResultModal(false);
                setActiveTab('telemetry');
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'bg-[#315C45] text-[#F6F5EF] border-[#315C45] font-bold'
                  : 'border-[#315C45] text-[#315C45] hover:bg-[#315C45] hover:text-[#F6F5EF]'
              }`}
              title="Telemetry & Diagnostics"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl border border-[#315C45] text-[#315C45] hover:bg-[#315C45] hover:text-[#F6F5EF] transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Account / Sign In Button */}
          {currentUser ? (
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs"
              style={{
                backgroundColor: '#315C45',
                borderColor: '#B59B7A',
                color: '#F6F5EF',
              }}
              title="Account Profile & Security"
            >
              <div className="w-5 h-5 rounded-full bg-[#B59B7A] text-[#F6F5EF] flex items-center justify-center text-[10px] font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[90px] truncate hidden sm:inline">{currentUser.name}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#B59B7A] hidden md:inline" />
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border"
              style={{
                backgroundColor: '#315C45',
                borderColor: '#B59B7A',
                color: '#F6F5EF',
              }}
            >
              <User className="w-3.5 h-3.5" />
              <span>{appLang === 'fa' ? 'ورود / عضویت' : 'Sign In'}</span>
            </button>
          )}

          {/* Quick Theme Mode Toggle */}
          <button
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-[#315C45] text-[#315C45] hover:bg-[#315C45] hover:text-[#F6F5EF] transition-colors cursor-pointer"
            title={themeMode === 'dark' ? t.lightMode : t.darkMode}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Language Toggle (EN / FA) */}
          <button
            onClick={() => setAppLang(appLang === 'en' ? 'fa' : 'en')}
            className="px-2.5 py-1.5 rounded-xl border border-[#315C45] text-xs font-bold text-[#315C45] hover:bg-[#315C45] hover:text-[#F6F5EF] transition-colors cursor-pointer"
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
              />
            ) : (
              <>
                {/* Floating Mode Selection Pill */}
                <div className="flex flex-col items-center justify-center gap-3 my-4">
                  <div
                    className="rounded-2xl border px-4 py-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-mono shadow-sm select-none"
                    style={{
                      backgroundColor: '#F6F5EF',
                      borderColor: '#315C45',
                      color: '#315C45',
                    }}
                  >
                    {/* Punctuation & Numbers */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setPunctuation(!punctuation);
                          handleRestart();
                        }}
                        className={`flex items-center gap-1 cursor-pointer transition-colors ${
                          punctuation
                            ? 'bg-[#315C45] text-[#F6F5EF] px-2 py-0.5 rounded font-bold'
                            : 'hover:text-[#B59B7A]'
                        }`}
                      >
                        <span>@</span>
                        <span>punctuation</span>
                      </button>

                      <button
                        onClick={() => {
                          setNumbers(!numbers);
                          handleRestart();
                        }}
                        className={`flex items-center gap-1 cursor-pointer transition-colors ${
                          numbers
                            ? 'bg-[#315C45] text-[#F6F5EF] px-2 py-0.5 rounded font-bold'
                            : 'hover:text-[#B59B7A]'
                        }`}
                      >
                        <span>#</span>
                        <span>numbers</span>
                      </button>
                    </div>

                    <div className="w-[2px] h-3 rounded-full bg-[#315C45] hidden sm:block" />

                    {/* Mode Types */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        onClick={() => {
                          setTestMode('time');
                          handleRestart();
                        }}
                        className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                          testMode === 'time'
                            ? 'bg-[#315C45] text-[#F6F5EF] px-2 py-0.5 rounded font-bold'
                            : 'hover:text-[#B59B7A]'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>time</span>
                      </button>

                      <button
                        onClick={() => {
                          setTestMode('words');
                          handleRestart();
                        }}
                        className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                          testMode === 'words'
                            ? 'bg-[#315C45] text-[#F6F5EF] px-2 py-0.5 rounded font-bold'
                            : 'hover:text-[#B59B7A]'
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>words</span>
                      </button>

                      <button
                        onClick={() => {
                          setTestMode('quote');
                          handleRestart();
                        }}
                        className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                          testMode === 'quote'
                            ? 'bg-[#315C45] text-[#F6F5EF] px-2 py-0.5 rounded font-bold'
                            : 'hover:text-[#B59B7A]'
                        }`}
                      >
                        <Quote className="w-3.5 h-3.5" />
                        <span>quote</span>
                      </button>

                      <button
                        onClick={() => {
                          setTestMode('code');
                          handleRestart();
                        }}
                        className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                          testMode === 'code'
                            ? 'bg-[#315C45] text-[#F6F5EF] px-2 py-0.5 rounded font-bold'
                            : 'hover:text-[#B59B7A]'
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>code</span>
                      </button>

                      <button
                        onClick={() => {
                          setTestMode('custom');
                          handleRestart();
                        }}
                        className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                          testMode === 'custom'
                            ? 'bg-[#315C45] text-[#F6F5EF] px-2 py-0.5 rounded font-bold'
                            : 'hover:text-[#B59B7A]'
                        }`}
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>custom</span>
                      </button>
                    </div>

                    <div className="w-[2px] h-3 rounded-full bg-[#315C45] hidden sm:block" />

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
                              className={`cursor-pointer transition-colors ${
                                timeDuration === dur
                                  ? 'bg-[#315C45] text-[#F6F5EF] px-1.5 py-0.5 rounded font-bold'
                                  : 'hover:text-[#B59B7A]'
                              }`}
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
                              className={`cursor-pointer transition-colors ${
                                wordCount === cnt
                                  ? 'bg-[#315C45] text-[#F6F5EF] px-1.5 py-0.5 rounded font-bold'
                                  : 'hover:text-[#B59B7A]'
                              }`}
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
                              className={`capitalize cursor-pointer transition-colors ${
                                quoteLength === ql
                                  ? 'bg-[#315C45] text-[#F6F5EF] px-1.5 py-0.5 rounded font-bold'
                                  : 'hover:text-[#B59B7A]'
                              }`}
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
                              className={`capitalize cursor-pointer transition-colors ${
                                codeLang === lang
                                  ? 'bg-[#315C45] text-[#F6F5EF] px-1.5 py-0.5 rounded font-bold'
                                  : 'hover:text-[#B59B7A]'
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sub-bar below pill */}
                  <div className="flex items-center gap-6 text-xs text-[#315C45] font-mono select-none font-bold">
                    <button
                      onClick={() => {
                        setTestLang(testLang === 'en' ? 'fa' : 'en');
                        handleRestart();
                      }}
                      className="flex items-center gap-1.5 hover:text-[#B59B7A] transition-colors cursor-pointer"
                      title="Switch test language"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{testLang === 'en' ? 'english' : 'فارسی'}</span>
                    </button>

                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-[#B59B7A]">daily pace:</span>
                      <span className="text-[#315C45] font-bold">
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
            <div className="w-full mt-4">
              <LiveKeyRhythm
                activeKeyCode={activeKeyCode}
                keyStats={keyStats}
                wpm={wpm}
                streak={streak}
                burstWpm={burstWpm}
                instantLatency={instantLatency}
                lastKeystrokeTime={lastKeystrokeTime}
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
              />
            ) : (
              <div
                className="p-12 rounded-3xl border text-center space-y-4 shadow-sm"
                style={{
                  backgroundColor: '#F6F5EF',
                  borderColor: '#315C45',
                  color: '#315C45',
                }}
              >
                <div className="text-4xl">⚡</div>
                <h3 className="text-2xl font-bold tracking-tight text-[#315C45]">
                  NO TELEMETRY DATA LOGGED YET
                </h3>
                <p className="text-sm text-[#B59B7A] max-w-md mx-auto font-bold">
                  Complete your first test session in the Engine to generate multi-dimensional keystroke latency,
                  finger load distribution, and error typology diagnostics.
                </p>
                <button
                  onClick={() => setActiveTab('engine')}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 border cursor-pointer"
                  style={{
                    backgroundColor: '#315C45',
                    borderColor: '#B59B7A',
                    color: '#F6F5EF',
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
                  backgroundColor: '#315C45',
                  borderColor: '#B59B7A',
                  color: '#F6F5EF',
                }}
              >
                <span className="text-xs uppercase tracking-wider opacity-80 font-bold">
                  Peak Velocity
                </span>
                <div className="text-5xl font-extrabold mt-1">
                  {bestWpm} <span className="text-sm opacity-75 font-normal">WPM</span>
                </div>
              </div>

              <div
                className="p-6 rounded-2xl border shadow-sm"
                style={{
                  backgroundColor: '#315C45',
                  borderColor: '#B59B7A',
                  color: '#F6F5EF',
                }}
              >
                <span className="text-xs uppercase tracking-wider opacity-80 font-bold">
                  Historical Average
                </span>
                <div className="text-5xl font-extrabold mt-1">
                  {avgWpm} <span className="text-sm opacity-75 font-normal">WPM</span>
                </div>
              </div>

              <div
                className="p-6 rounded-2xl border shadow-sm"
                style={{
                  backgroundColor: '#315C45',
                  borderColor: '#B59B7A',
                  color: '#F6F5EF',
                }}
              >
                <span className="text-xs uppercase tracking-wider opacity-80 font-bold">
                  Total Runs Logged
                </span>
                <div className="text-5xl font-extrabold mt-1">
                  {history.length}
                </div>
              </div>
            </div>

            {/* History Table */}
            <div
              className="rounded-2xl border overflow-hidden shadow-sm"
              style={{
                backgroundColor: '#315C45',
                borderColor: '#B59B7A',
                color: '#F6F5EF',
              }}
            >
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: '#B59B7A' }}
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
                    className="text-xs text-[#B59B7A] hover:underline transition-colors uppercase font-bold cursor-pointer"
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
                        backgroundColor: '#F6F5EF',
                        color: '#315C45',
                        borderColor: '#315C45',
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
                    <tbody className="divide-y divide-[#B59B7A]/30">
                      {history.map((h) => (
                        <tr
                          key={h.id}
                          className="transition hover:bg-black/10"
                        >
                          <td className="p-3.5 opacity-80">
                            {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3.5 uppercase font-bold text-[#B59B7A]">
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
                              className="px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer border"
                              style={{
                                backgroundColor: '#315C45',
                                borderColor: '#B59B7A',
                                color: '#F6F5EF',
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
      {/* 3. FOOTER                                                     */}
      {/* ------------------------------------------------------------- */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 mt-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#315C45] select-none font-bold">
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <button
            onClick={() => setShowDesktopModal(true)}
            className="hover:text-[#B59B7A] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>contact</span>
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#B59B7A] transition-colors flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>support</span>
          </a>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#B59B7A] transition-colors flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            <span>github</span>
          </a>

          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#B59B7A] transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>discord</span>
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#B59B7A] transition-colors flex items-center gap-1.5"
          >
            <Twitter className="w-3.5 h-3.5" />
            <span>twitter</span>
          </a>

          <span className="hover:text-[#B59B7A] transition-colors cursor-pointer">terms</span>
          <span className="hover:text-[#B59B7A] transition-colors cursor-pointer">security</span>
          <span className="hover:text-[#B59B7A] transition-colors cursor-pointer">privacy</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {currentUser && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#315C45] border border-[#B59B7A] inline-block" />
              {currentUser.email}
            </span>
          )}
          <span className="text-[#B59B7A]">v26.32.0</span>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODALS (AUTH, PROFILE, SETTINGS & DESKTOP APP)             */}
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
      />

      <UserProfileModal
        isOpen={showProfileModal}
        user={currentUser}
        onClose={() => setShowProfileModal(false)}
        onLogout={() => {
          clearSession();
          setCurrentUser(null);
          setShowProfileModal(false);
          setShowAuthModal(true);
        }}
        appLang={appLang}
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
      />
    </div>
  );
}
