import { Link } from 'react-router-dom';
import { Card } from '@/components/Card';

interface Props {
  screenId: string;
  title: string;
}

export function PlaceholderPage({ screenId, title }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <h1 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>{title}</h1>
      <Card>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          {screenId} の画面は未実装です。骨格のみ用意しています。
        </p>
      </Card>
      <Link to="/">← ホームへ</Link>
    </div>
  );
}
