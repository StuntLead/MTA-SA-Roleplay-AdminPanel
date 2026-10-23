import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, RefreshCw } from 'lucide-react';
import { IGameLog, IGameLogsResponse } from '../../interfaces';

export const GameLogView: React.FC = () => {
  const [logs, setLogs] = useState<IGameLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [files, setFiles] = useState<string[]>([]);
  const [actionTypes, setActionTypes] = useState<{ id: number; label: string }[]>([]);

  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedFile, setSelectedFile] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: search.trim(),
        action: selectedAction,
        file: selectedFile
      });

      const res = await fetch(`/api/logs?${params.toString()}`);
      if (res.ok) {
        const data: IGameLogsResponse = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.files && data.files.length > 0) setFiles(data.files);
        if (data.actionTypes && data.actionTypes.length > 0) setActionTypes(data.actionTypes);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedAction, selectedFile]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAction(e.target.value);
    setPage(1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFile(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const exportLogs = () => {
    const headers = ['ID,Date,ActionID,ActionName,Origin,Content,Accounts,Characters,Vehicles,File\n'];
    const rows = logs.map(l => 
      `"${l.id}","${l.date}",${l.action},"${l.action_name}","${l.origin}","${(l.content || '').replace(/"/g, '""')}","${l.accounts.join(';') || ''}","${l.characters.join(';') || ''}","${l.vehicles.join(';') || ''}","${l.file}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gamelogs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const getActionBadgeClass = (actionId: number) => {
    if ([1, 2, 3, 4].includes(actionId)) return 'badge-danger';
    if ([5].includes(actionId)) return 'badge-warning';
    if ([7, 8, 9, 10, 11, 12, 14, 15, 18, 19, 20, 21].includes(actionId)) return 'badge-info';
    if ([25, 26].includes(actionId)) return 'badge-success';
    if ([27].includes(actionId)) return 'badge-neutral';
    return 'badge-neutral';
  };

  return (
    <div className="admin-page-card">
      <h1 className="page-card-title">Game Log</h1>

      <div className="admin-toolbar">
        <form onSubmit={handleSearchSubmit} className="toolbar-left" style={{ flex: 1, flexWrap: 'wrap' }}>
          <div>
            <div className="filter-box-label">Search Log Content</div>
            <div className="filter-input-wrap">
              <Search size={14} className="text-muted" />
              <input
                type="text"
                placeholder="Search command, origin, message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '200px' }}
              />
            </div>
          </div>

          <div>
            <div className="filter-box-label">Action Category</div>
            <select
              className="form-select"
              style={{ width: '170px', padding: '0.35rem 0.5rem', fontSize: '12.5px' }}
              value={selectedAction}
              onChange={handleActionChange}
            >
              <option value="all">All Action Types</option>
              {actionTypes.map(act => (
                <option key={act.id} value={act.id}>
                  {act.label} (#{act.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="filter-box-label">Log File Period</div>
            <select
              className="form-select"
              style={{ width: '150px', padding: '0.35rem 0.5rem', fontSize: '12.5px' }}
              value={selectedFile}
              onChange={handleFileChange}
            >
              <option value="all">All Files ({files.length})</option>
              {files.map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn-enterprise btn-teal"
            style={{ alignSelf: 'flex-end', height: '32px' }}
          >
            Apply Filter
          </button>
        </form>

        <div className="toolbar-right">
          <button 
            type="button" 
            className="btn-enterprise btn-rust" 
            onClick={exportLogs}
            title="Download CSV export"
          >
            <Download size={13} />
            <span>Download Logs</span>
          </button>

          <button 
            type="button" 
            className="btn-enterprise btn-teal" 
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '45px' }}>NO</th>
              <th style={{ width: '150px' }}>TIMESTAMP</th>
              <th style={{ width: '140px' }}>ACTION TYPE</th>
              <th style={{ width: '90px' }}>ORIGIN</th>
              <th style={{ width: '130px' }}>ENTITIES</th>
              <th>LOG CONTENT / DETAILS</th>
              <th style={{ width: '100px', textAlign: 'center' }}>SOURCE FILE</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Reading game log records...' : 'No game logs match the selected filter.'}
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={log.id || idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                    {log.date ? log.date.replace('T', ' ') : '—'}
                  </td>
                  <td>
                    <span className={`badge-pill ${getActionBadgeClass(log.action)}`}>
                      {log.action_name}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontWeight: 600, 
                      fontSize: '11px',
                      color: log.origin.startsWith('ch') ? '#0ea5e9' : log.origin.startsWith('ac') ? '#10b981' : '#64748b' 
                    }}>
                      {log.origin}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
                      {log.characters?.map(cid => (
                        <span key={`c-${cid}`} className="badge-pill badge-neutral" title="Character ID">
                          ch:{cid}
                        </span>
                      ))}
                      {log.accounts?.map(aid => (
                        <span key={`a-${aid}`} className="badge-pill badge-neutral" title="Account ID">
                          acc:{aid}
                        </span>
                      ))}
                      {log.vehicles?.map(vid => (
                        <span key={`v-${vid}`} className="badge-pill badge-neutral" title="Vehicle ID">
                          veh:{vid}
                        </span>
                      ))}
                      {(!log.characters?.length && !log.accounts?.length && !log.vehicles?.length) && (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                      {log.content}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {log.file}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination-bar">
        <div>
          <span>Total records: <strong>{total}</strong></span>
          <span style={{ marginLeft: '1rem' }}>Rows per page:</span>
          <select 
            className="rows-per-page-select" 
            value={limit} 
            onChange={handleLimitChange}
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className="pagination-controls">
          <button 
            type="button" 
            className="pagination-page-btn" 
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            &lt;
          </button>
          <span style={{ padding: '0 8px', fontSize: '12px' }}>
            Page {page} of {totalPages}
          </span>
          <button 
            type="button" 
            className="pagination-page-btn" 
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};
