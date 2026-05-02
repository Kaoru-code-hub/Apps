import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { listActiveCategories } from '@/db/categoryRepo';
import type { Category } from '@/db/types';
import { useTimer } from '@/timer/TimerContext';
import './TimerPrepare.css';

export function TimerPreparePage() {
  const navigate = useNavigate();
  const timer = useTimer();
  const [cats, setCats] = useState<Category[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [material, setMaterial] = useState('');

  useEffect(() => {
    if (timer.session) {
      navigate('/timer', { replace: true });
      return;
    }
    void listActiveCategories().then(setCats);
  }, [timer.session, navigate]);

  function toggle(id: number) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  function handleStart() {
    timer.start({
      category_ids: Array.from(selected),
      material_name: material.trim(),
    });
    navigate('/timer');
  }

  return (
    <div className="prep">
      <h1 className="prep__title">計測準備</h1>

      <Card>
        <label className="prep__label">教材名 (任意)</label>
        <input
          className="prep__input"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          placeholder="例: TOEIC 公式問題集 vol.10"
        />
      </Card>

      <Card>
        <label className="prep__label">カテゴリ (任意・複数選択可)</label>
        {cats === null && <p className="prep__muted">読み込み中…</p>}
        {cats?.length === 0 && (
          <p className="prep__muted">
            カテゴリが未登録です。設定画面から作成できます
          </p>
        )}
        <div className="prep__cats">
          {cats?.map((c) => {
            const on = c.id != null && selected.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                className={`prep__cat ${on ? 'prep__cat--on' : ''}`}
                onClick={() => c.id != null && toggle(c.id)}
              >
                <span
                  className="prep__cat__swatch"
                  style={{ backgroundColor: c.color ?? '#9A9AA3' }}
                />
                {c.name}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="prep__actions">
        <Button variant="secondary" onClick={() => navigate('/')}>
          キャンセル
        </Button>
        <Button onClick={handleStart}>計測開始</Button>
      </div>
    </div>
  );
}
