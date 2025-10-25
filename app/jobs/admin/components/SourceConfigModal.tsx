'use client';

import { useState, useEffect } from 'react';
import { JobSourceFetchSetting, ApifyCareerSitesParams, LinkedInJobsParams } from '../../types/fetchSources';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { ApifyCareerSitesConfig } from './ApifyCareerSitesConfig';
import { LinkedInJobsConfig } from './LinkedInJobsConfig';
import { getAvailableJobSources, createFetchSourceSetting, updateFetchSourceSetting } from '../../actions/jobsActions';
import { toast } from 'sonner';

interface SourceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  configurationID: number;
  fetchSource?: JobSourceFetchSetting; // If editing
  onSave: () => void;
}

export function SourceConfigModal({
  isOpen,
  onClose,
  configurationID,
  fetchSource,
  onSave
}: SourceConfigModalProps) {
  const [jobSources, setJobSources] = useState<any[]>([]);
  const [selectedJobSourceID, setSelectedJobSourceID] = useState<number | undefined>(fetchSource?.jobSourceID);
  const [isEnabled, setIsEnabled] = useState(fetchSource?.isEnabled ?? true);
  const [maxJobsPerFetch, setMaxJobsPerFetch] = useState(fetchSource?.maxJobsPerFetch || 200);
  const [fetchFrequency, setFetchFrequency] = useState(fetchSource?.fetchFrequency || 'Daily');
  const [actorParams, setActorParams] = useState<ApifyCareerSitesParams | LinkedInJobsParams | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingSources, setLoadingSources] = useState(true);

  // Reset state when modal opens with new fetchSource
  useEffect(() => {
    if (isOpen) {
      setSelectedJobSourceID(fetchSource?.jobSourceID);
      setIsEnabled(fetchSource?.isEnabled ?? true);
      setMaxJobsPerFetch(fetchSource?.maxJobsPerFetch || 200);
      setFetchFrequency(fetchSource?.fetchFrequency || 'Daily');
      setActorParams(null); // Will be set by config component
      loadAvailableSources();
    }
  }, [isOpen, fetchSource]);

  const loadAvailableSources = async () => {
    try {
      setLoadingSources(true);
      const sources = await getAvailableJobSources();
      const activeSources = sources.filter((s: any) => s.isActive);
      setJobSources(activeSources);
    } catch (error: any) {
      toast.error('Failed to load job sources');
      console.error(error);
    } finally {
      setLoadingSources(false);
    }
  };

  const getSelectedSourceType = (): string | undefined => {
    if (!selectedJobSourceID) return undefined;
    const source = jobSources.find(s => s.jobSourceID === selectedJobSourceID);
    if (!source) return undefined;

    // Map source name to actor type
    const name = source.sourceName.toLowerCase();
    if (name.includes('apify') && name.includes('career')) return 'apify-career-sites';
    if (name.includes('linkedin')) return 'apify-linkedin';
    return 'custom';
  };

  const handleSave = async () => {
    if (!selectedJobSourceID) {
      toast.error('Please select a job source');
      return;
    }

    try {
      setSaving(true);

      const settingData = {
        configurationID,
        jobSourceID: selectedJobSourceID,
        isEnabled,
        maxJobsPerFetch,
        fetchFrequency,
        actorInputParameters: actorParams ? JSON.stringify(actorParams) : undefined
      };

      if (fetchSource) {
        // Update existing
        await updateFetchSourceSetting(fetchSource.fetchSettingID, settingData);
        toast.success('Fetch source updated successfully');
      } else {
        // Create new
        await createFetchSourceSetting(configurationID, settingData);
        toast.success('Fetch source created successfully');
      }

      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save fetch source');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const sourceType = getSelectedSourceType();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {fetchSource ? 'Edit' : 'Add'} Fetch Source
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Job Source Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Source <span className="text-red-500">*</span>
            </label>
            {loadingSources ? (
              <div className="text-sm text-gray-500">Loading sources...</div>
            ) : (
              <select
                value={selectedJobSourceID || ''}
                onChange={(e) => setSelectedJobSourceID(parseInt(e.target.value))}
                disabled={!!fetchSource} // Can't change source when editing
                className="h-9 text-sm border border-gray-300 rounded-md px-3 w-full"
              >
                <option value="">Select a job source</option>
                {jobSources.map((source) => (
                  <option key={source.jobSourceID} value={source.jobSourceID}>
                    {source.sourceName}
                  </option>
                ))}
              </select>
            )}
            {fetchSource && (
              <p className="text-xs text-gray-500 mt-1">
                Job source cannot be changed when editing
              </p>
            )}
          </div>

          {/* Basic Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                value={isEnabled ? 'enabled' : 'disabled'}
                onChange={(e) => setIsEnabled(e.target.value === 'enabled')}
                className="h-9 text-sm border border-gray-300 rounded-md px-3 w-full"
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Fetch Frequency
              </label>
              <select
                value={fetchFrequency}
                onChange={(e) => setFetchFrequency(e.target.value)}
                className="h-9 text-sm border border-gray-300 rounded-md px-3 w-full"
              >
                <option value="Hourly">Hourly</option>
                <option value="Daily">Daily</option>
                <option value="Twice Daily">Twice Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Actor-Specific Configuration */}
          {sourceType === 'apify-career-sites' && (
            <ApifyCareerSitesConfig
              initialParams={fetchSource?.actorInputParameters}
              onChange={(params) => {
                setActorParams(params);
                setMaxJobsPerFetch(params.maxItems || 200);
              }}
            />
          )}

          {sourceType === 'apify-linkedin' && (
            <LinkedInJobsConfig
              initialParams={fetchSource?.actorInputParameters}
              onChange={(params) => {
                setActorParams(params);
                setMaxJobsPerFetch(params.maxItems || 100);
              }}
            />
          )}

          {!sourceType && selectedJobSourceID && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                No additional configuration needed for this source.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={saving}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !selectedJobSourceID}
            className="h-9 bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
