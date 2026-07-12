import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@shared/api/client';
import useAuthStore from '@app/store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: (credentials) => api.post('/auth/login', credentials),
    onSuccess: ({ data }) => {
      setTokens(data.data.accessToken, data.data.refreshToken);
      setUser(data.data.user);
      toast.success(`Welcome back, ${data.data.user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    loginMutation.mutate(form);
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--surface-base)',
    }}>
      {/* Left panel - branding */}
      <div style={{
        flex: '0 0 420px', background: 'var(--color-forest)', display: 'flex',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px', position: 'relative', overflow: 'hidden',
      }}
        className="auth-panel-left"
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', width: 300, height: 300,
          background: 'rgba(255,255,255,0.03)', borderRadius: '50%',
          top: -100, right: -80,
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200,
          background: 'rgba(255,255,255,0.03)', borderRadius: '50%',
          bottom: 80, left: -60,
        }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 40, height: 40, background: 'rgba(255,255,255,0.15)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>🌍</div>
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>
              Eco<span style={{ color: '#8ABF5C' }}>Sphere</span>
            </div>
          </div>

          <h1 style={{
            color: '#fff', fontSize: 32, fontWeight: 700,
            lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: 16,
          }}>
            ESG Management<br />Made Simple
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6 }}>
            Track carbon emissions, engage employees in CSR, maintain governance compliance — all in one platform.
          </p>
        </div>

        <div>
          {[
            { icon: '🌿', label: 'Carbon tracking & goals' },
            { icon: '🤝', label: 'CSR activity management' },
            { icon: '🏛️', label: 'Compliance & audit trails' },
            { icon: '🎯', label: 'Gamified sustainability' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '48px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{
            fontSize: 24, fontWeight: 700, color: 'var(--color-stone-900)',
            letterSpacing: '-0.02em', marginBottom: 8,
          }}>
            Sign in
          </h2>
          <p style={{ color: 'var(--color-stone-500)', fontSize: 14, marginBottom: 32 }}>
            New to EcoSphere?{' '}
            <Link to="/register" style={{ color: 'var(--color-forest)', fontWeight: 500 }}>
              Create an account
            </Link>
          </p>

          {/* Google OAuth */}
          <button
            className="btn btn-secondary w-full"
            style={{ marginBottom: 20, justifyContent: 'center', gap: 8 }}
            onClick={handleGoogleLogin}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-stone-200)' }} />
            <span style={{ fontSize: 13, color: 'var(--color-stone-400)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-stone-200)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">Email address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label required">Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-stone-400)', fontSize: 14, padding: 4,
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', height: 40, marginTop: 4 }}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Signing in…</>
              ) : 'Sign in'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--color-stone-500)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-forest)', fontWeight: 500 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-panel-left { display: none; }
        }
      `}</style>
    </div>
  );
}
