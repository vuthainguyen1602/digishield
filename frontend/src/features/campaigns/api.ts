import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';

/**
 * Thin, hand-written typed fetchers + hooks for the simulation campaigns
 * screens.
 *
 * - `GET /sim/campaigns/{id}` -> `SimCampaignDetailDto` (results page funnel).
 * - `POST /sim/campaigns` -> `SimCampaign` entity (wizard launch).
 *
 * `SimCampaignDetailDto` uses explicit `@JsonProperty` camelCase names; the
 * serialized `SimCampaign` entity exposes its getters as camelCase too.
 */

/** Aggregated funnel counts (`SimCampaignDetailDto.Funnel`). */
export interface CampaignFunnel {
  delivered: number;
  open: number;
  click: number;
  submit: number;
  report: number;
}

/** A single per-user result row (`SimCampaignDetailDto.ResultRow`). */
export interface CampaignResultRow {
  name: string | null;
  department: string | null;
  /** lowercase action, e.g. "click". */
  action: string | null;
  /** lowercase learning status. */
  learningStatus: string | null;
}

/** Wire shape of `SimCampaignDetailDto`. */
export interface CampaignDetail {
  id: string;
  name: string | null;
  /** lowercase channel, e.g. "email". */
  channel: string | null;
  /** lowercase status, e.g. "completed". */
  status: string | null;
  templateId: string | null;
  funnel: CampaignFunnel | null;
  results: CampaignResultRow[] | null;
}

/** Wire shape of the `SimCampaign` entity returned by the create endpoint. */
export interface SimCampaign {
  id: string;
  tenantId: string | null;
  /** UPPERCASE enum on the wire, e.g. "EMAIL". */
  channel: string | null;
  /** UPPERCASE enum on the wire, e.g. "DRAFT". */
  status: string | null;
  templateId: string | null;
  name: string | null;
}

/** Body for `POST /sim/campaigns`. `channel` is the UPPERCASE `Channel` enum. */
export interface CreateCampaignRequest {
  channel: string;
  templateId?: string | null;
}

/** GET /sim/campaigns/{id} — campaign detail (summary + funnel + results). */
export function fetchCampaign(id: string, signal?: AbortSignal): Promise<CampaignDetail> {
  return apiRequest<CampaignDetail>({
    url: `/sim/campaigns/${id}`,
    method: 'GET',
    ...(signal ? { signal } : {}),
  });
}

/** POST /sim/campaigns — create a simulation campaign. */
export function createCampaign(body: CreateCampaignRequest): Promise<SimCampaign> {
  return apiRequest<SimCampaign>({
    url: '/sim/campaigns',
    method: 'POST',
    data: body,
  });
}

/** TanStack Query hook powering {@link CampaignResultsPage}. */
export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.simCampaign(id ?? ''),
    queryFn: ({ signal }) => fetchCampaign(id as string, signal),
    enabled: Boolean(id),
  });
}

/** TanStack Mutation hook powering {@link CampaignWizardPage} launch. */
export function useCreateCampaign() {
  return useMutation({
    mutationFn: (body: CreateCampaignRequest) => createCampaign(body),
  });
}
