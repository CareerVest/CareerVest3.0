'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminHeader } from '../../components/AdminHeader';
import { StatsCards } from '../../components/StatsCards';
import { ClientDetailView } from '../../components/ClientDetailView';
import { ConfigurationSidebar } from '../../components/ConfigurationSidebar';
import {
  getAdminStats,
  getAdminClientCards,
  getClientConfiguration,
} from '../../../actions/jobsActions';
import { ClientConfiguration, AdminStats, ClientCardData } from '../../../types/admin';
import { toast } from 'sonner';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientID = parseInt(params.clientID as string);

  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [clientCards, setClientCards] = useState<ClientCardData[]>([]);
  const [selectedClientConfig, setSelectedClientConfig] = useState<ClientConfiguration | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Load admin data and client configuration
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch admin stats and client cards in parallel
        const [stats, clients] = await Promise.all([
          getAdminStats(),
          getAdminClientCards(),
        ]);

        setAdminStats(stats);
        setClientCards(clients);

        // Load specific client configuration
        if (clientID) {
          await loadClientConfig();
        }
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast.error('Failed to load client data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientID]);

  const loadClientConfig = async () => {
    try {
      setLoadingConfig(true);
      const data = await getClientConfiguration(clientID);

      // Map backend response to frontend type
      // Handle .NET JSON reference tracking format ($values wrapper)
      const fetchSourcesData = data.fetchSources?.$values || data.fetchSources || [];

      setSelectedClientConfig({
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
    } catch (error: any) {
      console.error('Error loading client configuration:', error);
      // Show as not configured if no config found
      if (error.message.includes('No configuration found')) {
        setSelectedClientConfig(null);
      } else {
        toast.error('Failed to load client configuration');
      }
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleOpenConfig = () => {
    setIsConfigOpen(true);
  };

  const handleSaveConfig = async () => {
    // Reload client configuration
    await loadClientConfig();
    setIsConfigOpen(false);
  };

  const handleBackToAdmin = () => {
    router.push('/jobs/admin');
  };

  // Get selected client details
  const selectedClientDetails = clientCards.find(c => c.clientID === clientID);

  // Filter to show only configured clients
  const configuredClients = clientCards.filter(c => c.isConfigured);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  // Client not found
  if (!selectedClientDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Client Not Found</h2>
          <p className="text-gray-600 mb-4">The requested client does not exist.</p>
          <button
            onClick={handleBackToAdmin}
            className="px-4 py-2 bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white text-sm font-medium rounded-lg transition-all"
          >
            Back to Admin Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader
        onAddClient={() => {}}
        configuredCount={configuredClients.length}
        selectedClient={{
          clientID: selectedClientDetails.clientID,
          clientName: selectedClientDetails.clientName
        }}
        onBack={handleBackToAdmin}
      />

      {/* Main Content */}
      <main className="px-6 py-4">
        {/* Stats Cards */}
        <StatsCards
          stats={adminStats || {
            totalJobsToday: 0,
            totalJobsWeek: 0,
            activeBatches: 0,
            totalApplicationsToday: 0,
            totalApplicationsWeek: 0,
            successRate: 0,
            apifyStatus: 'Idle',
          }}
          selectedClientID={clientID}
        />

        {/* Client Detail View */}
        <ClientDetailView
          clientID={clientID}
          clientConfig={selectedClientConfig}
          loadingConfig={loadingConfig}
          onOpenConfig={handleOpenConfig}
          onRefresh={loadClientConfig}
        />
      </main>

      {/* Configuration Sidebar */}
      <ConfigurationSidebar
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        clientID={clientID}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
