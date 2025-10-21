'use client';

import { ClientConfiguration } from '../../types/admin';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ConfigSummaryCardProps {
  config: ClientConfiguration;
  onEditConfig: () => void;
}

export function ConfigSummaryCard({ config, onEditConfig }: ConfigSummaryCardProps) {
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">
          Configuration: {config.clientName} - {config.clientRole}
        </h2>
        <Button
          onClick={onEditConfig}
          size="sm"
          className="h-6 text-[10px] bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white"
        >
          Edit Config
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-2">
          <div className="bg-purple-50/50 rounded-lg p-2">
            <span className="text-[10px] font-semibold text-gray-600">Keywords:</span>
            <p className="text-xs text-gray-900 mt-0.5">{config.keywords.join(', ')}</p>
          </div>

          <div className="bg-purple-50/50 rounded-lg p-2">
            <span className="text-[10px] font-semibold text-gray-600">Locations:</span>
            <p className="text-xs text-gray-900 mt-0.5">{config.locations.join(', ')}</p>
          </div>

          <div className="bg-purple-50/50 rounded-lg p-2 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-semibold text-gray-600">Salary:</span>
              <p className="text-xs text-gray-900 mt-0.5">
                ${(config.salaryMin || 0) / 1000}K - ${(config.salaryMax || 0) / 1000}K
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-gray-600">Remote:</span>
              <p className="text-xs text-gray-900 mt-0.5">{config.remotePreference}</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <div className="bg-purple-50/50 rounded-lg p-2">
            <span className="text-[10px] font-semibold text-gray-600">Fetch Frequency:</span>
            <p className="text-xs text-gray-900 mt-0.5">
              {config.fetchFrequency} (Last: {formatTimeAgo(config.lastFetchTime)})
            </p>
          </div>

          <div className="bg-purple-50/50 rounded-lg p-2 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-semibold text-gray-600">Batch Size:</span>
              <p className="text-xs text-gray-900 mt-0.5">{config.batchSize} jobs</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-gray-600">Recruiter:</span>
              <p className="text-xs text-gray-900 mt-0.5">
                {config.assignedRecruiterName || 'Not assigned'}
              </p>
            </div>
          </div>

          <div className="bg-purple-50/50 rounded-lg p-2 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-semibold text-gray-600">Match Threshold:</span>
              <p className="text-xs text-gray-900 mt-0.5">{config.matchScoreThreshold}/100</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-gray-600">Expiry:</span>
              <p className="text-xs text-gray-900 mt-0.5">{config.batchExpiryHours}h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
