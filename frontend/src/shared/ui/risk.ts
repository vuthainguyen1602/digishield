/** Risk-scale helpers (0–100), shared by gauge / pills / bars. */

export function riskColor(score: number): string {
  if (score >= 70) return 'var(--risk-high)';
  if (score >= 40) return 'var(--risk-medium)';
  return 'var(--risk-low)';
}

/** Vietnamese risk band label, matching the prototype gauge caption. */
export function riskLabel(score: number): string {
  if (score >= 70) return 'CAO';
  if (score >= 40) return 'TRUNG BÌNH';
  return 'THẤP';
}
