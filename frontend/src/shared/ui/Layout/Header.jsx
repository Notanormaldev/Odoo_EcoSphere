import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@app/store/authStore';
import api from '@shared/api/client';

export default function Header({ onToggleSidebar, onMobileMenuOpen }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const { data: notifData } = useQuery({
    queryKey: ['notifications-header'],
    queryFn: () => api.get('/notifications?limit=5').then((r) => r.data),
    refetchInterval: 30000,
    enabled: !!user,
  });

  const unreadCount = notifData?.unreadCount || 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read', { ids: [] });
    setNotifOpen(false);
  };

  return (
    <header className="app-header">
      {/* Hamburger (mobile only) */}
      <button
        className="btn btn-ghost btn-icon mobile-menu-btn"
        onClick={onMobileMenuOpen}
        aria-label="Open sidebar"
      >
        ☰
      </button>

      {/* Toggle sidebar collapse (desktop only) */}
      <button
        className="btn btn-ghost btn-icon desktop-sidebar-toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        style={{ color: 'var(--color-stone-500)' }}
      >
        ⇄
      </button>

      {/* Breadcrumb / search could go here */}
      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="btn btn-ghost btn-icon"
            style={{ position: 'relative', color: 'var(--color-stone-500)' }}
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                width: 'min(360px, calc(100vw - 32px))', background: '#fff', border: 'var(--border)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
                zIndex: 200, overflow: 'hidden',
              }}
              className="animate-slide-up"
            >
              <div style={{
                padding: 'var(--space-4)',
                borderBottom: 'var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifData?.notifications?.length ? (
                  notifData.notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderBottom: '1px solid var(--color-stone-100)',
                        background: n.isRead ? '#fff' : 'var(--color-forest-pale)',
                        cursor: 'pointer',
                      }}
                      onClick={() => { navigate(n.link || '/dashboard'); setNotifOpen(false); }}
                    >
                      <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 500, color: 'var(--color-stone-800)', marginBottom: 2 }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-stone-500)' }}>
                        {n.message?.slice(0, 80)}{n.message?.length > 80 ? '…' : ''}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-stone-400)', fontSize: 13 }}>
                    No notifications
                  </div>
                )}
              </div>

              <div style={{ padding: 'var(--space-3)', textAlign: 'center', borderTop: 'var(--border)' }}>
                <Link
                  to="/settings/notifications"
                  style={{ fontSize: 13, color: 'var(--color-forest)', fontWeight: 500 }}
                  onClick={() => setNotifOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <Link
          to="/profile"
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            textDecoration: 'none', padding: '4px',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--color-forest-pale)',
            border: '2px solid var(--color-forest)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-forest)', fontWeight: 700, fontSize: 13,
            flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="header-user-info" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-stone-800)', lineHeight: 1.2 }}>
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-stone-400)', lineHeight: 1.2, textTransform: 'capitalize' }}>
              {user?.role || 'employee'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
