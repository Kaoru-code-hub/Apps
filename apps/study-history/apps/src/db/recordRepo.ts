import { db } from './database';
import type { StudyRecord } from './types';

export interface CreateRecordInput {
  started_at: number;
  ended_at: number;
  duration_seconds: number;
  break_seconds: number;
  material_name?: string | null;
  achievement?: number | null;
  memo?: string | null;
  category_ids: number[];
}

export async function createStudyRecord(input: CreateRecordInput): Promise<number> {
  const now = Date.now();
  return await db.transaction(
    'rw',
    db.study_records,
    db.study_record_categories,
    async () => {
      const id = await db.study_records.add({
        started_at: input.started_at,
        ended_at: input.ended_at,
        duration_seconds: input.duration_seconds,
        duration_minutes: Math.floor(input.duration_seconds / 60),
        break_seconds: input.break_seconds,
        break_minutes: Math.floor(input.break_seconds / 60),
        material_name: input.material_name ?? null,
        achievement: input.achievement ?? null,
        memo: input.memo ?? null,
        created_at: now,
        updated_at: now,
      });
      if (input.category_ids.length > 0) {
        await db.study_record_categories.bulkAdd(
          input.category_ids.map((cid) => ({
            study_record_id: id,
            category_id: cid,
            created_at: now,
          })),
        );
      }
      return id;
    },
  );
}

export interface RecordWithCategories {
  record: StudyRecord;
  category_ids: number[];
}

export async function listRecords(): Promise<RecordWithCategories[]> {
  const records = await db.study_records
    .orderBy('started_at')
    .reverse()
    .toArray();
  if (records.length === 0) return [];

  const ids = records.map((r) => r.id!).filter((v) => v != null);
  const links = await db.study_record_categories
    .where('study_record_id')
    .anyOf(ids)
    .toArray();
  const map = new Map<number, number[]>();
  for (const l of links) {
    const arr = map.get(l.study_record_id) ?? [];
    arr.push(l.category_id);
    map.set(l.study_record_id, arr);
  }
  return records.map((r) => ({
    record: r,
    category_ids: r.id != null ? map.get(r.id) ?? [] : [],
  }));
}

export async function getRecord(id: number): Promise<RecordWithCategories | null> {
  const record = await db.study_records.get(id);
  if (!record) return null;
  const links = await db.study_record_categories
    .where('study_record_id')
    .equals(id)
    .toArray();
  return { record, category_ids: links.map((l) => l.category_id) };
}

export interface UpdateRecordInput {
  duration_seconds?: number;
  material_name?: string | null;
  achievement?: number | null;
  memo?: string | null;
  category_ids?: number[];
}

export async function updateRecord(
  id: number,
  input: UpdateRecordInput,
): Promise<void> {
  await db.transaction(
    'rw',
    db.study_records,
    db.study_record_categories,
    async () => {
      const target = await db.study_records.get(id);
      if (!target) throw new Error('記録が見つかりません');

      const patch: Partial<StudyRecord> = { updated_at: Date.now() };
      if (input.duration_seconds !== undefined) {
        patch.duration_seconds = input.duration_seconds;
        patch.duration_minutes = Math.floor(input.duration_seconds / 60);
      }
      if (input.material_name !== undefined) patch.material_name = input.material_name;
      if (input.achievement !== undefined) patch.achievement = input.achievement;
      if (input.memo !== undefined) patch.memo = input.memo;
      await db.study_records.update(id, patch);

      if (input.category_ids !== undefined) {
        await db.study_record_categories
          .where('study_record_id')
          .equals(id)
          .delete();
        if (input.category_ids.length > 0) {
          const now = Date.now();
          await db.study_record_categories.bulkAdd(
            input.category_ids.map((cid) => ({
              study_record_id: id,
              category_id: cid,
              created_at: now,
            })),
          );
        }
      }
    },
  );
}

export async function deleteRecord(id: number): Promise<void> {
  await db.transaction(
    'rw',
    db.study_records,
    db.study_record_categories,
    async () => {
      await db.study_record_categories
        .where('study_record_id')
        .equals(id)
        .delete();
      await db.study_records.delete(id);
    },
  );
}
