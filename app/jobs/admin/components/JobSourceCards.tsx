'use client';

import { Button } from '@/components/ui/button';
import { dummyJobSources } from '../../data/dummyAdminData';
import { formatDistanceToNow } from 'date-fns';

interface JobSourceCardsProps {
  clientID: number;
}

export function JobSourceCards({ clientID }: JobSourceCardsProps) {
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Running
          </span>
        );
      case 'Idle':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Active
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded-full text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
            Not Configured
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h2 className="text-sm font-bold text-gray-900 mb-3">Job Sources</h2>

      <div className="grid grid-cols-3 gap-3">
        {dummyJobSources.map((source) => (
          <div
            key={source.sourceName}
            className="bg-gradient-to-r from-gray-50/60 via-gray-50/40 to-gray-50/60 border border-gray-200 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-900">{source.sourceName}</h3>
              {getStatusBadge(source.status)}
            </div>

            {source.isConfigured ? (
              <div className="space-y-1.5 mb-3">
                <div className="text-[10px] text-gray-700">
                  <span className="font-semibold">Last run:</span>{' '}
                  {formatTimeAgo(source.lastRunTime)}
                </div>
                <div className="text-[10px] text-gray-700">
                  <span className="font-semibold">Jobs today:</span> {source.jobsFetchedToday}
                </div>
                <div className="text-[10px] text-gray-700">
                  <span className="font-semibold">Success rate:</span> {source.successRate}%
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-gray-500 mb-3 italic">
                Not configured for this client
              </div>
            )}

            <div className="flex gap-1.5">
              {source.isConfigured ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-6 text-[10px] border-gray-300"
                  >
                    View Runs
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-6 text-[10px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    Run Now
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="w-full h-6 text-[10px] bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white"
                >
                  Setup
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
