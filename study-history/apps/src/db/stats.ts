import { db } from './database';
import type { Category, Goal, StudyRecord } from './types';
import { startOfTodayJST, startOfWeekJST } from '@/lib/time';

const DAY_MS = 86_400_000;

export type Granularity = 'day' | 'week' | 'month';

export interface BucketTotal {
  label: string;
  startMs: number;
  totalMinutes: number;
}

export interface GoalProgress {
  goal: Goal;
  totalSeconds: number;
  targetSeconds: number;
  progressRate: number;
}

export interface DashboardData {
  totalMinutes: number;
  totalSeconds: number;
  buckets: BucketTotal[];
  byCategory: { category: Category | null; totalMinutes: number }[];
  goalProgresses: GoalProgress[];
}

export async function loadDashboard(
  granularity: Granularity,
  now: number = Date.now(),
): Promise<DashboardData> {
  const todayStart = startOfTodayJST(now);
  // 直近の表示範囲: day=14日, week=12週, month=6ヶ月
  const ranges = computeRanges(granularity, todayStart);
  const earliest = ranges[0].startMs;

  const records = await db.study_records
    .where('started_at')
    .aboveOrEqual(earliest)
    .toArray();

  // バケット集計
  const buckets: BucketTotal[] = ranges.map((r) => ({
    label: r.label,
    startMs: r.startMs,
    totalMinutes: 0,
  }));
  for (const r of records) {
    const i = findBucketIndex(ranges, r.started_at);
    if (i >= 0) buckets[i].totalMinutes += r.duration_minutes;
  }

  // カテゴリ別 (1記録に複数カテゴリ → 各カテゴリにフル加算)
  const byCategoryMap = new Map<number | 'none', number>();
  const recordIds = records.map((r) => r.id!).filter(Boolean);
  let linksByRecord = new Map<number, number[]>();
  if (recordIds.length > 0) {
    const links = await db.study_record_categories
      .where('study_record_id')
      .anyOf(recordIds)
      .toArray();
    for (const l of links) {
      const arr = linksByRecord.get(l.study_record_id) ?? [];
      arr.push(l.category_id);
      linksByRecord.set(l.study_record_id, arr);
    }
  }
  for (const r of records) {
    const cids = (r.id != null && linksByRecord.get(r.id)) || [];
    if (cids.length === 0) {
      byCategoryMap.set('none', (byCategoryMap.get('none') ?? 0) + r.duration_minutes);
    } else {
      for (const cid of cids) {
        byCategoryMap.set(cid, (byCategoryMap.get(cid) ?? 0) + r.duration_minutes);
      }
    }
  }

  const cats = await db.categories.toArray();
  const catMap = new Map(cats.map((c) => [c.id!, c]));
  const byCategory = Array.from(byCategoryMap.entries())
    .map(([key, totalMinutes]) => ({
      category: key === 'none' ? null : catMap.get(key) ?? null,
      totalMinutes,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  const totalMinutes = records.reduce(
    (s: number, r: StudyRecord) => s + r.duration_minutes,
    0,
  );
  const totalSeconds = records.reduce(
    (s: number, r: StudyRecord) => s + (r.duration_seconds ?? r.duration_minutes * 60),
    0,
  );

  const goalProgresses = await computeGoalProgresses(granularity, todayStart, now);

  return { totalMinutes, totalSeconds, buckets, byCategory, goalProgresses };
}

async function computeGoalProgresses(
  granularity: Granularity,
  todayStart: number,
  now: number,
): Promise<GoalProgress[]> {
  const periodMap: Record<Granularity, Goal['period']> = {
    day: 'daily',
    week: 'weekly',
    month: 'monthly',
  };
  const period = periodMap[granularity];

  const goals = await db.goals.toArray();
  const activeGoals = goals.filter((g) => g.is_active && g.period === period);
  if (activeGoals.length === 0) return [];

  let rangeStart: number;
  if (granularity === 'day') {
    rangeStart = todayStart;
  } else if (granularity === 'week') {
    rangeStart = startOfWeekJST(now);
  } else {
    rangeStart = todayStart - 30 * DAY_MS;
  }

  const records = await db.study_records
    .where('started_at')
    .aboveOrEqual(rangeStart)
    .toArray();

  const recordIds = records.map((r) => r.id!).filter(Boolean);
  const linksByRecord = new Map<number, number[]>();
  if (recordIds.length > 0) {
    const links = await db.study_record_categories
      .where('study_record_id')
      .anyOf(recordIds)
      .toArray();
    for (const l of links) {
      const arr = linksByRecord.get(l.study_record_id) ?? [];
      arr.push(l.category_id);
      linksByRecord.set(l.study_record_id, arr);
    }
  }

  return activeGoals.map((goal) => {
    const filtered = goal.category_id
      ? records.filter((r) => {
          const cids = (r.id != null && linksByRecord.get(r.id)) || [];
          return cids.includes(goal.category_id!);
        })
      : records;

    const totalSeconds = filtered.reduce(
      (s, r) => s + (r.duration_seconds ?? r.duration_minutes * 60),
      0,
    );
    const targetSeconds = goal.target_minutes * 60;
    const progressRate = targetSeconds > 0 ? Math.min(totalSeconds / targetSeconds, 1) : 0;

    return { goal, totalSeconds, targetSeconds, progressRate };
  });
}

function computeRanges(
  granularity: Granularity,
  todayStart: number,
): { label: string; startMs: number; endMs: number }[] {
  if (granularity === 'day') {
    const arr: { label: string; startMs: number; endMs: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = todayStart - i * DAY_MS;
      arr.push({ label: labelDay(start), startMs: start, endMs: start + DAY_MS });
    }
    return arr;
  }
  if (granularity === 'week') {
    const dow = new Date(todayStart + 9 * 3600 * 1000).getUTCDay();
    const daysFromMonday = (dow + 6) % 7;
    const thisMonday = todayStart - daysFromMonday * DAY_MS;
    const arr: { label: string; startMs: number; endMs: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = thisMonday - i * 7 * DAY_MS;
      arr.push({ label: labelDay(start), startMs: start, endMs: start + 7 * DAY_MS });
    }
    return arr;
  }
  // month: 直近30日 × 6 = 180日のロールウィンドウを6つに分割
  const arr: { label: string; startMs: number; endMs: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const end = todayStart + DAY_MS - i * 30 * DAY_MS;
    const start = end - 30 * DAY_MS;
    arr.push({ label: labelDay(start), startMs: start, endMs: end });
  }
  return arr;
}

function findBucketIndex(
  ranges: { startMs: number; endMs: number }[],
  ts: number,
): number {
  for (let i = 0; i < ranges.length; i++) {
    if (ts >= ranges[i].startMs && ts < ranges[i].endMs) return i;
  }
  return -1;
}

function labelDay(ms: number): string {
  const d = new Date(ms + 9 * 3600 * 1000);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}
