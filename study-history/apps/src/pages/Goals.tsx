import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { listActiveCategories } from '@/db/categoryRepo';
import {
  createGoal,
  deleteGoal,
  listGoals,
  updateGoal,
} from '@/db/goalRepo';
import type { Category, Goal, GoalPeriod } from '@/db/types';
import { formatHM } from '@/lib/time';
import './Goals.css';

const PERIOD_LABEL: Record<GoalPeriod, string> = {
  daily: '日',
  weekly: '週',
  monthly: '月',
};

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<GoalPeriod>('daily');
  const [hours, setHours] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  async function reload() {
    try {
      const [g, c] = await Promise.all([listGoals(), listActiveCategories()]);
      setGoals(g);
      setCats(c);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function handleAdd() {
    setError(null);
    try {
      await createGoal({
        target_minutes: Math.round(hours * 60),
        period,
        category_id: categoryId,
      });
      setHours(1);
      setCategoryId(null);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleToggle(g: Goal) {
    if (g.id == null) return;
    await updateGoal(g.id, { is_active: !g.is_active });
    await reload();
  }

  async function handleDelete(id: number) {
    if (!confirm('この目標を削除しますか?')) return;
    await deleteGoal(id);
    await reload();
  }

  function catName(id: number | null | undefined): string {
    if (id == null) return '全体';
    return cats.find((c) => c.id === id)?.name ?? '(削除されたカテゴリ)';
  }

  return (
    <div className="goals">
      <h1 className="goals__title">目標設定</h1>

      <Card>
        <h2 className="goals__heading">新規追加</h2>
        <div className="goals__form">
          <div className="goals__field">
            <label className="goals__label">期間</label>
            <select
              className="goals__select"
              value={period}
              onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
            >
              <option value="daily">日</option>
              <option value="weekly">週</option>
              <option value="monthly">月 (直近30日)</option>
            </select>
          </div>
          <div className="goals__field">
            <label className="goals__label">目標時間 (時間)</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              className="goals__input"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </div>
          <div className="goals__field">
            <label className="goals__label">カテゴリ</label>
            <select
              className="goals__select"
              value={categoryId ?? ''}
              onChange={(e) =>
                setCategoryId(e.target.value === '' ? null : Number(e.target.value))
              }
            >
              <option value="">全体</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleAdd}>追加</Button>
        </div>
      </Card>

      {error && <div className="goals__error">{error}</div>}

      <section className="goals__list">
        <h2 className="goals__heading">登録済み ({goals.length})</h2>
        {goals.length === 0 && (
          <p className="goals__muted">まだ目標がありません</p>
        )}
        {goals.map((g) => (
          <Card key={g.id} className="goals__item">
            <div>
              <p className="goals__item__head">
                {PERIOD_LABEL[g.period]} / {catName(g.category_id)}
              </p>
              <p className="goals__item__time">
                {formatHM(g.target_minutes)}
                {!g.is_active && <span className="goals__off"> (無効)</span>}
              </p>
            </div>
            <div className="goals__actions">
              <Button size="sm" variant="ghost" onClick={() => handleToggle(g)}>
                {g.is_active ? '無効化' : '有効化'}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => g.id != null && handleDelete(g.id)}
              >
                削除
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
