import { useRef, type ChangeEvent, type KeyboardEvent, type ClipboardEvent } from 'react';

export interface OtpInputProps {
  /** Number of boxes (default 6). */
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

/** 6-box OTP entry — 48×56px boxes, JetBrains Mono 22px. */
export function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.split('').slice(0, length);

  const setChar = (i: number, ch: string) => {
    const next = value.split('');
    next[i] = ch;
    onChange(next.join('').slice(0, length));
  };

  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const ch = e.target.value.replace(/\D/g, '').slice(-1);
    if (!ch) return;
    setChar(i, ch);
    if (i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (chars[i]) {
        setChar(i, '');
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        setChar(i - 1, '');
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (digits) {
      onChange(digits);
      refs.current[Math.min(digits.length, length - 1)]?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {Array.from({ length }).map((_, i) => {
        const filled = Boolean(chars[i]);
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={chars[i] ?? ''}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKey(i, e)}
            onPaste={handlePaste}
            style={{
              width: 48,
              height: 56,
              textAlign: 'center',
              background: 'var(--color-input-bg)',
              border: `2px solid ${filled ? 'var(--color-blue)' : 'var(--color-border)'}`,
              borderRadius: 10,
              fontFamily: 'var(--font-mono)',
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--color-text)',
              outline: 'none',
            }}
          />
        );
      })}
    </div>
  );
}
