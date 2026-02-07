import { Rejection } from '../types';

export interface MonthlyDataPoint {
  label: string;
  count: number;
  key: string;
}

/**
 * Aggregates rejections into monthly counts for the last N months.
 * Returns an array sorted chronologically (oldest first).
 * Months with no rejections get count = 0.
 */
export function aggregateByMonth(
  rejections: Rejection[],
  months: number = 6
): MonthlyDataPoint[] {
  const now = new Date();
  const result: MonthlyDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    result.push({ label, count: 0, key });
  }

  const keySet = new Set(result.map((r) => r.key));
  for (const rejection of rejections) {
    const monthKey = rejection.date.substring(0, 7);
    if (keySet.has(monthKey)) {
      const bucket = result.find((r) => r.key === monthKey);
      if (bucket) bucket.count++;
    }
  }

  return result;
}
