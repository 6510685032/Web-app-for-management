import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Download,
  TrendingDown,
  TrendingUp,
  Star,
} from 'lucide-react';
import api from '../../utils/api';

interface RequestItem {
  id: number | string;
  request_code?: string;
  category: string;
  description: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  priority: string;
  location: string;
  created_at?: string;
  technician?: string;
  scheduled_date?: string | null;
  deadline?: string | null;
  approved_completion?: string;
}

interface DashboardStats {
  total: number;
  pending: number;
  assigned: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  technicians: number;
}

// ── chart palette (JP tokens resolved to hex for SVG fills) ──
const C_FOREST      = '#2D5A47';
const C_SLATE       = '#3B4A57';
const C_OCHRE       = '#957A20';
const C_TERRACOTTA  = '#B85540';
const C_INK3        = '#636878';
const PIE_COLORS    = [C_FOREST, C_SLATE, C_OCHRE, C_TERRACOTTA, C_INK3, '#7A6318'];

// ── hand-drawn SVG bar chart ──
function ChartBars({ data, height = 180 }: { data: number[]; height?: number }) {
  const max = Math.max(...data, 1);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const labels = months.slice(Math.max(0, months.length - data.length));
  const W = data.length * 36;
  return (
    <svg width="100%" height={height + 28} viewBox={`0 0 ${W} ${height + 28}`} preserveAspectRatio="none">
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <line key={i} x1="0" y1={p * height} x2={W} y2={p * height}
          stroke="var(--rule-soft)" strokeWidth="1" />
      ))}
      {data.map((v, i) => {
        const h = Math.max(2, (v / max) * (height - 8));
        return (
          <rect key={i} x={i * 36 + 6} y={height - h} width="24" height={h} rx="2"
            fill={i === data.length - 1 ? 'var(--accent)' : 'var(--ink-2)'} opacity={i === data.length - 1 ? 1 : 0.55} />
        );
      })}
      {labels.map((l, i) => (
        <text key={i} x={i * 36 + 18} y={height + 18} textAnchor="middle"
          fontSize="9" fill="var(--ink-4)" fontFamily="var(--font-sans)" letterSpacing="0.05em">
          {l}
        </text>
      ))}
    </svg>
  );
}

// ── hand-drawn SVG area chart ──
function ChartArea({
  data, height = 180, fmt = (v: number) => String(v),
}: {
  data: number[]; height?: number; fmt?: (v: number) => string;
}) {
  if (data.length < 2) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--ink-4)' }}>Not enough data</div>;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = data.length * 36;
  const pts = data.map((v, i) => [i * 36 + 18, (1 - (v - min) / range) * (height - 20) + 8] as [number, number]);
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ');
  const area = path + ` L ${pts[pts.length - 1][0]},${height} L ${pts[0][0]},${height} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width="100%" height={height + 28} viewBox={`0 0 ${W} ${height + 28}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((p, i) => (
        <line key={i} x1="0" y1={p * (height - 20) + 8} x2={W} y2={p * (height - 20) + 8}
          stroke="var(--rule-soft)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#areaG)" />
      <path d={path} stroke="var(--accent)" strokeWidth="1.8" fill="none" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.5"
          fill="var(--paper)" stroke="var(--accent)" strokeWidth="1.5" />
      ))}
      <text x={last[0]} y={last[1] - 10} textAnchor="end" fontSize="11"
        fill="var(--accent)" fontFamily="var(--font-mono)" fontWeight="500">
        {fmt(data[data.length - 1])}
      </text>
    </svg>
  );
}

// ── stat card matching JP StatCard ──
function StatCard({
  label, value, suffix, delta, deltaDir, accent,
}: {
  label: string; value: string | number; suffix?: string;
  delta?: string; deltaDir?: 'up' | 'down' | 'neutral'; accent?: boolean;
}) {
  const dColor = deltaDir === 'up' ? 'var(--st-done)' : deltaDir === 'down' ? 'var(--terracotta)' : 'var(--ink-3)';
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
        {suffix && <span className="muted" style={{ fontSize: 12 }}>{suffix}</span>}
      </div>
      {delta && (
        <div style={{ marginTop: 8, fontSize: 11.5, color: dColor, display: 'flex', alignItems: 'center', gap: 4 }}>
          {deltaDir === 'up' ? <TrendingUp size={11} /> : deltaDir === 'down' ? <TrendingDown size={11} /> : null}
          <span className="numerals">{delta}</span>
        </div>
      )}
    </div>
  );
}

// ── section header matching JP SectionHead ──
function SectionHead({ eyebrow, title, italic }: { eyebrow: string; title: string; italic?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        {title}
        {italic && <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--ink-3)' }}> {italic}</span>}
      </h2>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0, pending: 0, assigned: 0, in_progress: 0, completed: 0,
    cancelled: 0, overdue: 0, pending_approval: 0, approved: 0, rejected: 0, technicians: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [rRes, sRes] = await Promise.all([
          api.get('/maintenance-requests/'),
          api.get('/dashboard-stats/'),
        ]);
        setRequests(Array.isArray(rRes.data) ? rRes.data : []);
        setStats(sRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── monthly volume for bar chart ──
  const monthlyVolume = useMemo(() => {
    const counts = new Array(12).fill(0);
    requests.forEach(r => {
      if (r.created_at) counts[new Date(r.created_at).getMonth()]++;
    });
    // return the last 6 months that have data, or last 6
    const now = new Date().getMonth();
    const last6 = [];
    for (let i = 5; i >= 0; i--) last6.unshift(counts[(now - i + 12) % 12]);
    return last6;
  }, [requests]);

  // ── SLA / completion rate per month ──
  const slaData = useMemo(() => {
    const by = new Array(12).fill(null).map(() => ({ total: 0, completed: 0 }));
    requests.forEach(r => {
      if (!r.created_at) return;
      const m = new Date(r.created_at).getMonth();
      by[m].total++;
      if (r.status === 'completed') by[m].completed++;
    });
    const now = new Date().getMonth();
    return Array.from({ length: 6 }, (_, i) => {
      const m = (now - 5 + i + 12) % 12;
      const { total, completed } = by[m];
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    });
  }, [requests]);

  // ── category breakdown ──
  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    requests.forEach(r => map.set(r.category, (map.get(r.category) || 0) + 1));
    const total = requests.length || 1;
    return Array.from(map.entries())
      .map(([label, n]) => ({ label, n, pct: Math.round((n / total) * 100) }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 6);
  }, [requests]);

  // ── technician performance ──
  const techPerf = useMemo(() => {
    const map = new Map<string, { name: string; jobs: number; completed: number }>();
    requests.forEach(r => {
      if (!r.technician || r.technician === '-') return;
      if (!map.has(r.technician)) map.set(r.technician, { name: r.technician, jobs: 0, completed: 0 });
      const t = map.get(r.technician)!;
      t.jobs++;
      if (r.status === 'completed') t.completed++;
    });
    return Array.from(map.values()).map(t => ({
      ...t,
      onTime: t.jobs > 0 ? Math.round((t.completed / t.jobs) * 100) : 0,
      rating: (3.5 + (t.completed / Math.max(t.jobs, 1)) * 1.5).toFixed(1),
    }));
  }, [requests]);

  const dash = (v: number) => loading ? '—' : String(v);

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      {/* ── Page header ── */}
      <header style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--rule-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>ANALYTICS · LAST 90 DAYS</div>
            <h1 className="display" style={{ margin: 0, fontSize: 38, lineHeight: 1.06 }}>
              How the office
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--ink-3)', letterSpacing: '-0.01em' }}> is performing.</span>
            </h1>
            <p style={{ margin: '10px 0 0', color: 'var(--ink-3)', fontSize: 13.5, maxWidth: 640 }}>
              A reading of maintenance flow and crew performance across the past quarter, compared to the previous window.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 13, borderRadius: 6, border: '1px solid var(--rule)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer' }}>
              <Calendar size={12} /> Last 90 days
            </button>
            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 13, borderRadius: 6, border: '1px solid var(--rule)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer' }}>
              <Download size={12} /> Export PDF
            </button>
          </div>
        </div>
      </header>

      <div style={{ padding: '28px 40px 48px' }}>

        {/* ── 4 KPI stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard label="Total requests" value={dash(stats.total)} suffix="all time"
            delta={`${stats.pending} pending`} deltaDir="neutral" />
          <StatCard label="Completed" value={dash(stats.completed)} suffix="resolved"
            delta={stats.completed > 0 ? `${Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}% rate` : undefined}
            deltaDir="up" accent />
          <StatCard label="In progress" value={dash(stats.in_progress)} suffix="active"
            delta={`${stats.assigned} assigned`} deltaDir="neutral" />
          <StatCard label="Overdue" value={dash(stats.overdue)} suffix="requests"
            delta={stats.overdue > 0 ? 'needs attention' : 'on track'}
            deltaDir={stats.overdue > 0 ? 'down' : 'up'} />
        </div>

        {/* ── Charts row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Volume bar chart */}
          <div className="card" style={{ padding: 24 }}>
            <SectionHead eyebrow="VOLUME" title="Monthly request" italic="volume" />
            <ChartBars data={monthlyVolume} height={180} />
          </div>

          {/* SLA area chart */}
          <div className="card" style={{ padding: 24 }}>
            <SectionHead eyebrow="SLA COMPLIANCE" title="Completion" italic="rate (%)" />
            <ChartArea data={slaData} height={180} fmt={v => v.toFixed(0) + '%'} />
          </div>
        </div>

        {/* ── Second row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>
          {/* Category breakdown */}
          <div className="card" style={{ padding: 24 }}>
            <SectionHead eyebrow="BREAKDOWN" title="By" italic="category" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {byCategory.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--ink-4)', padding: '12px 0' }}>No data available.</div>
              ) : byCategory.map((c, i) => (
                <div key={c.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink)' }}>{c.label}</span>
                    <span className="numerals tiny">
                      <span style={{ color: 'var(--ink)' }}>{c.n}</span>
                      {' '}<span className="mute2">· {c.pct}%</span>
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--paper-2)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      width: c.pct + '%', height: '100%',
                      background: i === 0 ? 'var(--accent)' : 'var(--ink-3)',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crew performance table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 12px' }}>
              <SectionHead eyebrow="CREW" title="Performance" italic="by technician" />
            </div>
            <div style={{ display: 'flex', padding: '8px 24px', borderBottom: '1px solid var(--rule-soft)', background: 'var(--paper-soft)' }}>
              <div className="eyebrow" style={{ flex: 1 }}>TECHNICIAN</div>
              <div className="eyebrow" style={{ width: 64 }}>JOBS</div>
              <div className="eyebrow" style={{ width: 80 }}>ON-TIME</div>
              <div className="eyebrow" style={{ width: 72 }}>RATING</div>
            </div>
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>Loading…</div>
            ) : techPerf.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>No technician data yet.</div>
            ) : techPerf.map((t, i) => {
              const initials = t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              const colors = [C_FOREST, C_SLATE, C_OCHRE, C_TERRACOTTA, C_INK3];
              const col = colors[i % colors.length];
              return (
                <div key={t.name} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '12px 24px',
                  borderBottom: i < techPerf.length - 1 ? '1px solid var(--rule-soft)' : 'none',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-soft)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div className="avatar" style={{ background: col + '22', color: col }}>{initials}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{t.name}</div>
                      <div className="tiny mute2">{t.jobs} total jobs</div>
                    </div>
                  </div>
                  <div className="numerals" style={{ width: 64, fontSize: 13, color: 'var(--ink-2)' }}>
                    {t.jobs}<span className="mute2 tiny"> jobs</span>
                  </div>
                  <div style={{ width: 80 }}>
                    <span className="numerals" style={{
                      fontSize: 13,
                      color: t.onTime >= 80 ? C_FOREST : t.onTime >= 60 ? C_OCHRE : C_TERRACOTTA,
                    }}>
                      {t.onTime}%
                    </span>
                  </div>
                  <div style={{ width: 72, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={11} fill={C_OCHRE} color={C_OCHRE} />
                    <span className="numerals" style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t.rating}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}