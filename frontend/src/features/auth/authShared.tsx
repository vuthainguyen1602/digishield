import { type CSSProperties, type ReactNode } from 'react';

/** Full-screen auth background wrapper (#F0F4FF). */
export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-auth)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {children}
    </main>
  );
}

/** White auth card (16px radius, auth shadow). */
export function AuthCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: 28,
        boxShadow: 'var(--shadow-auth)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export const authInputStyle: CSSProperties = {
  width: '100%',
  background: 'var(--color-input-bg)',
  border: '1px solid var(--color-input-border)',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'var(--color-text)',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
};

export const authLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: 'var(--color-text-soft)',
  fontWeight: 500,
  marginBottom: 6,
};

export function AuthFooter({ children }: { children: ReactNode }) {
  return (
    <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--color-muted)' }}>
      {children}
    </div>
  );
}
