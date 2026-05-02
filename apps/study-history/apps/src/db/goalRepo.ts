import { db } from './database';
import type { Goal, GoalPeriod } from './types';

export async function listGoals(): Promise<Goal[]> {
  const all = await db.goals.toArray();
  return all.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
}

export async function createGoal(input: {
  target_minutes: number;
  period: GoalPeriod;
  category_id?: number | null;
}): Promise<number> {
  if (input.target_minutes <= 0) throw new Error('目標時間は1分以上を指定してください');
  const now = Date.now();
  return await db.goals.add({
    target_minutes: input.target_minutes,
    period: input.period,
    category_id: input.category_id ?? null,
    is_active: true,
    created_at: now,
    updated_at: now,
  });
}

export async function updateGoal(id: number, patch: Partial<Goal>): Promise<void> {
  await db.goals.update(id, { ...patch, updated_at: Date.now() });
}

export async function deleteGoal(id: number): Promise<void> {
  await db.goals.delete(id);
}
