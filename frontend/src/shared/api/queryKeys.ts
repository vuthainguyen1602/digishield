/**
 * Centralized TanStack Query keys for the hand-written data hooks that talk to
 * the live backend. Keeping them in one place avoids cache-key collisions and
 * makes invalidation predictable.
 */
export const queryKeys = {
  dashboard: ['analytics', 'dashboard'] as const,
  risk: (scope = 'org') => ['analytics', 'risk', scope] as const,
  benchmark: ['analytics', 'benchmark'] as const,
  phishingReports: (status?: string) => ['reports', 'phishing', status ?? 'all'] as const,
  courses: ['learning', 'courses'] as const,
  enrollments: (status?: string) => ['learning', 'enrollments', status ?? 'all'] as const,
  lesson: (id: string) => ['learning', 'lessons', id] as const,
  quiz: (id: string) => ['learning', 'lessons', id, 'quiz'] as const,
  certificate: (id: string) => ['learning', 'certificates', id] as const,
  blacklist: ['reports', 'blacklist'] as const,
  aiTemplates: ['ai', 'templates'] as const,
  aidaRuns: ['ai', 'orchestration', 'runs'] as const,
  threatIntel: ['reports', 'threat-intel'] as const,
  interventions: ['interception', 'interventions'] as const,
  notifications: ['notifications'] as const,
  users: ['auth', 'users'] as const,
  compliancePolicies: ['compliance', 'policies'] as const,
  complianceStatus: ['compliance', 'status'] as const,
  simCampaign: (id: string) => ['sim', 'campaign', id] as const,
  groups: ['tenancy', 'groups'] as const,
  // Tenancy (admin org settings)
  tenantSettings: (tenantId: string) => ['tenancy', 'settings', tenantId] as const,
  featureFlags: (tenantId: string) => ['tenancy', 'feature-flags', tenantId] as const,
  // Gamification (admin)
  leaderboard: ['gamification', 'leaderboard'] as const,
  userBadges: (userId: string) => ['gamification', 'badges', userId] as const,
  userPoints: (userId: string) => ['gamification', 'points', userId] as const,
  // Super admin
  tenants: ['tenancy', 'tenants'] as const,
  scimConfig: ['tenancy', 'scim'] as const,
  audit: ['tenancy', 'audit'] as const,
} as const;
