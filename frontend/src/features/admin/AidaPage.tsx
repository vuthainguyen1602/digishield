import { useState } from 'react';
import { Button, Select, StatusPill } from '@/shared/ui';
import { useClassify, useEvaluateIntervention } from './api';

/**
 * AidaPage — AI Orchestration (Adaptive Intelligence Deployment Agent).
 * Pixel-matched to the design handoff "AIDA ORCHESTRATION" screen.
 *
 * There is no GET dashboard endpoint for AIDA. The interactive panels are wired
 * to the live backend via mutations:
 *  - "Chạy AIDA ngay" → POST /ai/classify (uses the selected scope/goal as the
 *    classification probe and surfaces the returned label).
 *  - "Đánh giá can thiệp" → POST /interventions/evaluate (sample transaction).
 * The "recent runs" panel below stays static — the BE exposes no run-history
 * endpoint.
 */

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  padding: 24,
};

// Static run history — no BE endpoint exposes AIDA run history.
const runs = [
  {
    id: 'run1',
    when: 'Chạy 25/06/2026 08:00',
    scope: 'Phạm vi: Toàn tổ chức · Mục tiêu: Hoàn thành bắt buộc',
    result: '87 người được tự động đăng ký khóa học mới',
  },
  {
    id: 'run2',
    when: 'Chạy 10/06/2026 07:30',
    scope: 'Phạm vi: Phòng Kế toán',
    result: '34 người được cập nhật lộ trình học',
  },
];

const SCOPE_LABELS: Record<string, string> = {
  org: 'Toàn tổ chức',
  acc: 'Phòng Kế toán',
  risk: 'Nhóm Risk Score cao',
};
const GOAL_LABELS: Record<string, string> = {
  reduce: 'Giảm Risk Score xuống dưới 50',
  mandatory: 'Hoàn thành lộ trình bắt buộc',
  prepare: 'Chuẩn bị cho chiến dịch mô phỏng',
};

export default function AidaPage() {
  const [scope, setScope] = useState('org');
  const [goal, setGoal] = useState('reduce');

  const classify = useClassify();
  const evaluate = useEvaluateIntervention();

  function runAida() {
    classify.mutate({
      content: `AIDA orchestration probe · Phạm vi: ${SCOPE_LABELS[scope] ?? scope} · Mục tiêu: ${GOAL_LABELS[goal] ?? goal}`,
    });
  }

  function runEvaluate() {
    evaluate.mutate({
      userId: '22222222-2222-2222-2222-222222222222',
      amount: 50_000_000,
      destAccount: '9999-8888-7777',
      onCall: true,
      newPayee: true,
    });
  }

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
            AI Orchestration · AIDA
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            Adaptive Intelligence Deployment Agent — tự động hóa lộ trình học
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Trigger AIDA */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 20 }}>
              Kích hoạt AIDA
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabel}>Phạm vi</label>
              <Select aria-label="Phạm vi" value={scope} onChange={(e) => setScope(e.target.value)}>
                <option value="org">Toàn tổ chức (1.240 người)</option>
                <option value="acc">Phòng Kế toán (212 người)</option>
                <option value="risk">Nhóm Risk Score cao (87 người)</option>
              </Select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={fieldLabel}>Mục tiêu</label>
              <Select aria-label="Mục tiêu" value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="reduce">Giảm Risk Score xuống dưới 50</option>
                <option value="mandatory">Hoàn thành lộ trình bắt buộc</option>
                <option value="prepare">Chuẩn bị cho chiến dịch mô phỏng</option>
              </Select>
            </div>
            <Button variant="primary" fullWidth onClick={runAida} disabled={classify.isPending}>
              {classify.isPending ? 'Đang chạy AIDA…' : 'Chạy AIDA ngay'}
            </Button>

            {/* Classify result (live: POST /ai/classify) */}
            {classify.isError && (
              <ResultBox tone="error">Không gọi được AIDA. Vui lòng thử lại.</ResultBox>
            )}
            {classify.data && (
              <ResultBox tone="info">
                AIDA phân loại nội dung: <strong>{classify.data.label}</strong>
              </ResultBox>
            )}

            {/* Intervention evaluation (live: POST /interventions/evaluate) */}
            <div style={{ marginTop: 14 }}>
              <Button variant="outline" fullWidth onClick={runEvaluate} disabled={evaluate.isPending}>
                {evaluate.isPending ? 'Đang đánh giá…' : 'Đánh giá can thiệp (mẫu)'}
              </Button>
            </div>
            {evaluate.isError && (
              <ResultBox tone="error">Không đánh giá được can thiệp. Vui lòng thử lại.</ResultBox>
            )}
            {evaluate.data && (
              <ResultBox tone="info">
                Quyết định: <strong>{evaluate.data.decision}</strong>
                {evaluate.data.signals?.length > 0 && ` · Tín hiệu: ${evaluate.data.signals.join(', ')}`}
                {evaluate.data.message && (
                  <div style={{ marginTop: 6, color: 'var(--color-muted)' }}>{evaluate.data.message}</div>
                )}
              </ResultBox>
            )}
          </div>

          {/* Recent runs (static — no BE run-history endpoint) */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 16 }}>
              Kết quả lần chạy gần nhất
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {runs.map((r) => (
                <div key={r.id} style={{ background: 'var(--color-bg)', borderRadius: 10, padding: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{r.when}</span>
                    <StatusPill variant="safe" dot={false}>
                      Thành công
                    </StatusPill>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--color-muted)', marginBottom: 6 }}>{r.scope}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-blue)', fontWeight: 500 }}>{r.result}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ResultBox({ tone, children }: { tone: 'info' | 'error'; children: React.ReactNode }) {
  const isError = tone === 'error';
  return (
    <div
      style={{
        marginTop: 14,
        background: isError ? 'rgba(221,59,64,.06)' : 'rgba(37,102,235,.06)',
        border: `1px solid ${isError ? 'rgba(221,59,64,.2)' : 'rgba(37,102,235,.15)'}`,
        borderRadius: 8,
        padding: '12px 16px',
        fontSize: 13,
        color: isError ? 'var(--color-red)' : 'var(--pill-info-fg)',
      }}
    >
      {children}
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 500,
  color: 'var(--color-muted)',
  marginBottom: 6,
};
