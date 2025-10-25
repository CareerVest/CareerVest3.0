'use client';

import { useState } from 'react';
import { JobSourceFetchSetting } from '../../types/fetchSources';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FetchSourceCardProps {
  fetchSource: JobSourceFetchSetting;
  onEdit: (fetchSource: JobSourceFetchSetting) => void;
  onDelete: (fetchSettingID: number) => void;
}

export function FetchSourceCard({ fetchSource, onEdit, onDelete }: FetchSourceCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the ${fetchSource.jobSourceName} fetch source?`)) {
      setIsDeleting(true);
      try {
        await onDelete(fetchSource.fetchSettingID);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (!fetchSource.isEnabled) return 'text-gray-500';
    if (fetchSource.lastFetchTS) return 'text-green-600';
    return 'text-amber-600';
  };

  const getStatusIcon = () => {
    if (!fetchSource.isEnabled) return <XCircle className="h-4 w-4 text-gray-500" />;
    if (fetchSource.lastFetchTS) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <Clock className="h-4 w-4 text-amber-600" />;
  };

  return (
    <div className="bg-gradient-to-r from-purple-50/60 via-pink-50/40 to-purple-50/60 border border-purple-100 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div>
            <h3 className="text-sm font-bold text-gray-900">{fetchSource.jobSourceName}</h3>
            <p className={`text-xs ${getStatusColor()}`}>
              {fetchSource.isEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={() => onEdit(fetchSource)}
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Settings Info */}
      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Fetch Frequency:</span>
          <span className="font-semibold text-gray-900">{fetchSource.fetchFrequency}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Max Jobs/Fetch:</span>
          <span className="font-semibold text-gray-900">{fetchSource.maxJobsPerFetch}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Last Fetch:</span>
          <span className="font-semibold text-gray-900">{formatTimeAgo(fetchSource.lastFetchTS)}</span>
        </div>
        {fetchSource.nextScheduledFetchTS && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Next Fetch:</span>
            <span className="font-semibold text-gray-900">
              {formatTimeAgo(fetchSource.nextScheduledFetchTS)}
            </span>
          </div>
        )}
      </div>

      {/* Actor Parameters Preview */}
      {fetchSource.actorInputParameters && (
        <div className="mt-2 pt-2 border-t border-purple-200">
          <p className="text-xs text-gray-600 mb-1">Actor Parameters:</p>
          <div className="bg-white/80 rounded px-2 py-1 text-xs font-mono text-gray-700 max-h-16 overflow-y-auto">
            {JSON.stringify(JSON.parse(fetchSource.actorInputParameters), null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}
