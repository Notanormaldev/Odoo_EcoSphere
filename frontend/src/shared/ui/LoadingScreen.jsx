import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{
          width: 48, height: 48, background: 'var(--color-forest)',
          borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 24,
        }}>
          🌍
        </div>
        <div className="spinner spinner-lg" />
        <div style={{ color: 'var(--color-stone-500)', fontSize: 14 }}>
          Loading EcoSphere…
        </div>
      </div>
    </div>
  );
}
