import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';

/**
 * Thin, hand-written typed mutation for the Content Studio "generate" action.
 *
 * `POST /ai/templates/generate` accepts a `{ prompt }` body and returns a
 * `TemplateDraft` record (`subject` / `body` / `verdict`, plain camelCase).
 */

/** Body for `POST /ai/templates/generate`. */
export interface GenerateTemplateRequest {
  prompt: string;
}

/** Wire shape of `TemplateDraft`. */
export interface TemplateDraft {
  subject: string | null;
  body: string | null;
  /** moderation verdict, e.g. "SAFE" / "NEEDS_REVIEW" / "BLOCKED". */
  verdict: string | null;
}

/** POST /ai/templates/generate — AI-generate a template draft from a prompt. */
export function generateTemplate(body: GenerateTemplateRequest): Promise<TemplateDraft> {
  return apiRequest<TemplateDraft>({
    url: '/ai/templates/generate',
    method: 'POST',
    data: body,
  });
}

/** TanStack Mutation hook powering the {@link ContentStudioPage} generate action. */
export function useGenerateTemplate() {
  return useMutation({
    mutationFn: (body: GenerateTemplateRequest) => generateTemplate(body),
  });
}

/**
 * Wire shape of `SimTemplate` (`GET /ai/templates`). Enum-backed fields are
 * lowercase and the body reference is snake_case (`body_ref`), matching the BE.
 */
export interface SimTemplate {
  id: string;
  channel: string;
  subject: string;
  body_ref: string;
  difficulty: string;
  status: string;
}

/** GET /ai/templates — the saved simulation-template library for the tenant. */
export function fetchTemplates(signal?: AbortSignal): Promise<SimTemplate[]> {
  return apiRequest<SimTemplate[]>({
    url: '/ai/templates',
    method: 'GET',
    ...(signal ? { signal } : {}),
  });
}

/** TanStack Query hook powering the template library in {@link ContentStudioPage}. */
export function useTemplates() {
  return useQuery({
    queryKey: queryKeys.aiTemplates,
    queryFn: ({ signal }) => fetchTemplates(signal),
  });
}
