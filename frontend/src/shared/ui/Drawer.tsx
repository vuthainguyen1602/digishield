import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Panel width in px (default 480). */
  width?: number;
  children: ReactNode;
}

/** Right-hand slide-in drawer with backdrop. */
export function Drawer({ open, onClose, title, width = 480, children }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,14,24,.4)',
          zIndex: 'var(--z-drawer)' as unknown as number,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width,
          maxWidth: '100vw',
          zIndex: 501,
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-modal)',
          overflowY: 'auto',
          animation: 'slideInRight .25s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--color-text)',
            }}
          >
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-input-bg)',
              color: 'var(--color-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </header>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
      </div>
    </>
  );
}
