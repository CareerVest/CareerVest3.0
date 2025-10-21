'use client';

import { ClientCardData } from '../../types/admin';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ClientCardsGridProps {
  clients: ClientCardData[];
  onViewClient: (clientID: number) => void;
  onConfigureClient: (clientID: number) => void;
}

export function ClientCardsGrid({
  clients,
  onViewClient,
  onConfigureClient,
}: ClientCardsGridProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Configured':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-[10px] font-semibold">
            Configured
          </span>
        );
      case 'Needs Setup':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] font-semibold">
            Needs Setup
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[10px] font-semibold">
            In Progress
          </span>
        );
      default:
        return null;
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h2 className="text-sm font-bold text-gray-900 mb-3">Clients Overview</h2>

      <div className="grid grid-cols-6 gap-2">
        {clients.map((client) => (
          <div
            key={client.clientID}
            className="bg-gradient-to-r from-purple-50/60 via-pink-50/40 to-purple-50/60 border border-purple-100 rounded-lg p-2 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="mb-1.5">
              <h3 className="text-xs font-bold text-gray-900 truncate">{client.clientName}</h3>
              <p className="text-[9px] text-gray-600 truncate">{client.clientRole}</p>
            </div>

            {/* Status Badge */}
            <div className="mb-1.5">{getStatusBadge(client.configurationStatus)}</div>

            {/* Compact Info */}
            <div className="space-y-0.5 mb-2">
              {client.activeBatchID && (
                <div className="text-[9px] text-gray-700 truncate">
                  <span className="font-semibold">Batch:</span> #{client.activeBatchGUID}
                </div>
              )}
              <div className="text-[9px] text-gray-700 truncate">
                <span className="font-semibold">Fetch:</span> {formatTimeAgo(client.lastFetchTime)}
              </div>
              {client.isConfigured && (
                <div className="text-[9px] text-gray-700">
                  <span className="font-semibold">Today:</span> {client.applicationsToday}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1">
              <Button
                onClick={() => onViewClient(client.clientID)}
                size="sm"
                variant="outline"
                className="flex-1 h-5 text-[9px] border-gray-300"
              >
                View
              </Button>
              <Button
                onClick={() => onConfigureClient(client.clientID)}
                size="sm"
                className="flex-1 h-5 text-[9px] bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white"
              >
                {client.isConfigured ? 'Edit' : 'Setup'}
              </Button>
            </div>
          </div>
        ))}

        {/* Add Client Card */}
        <div className="bg-gradient-to-r from-gray-50 via-gray-50/50 to-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
          <div className="text-2xl mb-1 text-gray-400">+</div>
          <p className="text-[9px] font-semibold text-gray-600">Add Client</p>
        </div>
      </div>
    </div>
  );
}
