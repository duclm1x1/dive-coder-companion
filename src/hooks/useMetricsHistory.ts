import { useState, useCallback, useEffect } from "react";

export interface MetricDataPoint {
  timestamp: number;
  value: number;
}

export interface MetricsSnapshot {
  id: string;
  timestamp: number;
  latency: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  provider: string;
  model: string;
  success: boolean;
}

export interface AggregatedMetrics {
  totalRuns: number;
  successfulRuns: number;
  successRate: number;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  avgLatency: number;
  p50Latency: number;
  p95Latency: number;
  latencyHistory: MetricDataPoint[];
  costHistory: MetricDataPoint[];
  tokensHistory: MetricDataPoint[];
  runsHistory: MetricDataPoint[];
}

const STORAGE_KEY = "dive-coder-metrics-history";
const MAX_SNAPSHOTS = 500;
const HISTORY_POINTS = 20;

function calculatePercentile(arr: number[], percentile: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function aggregateToPoints(snapshots: MetricsSnapshot[], getValue: (s: MetricsSnapshot) => number, points: number): MetricDataPoint[] {
  if (snapshots.length === 0) return [];
  
  const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
  
  if (sorted.length <= points) {
    return sorted.map(s => ({ timestamp: s.timestamp, value: getValue(s) }));
  }
  
  // Group into buckets
  const bucketSize = Math.ceil(sorted.length / points);
  const result: MetricDataPoint[] = [];
  
  for (let i = 0; i < points; i++) {
    const start = i * bucketSize;
    const end = Math.min(start + bucketSize, sorted.length);
    const bucket = sorted.slice(start, end);
    
    if (bucket.length > 0) {
      const avgValue = bucket.reduce((sum, s) => sum + getValue(s), 0) / bucket.length;
      result.push({
        timestamp: bucket[Math.floor(bucket.length / 2)].timestamp,
        value: avgValue,
      });
    }
  }
  
  return result;
}

function aggregateCumulativePoints(snapshots: MetricsSnapshot[], getValue: (s: MetricsSnapshot) => number, points: number): MetricDataPoint[] {
  if (snapshots.length === 0) return [];
  
  const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
  
  // Calculate cumulative values
  let cumulative = 0;
  const cumulativeData = sorted.map(s => {
    cumulative += getValue(s);
    return { timestamp: s.timestamp, value: cumulative };
  });
  
  if (cumulativeData.length <= points) {
    return cumulativeData;
  }
  
  // Sample points evenly
  const step = (cumulativeData.length - 1) / (points - 1);
  const result: MetricDataPoint[] = [];
  
  for (let i = 0; i < points; i++) {
    const index = Math.round(i * step);
    result.push(cumulativeData[index]);
  }
  
  return result;
}

export function useMetricsHistory() {
  const [snapshots, setSnapshots] = useState<MetricsSnapshot[]>([]);

  // Load from localStorage on mount with defensive parsing
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate each snapshot has required fields
        const valid = Array.isArray(parsed) 
          ? parsed.filter(s => 
              typeof s === 'object' && 
              s !== null &&
              typeof s.id === 'string' &&
              typeof s.timestamp === 'number'
            )
          : [];
        setSnapshots(valid);
      }
    } catch (e) {
      console.warn("Failed to load metrics history:", e);
      localStorage.removeItem(STORAGE_KEY);
      setSnapshots([]);
    }
  }, []);

  // Save to localStorage
  const saveSnapshots = useCallback((newSnapshots: MetricsSnapshot[]) => {
    const trimmed = newSnapshots.slice(-MAX_SNAPSHOTS);
    setSnapshots(trimmed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }, []);

  // Record a new metric snapshot
  const recordMetric = useCallback((metric: Omit<MetricsSnapshot, "id" | "timestamp">) => {
    const newSnapshot: MetricsSnapshot = {
      ...metric,
      id: `metric-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    };
    saveSnapshots([...snapshots, newSnapshot]);
    return newSnapshot;
  }, [snapshots, saveSnapshots]);

  // Get aggregated metrics
  const getAggregatedMetrics = useCallback((): AggregatedMetrics => {
    const successfulSnapshots = snapshots.filter(s => s.success);
    const latencies = successfulSnapshots.map(s => s.latency);
    
    return {
      totalRuns: snapshots.length,
      successfulRuns: successfulSnapshots.length,
      successRate: snapshots.length > 0 
        ? Math.round((successfulSnapshots.length / snapshots.length) * 100) 
        : 100,
      totalCost: snapshots.reduce((sum, s) => sum + s.cost, 0),
      totalInputTokens: snapshots.reduce((sum, s) => sum + s.inputTokens, 0),
      totalOutputTokens: snapshots.reduce((sum, s) => sum + s.outputTokens, 0),
      avgLatency: latencies.length > 0 
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
        : 0,
      p50Latency: calculatePercentile(latencies, 50),
      p95Latency: calculatePercentile(latencies, 95),
      latencyHistory: aggregateToPoints(successfulSnapshots, s => s.latency, HISTORY_POINTS),
      costHistory: aggregateCumulativePoints(snapshots, s => s.cost, HISTORY_POINTS),
      tokensHistory: aggregateCumulativePoints(snapshots, s => s.inputTokens + s.outputTokens, HISTORY_POINTS),
      runsHistory: aggregateCumulativePoints(snapshots, () => 1, HISTORY_POINTS),
    };
  }, [snapshots]);

  // Get recent snapshots
  const getRecentSnapshots = useCallback((count: number = 10) => {
    return [...snapshots].reverse().slice(0, count);
  }, [snapshots]);

  // Clear all metrics
  const clearMetrics = useCallback(() => {
    setSnapshots([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get metrics by time range
  const getMetricsByRange = useCallback((startTime: number, endTime: number = Date.now()) => {
    return snapshots.filter(s => s.timestamp >= startTime && s.timestamp <= endTime);
  }, [snapshots]);

  // Get today's metrics
  const getTodayMetrics = useCallback(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return getMetricsByRange(startOfDay.getTime());
  }, [getMetricsByRange]);

  return {
    snapshots,
    recordMetric,
    getAggregatedMetrics,
    getRecentSnapshots,
    clearMetrics,
    getMetricsByRange,
    getTodayMetrics,
  };
}
