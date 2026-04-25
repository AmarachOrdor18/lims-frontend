import React from 'react';
import type { LaptopStatus, LaptopCondition, EmployeeStatus } from '../../types';

type BadgeVariant = LaptopStatus | LaptopCondition | EmployeeStatus | 'OPEN' | 'IN_REPAIR' | 'RESOLVED' | 'INELIGIBLE' | 'NOT_ASSIGNED';

const variantMap: Record<string, string> = {
  AVAILABLE:  'badge-available',
  ASSIGNED:   'badge-assigned',
  FAULTY:      'badge-faulty',
  FUNCTIONAL:  'badge-available',
  RETIRED:    'badge-retired',
  ACTIVE:     'badge-active',
  INACTIVE:   'badge-inactive',
  INELIGIBLE: 'badge-retired',
  NOT_ASSIGNED:'badge-faulty',
  OPEN:       'badge-open',
  IN_REPAIR:  'badge-faulty',
  RESOLVED:   'badge-resolved',
};

const labelMap: Record<string, string> = {
  AVAILABLE:  'Available',
  ASSIGNED:   'Assigned',
  FAULTY:     'Faulty',
  FUNCTIONAL: 'Functional',
  RETIRED:    'Retired',
  ACTIVE:     'Active',
  INACTIVE:   'Inactive',
  INELIGIBLE: 'Ineligible',
  NOT_ASSIGNED:'Not Assigned',
  OPEN:       'Open',
  IN_REPAIR:  'In Repair',
  RESOLVED:   'Resolved',
};

interface BadgeProps {
  status: BadgeVariant;
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, showDot = true, className = '' }) => {
  const cls = variantMap[status] ?? 'badge-inactive';
  const label = labelMap[status] ?? status;

  return (
    <span className={`badge ${cls} ${className}`}>
      {showDot && <span className="badge-dot" />}
      {label}
    </span>
  );
};
