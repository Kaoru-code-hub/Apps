import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CategoriesPage } from '@/pages/Categories';
import { DashboardPage } from '@/pages/Dashboard';
import { GoalsPage } from '@/pages/Goals';
import { HomePage } from '@/pages/Home';
import { PlaceholderPage } from '@/pages/Placeholder';
import { RecordEditPage } from '@/pages/RecordEdit';
import { RecordsPage } from '@/pages/Records';
import { TimerPage } from '@/pages/Timer';
import { TimerFinishPage } from '@/pages/TimerFinish';
import { TimerPreparePage } from '@/pages/TimerPrepare';
import { TimerProvider } from '@/timer/TimerContext';

export default function App() {
  return (
    <TimerProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/timer/prepare" element={<TimerPreparePage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/timer/finish" element={<TimerFinishPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/records/:id/edit" element={<RecordEditPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route
            path="*"
            element={<PlaceholderPage screenId="404" title="ページが見つかりません" />}
          />
        </Route>
      </Routes>
    </TimerProvider>
  );
}
