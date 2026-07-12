import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@shared/ui/Logo';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--surface-base)',
      textAlign: 'center', padding: 24
    }}>
      <div className="card" style={{ maxWidth: 440, padding: '48px 32px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Logo size={52} withText={false} />
        </div>
        <h1 style={{ fontSize: 64, fontWeight: 800, marginBottom: 4, color: 'var(--color-stone-900)', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--color-stone-700)' }}>Page Not Found</h2>
        <p style={{ color: 'var(--color-stone-500)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
          The page you are looking for doesn't exist or has been moved to another location.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ margin: '0 auto', justifyContent: 'center' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
