import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import api from '../../utils/api';
import { Edit2, Save, X } from 'lucide-react';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 400 }}>{value || '—'}</div>
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'System Administrator',
  officer: 'Juristic Officer',
  technician: 'Technician',
  resident: 'Resident',
};

export default function ProfilePage() {
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', unit_number: '' });

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: (user as any)?.phone || '',
      unit_number: (user as any)?.unit_number || '',
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.patch('/me/', formData);
      const updated = res.data?.user || formData;
      updateUser({
        name: updated.name ?? formData.name,
        email: updated.email ?? formData.email,
        phone: updated.phone ?? formData.phone,
        unit_number: updated.unit_number ?? formData.unit_number,
      });
      setIsEditing(false);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: (user as any)?.phone || '',
      unit_number: (user as any)?.unit_number || '',
    });
    setError('');
    setIsEditing(false);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const role = user?.role || 'resident';
  const roleLabel = ROLE_LABELS[role] || role;

  const editableFields = [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'email', label: 'Email Address', type: 'email' },
    { key: 'phone', label: 'Phone Number', type: 'tel' },
    ...(role === 'resident' || (user as any)?.unit_number
      ? [{ key: 'unit_number', label: 'Unit Number', type: 'text' }]
      : []),
  ];

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      {/* ── JP editorial page header ── */}
      <header style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--rule-soft)' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>PROFILE</div>
        <h1 className="display" style={{ margin: 0, fontSize: 38, lineHeight: 1.06 }}>
          Your
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--ink-3)', letterSpacing: '-0.01em' }}> account.</span>
        </h1>
      </header>

      <div style={{ padding: '28px 40px 40px', maxWidth: 720 }}>

        {/* ── Identity card ── */}
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
            {/* Avatar */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: 'var(--accent-soft)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700,
            }}>
              {initials}
            </div>
            {/* Name + role */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 className="display" style={{ fontSize: 28, margin: 0, lineHeight: 1.1 }}>
                {user?.name || 'Unknown'}
              </h2>
              <div style={{ marginTop: 4, fontSize: 13.5, color: 'var(--ink-3)' }}>{roleLabel}</div>
              <span className="pill accent" style={{ marginTop: 10, display: 'inline-flex', fontSize: 11, textTransform: 'capitalize' }}>
                {role}
              </span>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', fontSize: 13, fontWeight: 500,
                  borderRadius: 6, border: '1px solid var(--rule)',
                  background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--paper-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Edit2 size={13} /> Edit profile
              </button>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--rule-soft)', margin: '0 0 20px' }} />

          {error && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 6, fontSize: 13,
              background: 'rgba(184,85,64,0.08)', border: '1px solid var(--terracotta)', color: 'var(--terracotta)',
            }}>
              {error}
            </div>
          )}

          {isEditing ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {editableFields.map(f => (
                  <div key={f.key}>
                    <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>{f.label.toUpperCase()}</label>
                    <input
                      type={f.type}
                      value={formData[f.key as keyof typeof formData]}
                      onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      disabled={saving}
                      style={{
                        width: '100%', padding: '8px 12px', fontSize: 13,
                        borderRadius: 6, border: '1px solid var(--rule)',
                        background: 'var(--paper)', color: 'var(--ink)', outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--rule)')}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--rule-soft)' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '9px 0', borderRadius: 6, border: 'none',
                    background: 'var(--accent)', color: 'var(--accent-on)',
                    fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                  }}
                >
                  <Save size={14} /> {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '9px 0', borderRadius: 6,
                    border: '1px solid var(--rule)', background: 'var(--paper-2)',
                    color: 'var(--ink-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <Field label="Email" value={user?.email || ''} />
              {(user as any)?.phone && <Field label="Phone" value={(user as any).phone} />}
              {(user as any)?.unit_number && <Field label="Unit" value={(user as any).unit_number} />}
              {(user as any)?.joinDate && (
                <Field label="Member since" value={new Date((user as any).joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} />
              )}
            </div>
          )}
        </div>

        {/* ── Security section ── */}
        <div style={{ marginBottom: 12 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>SECURITY</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Sign-in <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--ink-3)' }}>&amp; access</span>
          </h2>
        </div>
        <div className="card" style={{ padding: 4 }}>
          {[
            { l: 'Password', sub: 'Update your account password.', action: 'Change' },
            { l: 'Two-factor authentication', sub: 'Not enabled — we strongly recommend turning this on.', action: 'Enable' },
            { l: 'Active sessions', sub: '1 web session · this device', action: 'View all' },
          ].map((s, i, arr) => (
            <div
              key={i}
              style={{
                padding: '14px 18px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--rule-soft)' : 'none',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{s.l}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{s.sub}</div>
              </div>
              <button
                style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                  border: '1px solid var(--rule)', background: 'transparent',
                  color: 'var(--ink-2)', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--paper-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {s.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}