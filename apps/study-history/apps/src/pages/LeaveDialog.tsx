import { Button } from '@/components/Button';
import type { ButtonVariant } from '@/components/Button';
import './LeaveDialog.css';

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  confirmVariant?: ButtonVariant;
}

export function LeaveDialog({
  onCancel,
  onConfirm,
  title = '計測を中止しますか?',
  message = '計測中のデータは保存されず、破棄されます。',
  confirmLabel = '破棄する',
  confirmVariant = 'danger',
}: Props) {
  return (
    <div className="leave" role="dialog" aria-modal="true">
      <div className="leave__overlay" onClick={onCancel} />
      <div className="leave__body">
        <p className="leave__title">{title}</p>
        <p className="leave__msg">{message}</p>
        <div className="leave__actions">
          <Button variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
