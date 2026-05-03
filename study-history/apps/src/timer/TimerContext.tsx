import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface TimerSession {
  started_at: number;
  category_ids: number[];
  material_name: string;
  // 休憩区間: [{from: ms, to: ms | null}]。to が null なら現在休憩中。
  breaks: { from: number; to: number | null }[];
}

export interface FinishedSession {
  started_at: number;
  ended_at: number;
  duration_seconds: number;
  break_seconds: number;
  category_ids: number[];
  material_name: string;
}

interface TimerContextValue {
  session: TimerSession | null;
  isOnBreak: boolean;
  elapsedSeconds: number;
  breakSeconds: number;
  start: (input: { category_ids: number[]; material_name: string }) => void;
  toggleBreak: () => void;
  finish: () => FinishedSession | null;
  discard: () => void;
}

const Ctx = createContext<TimerContextValue | null>(null);

const STORAGE_KEY = 'timer_session';

function saveSession(s: TimerSession | null) {
  if (s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadSession(): TimerSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TimerSession;
  } catch {
    return null;
  }
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TimerSession | null>(() => loadSession());
  const [now, setNow] = useState(() => Date.now());
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  useEffect(() => {
    if (session && intervalRef.current == null) {
      intervalRef.current = window.setInterval(() => setNow(Date.now()), 250);
    }
    if (!session && intervalRef.current != null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [session]);

  // バックグラウンドから復帰したときに now を即時更新する
  useEffect(() => {
    if (!session) return;
    const handler = () => {
      if (document.visibilityState === 'visible') {
        setNow(Date.now());
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [session]);

  // 計測中の離脱警告
  useEffect(() => {
    if (!session) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [session]);

  const isOnBreak = useMemo(() => {
    if (!session) return false;
    const last = session.breaks[session.breaks.length - 1];
    return !!last && last.to == null;
  }, [session]);

  const breakSeconds = useMemo(() => {
    if (!session) return 0;
    let totalMs = 0;
    for (const b of session.breaks) {
      const to = b.to ?? now;
      totalMs += Math.max(0, to - b.from);
    }
    return Math.floor(totalMs / 1000);
  }, [session, now]);

  const elapsedSeconds = useMemo(() => {
    if (!session) return 0;
    const totalMs = now - session.started_at;
    let breakMs = 0;
    for (const b of session.breaks) {
      const to = b.to ?? now;
      breakMs += Math.max(0, to - b.from);
    }
    return Math.max(0, Math.floor((totalMs - breakMs) / 1000));
  }, [session, now]);

  const start = useCallback<TimerContextValue['start']>((input) => {
    setSession({
      started_at: Date.now(),
      category_ids: input.category_ids,
      material_name: input.material_name,
      breaks: [],
    });
  }, []);

  const toggleBreak = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const last = prev.breaks[prev.breaks.length - 1];
      const t = Date.now();
      if (last && last.to == null) {
        return {
          ...prev,
          breaks: [...prev.breaks.slice(0, -1), { ...last, to: t }],
        };
      }
      return { ...prev, breaks: [...prev.breaks, { from: t, to: null }] };
    });
  }, []);

  const finish = useCallback<TimerContextValue['finish']>(() => {
    if (!session) return null;
    const ended_at = Date.now();
    let breakMs = 0;
    for (const b of session.breaks) {
      const to = b.to ?? ended_at;
      breakMs += Math.max(0, to - b.from);
    }
    const totalMs = ended_at - session.started_at;
    const finished: FinishedSession = {
      started_at: session.started_at,
      ended_at,
      duration_seconds: Math.max(0, Math.floor((totalMs - breakMs) / 1000)),
      break_seconds: Math.floor(breakMs / 1000),
      category_ids: session.category_ids,
      material_name: session.material_name,
    };
    setSession(null);
    return finished;
  }, [session]);

  const discard = useCallback(() => setSession(null), []);

  const value = useMemo<TimerContextValue>(
    () => ({
      session,
      isOnBreak,
      elapsedSeconds,
      breakSeconds,
      start,
      toggleBreak,
      finish,
      discard,
    }),
    [session, isOnBreak, elapsedSeconds, breakSeconds, start, toggleBreak, finish, discard],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTimer() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTimer must be used within TimerProvider');
  return v;
}
