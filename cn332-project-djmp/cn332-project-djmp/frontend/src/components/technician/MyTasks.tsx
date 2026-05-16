import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ChevronRight, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

interface TaskItem {
  id: string | number;
  request_code?: string;
  resident?: string;
  unit?: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  scheduled_date?: string;
  scheduled_time?: string;
  deadline?: string | null;
  location?: string;
}

// ── JP design pills ──
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
    assigned:      { cls: 'progress', label: 'Assigned'    },
    'in-progress': { cls: 'progress', label: 'In Progress' },
    pending:       { cls: 'pending',  label: 'Pending'     },
    completed:     { cls: 'done',     label: 'Completed'   },
    cancelled:     { cls: 'cancelled',label: 'Cancelled'   },
  };
  const v = map[status] || { cls: 'pending', label: status };
  return <span className={`pill ${v.cls}`}><span className="dot" />{v.label}</span>;
}

export default function MyTasks() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'active' | 'awaiting' | 'completed'>('active');
  const [q, setQ] = useState('');
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

  const groups = useMemo(() => ({
    active:    tasks.filter(t => ['assigned', 'in-progress'].includes(t.status)),
    awaiting:  tasks.filter(t => t.status === 'pending_approval'),
    completed: tasks.filter(t => ['completed', 'approved'].includes(t.status)),
  }), [tasks]);

  const shown = useMemo(() => {
    const base = groups[tab];
    if (!q) return base;
    const lower = q.toLowerCase();
    return base.filter(t =>
      String(t.request_code || t.id).toLowerCase().includes(lower) ||
      (t.resident || '').toLowerCase().includes(lower) ||
      (t.description || '').toLowerCase().includes(lower)
    );
  }, [groups, tab, q]);

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'active',    label: 'Active' },
    { id: 'awaiting',  label: 'Awaiting approval' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      {/* ── Page header ── */}
      <header style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--rule-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>MY TASKS</div>
            <h1 className="display" style={{ margin: 0, fontSize: 38, lineHeight: 1.06 }}>
              Everything
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--ink-3)', letterSpacing: '-0.01em' }}> assigned to me.</span>
            </h1>
            <p style={{ margin: '10px 0 0', color: 'var(--ink-3)', fontSize: 13.5 }}>
              {tasks.length} jobs total · {groups.active.length} active.
            </p>
          </div>
        </div>
      </header>

      <div style={{ padding: '20px 40px 48px' }}>
        {/* ── Filter chips + search ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="chip"
                style={{
                  background: tab === t.id ? 'var(--ink)' : 'transparent',
                  color: tab === t.id ? 'var(--paper)' : 'var(--ink-2)',
                  borderColor: tab === t.id ? 'var(--ink)' : 'var(--rule)',
                }}
              >
                {t.label}
                <span className="numerals" style={{ opacity: 0.6, fontSize: 11, marginLeft: 2 }}>
                  {groups[t.id].length}
                </span>
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--ink-4)' }} />
            <input
              className="in"
              placeholder="Search by ID, resident, description…"
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{ paddingLeft: 30, width: 280 }}
            />
          </div>
        </div>

        {/* ── Task list ── */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>Loading…</div>
          ) : shown.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--paper-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <CheckCircle size={20} style={{ color: 'var(--ink-3)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>Nothing here</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>No jobs in this section.</div>
            </div>
          ) : shown.map((task, i) => (
            <button
              key={task.id}
              onClick={() => navigate(`/technician/tasks/${task.id}`)}
              style={{
                width: '100%', padding: '14px 20px',
                borderBottom: i < shown.length - 1 ? '1px solid var(--rule-soft)' : 'none',
                display: 'flex', alignItems: 'center', gap: 14,
                textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-soft)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* icon placeholder — category initial */}
              <div style={{
                width: 32, height: 32, borderRadius: 6,
                background: 'var(--paper-2)', color: 'var(--ink-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, flexShrink: 0,
              }}>
                {(task.category || '?')[0].toUpperCase()}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span className="numerals tiny" style={{ color: 'var(--ink-3)' }}>{task.request_code || String(task.id).slice(-6)}</span>
                  {task.unit && <span className="tiny" style={{ color: 'var(--ink-3)' }}>· Unit {task.unit}</span>}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {task.category}: {task.description}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3 }}>
                  {task.location && (
                    <span className="tiny" style={{ color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={10} /> {task.location}
                    </span>
                  )}
                  {task.scheduled_date && (
                    <span className="tiny" style={{ color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Calendar size={10} /> {new Date(task.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <PriorityPill p={task.priority} />
                <StatusPill status={task.status} />
                <ChevronRight size={14} style={{ color: 'var(--ink-4)' }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}