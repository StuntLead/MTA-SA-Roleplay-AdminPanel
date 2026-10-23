import React, { useState } from 'react';
import { Users, Eye, UserMinus, RefreshCw, Download, Calendar } from 'lucide-react';
import { IPlayer } from '../../interfaces';
import { PlayerInspectModal } from './components/PlayerInspectModal';
import { PlayerKickModal } from './components/PlayerKickModal';

interface OnlinePlayerViewProps {
  players: IPlayer[];
  onKickPlayer: (id: number, reason: string) => Promise<void>;
  onRefresh: () => void;
  loading: boolean;
}

export const OnlinePlayerView: React.FC<OnlinePlayerViewProps> = ({
  players,
  onKickPlayer,
  onRefresh,
  loading,
}) => {
  const [colSearchChar, setColSearchChar] = useState('');
  const [colSearchAccount, setColSearchAccount] = useState('');
  const [colSearchLocation, setColSearchLocation] = useState('');
  const [inspectPlayer, setInspectPlayer] = useState<IPlayer | null>(null);
  const [kickPlayer, setKickPlayer] = useState<IPlayer | null>(null);

  const safeList = Array.isArray(players) ? players : [];

  const filtered = safeList.filter((p) => {
    if (!p) return false;
    const charName = String(p.character_name || '').toLowerCase();
    const accName = String(p.account_name || '').toLowerCase();
    const loc = String(p.location || '').toLowerCase();

    if (colSearchChar && !charName.includes(colSearchChar.toLowerCase())) return false;
    if (colSearchAccount && !accName.includes(colSearchAccount.toLowerCase())) return false;
    if (colSearchLocation && !loc.includes(colSearchLocation.toLowerCase())) return false;

    return true;
  });

  const exportCsv = () => {
    const headers = ['ID,Character,Account,Ping,Cash,Bank,Health,Armor,Admin,Location\n'];
    const rows = filtered.map(p => 
      `${p.id},"${p.character_name}","${p.account_name}",${p.ping},${p.cash || 0},${p.bank || 0},${p.health},${p.armor},${p.admin_level},"${p.location}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `players-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="hibank-page-card">
      {/* Centered Title (Like Screenshot 1 "Biller Transaction") */}
      <h1 className="page-card-title">Online Players</h1>

      {/* Toolbar: Filter Date on Left, Action Buttons on Right (Like Screenshot 2) */}
      <div className="hibank-toolbar">
        <div className="toolbar-left">
          <div>
            <div className="filter-box-label">Filter Session Date</div>
            <div className="filter-input-wrap">
              <Calendar size={14} className="text-muted" />
              <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="toolbar-right">
          <button 
            type="button" 
            className="btn-enterprise btn-rust" 
            onClick={exportCsv}
            title="Download CSV report"
          >
            <Download size={13} />
            <span>Download Player Lists</span>
          </button>

          <button 
            type="button" 
            className="btn-enterprise btn-teal" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Table</span>
          </button>
        </div>
      </div>

      {/* Table with Column-Specific Search Inputs (Like Screenshot 1) */}
      <div className="hibank-table-wrapper">
        <table className="hibank-table">
          <thead>
            <tr>
              <th style={{ width: '45px' }}>NO</th>
              <th>
                <span>CHARACTER NAME</span>
                <input
                  type="text"
                  placeholder="Search name"
                  value={colSearchChar}
                  onChange={(e) => setColSearchChar(e.target.value)}
                  className="col-filter-input"
                />
              </th>
              <th>
                <span>ACCOUNT NAME</span>
                <input
                  type="text"
                  placeholder="Search account"
                  value={colSearchAccount}
                  onChange={(e) => setColSearchAccount(e.target.value)}
                  className="col-filter-input"
                />
              </th>
              <th style={{ width: '70px' }}>PING</th>
              <th>CASH</th>
              <th>BANK MONEY</th>
              <th>HEALTH / ARMOR</th>
              <th>RANK</th>
              <th>
                <span>LOCATION</span>
                <input
                  type="text"
                  placeholder="Search location"
                  value={colSearchLocation}
                  onChange={(e) => setColSearchLocation(e.target.value)}
                  className="col-filter-input"
                />
              </th>
              <th style={{ textAlign: 'center', width: '140px' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Fetching active players...' : 'No online players match search criteria.'}
                </td>
              </tr>
            ) : (
              filtered.map((player, idx) => (
                <tr key={player.id || idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {idx + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {player.character_name}
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      ID #{player.id} • DB #{player.character_id}
                    </span>
                  </td>
                  <td>
                    <span className="badge-pill badge-neutral">
                      {player.account_name}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontWeight: 600, 
                      color: player.ping < 50 ? '#10b981' : player.ping < 120 ? '#f59e0b' : '#ef4444' 
                    }}>
                      {player.ping} ms
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#10b981' }}>
                    ${(player.cash || 0).toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--hibank-teal-pill)' }}>
                    ${(player.bank || 0).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{player.health}% HP</span>
                      <span style={{ color: 'var(--text-muted)' }}> | </span>
                      <span style={{ color: '#0ea5e9', fontWeight: 600 }}>{player.armor}% AP</span>
                    </div>
                  </td>
                  <td>
                    {player.admin_level > 0 ? (
                      <span className="badge-pill badge-info">Admin {player.admin_level}</span>
                    ) : (
                      <span className="badge-pill badge-neutral">Player</span>
                    )}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {player.location}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-enterprise btn-ghost"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        onClick={() => setInspectPlayer(player)}
                        title="Inspect Player Details"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                      <button
                        type="button"
                        className="btn-enterprise btn-crimson"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        onClick={() => setKickPlayer(player)}
                        title="Kick from Server"
                      >
                        <UserMinus size={12} />
                        <span>Kick</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar (Like Screenshot 1) */}
      <div className="hibank-pagination-bar">
        <div>
          <span>Rows per page:</span>
          <select className="rows-per-page-select" defaultValue="10">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="pagination-controls">
          <button type="button" className="pagination-page-btn" disabled>&lt;</button>
          <button type="button" className="pagination-page-btn active">1</button>
          <button type="button" className="pagination-page-btn" disabled>&gt;</button>
        </div>
      </div>

      {/* Inspect & Kick Modals */}
      <PlayerInspectModal
        player={inspectPlayer}
        onClose={() => setInspectPlayer(null)}
      />

      <PlayerKickModal
        player={kickPlayer}
        onClose={() => setKickPlayer(null)}
        onConfirm={onKickPlayer}
      />
    </div>
  );
};
