import React, { useState } from 'react';
import { UserCheck, Eye, Search, Download, RefreshCw } from 'lucide-react';
import { IAccount } from '../../interfaces';
import { AccountDetailsModal } from './components/AccountDetailsModal';

interface AccountCharsViewProps {
  accounts: IAccount[];
  totalAccounts: number;
  onSearch: (query: string) => void;
  onViewAccount: (id: number) => Promise<IAccount>;
  onRefresh: () => void;
  loading: boolean;
}

export const AccountCharsView: React.FC<AccountCharsViewProps> = ({
  accounts,
  totalAccounts,
  onSearch,
  onViewAccount,
  onRefresh,
  loading,
}) => {
  const [colUsername, setColUsername] = useState('');
  const [colEmail, setColEmail] = useState('');
  const [colIp, setColIp] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<IAccount | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const safeList = Array.isArray(accounts) ? accounts : [];

  const filtered = safeList.filter((acc) => {
    if (!acc) return false;
    const user = String(acc.username || '').toLowerCase();
    const email = String(acc.email || '').toLowerCase();
    const ip = String(acc.ip || '').toLowerCase();

    if (colUsername && !user.includes(colUsername.toLowerCase())) return false;
    if (colEmail && !email.includes(colEmail.toLowerCase())) return false;
    if (colIp && !ip.includes(colIp.toLowerCase())) return false;

    return true;
  });

  const handleInspect = async (id: number) => {
    setLoadingDetails(true);
    try {
      const details = await onViewAccount(id);
      setSelectedAccount(details);
    } finally {
      setLoadingDetails(false);
    }
  };

  const exportAccounts = () => {
    const headers = ['ID,Username,Email,AdminLevel,RegisterDate,LastIP\n'];
    const rows = filtered.map(a => 
      `${a.id},"${a.username}","${a.email || ''}",${a.admin || 0},"${a.registerdate || ''}","${a.ip || ''}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="admin-page-card">
      <h1 className="page-card-title">Accounts &amp; Characters Management</h1>

      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div>
            <div className="filter-box-label">Quick Account Search</div>
            <div className="filter-input-wrap">
              <Search size={14} className="text-muted" />
              <input
                type="text"
                placeholder="Search database..."
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="toolbar-right">
          <button 
            type="button" 
            className="btn-enterprise btn-rust" 
            onClick={exportAccounts}
            title="Download CSV report"
          >
            <Download size={13} />
            <span>Download Account Lists</span>
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

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>NO</th>
              <th>
                <span>USERNAME</span>
                <input
                  type="text"
                  placeholder="Search user"
                  value={colUsername}
                  onChange={(e) => setColUsername(e.target.value)}
                  className="col-filter-input"
                />
              </th>
              <th>
                <span>EMAIL ADDRESS</span>
                <input
                  type="text"
                  placeholder="Search email"
                  value={colEmail}
                  onChange={(e) => setColEmail(e.target.value)}
                  className="col-filter-input"
                />
              </th>
              <th>ADMIN RANK</th>
              <th>REGISTRATION DATE</th>
              <th>
                <span>LAST IP</span>
                <input
                  type="text"
                  placeholder="Search IP"
                  value={colIp}
                  onChange={(e) => setColIp(e.target.value)}
                  className="col-filter-input"
                />
              </th>
              <th style={{ textAlign: 'center', width: '130px' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Searching MySQL accounts database...' : 'No accounts found.'}
                </td>
              </tr>
            ) : (
              filtered.map((acc, idx) => (
                <tr key={acc.id || idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {idx + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {acc.username}
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Account ID #{acc.id}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {acc.email || <span style={{ color: 'var(--text-muted)' }}>None</span>}
                  </td>
                  <td>
                    {Number(acc.admin) > 0 ? (
                      <span className="badge-pill badge-info">Admin Level {acc.admin}</span>
                    ) : (
                      <span className="badge-pill badge-neutral">Player</span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {acc.registerdate ? new Date(acc.registerdate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {acc.ip || 'N/A'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn-enterprise btn-ghost"
                      style={{ padding: '3px 10px', fontSize: '11px' }}
                      onClick={() => handleInspect(acc.id)}
                      disabled={loadingDetails}
                    >
                      <Eye size={12} />
                      <span>View Chars</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination-bar">
        <div>
          <span>Rows per page:</span>
          <select className="rows-per-page-select" defaultValue="15">
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="pagination-controls">
          <button type="button" className="pagination-page-btn" disabled>&lt;</button>
          <button type="button" className="pagination-page-btn active">1</button>
          <button type="button" className="pagination-page-btn" disabled>&gt;</button>
        </div>
      </div>

      <AccountDetailsModal
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
      />
    </div>
  );
};
