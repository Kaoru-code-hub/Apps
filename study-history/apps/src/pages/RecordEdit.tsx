import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { listActiveCategories } from '@/db/categoryRepo';
import { getRecord, updateRecord } from '@/db/recordRepo';
import type { Category } from '@/db/types';
import { formatDateTimeJST } from '@/lib/time';
import './RecordEdit.css';

export function RecordEditPage() {
  const { id } = useParams<{ id: string }>();
  const recordId = Number(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [material, setMaterial] = useState('');
  const [memo, setMemo] = useState('');
  const [achievement, setAchievement] = useState<number | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const [r, cs] = await Promise.all([
          getRecord(recordId),
          listActiveCategories(),
        ]);
        if (!r) {
          setError('記録が見つかりません');
          return;
        }
        setStartedAt(r.record.started_at);
        setDurationSec(r.record.duration_seconds);
        setMaterial(r.record.material_name ?? '');
        setMemo(r.record.memo ?? '');
        setAchievement(r.record.achievement ?? null);
        setCats(cs);
        setSelected(new Set(r.category_ids));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [recordId]);

  function toggle(cid: number) {
    const next = new Set(selected);
    next.has(cid) ? next.delete(cid) : next.add(cid);
    setSelected(next);
  }

  async function handleSave() {
    setError(null);
    try {
      if (durationSec < 1) throw new Error('学習時間を入力してください');
      await updateRecord(recordId, {
        duration_seconds: durationSec,
        material_name: material.trim() || null,
        memo: memo.trim() || null,
        achievement,
        category_ids: Array.from(selected),
      });
      navigate('/records');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (loading) return <p className="rec-edit__muted">読み込み中…</p>;
  if (error && !startedAt) return <p className="rec-edit__error">{error}</p>;

  return (
    <div className="rec-edit">
      <h1 className="rec-edit__title">記録を編集</h1>

      <Card>
        <p className="rec-edit__label">開始時刻</p>
        <p className="rec-edit__readonly">{formatDateTimeJST(startedAt)}</p>
      </Card>

      <Card>
        <label className="rec-edit__label">学習時間</label>
        <div className="rec-edit__duration">
          <input
            type="number"
            min={0}
            className="rec-edit__input rec-edit__input--sm"
            value={Math.floor(durationSec / 60)}
            onChange={(e) => setDurationSec(Number(e.target.value) * 60 + (durationSec % 60))}
          />
          <span className="rec-edit__dur-sep">分</span>
          <input
            type="number"
            min={0}
            max={59}
            className="rec-edit__input rec-edit__input--sm"
            value={durationSec % 60}
            onChange={(e) => setDurationSec(Math.floor(durationSec / 60) * 60 + Number(e.target.value))}
          />
          <span className="rec-edit__dur-sep">秒</span>
        </div>
      </Card>

      <Card>
        <label className="rec-edit__label" htmlFor="mat">教材名</label>
        <input
          id="mat"
          className="rec-edit__input"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
        />
      </Card>

      <Card>
        <p className="rec-edit__label">カテゴリ</p>
        <div className="rec-edit__cats">
          {cats.map((c) => {
            const on = c.id != null && selected.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                className={`rec-edit__cat ${on ? 'rec-edit__cat--on' : ''}`}
                onClick={() => c.id != null && toggle(c.id)}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <p className="rec-edit__label">達成度</p>
        <div className="rec-edit__rate">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`rec-edit__rate__btn ${achievement === n ? 'rec-edit__rate__btn--on' : ''}`}
              onClick={() => setAchievement(achievement === n ? null : n)}
            >
              {n}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <label className="rec-edit__label" htmlFor="memo">メモ</label>
        <textarea
          id="memo"
          className="rec-edit__memo"
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </Card>

      {error && <div className="rec-edit__error">{error}</div>}

      <div className="rec-edit__actions">
        <Button variant="secondary" onClick={() => navigate('/records')}>
          キャンセル
        </Button>
        <Button onClick={handleSave}>保存</Button>
      </div>
    </div>
  );
}
