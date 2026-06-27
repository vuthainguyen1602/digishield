// Centralized MOCK fixtures shared across feature pages.
// TODO: replace all of these with generated useXxx() hooks from `@/api/generated`.
// Data shapes are intentionally aligned to the OpenAPI schema.

export type AiLabel = 'clean' | 'spam' | 'threat';

/** Maps an AI label to a StatusPill variant. */
export type StatusVariant = 'safe' | 'warning' | 'threat' | 'neutral';

export function aiLabelToVariant(label: AiLabel): StatusVariant {
  switch (label) {
    case 'clean':
      return 'safe';
    case 'spam':
      return 'warning';
    case 'threat':
      return 'threat';
    default:
      return 'neutral';
  }
}

/** Risk colors: <40 green, 40-69 amber, 70-100 red. */
export function riskToVariant(score: number): StatusVariant {
  if (score >= 70) return 'threat';
  if (score >= 40) return 'warning';
  return 'safe';
}

export interface Report {
  id: string;
  reporter: string;
  subject: string;
  aiLabel: AiLabel;
  aiConfidence: number; // 0..1
  reportedAt: string; // ISO timestamp
}

export interface DepartmentRisk {
  id: string;
  name: string;
  riskScore: number; // 0..100
  phishPronePct: number; // 0..100
  headcount: number;
}

export interface Lesson {
  id: string;
  title: string;
  durationMin: number;
  completed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  earned: boolean;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
}

export const mockReports: Report[] = [
  {
    id: 'rep-1041',
    reporter: 'a.tran@acme.com',
    subject: 'Urgent: verify your payroll details',
    aiLabel: 'threat',
    aiConfidence: 0.94,
    reportedAt: '2026-06-27T08:12:00Z',
  },
  {
    id: 'rep-1040',
    reporter: 'l.nguyen@acme.com',
    subject: 'Your invoice #88231 is overdue',
    aiLabel: 'spam',
    aiConfidence: 0.71,
    reportedAt: '2026-06-27T07:48:00Z',
  },
  {
    id: 'rep-1039',
    reporter: 'k.patel@acme.com',
    subject: 'Weekly team sync notes',
    aiLabel: 'clean',
    aiConfidence: 0.88,
    reportedAt: '2026-06-27T07:10:00Z',
  },
  {
    id: 'rep-1038',
    reporter: 'm.silva@acme.com',
    subject: 'Action required: reset your VPN password',
    aiLabel: 'threat',
    aiConfidence: 0.82,
    reportedAt: '2026-06-26T19:33:00Z',
  },
  {
    id: 'rep-1037',
    reporter: 'r.gomez@acme.com',
    subject: 'You have won a gift card',
    aiLabel: 'spam',
    aiConfidence: 0.63,
    reportedAt: '2026-06-26T16:05:00Z',
  },
];

export const mockDepartments: DepartmentRisk[] = [
  { id: 'dep-fin', name: 'Finance', riskScore: 78, phishPronePct: 24, headcount: 42 },
  { id: 'dep-ops', name: 'Operations', riskScore: 66, phishPronePct: 19, headcount: 88 },
  { id: 'dep-sup', name: 'Customer Support', riskScore: 58, phishPronePct: 17, headcount: 61 },
  { id: 'dep-eng', name: 'Engineering', riskScore: 31, phishPronePct: 8, headcount: 120 },
];

export const mockLessons: Lesson[] = [
  { id: 'les-101', title: 'Spotting credential-harvesting emails', durationMin: 8, completed: true },
  { id: 'les-102', title: 'Business email compromise (BEC) basics', durationMin: 12, completed: false },
  { id: 'les-103', title: 'Safe handling of attachments and links', durationMin: 10, completed: false },
  { id: 'les-104', title: 'Reporting suspicious messages quickly', durationMin: 6, completed: false },
];

export const mockBadges: Badge[] = [
  { id: 'bdg-1', name: 'First report', earned: true },
  { id: 'bdg-2', name: 'Phishing spotter', earned: true },
  { id: 'bdg-3', name: 'Streak: 5 lessons', earned: false },
  { id: 'bdg-4', name: 'Zero-click champion', earned: false },
];

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'An email asks you to urgently confirm your password via a link. What is the safest action?',
    options: [
      { id: 'a', label: 'Click the link and enter your password' },
      { id: 'b', label: 'Reply asking for more details' },
      { id: 'c', label: 'Report the email and do not click the link' },
      { id: 'd', label: 'Forward it to a colleague to check' },
    ],
  },
  {
    id: 'q2',
    prompt: 'Which sign most strongly suggests a phishing message?',
    options: [
      { id: 'a', label: 'The sender domain does not match the company it claims to be from' },
      { id: 'b', label: 'The email has a company logo' },
      { id: 'c', label: 'It was sent during business hours' },
      { id: 'd', label: 'It is addressed to your name' },
    ],
  },
  {
    id: 'q3',
    prompt: 'You receive an unexpected invoice attachment from an unknown sender. You should:',
    options: [
      { id: 'a', label: 'Open it to see what it is' },
      { id: 'b', label: 'Enable macros if prompted' },
      { id: 'c', label: 'Report it and avoid opening the attachment' },
      { id: 'd', label: 'Print it for your records' },
    ],
  },
  {
    id: 'q4',
    prompt: 'A "CEO" emails requesting an urgent wire transfer and secrecy. This is most likely:',
    options: [
      { id: 'a', label: 'A normal request you should action immediately' },
      { id: 'b', label: 'Business email compromise (BEC) — verify out of band' },
      { id: 'c', label: 'A test you can ignore' },
      { id: 'd', label: 'Spam you should delete silently' },
    ],
  },
];

/** Triage-queue rows derived from reports but with computed "age". */
export interface TriageItem extends Report {
  ageLabel: string;
}

export const mockTriageQueue: TriageItem[] = mockReports.map((r) => ({
  ...r,
  ageLabel: relativeAge(r.reportedAt),
}));

export function relativeAge(iso: string, now: Date = new Date('2026-06-27T09:00:00Z')): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

export function formatConfidence(c: number): string {
  return `${Math.round(c * 100)}%`;
}
