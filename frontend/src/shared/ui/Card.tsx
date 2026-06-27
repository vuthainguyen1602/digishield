import { type HTMLAttributes, type ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional header title. */
  title?: ReactNode;
  /** Optional subtitle beneath the title. */
  subtitle?: ReactNode;
  /** Optional actions rendered in the header (right side). */
  actions?: ReactNode;
  /** Apply inner body padding (default true). Set false for edge-to-edge tables. */
  padded?: boolean;
}

/** Surface container with optional header. */
export function Card({
  title,
  subtitle,
  actions,
  padded = true,
  className,
  children,
  ...rest
}: CardProps) {
  const classes = [styles.card, className ?? ''].filter(Boolean).join(' ');
  return (
    <section className={classes} {...rest}>
      {(title || subtitle || actions) && (
        <header className={styles.header}>
          <div className={styles.heading}>
            {title ? <div className={styles.title}>{title}</div> : null}
            {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </header>
      )}
      <div className={padded ? styles.body : styles.bodyFlush}>{children}</div>
    </section>
  );
}
