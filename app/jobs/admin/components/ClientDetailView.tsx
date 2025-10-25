'use client';

import { useState } from 'react';
import { ClientConfiguration } from '../../types/admin';
import { JobSourceFetchSetting } from '../../types/fetchSources';
import { ConfigSummaryCard } from './ConfigSummaryCard';
import { JobSourceCards } from './JobSourceCards';
import { RecentFetchesTable } from './RecentFetchesTable';
import { ActiveBatchesTable } from './ActiveBatchesTable';
import { ApplicationChart } from './ApplicationChart';
import { SourceConfigModal } from './SourceConfigModal';
import { deleteFetchSourceSetting } from '../../actions/jobsActions';
import { toast } from 'sonner';

interface ClientDetailViewProps {
  clientID: number;
  clientConfig?: ClientConfiguration | null;
  onOpenConfig: () => void;
  onRefresh?: () => void;
  loadingConfig?: boolean;
}

export function ClientDetailView({
  clientID,
  clientConfig,
  onOpenConfig,
  onRefresh,
  loadingConfig = false,
}: ClientDetailViewProps) {
  const [editingSource, setEditingSource] = useState<JobSourceFetchSetting | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSource = (fetchSource: JobSourceFetchSetting) => {
    setEditingSource(fetchSource);
    setIsEditModalOpen(true);
  };

  const handleDeleteSource = async (fetchSettingID: number) => {
    try {
      await deleteFetchSourceSetting(fetchSettingID);
      toast.success('Fetch source deleted successfully');
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete fetch source');
    }
  };

  const handleSaveSource = () => {
    setIsEditModalOpen(false);
    setEditingSource(undefined);
    if (onRefresh) {
      onRefresh();
    }
  };
  return (
    <div className="space-y-4">
      {/* Configuration Summary */}
      {loadingConfig ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Configuration</h2>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      ) : clientConfig ? (
        <ConfigSummaryCard config={clientConfig} onEditConfig={onOpenConfig} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">No configuration found for this client</p>
            <button
              onClick={onOpenConfig}
              className="px-4 py-2 bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white text-sm font-medium rounded-lg transition-all"
            >
              Create Configuration
            </button>
          </div>
        </div>
      )}

      {/* Job Sources */}
      {clientConfig && (
        <JobSourceCards
          clientID={clientID}
          configurationID={clientConfig.configID}
          fetchSources={clientConfig.fetchSources}
          onEdit={handleEditSource}
          onDelete={handleDeleteSource}
        />
      )}

      {/* Recent Fetches */}
      <RecentFetchesTable clientID={clientID} />

      {/* Active Batches */}
      <ActiveBatchesTable clientID={clientID} />

      {/* Application Analytics */}
      <ApplicationChart clientID={clientID} />

      {/* Edit Source Modal */}
      {clientConfig && (
        <SourceConfigModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSource(undefined);
          }}
          configurationID={clientConfig.configID}
          fetchSource={editingSource}
          onSave={handleSaveSource}
        />
      )}
    </div>
  );
}
