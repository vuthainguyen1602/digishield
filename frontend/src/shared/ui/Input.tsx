import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './Field.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional field label rendered above the input. */
  label?: ReactNode;
  /** Optional helper / error message below the input. */
  hint?: ReactNode;
}

/** Text input styled to the prototype (input-bg surface, 8px radius). */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, className, id, ...rest },
  ref,
) {
  const control = (
    <input
      ref={ref}
      id={id}
      className={[styles.input, className ?? ''].filter(Boolean).join(' ')}
      {...rest}
    />
  );
  if (!label && !hint) return control;
  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      ) : null}
      {control}
      {hint ? <div className={styles.hint}>{hint}</div> : null}
    </div>
  );
});
