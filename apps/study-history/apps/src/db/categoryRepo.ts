import { db } from './database';
import type { Category } from './types';

export async function listActiveCategories(): Promise<Category[]> {
  const all = await db.categories.toArray();
  return all
    .filter((c) => c.deleted_at == null)
    .sort((a, b) => a.sort_order - b.sort_order || (a.id ?? 0) - (b.id ?? 0));
}

export async function createCategory(input: {
  name: string;
  color?: string | null;
}): Promise<number> {
  const name = input.name.trim();
  if (!name) throw new Error('カテゴリ名を入力してください');

  const dup = await db.categories
    .where('name')
    .equals(name)
    .filter((c) => c.deleted_at == null)
    .first();
  if (dup) throw new Error('同じ名前のカテゴリが既に存在します');

  const now = Date.now();
  const maxSort = await db.categories.orderBy('sort_order').last();
  const sort_order = (maxSort?.sort_order ?? 0) + 1;

  return await db.categories.add({
    name,
    color: input.color ?? null,
    sort_order,
    deleted_at: null,
    created_at: now,
    updated_at: now,
  });
}

export async function updateCategory(
  id: number,
  input: { name?: string; color?: string | null },
): Promise<void> {
  const target = await db.categories.get(id);
  if (!target) throw new Error('カテゴリが見つかりません');

  const patch: Partial<Category> = { updated_at: Date.now() };
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new Error('カテゴリ名を入力してください');
    if (name !== target.name) {
      const dup = await db.categories
        .where('name')
        .equals(name)
        .filter((c) => c.deleted_at == null && c.id !== id)
        .first();
      if (dup) throw new Error('同じ名前のカテゴリが既に存在します');
    }
    patch.name = name;
  }
  if (input.color !== undefined) patch.color = input.color;

  await db.categories.update(id, patch);
}

export async function softDeleteCategory(id: number): Promise<void> {
  const target = await db.categories.get(id);
  if (!target) return;
  const now = Date.now();
  await db.categories.update(id, {
    deleted_at: now,
    name: `__deleted_${id}__${target.name}`,
    updated_at: now,
  });
}
