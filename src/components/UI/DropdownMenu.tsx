import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface DropdownOption {
  label: string;
  icon: LucideIcon;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'default' | 'danger';
}

interface DropdownMenuProps {
  options: DropdownOption[];
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ options }) => {
  // Render inline small icon buttons for each option (no three-dot overflow)
  return (
    <div className="dropdown-container" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {options.map((option, idx) => {
        const onClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          option.onClick(e);
        };
        return (
          <button
            key={idx}
            className={`btn-icon-sm ${option.variant === 'danger' ? 'danger' : ''}`}
            onClick={onClick}
            title={option.label}
            aria-label={option.label}
          >
            <option.icon size={14} />
          </button>
        );
      })}
    </div>
  );
};
