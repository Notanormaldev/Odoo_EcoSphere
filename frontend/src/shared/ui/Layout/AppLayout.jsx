import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => {
      if (e.matches) setSidebarCollapsed(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          onMobileMenuOpen={() => setMobileSidebarOpen(true)}
        />
        <main className="app-content animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
