import Dexie, { type Table } from 'dexie';
import type {
  Category,
  Goal,
  StudyRecord,
  StudyRecordCategory,
} from './types';

export class StudyHistoryDB extends Dexie {
  study_records!: Table<StudyRecord, number>;
  categories!: Table<Category, number>;
  study_record_categories!: Table<StudyRecordCategory, number>;
  goals!: Table<Goal, number>;

  constructor() {
    super('study_history');
    this.version(1).stores({
      study_records: '++id, started_at, ended_at',
      categories: '++id, &name, deleted_at, sort_order',
      study_record_categories:
        '++id, study_record_id, category_id, &[study_record_id+category_id]',
      goals: '++id, period, category_id, is_active',
    });
    this.version(2)
      .stores({
        study_records: '++id, started_at, ended_at',
        categories: '++id, &name, deleted_at, sort_order',
        study_record_categories:
          '++id, study_record_id, category_id, &[study_record_id+category_id]',
        goals: '++id, period, category_id, is_active',
      })
      .upgrade((tx) => {
        return tx
          .table('study_records')
          .toCollection()
          .modify((r) => {
            if (r.duration_seconds == null) {
              r.duration_seconds = r.duration_minutes * 60;
            }
            if (r.break_seconds == null) {
              r.break_seconds = r.break_minutes * 60;
            }
          });
      });
  }
}

export const db = new StudyHistoryDB();
