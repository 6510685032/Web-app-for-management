import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  ArrowRight,
  Map,
  Download,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import api from '../../utils/api';

interface DashboardStats {
  total: number;
  pending: number;
  in_progress: number;
  overdue: number;
  assigned: number;
  completed: number;
}

interface RequestItem {
  id: number;
  request_code: string;
  resident: string;
  unit: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

// ── palette hex constants for colours that need inline style ──
const C_FOREST      = '#2D5A47';
const C_OCHRE       = '#957A20';
const C_SLATE       = '#3B4A57';
const C_TERRACOTTA  = '#B85540';

function PriorityPill({ p }: { p: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    high:   { bg: 'var(--terracotta-soft)', fg: 'var(--terracotta)' },
    medium: { bg: 'var(--ochre-soft)',      fg: 'var(--ochre)' },
    low:    { bg: 'var(--rule-soft)',        fg: 'var(--ink-3)' },
  };
  const v = map[p] || map.low;
  return (
    <span className="pill" style={{ background: v.bg, color: v.fg }}>
      {p.charAt(0).toUpperCase() + p.slice(1)}
    </span>
  );
}

function StatCard({
  label, value, suffix, accent,
}: {
  label: string; value: string | number; suffix?: string; accent?: boolean;
}) {
  return (
    <div className="card" style={{
      padding: '18px 20px',
      background: accent ? 'var(--accent-soft)' : 'var(--paper-card)',
      borderColor: accent ? 'transparent' : 'var(--rule)',
    }}>
      <div className="eyebrow">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
        <span className="display numerals" style={{ fontSize: 38, lineHeight: 1, color: accent ? 'var(--accent)' : 'var(--ink)' }}>
          {value}
        </span>
        {suffix && <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title, italic, action }: {
  eyebrow: string; title: string; italic?: string; action?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {title}
          {italic && <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--ink-3)' }}> {italic}</span>}
        </h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export default function OfficerHome() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, in_progress: 0, overdue: 0, assigned: 0, completed: 0 });
  const [pendingRequests, setPendingRequests] = useState<RequestItem[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, requestsRes, techRes] = await Promise.all([
          api.get('/dashboard-stats/'),
          api.get('/maintenance-requests/'),
          api.get('/technicians/'),
        ]);
        setStats(statsRes.data);
        const all = Array.isArray(requestsRes.data) ? requestsRes.data : [];
        setPendingRequests(all.filter((r: RequestItem) => r.status === 'pending').slice(0, 6));
        setTechnicians(Array.isArray(techRes.data) ? techRes.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'Officer';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const techColors = [C_FOREST, C_SLATE, C_OCHRE, C_TERRACOTTA, '#636878'];

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      {/* ── Page Header ── */}
      <header style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--rule-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              OFFICE OF THE JURISTIC PERSON · {today.toUpperCase()}
            </div>
            <h1 className="display" style={{ margin: 0, fontSize: 38, lineHeight: 1.06 }}>
              Good morning,
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--ink-3)', letterSpacing: '-0.01em' }}> {firstName}.</span>
            </h1>
            <p style={{ margin: '10px 0 0', color: 'var(--ink-3)', fontSize: 13.5, maxWidth: 640 }}>
              {stats.pending} new requests need review. {stats.in_progress} jobs in progress.
              {stats.overdue > 0 ? ` ${stats.overdue} overdue — needs your attention.` : ' No escalations today.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => navigate('/officer/dispatch')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 13, fontWeight: 500, borderRadius: 6, border: 'none', background: 'var(--accent)', color: 'var(--accent-on)', cursor: 'pointer' }}
            >
              <Map size={13} /> Open dispatch
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 13, fontWeight: 500, borderRadius: 6, border: '1px solid var(--rule)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer' }}>
              <Download size={13} /> Day report
            </button>
          </div>
        </div>
      </header>

      <div style={{ padding: '28px 40px 48px' }}>
        {/* ── 4 KPI stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="To review" value={loading ? '—' : stats.pending} suffix="incoming" accent />
          <StatCard label="In progress" value={loading ? '—' : stats.in_progress} suffix="active jobs" />
          <StatCard label="Completed" value={loading ? '—' : stats.completed} suffix="total" />
          <StatCard label="Overdue" value={loading ? '—' : stats.overdue} suffix="requests" />
        </div>

        {/* ── Two-column body ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 32 }}>
          {/* LEFT — pending queue */}
          <div>
            <SectionHead
              eyebrow="QUEUE"
              title="Awaiting your"
              italic="review"
              action={
                <button
                  onClick={() => navigate('/officer/requests')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
                >
                  All requests <ArrowRight size={12} />
                </button>
              }
            />
            <div className="card" style={{ overflow: 'hidden', marginBottom: 28 }}>
              {loading ? (
                <div style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>Loading…</div>
              ) : pendingRequests.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--paper-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <CheckCircle size={20} style={{ color: 'var(--ink-3)' }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>Inbox zero</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>No new requests need your attention.</div>
                </div>
              ) : pendingRequests.map((r, i) => (
                <div
                  key={r.id}
                  onClick={() => navigate('/officer/requests')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px',
                    borderBottom: i < pendingRequests.length - 1 ? '1px solid var(--rule-soft)' : 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-soft)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span className="numerals tiny" style={{ color: 'var(--ink-3)' }}>{r.request_code}</span>
                      <span className="tiny" style={{ color: 'var(--ink-3)' }}>· Unit {r.unit}</span>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.category}: {r.description}
                    </div>
                    <div className="tiny" style={{ color: 'var(--ink-4)', marginTop: 2 }}>{r.resident}</div>
                  </div>
                  <PriorityPill p={r.priority} />
                  <button
                    onClick={e => { e.stopPropagation(); navigate('/officer/requests'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--rule)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Review <ArrowRight size={11} />
                  </button>
                </div>
              ))}
            </div>

            {/* Overdue / escalation notice */}
            {stats.overdue > 0 && (
              <div>
                <SectionHead eyebrow="ESCALATIONS" title="Overdue" italic="requests" />
                <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <AlertCircle size={18} style={{ color: 'var(--terracotta)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{stats.overdue} overdue request{stats.overdue > 1 ? 's' : ''}</div>
                    <div className="tiny" style={{ color: 'var(--ink-3)', marginTop: 2 }}>These requests have passed their deadline and need immediate action.</div>
                  </div>
                  <button onClick={() => navigate('/officer/requests')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--rule)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    View <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — crew & quick actions */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <section>
              <SectionHead eyebrow="THE CREW" title="Technicians" italic="on duty" />
              <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>Loading…</div>
                ) : technicians.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>No technicians found.</div>
                ) : technicians.map((t, i) => {
                  const initials = t.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                  const col = techColors[i % techColors.length];
                  const activeTasks = t.active_tasks ?? 0;
                  const statusLabel = activeTasks === 0 ? 'Available' : activeTasks <= 2 ? 'Busy' : 'Full';
                  const statusColor = activeTasks === 0 ? C_FOREST : activeTasks <= 2 ? C_SLATE : C_TERRACOTTA;
                  return (
                    <div
                      key={t.id}
                      onClick={() => navigate('/officer/schedule')}
                      style={{
                        padding: '12px 16px',
                        borderBottom: i < technicians.length - 1 ? '1px solid var(--rule-soft)' : 'none',
                        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-soft)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="avatar" style={{ background: col + '22', color: col }}>{initials}</div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{t.name}</div>
                        <div className="tiny" style={{ color: 'var(--ink-3)' }}>{t.specialty}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: statusColor, display: 'inline-block' }} />
                        <span style={{ fontSize: 11, fontWeight: 500, color: statusColor }}>{statusLabel}</span>
                      </div>
                    </div>
                  );
                })}
                </div>
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--rule-soft)' }}>
                  <button
                    onClick={() => navigate('/officer/schedule')}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}
                  >
                    View full schedule <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </section>

            <section>
              <SectionHead eyebrow="QUICK ACTIONS" title="Go to" italic="workflow" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Kanban board', sub: 'Drag & drop status updates', path: '/officer/kanban' },
                  { label: 'Analytics', sub: 'Performance & SLA report', path: '/officer/analytics' },
                  { label: 'Dispatch', sub: 'Assign technicians to jobs', path: '/officer/dispatch' },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="card"
                    style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--paper-card)', border: '1px solid var(--rule)', borderRadius: 10, cursor: 'pointer', textAlign: 'left', width: '100%' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-soft)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--paper-card)')}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{item.label}</div>
                      <div className="tiny" style={{ color: 'var(--ink-3)', marginTop: 2 }}>{item.sub}</div>
                    </div>
                    <TrendingUp size={14} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
