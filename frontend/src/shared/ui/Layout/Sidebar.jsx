import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '@app/store/authStore';
import api from '@shared/api/client';
import toast from 'react-hot-toast';
import Logo from '@shared/ui/Logo';
import {
  LayoutDashboard,
  MessageSquare,
  Leaf,
  Users,
  ShieldCheck,
  Target,
  BarChart3,
  Settings,
  User as UserIcon,
} from 'lucide-react';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard',     icon: LayoutDashboard,  label: 'Dashboard' },
      { to: '/chatbot',       icon: MessageSquare, label: 'EcoBot AI' },
    ],
  },
  {
    label: 'ESG Modules',
    items: [
      { to: '/environmental', icon: Leaf, label: 'Environmental' },
      { to: '/social',        icon: Users, label: 'Social' },
      { to: '/governance',    icon: ShieldCheck, label: 'Governance' },
      { to: '/gamification',  icon: Target, label: 'Gamification' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/reports',       icon: BarChart3, label: 'Reports' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/settings',      icon: Settings, label: 'Settings' },
      { to: '/profile',       icon: UserIcon, label: 'My Profile' },
    ],
  },
];

export default function Sidebar({ collapsed, mobileOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        {collapsed ? (
          <Logo size={28} withText={false} variant="light" />
        ) : (
          <Logo size={28} withText={true} variant="light" />
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <div className="sidebar-section-label">{section.label}</div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
                onClick={onClose}
                title={collapsed ? item.label : undefined}
              >
                <span className="sidebar-item-icon">
                  <item.icon size={18} strokeWidth={2} />
                </span>
                {!collapsed && (
                  <span className="sidebar-item-text">{item.label}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          cursor: 'pointer',
        }}
        onClick={handleLogout}
        title="Logout"
      >
        <div
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--color-forest-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 600, fontSize: 14, flexShrink: 0,
          }}
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.role || 'employee'} · Logout
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
