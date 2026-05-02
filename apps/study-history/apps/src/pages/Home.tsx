import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { getRecentRecord, getTodayTotalSeconds, type RecentRecord } from '@/db/queries';
import { formatHMSDisplay } from '@/lib/time';
import { useTimer } from '@/timer/TimerContext';
import './Home.css';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; todaySeconds: number; recent: RecentRecord | null }
  | { status: 'error'; message: string };

export function HomePage() {
  const navigate = useNavigate();
  const timer = useTimer();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [todaySeconds, recent] = await Promise.all([
          getTodayTotalSeconds(),
          getRecentRecord(),
        ]);
        if (!cancelled) setState({ status: 'ready', todaySeconds, recent });
      } catch (e) {
        if (!cancelled)
          setState({ status: 'error', message: (e as Error).message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home">
      <section className="home__hero">
        <p className="home__label">本日の学習時間</p>
        <p className="home__today">
          {state.status === 'ready' ? formatHMSDisplay(state.todaySeconds) : '—'}
        </p>
      </section>

      <Button
        className="home__cta"
        onClick={() => navigate(timer.session ? '/timer' : '/timer/prepare')}
      >
        {timer.session ? '計測中の画面に戻る' : '勉強をスタート'}
      </Button>

      <section className="home__recent">
        <h2 className="home__heading">直近の学習</h2>
        {state.status === 'loading' && (
          <Card><p className="home__muted">読み込み中…</p></Card>
        )}
        {state.status === 'error' && (
          <Card>
            <p className="home__muted">データの読み込みに失敗しました。</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => location.reload()}
            >
              再試行
            </Button>
          </Card>
        )}
        {state.status === 'ready' && !state.recent && (
          <Card>
            <p className="home__muted">
              まだ記録がありません。勉強をスタートしましょう
            </p>
          </Card>
        )}
        {state.status === 'ready' && state.recent && (
          <Card>
            <p className="home__recent__time">
              {formatHMSDisplay(state.recent.record.duration_seconds ?? state.recent.record.duration_minutes * 60)}
            </p>
            {state.recent.record.material_name && (
              <p className="home__recent__material">
                {state.recent.record.material_name}
              </p>
            )}
            {state.recent.categories.length > 0 && (
              <div className="home__badges">
                {state.recent.categories.map((c) => (
                  <span key={c.id} className="home__badge">{c.name}</span>
                ))}
              </div>
            )}
          </Card>
        )}
      </section>
    </div>
  );
}
