'use client';

import { JobSourceFetchSetting } from '../../types/fetchSources';
import { FetchSourceCard } from './FetchSourceCard';

interface JobSourceCardsProps {
  clientID: number;
  configurationID: number;
  fetchSources?: JobSourceFetchSetting[];
  onEdit?: (fetchSource: JobSourceFetchSetting) => void;
  onDelete?: (fetchSettingID: number) => Promise<void>;
}

export function JobSourceCards({
  clientID,
  configurationID,
  fetchSources = [],
  onEdit,
  onDelete
}: JobSourceCardsProps) {
  const handleEdit = (fetchSource: JobSourceFetchSetting) => {
    if (onEdit) {
      onEdit(fetchSource);
    }
  };

  const handleDelete = async (fetchSettingID: number) => {
    if (onDelete) {
      await onDelete(fetchSettingID);
    }
  };

  if (fetchSources.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Fetch Source Settings</h2>
        <p className="text-xs text-gray-500 text-center py-4">No fetch sources configured for this client</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h2 className="text-sm font-bold text-gray-900 mb-3">
        Fetch Source Settings ({fetchSources.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fetchSources.map((source) => (
          <FetchSourceCard
            key={source.fetchSettingID}
            fetchSource={source}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
