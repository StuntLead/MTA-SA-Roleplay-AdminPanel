import React from 'react';
import { Server, Activity, Users, Layers, ShieldCheck, Database, HardDrive, Clock, RefreshCw } from 'lucide-react';
import { IServerOverview } from '../../interfaces';

interface DashboardViewProps {
  overview: IServerOverview | null;
  onNavigate: (routeId: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  overview,
  onNavigate,
  onRefresh,
  loading,
}) => {
  return (
    <div className="hibank-page-card">
      <h1 className="page-card-title">Server Dashboard &amp; Telemetry</h1>

      {/* KPI Cards Row */}
      <div className="dashboard-kpi-grid">
        <div className="dashboard-kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Players Online</span>
            <div className="kpi-icon">
              <Users size={16} />
            </div>
          </div>
          <div className="kpi-number">{overview?.players_online ?? 0}</div>
          <div className="kpi-sub">Capacity: {overview?.max_players ?? 1024} players</div>
        </div>

        <div className="dashboard-kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Resources Running</span>
            <div className="kpi-icon">
              <Layers size={16} />
            </div>
          </div>
          <div className="kpi-number">{overview?.resources_running ?? 0}</div>
          <div className="kpi-sub">{overview?.resources_total ?? 0} total on disk</div>
        </div>

        <div className="dashboard-kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Engine Version</span>
            <div className="kpi-icon">
              <Server size={16} />
            </div>
          </div>
          <div className="kpi-number" style={{ fontSize: '20px' }}>
            {overview?.mta_version || '1.6.0'}
          </div>
          <div className="kpi-sub">Game Port: {overview?.server_port || 22003}</div>
        </div>

        <div className="dashboard-kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">MySQL Database</span>
            <div className="kpi-icon">
              <Database size={16} />
            </div>
          </div>
          <div className="kpi-number" style={{ fontSize: '20px' }}>
            {overview?.db_connected ? 'Connected' : 'Offline'}
          </div>
          <div className="kpi-sub">Databases: core &amp; mta</div>
        </div>
      </div>

      {/* Server Specs Details */}
      <div style={{ marginTop: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          System Telemetry &amp; Server Specifications
        </h3>

        <div className="data-list">
          <div className="data-row">
            <span className="data-key">Server Host Name</span>
            <span className="data-val" style={{ fontWeight: 600 }}>{overview?.server_name || 'OwlGaming Roleplay'}</span>
          </div>
          <div className="data-row">
            <span className="data-key">Gamemode &amp; Location</span>
            <span className="data-val">{overview?.game_type || 'Roleplay'} — {overview?.map_name || 'Los Santos'}</span>
          </div>
          <div className="data-row">
            <span className="data-key">Engine FPS Limit</span>
            <span className="data-val" style={{ fontFamily: 'var(--font-mono)' }}>{overview?.fps_limit || 60} FPS</span>
          </div>
          <div className="data-row">
            <span className="data-key">Uptime</span>
            <span className="data-val" style={{ fontFamily: 'var(--font-mono)' }}>
              {overview?.uptime ? `${Math.floor(overview.uptime / 60)} minutes` : 'Active'}
            </span>
          </div>
          <div className="data-row">
            <span className="data-key">HTTP API Bridge</span>
            <span className="data-val">
              <span className="badge-pill badge-success">admin-api Live</span>
            </span>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-enterprise btn-teal"
            onClick={() => onNavigate('online-players')}
          >
            <Users size={13} />
            <span>Go to Online Players</span>
          </button>
          <button
            type="button"
            className="btn-enterprise btn-rust"
            onClick={() => onNavigate('resource-controls')}
          >
            <Layers size={13} />
            <span>Manage Resources</span>
          </button>
        </div>
      </div>
    </div>
  );
};
