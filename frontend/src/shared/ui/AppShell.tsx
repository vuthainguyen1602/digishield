import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
}

/**
 * Authenticated application layout: left Sidebar + Topbar + scrollable content
 * outlet. Feature pages are rendered as `children` by the router.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content} id="main-content" tabIndex={-1}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>
    </div>
  );
}
