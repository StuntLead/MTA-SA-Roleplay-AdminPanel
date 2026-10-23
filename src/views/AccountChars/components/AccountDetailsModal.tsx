import React from 'react';
import { IAccount } from '../../../interfaces';
import { Modal } from '../../../components';

interface AccountDetailsModalProps {
  account: IAccount | null;
  onClose: () => void;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({ account, onClose }) => {
  if (!account) return null;

  return (
    <Modal
      isOpen={!!account}
      onClose={onClose}
      title={`Account Profile — ${account.username} (#${account.id})`}
      maxWidth="680px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <button type="button" className="btn-enterprise btn-teal" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="data-list">
          <div className="data-row">
            <span className="data-key">Account Username</span>
            <span className="data-val" style={{ fontWeight: 600 }}>{account.username}</span>
          </div>
          <div className="data-row">
            <span className="data-key">Email Address</span>
            <span className="data-val">{account.email || 'None registered'}</span>
          </div>
          <div className="data-row">
            <span className="data-key">Administrative Level</span>
            <span className="data-val">
              {Number(account.admin) > 0 ? (
                <span className="badge-pill badge-info">Admin Level {account.admin}</span>
              ) : (
                <span className="badge-pill badge-neutral">Player</span>
              )}
            </span>
          </div>
          <div className="data-row">
            <span className="data-key">Registration Date</span>
            <span className="data-val font-mono">
              {account.registerdate
                ? new Date(account.registerdate).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <div className="data-row">
            <span className="data-key">Last IP Address</span>
            <span className="data-val font-mono">{account.ip || 'N/A'}</span>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
            Associated Characters ({account.characters?.length || 0})
          </h4>

          {(!account.characters || account.characters.length === 0) ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.75rem', background: 'var(--bg-hover)', borderRadius: '4px' }}>
              No characters created under this account.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {account.characters.map((char) => (
                <div 
                  key={char.id} 
                  style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--r-md)', 
                    padding: '0.85rem',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                      {char.charactername.replace(/_/g, ' ')}
                    </span>
                    <span className="badge-pill badge-neutral">DB #{char.id}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Hours Played:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{char.hoursplayed || 0} hrs</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Cash:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#10b981' }}>
                        ${(char.money || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Bank:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--panel-teal-pill)' }}>
                        ${(char.bankmoney || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Skin Model:</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{char.skin ?? 'Default'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
