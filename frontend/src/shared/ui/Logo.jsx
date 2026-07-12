import React from 'react';

/**
 * EcoSphere Logo component
 * @param {number}  size     - Icon size in px (default 32)
 * @param {boolean} withText - Whether to show "EcoSphere" text beside the icon
 * @param {string}  variant  - 'dark' | 'light' — controls text color (default 'dark')
 * @param {string}  className
 */
export default function Logo({ size = 32, withText = true, variant = 'dark', className = '' }) {
  const textColor = variant === 'light' ? '#FFFFFF' : 'var(--color-stone-900)';
  const accentColor = variant === 'light' ? '#8ABF5C' : 'var(--color-forest)';

  return (
    <div
      className={`logo-lockup ${className}`}
      style={{ display: 'flex', alignItems: 'center', gap: size * 0.35, textDecoration: 'none' }}
    >
      {/* SVG icon mark */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        {/* Outer globe ring */}
        <circle cx="32" cy="32" r="27" stroke={accentColor} strokeWidth="3.2" />
        {/* Top leaf arc */}
        <path
          d="M 8 26 Q 20 10 44 16 Q 32 8 8 26 Z"
          stroke={accentColor} strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Middle-left leaf */}
        <path
          d="M 8 38 Q 18 22 28 50 Q 14 44 8 38 Z"
          stroke={accentColor} strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Middle-right leaf */}
        <path
          d="M 56 38 Q 46 22 36 50 Q 50 44 56 38 Z"
          stroke={accentColor} strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Equator curve */}
        <path
          d="M 5 34 Q 32 44 59 34"
          stroke={accentColor} strokeWidth="2" strokeLinecap="round"
        />
        {/* Vertical meridian */}
        <path
          d="M 32 5 Q 40 32 32 59"
          stroke={accentColor} strokeWidth="2" strokeLinecap="round"
        />
      </svg>

      {withText && (
        <span
          style={{
            fontSize: size * 0.55,
            fontWeight: 700,
            color: textColor,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
          }}
        >
          Eco<span style={{ color: accentColor }}>Sphere</span>
        </span>
      )}
    </div>
  );
}
