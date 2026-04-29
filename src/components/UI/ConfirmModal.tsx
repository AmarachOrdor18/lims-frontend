import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="confirm-modal-overlay" onClick={onCancel} />
      <div className="confirm-modal">
        <div className="confirm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isDangerous ? (
              <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
            ) : (
              <CheckCircle size={20} style={{ color: 'var(--accent-green)' }} />
            )}
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              {title}
            </h2>
          </div>
        </div>

        <div className="confirm-modal-body">
          {typeof message === 'string' ? (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
              {message}
            </p>
          ) : (
            message
          )}
        </div>

        <div className="confirm-modal-footer">
          <button
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </>
  );
};
