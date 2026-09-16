import React, { useState, useEffect } from 'react';
import { TestResult, AppLanguage, ThemeMode } from '../types';
import {
  RotateCcw,
  ChevronRight,
  AlignLeft,
  Camera,
  Check,
  Mail,
  Sparkles,
} from 'lucide-react';
import { AdvancedMetricsDashboard } from './AdvancedMetricsDashboard';
import { getPalette } from '../utils/themeConfig';

interface MonkeytypeResultsProps {
  result: TestResult;
  onRestart: () => void;
  onNextTest: () => void;
  appLang?: AppLanguage;
  themeMode?: ThemeMode;
  onOpenContact?: () => void;
}

export const MonkeytypeResults: React.FC<MonkeytypeResultsProps> = ({
  result,
  onRestart,
  onNextTest,
  appLang = 'en',
  themeMode = 'light',
  onOpenContact,
}) => {
  const p = getPalette(themeMode);
  const [hoveredPoint, setHoveredPoint] = useState<{
    second: number;
    wpm: number;
    rawWpm: number;
    errors: number;
    x: number;
    y: number;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);

  // Keyboard shortcut listener for Tab / Enter / Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || (e.key === 'Enter' && e.ctrlKey)) {
        e.preventDefault();
        onRestart();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onNextTest();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart, onNextTest]);

  const {
    wpm,
    rawWpm,
    accuracy,
    consistency,
    durationSeconds,
    characters,
    testMode,
    modeDetail,
    timeline = [],
  } = result;

  // Build points for chart
  const validTimeline = timeline.length > 0 ? timeline : [
    { second: 1, wpm: Math.round(wpm * 0.8), rawWpm: Math.round(rawWpm * 0.85), errors: 0 },
    { second: Math.max(2, durationSeconds), wpm, rawWpm, errors: characters.incorrect },
  ];

  const maxSec = Math.max(...validTimeline.map((p) => p.second), durationSeconds || 1);
  const maxWpm = Math.max(60, ...validTimeline.map((p) => Math.max(p.wpm, p.rawWpm)), wpm, rawWpm);
  const yAxisMax = Math.ceil((maxWpm + 10) / 20) * 20;

  const maxErrors = Math.max(3, ...validTimeline.map((p) => p.errors), characters.incorrect);
  const yAxisErrorsMax = Math.max(3, Math.ceil(maxErrors));

  // Chart coordinate space
  const chartWidth = 720;
  const chartHeight = 220;
  const padLeft = 45;
  const padRight = 45;
  const padTop = 20;
  const padBottom = 30;

  const innerWidth = chartWidth - padLeft - padRight;
  const innerHeight = chartHeight - padTop - padBottom;

  const getX = (sec: number) => {
    if (maxSec <= 1) return padLeft + innerWidth / 2;
    return padLeft + ((sec - 1) / (maxSec - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    return padTop + innerHeight - (val / yAxisMax) * innerHeight;
  };

  const getErrorY = (err: number) => {
    return padTop + innerHeight - (err / yAxisErrorsMax) * innerHeight;
  };

  // Generate SVG path for WPM
  const wpmPath = validTimeline.reduce((acc, pt, idx) => {
    const x = getX(pt.second);
    const y = getY(pt.wpm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Generate SVG path for Raw WPM
  const rawPath = validTimeline.reduce((acc, pt, idx) => {
    const x = getX(pt.second);
    const y = getY(pt.rawWpm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Area under WPM curve
  const areaPath =
    validTimeline.length > 0
      ? `${wpmPath} L ${getX(validTimeline[validTimeline.length - 1].second)} ${
          padTop + innerHeight
        } L ${getX(validTimeline[0].second)} ${padTop + innerHeight} Z`
      : '';

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyCard = () => {
    const text = `Nima Type Test Result:
WPM: ${wpm} | ACC: ${accuracy}%
Raw: ${rawWpm} | Consistency: ${consistency}%
Characters: ${characters.correct}/${characters.incorrect}/${characters.extra}/${characters.missed}
Time: ${formatTime(durationSeconds)}`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="w-full max-w-5xl mx-auto py-6 px-4 animate-in fade-in duration-300 select-none"
      style={{ color: p.text }}
    >
      {/* Top Main Results Area: Left WPM/ACC + Right Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: wpm and acc */}
        <div className="lg:col-span-3 flex flex-col justify-center space-y-6">
          <div>
            <div className="text-xl sm:text-2xl font-mono lowercase font-bold" style={{ color: p.textMuted }}>
              wpm
            </div>
            <div className="text-6xl sm:text-7xl lg:text-8xl font-mono font-bold tracking-tight leading-none mt-1" style={{ color: p.text }}>
              {wpm}
            </div>
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-mono lowercase font-bold" style={{ color: p.textMuted }}>
              acc
            </div>
            <div className="text-6xl sm:text-7xl lg:text-8xl font-mono font-bold tracking-tight leading-none mt-1" style={{ color: p.text }}>
              {accuracy}%
            </div>
          </div>
        </div>

        {/* Center / Right Side: Dual-Axis Graph */}
        <div
          className="lg:col-span-9 relative w-full overflow-hidden rounded-2xl border p-2 sm:p-4 shadow-sm"
          style={{
            backgroundColor: p.isDark ? '#232E1A' : '#F2E8CF',
            borderColor: p.border,
          }}
        >
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="wpmAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A3B18A" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#A3B18A" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle Horizontal Grid lines & Left Y Ticks (WPM) */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const yVal = padTop + innerHeight * ratio;
              const tickWpm = Math.round(yAxisMax * (1 - ratio));
              const tickErr = Math.round(yAxisErrorsMax * (1 - ratio));
              return (
                <g key={idx}>
                  <line
                    x1={padLeft}
                    y1={yVal}
                    x2={chartWidth - padRight}
                    y2={yVal}
                    stroke="#A3B18A"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.4"
                  />
                  {/* Left tick: WPM */}
                  <text
                    x={padLeft - 10}
                    y={yVal + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="#586B54"
                    fontFamily="monospace"
                  >
                    {tickWpm}
                  </text>
                  {/* Right tick: Errors */}
                  <text
                    x={chartWidth - padRight + 10}
                    y={yVal + 3}
                    textAnchor="start"
                    fontSize="10"
                    fill="#283618"
                    fontFamily="monospace"
                  >
                    {tickErr}
                  </text>
                </g>
              );
            })}

            {/* Left Y Axis Label: Words per Minute */}
            <text
              x={-padTop - innerHeight / 2}
              y="12"
              transform="rotate(-90)"
              textAnchor="middle"
              fontSize="9"
              fill="#586B54"
              fontFamily="monospace"
            >
              Words per Minute
            </text>

            {/* Right Y Axis Label: Errors */}
            <text
              x={padTop + innerHeight / 2}
              y={-chartWidth + 12}
              transform="rotate(90)"
              textAnchor="middle"
              fontSize="9"
              fill="#283618"
              fontFamily="monospace"
            >
              Errors
            </text>

            {/* Bottom X Axis Ticks (Seconds) */}
            {validTimeline
              .filter((_, i) => i % Math.max(1, Math.floor(validTimeline.length / 8)) === 0)
              .map((pt, i) => (
                <text
                  key={i}
                  x={getX(pt.second)}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#586B54"
                  fontFamily="monospace"
                >
                  {pt.second}
                </text>
              ))}

            {/* Area fill under WPM curve */}
            {areaPath && <path d={areaPath} fill="url(#wpmAreaGrad)" />}

            {/* Raw WPM Line (dashed line) */}
            {rawPath && (
              <path
                d={rawPath}
                fill="none"
                stroke="#586B54"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />
            )}

            {/* WPM Line in Primary */}
            {wpmPath && (
              <path
                d={wpmPath}
                fill="none"
                stroke={p.primary}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Error Markers ('×') */}
            {validTimeline.map((pt, i) => {
              if (pt.errors <= 0) return null;
              const x = getX(pt.second);
              const y = getErrorY(pt.errors);
              return (
                <g key={`err-${i}`}>
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#EF4444"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    ×
                  </text>
                </g>
              );
            })}

            {/* Interactive Points */}
            {validTimeline.map((pt, i) => {
              const x = getX(pt.second);
              const y = getY(pt.wpm);
              return (
                <circle
                  key={`pt-${i}`}
                  cx={x}
                  cy={y}
                  r="4"
                  className="cursor-pointer transition-all hover:r-5.5"
                  fill={p.primary}
                  stroke={p.isDark ? '#172012' : '#F2E8CF'}
                  strokeWidth="1.5"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      second: pt.second,
                      wpm: pt.wpm,
                      rawWpm: pt.rawWpm,
                      errors: pt.errors,
                      x,
                      y,
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </svg>

          {/* Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none border text-xs font-mono px-3 py-2 rounded-xl shadow-lg z-20"
              style={{
                backgroundColor: p.cardBg,
                borderColor: p.border,
                color: p.text,
                boxShadow: p.tubelightGlow,
                left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                top: `${(hoveredPoint.y / chartHeight) * 100 - 15}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="font-bold">{hoveredPoint.second}s</div>
              <div>WPM: {hoveredPoint.wpm}</div>
              <div className="opacity-80">Raw: {hoveredPoint.rawWpm}</div>
              {hoveredPoint.errors > 0 && (
                <div className="underline font-bold text-[#EF4444]">Errors: {hoveredPoint.errors}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Under-Chart Stats Columns */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 pt-8 pb-6 border-b font-mono"
        style={{ borderColor: p.border }}
      >
        <div>
          <div className="text-xs lowercase mb-1 font-bold" style={{ color: p.textMuted }}>test type</div>
          <div className="text-lg font-bold capitalize" style={{ color: p.text }}>
            {testMode} {modeDetail || durationSeconds}
          </div>
          <div className="text-xs font-bold" style={{ color: p.textMuted }}>
            {appLang === 'fa' ? 'persian' : 'english'}
          </div>
        </div>

        <div>
          <div className="text-xs lowercase mb-1 font-bold" style={{ color: p.textMuted }}>other</div>
          <div className="text-lg font-bold" style={{ color: p.text }}>
            {characters.incorrect === 0 ? 'clean streak' : 'afk / standard'}
          </div>
          <div className="text-xs" style={{ color: p.textMuted }}>standard pace</div>
        </div>

        <div>
          <div className="text-xs lowercase mb-1 font-bold" style={{ color: p.textMuted }}>raw</div>
          <div className="text-3xl font-bold" style={{ color: p.text }}>{rawWpm}</div>
        </div>

        <div>
          <div className="text-xs lowercase mb-1 font-bold" style={{ color: p.textMuted }}>characters</div>
          <div className="text-2xl font-bold" style={{ color: p.text }}>
            {characters.correct}/{characters.incorrect}/{characters.extra}/{characters.missed}
          </div>
        </div>

        <div>
          <div className="text-xs lowercase mb-1 font-bold" style={{ color: p.textMuted }}>consistency</div>
          <div className="text-3xl font-bold" style={{ color: p.text }}>{consistency}%</div>
        </div>

        <div>
          <div className="text-xs lowercase mb-1 font-bold" style={{ color: p.textMuted }}>time</div>
          <div className="text-3xl font-bold" style={{ color: p.text }}>
            {formatTime(durationSeconds)}
          </div>
          <div className="text-[10px]" style={{ color: p.textMuted }}>
            {formatTime(durationSeconds)} session
          </div>
        </div>
      </div>

      {/* Action Toolbar Below Stats */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-8">
        <button
          onClick={onNextTest}
          className="tubelight-btn p-3 rounded-xl transition-all active:scale-95 cursor-pointer border"
          style={{
            backgroundColor: p.primary,
            borderColor: p.border,
            color: p.activeBtnText,
            boxShadow: p.tubelightGlow,
          }}
          title="Next test"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={onRestart}
          className="tubelight-btn p-3 rounded-xl transition-all active:scale-95 cursor-pointer border"
          style={{
            backgroundColor: p.primary,
            borderColor: p.border,
            color: p.activeBtnText,
            boxShadow: p.tubelightGlow,
          }}
          title="Restart test (Tab + Enter)"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowTelemetry((prev) => !prev)}
          className="p-3 rounded-xl transition-all active:scale-95 cursor-pointer border"
          style={{
            backgroundColor: showTelemetry ? p.cardBg : 'transparent',
            borderColor: p.border,
            color: p.text,
            boxShadow: showTelemetry ? p.tubelightGlow : undefined,
          }}
          title="Inspect Telemetry & Finger Heatmap"
        >
          <AlignLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleCopyCard}
          className="p-3 rounded-xl transition-all active:scale-95 cursor-pointer border hover:opacity-80"
          style={{
            borderColor: p.border,
            color: p.text,
          }}
          title="Copy result"
        >
          {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Camera className="w-5 h-5" />}
        </button>

        {onOpenContact && (
          <button
            onClick={onOpenContact}
            className="tubelight-btn px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            style={{
              backgroundColor: p.primary,
              borderColor: p.border,
              color: p.activeBtnText,
              boxShadow: p.tubelightGlow,
            }}
            title="Contact Nima Nabizada"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Creator</span>
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
          </button>
        )}
      </div>

      {/* Expanded Telemetry Section if toggled */}
      {showTelemetry && result.advancedMetrics && (
        <div
          className="pt-4 pb-8 border-t animate-in fade-in duration-300"
          style={{ borderColor: p.border }}
        >
          <AdvancedMetricsDashboard
            metrics={result.advancedMetrics}
            wpm={wpm}
            accuracy={accuracy}
            highestStreak={result.highestStreak}
            onClose={() => setShowTelemetry(false)}
            themeMode={themeMode}
          />
        </div>
      )}

      {/* Shortcut Badges */}
      <div className="flex items-center justify-center gap-2 pt-6 text-xs font-mono font-bold" style={{ color: p.text }}>
        <kbd
          className="px-2 py-0.5 rounded border font-bold"
          style={{
            backgroundColor: p.cardBg,
            borderColor: p.border,
            color: p.text,
          }}
        >
          tab
        </kbd>
        <span>&gt;</span>
        <kbd
          className="px-2 py-0.5 rounded border font-bold"
          style={{
            backgroundColor: p.cardBg,
            borderColor: p.border,
            color: p.text,
          }}
        >
          enter
        </kbd>
        <span className="font-medium" style={{ color: p.textMuted }}>- restart test</span>
      </div>
    </div>
  );
};
