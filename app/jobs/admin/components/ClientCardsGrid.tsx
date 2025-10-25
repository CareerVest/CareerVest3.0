'use client';

import { useState } from 'react';
import { ClientCardData } from '../../types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { Search, X } from 'lucide-react';

interface ClientCardsGridProps {
  clients: ClientCardData[];
  onViewClient: (clientID: number) => void;
  onConfigureClient: (clientID: number) => void;
  onAddClient: () => void;
  onToggleActive: (clientID: number, currentStatus: boolean) => Promise<void>;
}

export function ClientCardsGrid({
  clients,
  onViewClient,
  onConfigureClient,
  onAddClient,
  onToggleActive,
}: ClientCardsGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingClients, setTogglingClients] = useState<Set<number>>(new Set());

  const handleToggle = async (clientID: number, currentStatus: boolean) => {
    setTogglingClients(prev => new Set(prev).add(clientID));
    try {
      await onToggleActive(clientID, currentStatus);
    } finally {
      setTogglingClients(prev => {
        const next = new Set(prev);
        next.delete(clientID);
        return next;
      });
    }
  };

  // Filter and sort clients: Configured first, then by name
  const filteredClients = clients
    .filter((client) =>
      client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by configuration status first (configured clients on top)
      if (a.isConfigured !== b.isConfigured) {
        return a.isConfigured ? -1 : 1;
      }
      // Then sort alphabetically by name
      return a.clientName.localeCompare(b.clientName);
    });
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
      {/* Header with Search */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">Clients Overview</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-8 pr-8 text-xs border-gray-300 focus:ring-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Client Grid with Fixed Height */}
      <div className="overflow-y-auto max-h-[600px] pr-2">
        <div className="grid grid-cols-6 gap-2">
          {filteredClients.map((client) => (
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

            {/* Toggle Active Status - Only show for configured clients */}
            {client.isConfigured && (
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[9px] text-gray-600 font-semibold">Active:</span>
                <button
                  onClick={() => handleToggle(client.clientID, client.isActive)}
                  disabled={togglingClients.has(client.clientID)}
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                    client.isActive ? 'bg-green-500' : 'bg-gray-300'
                  } ${togglingClients.has(client.clientID) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`Toggle ${client.clientName} configuration`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      client.isActive ? 'translate-x-3.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            )}

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
          <div
            onClick={onAddClient}
            className="bg-gradient-to-r from-gray-50 via-gray-50/50 to-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-1 text-gray-400">+</div>
            <p className="text-[9px] font-semibold text-gray-600">Add Client</p>
          </div>
        </div>

        {/* No Results Message */}
        {filteredClients.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No clients found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
