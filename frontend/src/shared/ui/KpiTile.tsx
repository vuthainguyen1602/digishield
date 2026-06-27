import { type ReactNode } from 'react';
import styles from './KpiTile.module.css';

export type TrendDirection = 'up' | 'down';

export interface KpiTileProps {
  label: string;
  /** Primary metric value (omit when embedding a gauge via children). */
  value?: ReactNode;
  /** Small caption under the value (e.g. "vs last 30 days"). */
  hint?: ReactNode;
  /** Optional trend badge. */
  trend?: { dir: TrendDirection; text: string };
  /** Embed custom content (e.g. a gauge or breakdown list). */
  children?: ReactNode;
}

/** Compact KPI / metric tile for dashboards. */
export function KpiTile({ label, value, hint, trend, children }: KpiTileProps) {
  return (
    <div className={styles.tile}>
      <span className={styles.label}>{label}</span>
      {value !== undefined ? <span className={styles.value}>{value}</span> : null}
      {trend ? (
        <span className={styles.trend}>
          <span className={styles.trendArrow}>{trend.dir === 'up' ? '▲' : '▼'}</span>{' '}
          {trend.text}
        </span>
      ) : null}
      {hint ? <span className={styles.hint}>{hint}</span> : null}
      {children}
    </div>
  );
}
