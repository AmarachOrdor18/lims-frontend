import React from 'react';
import { X } from 'lucide-react';
import './slide-panel.css';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children: React.ReactNode;
}

export const SlidePanel: React.FC<SlidePanelProps> = ({ isOpen, onClose, title, width, children }) => {
  if (!isOpen) return null;

  return (
    <div className="slide-panel-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="slide-panel" role="dialog" aria-modal="true" style={width ? { width } : undefined}>
        <div className="slide-panel-header">
          {title && <h2 className="slide-panel-title">{title}</h2>}
          <button className="slide-panel-close" onClick={onClose} aria-label="Close panel">
            <X size={16} />
          </button>
        </div>
        <div className="slide-panel-body">{children}</div>
      </div>
    </div>
  );
};
