import React, { useMemo } from 'react';
import { ThemeMode } from '../types';
import { getPalette } from '../utils/themeConfig';

interface LiveKeyRhythmProps {
  activeKeyCode: string | null;
  lastKeystrokeTime: number;
  wpm: number;
  streak: number;
  burstWpm: number;
  instantLatency: number;
  keyStats: Record<string, { total: number; errors: number; totalLatencyMs: number }>;
  themeMode?: ThemeMode;
}

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

export const LiveKeyRhythm: React.FC<LiveKeyRhythmProps> = ({
  activeKeyCode,
  streak,
  burstWpm,
  instantLatency,
  keyStats,
  themeMode = 'light',
}) => {
  const p = getPalette(themeMode);

  // Normalize active key for matching
  const activeKeyChar = useMemo(() => {
    if (!activeKeyCode) return null;
    if (activeKeyCode.startsWith('Key')) return activeKeyCode.slice(3).toLowerCase();
    return activeKeyCode.toLowerCase();
  }, [activeKeyCode]);

  return (
    <div
      dir="ltr"
      className="w-full rounded-2xl border p-4 sm:p-5 shadow-sm font-mono select-none"
      style={{
        direction: 'ltr',
        backgroundColor: p.isDark ? '#232E1A' : '#A3B18A',
        borderColor: p.border,
        color: p.isDark ? '#F2E8CF' : '#283618',
      }}
    >
      {/* Top Header: Rhythm indicator */}
      <div className="flex items-center justify-between mb-3 text-xs" dir="ltr">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: p.isDark ? '#A3B18A' : '#283618' }}
          />
          <span className="font-bold tracking-wide">
            Live Rhythm & Keystroke Matrix
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border flex items-center gap-1.5"
            style={{
              backgroundColor: p.isDark ? '#1C2515' : '#EDE8F3',
              borderColor: p.border,
              color: p.text,
              boxShadow: p.tubelightGlow,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
            Sigma
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="opacity-80">Burst:</span>
            <span>{burstWpm} WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-80">Latency:</span>
            <span>{instantLatency > 0 ? `${instantLatency}ms` : '<5ms'}</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="opacity-80">Streak:</span>
            <span>{streak}</span>
          </div>
        </div>
      </div>

      {/* Flat Minimal Virtual Matrix - strictly LTR */}
      <div dir="ltr" className="flex flex-col items-center gap-1.5 py-1 select-none" style={{ direction: 'ltr' }}>
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} dir="ltr" className="flex flex-row gap-1 sm:gap-1.5 justify-center w-full" style={{ direction: 'ltr' }}>
            {row.map((k) => {
              const isActive = activeKeyChar === k;
              const stat = keyStats[k];
              const hasErrors = stat && stat.errors > 0;

              return (
                <div
                  key={k}
                  dir="ltr"
                  className="relative flex items-center justify-center rounded-lg uppercase font-mono text-xs sm:text-sm font-bold transition-all duration-75 border"
                  style={{
                    direction: 'ltr',
                    width: 'clamp(28px, 6.5vw, 42px)',
                    height: 'clamp(32px, 6.5vw, 38px)',
                    backgroundColor: isActive
                      ? (p.isDark ? '#38BDF8' : '#EDE8F3')
                      : hasErrors
                      ? (p.isDark ? '#4A1D1D' : '#EDE8F3')
                      : (p.isDark ? '#1C2515' : '#F2E8CF'),
                    borderColor: isActive ? '#38BDF8' : p.border,
                    color: isActive && p.isDark ? '#0F172A' : p.text,
                    transform: isActive ? 'scale(1.08)' : 'none',
                    boxShadow: isActive ? p.tubelightGlow : undefined,
                  }}
                >
                  {k}

                  {/* Tiny indicator dot for error tracking */}
                  {hasErrors && (
                    <span
                      className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: p.primary }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer subtle tip */}
      <div
        dir="ltr"
        className="mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] font-bold"
        style={{ borderColor: p.border, direction: 'ltr' }}
      >
        <span>Zero-latency 2D input matrix</span>
        <span className="font-mono opacity-80">Keys illuminate dynamically</span>
      </div>
    </div>
  );
};
