import React, { useState } from 'react';
import { 
  Users, 
  Layers, 
  UserCheck, 
  RefreshCw, 
  Moon, 
  Sun, 
  Menu, 
  LayoutDashboard
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface MainLayoutProps {
  children: React.ReactNode;
  onRefresh: () => void;
  loading: boolean;
  playerCount: number;
  resourceCount: number;
  accountCount: number;
  isServerOnline: boolean;
  isDbOnline: boolean;
}

interface NavMenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  onRefresh,
  loading,
  playerCount,
  resourceCount,
  accountCount,
  isServerOnline,
  isDbOnline,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Current active route
  const currentPath = location.pathname === '/' ? '/dashboard' : location.pathname;

  // Exact 4 navigation items requested
  const menuItems: NavMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={17} />,
    },
    {
      id: 'online-players',
      label: 'Online Players',
      path: '/players',
      icon: <Users size={17} />,
      badge: playerCount,
    },
    {
      id: 'accounts',
      label: 'Accounts & Characters',
      path: '/accounts',
      icon: <UserCheck size={17} />,
      badge: accountCount,
    },
    {
      id: 'resources',
      label: 'Resource Controls',
      path: '/resources',
      icon: <Layers size={17} />,
      badge: resourceCount,
    },
  ];

  return (
    <div className="hibank-app">
      {/* ── Top Header Navigation Bar (Hibank Deep Teal Style) ── */}
      <header className="hibank-header">
        <div className="hibank-header-left">
          <button 
            type="button" 
            className="hibank-menu-btn" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="hibank-header-title">
            <span>OwlGaming - MTA Roleplay Admin</span>
          </div>
        </div>

        <div className="hibank-header-right">
          {/* Server status pill */}
          <div className="header-status-badge">
            <span className={`status-indicator-dot ${isServerOnline ? 'online' : 'offline'}`} />
            <span className="status-indicator-text">{isServerOnline ? 'Server Live' : 'Server Offline'}</span>
          </div>

          <button
            type="button"
            className="hibank-icon-btn"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh All Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            className="hibank-icon-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* User Profile on the right (like nando - ADMIN in reference) */}
          <div className="hibank-user-profile">
            <div className="user-profile-details">
              <span className="user-profile-name">nando - ADMIN</span>
              <span className="user-profile-email">fernando.rachman@owlgaming.mta</span>
            </div>
            <div className="user-profile-avatar" title="Super Administrator">
              <span>OG</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Container (Sidebar + Content) ── */}
      <div className="hibank-body">
        {/* ── Left Sidebar (White Navigation) ── */}
        <aside className={`hibank-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
          {/* Brand Logo Header (Hibank / OwlGaming multi-dot pattern) */}
          <div className="sidebar-brand-box">
            <div className="hibank-brand-dots">
              <span className="dot dot-red" />
              <span className="dot dot-orange" />
              <span className="dot dot-green" />
              <span className="dot dot-teal" />
              <span className="dot dot-blue" />
              <span className="dot dot-purple" />
            </div>
            <div className="hibank-brand-text">
              <span className="brand-primary">OwlGaming</span>
              <span className="brand-sub">A MEMBER OF MTA ROLEPLAY</span>
            </div>
          </div>

          {/* Navigation Items (Only Dashboard, Online Players, Accounts & Characters, Resource Controls) */}
          <nav className="hibank-nav-tree">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path || 
                (item.path === '/players' && currentPath.startsWith('/players')) ||
                (item.path === '/accounts' && currentPath.startsWith('/accounts')) ||
                (item.path === '/resources' && currentPath.startsWith('/resources'));

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`hibank-nav-item ${isActive ? 'active-pill' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <div className="nav-item-left">
                    <span className="nav-item-icon">{item.icon}</span>
                    <span className="nav-item-label">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`sub-item-badge ${isActive ? 'badge-active' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Info */}
          <div className="hibank-sidebar-footer">
            <div className="footer-status-item">
              <span className={`status-bulb ${isServerOnline ? 'on' : 'off'}`} />
              <span>MTA Server: {isServerOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div className="footer-status-item">
              <span className={`status-bulb ${isDbOnline ? 'on' : 'off'}`} />
              <span>MySQL: {isDbOnline ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </aside>

        {/* ── Main Content Area (Soft Grey Background + Centered White Card) ── */}
        <main className="hibank-main-content">
          <div className="hibank-card-container">
            {children}
          </div>

          {/* Page Footer (Centered Copyright like reference image) */}
          <footer className="hibank-page-footer">
            <span>© 2026 OwlGaming MTA Roleplay. All rights reserved.</span>
          </footer>
        </main>
      </div>
    </div>
  );
};
