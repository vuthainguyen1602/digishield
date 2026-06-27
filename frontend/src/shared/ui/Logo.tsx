export interface LogoProps {
  /** Shield icon size in px (viewBox 0 0 36 36). Default 26. */
  size?: number;
  /** Show the "DigiShield" wordmark next to the shield. Default true. */
  withWordmark?: boolean;
  /** Wordmark font-size in px. Default 16. */
  wordmarkSize?: number;
  /** Wordmark color (CSS color/token). Default --color-text. */
  color?: string;
}

/** DigiShield brand mark — shield SVG + Space Grotesk wordmark (from prototype). */
export function Logo({
  size = 26,
  withWordmark = true,
  wordmarkSize = 16,
  color = 'var(--color-text)',
}: LogoProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
        <path
          d="M18 2L4 8v10c0 9.4 5.8 17.2 14 20.2C26.2 35.2 32 27.4 32 18V8z"
          fill="#2566EB"
        />
        <path
          d="M12 18l4 4 8-8"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark ? (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: wordmarkSize,
            fontWeight: 700,
            color,
            letterSpacing: '-.01em',
          }}
        >
          DigiShield
        </span>
      ) : null}
    </div>
  );
}
