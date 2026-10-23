import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface IToastData {
  id: string;
  type: 'success' | 'danger' | 'info';
  message: string;
}

interface ToastProps {
  toast: IToastData | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="toast-portal">
      <div className={`toast-card toast-${toast.type}`}>
        <div className="toast-icon">
          {toast.type === 'success' && <CheckCircle2 size={18} />}
          {toast.type === 'danger' && <AlertTriangle size={18} />}
          {toast.type === 'info' && <Info size={18} />}
        </div>
        <div className="toast-msg">{toast.message}</div>
        <button className="toast-close" onClick={onClose} aria-label="Close notification">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
