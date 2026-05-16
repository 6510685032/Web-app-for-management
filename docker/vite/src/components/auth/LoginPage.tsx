import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Building2, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, Layers, Lock as LockIcon } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user, login } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(`/${user.role}`, { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const ok = await login(username, password);
      if (!ok) setError('Invalid username or password');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 30%, #1a0533 0%, #0d0118 40%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Cosmic background orbs ── */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        {/* Left nebula */}
        <div style={{
          position: 'absolute',
          top: '-10%', left: '-15%',
          width: '60vw', height: '60vw',
          maxWidth: '700px', maxHeight: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(120,40,200,0.45) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'djmp-float 14s ease-in-out infinite',
        }} />
        {/* Right nebula */}
        <div style={{
          position: 'absolute',
          bottom: '-5%', right: '-10%',
          width: '50vw', height: '50vw',
          maxWidth: '600px', maxHeight: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(160,50,220,0.35) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'djmp-float-slow 18s ease-in-out infinite',
        }} />
        {/* Center glow */}
        <div style={{
          position: 'absolute',
          top: '40%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '40vw', height: '40vw',
          maxWidth: '500px', maxHeight: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100,20,180,0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        {/* Subtle light streaks */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: `
            linear-gradient(135deg, transparent 40%, rgba(180,80,255,0.04) 50%, transparent 60%),
            linear-gradient(225deg, transparent 40%, rgba(120,40,200,0.03) 50%, transparent 60%)
          `,
        }} />
      </div>

      {/* ── Login Card ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '420px',
        background: 'rgba(12,8,24,0.80)',
        border: '1px solid rgba(180,100,255,0.25)',
        borderRadius: '24px',
        backdropFilter: 'blur(32px) saturate(150%)',
        WebkitBackdropFilter: 'blur(32px) saturate(150%)',
        boxShadow: `
          0 0 0 1px rgba(180,100,255,0.15),
          0 25px 80px rgba(0,0,0,0.8),
          0 0 60px rgba(120,40,200,0.15),
          inset 0 1px 0 rgba(255,255,255,0.08)
        `,
        padding: '40px 36px 36px',
        animation: 'djmp-fadeInUp 0.5s ease',
      }}>

        {/* App Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}>
            <Building2 style={{ width: '38px', height: '38px', color: 'white' }} />
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '28px', fontWeight: 800, color: '#ffffff',
            letterSpacing: '-0.5px', margin: '0 0 4px',
          }}>
            JuristicPro
          </h1>
          <p style={{
            fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.45)',
            letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 20px',
          }}>
            Housing Estate Management
          </p>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: '0 0 4px' }}>
            Sign In
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Enter your credentials to access the platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: '10px',
              color: '#fca5a5',
              fontSize: '13px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px', fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '1.5px', textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)',
                width: '18px', height: '18px',
                color: 'rgba(255,255,255,0.35)',
                pointerEvents: 'none',
              }} />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin_juristic"
                required
                disabled={submitting}
                style={{
                  width: '100%', height: '48px',
                  paddingLeft: '44px', paddingRight: '16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(139,92,246,0.7)';
                  e.target.style.background = 'rgba(139,92,246,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.target.style.background = 'rgba(255,255,255,0.06)';
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{
                fontSize: '11px', fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)',
                width: '18px', height: '18px',
                color: 'rgba(255,255,255,0.35)',
                pointerEvents: 'none',
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                disabled={submitting}
                style={{
                  width: '100%', height: '48px',
                  paddingLeft: '44px', paddingRight: '44px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(139,92,246,0.7)';
                  e.target.style.background = 'rgba(139,92,246,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.target.style.background = 'rgba(255,255,255,0.06)';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: 'rgba(255,255,255,0.4)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword
                  ? <EyeOff style={{ width: '18px', height: '18px' }} />
                  : <Eye style={{ width: '18px', height: '18px' }} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '8px',
              height: '52px',
              width: '100%',
              background: submitting
                ? 'rgba(139,92,246,0.5)'
                : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
              border: 'none',
              borderRadius: '14px',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: submitting ? 'none' : '0 8px 24px rgba(139,92,246,0.45)',
              transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={e => {
              if (!submitting) {
                (e.currentTarget as HTMLButtonElement).style.opacity = '0.92';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            {submitting ? 'Authenticating...' : (
              <>Sign In <ArrowRight style={{ width: '18px', height: '18px' }} /></>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}