import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  ChevronRight,
  MapPin,
  Clock,
  CheckCircle2,
  ClipboardList,
  Phone,
} from 'lucide-react';
import api from '../../utils/api';

interface TaskItem {
  id: number;
  request_code: string;
  resident: string;
  unit: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  deadline: string | null;
  location: string;
  specialty_required: string;
}

// ── JP priority pill ──
function PriorityPill({ p }: { p: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    high:   { bg: 'var(--terracotta-soft)', fg: 'var(--terracotta)' },
    medium: { bg: 'var(--ochre-soft)',      fg: 'var(--ochre)' },
    low:    { bg: 'var(--rule-soft)',        fg: 'var(--ink-3)' },
  };
  const v = map[p] || map.low;
  return <span className="pill" style={{ background: v.bg, color: v.fg }}>{p.charAt(0).toUpperCase() + p.slice(1)}</span>;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    assigned:    { cls: 'progress', label: 'Assigned'    },
    'in-progress': { cls: 'progress', label: 'In Progress' },
    pending:     { cls: 'pending',  label: 'Pending'     },
    completed:   { cls: 'done',     label: 'Completed'   },
    cancelled:   { cls: 'cancelled',label: 'Cancelled'   },
  };
  const v = map[status] || { cls: 'pending', label: status };
  return <span className={`pill ${v.cls}`}><span className="dot" />{v.label}</span>;
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

export default function TechnicianHome() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/tasks/my/');
        setTasks(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeTasks = useMemo(() =>
    tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
      .sort((a, b) => {
        const po: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (po[a.priority] ?? 2) - (po[b.priority] ?? 2);
      }),
    [tasks]
  );

  const completed = tasks.filter(t => t.status === 'completed').length;
  const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  const firstName = user?.name?.split(' ')[0] ?? 'Technician';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const times = ['09:30', '10:30', '12:30', '14:00', '16:00'];

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      {/* ── Page Header ── */}
      <header style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--rule-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>TODAY · {today.toUpperCase()}</div>
            <h1 className="display" style={{ margin: 0, fontSize: 38, lineHeight: 1.06 }}>
              {activeTasks.length} job{activeTasks.length !== 1 ? 's' : ''}
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--ink-3)', letterSpacing: '-0.01em' }}> on the route.</span>
            </h1>
            <p style={{ margin: '10px 0 0', color: 'var(--ink-3)', fontSize: 13.5, maxWidth: 640 }}>
              Good morning, Khun {firstName}. {activeTasks.length > 0
                ? `Your next task is ${activeTasks[0]?.category} at Unit ${activeTasks[0]?.unit}.`
                : 'You\'re all caught up — no active tasks today.'}
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <button
              onClick={() => navigate('/technician/tasks')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 13, fontWeight: 500, borderRadius: 6, border: 'none', background: 'var(--accent)', color: 'var(--accent-on)', cursor: 'pointer' }}
            >
              <Phone size={13} /> Call dispatch
            </button>
          </div>
        </div>
      </header>

      <div style={{ padding: '28px 40px 48px' }}>
        {/* ── 4 KPI cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: "Today's jobs", value: activeTasks.length, suffix: 'scheduled', accent: true },
            { label: 'Completed', value: completed, suffix: 'so far' },
            { label: 'On-time rate', value: rate + '%', suffix: 'this period' },
            { label: 'Total assigned', value: tasks.length, suffix: 'all time' },
          ].map(c => (
            <div key={c.label} className="card" style={{
              padding: '18px 20px',
              background: c.accent ? 'var(--accent-soft)' : 'var(--paper-card)',
              borderColor: c.accent ? 'transparent' : 'var(--rule)',
            }}>
              <div className="eyebrow">{c.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                <span className="display numerals" style={{ fontSize: 38, lineHeight: 1, color: c.accent ? 'var(--accent)' : 'var(--ink)' }}>
                  {loading ? '—' : c.value}
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{c.suffix}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Two-column body ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 32 }}>
          {/* LEFT — task schedule */}
          <section>
            <SectionHead
              eyebrow="ROUTE"
              title="The day's"
              italic="schedule"
              action={
                <button
                  onClick={() => navigate('/technician/tasks')}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
                >
                  All tasks <ChevronRight size={12} />
                </button>
              }
            />
            <div className="card" style={{ overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>Loading…</div>
              ) : activeTasks.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--paper-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <CheckCircle2 size={20} style={{ color: 'var(--ink-3)' }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>No scheduled jobs</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>Enjoy a quiet day. Dispatch will assign new tasks as they come in.</div>
                </div>
              ) : activeTasks.slice(0, 5).map((task, i) => {
                const t = times[i] || '—';
                return (
                  <button
                    key={task.id}
                    onClick={() => navigate(`/technician/tasks/${task.id}`)}
                    style={{
                      width: '100%', padding: '16px 20px',
                      borderBottom: i < Math.min(activeTasks.length, 5) - 1 ? '1px solid var(--rule-soft)' : 'none',
                      display: 'flex', alignItems: 'center', gap: 18,
                      textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-soft)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: 56, flexShrink: 0 }}>
                      <div className="numerals" style={{ fontSize: 18, lineHeight: 1, fontWeight: 600, color: 'var(--ink-2)' }}>{t}</div>
                      <div className="tiny" style={{ color: 'var(--ink-4)', marginTop: 2 }}>
                        {task.priority === 'high' ? '2h' : '1h'}
                      </div>
                    </div>
                    <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--rule)' }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span className="numerals tiny" style={{ color: 'var(--ink-3)' }}>{task.request_code}</span>
                        <span className="tiny" style={{ color: 'var(--ink-3)' }}>· Unit {task.unit}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.category}: {task.description}
                      </div>
                      {task.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                          <MapPin size={10} style={{ color: 'var(--ink-4)' }} />
                          <span className="tiny" style={{ color: 'var(--ink-4)' }}>{task.location}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <PriorityPill p={task.priority} />
                      <StatusPill status={task.status} />
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          </section>

          {/* RIGHT — aside */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Performance summary */}
            <section>
              <SectionHead eyebrow="PERFORMANCE" title="Your" italic="summary" />
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Total tasks', value: tasks.length },
                    { label: 'Completed', value: completed },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{row.label}</span>
                      <span className="numerals" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>
                        {loading ? '—' : row.value}
                      </span>
                    </div>
                  ))}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Completion rate</span>
                      <span className="numerals" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>
                        {loading ? '—' : rate + '%'}
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--paper-2)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${rate}%`, background: 'var(--accent)', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Reminders */}
            <section>
              <SectionHead eyebrow="REMINDERS" title="Before you" italic="clock off" />
              <div className="card" style={{ padding: '4px 0' }}>
                {[
                  'Upload before/after photos for each completed job',
                  'Log all materials used in the work report',
                  'Request deadline extensions early if needed',
                ].map((tip, i, arr) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--rule-soft)' : 'none' }}>
                    <span style={{ width: 6, height: 6, marginTop: 7, flexShrink: 0, borderRadius: 999, background: 'var(--accent)' }} />
                    <span style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Navigation shortcut */}
            <button
              onClick={() => navigate('/technician/tasks')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--ink)', border: 'none', borderRadius: 10, cursor: 'pointer', width: '100%' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ClipboardList size={16} style={{ color: 'var(--paper)' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper)' }}>View all my tasks</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Manage your full assignment list</div>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
