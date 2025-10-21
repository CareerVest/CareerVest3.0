'use client';

import { Button } from '../../../components/ui/button';
import { BatchStats } from '../types/jobs';

interface BatchPerformanceBarProps {
  stats: BatchStats;
  onComplete?: () => void;
  onSaveAndExit?: () => void;
}

export function BatchPerformanceBar({
  stats,
  onComplete,
  onSaveAndExit,
}: BatchPerformanceBarProps) {
  const canComplete = stats.progressPercentage >= 70;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-transparent border-b border-purple-100 px-6 py-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Progress Section */}
        <div className="flex items-center gap-4 flex-1 min-w-[400px]">
          {/* Progress Bar */}
          <div className="flex-1 max-w-sm">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-semibold text-gray-700">
                Progress
              </span>
              <span className="text-[10px] font-bold text-[#682A53]">
                {stats.reviewedJobs}/{stats.totalJobs} ({stats.progressPercentage}%)
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#682A53] to-[#7d3463] transition-all duration-500"
                style={{ width: `${stats.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats Pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full">
              <span className="text-[10px] text-gray-600">Applied:</span>
              <span className="text-xs font-bold text-green-700">
                {stats.appliedJobs}
              </span>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 rounded-full">
              <span className="text-[10px] text-gray-600">Skipped:</span>
              <span className="text-xs font-bold text-red-700">
                {stats.skippedJobs}
              </span>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full">
              <span className="text-[10px] text-gray-600">Viewed:</span>
              <span className="text-xs font-bold text-blue-700">
                {stats.viewedJobs}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="flex items-center gap-3">
          <div className="text-xs">
            <span className="text-gray-600">Avg Time: </span>
            <span className="font-bold text-gray-900">
              {formatTime(stats.avgTimePerJob)}
            </span>
          </div>

          <div className="h-4 w-px bg-gray-300" />

          <div className="text-xs">
            <span className="text-gray-600">Avg Match: </span>
            <span className="font-bold text-gray-900">
              {stats.avgMatchScore}/100
            </span>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onComplete}
            disabled={!canComplete}
            className={`text-xs font-semibold h-7 ${
              canComplete
                ? 'bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53]'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            title={
              !canComplete ? 'Complete at least 70% to finish batch' : undefined
            }
          >
            Complete Batch
          </Button>
        </div>
      </div>
    </div>
  );
}
