import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { listActiveCategories } from '@/db/categoryRepo';
import { createStudyRecord } from '@/db/recordRepo';
import type { Category } from '@/db/types';
import { formatHMS } from '@/lib/time';
import { useTimer, type FinishedSession } from '@/timer/TimerContext';
import './TimerFinish.css';

export function TimerFinishPage() {
  const navigate = useNavigate();
  const timer = useTimer();

  // 仕上げ用に確定セッションを保持。マウント時1回だけ確定する。
  const [finished, setFinished] = useState<FinishedSession | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [achievement, setAchievement] = useState<number | null>(null);
  const [memo, setMemo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!timer.session && !finished) {
      navigate('/', { replace: true });
      return;
    }
    if (timer.session && !finished) {
      const f = timer.finish();
      if (f) setFinished(f);
    }
    void listActiveCategories().then(setCats);
  }, [timer, finished, navigate]);

  const selectedCats = useMemo(
    () =>
      finished ? cats.filter((c) => finished.category_ids.includes(c.id!)) : [],
    [cats, finished],
  );

  if (!finished) return null;

  async function handleSave() {
    if (!finished) return;
    const f = finished;
    setError(null);
    setSaving(true);
    try {
      await createStudyRecord({
        started_at: f.started_at,
        ended_at: f.ended_at,
        duration_seconds: f.duration_seconds,
        break_seconds: f.break_seconds,
        material_name: f.material_name || null,
        achievement,
        memo: memo.trim() || null,
        category_ids: f.category_ids,
      });
      navigate('/', { replace: true });
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (!confirm('この計測結果を破棄しますか?')) return;
    navigate('/', { replace: true });
  }

  return (
    <div className="finish">
      <h1 className="finish__title">記録の確認</h1>

      <Card>
        <p className="finish__label">学習時間</p>
        <p className="finish__time">{formatHMS(finished.duration_seconds)}</p>
        {finished.break_seconds > 0 && (
          <p className="finish__sub">休憩: {formatHMS(finished.break_seconds)}</p>
        )}
        {finished.material_name && (
          <p className="finish__sub">教材: {finished.material_name}</p>
        )}
        {selectedCats.length > 0 && (
          <div className="finish__badges">
            {selectedCats.map((c) => (
              <span key={c.id} className="finish__badge">{c.name}</span>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="finish__label">達成度 (任意)</p>
        <div className="finish__rate">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`finish__rate__btn ${achievement === n ? 'finish__rate__btn--on' : ''}`}
              onClick={() => setAchievement(achievement === n ? null : n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="finish__hint">1: 不十分 〜 5: 完璧</p>
      </Card>

      <Card>
        <label className="finish__label" htmlFor="memo">メモ (任意)</label>
        <textarea
          id="memo"
          className="finish__memo"
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="今日の振り返りなど"
        />
      </Card>

      {error && <div className="finish__error">{error}</div>}

      <div className="finish__actions">
        <Button variant="danger" onClick={handleDiscard} disabled={saving}>
          破棄
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '保存中…' : '保存'}
        </Button>
      </div>
    </div>
  );
}
