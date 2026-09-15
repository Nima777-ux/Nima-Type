import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  TestMode,
  TimeDuration,
  WordCount,
  QuoteLength,
  CodeLanguage,
  TestResult,
  WpmPoint,
  KeystrokeEvent,
  AppLanguage,
  ThemeMode,
  ColorTheme,
} from '../types';
import { getRandomWords, getRandomQuote, getRandomCodeSnippet } from '../utils/wordGenerator';
import { soundEngine } from '../utils/audio';
import { getFingerForKey, classifyError } from '../utils/fingerMapping';
import { calculateAdvancedMetrics } from '../utils/metricsCalculator';
import { translations } from '../utils/translations';
import { THEMES } from '../utils/themeConfig';

interface TypingAreaProps {
  testMode: TestMode;
  timeDuration: TimeDuration;
  wordCount: WordCount;
  quoteLength: QuoteLength;
  codeLang: CodeLanguage;
  punctuation: boolean;
  numbers: boolean;
  customText: string;
  onKeypress: (code: string, key: string) => void;
  onUpdateMetrics: (
    wpm: number,
    rawWpm: number,
    accuracy: number,
    streak: number,
    burst: number,
    instantLatency?: number,
    consistency?: number
  ) => void;
  onKeyStatsUpdate?: (stats: Record<string, { total: number; errors: number; totalLatencyMs: number }>) => void;
  onTestComplete: (result: TestResult) => void;
  isTestActive: boolean;
  setIsTestActive: (active: boolean) => void;
  resetTrigger: number;
  onRestart: () => void;
  testLang?: AppLanguage;
  appLang?: AppLanguage;
  themeMode?: ThemeMode;
  theme?: ColorTheme;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  testMode,
  timeDuration,
  wordCount,
  quoteLength,
  codeLang,
  punctuation,
  numbers,
  customText,
  onKeypress,
  onUpdateMetrics,
  onKeyStatsUpdate,
  onTestComplete,
  isTestActive,
  setIsTestActive,
  resetTrigger,
  onRestart,
  testLang = 'en',
  appLang = 'en',
  themeMode = 'dark',
  theme = 'warm_amber',
}) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedHistory, setTypedHistory] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  // Stats tracking
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [peakStreak, setPeakStreak] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [errorKeystrokes, setErrorKeystrokes] = useState(0);
  const [keyStats, setKeyStats] = useState<Record<string, { total: number; errors: number; totalLatencyMs: number }>>({});
  const keyStatsRef = useRef<Record<string, { total: number; errors: number; totalLatencyMs: number }>>({});
  const [timeline, setTimeline] = useState<WpmPoint[]>([]);

  // Keystroke latency and biometrics tracking
  const lastKeyTimestampRef = useRef<number | null>(null);
  const keystrokeEventsRef = useRef<KeystrokeEvent[]>([]);
  const recentKeystrokesRef = useRef<{ time: number; count: number }[]>([]);
  const lastInstantLatencyRef = useRef<number>(120);

  // DOM elements
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement | null>(null);
  const [caretPos, setCaretPos] = useState<{ left: number; top: number; height: number }>({
    left: 0,
    top: 0,
    height: 28,
  });
  const [quoteMeta, setQuoteMeta] = useState<{ text: string; source: string } | null>(null);

  const t = translations[appLang];
  const isTestRTL = testLang === 'fa';
  const isDark = themeMode === 'dark';
  const activeTestLang: AppLanguage = (testLang === 'fa' ? 'fa' : 'en');
  const currentTheme = THEMES[theme] || THEMES.nima_custom;
  const themeStyle = isDark ? currentTheme.dark : currentTheme.light;

  // Initialize test text
  const initializeTest = useCallback(() => {
    let initialWords: string[] = [];
    if (testMode === 'time') {
      initialWords = getRandomWords(160, punctuation, numbers, activeTestLang);
    } else if (testMode === 'words') {
      initialWords = getRandomWords(wordCount, punctuation, numbers, activeTestLang);
    } else if (testMode === 'quote') {
      const q = getRandomQuote(quoteLength, activeTestLang);
      setQuoteMeta(q);
      initialWords = q.text.split(' ');
    } else if (testMode === 'code') {
      const snippet = getRandomCodeSnippet(codeLang);
      initialWords = snippet.split(/\s+/).filter(Boolean);
    } else if (testMode === 'custom') {
      const fallback = activeTestLang === 'fa' 
        ? 'بنی‌آدم اعضای یکدیگرند که در آفرینش ز یک گوهرند.'
        : 'The quick brown fox jumps over the lazy dog.';
      initialWords = (customText.trim() || fallback).split(/\s+/);
    }

    setWords(initialWords);
    setCurrentWordIndex(0);
    setTypedHistory([]);
    setCurrentInput('');
    setStartTime(null);
    setElapsedSeconds(0);
    setLiveWpm(0);
    setCurrentStreak(0);
    setPeakStreak(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setErrorKeystrokes(0);
    setKeyStats({});
    keyStatsRef.current = {};
    setTimeline([]);
    keystrokeEventsRef.current = [];
    lastKeyTimestampRef.current = null;
    recentKeystrokesRef.current = [];

    if (wordsContainerRef.current) {
      wordsContainerRef.current.scrollTop = 0;
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [testMode, wordCount, quoteLength, codeLang, punctuation, numbers, customText, testLang]);

  // Reset when configuration changes or resetTrigger fires
  useEffect(() => {
    initializeTest();
  }, [initializeTest, resetTrigger]);

  // Keep input focused on window click or container click
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Test completion calculation
  const finishTest = useCallback(() => {
    setIsTestActive(false);

    const duration = startTime ? Math.max(1, (Date.now() - startTime) / 1000) : 1;
    const finalAccuracy = totalKeystrokes > 0 ? (correctKeystrokes / totalKeystrokes) * 100 : 100;

    // Calculate standard Net WPM
    let totalCorrectChars = 0;
    typedHistory.forEach((word, idx) => {
      const target = words[idx];
      if (word === target) {
        totalCorrectChars += word.length + 1; // including space
      }
    });
    // Add current input correct characters
    const targetWord = words[currentWordIndex] || '';
    if (currentInput === targetWord) {
      totalCorrectChars += currentInput.length;
    }

    const netWpm = Math.max(0, Math.round((totalCorrectChars / 5) / (duration / 60)));
    const rawWpm = Math.max(0, Math.round(((totalKeystrokes) / 5) / (duration / 60)));

    // Multi-dimensional Biometrics Calculation
    const advancedMetrics = calculateAdvancedMetrics(keystrokeEventsRef.current, timeline);

    const modeDetail =
      testMode === 'time' ? `${timeDuration}s` :
      testMode === 'words' ? `${wordCount}w` :
      testMode === 'quote' ? `quote (${quoteLength})` :
      testMode === 'code' ? `code (${codeLang})` : 'custom';

    const result: TestResult = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      timestamp: Date.now(),
      wpm: netWpm,
      rawWpm,
      accuracy: Math.round(finalAccuracy),
      consistency: advancedMetrics.consistencyScore,
      durationSeconds: Math.round(duration),
      testMode,
      modeDetail,
      characters: {
        correct: correctKeystrokes,
        incorrect: errorKeystrokes,
        extra: 0,
        missed: 0,
        total: totalKeystrokes,
      },
      keyStats,
      timeline,
      highestStreak: peakStreak,
      advancedMetrics,
    };

    onTestComplete(result);
  }, [
    startTime,
    totalKeystrokes,
    correctKeystrokes,
    errorKeystrokes,
    typedHistory,
    words,
    currentWordIndex,
    currentInput,
    timeline,
    testMode,
    peakStreak,
    setIsTestActive,
    onTestComplete,
  ]);

  // Timer Tick (100ms interval for ultra-smooth WPM calculation)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTestActive && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const duration = (now - startTime) / 1000;
        setElapsedSeconds(duration);

        // Calculate rolling Net WPM
        let totalChars = 0;
        typedHistory.forEach((word, idx) => {
          if (word === words[idx]) {
            totalChars += word.length + 1;
          }
        });
        if (currentInput === words[currentWordIndex]) {
          totalChars += currentInput.length;
        }

        const liveNetWpm = duration > 0 ? Math.max(0, Math.round((totalChars / 5) / (duration / 60))) : 0;
        const liveRawWpm = duration > 0 ? Math.max(0, Math.round((totalKeystrokes / 5) / (duration / 60))) : 0;
        const liveAccuracy = totalKeystrokes > 0 ? (correctKeystrokes / totalKeystrokes) * 100 : 100;

        // Calculate recent burst WPM (last 1.5s keystrokes)
        const recentThreshold = now - 1500;
        recentKeystrokesRef.current = recentKeystrokesRef.current.filter((k) => k.time > recentThreshold);
        const burstChars = recentKeystrokesRef.current.reduce((acc, curr) => acc + curr.count, 0);
        const burstWpm = Math.round((burstChars / 5) / (1.5 / 60));

        // Estimate live rhythmic consistency
        let liveConsistency = 100;
        if (keystrokeEventsRef.current.length > 5) {
          const latencies = keystrokeEventsRef.current.slice(-15).map((e) => e.latencyMs).filter((l) => l > 0);
          if (latencies.length > 3) {
            const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
            const variance = latencies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / latencies.length;
            const stdDev = Math.sqrt(variance);
            const cov = mean > 0 ? stdDev / mean : 0;
            liveConsistency = Math.max(10, Math.min(100, Math.round(100 - cov * 80)));
          }
        }

        setLiveWpm(liveNetWpm);

        onUpdateMetrics(
          liveNetWpm,
          liveRawWpm,
          liveAccuracy,
          currentStreak,
          burstWpm,
          lastInstantLatencyRef.current,
          liveConsistency
        );

        // Record timeline point once every second
        if (Math.floor(duration) > timeline.length) {
          setTimeline((prev) => [
            ...prev,
            {
              second: Math.floor(duration),
              wpm: liveNetWpm,
              rawWpm: liveRawWpm,
              errors: errorKeystrokes,
              accuracy: Math.round(liveAccuracy),
            },
          ]);
        }

        // Auto-end for 'time' mode
        if (testMode === 'time' && duration >= timeDuration) {
          finishTest();
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isTestActive,
    startTime,
    typedHistory,
    words,
    currentWordIndex,
    currentInput,
    totalKeystrokes,
    correctKeystrokes,
    errorKeystrokes,
    currentStreak,
    timeline.length,
    testMode,
    timeDuration,
    finishTest,
    onUpdateMetrics,
  ]);

  // Keystroke Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Check Tab key for instant retest
    if (e.key === 'Tab') {
      e.preventDefault();
      onRestart();
      return;
    }

    // Forward keypress for 3D visualizer animation
    onKeypress(e.code, e.key);

    // Ignore navigation/meta keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape'].includes(e.key)) {
      return;
    }

    const now = Date.now();

    // Start timer on first keystroke
    if (!isTestActive && !startTime) {
      setIsTestActive(true);
      setStartTime(now);
    }

    // Measure keystroke flight latency (inter-keystroke interval)
    let latencyMs = 0;
    if (lastKeyTimestampRef.current) {
      latencyMs = Math.min(2000, Math.max(10, now - lastKeyTimestampRef.current));
      lastInstantLatencyRef.current = latencyMs;
    }
    lastKeyTimestampRef.current = now;

    const targetWord = words[currentWordIndex] || '';
    const finger = getFingerForKey(e.code, e.key);

    // Handle Spacebar (advance to next word)
    if (e.key === ' ') {
      e.preventDefault();
      if (currentInput.length === 0) return;

      soundEngine.playKey(' ', true);
      recentKeystrokesRef.current.push({ time: now, count: 1 });

      // Record keystroke event
      keystrokeEventsRef.current.push({
        key: ' ',
        code: 'Space',
        expected: ' ',
        timestamp: now,
        latencyMs,
        isCorrect: currentInput === targetWord,
        finger: 'thumb',
      });

      const newHistory = [...typedHistory, currentInput];
      setTypedHistory(newHistory);
      setCurrentInput('');

      if (currentWordIndex + 1 >= words.length) {
        finishTest();
      } else {
        setCurrentWordIndex((prev) => prev + 1);
      }
      return;
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      soundEngine.playKey('Backspace', false);

      keystrokeEventsRef.current.push({
        key: 'Backspace',
        code: 'Backspace',
        expected: '',
        timestamp: now,
        latencyMs,
        isCorrect: false,
        finger: 'right_pinky',
        errorType: 'intrusion',
      });

      if (currentInput.length > 0) {
        setCurrentInput((prev) => prev.slice(0, -1));
      } else if (currentWordIndex > 0) {
        const prevWord = typedHistory[currentWordIndex - 1];
        if (prevWord !== undefined) {
          setCurrentInput(prevWord);
          setCurrentWordIndex((prev) => prev - 1);
          setTypedHistory((prev) => prev.slice(0, -1));
        }
      }
      return;
    }

    // Printable character
    if (e.key.length === 1) {
      const charIndex = currentInput.length;
      const expectedChar = targetWord[charIndex] || '';
      const nextExpected = targetWord[charIndex + 1];
      const isCorrect = expectedChar === e.key;

      const errorType = isCorrect ? undefined : classifyError(e.key, expectedChar, nextExpected);

      if (isCorrect) {
        soundEngine.playKey(e.key, false);
        setCorrectKeystrokes((prev) => prev + 1);
        setCurrentStreak((prev) => {
          const next = prev + 1;
          setPeakStreak((currPeak) => Math.max(currPeak, next));
          return next;
        });
      } else {
        soundEngine.playError();
        setErrorKeystrokes((prev) => prev + 1);
        setCurrentStreak(0);
      }

      // Record keystroke event
      keystrokeEventsRef.current.push({
        key: e.key,
        code: e.code,
        expected: expectedChar,
        timestamp: now,
        latencyMs,
        isCorrect,
        finger,
        errorType,
      });

      // Update key stats map safely
      const normalizedKey = e.key.toLowerCase();
      const prevEntry = keyStatsRef.current[normalizedKey] || { total: 0, errors: 0, totalLatencyMs: 0 };
      const updatedEntry = {
        total: prevEntry.total + 1,
        errors: prevEntry.errors + (isCorrect ? 0 : 1),
        totalLatencyMs: prevEntry.totalLatencyMs + latencyMs,
      };
      keyStatsRef.current = {
        ...keyStatsRef.current,
        [normalizedKey]: updatedEntry,
      };
      setKeyStats(keyStatsRef.current);
      if (onKeyStatsUpdate) {
        onKeyStatsUpdate(keyStatsRef.current);
      }

      setTotalKeystrokes((prev) => prev + 1);
      recentKeystrokesRef.current.push({ time: now, count: 1 });
      setCurrentInput((prev) => prev + e.key);

      // Finish test if last word matches
      if (
        currentWordIndex === words.length - 1 &&
        currentInput + e.key === targetWord &&
        testMode !== 'time'
      ) {
        setTimeout(() => finishTest(), 50);
      }
    }
  };

  // Update animated caret position (RTL and LTR aware)
  useEffect(() => {
    if (!wordsContainerRef.current) return;
    const containerRect = wordsContainerRef.current.getBoundingClientRect();
    const isRTL = testLang === 'fa';

    if (activeCharRef.current) {
      const charRect = activeCharRef.current.getBoundingClientRect();
      const leftCoord = isRTL
        ? charRect.right - containerRect.left
        : charRect.left - containerRect.left;

      setCaretPos({
        left: leftCoord,
        top: charRect.top - containerRect.top + (wordsContainerRef.current.scrollTop || 0),
        height: charRect.height || 28,
      });

      const relativeTop = charRect.top - containerRect.top;
      if (relativeTop > 130) {
        wordsContainerRef.current.scrollTop += 45;
      }
    } else {
      const activeWordEl = document.getElementById(`word-${currentWordIndex}`);
      if (activeWordEl) {
        const wordRect = activeWordEl.getBoundingClientRect();
        const leftCoord = isRTL
          ? wordRect.left - containerRect.left - 2
          : wordRect.right - containerRect.left + 2;

        setCaretPos({
          left: leftCoord,
          top: wordRect.top - containerRect.top + (wordsContainerRef.current.scrollTop || 0),
          height: wordRect.height || 28,
        });
      }
    }
  }, [currentWordIndex, currentInput, words, testLang]);

  const progressText = useMemo(() => {
    if (testMode === 'time') {
      const left = Math.max(0, Math.ceil(timeDuration - elapsedSeconds));
      return `${left}s`;
    }
    if (testMode === 'words') {
      return `${currentWordIndex} / ${wordCount}`;
    }
    return `${currentWordIndex} / ${words.length}`;
  }, [testMode, timeDuration, elapsedSeconds, currentWordIndex, wordCount, words.length]);

  return (
    <div
      onClick={handleContainerClick}
      className="relative w-full cursor-text overflow-hidden transition-all duration-300 py-6 text-[#F7F4EF]"
    >
      {/* Hidden zero-latency input element */}
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        autoFocus
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Subtle Progress / Timer Indicator (Monkeytype style) */}
      <div className="flex items-center justify-between font-mono mb-4 px-2 select-none">
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-[#315C45]">
            {progressText}
          </span>
          {quoteMeta && (
            <span className="text-xs text-[#B59B7A] truncate max-w-[200px] sm:max-w-md italic hidden md:inline">
              — {quoteMeta.source}
            </span>
          )}
        </div>

        {isTestActive && (
          <div className="text-xs text-[#B59B7A] font-mono flex items-center gap-3 font-bold">
            <span>
              {liveWpm} <span className="opacity-80 text-[10px]">WPM</span>
            </span>
            <span>
              {Math.round(totalKeystrokes > 0 ? (correctKeystrokes / totalKeystrokes) * 100 : 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Words Rendering Canvas with High-Contrast, Crisp Typography */}
      <div
        ref={wordsContainerRef}
        dir={isTestRTL ? 'rtl' : 'ltr'}
        className={`relative z-10 max-h-[220px] overflow-y-auto select-none no-scrollbar transition-all ${
          isTestRTL
            ? 'font-vazirmatn text-2xl sm:text-3xl leading-[2.3] tracking-normal'
            : 'font-mono text-2xl sm:text-3xl leading-[2.2] tracking-wide'
        }`}
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Crisp Smooth Caret in Secondary #315C45 */}
        <div
          className="absolute w-1 rounded-full transition-all duration-75 pointer-events-none bg-[#315C45] shadow-[0_0_8px_rgba(49,92,69,0.7)]"
          style={{
            left: `${caretPos.left}px`,
            top: `${caretPos.top + 2}px`,
            height: `${caretPos.height - 4}px`,
            opacity: !isTestActive ? 0.9 : 1,
          }}
        />

        <div className={`flex flex-wrap ${isTestRTL ? 'gap-x-4 gap-y-2' : 'gap-x-3.5 gap-y-2'}`}>
          {words.map((word, wIdx) => {
            const isCurrentWord = wIdx === currentWordIndex;
            const isPastWord = wIdx < currentWordIndex;
            const pastInput = typedHistory[wIdx] || '';

            // ----------------------------------------------------
            // PERSIAN (RTL) WORD RENDERING:
            // Crucial: Keep whole words and prefixes connected as
            // native cursive strings so letters DO NOT get isolated!
            // ----------------------------------------------------
            if (isTestRTL) {
              if (isPastWord) {
                const isMatch = pastInput === word;
                return (
                  <span
                    id={`word-${wIdx}`}
                    key={wIdx}
                    className={`inline-block whitespace-nowrap px-1.5 py-0.5 rounded-lg transition-colors ${
                      isMatch
                        ? 'text-[#315C45] font-bold'
                        : 'text-[#B59B7A] line-through decoration-[#B59B7A] font-bold'
                    }`}
                  >
                    {word}
                    {pastInput.length > word.length && (
                      <span className="text-[#315C45] font-mono text-base mr-1 font-bold">
                        ({pastInput.slice(word.length)})
                      </span>
                    )}
                  </span>
                );
              }

              if (isCurrentWord) {
                // Determine correctly matched prefix and any mistake
                let matchLen = 0;
                while (
                  matchLen < currentInput.length &&
                  matchLen < word.length &&
                  currentInput[matchLen] === word[matchLen]
                ) {
                  matchLen++;
                }

                const matchedPrefix = word.slice(0, matchLen);
                const hasMistake = currentInput.length > matchLen;
                const mistakeTyped = currentInput.slice(matchLen);
                const remainingSuffix = word.slice(matchLen);

                return (
                  <span
                    id={`word-${wIdx}`}
                    key={wIdx}
                    className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-xl transition-all ${
                      themeStyle.activeWordBg
                    }`}
                  >
                    {matchedPrefix && (
                      <span className={`font-bold ${themeStyle.textPrimary}`}>
                        {matchedPrefix}
                      </span>
                    )}

                    {/* Caret anchor point */}
                    <span ref={activeCharRef} className="inline-block w-0 h-4 opacity-0 pointer-events-none" />

                    {hasMistake && (
                      <span className="text-[#315C45] bg-[#315C45]/20 px-1 rounded mx-0.5 font-bold underline decoration-[#315C45]">
                        {mistakeTyped}
                      </span>
                    )}

                    {remainingSuffix && (
                      <span className={`font-medium ${themeStyle.textUpcoming}`}>
                        {remainingSuffix}
                      </span>
                    )}

                    {/* Extra characters beyond target length */}
                    {currentInput.length > word.length && (
                      <span className="text-[#315C45] bg-[#315C45]/20 px-1 rounded font-mono text-base font-bold mr-1">
                        {currentInput.slice(word.length)}
                      </span>
                    )}
                  </span>
                );
              }

              // Future Persian words: render as intact, connected word with high readability
              return (
                <span
                  id={`word-${wIdx}`}
                  key={wIdx}
                  className={`inline-block whitespace-nowrap px-1.5 py-0.5 rounded-lg font-medium transition-colors ${
                    themeStyle.textUpcoming
                  }`}
                >
                  {word}
                </span>
              );
            }

            // ----------------------------------------------------
            // ENGLISH (LTR) WORD RENDERING
            // ----------------------------------------------------
            return (
              <div
                id={`word-${wIdx}`}
                key={wIdx}
                className={`relative inline-block whitespace-nowrap px-1.5 py-0.5 rounded-lg transition-all ${
                  isCurrentWord
                    ? themeStyle.activeWordBg
                    : isPastWord
                    ? 'opacity-85'
                    : 'opacity-100'
                }`}
              >
                {word.split('').map((char, cIdx) => {
                  let charClass = `${themeStyle.textUpcoming} font-medium`;
                  let isCurrentChar = false;

                  if (isCurrentWord) {
                    if (cIdx < currentInput.length) {
                      const typedChar = currentInput[cIdx];
                      if (typedChar === char) {
                        charClass = `${themeStyle.textPrimary} font-bold drop-shadow-xs`;
                      } else {
                        charClass = 'text-[#315C45] bg-[#315C45]/20 rounded-xs underline decoration-[#315C45] font-bold';
                      }
                    } else if (cIdx === currentInput.length) {
                      isCurrentChar = true;
                      charClass = `${themeStyle.accent} font-bold`;
                    } else {
                      // Remaining untyped char in active word
                      charClass = `${themeStyle.textUpcoming} font-medium`;
                    }
                  } else if (isPastWord) {
                    if (cIdx < pastInput.length) {
                      charClass =
                        pastInput[cIdx] === char
                          ? 'text-[#315C45] font-bold'
                          : 'text-[#B59B7A] line-through decoration-[#B59B7A] font-bold';
                    } else {
                      charClass = 'text-[#315C45]/80 font-bold';
                    }
                  } else {
                    // Future words: high readability!
                    charClass = `${themeStyle.textUpcoming} font-medium`;
                  }

                  return (
                    <span
                      key={cIdx}
                      ref={isCurrentChar ? activeCharRef : undefined}
                      className={`inline transition-colors ${charClass}`}
                    >
                      {char}
                    </span>
                  );
                })}

                {/* Extra typed characters beyond word length */}
                {isCurrentWord && currentInput.length > word.length && (
                  <span className="text-[#315C45] bg-[#315C45]/20 px-1 rounded font-mono text-lg ml-0.5 font-bold">
                    {currentInput.slice(word.length)}
                  </span>
                )}
                {isPastWord && pastInput.length > word.length && (
                  <span className="text-[#315C45]/80 line-through font-mono text-lg ml-0.5 font-bold">
                    {pastInput.slice(word.length)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Centered Restart Button (Photo 1) */}
      <div className="flex flex-col items-center justify-center mt-10 gap-6 select-none">
        <button
          onClick={onRestart}
          type="button"
          className="p-3 text-[#315C45] hover:text-[#F6F5EF] hover:bg-[#315C45] rounded-xl transition-all active:scale-95 cursor-pointer border border-[#315C45]"
          title="Restart Test (Tab + Enter)"
        >
          <svg
            className="w-5 h-5 transition-transform hover:rotate-180 duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        {/* Keyboard Shortcuts Hint */}
        <div className="flex items-center gap-2 text-xs text-[#315C45] font-mono">
          <kbd className="px-2 py-0.5 rounded bg-[#315C45] border border-[#B59B7A] text-[#F6F5EF] font-bold">
            tab
          </kbd>
          <span>&gt;</span>
          <kbd className="px-2 py-0.5 rounded bg-[#315C45] border border-[#B59B7A] text-[#F6F5EF] font-bold">
            enter
          </kbd>
          <span>- restart test</span>
        </div>
      </div>
    </div>
  );
};
