'use client';

import { ClientConfiguration } from '../../types/admin';
import { ConfigSummaryCard } from './ConfigSummaryCard';
import { JobSourceCards } from './JobSourceCards';
import { RecentFetchesTable } from './RecentFetchesTable';
import { ActiveBatchesTable } from './ActiveBatchesTable';
import { ApplicationChart } from './ApplicationChart';

interface ClientDetailViewProps {
  clientID: number;
  clientConfig?: ClientConfiguration | null;
  onOpenConfig: () => void;
}

export function ClientDetailView({
  clientID,
  clientConfig,
  onOpenConfig,
}: ClientDetailViewProps) {
  if (!clientConfig) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
        <p className="text-sm text-gray-600">Client configuration not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Configuration Summary */}
      <ConfigSummaryCard config={clientConfig} onEditConfig={onOpenConfig} />

      {/* Job Sources */}
      <JobSourceCards clientID={clientID} />

      {/* Recent Fetches */}
      <RecentFetchesTable clientID={clientID} />

      {/* Active Batches */}
      <ActiveBatchesTable clientID={clientID} />

      {/* Application Analytics */}
      <ApplicationChart clientID={clientID} />
    </div>
  );
}
