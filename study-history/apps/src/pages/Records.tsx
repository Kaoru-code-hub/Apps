import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { listActiveCategories } from '@/db/categoryRepo';
import { deleteRecord, listRecords, type RecordWithCategories } from '@/db/recordRepo';
import type { Category } from '@/db/types';
import { formatDateTimeJST, formatHMS } from '@/lib/time';
import './Records.css';

export function RecordsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<RecordWithCategories[] | null>(null);
  const [catMap, setCatMap] = useState<Map<number, Category>>(new Map());
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    try {
      const [recs, cats] = await Promise.all([
        listRecords(),
        listActiveCategories(),
      ]);
      setItems(recs);
      setCatMap(new Map(cats.map((c) => [c.id!, c])));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('この記録を削除しますか?')) return;
    try {
      await deleteRecord(id);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="recs">
      <h1 className="recs__title">学習記録</h1>

      {error && <div className="recs__error">{error}</div>}

      {items === null && <p className="recs__muted">読み込み中…</p>}
      {items?.length === 0 && (
        <Card>
          <p className="recs__muted" style={{ margin: 0 }}>
            まだ記録がありません
          </p>
        </Card>
      )}

      <div className="recs__list">
        {items?.map(({ record, category_ids }) => (
          <Card key={record.id} className="recs__item">
            <div className="recs__main">
              <p className="recs__when">{formatDateTimeJST(record.started_at)}</p>
              <p className="recs__time">{formatHMS(record.duration_seconds)}</p>
              {record.material_name && (
                <p className="recs__material">{record.material_name}</p>
              )}
              {category_ids.length > 0 && (
                <div className="recs__badges">
                  {category_ids.map((cid) => {
                    const c = catMap.get(cid);
                    return c ? (
                      <span key={cid} className="recs__badge">{c.name}</span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <div className="recs__actions">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/records/${record.id}/edit`)}
              >
                編集
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => record.id != null && handleDelete(record.id)}
              >
                削除
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
