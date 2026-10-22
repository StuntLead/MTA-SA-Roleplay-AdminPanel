import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  UserCheck, 
  Activity, 
  RefreshCw, 
  Search, 
  Play, 
  Square, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  X, 
  Eye, 
  UserMinus, 
  Server, 
  Database,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('players');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Data states
  const [overview, setOverview] = useState(null);
  const [players, setPlayers] = useState([]);
  const [resources, setResources] = useState([]);
  const [accountsData, setAccountsData] = useState({ accounts: [], total: 0, page: 1, totalPages: 1 });
  
  // Search and filter states
  const [playerSearch, setPlayerSearch] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all'); // all, running, stopped
  const [accountSearch, setAccountSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({}); // resource name -> bool

  // Modals
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [kickModalPlayer, setKickModalPlayer] = useState(null);
  const [kickReason, setKickReason] = useState('Violation of server rules');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountDetailsLoading, setAccountDetailsLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all core data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Overview
      const resOverview = await fetch('/api/overview').catch(() => null);
      if (resOverview && resOverview.ok) {
        const data = await resOverview.json();
        setOverview(data);
      }

      // Players
      const resPlayers = await fetch('/api/players').catch(() => null);
      if (resPlayers && resPlayers.ok) {
        const data = await resPlayers.json();
        setPlayers(data.players || []);
      }

      // Resources
      const resResources = await fetch('/api/resources').catch(() => null);
      if (resResources && resResources.ok) {
        const data = await resResources.json();
        setResources(data.resources || []);
      }

      // Accounts
      const resAccounts = await fetch(`/api/accounts?search=${encodeURIComponent(accountSearch)}&page=1&limit=15`).catch(() => null);
      if (resAccounts && resAccounts.ok) {
        const data = await resAccounts.json();
        setAccountsData(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 8 seconds
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle accounts search change
  const handleAccountSearch = async (query) => {
    setAccountSearch(query);
    try {
      const res = await fetch(`/api/accounts?search=${encodeURIComponent(query)}&page=1&limit=15`);
      if (res.ok) {
        const data = await res.json();
        setAccountsData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // View Account Details
  const handleViewAccount = async (accId) => {
    setAccountDetailsLoading(true);
    try {
      const res = await fetch(`/api/accounts/${accId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAccount(data);
      }
    } catch (err) {
      showToast('Could not load account details', 'danger');
    } finally {
      setAccountDetailsLoading(false);
    }
  };

  // Resource Action
  const handleResourceAction = async (name, action) => {
    setActionLoading(prev => ({ ...prev, [name]: true }));
    try {
      const res = await fetch('/api/resources/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, action })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Resource ${name} ${action}ed`);
        // update local list
        setResources(prev => prev.map(r => {
          if (r.name === name) {
            return {
              ...r,
              state: action === 'stop' ? 'loaded' : 'running'
            };
          }
          return r;
        }));
      } else {
        showToast(data.message || 'Action failed', 'danger');
      }
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setActionLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  // Kick Player Action
  const handleKickSubmit = async (e) => {
    e.preventDefault();
    if (!kickModalPlayer) return;
    try {
      const res = await fetch('/api/players/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: kickModalPlayer.id, reason: kickReason })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Player kicked successfully`);
        setPlayers(prev => prev.filter(p => p.id !== kickModalPlayer.id));
        setKickModalPlayer(null);
      } else {
        showToast(data.message || 'Failed to kick player', 'danger');
      }
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Filtering calculations
  const filteredPlayers = players.filter(p => 
    p.character_name.toLowerCase().includes(playerSearch.toLowerCase()) ||
    p.account_name.toLowerCase().includes(playerSearch.toLowerCase())
  );

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(resourceSearch.toLowerCase()));
    if (!matchesSearch) return false;
    if (resourceFilter === 'running') return r.state === 'running';
    if (resourceFilter === 'stopped') return r.state !== 'running';
    return true;
  });

  const runningCount = resources.filter(r => r.state === 'running').length;
  const stoppedCount = resources.length - runningCount;

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className="toast">
            {toast.type === 'danger' ? (
              <AlertTriangle size={18} color="var(--danger)" />
            ) : (
              <CheckCircle2 size={18} color="var(--success)" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-icon">
            <Server size={22} color="#fff" />
          </div>
          <div className="brand-text">
            <h1>MTA:SA Admin</h1>
            <span>Roleplay Management</span>
          </div>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={18} />
            <span>Overview</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            <Users size={18} />
            <span>Online Players</span>
            <span className="nav-badge">{players.length}</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            <UserCheck size={18} />
            <span>Accounts & Chars</span>
            <span className="nav-badge">{accountsData.total || accountsData.accounts.length}</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            <Layers size={18} />
            <span>Resource Control</span>
            <span className="nav-badge">{resources.length}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="status-pill">
            <div className={`status-indicator ${overview ? 'online' : 'offline'}`} />
            <span>MTA Server: {overview?.isMock ? 'Demo / Offline' : 'Live Connected'}</span>
          </div>
          <div className="status-pill">
            <div className={`status-indicator ${overview?.db_connected ? 'online' : 'offline'}`} />
            <span>MySQL DB: {overview?.db_connected ? 'Connected' : 'Demo Mode'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <div className="top-header">
          <div className="page-title">
            <h2>
              {activeTab === 'overview' && 'Server Overview & Telemetry'}
              {activeTab === 'players' && 'Active Players In-Game'}
              {activeTab === 'accounts' && 'Player Accounts & Character Directory'}
              {activeTab === 'resources' && 'MTA Server Resource Management'}
            </h2>
            <p>
              {activeTab === 'overview' && 'Realtime health monitoring and game server status'}
              {activeTab === 'players' && 'Inspect players, check health/ping, and moderate in-game sessions'}
              {activeTab === 'accounts' && 'Database records, user permissions, and associated character profiles'}
              {activeTab === 'resources' && 'Monitor and execute start, stop, or restart operations on resources'}
            </p>
          </div>

          <div className="header-actions">
            <button 
              className="btn btn-secondary" 
              onClick={fetchData} 
              disabled={loading}
              title="Refresh All Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <p>Players Online</p>
              <h3>{players.length} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/ {overview?.max_players || 128}</span></h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
              <Layers size={24} />
            </div>
            <div className="stat-info">
              <p>Active Resources</p>
              <h3>{runningCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/ {resources.length}</span></h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <UserCheck size={24} />
            </div>
            <div className="stat-info">
              <p>Registered Accounts</p>
              <h3>{accountsData.total || accountsData.accounts.length}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a855f7' }}>
              <Server size={24} />
            </div>
            <div className="stat-info">
              <p>MTA Version</p>
              <h3 style={{ fontSize: '1.25rem' }}>{overview?.mta_version || '1.5.9'}</h3>
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="panel-card">
              <div className="panel-header">
                <h3><Server size={18} /> Server Information</h3>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <span className="detail-label">Server Host Name</span>
                  <span className="detail-val">{overview?.server_name || 'OwlGaming MTA:SA Roleplay'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Server Port</span>
                  <span className="detail-val">{overview?.server_port || 22003}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">FPS Limit</span>
                  <span className="detail-val">{overview?.fps_limit || 60} FPS</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Server Uptime</span>
                  <span className="detail-val">{overview ? `${Math.floor(overview.uptime / 60)} minutes` : 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">MTA HTTP API Bridge Status</span>
                  <span className="detail-val">
                    <span className="badge badge-success">Exported HTTP API Ready</span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">MySQL Connection Status</span>
                  <span className="detail-val">
                    {overview?.db_connected ? (
                      <span className="badge badge-success">Online & Connected</span>
                    ) : (
                      <span className="badge badge-warning">Simulated Mock (Check .env)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="panel-card">
              <div className="panel-header">
                <h3><Activity size={18} /> Quick Operations</h3>
              </div>
              <div style={{ padding: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setActiveTab('players')}>
                  <Users size={16} /> View Online Players ({players.length})
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('resources')}>
                  <Layers size={16} /> Manage Resources ({resources.length})
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('accounts')}>
                  <UserCheck size={16} /> Search User Accounts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE PLAYERS */}
        {activeTab === 'players' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3><Users size={18} /> Online Players ({filteredPlayers.length})</h3>
              
              <div className="search-input-wrapper">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Filter character or account..." 
                  className="search-input"
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Character Name</th>
                    <th>Account Name</th>
                    <th>Ping</th>
                    <th>Health / Armor</th>
                    <th>Admin Rank</th>
                    <th>Location</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                        No players currently connected.
                      </td>
                    </tr>
                  ) : (
                    filteredPlayers.map((player) => (
                      <tr key={player.id}>
                        <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>#{player.id}</span></td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{player.character_name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>DB ID: {player.character_id}</span>
                        </td>
                        <td>
                          <span className="badge badge-neutral">{player.account_name}</span>
                        </td>
                        <td>
                          <span style={{ 
                            fontFamily: 'var(--font-mono)', 
                            color: player.ping < 60 ? 'var(--success)' : player.ping < 120 ? 'var(--warning)' : 'var(--danger)' 
                          }}>
                            {player.ping} ms
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div className="stat-bar-container">
                              <div className="stat-bar">
                                <div className="stat-bar-fill health" style={{ width: `${Math.min(player.health, 100)}%` }} />
                              </div>
                              <span className="stat-bar-label">{player.health}%</span>
                            </div>
                            <div className="stat-bar-container">
                              <div className="stat-bar">
                                <div className="stat-bar-fill armor" style={{ width: `${Math.min(player.armor, 100)}%` }} />
                              </div>
                              <span className="stat-bar-label">{player.armor}%</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {player.admin_level > 0 ? (
                            <span className="badge badge-admin">Admin Rank {player.admin_level}</span>
                          ) : (
                            <span className="badge badge-neutral">Player</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{player.location}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedPlayer(player)}
                              title="Inspect Details"
                            >
                              <Eye size={14} /> Details
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setKickModalPlayer(player);
                                setKickReason('Violation of server rules');
                              }}
                              title="Kick Player"
                            >
                              <UserMinus size={14} /> Kick
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ACCOUNTS & CHARACTERS */}
        {activeTab === 'accounts' && (
          <div className="panel-card">
            <div className="panel-header">
              <h3><UserCheck size={18} /> Registered User Accounts</h3>

              <div className="search-input-wrapper">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search username or email..." 
                  className="search-input"
                  value={accountSearch}
                  onChange={(e) => handleAccountSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Account ID</th>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>Rank</th>
                    <th>Registered Date</th>
                    <th>Last Active</th>
                    <th>Characters</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {accountsData.accounts.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                        No accounts found.
                      </td>
                    </tr>
                  ) : (
                    accountsData.accounts.map((acc) => (
                      <tr key={acc.id}>
                        <td><span style={{ fontFamily: 'var(--font-mono)' }}>#{acc.id}</span></td>
                        <td><span style={{ fontWeight: 600, color: '#fff' }}>{acc.username}</span></td>
                        <td><span style={{ color: 'var(--text-muted)' }}>{acc.email || 'None'}</span></td>
                        <td>
                          {Number(acc.admin) > 0 ? (
                            <span className="badge badge-admin">Level {acc.admin}</span>
                          ) : (
                            <span className="badge badge-neutral">User</span>
                          )}
                        </td>
                        <td><span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{acc.registerdate || 'N/A'}</span></td>
                        <td><span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{acc.lastlogin || 'N/A'}</span></td>
                        <td>
                          <span className="badge badge-neutral">{acc.characters_count || acc.characters?.length || 0} Chars</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleViewAccount(acc.id)}
                          >
                            <Eye size={14} /> View Roster
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RESOURCE CONTROL */}
        {activeTab === 'resources' && (
          <div className="panel-card">
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <h3><Layers size={18} /> Server Resources ({filteredResources.length})</h3>
                
                <div className="filter-tabs">
                  <button 
                    className={`filter-tab ${resourceFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setResourceFilter('all')}
                  >
                    All ({resources.length})
                  </button>
                  <button 
                    className={`filter-tab ${resourceFilter === 'running' ? 'active' : ''}`}
                    onClick={() => setResourceFilter('running')}
                  >
                    Running ({runningCount})
                  </button>
                  <button 
                    className={`filter-tab ${resourceFilter === 'stopped' ? 'active' : ''}`}
                    onClick={() => setResourceFilter('stopped')}
                  >
                    Stopped ({stoppedCount})
                  </button>
                </div>
              </div>

              <div className="search-input-wrapper">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search resources..." 
                  className="search-input"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Resource Name</th>
                    <th>Type</th>
                    <th>State</th>
                    <th>Author</th>
                    <th>Version</th>
                    <th style={{ textAlign: 'right' }}>Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                        No resources matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredResources.map((res) => {
                      const isRunning = res.state === 'running';
                      const isLoading = actionLoading[res.name];

                      return (
                        <tr key={res.name}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                              {res.name}
                            </div>
                            {res.description && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {res.description}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-neutral">{res.type}</span>
                          </td>
                          <td>
                            {isRunning ? (
                              <span className="badge badge-success">Running</span>
                            ) : (
                              <span className="badge badge-warning">{res.state}</span>
                            )}
                          </td>
                          <td><span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{res.author || 'Community'}</span></td>
                          <td><span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{res.version || '1.0.0'}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              {!isRunning ? (
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleResourceAction(res.name, 'start')}
                                  disabled={isLoading}
                                  title="Start Resource"
                                >
                                  <Play size={13} /> Start
                                </button>
                              ) : (
                                <>
                                  <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleResourceAction(res.name, 'restart')}
                                    disabled={isLoading}
                                    title="Restart Resource"
                                  >
                                    <RotateCcw size={13} /> Restart
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleResourceAction(res.name, 'stop')}
                                    disabled={isLoading}
                                    title="Stop Resource"
                                  >
                                    <Square size={13} /> Stop
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: PLAYER DETAILS */}
      {selectedPlayer && (
        <div className="modal-backdrop" onClick={() => setSelectedPlayer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Player Details: {selectedPlayer.character_name}</h3>
              <button className="modal-close" onClick={() => setSelectedPlayer(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Character Name</span>
                <span className="detail-val">{selectedPlayer.character_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Account Username</span>
                <span className="detail-val">{selectedPlayer.account_name} (#{selectedPlayer.account_id})</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">In-Game Server ID</span>
                <span className="detail-val">#{selectedPlayer.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">IP Address</span>
                <span className="detail-val">{selectedPlayer.ip}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ping</span>
                <span className="detail-val">{selectedPlayer.ping} ms</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Health & Armor</span>
                <span className="detail-val">{selectedPlayer.health}% HP | {selectedPlayer.armor}% Armor</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cash on Hand</span>
                <span className="detail-val" style={{ color: 'var(--success)' }}>${(selectedPlayer.cash || 0).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bank Balance</span>
                <span className="detail-val" style={{ color: '#60a5fa' }}>${(selectedPlayer.bank || 0).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Hours Played</span>
                <span className="detail-val">{selectedPlayer.hours_played} hours</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Current Zone</span>
                <span className="detail-val">{selectedPlayer.location}</span>
              </div>
              {selectedPlayer.coordinates && (
                <div className="detail-row">
                  <span className="detail-label">Coordinates (X, Y, Z)</span>
                  <span className="detail-val">{selectedPlayer.coordinates.x}, {selectedPlayer.coordinates.y}, {selectedPlayer.coordinates.z}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: KICK PLAYER */}
      {kickModalPlayer && (
        <div className="modal-backdrop" onClick={() => setKickModalPlayer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                <ShieldAlert size={20} /> Kick {kickModalPlayer.character_name}
              </h3>
              <button className="modal-close" onClick={() => setKickModalPlayer(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleKickSubmit}>
              <div className="modal-body">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '14px' }}>
                  Are you sure you want to disconnect this player from the server? Please specify an administrative reason:
                </p>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: '100%', padding: '10px 14px' }}
                  value={kickReason}
                  onChange={(e) => setKickReason(e.target.value)}
                  placeholder="Enter kick reason..."
                  required
                />
              </div>
              <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setKickModalPlayer(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirm Kick
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ACCOUNT & CHARACTER ROSTER */}
      {selectedAccount && (
        <div className="modal-backdrop" onClick={() => setSelectedAccount(null)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Account: {selectedAccount.username} (#{selectedAccount.id})</h3>
              <button className="modal-close" onClick={() => setSelectedAccount(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-val">{selectedAccount.email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Admin Level</span>
                <span className="detail-val">
                  {selectedAccount.admin > 0 ? `Level ${selectedAccount.admin}` : 'Standard Player'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Registration Date</span>
                <span className="detail-val">{selectedAccount.registerdate || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Login</span>
                <span className="detail-val">{selectedAccount.lastlogin || 'N/A'}</span>
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '8px', fontSize: '1rem', color: '#fff' }}>
                Associated Characters ({selectedAccount.characters?.length || 0})
              </h4>

              {(!selectedAccount.characters || selectedAccount.characters.length === 0) ? (
                <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>No characters found for this account.</p>
              ) : (
                selectedAccount.characters.map((char) => (
                  <div key={char.id} className="character-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.98rem' }}>
                        {char.charactername.replace('_', ' ')}
                      </span>
                      <span className="badge badge-neutral">ID #{char.id}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-dim)' }}>Hours Played:</span>
                        <div style={{ fontWeight: 600 }}>{char.hoursplayed || 0} hrs</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-dim)' }}>Cash:</span>
                        <div style={{ fontWeight: 600, color: 'var(--success)' }}>${(char.money || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-dim)' }}>Bank:</span>
                        <div style={{ fontWeight: 600, color: '#60a5fa' }}>${(char.bankmoney || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
