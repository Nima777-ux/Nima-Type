import React, { useMemo } from 'react';

interface LiveKeyRhythmProps {
  activeKeyCode: string | null;
  lastKeystrokeTime: number;
  wpm: number;
  streak: number;
  burstWpm: number;
  instantLatency: number;
  keyStats: Record<string, { total: number; errors: number; totalLatencyMs: number }>;
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
}) => {
  // Normalize active key for matching
  const activeKeyChar = useMemo(() => {
    if (!activeKeyCode) return null;
    if (activeKeyCode.startsWith('Key')) return activeKeyCode.slice(3).toLowerCase();
    return activeKeyCode.toLowerCase();
  }, [activeKeyCode]);

  return (
    <div
      className="w-full rounded-2xl border p-4 sm:p-5 shadow-sm font-mono select-none"
      style={{
        backgroundColor: '#B59B7A', // Primary
        borderColor: '#315C45', // Secondary
        color: '#F6F5EF', // Third
      }}
    >
      {/* Top Header: Rhythm indicator */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#315C45] animate-pulse" />
          <span className="font-bold tracking-wide text-[#315C45]">
            Live Rhythm & Keystroke Matrix
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#315C45] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="opacity-80 text-[#F6F5EF]">Burst:</span>
            <span>{burstWpm} WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-80 text-[#F6F5EF]">Latency:</span>
            <span>{instantLatency > 0 ? `${instantLatency}ms` : '<5ms'}</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="opacity-80 text-[#F6F5EF]">Streak:</span>
            <span>{streak}</span>
          </div>
        </div>
      </div>

      {/* Flat Minimal Virtual Matrix */}
      <div className="flex flex-col items-center gap-1.5 py-1 select-none">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1 sm:gap-1.5 justify-center w-full">
            {row.map((k) => {
              const isActive = activeKeyChar === k;
              const stat = keyStats[k];
              const hasErrors = stat && stat.errors > 0;

              return (
                <div
                  key={k}
                  className="relative flex items-center justify-center rounded-lg uppercase font-mono text-xs sm:text-sm font-bold transition-all duration-75 border"
                  style={{
                    width: 'clamp(28px, 6.5vw, 42px)',
                    height: 'clamp(32px, 6.5vw, 38px)',
                    backgroundColor: isActive
                      ? '#315C45'
                      : hasErrors
                      ? '#315C45'
                      : '#F6F5EF',
                    borderColor: '#315C45',
                    color: isActive || hasErrors ? '#F6F5EF' : '#315C45',
                    transform: isActive ? 'scale(1.06)' : 'none',
                  }}
                >
                  {k}

                  {/* Tiny indicator dot for error tracking */}
                  {hasErrors && (
                    <span
                      className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: '#B59B7A' }}
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
        className="mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] text-[#315C45] font-bold"
        style={{ borderColor: '#315C45' }}
      >
        <span>Zero-latency 2D input matrix</span>
        <span className="font-mono text-[#F6F5EF]">Keys illuminate dynamically</span>
      </div>
    </div>
  );
};
