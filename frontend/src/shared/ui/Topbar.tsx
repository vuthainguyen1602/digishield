import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '@/app/auth/useAuth';
import { useNotifications } from '@/features/notifications/api';
import { NotificationBell } from './NotificationBell';
import { titleForPath } from './pageTitles';
import styles from './Topbar.module.css';

/** Format an ISO instant as a short relative label (best effort). */
function relativeLabel(iso: string | null | undefined): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.round(hours / 24)} ngày trước`;
}

/** Top bar: page title + global search + notification bell + avatar. */
export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: notifications } = useNotifications();

  const bellItems = (notifications ?? []).map((n, i) => {
    const critical = n.type === 'alert';
    const meta = [relativeLabel(n.scheduledAt), n.type].filter(Boolean).join(' · ');
    return {
      id: i,
      title: n.title ?? n.body ?? '(không có tiêu đề)',
      meta,
      critical,
    };
  });
  const unread = (notifications ?? []).filter((n) => n.status !== 'read').length;

  const initials = (user?.name ?? user?.email ?? 'NT')
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className={styles.topbar}>
      <div className={styles.title}>{titleForPath(pathname)}</div>

      <button type="button" className={styles.search}>
        <Search size={13} strokeWidth={2.5} color="var(--color-muted)" />
        <span className={styles.searchPlaceholder}>Tìm kiếm...</span>
      </button>

      <NotificationBell count={unread} notifications={bellItems} />

      <button
        type="button"
        className={styles.avatar}
        aria-label="Đăng xuất"
        onClick={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      >
        {initials}
      </button>
    </header>
  );
}
