import { useState } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { Button } from './Button';
import { useTimer } from '@/timer/TimerContext';
import './Layout.css';

export function Layout() {
  const navigate = useNavigate();
  const timer = useTimer();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleStartStudy() {
    if (timer.session) {
      navigate('/timer');
    } else {
      navigate('/timer/prepare');
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__inner">
          <NavLink to="/" className="layout__brand" onClick={closeMenu}>勉強記録</NavLink>
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
            <button
              className="layout__hamburger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="メニューを開く"
              aria-expanded={menuOpen}
            >
              <span className={`layout__hamburger-bar${menuOpen ? ' layout__hamburger-bar--open-1' : ''}`} />
              <span className={`layout__hamburger-bar${menuOpen ? ' layout__hamburger-bar--open-2' : ''}`} />
              <span className={`layout__hamburger-bar${menuOpen ? ' layout__hamburger-bar--open-3' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="layout__drawer-overlay" onClick={closeMenu} />
      )}
      <nav className={`layout__drawer${menuOpen ? ' layout__drawer--open' : ''}`}>
        <NavLink to="/" end className="layout__drawer-link" onClick={closeMenu}>ホーム</NavLink>
        <NavLink to="/records" className="layout__drawer-link" onClick={closeMenu}>記録</NavLink>
        <NavLink to="/dashboard" className="layout__drawer-link" onClick={closeMenu}>ダッシュボード</NavLink>
        <NavLink to="/categories" className="layout__drawer-link" onClick={closeMenu}>カテゴリ</NavLink>
        <NavLink to="/goals" className="layout__drawer-link" onClick={closeMenu}>目標</NavLink>
      </nav>

      <main className="layout__main">
        <div className="layout__inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
