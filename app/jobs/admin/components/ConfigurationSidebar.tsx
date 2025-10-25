'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { ClientConfiguration } from '../../types/admin';
import { JobSourceFetchSetting } from '../../types/fetchSources';
import { getClientConfiguration, updateClientConfiguration, createClientConfiguration, getAdminClientCards, deleteFetchSourceSetting, getAvailableJobSources, createFetchSourceSetting } from '../../actions/jobsActions';
import { toast } from 'sonner';
import { FetchSourceCard } from './FetchSourceCard';
import { SourceConfigModal } from './SourceConfigModal';
import { ChipInput } from './ChipInput';
import { ApifyCareerSitesConfig } from './ApifyCareerSitesConfig';
import { LinkedInJobsConfig } from './LinkedInJobsConfig';
import { ApifyCareerSitesParams, LinkedInJobsParams } from '../../types/fetchSources';

interface ConfigurationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  clientID: number | null;
  onSave: (config: ClientConfiguration) => void;
}

export function ConfigurationSidebar({
  isOpen,
  onClose,
  clientID,
  onSave,
}: ConfigurationSidebarProps) {
  const [config, setConfig] = useState<ClientConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'criteria' | 'sources'>('criteria');
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<JobSourceFetchSetting | undefined>(undefined);
  const [availableSources, setAvailableSources] = useState<any[]>([]);
  const [selectedSourceID, setSelectedSourceID] = useState<number | null>(null);
  const [loadingSources, setLoadingSources] = useState(false);
  const [actorParams, setActorParams] = useState<ApifyCareerSitesParams | LinkedInJobsParams | null>(null);

  useEffect(() => {
    const loadConfiguration = async () => {
      if (clientID && isOpen) {
        try {
          setLoading(true);
          const data = await getClientConfiguration(clientID);

          // Map backend response to frontend type
          // Handle .NET JSON reference tracking format ($values wrapper)
          const fetchSourcesData = data.fetchSources?.$values || data.fetchSources || [];
          console.log('🔍 Unwrapped fetchSources:', fetchSourcesData);

          setConfig({
            configID: data.configurationID,
            clientID: data.clientID,
            clientName: data.clientName || '',
            clientRole: 'Job Seeker',
            keywords: data.jobTitles ? data.jobTitles.split(',').map((k: string) => k.trim()) : [],
            descriptionKeywords: data.keywords ? data.keywords.split(',').map((k: string) => k.trim()) : [],
            locations: data.preferredLocations ? data.preferredLocations.split(',').map((l: string) => l.trim()) : [],
            salaryMin: data.salaryMin || 0,
            salaryMax: data.salaryMax || 0,
            jobTypes: ['Full-time'],
            experienceLevel: data.jobLevelPreference || 'Mid',
            remotePreference: data.remotePreference ? 'Remote' : 'Any',
            enabledSources: ['Apify'],
            fetchSources: fetchSourcesData,
            fetchFrequency: 'Daily',
            jobsPerFetch: 200,
            autoCreateBatches: true,
            batchSize: 50,
            assignedRecruiterID: undefined,
            assignedRecruiterName: undefined,
            matchScoreThreshold: Math.floor(data.minMatchScore || 50),
            batchExpiryHours: 72,
            isConfigured: true,
            lastFetchTime: data.updatedTS,
            createdTS: data.createdTS,
            updatedTS: data.updatedTS,
          });

          // If config exists, start at sources step
          setStep('sources');
        } catch (error: any) {
          console.error('Error loading configuration:', error);
          if (error.message.includes('No configuration found')) {
            const clients = await getAdminClientCards();
            const client = clients.find((c) => c.clientID === clientID);

            setConfig({
              configID: 0,
              clientID: clientID,
              clientName: client?.clientName || '',
              clientRole: 'Job Seeker',
              keywords: [],
              descriptionKeywords: [],
              locations: [],
              salaryMin: 0,
              salaryMax: 0,
              jobTypes: ['Full-time'],
              experienceLevel: 'Mid',
              remotePreference: 'Any',
              enabledSources: ['Apify'],
              fetchSources: [],
              fetchFrequency: 'Daily',
              jobsPerFetch: 200,
              autoCreateBatches: true,
              batchSize: 50,
              assignedRecruiterID: undefined,
              assignedRecruiterName: undefined,
              matchScoreThreshold: 50,
              batchExpiryHours: 72,
              isConfigured: false,
              lastFetchTime: undefined,
              createdTS: new Date().toISOString(),
              updatedTS: new Date().toISOString(),
            });

            setStep('criteria');
          } else {
            toast.error('Failed to load configuration');
          }
        } finally {
          setLoading(false);
        }
      }
    };

    loadConfiguration();
  }, [clientID, isOpen]);

  // Load available job sources when moving to sources step
  useEffect(() => {
    const loadSources = async () => {
      if (step === 'sources' && availableSources.length === 0) {
        try {
          setLoadingSources(true);
          const sources = await getAvailableJobSources();
          setAvailableSources(sources.filter((s: any) => s.isActive));
        } catch (error: any) {
          toast.error('Failed to load job sources');
          console.error(error);
        } finally {
          setLoadingSources(false);
        }
      }
    };
    loadSources();
  }, [step]);

  const reloadConfiguration = async () => {
    if (!clientID) return;
    try {
      const data = await getClientConfiguration(clientID);
      // Handle .NET JSON reference tracking format ($values wrapper)
      const fetchSourcesData = data.fetchSources?.$values || data.fetchSources || [];
      setConfig((prev) => ({
        ...prev!,
        fetchSources: fetchSourcesData,
        configID: data.configurationID,
      }));
    } catch (error) {
      console.error('Error reloading configuration:', error);
    }
  };

  const handleAddFetchSource = () => {
    setEditingSource(undefined);
    setSourceModalOpen(true);
  };

  const handleEditFetchSource = (source: JobSourceFetchSetting) => {
    setEditingSource(source);
    setSourceModalOpen(true);
  };

  const handleDeleteFetchSource = async (fetchSettingID: number) => {
    try {
      await deleteFetchSourceSetting(fetchSettingID);
      toast.success('Fetch source deleted successfully');
      await reloadConfiguration();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete fetch source');
    }
  };

  const handleFetchSourceSaved = async () => {
    await reloadConfiguration();
  };

  const getSelectedSourceType = (): string | undefined => {
    if (!selectedSourceID) return undefined;
    const source = availableSources.find(s => s.jobSourceID === selectedSourceID);
    if (!source) return undefined;

    const name = source.sourceName.toLowerCase();
    if (name.includes('career')) return 'apify-career-sites';
    if (name.includes('linkedin')) return 'apify-linkedin';
    return 'custom';
  };

  const handleSaveBasicCriteria = async () => {
    if (!config) return;

    try {
      setSaving(true);

      const requestData = {
        clientID: config.clientID,
        configurationName: `${config.clientName} Configuration`,
        jobTitles: config.keywords.join(', '), // Job titles from Step 1
        preferredLocations: config.locations.join(', '),
        keywords: config.descriptionKeywords.join(', '), // Description keywords from Step 1
        excludeKeywords: null,
        salaryMin: config.salaryMin || null,
        salaryMax: config.salaryMax || null,
        remotePreference: config.remotePreference === 'Remote',
        jobLevelPreference: config.experienceLevel,
        excludedCompanies: null,
        preferredCompanies: null,
        minMatchScore: config.matchScoreThreshold,
        exclusionRules: null,
        autoApplyEnabled: false,
        industryPreferences: null,
        enableLinkedInSource: false,
        jobSourceQueryTemplate: null,
        primaryJobSourceID: null,
        isActive: true,
        isPrimary: true,
      };

      let savedConfig: any;
      if (config.configID && config.configID > 0) {
        savedConfig = await updateClientConfiguration(config.configID, requestData);
        toast.success('Search criteria updated successfully');
      } else {
        savedConfig = await createClientConfiguration(requestData);
        toast.success('Search criteria saved! Now add job sources.');

        setConfig((prev) => ({
          ...prev!,
          configID: savedConfig.configurationID,
        }));
      }

      setStep('sources');

      // Reload configuration to get any existing fetch sources
      await reloadConfiguration();
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveJobSource = async () => {
    if (!config || !config.configID || !selectedSourceID) {
      toast.error('Please select a job source');
      return;
    }

    // Check if source is already configured
    const fetchSources = config.fetchSources || [];
    if (Array.isArray(fetchSources) && fetchSources.some(fs => fs.jobSourceID === selectedSourceID)) {
      toast.error('This job source is already configured for this client');
      return;
    }

    try {
      setSaving(true);

      // Merge actor-specific params with config data from Step 1
      let finalActorParams: any = actorParams;

      const sourceType = getSelectedSourceType();

      if (sourceType === 'apify-career-sites' && actorParams) {
        // For Career Sites, populate titleSearch, descriptionSearch and locationSearch from Step 1 config
        finalActorParams = {
          ...actorParams,
          titleSearch: config.keywords, // Job titles from Step 1
          descriptionSearch: config.descriptionKeywords, // Description keywords from Step 1
          locationSearch: config.locations, // Locations from Step 1
          limit: actorParams.maxItems || 200,
          includeAi: true,
          includeLinkedIn: false,
          descriptionType: 'html',
          aiHasSalary: false,
          aiVisaSponsorshipFilter: false
        };
        // Remove maxItems since we're using limit
        delete finalActorParams.maxItems;
      }

      if (sourceType === 'apify-linkedin' && actorParams) {
        // For LinkedIn, populate keywords and location from Step 1 config
        finalActorParams = {
          ...actorParams,
          keywords: config.keywords.join(', '),
          location: config.locations.join(', ')
        };
      }

      const settingData = {
        configurationID: config.configID,
        jobSourceID: selectedSourceID,
        isEnabled: true,
        maxJobsPerFetch: finalActorParams && 'maxItems' in finalActorParams ? finalActorParams.maxItems : 200,
        fetchFrequency: 'Daily',
        actorInputParameters: finalActorParams ? JSON.stringify(finalActorParams) : undefined
      };

      await createFetchSourceSetting(config.configID, settingData);
      toast.success('Job source added successfully!');

      // Reload configuration to show the new source
      await reloadConfiguration();

      // Reset form
      setSelectedSourceID(null);
      setActorParams(null);

      // Close sidebar
      onSave(config);
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save job source';

      // Better error message for duplicate source
      if (errorMessage.includes('already exists')) {
        toast.error('This job source is already configured. Please select a different source.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    if (config) {
      onSave(config);
    }
    toast.success('Configuration saved successfully!');
    onClose();
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm" />
        <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 flex items-center justify-center animate-slide-in-right">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#682A53] mx-auto mb-2"></div>
            <p className="text-xs text-gray-600">Loading configuration...</p>
          </div>
        </div>
      </>
    );
  }

  if (!config) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm" />

      <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#682A53] to-[#7d3463] px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Client Configuration</h2>
            <p className="text-xs text-purple-200">{config.clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-purple-50 border-b border-purple-200 px-5 py-3">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${step === 'criteria' ? 'text-[#682A53]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'criteria' ? 'bg-[#682A53] text-white' : 'bg-gray-300 text-white'}`}>
                1
              </div>
              <span className="text-xs font-semibold">Search Criteria</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center gap-2 ${step === 'sources' ? 'text-[#682A53]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'sources' ? 'bg-[#682A53] text-white' : 'bg-gray-300 text-white'}`}>
                2
              </div>
              <span className="text-xs font-semibold">Job Sources</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'criteria' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800">
                  <strong>Step 1:</strong> Define what jobs you're looking for. These criteria apply to all job sources.
                </p>
              </div>

              {/* Job Titles */}
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Job Titles <span className="text-red-500">*</span>
                </Label>
                <ChipInput
                  values={config.keywords}
                  onChange={(values) => setConfig({ ...config, keywords: values })}
                  placeholder="Type a job title and press Tab or Enter"
                />
                <p className="text-xs text-gray-500 mt-1">
                  E.g., Software Engineer, Product Manager, Data Scientist
                </p>
              </div>

              {/* Locations */}
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Locations
                </Label>
                <ChipInput
                  values={config.locations}
                  onChange={(values) => setConfig({ ...config, locations: values })}
                  placeholder="Type a location and press Tab or Enter"
                />
                <p className="text-xs text-gray-500 mt-1">
                  E.g., San Francisco, New York, Remote, United States
                </p>
              </div>

              {/* Description Keywords */}
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Description Keywords <span className="text-red-500">*</span>
                </Label>
                <ChipInput
                  values={config.descriptionKeywords}
                  onChange={(values) => setConfig({ ...config, descriptionKeywords: values })}
                  placeholder="Type a keyword and press Tab or Enter"
                />
                <p className="text-xs text-gray-500 mt-1">
                  E.g., React, Python, AWS, Machine Learning - keywords that must appear in the job description
                </p>
              </div>

              {/* Experience Level */}
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-1 block">Experience Level</Label>
                <Select
                  value={config.experienceLevel}
                  onValueChange={(value) => setConfig({ ...config, experienceLevel: value })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry" className="text-sm">Entry (0-2 years)</SelectItem>
                    <SelectItem value="Mid" className="text-sm">Mid (3-5 years)</SelectItem>
                    <SelectItem value="Senior" className="text-sm">Senior (5+ years)</SelectItem>
                    <SelectItem value="Mid-Senior" className="text-sm">Mid-Senior (3-8 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Match Score */}
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-1 block">
                  Minimum Match Score (0-100)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={config.matchScoreThreshold}
                  onChange={(e) =>
                    setConfig({ ...config, matchScoreThreshold: parseInt(e.target.value) || 50 })
                  }
                  className="text-sm h-9"
                />
                <p className="text-xs text-gray-500 mt-1">Jobs below this score will be filtered out</p>
              </div>
            </div>
          )}

          {step === 'sources' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-green-800">
                  <strong>Step 2:</strong> Select a job source and configure it.
                </p>
              </div>

              {/* Show Already Configured Sources */}
              {config.fetchSources && config.fetchSources.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-700">
                    Configured Sources ({config.fetchSources.length}):
                  </p>
                  {config.fetchSources.map((source) => (
                    <FetchSourceCard
                      key={source.fetchSettingID}
                      fetchSource={source}
                      onEdit={handleEditFetchSource}
                      onDelete={handleDeleteFetchSource}
                    />
                  ))}
                </div>
              )}

              {/* Job Source Selection */}
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Add Job Source {config.fetchSources && config.fetchSources.length > 0 ? '' : <span className="text-red-500">*</span>}
                </Label>
                {loadingSources ? (
                  <div className="text-sm text-gray-500 py-2">Loading sources...</div>
                ) : (
                  <Select
                    value={selectedSourceID?.toString() || ''}
                    onValueChange={(value) => setSelectedSourceID(parseInt(value))}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Choose a job source..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSources
                        .filter(source => {
                          const fetchSources = config.fetchSources || [];
                          return !Array.isArray(fetchSources) || !fetchSources.some(fs => fs.jobSourceID === source.jobSourceID);
                        })
                        .map((source) => (
                          <SelectItem key={source.jobSourceID} value={source.jobSourceID.toString()} className="text-sm">
                            {source.sourceName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {config.fetchSources && config.fetchSources.length > 0
                    ? 'Add another job source (optional)'
                    : 'Select which platform to fetch jobs from'}
                </p>
              </div>

              {/* Source-specific configuration forms */}
              {selectedSourceID && getSelectedSourceType() === 'apify-career-sites' && (
                <ApifyCareerSitesConfig
                  initialParams={undefined}
                  onChange={(params) => setActorParams(params)}
                />
              )}

              {selectedSourceID && getSelectedSourceType() === 'apify-linkedin' && (
                <LinkedInJobsConfig
                  initialParams={undefined}
                  onChange={(params) => setActorParams(params)}
                />
              )}

              {selectedSourceID && getSelectedSourceType() === 'custom' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    No additional configuration needed for this source.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {step === 'criteria' ? (
            <div className="space-y-2">
              <Button
                onClick={handleSaveBasicCriteria}
                disabled={saving || !config.keywords.length || !config.descriptionKeywords.length}
                className="w-full h-10 bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white"
              >
                {saving ? 'Saving...' : (
                  <>
                    Save & Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              <Button onClick={onClose} variant="outline" disabled={saving} className="w-full h-10">
                Cancel
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={handleSaveJobSource}
                disabled={saving || !selectedSourceID}
                className="w-full h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-600 text-white"
              >
                {saving ? 'Saving...' : 'Save Job Source'}
              </Button>
              <Button onClick={() => setStep('criteria')} variant="outline" disabled={saving} className="w-full h-10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Criteria
              </Button>
            </div>
          )}
        </div>
      </div>

      {config && config.configID && (
        <SourceConfigModal
          isOpen={sourceModalOpen}
          onClose={() => {
            setSourceModalOpen(false);
            setEditingSource(undefined);
          }}
          configurationID={config.configID}
          fetchSource={editingSource}
          onSave={handleFetchSourceSaved}
        />
      )}
    </>
  );
}
