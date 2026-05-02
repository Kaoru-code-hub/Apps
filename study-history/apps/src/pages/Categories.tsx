import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import {
  createCategory,
  listActiveCategories,
  softDeleteCategory,
  updateCategory,
} from '@/db/categoryRepo';
import type { Category } from '@/db/types';
import './Categories.css';

const COLOR_OPTIONS = [
  '#6B4FBB',
  '#8A6FD1',
  '#B49CD9',
  '#3B7A57',
  '#B8860B',
  '#A23B3B',
  '#6B6B74',
];

export function CategoriesPage() {
  const [items, setItems] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState<string>(COLOR_OPTIONS[0]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<string>(COLOR_OPTIONS[0]);

  async function reload() {
    try {
      setItems(await listActiveCategories());
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
      await createCategory({ name: newName, color: newColor });
      setNewName('');
      setNewColor(COLOR_OPTIONS[0]);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function startEdit(c: Category) {
    setEditingId(c.id ?? null);
    setDraftName(c.name);
    setDraftColor(c.color ?? COLOR_OPTIONS[0]);
    setError(null);
  }

  async function handleSave() {
    if (editingId == null) return;
    setError(null);
    try {
      await updateCategory(editingId, { name: draftName, color: draftColor });
      setEditingId(null);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('このカテゴリを削除しますか?\n過去の記録への紐付けは保持されます')) return;
    try {
      await softDeleteCategory(id);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="cats">
      <h1 className="cats__title">カテゴリ管理</h1>

      <Card>
        <h2 className="cats__heading">新規追加</h2>
        <div className="cats__form">
          <input
            className="cats__input"
            placeholder="カテゴリ名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <ColorPicker value={newColor} onChange={setNewColor} />
          <Button onClick={handleAdd} disabled={!newName.trim()}>
            追加
          </Button>
        </div>
      </Card>

      {error && <div className="cats__error">{error}</div>}

      <section className="cats__list">
        <h2 className="cats__heading">登録済み ({items?.length ?? 0})</h2>
        {items === null && <p className="cats__muted">読み込み中…</p>}
        {items?.length === 0 && (
          <p className="cats__muted">カテゴリがまだありません</p>
        )}
        {items?.map((c) => (
          <Card key={c.id} className="cats__item">
            {editingId === c.id ? (
              <div className="cats__form">
                <input
                  className="cats__input"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                />
                <ColorPicker value={draftColor} onChange={setDraftColor} />
                <div className="cats__actions">
                  <Button size="sm" onClick={handleSave}>
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingId(null)}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="cats__row">
                  <span
                    className="cats__swatch"
                    style={{ backgroundColor: c.color ?? '#9A9AA3' }}
                  />
                  <span className="cats__name">{c.name}</span>
                </div>
                <div className="cats__actions">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(c)}>
                    編集
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => c.id != null && handleDelete(c.id)}
                  >
                    削除
                  </Button>
                </div>
              </>
            )}
          </Card>
        ))}
      </section>
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="cats__colors" role="radiogroup" aria-label="カテゴリ色">
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={`色 ${c}`}
          className={`cats__color ${value === c ? 'cats__color--active' : ''}`}
          style={{ backgroundColor: c }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}
