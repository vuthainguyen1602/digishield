/**
 * Lightweight i18n: the Vietnamese source string is the key. `vi` is the
 * identity (returns the key), `en` is looked up here with a fallback to the key.
 * Add English entries as screens are localized — untranslated strings simply
 * stay Vietnamese until an entry exists.
 */
export type Lang = 'vi' | 'en';

export const EN: Record<string, string> = {
  // --- App shell / nav (roles.ts labels + sections) ---
  'Tổng quan': 'Overview',
  'Mô phỏng': 'Simulations',
  'Người dùng & Nhóm': 'Users & Groups',
  'Tuân thủ': 'Compliance',
  'Content Studio': 'Content Studio',
  'Nhật ký kiểm toán': 'Audit Log',
  'Cài đặt tổ chức': 'Org Settings',
  Gamification: 'Gamification',
  'AI Orchestration': 'AI Orchestration',
  'Cổng học viên': 'Learner Portal',
  'Khóa học': 'Courses',
  'Bài kiểm tra': 'Quiz',
  'Chứng chỉ của tôi': 'My Certificates',
  'Hộp báo cáo': 'Report Inbox',
  'Trung tâm cảnh báo': 'Alert Center',
  Watchlist: 'Watchlist',
  'Quản trị Tenant': 'Tenant Console',
  'SCIM & SSO Config': 'SCIM & SSO Config',
  // sections
  'Quản trị · Admin': 'Administration · Admin',
  'Hệ thống': 'System',
  'Học viên · Learner': 'Learner',
  'SOC Analyst': 'SOC Analyst',
  'Super Admin': 'Super Admin',

  // --- Sidebar / Topbar chrome ---
  'Hồ sơ & Cài đặt': 'Profile & Settings',
  'Tìm kiếm...': 'Search...',
  '(không có tiêu đề)': '(no title)',
  'vừa xong': 'just now',
  '{n} phút trước': '{n} min ago',
  '{n} giờ trước': '{n} h ago',
  '{n} ngày trước': '{n} d ago',

  // --- Login ---
  'Đăng nhập': 'Sign in',
  'Đang đăng nhập…': 'Signing in…',
  'Quên mật khẩu?': 'Forgot password?',
  'Nền tảng nhận thức an ninh số': 'Digital Security Awareness Platform',
  'Đăng nhập bằng tài khoản tổ chức (AWS Cognito).': 'Sign in with your organization account (AWS Cognito).',
  'Chọn vai trò để đăng nhập': 'Pick a role to sign in',
  'Vai trò': 'Role',
  'Email công việc': 'Work email',
  'Mật khẩu': 'Password',
  'Đăng nhập bằng SSO (Entra ID / Google Workspace)': 'Sign in with SSO (Entra ID / Google Workspace)',

  // --- Dashboard ---
  'Thử lại': 'Retry',
  'Đang tải bảng điều khiển…': 'Loading the dashboard…',
  'Không tải được dữ liệu bảng điều khiển': 'Could not load the dashboard',
  'Vui lòng kiểm tra kết nối tới máy chủ rồi thử lại.': 'Check the server connection and try again.',
  'Hoàn thành ĐT': 'Training done',
  'Cảnh báo mở': 'Open alerts',
  'TB ngành gov': 'Gov avg',
  'so tháng trước': 'vs last month',
  'vs tháng trước': 'vs last month',
  'trong tháng': 'this month',
  'hoàn thành': 'completed',
  'Xu hướng rủi ro': 'Risk trend',
  'ngày qua': 'days',
  'So chuẩn ngành': 'Industry benchmark',
  'Phòng ban rủi ro cao': 'High-risk departments',
  'Chưa có dữ liệu phòng ban.': 'No department data yet.',
  'Báo cáo gần đây': 'Recent reports',
  'Xem tất cả': 'View all',
  'Chưa có báo cáo nào.': 'No reports yet.',
};

/** Translate a source (Vietnamese) string; supports `{name}` interpolation. */
export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let out = lang === 'en' ? (EN[key] ?? key) : key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return out;
}
