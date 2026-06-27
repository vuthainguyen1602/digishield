import { Button } from '@/shared/ui';
import { Award, ShieldCheck, Target, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLeaderboard, useUserBadges } from './api';

/**
 * GamificationPage — badge definitions, point rules, leaderboard scope.
 * Pixel-matched to the design handoff "GAMIFICATION" screen.
 *
 * Badges come from the live backend via `useUserBadges()`
 * (`GET /users/{id}/badges`) for the seeded demo learner, and the leaderboard
 * from `useLeaderboard()` (`GET /gamification/leaderboard`). Point rules stay
 * static (no BE endpoint). Loading/error/empty states handled below.
 */

// Seeded demo learner (dev profile) — the user whose badges/points are shown.
const DEMO_USER_ID = '22222222-2222-2222-2222-222222222222';

// BE `iconRef` hint → lucide icon.
const ICON_MAP: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  target: Target,
  zap: Zap,
  award: Award,
};

function iconFor(ref: string | null): LucideIcon {
  return (ref && ICON_MAP[ref]) || ShieldCheck;
}

const pointRules = [
  { label: 'Hoàn thành bài học', points: '+10đ', color: 'var(--color-blue)' },
  { label: 'Đạt bài kiểm tra (>=70%)', points: '+24đ', color: 'var(--color-blue)' },
  { label: 'Báo cáo email lừa đảo đúng', points: '+50đ', color: 'var(--color-teal)' },
  { label: 'Bấm link mô phỏng', points: '-5đ', color: 'var(--color-red)' },
];

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  padding: 20,
};

export default function GamificationPage() {
  const badges = useUserBadges(DEMO_USER_ID);
  const leaderboard = useLeaderboard();

  return (
    <>
      <div style={{ animation: 'fadeUp .3s ease' }}>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontFamily: "'Space Grotesk', system-ui",
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '-.02em',
              marginBottom: 4,
            }}
          >
            Gamification · Huy hiệu &amp; Điểm
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            Định nghĩa huy hiệu, quy tắc tích điểm và bảng xếp hạng
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Badges */}
          <div style={cardStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>Huy hiệu · Badges</div>
              <Button size="sm" variant="primary">
                + Thêm
              </Button>
            </div>

            {badges.isLoading && <InlineMessage>Đang tải huy hiệu…</InlineMessage>}
            {!badges.isLoading && badges.isError && (
              <InlineMessage>
                <span style={{ color: 'var(--color-red)', fontWeight: 600 }}>Không tải được huy hiệu. </span>
                <button type="button" onClick={() => badges.refetch()} style={inlineRetry}>
                  Thử lại
                </button>
              </InlineMessage>
            )}
            {!badges.isLoading && !badges.isError && (badges.data?.length ?? 0) === 0 && (
              <InlineMessage>Chưa có huy hiệu nào.</InlineMessage>
            )}
            {!badges.isLoading && !badges.isError && (badges.data?.length ?? 0) > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(badges.data ?? []).map((b) => {
                  const Icon = iconFor(b.iconRef);
                  return (
                    <div
                      key={b.id}
                      style={{
                        background: 'var(--color-bg)',
                        borderRadius: 10,
                        padding: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <Icon size={26} color={b.earned ? 'var(--color-amber)' : 'var(--color-muted)'} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3 }}>
                          {b.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{b.description ?? ''}</div>
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: b.earned ? 'var(--color-teal)' : 'var(--color-muted)',
                          fontWeight: 500,
                        }}
                      >
                        {b.earned ? 'Đã đạt' : 'Chưa đạt'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Point rules + leaderboard */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>
              Quy tắc điểm · Point Rules
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pointRules.map((r) => (
                <div
                  key={r.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 10,
                    background: 'var(--color-bg)',
                    borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{r.label}</span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 14,
                      fontWeight: 700,
                      color: r.color,
                    }}
                  >
                    {r.points}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>
                Bảng xếp hạng
              </div>

              {leaderboard.isLoading && <InlineMessage>Đang tải bảng xếp hạng…</InlineMessage>}
              {!leaderboard.isLoading && leaderboard.isError && (
                <InlineMessage>
                  <span style={{ color: 'var(--color-red)', fontWeight: 600 }}>Không tải được bảng xếp hạng. </span>
                  <button type="button" onClick={() => leaderboard.refetch()} style={inlineRetry}>
                    Thử lại
                  </button>
                </InlineMessage>
              )}
              {!leaderboard.isLoading && !leaderboard.isError && (leaderboard.data?.length ?? 0) === 0 && (
                <InlineMessage>Chưa có dữ liệu xếp hạng.</InlineMessage>
              )}
              {!leaderboard.isLoading && !leaderboard.isError && (leaderboard.data?.length ?? 0) > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(leaderboard.data ?? []).map((row) => (
                    <div
                      key={`${row.rank}-${row.name}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        background: 'var(--color-bg)',
                        borderRadius: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--color-blue)',
                          width: 24,
                        }}
                      >
                        #{row.rank}
                      </span>
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text)' }}>{row.name}</span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--color-teal)',
                        }}
                      >
                        {row.points.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InlineMessage({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{children}</div>;
}

const inlineRetry: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-blue)',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  padding: 0,
};
