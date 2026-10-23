import React, { useState } from 'react';
import { Layers, Play, Square, RotateCcw, RefreshCw, Download } from 'lucide-react';
import { IResource, ResourceActionType } from '../../interfaces';

interface ResourceControlsViewProps {
  resources: IResource[];
  onAction: (name: string, action: ResourceActionType) => Promise<void>;
  onRefresh: () => void;
  loading: boolean;
}

export const ResourceControlsView: React.FC<ResourceControlsViewProps> = ({
  resources,
  onAction,
  onRefresh,
  loading,
}) => {
  const [colSearchName, setColSearchName] = useState('');
  const [colSearchAuthor, setColSearchAuthor] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'running' | 'stopped'>('all');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const safeList = Array.isArray(resources) ? resources : [];

  const filtered = safeList.filter((r) => {
    if (!r) return false;
    const name = String(r.name || '').toLowerCase();
    const author = String(r.author || '').toLowerCase();

    if (colSearchName && !name.includes(colSearchName.toLowerCase())) return false;
    if (colSearchAuthor && !author.includes(colSearchAuthor.toLowerCase())) return false;

    if (filterState === 'running') return r.state === 'running';
    if (filterState === 'stopped') return r.state !== 'running';
    return true;
  });

  const runningCount = safeList.filter((r) => r.state === 'running').length;
  const stoppedCount = safeList.length - runningCount;

  const handleAction = async (name: string, action: ResourceActionType) => {
    setActionLoading((prev) => ({ ...prev, [name]: true }));
    try {
      await onAction(name, action);
    } finally {
      setActionLoading((prev) => ({ ...prev, [name]: false }));
    }
  };

  const exportResources = () => {
    const headers = ['ResourceName,State,Type,Author,Version,Description\n'];
    const rows = filtered.map(r => 
      `"${r.name}","${r.state}","${r.type || 'script'}","${r.author || ''}","${r.version || ''}","${(r.description || '').replace(/"/g, '""')}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resources-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="admin-page-card">
      <h1 className="page-card-title">Server Resource Controls</h1>

      <div className="admin-toolbar">
        <div className="toolbar-left">
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`btn-enterprise ${filterState === 'all' ? 'btn-teal' : 'btn-ghost'}`}
              onClick={() => setFilterState('all')}
            >
              All ({safeList.length})
            </button>
            <button
              type="button"
              className={`btn-enterprise ${filterState === 'running' ? 'btn-teal' : 'btn-ghost'}`}
              onClick={() => setFilterState('running')}
            >
              Running ({runningCount})
            </button>
            <button
              type="button"
              className={`btn-enterprise ${filterState === 'stopped' ? 'btn-teal' : 'btn-ghost'}`}
              onClick={() => setFilterState('stopped')}
            >
              Stopped ({stoppedCount})
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <button 
            type="button" 
            className="btn-enterprise btn-rust" 
            onClick={exportResources}
            title="Download CSV report"
          >
            <Download size={13} />
            <span>Download Resource Lists</span>
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
                <span>RESOURCE NAME</span>
                <input
                  type="text"
                  placeholder="Search resource"
                  value={colSearchName}
                  onChange={(e) => setColSearchName(e.target.value)}
                  className="col-filter-input"
                />
              </th>
              <th style={{ width: '110px' }}>STATUS</th>
              <th style={{ width: '90px' }}>TYPE</th>
              <th>
                <span>AUTHOR</span>
                <input
                  type="text"
                  placeholder="Search author"
                  value={colSearchAuthor}
                  onChange={(e) => setColSearchAuthor(e.target.value)}
                  className="col-filter-input"
                />
              </th>
              <th>VERSION</th>
              <th>DESCRIPTION</th>
              <th style={{ textAlign: 'center', width: '220px' }}>OPERATIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Scanning server resources...' : 'No resources match filter.'}
                </td>
              </tr>
            ) : (
              filtered.map((res, idx) => {
                const isRunning = res.state === 'running';
                const isBusy = actionLoading[res.name];

                return (
                  <tr key={res.name || idx}>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {res.name}
                      </div>
                      {res.group && res.group !== 'root' && (
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          Group: [{res.group}]
                        </span>
                      )}
                    </td>
                    <td>
                      {isRunning ? (
                        <span className="badge-pill badge-success">Running</span>
                      ) : (
                        <span className="badge-pill badge-neutral">Stopped</span>
                      )}
                    </td>
                    <td>
                      <span className="badge-pill badge-info">{res.type || 'script'}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {res.author || 'OwlGaming'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
                      {res.version || '1.0.0'}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                      {res.description || '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '5px' }}>
                        {!isRunning ? (
                          <button
                            type="button"
                            className="btn-enterprise btn-teal"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                            onClick={() => handleAction(res.name, 'start')}
                            disabled={isBusy}
                          >
                            <Play size={11} />
                            <span>Start</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-enterprise btn-crimson"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                            onClick={() => handleAction(res.name, 'stop')}
                            disabled={isBusy}
                          >
                            <Square size={11} />
                            <span>Stop</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-enterprise btn-rust"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => handleAction(res.name, 'restart')}
                          disabled={isBusy}
                        >
                          <RotateCcw size={11} className={isBusy ? 'animate-spin' : ''} />
                          <span>Restart</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination-bar">
        <div>
          <span>Rows per page:</span>
          <select className="rows-per-page-select" defaultValue="25">
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className="pagination-controls">
          <button type="button" className="pagination-page-btn" disabled>&lt;</button>
          <button type="button" className="pagination-page-btn active">1</button>
          <button type="button" className="pagination-page-btn" disabled>&gt;</button>
        </div>
      </div>
    </div>
  );
};
