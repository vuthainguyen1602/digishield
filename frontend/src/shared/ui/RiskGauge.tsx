import { riskColor, riskLabel } from './risk';

export interface RiskGaugeProps {
  /** Risk score 0–100. */
  score: number;
  /** Rendered width in px (height scales proportionally). Default 150. */
  size?: number;
}

/**
 * Semicircle risk gauge — copied from the prototype.
 * Track arc + value arc share path "M 18 103 A 82 82 0 0 1 182 103" on a
 * 200×118 viewBox. Arc length = π·82; dash = (score/100)·arcLength.
 */
export function RiskGauge({ score, size = 150 }: RiskGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const arcLength = Math.PI * 82;
  const dash = `${(clamped / 100) * arcLength} ${arcLength}`;
  const color = riskColor(clamped);
  const height = (size / 200) * 118;

  return (
    <svg
      viewBox="0 0 200 118"
      width={size}
      height={height}
      style={{ display: 'block', overflow: 'visible' }}
      role="img"
      aria-label={`Risk score ${clamped}`}
    >
      <path
        d="M 18 103 A 82 82 0 0 1 182 103"
        fill="none"
        stroke="rgba(105,120,143,.15)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M 18 103 A 82 82 0 0 1 182 103"
        fill="none"
        stroke={color}
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={dash}
      />
      <text
        x="100"
        y="88"
        textAnchor="middle"
        fill="var(--color-text)"
        style={{ font: '700 34px var(--font-mono)' }}
      >
        {Math.round(clamped)}
      </text>
      <text
        x="100"
        y="107"
        textAnchor="middle"
        fill={color}
        style={{ font: '600 9px var(--font-sans)', letterSpacing: '.08em' }}
      >
        {riskLabel(clamped)}
      </text>
    </svg>
  );
}
