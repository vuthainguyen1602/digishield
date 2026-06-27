import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';

/**
 * Thin, hand-written typed fetcher + hook for the Users screen.
 *
 * Mirrors `UserView` from the auth module (`GET /api/v1/users`). The BE emits
 * both camelCase (`riskScore`) and snake_case (`org_id`, `risk_score`) wire
 * fields via `@JsonProperty`; the page reads `dept`/`risk`, so the hook maps
 * `department` -> `dept` and `riskScore`/`risk_score` -> `risk`.
 */

/** Raw `UserView` as emitted on the wire by the BE. */
export interface UserViewDto {
  id: string;
  org_id: string | null;
  email: string | null;
  name: string | null;
  role: string | null;
  status: string | null;
  department: string | null;
  riskScore: number | null;
  risk_score: number | null;
}

/** FE-facing row consumed by {@link UsersPage}. */
export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  dept: string;
  risk: number;
}

/** GET /users — list users of the current tenant. */
export function fetchUsers(signal?: AbortSignal): Promise<UserViewDto[]> {
  return apiRequest<UserViewDto[]>({
    url: '/users',
    method: 'GET',
    ...(signal ? { signal } : {}),
  });
}

/** Map a backend `UserView` onto the FE row (dept/risk field rename). */
export function toUserRow(dto: UserViewDto): UserRow {
  return {
    id: dto.id,
    name: dto.name ?? '—',
    email: dto.email ?? '',
    role: dto.role ?? '',
    dept: dto.department ?? '',
    risk: dto.riskScore ?? dto.risk_score ?? 0,
  };
}

/** TanStack Query hook powering {@link UsersPage}; returns mapped rows. */
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: ({ signal }) => fetchUsers(signal),
    select: (data) => data.map(toUserRow),
  });
}
