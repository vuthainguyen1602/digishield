import { Button } from '@/shared/ui';

/**
 * InterventionLogPage — transaction-risk intervention audit log (`/soc/interventions`).
 *
 * Design-consistent placeholder following the prototype: 4 decision KPIs
 * (Allow / Warn / Pause / Block) + an audit table with risk signals, decisions
 * and scores (JetBrains Mono).
 *
 * TODO: replace MOCK data with generated useInterventionLog() hook from @/api/generated.
 */

type Decision = 'ALLOW' | 'WARN' | 'PAUSE' | 'BLOCK';

interface LogRow {
  id: string;
  time: string;
  signal: string;
  transaction: string;
  decision: Decision;
  score: number;
}

const DECISION_BADGE: Record<Decision, { bg: string; color: string }> = {
  ALLOW: { bg: '#DDF3E6', color: '#0F7A4A' },
  WARN: { bg: '#FCEBCF', color: '#C0720A' },
  PAUSE: { bg: '#FCEBCF', color: '#C0720A' },
  BLOCK: { bg: '#FBE0DF', color: '#BE2A2F' },
};

const KPIS: { label: string; value: string; color: string }[] = [
  { label: 'Allow', value: '1.842', color: 'var(--teal)' },
  { label: 'Warn', value: '247', color: 'var(--amber)' },
  { label: 'Pause', value: '38', color: 'var(--red)' },
  { label: 'Block', value: '12', color: '#BE2A2F' },
];

// TODO: replace with generated useInterventionLog() hook from @/api/generated.
const MOCK_ROWS: LogRow[] = [
  { id: 'i1', time: '27/06 09:14', signal: 'Đang nghe gọi + TK mới + số tiền lớn', transaction: '50tr → TK mới VCB', decision: 'PAUSE', score: 87 },
  { id: 'i2', time: '27/06 08:52', signal: 'TK trong blacklist NCSC', transaction: '12tr → TK blacklisted', decision: 'BLOCK', score: 96 },
  { id: 'i3', time: '27/06 08:31', signal: 'Giao dịch thông thường', transaction: '2tr → TK quen', decision: 'ALLOW', score: 8 },
];

const GRID = '130px 1fr 1fr 100px 80px';

export default function InterventionLogPage() {
  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <header
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div>
            <h1 style={pageTitle}>Nhật ký can thiệp · Intervention Log</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
              SDK đánh giá rủi ro giao dịch · Phục vụ kiểm toán
            </p>
          </div>
          {/* TODO: wire to generated export endpoint from @/api/generated. */}
          <Button type="button" variant="secondary">
            Xuất CSV
          </Button>
        </header>

        {/* KPI tiles */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 14,
          }}
        >
          {KPIS.map((k) => (
            <div
              key={k.label}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: 14,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Grotesk', system-ui",
                  fontSize: 26,
                  fontWeight: 700,
                  color: k.color,
                }}
              >
                {k.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Log table */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg)',
            }}
          >
            {['Thời gian', 'Tín hiệu rủi ro', 'Giao dịch', 'Quyết định', 'Score'].map((h) => (
              <div key={h} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)' }}>
                {h}
              </div>
            ))}
          </div>

          {MOCK_ROWS.map((r, idx) => {
            const badge = DECISION_BADGE[r.decision];
            const last = idx === MOCK_ROWS.length - 1;
            const scoreColor = r.score >= 70 ? 'var(--red)' : r.score >= 40 ? 'var(--amber)' : 'var(--teal)';
            return (
              <div
                key={r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: GRID,
                  padding: '12px 16px',
                  borderBottom: last ? 'none' : '1px solid var(--border)',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--muted)' }}>
                  {r.time}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text)' }}>{r.signal}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{r.transaction}</div>
                <div>
                  <span
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      borderRadius: 999,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {r.decision}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 600,
                    color: scoreColor,
                  }}
                >
                  {r.score}
                </div>
              </div>
            );
          })}
        </div>
    </div>
  );
}

const pageTitle: React.CSSProperties = {
  fontFamily: "'Space Grotesk', system-ui",
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--text)',
  letterSpacing: '-0.02em',
  margin: 0,
};
