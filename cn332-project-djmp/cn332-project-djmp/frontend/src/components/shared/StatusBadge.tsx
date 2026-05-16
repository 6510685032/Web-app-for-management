import React from 'react';

export type Status =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'overdue'
  | 'cancelled'
  | 'submitted'
  | 'reviewed'
  | 'assigned'
  | 'pending_approval'
  | 'approved'
  | 'rejected';

interface StatusBadgeProps {
  status: Status;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/** Maps status values to JuristicPro design pill classes + dot color + labels */
const statusConfig: Record<Status, { pillClass: string; dotColor: string; label: string }> = {
  pending:         { pillClass: 'pending',   dotColor: 'var(--st-pending)',   label: 'Pending'      },
  pending_approval:{ pillClass: 'pending',   dotColor: 'var(--st-pending)',   label: 'รออนุมัติ'    },
  submitted:       { pillClass: 'progress',  dotColor: 'var(--st-progress)',  label: 'Submitted'    },
  reviewed:        { pillClass: 'progress',  dotColor: 'var(--st-progress)',  label: 'Reviewed'     },
  assigned:        { pillClass: 'progress',  dotColor: 'var(--st-progress)',  label: 'Assigned'     },
  'in-progress':   { pillClass: 'progress',  dotColor: 'var(--st-progress)',  label: 'In Progress'  },
  completed:       { pillClass: 'done',      dotColor: 'var(--st-done)',      label: 'Completed'    },
  approved:        { pillClass: 'done',      dotColor: 'var(--st-done)',      label: 'อนุมัติแล้ว'  },
  overdue:         { pillClass: 'overdue',   dotColor: 'var(--st-overdue)',   label: 'Overdue'      },
  rejected:        { pillClass: 'overdue',   dotColor: 'var(--st-overdue)',   label: 'ไม่อนุมัติ'   },
  cancelled:       { pillClass: 'cancelled', dotColor: 'var(--st-cancelled)', label: 'Cancelled'    },
};

export default function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    pillClass: 'cancelled',
    dotColor: 'var(--st-cancelled)',
    label: status,
  };

  const styles: Record<'sm' | 'md' | 'lg', { dotSize: string; fontSize: string; padding: string }> = {
    sm: { dotSize: '5px',  fontSize: '10px', padding: '2px 6px 2px 5px'  },
    md: { dotSize: '6px',  fontSize: '11px', padding: '3px 8px 3px 7px'  },
    lg: { dotSize: '8px',  fontSize: '12px', padding: '4px 10px 4px 9px' },
  };

  const { dotSize, fontSize, padding } = styles[size];

  return (
    <span className={`pill ${config.pillClass}`} style={{ fontSize, padding }}>
      {showIcon && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: config.dotColor,
            flexShrink: 0,
          }}
        />
      )}
      {config.label}
    </span>
  );
}
