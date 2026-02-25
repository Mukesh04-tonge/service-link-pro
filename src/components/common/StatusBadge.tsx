import React from 'react';
import { cn } from '@/lib/utils';
import { ServiceStatus, InsuranceStatus, Priority } from '@/types';

type StatusType = ServiceStatus | InsuranceStatus | Priority;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // Service statuses
  planned: { label: 'Planned', className: 'status-badge status-planned' },
  called: { label: 'Called', className: 'status-badge bg-info/20 text-info' },
  booked: { label: 'Booked', className: 'status-badge status-completed' },
  serviced: { label: 'Serviced', className: 'status-badge status-completed' },
  not_interested: { label: 'Not Interested', className: 'status-badge bg-muted text-muted-foreground' },
  wrong_number: { label: 'Wrong Number', className: 'status-badge bg-muted text-muted-foreground' },
  overdue: { label: 'Overdue', className: 'status-badge status-overdue' },
  
  // Insurance statuses
  renewed: { label: 'Renewed', className: 'status-badge status-completed' },
  shifted: { label: 'Shifted', className: 'status-badge bg-muted text-muted-foreground' },
  
  // Priorities
  high: { label: 'High', className: 'status-badge priority-high' },
  medium: { label: 'Medium', className: 'status-badge priority-medium' },
  low: { label: 'Low', className: 'status-badge priority-low' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  if (!config) {
    return <span className={cn('status-badge bg-muted text-muted-foreground', className)}>{status}</span>;
  }
  
  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
};
