import { AdvancedMetrics, FingerName, FingerStat, KeystrokeEvent, WpmPoint } from '../types';
import { FINGER_NAMES } from './fingerMapping';

export function calculateAdvancedMetrics(
  events: KeystrokeEvent[],
  burstOrTimeline: number | WpmPoint[] = 0
): AdvancedMetrics {
  const resolvedBurstWpm: number = Array.isArray(burstOrTimeline)
    ? burstOrTimeline.length > 0
      ? Math.max(0, ...burstOrTimeline.map((p) => (typeof p.wpm === 'number' ? p.wpm : 0)))
      : 0
    : typeof burstOrTimeline === 'number'
    ? Math.round(burstOrTimeline)
    : 0;
  const initialFingerDist: Record<FingerName, FingerStat> = {
    left_pinky: { finger: 'left_pinky', label: 'L. Pinky', hand: 'left', count: 0, errors: 0, avgLatencyMs: 0, percentage: 0, accuracy: 100 },
    left_ring: { finger: 'left_ring', label: 'L. Ring', hand: 'left', count: 0, errors: 0, avgLatencyMs: 0, percentage: 0, accuracy: 100 },
    left_middle: { finger: 'left_middle', label: 'L. Middle', hand: 'left', count: 0, errors: 0, avgLatencyMs: 0, percentage: 0, accuracy: 100 },
    left_index: { finger: 'left_index', label: 'L. Index', hand: 'left', count: 0, errors: 0, avgLatencyMs: 0, percentage: 0, accuracy: 100 },
    thumb: { finger: 'thumb', label: 'Thumbs', hand: 'thumb', count: 0, errors: 0, avgLatencyMs: 0, percentage: 0, accuracy: 100 },
    right_index: { finger: 'right_index', label: 'R. Index', hand: 'right', count: 0, errors: 0, avgLatencyMs: 0, percentage: 0, accuracy: 100 },
    right_middle: { finger: 'right_middle', label: 'R. Middle', hand: 'right', count: 0, errors: 0, avgLatencyMs: 0, percentage: 0, accuracy: 100 },
    right_ring: { finger: 'right_ring', label: 'R. Ring', hand: 'right', count: 0, errors: 0, avgLatencyMs: 0, percentage: 0, accuracy: 100 },
    right_pinky: { finger: 'right_pinky', label: 'R. Pinky', hand: 'right', count: 0, errors: 0, avgLatencyMs: 0, percentage: 0, accuracy: 100 },
  };

  const errorDist = {
    substitution: 0,
    transposition: 0,
    intrusion: 0,
    omission: 0,
    case: 0,
  };

  if (!events || events.length === 0) {
    return {
      meanLatencyMs: 0,
      latencyJitterMs: 0,
      consistencyScore: 100,
      errorDistribution: errorDist,
      fingerDistribution: initialFingerDist,
      handBalance: { leftPercent: 50, rightPercent: 50, thumbPercent: 0 },
      slowestKeys: [],
      highestErrorKeys: [],
      latencyHistogram: [
        { bin: '<100ms', count: 0, rangeMin: 0, rangeMax: 100 },
        { bin: '100-150ms', count: 0, rangeMin: 100, rangeMax: 150 },
        { bin: '150-200ms', count: 0, rangeMin: 150, rangeMax: 200 },
        { bin: '200-250ms', count: 0, rangeMin: 200, rangeMax: 250 },
        { bin: '>250ms', count: 0, rangeMin: 250, rangeMax: 9999 },
      ],
      burstWpm: resolvedBurstWpm,
    };
  }

  // Filter out the very first keystroke for latency calculation as it has no prior key
  const validLatencies: number[] = [];
  const fingerLatencyTotals: Record<FingerName, number> = {
    left_pinky: 0, left_ring: 0, left_middle: 0, left_index: 0, thumb: 0,
    right_index: 0, right_middle: 0, right_ring: 0, right_pinky: 0,
  };
  const keyMap: Record<string, { total: number; errors: number; totalLat: number }> = {};

  let leftCount = 0;
  let rightCount = 0;
  let thumbCount = 0;

  events.forEach((ev, idx) => {
    // Tally error types
    if (!ev.isCorrect && ev.errorType) {
      errorDist[ev.errorType] = (errorDist[ev.errorType] || 0) + 1;
    }

    // Finger counts
    const f = ev.finger || 'right_index';
    initialFingerDist[f].count++;
    if (!ev.isCorrect) {
      initialFingerDist[f].errors++;
    }

    // Hand counts
    if (initialFingerDist[f].hand === 'left') leftCount++;
    else if (initialFingerDist[f].hand === 'right') rightCount++;
    else thumbCount++;

    // Latency (skip first key or anomalous pauses > 2000ms)
    if (idx > 0 && ev.latencyMs > 0 && ev.latencyMs < 2000) {
      validLatencies.push(ev.latencyMs);
      fingerLatencyTotals[f] += ev.latencyMs;
    }

    // Key stats
    const k = ev.key.toLowerCase();
    if (!keyMap[k]) {
      keyMap[k] = { total: 0, errors: 0, totalLat: 0 };
    }
    keyMap[k].total++;
    if (!ev.isCorrect) keyMap[k].errors++;
    if (idx > 0 && ev.latencyMs > 0 && ev.latencyMs < 2000) {
      keyMap[k].totalLat += ev.latencyMs;
    }
  });

  // Calculate Mean Latency and Latency Jitter (Standard Deviation)
  let meanLatencyMs = 0;
  let latencyJitterMs = 0;
  let consistencyScore = 85;

  if (validLatencies.length > 0) {
    const sum = validLatencies.reduce((a, b) => a + b, 0);
    meanLatencyMs = Math.round(sum / validLatencies.length);

    const variance = validLatencies.reduce((acc, lat) => acc + Math.pow(lat - meanLatencyMs, 2), 0) / validLatencies.length;
    latencyJitterMs = Math.round(Math.sqrt(variance));

    // Consistency score: lower coefficient of variation (jitter / mean) = higher consistency
    const cv = latencyJitterMs / Math.max(1, meanLatencyMs);
    consistencyScore = Math.max(10, Math.min(99, Math.round((1 - Math.min(1, cv * 0.75)) * 100)));
  }

  // Calculate Finger Percentages & Accuracies
  const totalKeys = events.length;
  FINGER_NAMES.forEach(({ id }) => {
    const item = initialFingerDist[id];
    item.percentage = totalKeys > 0 ? Math.round((item.count / totalKeys) * 1000) / 10 : 0;
    item.accuracy = item.count > 0 ? Math.round(((item.count - item.errors) / item.count) * 100) : 100;
    const latKeys = item.count > 1 ? item.count - 1 : 1;
    item.avgLatencyMs = Math.round(fingerLatencyTotals[id] / Math.max(1, latKeys));
  });

  // Hand balance percentages
  const handTotal = Math.max(1, leftCount + rightCount + thumbCount);
  const handBalance = {
    leftPercent: Math.round((leftCount / handTotal) * 100),
    rightPercent: Math.round((rightCount / handTotal) * 100),
    thumbPercent: Math.round((thumbCount / handTotal) * 100),
  };

  // Latency Histogram Bins
  const histogram = [
    { bin: '<100ms', count: 0, rangeMin: 0, rangeMax: 100 },
    { bin: '100-150ms', count: 0, rangeMin: 100, rangeMax: 150 },
    { bin: '150-200ms', count: 0, rangeMin: 150, rangeMax: 200 },
    { bin: '200-250ms', count: 0, rangeMin: 200, rangeMax: 250 },
    { bin: '>250ms', count: 0, rangeMin: 250, rangeMax: 9999 },
  ];

  validLatencies.forEach((lat) => {
    if (lat < 100) histogram[0].count++;
    else if (lat < 150) histogram[1].count++;
    else if (lat < 200) histogram[2].count++;
    else if (lat < 250) histogram[3].count++;
    else histogram[4].count++;
  });

  // Slowest Keys
  const slowestKeys = Object.entries(keyMap)
    .filter(([_, stats]) => stats.total >= 2)
    .map(([key, stats]) => ({
      key,
      avgLatencyMs: Math.round(stats.totalLat / stats.total),
    }))
    .sort((a, b) => b.avgLatencyMs - a.avgLatencyMs)
    .slice(0, 5);

  // Highest Error Keys
  const highestErrorKeys = Object.entries(keyMap)
    .filter(([_, stats]) => stats.errors > 0)
    .map(([key, stats]) => ({
      key,
      errors: stats.errors,
      total: stats.total,
      errorRate: Math.round((stats.errors / stats.total) * 100),
    }))
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5);

  return {
    meanLatencyMs,
    latencyJitterMs,
    consistencyScore,
    errorDistribution: errorDist,
    fingerDistribution: initialFingerDist,
    handBalance,
    slowestKeys,
    highestErrorKeys,
    latencyHistogram: histogram,
    burstWpm: resolvedBurstWpm,
  };
}
