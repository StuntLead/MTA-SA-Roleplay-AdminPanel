import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './layouts';
import { DashboardView } from './views/Dashboard/DashboardView';
import { OnlinePlayerView } from './views/OnlinePlayer/OnlinePlayerView';
import { AccountCharsView } from './views/AccountChars/AccountCharsView';
import { ResourceControlsView } from './views/ResourceControls/ResourceControlsView';
import { GameLogView } from './views/GameLog/GameLogView';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

let toastIdCounter = 0;

function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [overview, setOverview]       = useState(null);
  const [players, setPlayers]         = useState([]);
  const [resources, setResources]     = useState([]);
  const [accountsData, setAccountsData] = useState({
    accounts: [], total: 0, page: 1, totalPages: 1,
  });

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resOverview, resPlayers, resResources, resAccounts] = await Promise.all([
        fetch('/api/overview').catch(() => null),
        fetch('/api/players').catch(() => null),
        fetch('/api/resources').catch(() => null),
        fetch('/api/accounts?page=1&limit=20').catch(() => null),
      ]);

      if (resOverview?.ok)  { const d = await resOverview.json();  setOverview(d); }
      if (resPlayers?.ok)   { const d = await resPlayers.json();   setPlayers(d.players || []); }
      if (resResources?.ok) { const d = await resResources.json(); setResources(d.resources || []); }
      if (resAccounts?.ok)  { const d = await resAccounts.json();  setAccountsData(d); }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const handleAccountSearch = async (query) => {
    try {
      const res = await fetch(`/api/accounts?search=${encodeURIComponent(query)}&page=1&limit=20`);
      if (res.ok) setAccountsData(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleViewAccount = async (id) => {
    const res = await fetch(`/api/accounts/${id}`);
    if (!res.ok) throw new Error('Failed to load account');
    return res.json();
  };

  const handleResourceAction = async (name, action) => {
    try {
      const res = await fetch('/api/resources/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `${name} ${action}ed successfully`);
        setResources((prev) =>
          prev.map((r) =>
            r.name === name ? { ...r, state: action === 'stop' ? 'loaded' : 'running' } : r
          )
        );
      } else {
        showToast(data.message || 'Action failed', 'danger');
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'danger');
    }
  };

  const handleKickPlayer = async (id, reason) => {
    const res = await fetch('/api/players/kick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reason }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Player kicked successfully');
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } else {
      showToast(data.message || 'Kick failed', 'danger');
      throw new Error(data.message);
    }
  };

  return (
    <>
      <MainLayout
        onRefresh={fetchData}
        loading={loading}
        playerCount={players.length}
        resourceCount={resources.length}
        accountCount={accountsData.total || accountsData.accounts.length}
        isServerOnline={!!overview && !overview.isMock}
        isDbOnline={!!overview?.db_connected}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <DashboardView
                overview={overview}
                onNavigate={(routeId) => {
                  const pathMap = {
                    'online-players': '/players',
                    'account-chars': '/accounts',
                    'resource-controls': '/resources',
                    'game-logs': '/logs',
                    'dashboard': '/dashboard',
                  };
                  navigate(pathMap[routeId] || `/${routeId}`);
                }}
                onRefresh={fetchData}
                loading={loading}
              />
            }
          />
          <Route
            path="/players"
            element={
              <OnlinePlayerView
                players={players}
                onKickPlayer={handleKickPlayer}
                onRefresh={fetchData}
                loading={loading}
              />
            }
          />
          <Route
            path="/accounts"
            element={
              <AccountCharsView
                accounts={accountsData.accounts}
                totalAccounts={accountsData.total}
                onSearch={handleAccountSearch}
                onViewAccount={handleViewAccount}
                onRefresh={fetchData}
                loading={loading}
              />
            }
          />
          <Route
            path="/resources"
            element={
              <ResourceControlsView
                resources={resources}
                onAction={handleResourceAction}
                onRefresh={fetchData}
                loading={loading}
              />
            }
          />
          <Route path="/logs" element={<GameLogView />} />
          <Route path="/resource-controls" element={<Navigate to="/resources" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MainLayout>

      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              {toast.type === 'danger'
                ? <AlertTriangle size={16} color="#ef4444" />
                : <CheckCircle2 size={16} color="#10b981" />
              }
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AdminPanel />
    </ThemeProvider>
  );
}
