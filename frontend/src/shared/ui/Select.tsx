import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import styles from './Field.module.css';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  hint?: ReactNode;
}

/** Native select styled to match the prototype inputs. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, className, id, children, ...rest },
  ref,
) {
  const control = (
    <select
      ref={ref}
      id={id}
      className={[styles.input, styles.select, className ?? ''].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </select>
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
