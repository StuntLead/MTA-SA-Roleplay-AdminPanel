import React from 'react';
import { IPlayer } from '../../../interfaces';
import { Modal } from '../../../components';

interface PlayerInspectModalProps {
  player: IPlayer | null;
  onClose: () => void;
}

export const PlayerInspectModal: React.FC<PlayerInspectModalProps> = ({ player, onClose }) => {
  if (!player) return null;

  return (
    <Modal
      isOpen={!!player}
      onClose={onClose}
      title={`Player Details — ${player.character_name}`}
      maxWidth="620px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
          <button type="button" className="btn-enterprise btn-teal" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <div className="data-list">
        <div className="data-row">
          <span className="data-key">Character Name</span>
          <span className="data-val font-semibold">{player.character_name} ({player.raw_name})</span>
        </div>
        <div className="data-row">
          <span className="data-key">Account Username</span>
          <span className="data-val">{player.account_name} (ID #{player.account_id})</span>
        </div>
        <div className="data-row">
          <span className="data-key">Server Element ID</span>
          <span className="data-val font-mono">#{player.id}</span>
        </div>
        <div className="data-row">
          <span className="data-key">Admin Level</span>
          <span className="data-val">
            {player.admin_level > 0 ? (
              <span className="badge-pill badge-info">Level {player.admin_level}</span>
            ) : (
              <span className="badge-pill badge-neutral">Player</span>
            )}
          </span>
        </div>
        <div className="data-row">
          <span className="data-key">Connection Latency (Ping)</span>
          <span className="data-val font-mono">{player.ping} ms</span>
        </div>
        <div className="data-row">
          <span className="data-key">IP Address</span>
          <span className="data-val font-mono">{player.ip}</span>
        </div>
        <div className="data-row">
          <span className="data-key">Vital Health &amp; Armor</span>
          <span className="data-val font-mono">{player.health}% HP | {player.armor}% Armor</span>
        </div>
        <div className="data-row">
          <span className="data-key">Wallet Cash</span>
          <span className="data-val font-mono" style={{ color: '#10b981', fontWeight: 600 }}>
            ${(player.cash || 0).toLocaleString()}
          </span>
        </div>
        <div className="data-row">
          <span className="data-key">Bank Balance</span>
          <span className="data-val font-mono" style={{ color: 'var(--panel-teal-pill)', fontWeight: 600 }}>
            ${(player.bank || 0).toLocaleString()}
          </span>
        </div>
        <div className="data-row">
          <span className="data-key">Total Hours Played</span>
          <span className="data-val font-mono">{player.hours_played} hours</span>
        </div>
        <div className="data-row">
          <span className="data-key">Current Map Zone</span>
          <span className="data-val">{player.location}</span>
        </div>
        {player.coordinates && (
          <div className="data-row">
            <span className="data-key">Coordinates (X, Y, Z)</span>
            <span className="data-val font-mono text-xs">
              {player.coordinates.x}, {player.coordinates.y}, {player.coordinates.z}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
