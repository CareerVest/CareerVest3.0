'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from './components/AdminHeader';
import { StatsCards } from './components/StatsCards';
import { ClientCardsGrid } from './components/ClientCardsGrid';
import { ConfigurationSidebar } from './components/ConfigurationSidebar';
import { ClientSelectorModal } from './components/ClientSelectorModal';
import {
  getAdminStats,
  getAdminClientCards,
  toggleClientConfiguration,
} from '../actions/jobsActions';
import { AdminStats, ClientCardData } from '../types/admin';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function JobsAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [clientCards, setClientCards] = useState<ClientCardData[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedConfigClientID, setSelectedConfigClientID] = useState<number | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);

        // Fetch admin stats and client cards in parallel
        const [stats, clients] = await Promise.all([
          getAdminStats(),
          getAdminClientCards(),
        ]);

        setAdminStats(stats);
        setClientCards(clients);
      } catch (error: any) {
        console.error('Error loading admin data:', error);
        toast.error('Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const handleOpenConfig = (clientID: number) => {
    setSelectedConfigClientID(clientID);
    setIsConfigOpen(true);
  };

  const handleAddClient = () => {
    setIsSelectorOpen(true);
  };

  const handleSelectClient = (clientID: number) => {
    setSelectedConfigClientID(clientID);
    setIsConfigOpen(true);
  };

  const handleSaveConfig = async () => {
    // Reload client cards to refresh configured status
    try {
      const clients = await getAdminClientCards();
      setClientCards(clients);
    } catch (error) {
      console.error('Error reloading clients:', error);
    }
    setIsConfigOpen(false);
  };

  const handleToggleActive = async (clientID: number, currentStatus: boolean) => {
    try {
      const result = await toggleClientConfiguration(clientID);

      // Update the local state optimistically
      setClientCards(prevClients =>
        prevClients.map(client =>
          client.clientID === clientID
            ? { ...client, isActive: result.isActive }
            : client
        )
      );

      toast.success(result.message);
    } catch (error: any) {
      console.error('Error toggling configuration:', error);
      toast.error('Failed to toggle configuration status');
    }
  };

  // Filter to show only configured clients
  const configuredClients = clientCards.filter(c => c.isConfigured);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Add Client Button */}
      <AdminHeader
        onAddClient={handleAddClient}
        configuredCount={configuredClients.length}
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
          selectedClientID={'all'}
        />

        {/* Conditional View: Grid or Empty State */}
        {configuredClients.length === 0 ? (
          // Empty State
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-[#682A53]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Configurations Yet</h3>
              <p className="text-sm text-gray-600 mb-6">
                Get started by adding your first client configuration. Configure job search criteria and sources to begin fetching jobs.
              </p>
              <Button
                onClick={handleAddClient}
                size="lg"
                className="h-10 bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Client
              </Button>
            </div>
          </div>
        ) : (
          <ClientCardsGrid
            clients={configuredClients}
            onViewClient={(clientID) => router.push(`/jobs/admin/client/${clientID}`)}
            onConfigureClient={(clientID) => handleOpenConfig(clientID)}
            onAddClient={handleAddClient}
            onToggleActive={handleToggleActive}
          />
        )}
      </main>

      {/* Client Selector Modal */}
      <ClientSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelectClient={handleSelectClient}
      />

      {/* Configuration Sidebar */}
      <ConfigurationSidebar
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        clientID={selectedConfigClientID}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
