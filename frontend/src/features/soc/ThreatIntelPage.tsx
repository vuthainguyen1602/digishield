import { Button, useToast } from '@/shared/ui';

/**
 * ThreatIntelPage — threat intelligence feed (`/soc/threat-intel`).
 *
 * Design-consistent placeholder following the prototype: a table of incoming
 * threats with source, status badge, detection date and a ThreatFlip action.
 *
 * TODO: replace MOCK data with generated useThreatIntel() hook from @/api/generated.
 */

type TiStatus = 'flipped' | 'pending' | 'new';

interface ThreatRow {
  id: string;
  title: string;
  meta: string;
  source: string;
  status: TiStatus;
  detectedAt: string;
}

const STATUS_BADGE: Record<TiStatus, { label: string; bg: string; color: string }> = {
  flipped: { label: 'Đã chuyển bài học', bg: '#DDF3E6', color: '#0F7A4A' },
  pending: { label: 'Chờ duyệt', bg: '#FCEBCF', color: '#C0720A' },
  new: { label: 'Mới nhận', bg: 'rgba(105,120,143,.12)', color: '#69788F' },
};

// TODO: replace with generated useThreatIntel() hook from @/api/generated.
const MOCK_ROWS: ThreatRow[] = [
  { id: 't1', title: 'Chiến dịch SMS giả Brandname VCB', meta: 'SMS · Smishing · Tín dụng', source: 'NCSC', status: 'flipped', detectedAt: '25/06/2026' },
  { id: 't2', title: 'Deepfake giả giọng giám đốc chuyển tiền', meta: 'Vishing · Deepfake audio', source: 'User report', status: 'pending', detectedAt: '27/06/2026' },
  { id: 't3', title: 'QR code giả tại cây ATM', meta: 'Quishing · Thực địa', source: 'A05 · CQCS', status: 'new', detectedAt: '27/06/2026' },
];

const GRID = '1fr 100px 120px 120px 100px';

export default function ThreatIntelPage() {
  const toast = useToast();

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <header style={{ marginBottom: 20 }}>
          <h1 style={pageTitle}>Threat Intelligence</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Nguồn tình báo mối đe dọa · ThreatFlip để biến thành bài học
          </p>
        </header>

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
            {['Mối đe dọa', 'Nguồn', 'Trạng thái', 'Phát hiện'].map((h) => (
              <div key={h} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)' }}>
                {h}
              </div>
            ))}
            <div />
          </div>

          {MOCK_ROWS.map((r, idx) => {
            const badge = STATUS_BADGE[r.status];
            const last = idx === MOCK_ROWS.length - 1;
            return (
              <div
                key={r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: GRID,
                  padding: '13px 16px',
                  borderBottom: last ? 'none' : '1px solid var(--border)',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{r.meta}</div>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{r.source}</div>
                <div>
                  <span
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      borderRadius: 999,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.detectedAt}</div>
                <div>
                  {r.status === 'flipped' ? (
                    <button
                      type="button"
                      onClick={() => toast('Mở bài học')}
                      style={{ all: 'unset', fontSize: 12, color: 'var(--blue)', cursor: 'pointer' }}
                    >
                      Xem bài
                    </button>
                  ) : (
                    <Button type="button" variant="primary" size="sm" onClick={() => toast('ThreatFlip đã tạo bài học')}>
                      ThreatFlip
                    </Button>
                  )}
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
