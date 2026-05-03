import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TimerProvider, useTimer } from '../timer/TimerContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TimerProvider>{children}</TimerProvider>
);

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('start', () => {
  it('セッションが開始される', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    act(() => {
      result.current.start({ category_ids: [1], material_name: 'React' });
    });
    expect(result.current.session).not.toBeNull();
    expect(result.current.session?.material_name).toBe('React');
    expect(result.current.session?.category_ids).toEqual([1]);
  });

  it('localStorageにセッションが保存される', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    act(() => {
      result.current.start({ category_ids: [1], material_name: 'React' });
    });
    const saved = localStorage.getItem('timer_session');
    expect(saved).not.toBeNull();
    expect(JSON.parse(saved!).material_name).toBe('React');
  });
});

describe('elapsedSeconds', () => {
  it('経過時間が正しく計算される', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    act(() => {
      result.current.start({ category_ids: [], material_name: 'test' });
    });
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(result.current.elapsedSeconds).toBe(30);
  });
});

describe('toggleBreak', () => {
  it('休憩開始でisOnBreakがtrueになる', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    act(() => {
      result.current.start({ category_ids: [], material_name: 'test' });
      result.current.toggleBreak();
    });
    expect(result.current.isOnBreak).toBe(true);
  });

  it('休憩終了でisOnBreakがfalseになる', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    act(() => {
      result.current.start({ category_ids: [], material_name: 'test' });
      result.current.toggleBreak();
      result.current.toggleBreak();
    });
    expect(result.current.isOnBreak).toBe(false);
  });

  it('休憩時間は経過時間に含まれない', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    act(() => {
      result.current.start({ category_ids: [], material_name: 'test' });
    });
    act(() => { vi.advanceTimersByTime(10000); });
    act(() => { result.current.toggleBreak(); });
    act(() => { vi.advanceTimersByTime(20000); }); // 休憩20秒
    act(() => { result.current.toggleBreak(); });
    act(() => { vi.advanceTimersByTime(10000); });
    // 合計40秒経過、休憩20秒 → 実勉強20秒
    expect(result.current.elapsedSeconds).toBe(20);
    expect(result.current.breakSeconds).toBe(20);
  });
});

describe('finish', () => {
  it('正しいFinishedSessionが返る', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    act(() => {
      result.current.start({ category_ids: [1], material_name: 'test' });
    });
    act(() => { vi.advanceTimersByTime(60000); });
    let finished: ReturnType<typeof result.current.finish> = null;
    act(() => {
      finished = result.current.finish();
    });
    expect(finished).not.toBeNull();
    expect(finished!.duration_seconds).toBe(60);
    expect(finished!.break_seconds).toBe(0);
  });

  it('finish後にsessionがnullになる', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    act(() => {
      result.current.start({ category_ids: [], material_name: 'test' });
    });
    act(() => {
      result.current.finish();
    });
    expect(result.current.session).toBeNull();
  });

  it('finish後にlocalStorageが削除される', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    act(() => {
      result.current.start({ category_ids: [], material_name: 'test' });
    });
    act(() => {
      result.current.finish();
    });
    expect(localStorage.getItem('timer_session')).toBeNull();
  });
});

describe('discard', () => {
  it('sessionがnullになりlocalStorageも削除される', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    act(() => {
      result.current.start({ category_ids: [], material_name: 'test' });
      result.current.discard();
    });
    expect(result.current.session).toBeNull();
    expect(localStorage.getItem('timer_session')).toBeNull();
  });
});

describe('localStorage復元', () => {
  it('ページリロード後にセッションが復元される', () => {
    const session = {
      started_at: Date.now(),
      category_ids: [2],
      material_name: '数学',
      breaks: [],
    };
    localStorage.setItem('timer_session', JSON.stringify(session));
    const { result } = renderHook(() => useTimer(), { wrapper });
    expect(result.current.session?.material_name).toBe('数学');
  });
});

describe('visibilitychange', () => {
  it('復帰時にnowが更新される（elapsedSecondsが正確になる）', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });
    act(() => {
      result.current.start({ category_ids: [], material_name: 'test' });
    });
    // バックグラウンド中に時間が経過
    act(() => { vi.advanceTimersByTime(60000); });
    // visibilitychange イベントを発火
    act(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.elapsedSeconds).toBe(60);
  });
});
