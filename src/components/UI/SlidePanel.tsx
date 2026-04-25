import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './slide-panel.css';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
}

export const SlidePanel: React.FC<SlidePanelProps> = ({
  isOpen, onClose, title, children, width = 480,
}) => {
  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="slide-panel-backdrop" onClick={onClose}>
      <div
        className="slide-panel"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button className="slide-panel-close" onClick={onClose} aria-label="Close panel">
          <X size={18} />
        </button>

        {/* Optional header */}
        {title && (
          <div className="slide-panel-header">
            <h2 className="slide-panel-title">{title}</h2>
          </div>
        )}

        {/* Scrollable content */}
        <div className="slide-panel-body">
          {children}
        </div>
      </div>
    </div>
  );
};
