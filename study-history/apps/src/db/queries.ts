import { db } from './database';
import type { Category, StudyRecord } from './types';
import { startOfTodayJST } from '@/lib/time';

export async function getTodayTotalSeconds(now: number = Date.now()): Promise<number> {
  const start = startOfTodayJST(now);
  const records = await db.study_records
    .where('started_at')
    .aboveOrEqual(start)
    .toArray();
  return records.reduce(
    (sum, r) => sum + (r.duration_seconds ?? r.duration_minutes * 60),
    0,
  );
}

export interface RecentRecord {
  record: StudyRecord;
  categories: Category[];
}

export async function getRecentRecord(): Promise<RecentRecord | null> {
  const record = await db.study_records.orderBy('started_at').reverse().first();
  if (!record || record.id == null) return null;

  const links = await db.study_record_categories
    .where('study_record_id')
    .equals(record.id)
    .toArray();
  const ids = links.map((l) => l.category_id);
  const categories = ids.length
    ? ((await db.categories.bulkGet(ids)).filter(Boolean) as Category[])
    : [];

  return { record, categories };
}
