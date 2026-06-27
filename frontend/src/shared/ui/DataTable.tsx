import { type Key, type ReactNode } from 'react';
import styles from './DataTable.module.css';

export interface ColumnDef<T> {
  /** Stable column id. */
  id: string;
  /** Header label. */
  header: ReactNode;
  /** Cell renderer; receives the full row. */
  cell: (row: T) => ReactNode;
  /** Optional alignment. */
  align?: 'left' | 'center' | 'right';
  /** Optional fixed/explicit width (CSS value). */
  width?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  /** Extract a stable React key per row. */
  rowKey: (row: T, index: number) => Key;
  /** Optional row click handler (makes rows interactive). */
  onRowClick?: (row: T) => void;
  /** Shown when data is empty. */
  emptyMessage?: ReactNode;
  /** Loading state. */
  loading?: boolean;
  /** Accessible caption for screen readers. */
  caption?: string;
}

/** Generic, typed, accessible data table. Styling via design tokens. */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  emptyMessage = 'No data.',
  loading = false,
  caption,
}: DataTableProps<T>) {
  return (
    <div className={styles.wrapper} role="region" aria-busy={loading || undefined}>
      <table className={styles.table}>
        {caption ? <caption className="visually-hidden">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                style={{ textAlign: col.align ?? 'left', width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className={styles.state} colSpan={columns.length}>
                Loading…
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td className={styles.state} colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                className={onRowClick ? styles.clickable : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((col) => (
                  <td key={col.id} style={{ textAlign: col.align ?? 'left' }}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
