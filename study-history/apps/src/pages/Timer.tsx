import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { useTimer } from '@/timer/TimerContext';
import { formatHMS } from '@/lib/time';
import { LeaveDialog } from './LeaveDialog';
import './Timer.css';

export function TimerPage() {
  const navigate = useNavigate();
  const timer = useTimer();
  const [showLeave, setShowLeave] = useState(false);
  const [showFinish, setShowFinish] = useState(false);

  useEffect(() => {
    if (!timer.session) {
      navigate('/', { replace: true });
    }
  }, [timer.session, navigate]);

  if (!timer.session) return null;

  function handleFinish() {
    navigate('/timer/finish');
  }

  return (
    <div className="timer">
      <p className="timer__status">
        {timer.isOnBreak ? (
          <>
            <span className="timer__dot" />
            休憩中
          </>
        ) : (
          '計測中'
        )}
      </p>

      <p className={`timer__display ${timer.isOnBreak ? 'timer__display--paused' : ''}`}>
        {formatHMS(timer.elapsedSeconds)}
      </p>

      {timer.breakSeconds > 0 && (
        <p className="timer__break">
          休憩合計: {formatHMS(timer.breakSeconds)}
        </p>
      )}

      <div className="timer__actions">
        <Button
          variant="secondary"
          onClick={() => timer.toggleBreak()}
        >
          {timer.isOnBreak ? '再開' : '休憩'}
        </Button>
        <Button onClick={() => setShowFinish(true)}>計測終了</Button>
      </div>

      <button
        className="timer__discard"
        onClick={() => setShowLeave(true)}
      >
        破棄して中止
      </button>

      {showLeave && (
        <LeaveDialog
          onCancel={() => setShowLeave(false)}
          onConfirm={() => {
            timer.discard();
            navigate('/');
          }}
        />
      )}

      {showFinish && (
        <LeaveDialog
          title="計測を終了しますか?"
          message="記録の確認画面に移動します。"
          confirmLabel="終了する"
          confirmVariant="primary"
          onCancel={() => setShowFinish(false)}
          onConfirm={handleFinish}
        />
      )}
    </div>
  );
}
