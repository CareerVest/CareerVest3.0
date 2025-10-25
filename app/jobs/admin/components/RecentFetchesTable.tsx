'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getFetchRuns } from '../../actions/jobsActions';
import { formatDistanceToNow } from 'date-fns';

interface RecentFetchesTableProps {
  clientID: number;
}

export function RecentFetchesTable({ clientID }: RecentFetchesTableProps) {
  const [fetchRuns, setFetchRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFetchRuns = async () => {
      try {
        setLoading(true);
        const data = await getFetchRuns(clientID);
        // Ensure data is an array
        setFetchRuns(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading fetch runs:', error);
        setFetchRuns([]);
      } finally {
        setLoading(false);
      }
    };
    loadFetchRuns();
  }, [clientID]);

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded text-[10px] font-semibold">
            Success
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded text-[10px] font-semibold">
            Failed
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[10px] font-semibold">
            Partial
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Recent Job Fetches</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (fetchRuns.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Recent Job Fetches</h2>
        <p className="text-xs text-gray-500 text-center py-4">No fetch history available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h2 className="text-sm font-bold text-gray-900 mb-3">Recent Job Fetches</h2>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-[10px] font-semibold text-gray-600 py-2">Time</th>
              <th className="text-left text-[10px] font-semibold text-gray-600 py-2">Source</th>
              <th className="text-left text-[10px] font-semibold text-gray-600 py-2">Jobs</th>
              <th className="text-left text-[10px] font-semibold text-gray-600 py-2">Status</th>
              <th className="text-left text-[10px] font-semibold text-gray-600 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fetchRuns.map((run) => (
              <tr key={run.RunID} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 text-xs text-gray-700">{formatTimeAgo(run.Timestamp)}</td>
                <td className="py-2 text-xs text-gray-700">{run.SourceName}</td>
                <td className="py-2 text-xs font-semibold text-gray-900">{run.JobsFetched}</td>
                <td className="py-2">{getStatusBadge(run.Status)}</td>
                <td className="py-2">
                  {run.Status === 'Failed' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-5 text-[10px] border-red-300 text-red-600 hover:bg-red-50"
                    >
                      View Error
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-5 text-[10px] border-gray-300"
                    >
                      View Jobs
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
