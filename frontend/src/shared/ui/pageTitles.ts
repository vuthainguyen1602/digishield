/** Route → page title map (Vietnamese · English), from the prototype topbar. */
const TITLES: { match: RegExp; title: string }[] = [
  { match: /^\/dashboard/, title: 'Tổng quan · Overview' },
  { match: /^\/campaigns\/new/, title: 'Tạo chiến dịch · Campaign Wizard' },
  { match: /^\/campaigns\//, title: 'Kết quả chiến dịch · Results' },
  { match: /^\/users/, title: 'Người dùng & Nhóm · Users' },
  { match: /^\/compliance/, title: 'Tuân thủ · Compliance' },
  { match: /^\/content\/studio/, title: 'Content Studio · Soạn mẫu' },
  { match: /^\/settings\/org/, title: 'Cài đặt tổ chức · Org Settings' },
  { match: /^\/gamification/, title: 'Gamification · Huy hiệu & Điểm' },
  { match: /^\/aida/, title: 'AI Orchestration · AIDA' },
  { match: /^\/super\/tenants/, title: 'Quản trị Tenant · Super Admin' },
  { match: /^\/super\/scim/, title: 'SCIM & SSO Config' },
  { match: /^\/super\/audit/, title: 'Nhật ký kiểm toán · Audit Log' },
  { match: /^\/learn\/courses/, title: 'Khóa học · Courses' },
  { match: /^\/learn\/lessons/, title: 'Học bài · Lesson' },
  { match: /^\/learn\/quiz\/[^/]+\/results/, title: 'Kết quả bài kiểm tra' },
  { match: /^\/learn\/quiz/, title: 'Bài kiểm tra · Quiz' },
  { match: /^\/learn/, title: 'Cổng học viên · Portal' },
  { match: /^\/certificates/, title: 'Chứng chỉ · Certificates' },
  { match: /^\/soc\/inbox/, title: 'Hộp báo cáo · SOC Inbox' },
  { match: /^\/soc\/alerts/, title: 'Trung tâm cảnh báo · Alerts' },
  { match: /^\/soc\/watchlist/, title: 'Watchlist · Suspicious Accounts' },
];

export function titleForPath(pathname: string): string {
  return TITLES.find((t) => t.match.test(pathname))?.title ?? 'DigiShield';
}
