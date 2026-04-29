import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'warning' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleCancel = onCancel ?? onClose;
  const cancelLabelText = cancelText ?? cancelLabel ?? 'Cancel';
  const confirmLabelText = confirmText ?? confirmLabel ?? 'Confirm';
  const isDangerous = variant === 'danger';
  const buttonClass = variant === 'danger' ? 'btn-danger' : variant === 'warning' ? 'btn-warning' : 'btn-primary';
  const iconColor = variant === 'danger' ? 'var(--danger)' : variant === 'warning' ? 'var(--warning)' : 'var(--accent-green)';

  return (
    <>
      <div className="confirm-modal-overlay" onClick={handleCancel} />
      <div className="confirm-modal">
        <div className="confirm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isDangerous ? (
              <AlertTriangle size={20} style={{ color: iconColor }} />
            ) : (
              <CheckCircle size={20} style={{ color: iconColor }} />
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
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelLabelText}
          </button>
          <button
            className={`btn ${buttonClass}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : confirmLabelText}
          </button>
        </div>
      </div>
    </>
  );
};
