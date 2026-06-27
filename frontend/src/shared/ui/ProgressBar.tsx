export interface ProgressBarProps {
  value: number;
  max?: number;
  /** Fill color (CSS color or token). Default blue. */
  color?: string;
}

/** Slim rounded progress bar matching the prototype (5–7px height). */
export function ProgressBar({ value, max = 100, color = 'var(--color-blue)' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        background: 'var(--color-input-bg)',
        borderRadius: 'var(--radius-pill)',
        height: 7,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: color,
          borderRadius: 'var(--radius-pill)',
          height: '100%',
          width: `${pct}%`,
          minWidth: pct > 0 ? 6 : 0,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}
