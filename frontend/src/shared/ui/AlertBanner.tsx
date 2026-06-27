import { type ReactNode } from 'react';
import { X } from 'lucide-react';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertBannerProps {
  severity: AlertSeverity;
  message: ReactNode;
  onDismiss?: () => void;
}

const BG: Record<AlertSeverity, string> = {
  critical: '#be2a2f',
  warning: 'var(--color-amber)',
  info: 'var(--color-blue)',
};

/** Fixed top, full-width, dismissible alert banner (40px tall). */
export function AlertBanner({ severity, message, onDismiss }: AlertBannerProps) {
  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-banner)' as unknown as number,
        background: BG[severity],
        height: 40,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.7)',
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 13.5, color: '#fff', fontWeight: 500, flex: 1 }}>{message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            color: 'rgba(255,255,255,.7)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            padding: 4,
          }}
        >
          <X size={16} strokeWidth={2} />
        </button>
      ) : null}
    </div>
  );
}
