import React, { useState } from 'react';
import { AdvancedMetrics, FingerName, ThemeMode } from '../types';
import { FINGER_NAMES } from '../utils/fingerMapping';
import { getPalette } from '../utils/themeConfig';

interface AdvancedMetricsDashboardProps {
  metrics: AdvancedMetrics;
  wpm: number;
  accuracy: number;
  highestStreak: number;
  onClose?: () => void;
  themeMode?: ThemeMode;
}

export const AdvancedMetricsDashboard: React.FC<AdvancedMetricsDashboardProps> = ({
  metrics,
  wpm,
  onClose,
  themeMode = 'light',
}) => {
  const p = getPalette(themeMode);
  const [selectedFinger, setSelectedFinger] = useState<FingerName | null>(null);

  const totalErrors =
    (metrics.errorDistribution.substitution || 0) +
    (metrics.errorDistribution.transposition || 0) +
    (metrics.errorDistribution.case || 0) +
    (metrics.errorDistribution.intrusion || 0) +
    (metrics.errorDistribution.omission || 0);

  const maxHistoCount = Math.max(1, ...metrics.latencyHistogram.map((h) => h.count));

  const displayBurstWpm =
    typeof metrics.burstWpm === 'number'
      ? metrics.burstWpm
      : typeof wpm === 'number'
      ? wpm
      : 0;

  return (
    <div
      className="w-full flex flex-col gap-6 font-mono select-none"
      style={{
        backgroundColor: p.cardBg,
        color: p.text,
      }}
    >
      {/* Header */}
      <div
        className="flex flex-wrap items-center justify-between border-b pb-4"
        style={{ borderColor: p.border }}
      >
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: p.text }}>
              TELEMETRY ARCHIVE
            </h2>
            <span
              className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border"
              style={{
                backgroundColor: p.isDark ? '#232E1A' : '#EDE8F3',
                borderColor: p.border,
                color: p.text,
              }}
            >
              DIAGNOSTIC ACTIVE
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider mt-1 font-bold" style={{ color: p.textMuted }}>
            Multi-Dimensional Keystroke Latency & Biometric Load
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="tubelight-btn px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border cursor-pointer"
            style={{
              backgroundColor: p.primary,
              borderColor: p.border,
              color: p.activeBtnText,
              boxShadow: p.tubelightGlow,
            }}
          >
            Close Telemetry
          </button>
        )}
      </div>

      {/* Top 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Keystroke Latency */}
        <div
          className="rounded-2xl p-5 border shadow-sm relative overflow-hidden transition-all"
          style={{
            backgroundColor: p.isDark ? '#232E1A' : '#EDE8F3',
            borderColor: p.border,
            color: p.text,
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1" style={{ color: p.textMuted }}>
            Mean Keystroke Flight
          </p>
          <div className="text-3xl sm:text-4xl font-extrabold leading-none flex items-baseline gap-1" style={{ color: p.text }}>
            {metrics.meanLatencyMs}
            <span className="text-xs opacity-75 font-normal">ms</span>
          </div>
          <p className="text-xs opacity-80 mt-3" style={{ color: p.textMuted }}>
            Jitter: <span className="font-bold" style={{ color: p.text }}>{metrics.latencyJitterMs}ms</span>
          </p>
          <div className="mt-2.5 h-2 bg-[#A3B18A]/30 rounded-full w-full overflow-hidden">
            <div
              className="h-full bg-[#A3B18A] rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(10, 100 - metrics.meanLatencyMs / 3))}%` }}
            />
          </div>
        </div>

        {/* Stat 2: Consistency Score */}
        <div
          className="rounded-2xl p-5 border shadow-sm relative overflow-hidden transition-all"
          style={{
            backgroundColor: p.isDark ? '#232E1A' : '#EDE8F3',
            borderColor: p.border,
            color: p.text,
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1" style={{ color: p.textMuted }}>
            Rhythmic Consistency
          </p>
          <div className="text-3xl sm:text-4xl font-extrabold leading-none flex items-baseline gap-1" style={{ color: p.text }}>
            {metrics.consistencyScore}
            <span className="text-xs opacity-75 font-normal">%</span>
          </div>
          <p className="text-xs opacity-80 mt-3" style={{ color: p.textMuted }}>
            Cadence:{' '}
            <span className="font-bold" style={{ color: p.text }}>
              {metrics.consistencyScore > 80 ? 'EXEMPLARY' : 'STABLE'}
            </span>
          </p>
          <div className="mt-2.5 h-2 bg-[#A3B18A]/30 rounded-full w-full overflow-hidden">
            <div
              className="h-full bg-[#A3B18A] rounded-full transition-all"
              style={{ width: `${metrics.consistencyScore}%` }}
            />
          </div>
        </div>

        {/* Stat 3: Peak Burst Speed */}
        <div
          className="rounded-2xl p-5 border shadow-sm relative overflow-hidden transition-all"
          style={{
            backgroundColor: p.isDark ? '#232E1A' : '#EDE8F3',
            borderColor: p.border,
            color: p.text,
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1" style={{ color: p.textMuted }}>
            Burst Frequency
          </p>
          <div className="text-3xl sm:text-4xl font-extrabold leading-none flex items-baseline gap-1" style={{ color: p.text }}>
            {displayBurstWpm}
            <span className="text-xs opacity-75 font-normal">wpm</span>
          </div>
          <p className="text-xs opacity-80 mt-3" style={{ color: p.textMuted }}>
            Sustained Speed: <span className="font-bold" style={{ color: p.text }}>{wpm} WPM</span>
          </p>
          <div className="mt-2.5 h-2 bg-[#A3B18A]/30 rounded-full w-full overflow-hidden">
            <div
              className="h-full bg-[#A3B18A] rounded-full transition-all"
              style={{ width: `${Math.min(100, (displayBurstWpm / 160) * 100)}%` }}
            />
          </div>
        </div>

        {/* Stat 4: Hand Balance */}
        <div
          className="rounded-2xl p-5 border shadow-sm relative overflow-hidden transition-all"
          style={{
            backgroundColor: p.isDark ? '#232E1A' : '#EDE8F3',
            borderColor: p.border,
            color: p.text,
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1" style={{ color: p.textMuted }}>
            Bilateral Hand Balance
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold leading-none flex items-baseline gap-2" style={{ color: p.text }}>
            <span>{metrics.handBalance.leftPercent}%</span>
            <span className="text-xs opacity-75">L /</span>
            <span>{metrics.handBalance.rightPercent}%</span>
            <span className="text-xs opacity-75">R</span>
          </div>
          <p className="text-xs opacity-80 mt-3" style={{ color: p.textMuted }}>
            Thumb Load: <span className="font-bold" style={{ color: p.text }}>{metrics.handBalance.thumbPercent}%</span>
          </p>
          <div className="mt-2.5 h-2 bg-[#A3B18A]/30 rounded-full w-full flex overflow-hidden">
            <div className="bg-[#A3B18A] h-full" style={{ width: `${metrics.handBalance.leftPercent}%` }} />
            <div className="bg-[#586B54] h-full" style={{ width: `${metrics.handBalance.thumbPercent}%` }} />
            <div className="bg-[#A3B18A] h-full" style={{ width: `${metrics.handBalance.rightPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Main Grid: Finger Biometric Distribution & Latency Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section (7 cols): Finger Distribution */}
        <div
          className="lg:col-span-7 rounded-2xl p-6 border shadow-sm flex flex-col gap-5"
          style={{
            backgroundColor: p.isDark ? '#232E1A' : '#EDE8F3',
            borderColor: p.border,
            color: p.text,
          }}
        >
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: p.border }}>
            <div>
              <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2" style={{ color: p.text }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.primary }} />
                Finger Load & Accuracy Distribution
              </h3>
              <p className="text-[11px] opacity-80 mt-0.5" style={{ color: p.textMuted }}>
                Anatomical keystroke attribution & error concentration
              </p>
            </div>
            <span
              className="text-[10px] font-bold px-3 py-1 rounded-full border"
              style={{
                backgroundColor: p.isDark ? '#1C2515' : '#F2E8CF',
                borderColor: p.border,
                color: p.text,
              }}
            >
              9 REGIONS
            </span>
          </div>

          {/* Interactive Finger Bars Grid */}
          <div className="space-y-2.5">
            {FINGER_NAMES.map(({ id, label, hand }) => {
              const stat = metrics.fingerDistribution[id];
              const isSelected = selectedFinger === id;

              return (
                <div
                  key={id}
                  onClick={() => setSelectedFinger(isSelected ? null : id)}
                  className="p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2"
                  style={{
                    backgroundColor: isSelected ? p.primary : (p.isDark ? '#1C2515' : '#F2E8CF'),
                    borderColor: p.border,
                    color: isSelected ? p.activeBtnText : p.text,
                    boxShadow: isSelected ? p.tubelightGlow : undefined,
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{label}</span>
                      <span
                        className="text-[10px] uppercase px-2 py-0.5 rounded-full border font-bold"
                        style={{
                          borderColor: p.border,
                        }}
                      >
                        {hand === 'thumb' ? 'Thumb' : `${hand} hand`}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span>
                        <strong>{stat.count}</strong> keys ({stat.percentage}%)
                      </span>
                      <span>
                        Latency: <strong>{stat.avgLatencyMs || metrics.meanLatencyMs}ms</strong>
                      </span>
                      <span className="underline">
                        {stat.accuracy}% Acc
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-[#A3B18A]/30 rounded-full flex overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.min(100, stat.percentage * 2.5)}%`,
                        backgroundColor: p.primary,
                      }}
                    />
                    {stat.errors > 0 && (
                      <div
                        className="h-full transition-all duration-300 bg-red-500"
                        style={{ width: `${Math.min(40, (stat.errors / Math.max(1, stat.count)) * 100)}%` }}
                        title={`${stat.errors} errors`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section (5 cols): Latency Frequency Histogram & Error Typology */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Latency Frequency Histogram */}
          <div
            className="rounded-2xl p-6 border shadow-sm"
            style={{
              backgroundColor: p.isDark ? '#232E1A' : '#EDE8F3',
              borderColor: p.border,
              color: p.text,
            }}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: p.border }}>
              <div>
                <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2" style={{ color: p.text }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.primary }} />
                  Latency Histogram
                </h3>
                <p className="text-[11px] opacity-80 mt-0.5" style={{ color: p.textMuted }}>
                  Flight time distribution by millisecond bin
                </p>
              </div>
            </div>

            {/* Vertical Bar Chart */}
            <div className="h-36 flex items-end justify-between gap-3 pt-4 border-b pb-2" style={{ borderColor: p.border }}>
              {metrics.latencyHistogram.map((bin) => {
                const heightPercent = Math.max(8, Math.round((bin.count / maxHistoCount) * 100));
                return (
                  <div key={bin.bin} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition">
                      {bin.count}
                    </span>
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 relative border"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: p.primary,
                        borderColor: p.border,
                      }}
                    />
                    <span className="text-[10px] text-center font-bold">
                      {bin.bin}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs opacity-80 mt-3" style={{ color: p.textMuted }}>
              <span>Fast (&lt;100ms)</span>
              <span>Pause (&gt;250ms)</span>
            </div>
          </div>

          {/* Error Typology Classification */}
          <div
            className="rounded-2xl p-6 border shadow-sm flex-1 flex flex-col justify-between"
            style={{
              backgroundColor: p.isDark ? '#232E1A' : '#EDE8F3',
              borderColor: p.border,
              color: p.text,
            }}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: p.border }}>
              <div>
                <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2" style={{ color: p.text }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.primary }} />
                  Error Breakdown
                </h3>
                <p className="text-[11px] opacity-80 mt-0.5" style={{ color: p.textMuted }}>
                  Typing error categories
                </p>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full border"
                style={{
                  backgroundColor: p.isDark ? '#1C2515' : '#F2E8CF',
                  borderColor: p.border,
                  color: p.text,
                }}
              >
                {totalErrors} Total
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Substitution (Wrong Key)', count: metrics.errorDistribution.substitution },
                { label: 'Transposition (Swapped)', count: metrics.errorDistribution.transposition },
                { label: 'Case / Capitalization', count: metrics.errorDistribution.case },
                { label: 'Intrusion / Extra Key', count: metrics.errorDistribution.intrusion },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.count}</span>
                    <div className="w-20 h-2 bg-[#A3B18A]/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${totalErrors > 0 ? (item.count / totalErrors) * 100 : 0}%`,
                          backgroundColor: p.primary,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
