import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { IPlayer } from '../../../interfaces';
import { Modal } from '../../../components';

interface PlayerKickModalProps {
  player: IPlayer | null;
  onClose: () => void;
  onConfirm: (id: number, reason: string) => Promise<void>;
}

export const PlayerKickModal: React.FC<PlayerKickModalProps> = ({
  player,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('Violation of server rules');
  const [submitting, setSubmitting] = useState(false);

  if (!player) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await onConfirm(player.id, reason);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!player}
      onClose={onClose}
      title="Kick / Disconnect Player"
      maxWidth="500px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', width: '100%' }}>
          <button
            type="button"
            className="btn-enterprise btn-ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-enterprise btn-crimson"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Kicking...' : 'Confirm Kick'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          You are about to kick <strong>{player.character_name}</strong> (Account: <code>{player.account_name}</code>, ID: #{player.id}) from the active MTA game session.
        </p>

        <div className="form-field">
          <label className="form-label">
            Administrative Kick Reason
          </label>
          <input
            type="text"
            className="form-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Non-RP behavior, AFK, rule violation..."
            required
            autoFocus
          />
        </div>
      </form>
    </Modal>
  );
};
