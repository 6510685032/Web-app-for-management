import React from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle, PlayCircle, FileText, ShieldCheck, ShieldX } from 'lucide-react';

export type Status = 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled' | 'submitted' | 'reviewed' | 'assigned' | 'pending_approval' | 'approved' | 'rejected';

interface StatusBadgeProps {
  status: Status;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = (status: Status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: Clock,
        };
      case 'submitted':
        return {
          label: 'Submitted',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: FileText,
        };
      case 'reviewed':
        return {
          label: 'Reviewed',
          color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          icon: FileText,
        };
      case 'assigned':
        return {
          label: 'Assigned',
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: FileText,
        };
      case 'in-progress':
        return {
          label: 'In Progress',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: PlayCircle,
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
        };
      case 'overdue':
        return {
          label: 'Overdue',
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: AlertCircle,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: XCircle,
        };
      case 'pending_approval':
        return {
          label: 'รออนุมัติ',
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: Clock,
        };
      case 'approved':
        return {
          label: 'อนุมัติแล้ว',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: ShieldCheck,
        };
      case 'rejected':
        return {
          label: 'ไม่อนุมัติ',
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: ShieldX,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </span>
  );
}
