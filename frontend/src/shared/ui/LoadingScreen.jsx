import React from 'react';
import Logo from '@shared/ui/Logo';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
        {/* Animated logo */}
        <div style={{ animation: 'spin 2.5s linear infinite', transformOrigin: 'center' }}>
          <Logo size={48} withText={false} />
        </div>
        <Logo size={20} withText={true} variant="dark" />
        <div className="spinner spinner-lg" />
        <div style={{ color: 'var(--color-stone-500)', fontSize: 14 }}>
          Loading EcoSphere…
        </div>
      </div>
    </div>
  );
}
