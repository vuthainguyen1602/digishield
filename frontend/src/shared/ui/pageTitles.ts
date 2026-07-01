import type { Lang } from '@/shared/i18n/messages';

/** Route → page title (Vietnamese / English), from the prototype topbar. */
const TITLES: { match: RegExp; vi: string; en: string }[] = [
  { match: /^\/dashboard/, vi: 'Tổng quan', en: 'Overview' },
  { match: /^\/campaigns\/new/, vi: 'Tạo chiến dịch', en: 'Campaign Wizard' },
  { match: /^\/campaigns\//, vi: 'Kết quả chiến dịch', en: 'Campaign Results' },
  { match: /^\/users/, vi: 'Người dùng & Nhóm', en: 'Users & Groups' },
  { match: /^\/compliance/, vi: 'Tuân thủ', en: 'Compliance' },
  { match: /^\/content\/studio/, vi: 'Content Studio', en: 'Content Studio' },
  { match: /^\/settings\/org/, vi: 'Cài đặt tổ chức', en: 'Org Settings' },
  { match: /^\/gamification/, vi: 'Gamification', en: 'Gamification' },
  { match: /^\/aida/, vi: 'AI Orchestration', en: 'AI Orchestration' },
  { match: /^\/super\/tenants/, vi: 'Quản trị Tenant', en: 'Tenant Console' },
  { match: /^\/super\/scim/, vi: 'SCIM & SSO Config', en: 'SCIM & SSO Config' },
  { match: /^\/super\/audit/, vi: 'Nhật ký kiểm toán', en: 'Audit Log' },
  { match: /^\/learn\/courses/, vi: 'Khóa học', en: 'Courses' },
  { match: /^\/learn\/lessons/, vi: 'Học bài', en: 'Lesson' },
  { match: /^\/learn\/quiz\/[^/]+\/results/, vi: 'Kết quả bài kiểm tra', en: 'Quiz Results' },
  { match: /^\/learn\/quiz/, vi: 'Bài kiểm tra', en: 'Quiz' },
  { match: /^\/learn/, vi: 'Cổng học viên', en: 'Learner Portal' },
  { match: /^\/certificates/, vi: 'Chứng chỉ', en: 'Certificates' },
  { match: /^\/soc\/inbox/, vi: 'Hộp báo cáo', en: 'SOC Inbox' },
  { match: /^\/soc\/alerts/, vi: 'Trung tâm cảnh báo', en: 'Alert Center' },
  { match: /^\/soc\/watchlist/, vi: 'Watchlist', en: 'Watchlist' },
];

export function titleForPath(pathname: string, lang: Lang = 'vi'): string {
  const entry = TITLES.find((t) => t.match.test(pathname));
  if (!entry) return 'DigiShield';
  return lang === 'en' ? entry.en : entry.vi;
}
