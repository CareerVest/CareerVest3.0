'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from './components/AdminHeader';
import { StatsCards } from './components/StatsCards';
import { ClientCardsGrid } from './components/ClientCardsGrid';
import { ClientDetailView } from './components/ClientDetailView';
import { ConfigurationSidebar } from './components/ConfigurationSidebar';
import {
  getAdminStats,
  getAdminClientCards,
} from '../actions/jobsActions';
import { ClientConfiguration, AdminStats, ClientCardData } from '../types/admin';
import { toast } from 'sonner';

export default function JobsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [clientCards, setClientCards] = useState<ClientCardData[]>([]);
  const [selectedClientID, setSelectedClientID] = useState<number | 'all'>('all');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedConfigClientID, setSelectedConfigClientID] = useState<number | null>(null);

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

  // Find selected client config - TODO: fetch from API when available
  const selectedClientConfig = selectedClientID !== 'all'
    ? null // Will be fetched from API later
    : null;

  const handleOpenConfig = (clientID?: number) => {
    if (clientID) {
      setSelectedConfigClientID(clientID);
    } else if (selectedClientID !== 'all') {
      setSelectedConfigClientID(selectedClientID);
    } else {
      setSelectedConfigClientID(clientCards[0]?.clientID || null);
    }
    setIsConfigOpen(true);
  };

  const handleSaveConfig = (config: ClientConfiguration) => {
    console.log('Saving configuration:', config);
    // In real implementation, save to backend
    setIsConfigOpen(false);
  };

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
      {/* Header with Client Filter */}
      <AdminHeader
        selectedClientID={selectedClientID}
        onClientChange={setSelectedClientID}
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
          selectedClientID={selectedClientID}
        />

        {/* Conditional View: All Clients or Selected Client */}
        {selectedClientID === 'all' ? (
          <ClientCardsGrid
            clients={clientCards}
            onViewClient={(clientID) => setSelectedClientID(clientID)}
            onConfigureClient={(clientID) => handleOpenConfig(clientID)}
          />
        ) : (
          <ClientDetailView
            clientID={selectedClientID}
            clientConfig={selectedClientConfig}
            onOpenConfig={() => handleOpenConfig()}
          />
        )}
      </main>

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
