import { Rejection } from "../types";

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
  months: number = 6,
): MonthlyDataPoint[] {
  const now = new Date();
  const result: MonthlyDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
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

export interface MultiLineChartData {
  labels: string[];
  rejections: number[];
  acceptances: number[];
  pending: number[];
}

/**
 * Aggregates rejections, acceptances, and pending events into separate
 * monthly counts for the last N months.
 */
export function aggregateByMonthMulti(
  events: Rejection[],
  months: number = 6,
): MultiLineChartData {
  const now = new Date();
  const keys: string[] = [];
  const labels: string[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
    keys.push(key);
    labels.push(label);
  }

  const rejections = new Array(months).fill(0);
  const acceptances = new Array(months).fill(0);
  const pending = new Array(months).fill(0);
  const keyIndex = new Map(keys.map((k, i) => [k, i]));

  for (const event of events) {
    const monthKey = event.date.substring(0, 7);
    const idx = keyIndex.get(monthKey);
    if (idx !== undefined) {
      const status = event.status ?? "rejected";
      if (status === "rejected") rejections[idx]++;
      else if (status === "accepted") acceptances[idx]++;
      else if (status === "pending") pending[idx]++;
    }
  }

  return { labels, rejections, acceptances, pending };
}
