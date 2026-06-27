import { useMemo } from 'react';
import { Button, DataTable, StatusPill } from '@/shared/ui';
import type { ColumnDef, StatusVariant } from '@/shared/ui';
import { useTenants, type Tenant as TenantDto } from './api';

/**
 * TenantConsolePage — Super Admin multi-tenant overview.
 * Pixel-matched to the design handoff "SUPER ADMIN CONSOLE" screen.
 *
 * Data comes from the live backend via `useTenants()` (`GET /tenants`).
 * Loading/error/empty states handled below.
 */

type TenantRow = {
  id: string;
  org: string;
  domain: string;
  type: string;
  users: string;
  status: { text: string; variant: StatusVariant };
  region: string;
};

// BE lifecycle status (provisioning|active|suspended|deactivated) → pill.
const STATUS_META: Record<string, { text: string; variant: StatusVariant }> = {
  active: { text: 'Hoạt động', variant: 'safe' },
  provisioning: { text: 'Đang khởi tạo', variant: 'neutral' },
  suspended: { text: 'Tạm khóa', variant: 'neutral' },
  deactivated: { text: 'Ngừng hoạt động', variant: 'neutral' },
};

function statusMeta(status: string | null): { text: string; variant: StatusVariant } {
  if (status && STATUS_META[status]) return STATUS_META[status];
  return { text: status ?? '—', variant: 'neutral' };
}

/** Map a backend `TenantView` onto the table view model. */
function toRow(dto: TenantDto): TenantRow {
  return {
    id: dto.id,
    org: dto.name ?? '—',
    domain: dto.domain ?? '—',
    type: dto.tier ?? '—',
    users: dto.userCount != null ? dto.userCount.toLocaleString('vi-VN') : '—',
    status: statusMeta(dto.status),
    region: dto.dataRegion ?? '—',
  };
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
};

export default function TenantConsolePage() {
  const { data, isLoading, isError, refetch } = useTenants();

  const tenants = useMemo<TenantRow[]>(() => (data ?? []).map(toRow), [data]);

  const kpis = useMemo(() => {
    const activeCount = (data ?? []).filter((t) => t.status === 'active').length;
    const totalUsers = (data ?? []).reduce((sum, t) => sum + (t.userCount ?? 0), 0);
    const inCountry = (data ?? []).filter((t) => {
      const r = (t.dataRegion ?? '').toLowerCase();
      return r.includes('in-country') || r.includes('on-prem');
    }).length;
    return [
      { value: String(activeCount), label: 'Tenant hoạt động', color: 'var(--color-text)' },
      { value: totalUsers.toLocaleString('vi-VN'), label: 'Người dùng tổng', color: 'var(--color-teal)' },
      { value: String(inCountry), label: 'In-country / On-prem', color: 'var(--color-blue)' },
    ];
  }, [data]);

  const totalUsers = (data ?? []).reduce((sum, t) => sum + (t.userCount ?? 0), 0);

  const columns: ColumnDef<TenantRow>[] = [
    {
      id: 'org',
      header: 'Tổ chức',
      cell: (t) => (
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--color-text)' }}>{t.org}</div>
          <div style={{ fontSize: 11.5, color: 'var(--color-muted)' }}>{t.domain}</div>
        </div>
      ),
    },
    { id: 'type', header: 'Loại', cell: (t) => <span style={{ color: 'var(--color-muted)' }}>{t.type}</span>, width: '90px' },
    {
      id: 'users',
      header: 'Người dùng',
      cell: (t) => <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-text)' }}>{t.users}</span>,
      width: '110px',
    },
    {
      id: 'status',
      header: 'Trạng thái',
      cell: (t) => (
        <StatusPill variant={t.status.variant} dot>
          {t.status.text}
        </StatusPill>
      ),
      width: '130px',
    },
    {
      id: 'region',
      header: 'Vùng dữ liệu',
      cell: (t) => <span style={{ color: 'var(--color-muted)' }}>{t.region}</span>,
      width: '110px',
    },
    {
      id: 'manage',
      header: '',
      cell: () => (
        <button
          type="button"
          style={{ fontSize: 12, color: 'var(--color-blue)', cursor: 'pointer', background: 'none', border: 'none' }}
        >
          Quản lý
        </button>
      ),
      width: '80px',
      align: 'right',
    },
  ];

  return (
    <>
      <div style={{ animation: 'fadeUp .3s ease' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Space Grotesk', system-ui",
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--color-text)',
                letterSpacing: '-.02em',
              }}
            >
              Quản trị Tenant · Super Admin
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>
              {tenants.length} tổ chức · {totalUsers.toLocaleString('vi-VN')} người dùng tổng
            </div>
          </div>
          <Button variant="primary">+ Tạo tổ chức</Button>
        </div>

        {/* KPI cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
            marginBottom: 16,
          }}
        >
          {kpis.map((k) => (
            <div key={k.label} style={{ ...cardStyle, padding: 18, textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Space Grotesk', system-ui",
                  fontSize: 32,
                  fontWeight: 700,
                  color: k.color,
                }}
              >
                {k.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tenants table */}
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          {isLoading && <TableMessage>Đang tải danh sách tenant…</TableMessage>}
          {!isLoading && isError && (
            <TableMessage>
              <span style={{ color: 'var(--color-red)', fontWeight: 600 }}>Không tải được danh sách tenant. </span>
              <button type="button" onClick={() => refetch()} style={inlineRetry}>
                Thử lại
              </button>
            </TableMessage>
          )}
          {!isLoading && !isError && tenants.length === 0 && (
            <TableMessage>Chưa có tenant nào.</TableMessage>
          )}
          {!isLoading && !isError && tenants.length > 0 && (
            <DataTable<TenantRow> columns={columns} data={tenants} rowKey={(t) => t.id} />
          )}
        </div>
      </div>
    </>
  );
}

function TableMessage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13.5, color: 'var(--color-muted)' }}>
      {children}
    </div>
  );
}

const inlineRetry: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-blue)',
  fontWeight: 600,
  fontSize: 13.5,
  cursor: 'pointer',
  padding: 0,
};
