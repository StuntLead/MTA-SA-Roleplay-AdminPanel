import React, { useState } from 'react';
import { 
  Users, 
  Layers, 
  UserCheck, 
  RefreshCw, 
  Moon, 
  Sun, 
  Menu, 
  LayoutDashboard,
  ScrollText
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

  const currentPath = location.pathname === '/' ? '/dashboard' : location.pathname;

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
    {
      id: 'game-logs',
      label: 'Game Log',
      path: '/logs',
      icon: <ScrollText size={17} />,
    },
  ];

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div className="admin-header-left">
          <button 
            type="button" 
            className="admin-menu-btn" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="admin-header-title">
            <span>OwlGaming - MTA Roleplay Admin</span>
          </div>
        </div>

        <div className="admin-header-right">
          <div className="header-status-badge">
            <span className={`status-indicator-dot ${isServerOnline ? 'online' : 'offline'}`} />
            <span className="status-indicator-text">{isServerOnline ? 'Server Live' : 'Server Offline'}</span>
          </div>

          <button
            type="button"
            className="admin-icon-btn"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh All Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            className="admin-icon-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      <div className="admin-body">
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
          <div className="sidebar-brand-box">
            <div className="admin-brand-dots">
              <span className="dot dot-red" />
              <span className="dot dot-orange" />
              <span className="dot dot-green" />
              <span className="dot dot-teal" />
              <span className="dot dot-blue" />
              <span className="dot dot-purple" />
            </div>
            <div className="admin-brand-text">
              <span className="brand-primary">OwlGaming</span>
            </div>
          </div>

          <nav className="admin-nav-tree">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path || 
                (item.path === '/players' && currentPath.startsWith('/players')) ||
                (item.path === '/accounts' && currentPath.startsWith('/accounts')) ||
                (item.path === '/resources' && currentPath.startsWith('/resources')) ||
                (item.path === '/logs' && currentPath.startsWith('/logs'));

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-nav-item ${isActive ? 'active-pill' : ''}`}
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

          <div className="admin-sidebar-footer">
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

        <main className="admin-main-content">
          <div className="admin-card-container">
            {children}
          </div>

          <footer className="admin-page-footer">
            <span>© 2026 OwlGaming MTA Roleplay. All rights reserved.</span>
          </footer>
        </main>
      </div>
    </div>
  );
};
