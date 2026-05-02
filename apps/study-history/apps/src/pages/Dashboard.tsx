import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Card } from '@/components/Card';
import { loadDashboard, type DashboardData, type GoalProgress, type Granularity } from '@/db/stats';
import { formatHMSDisplay } from '@/lib/time';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
);

const PURPLE_PALETTE = [
  '#6B4FBB',
  '#8A6FD1',
  '#B49CD9',
  '#D4C5EC',
  '#5A4099',
  '#3F2A7A',
];

export function DashboardPage() {
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDashboard(granularity)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError((e as Error).message));
    return () => {
      cancelled = true;
    };
  }, [granularity]);

  return (
    <div className="dash">
      <h1 className="dash__title">ダッシュボード</h1>

      <div className="dash__tabs" role="tablist">
        {(['day', 'week', 'month'] as Granularity[]).map((g) => (
          <button
            key={g}
            role="tab"
            aria-selected={granularity === g}
            className={`dash__tab ${granularity === g ? 'dash__tab--on' : ''}`}
            onClick={() => setGranularity(g)}
          >
            {g === 'day' ? '日' : g === 'week' ? '週' : '月'}
          </button>
        ))}
      </div>

      {error && <div className="dash__error">{error}</div>}
      {!data && !error && <p className="dash__muted">読み込み中…</p>}

      {data && (
        <>
          <Card>
            <p className="dash__label">表示範囲の合計</p>
            <p className="dash__total">{formatHMSDisplay(data.totalSeconds)}</p>
          </Card>

          {data.goalProgresses.length > 0 && (
            <Card>
              <h2 className="dash__heading">目標達成率</h2>
              <div className="dash__goals">
                {data.goalProgresses.map((gp) => (
                  <GoalProgressItem key={gp.goal.id} gp={gp} />
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h2 className="dash__heading">推移 (棒グラフ)</h2>
            <div className="dash__chart">
              <Bar
                data={{
                  labels: data.buckets.map((b) => b.label),
                  datasets: [
                    {
                      label: '学習時間 (分)',
                      data: data.buckets.map((b) => b.totalMinutes),
                      backgroundColor: '#6B4FBB',
                      borderRadius: 4,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </Card>

          <Card>
            <h2 className="dash__heading">推移 (折れ線)</h2>
            <div className="dash__chart">
              <Line
                data={{
                  labels: data.buckets.map((b) => b.label),
                  datasets: [
                    {
                      label: '学習時間 (分)',
                      data: data.buckets.map((b) => b.totalMinutes),
                      borderColor: '#6B4FBB',
                      backgroundColor: 'rgba(107, 79, 187, 0.15)',
                      tension: 0.3,
                      fill: true,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </Card>

          <Card>
            <h2 className="dash__heading">カテゴリ別</h2>
            {data.byCategory.length === 0 ? (
              <p className="dash__muted">記録がありません</p>
            ) : (
              <div className="dash__chart dash__chart--donut">
                <Doughnut
                  data={{
                    labels: data.byCategory.map((b) =>
                      b.category ? b.category.name : '(未分類)',
                    ),
                    datasets: [
                      {
                        data: data.byCategory.map((b) => b.totalMinutes),
                        backgroundColor: data.byCategory.map(
                          (_, i) => PURPLE_PALETTE[i % PURPLE_PALETTE.length],
                        ),
                        borderWidth: 0,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'right' },
                    },
                  }}
                />
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function GoalProgressItem({ gp }: { gp: GoalProgress }) {
  const pct = Math.round(gp.progressRate * 100);
  const periodLabel = gp.goal.period === 'daily' ? '日' : gp.goal.period === 'weekly' ? '週' : '月(30日)';
  const done = gp.progressRate >= 1;
  // 猫の左端位置: 0%→0%, 100%→トラック右端まで猫が収まるよう計算はCSSで行う
  const catPos = Math.min(gp.progressRate, 1);
  return (
    <div className="dash__goal-item">
      <div className="dash__goal-header">
        <span className="dash__goal-label">{periodLabel}目標</span>
        <span className="dash__goal-values">
          {formatHMSDisplay(gp.totalSeconds)} / {formatHMSDisplay(gp.targetSeconds)}
        </span>
        <span className="dash__goal-pct" data-done={done}>{pct}%</span>
      </div>
      <div className="dash__cat-track">
        <div
          className="dash__cat-wrap"
          style={{ '--cat-pos': catPos } as React.CSSProperties}
        >
          <img className="dash__cat-img" src="./images/cat_1.png" alt="" aria-hidden="true" />
          <img className="dash__cat-img dash__cat-img--f2" src="./images/cat_2.png" alt="" aria-hidden="true" />
        </div>
        <div className="dash__progress-track">
          <div className="dash__progress-fill" style={{ width: `${pct}%` }} data-done={done} />
        </div>
      </div>
    </div>
  );
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { color: '#6B6B74' }, grid: { color: '#E5E5EA' } },
    x: { ticks: { color: '#6B6B74' }, grid: { display: false } },
  },
};
