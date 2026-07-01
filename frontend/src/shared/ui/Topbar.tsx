import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '@/app/auth/useAuth';
import { useNotifications } from '@/features/notifications/api';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { NotificationBell } from './NotificationBell';
import { LanguageSwitcher } from './LanguageSwitcher';
import { titleForPath } from './pageTitles';
import styles from './Topbar.module.css';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** Format an ISO instant as a short relative label (best effort). */
function relativeLabel(iso: string | null | undefined, t: Translate): string {
  if (!iso) return '';
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return '';
  const mins = Math.max(0, Math.round((Date.now() - ms) / 60000));
  if (mins < 1) return t('vừa xong');
  if (mins < 60) return t('{n} phút trước', { n: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24) return t('{n} giờ trước', { n: hours });
  return t('{n} ngày trước', { n: Math.round(hours / 24) });
}

/** Top bar: page title + global search + notification bell + avatar. */
export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: notifications } = useNotifications();
  const { lang, t } = useI18n();

  const bellItems = (notifications ?? []).map((n, i) => {
    const critical = n.type === 'alert';
    const meta = [relativeLabel(n.scheduledAt, t), n.type].filter(Boolean).join(' · ');
    return {
      id: i,
      title: n.title ?? n.body ?? t('(không có tiêu đề)'),
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
      <div className={styles.title}>{titleForPath(pathname, lang)}</div>

      <button type="button" className={styles.search}>
        <Search size={13} strokeWidth={2.5} color="var(--color-muted)" />
        <span className={styles.searchPlaceholder}>{t('Tìm kiếm...')}</span>
      </button>

      <LanguageSwitcher />

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
