'use client';

interface FreshnessBadgeProps {
  status?: 'Live' | 'Current' | 'Week_Old' | 'Stale' | 'Expired' | 'Unknown';
}

export function FreshnessBadge({ status = 'Unknown' }: FreshnessBadgeProps) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Live':
        return {
          label: 'Live',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-300',
          icon: '🟢',
        };
      case 'Current':
        return {
          label: 'Current',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-300',
          icon: '🔵',
        };
      case 'Week_Old':
        return {
          label: 'Week Old',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-300',
          icon: '🟡',
        };
      case 'Stale':
        return {
          label: 'Stale',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-300',
          icon: '🟠',
        };
      case 'Expired':
        return {
          label: 'Expired',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-300',
          icon: '🔴',
        };
      default:
        return {
          label: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300',
          icon: '⚪',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
      title={`Job posted status: ${config.label}`}
    >
      <span className="text-[10px]">{config.icon}</span>
      {config.label}
    </span>
  );
}
