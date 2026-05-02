import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { Button } from './Button';
import { useTimer } from '@/timer/TimerContext';
import './Layout.css';

export function Layout() {
  const navigate = useNavigate();
  const timer = useTimer();

  function handleStartStudy() {
    if (timer.session) {
      navigate('/timer');
    } else {
      navigate('/timer/prepare');
    }
  }

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__inner">
          <NavLink to="/" className="layout__brand">勉強記録</NavLink>
          <div className="layout__header-actions">
            <nav className="layout__nav layout__nav--desktop">
              <NavLink to="/records" className="layout__navlink">記録</NavLink>
              <NavLink to="/dashboard" className="layout__navlink">ダッシュボード</NavLink>
              <NavLink to="/categories" className="layout__navlink">カテゴリ</NavLink>
              <NavLink to="/goals" className="layout__navlink">目標</NavLink>
            </nav>
            <Button
              size="sm"
              onClick={handleStartStudy}
              className="layout__start-btn"
            >
              {timer.session ? '計測中' : '勉強開始'}
            </Button>
          </div>
        </div>
      </header>

      <main className="layout__main">
        <div className="layout__inner">
          <Outlet />
        </div>
      </main>

      <nav className="layout__tabbar">
        <NavLink to="/" end className="layout__tab">ホーム</NavLink>
        <NavLink to="/records" className="layout__tab">記録</NavLink>
        <NavLink to="/dashboard" className="layout__tab">統計</NavLink>
        <NavLink to="/categories" className="layout__tab">設定</NavLink>
      </nav>
    </div>
  );
}
