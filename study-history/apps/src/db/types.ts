export interface StudyRecord {
  id?: number;
  started_at: number;
  ended_at: number;
  duration_minutes: number;
  duration_seconds: number;
  break_minutes: number;
  break_seconds: number;
  material_name?: string | null;
  achievement?: number | null;
  memo?: string | null;
  created_at: number;
  updated_at: number;
}

export interface Category {
  id?: number;
  name: string;
  color?: string | null;
  sort_order: number;
  deleted_at?: number | null;
  created_at: number;
  updated_at: number;
}

export interface StudyRecordCategory {
  id?: number;
  study_record_id: number;
  category_id: number;
  created_at: number;
}

export type GoalPeriod = 'daily' | 'weekly' | 'monthly';

export interface Goal {
  id?: number;
  target_minutes: number;
  period: GoalPeriod;
  category_id?: number | null;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}
