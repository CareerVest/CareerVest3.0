'use client';

import { Button } from '@/components/ui/button';
import { dummyAdminBatches } from '../../data/dummyAdminData';
import { formatDistanceToNow } from 'date-fns';

interface ActiveBatchesTableProps {
  clientID: number;
}

export function ActiveBatchesTable({ clientID }: ActiveBatchesTableProps) {
  // Filter batches for this client
  const clientBatches = dummyAdminBatches.filter((batch) => batch.clientID === clientID);

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded text-[10px] font-semibold">
            Active
          </span>
        );
      case 'Paused':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[10px] font-semibold">
            Paused
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded text-[10px] font-semibold">
            Completed
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded text-[10px] font-semibold">
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  if (clientBatches.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Active Batches</h2>
        <p className="text-xs text-gray-500 text-center py-4">No batches found for this client</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h2 className="text-sm font-bold text-gray-900 mb-3">Active Batches</h2>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-[10px] font-semibold text-gray-600 py-2">Batch #</th>
              <th className="text-left text-[10px] font-semibold text-gray-600 py-2">Progress</th>
              <th className="text-left text-[10px] font-semibold text-gray-600 py-2">Status</th>
              <th className="text-left text-[10px] font-semibold text-gray-600 py-2">Recruiter</th>
              <th className="text-left text-[10px] font-semibold text-gray-600 py-2">Started</th>
              <th className="text-left text-[10px] font-semibold text-gray-600 py-2">Expires</th>
              <th className="text-left text-[10px] font-semibold text-gray-600 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clientBatches.map((batch) => (
              <tr key={batch.batchID} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 text-xs font-semibold text-gray-900">
                  #{batch.batchGUID}
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-700">
                      {batch.processedJobs}/{batch.totalJobs}
                    </span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#682A53] to-[#7d3463]"
                        style={{ width: `${batch.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-2">{getStatusBadge(batch.batchStatus)}</td>
                <td className="py-2 text-xs text-gray-700">{batch.recruiterName}</td>
                <td className="py-2 text-xs text-gray-700">{formatTimeAgo(batch.createdTS)}</td>
                <td className="py-2 text-xs text-gray-700">{formatTimeAgo(batch.expiresTS)}</td>
                <td className="py-2">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-5 text-[10px] border-gray-300"
                    >
                      View
                    </Button>
                    {batch.batchStatus === 'Active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-5 text-[10px] border-amber-300 text-amber-600 hover:bg-amber-50"
                      >
                        Pause
                      </Button>
                    )}
                    {batch.batchStatus === 'Paused' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-5 text-[10px] border-green-300 text-green-600 hover:bg-green-50"
                      >
                        Resume
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
