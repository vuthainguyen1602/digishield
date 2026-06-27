import { Fragment } from 'react';
import { Check } from 'lucide-react';

export interface StepperProps {
  steps: { label: string }[];
  /** 1-based index of the current step. */
  current: number;
}

/** Horizontal step indicator — 30px circles joined by connector lines. */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {steps.map((step, i) => {
        const n = i + 1;
        const completed = current > n;
        const active = current === n;
        const circleBg = completed
          ? 'var(--color-teal)'
          : active
            ? 'var(--color-blue)'
            : 'var(--color-border)';
        const circleColor = completed || active ? '#fff' : 'var(--color-muted)';
        const labelColor =
          completed || active ? 'var(--color-text)' : 'var(--color-muted)';
        const lineColor = completed ? 'var(--color-blue)' : 'var(--color-border)';

        return (
          <Fragment key={step.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: circleBg,
                  color: circleColor,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {completed ? <Check size={15} strokeWidth={3} /> : n}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: labelColor, whiteSpace: 'nowrap' }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: lineColor, margin: '0 12px' }} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
