'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import { getAdminClientCards } from '../../actions/jobsActions';
import { ClientCardData } from '../../types/admin';
import { toast } from 'sonner';

interface ClientSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient: (clientID: number) => void;
}

export function ClientSelectorModal({
  isOpen,
  onClose,
  onSelectClient,
}: ClientSelectorModalProps) {
  const [clients, setClients] = useState<ClientCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClientID, setSelectedClientID] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadClients = async () => {
      if (isOpen) {
        try {
          setLoading(true);
          const data = await getAdminClientCards();
          // Filter to show only clients that are NOT configured
          const unconfiguredClients = data.filter(c => !c.isConfigured);
          setClients(unconfiguredClients);
        } catch (error) {
          console.error('Error loading clients:', error);
          toast.error('Failed to load clients');
        } finally {
          setLoading(false);
        }
      }
    };

    loadClients();
  }, [isOpen]);

  const handleSelect = () => {
    if (selectedClientID) {
      onSelectClient(selectedClientID);
      onClose();
      setSelectedClientID(null);
      setSearchQuery('');
    }
  };

  // Filter clients based on search query
  const filteredClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Add Client Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#682A53] mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading clients...</p>
              </div>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8 px-5">
              <p className="text-sm text-gray-600 mb-2">All active clients are already configured!</p>
              <p className="text-xs text-gray-500">Great job! 🎉</p>
            </div>
          ) : (
            <>
              {/* Search Bar - Sticky */}
              <div className="p-5 pb-3 border-b border-gray-100 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {filteredClients.length} of {clients.length} clients
                </p>
              </div>

              {/* Scrollable Client List */}
              <div className="flex-1 overflow-y-auto p-5 pt-3">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600">No clients found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredClients.map((client) => (
                      <button
                        key={client.clientID}
                        onClick={() => setSelectedClientID(client.clientID)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedClientID === client.clientID
                            ? 'border-[#682A53] bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {client.clientName}
                            </p>
                            <p className="text-xs text-gray-500">{client.clientRole}</p>
                          </div>
                          {selectedClientID === client.clientID && (
                            <div className="w-5 h-5 rounded-full bg-[#682A53] flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && clients.length > 0 && (
          <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-200">
            <Button
              onClick={onClose}
              variant="outline"
              className="h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSelect}
              disabled={!selectedClientID}
              className="h-9 bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white"
            >
              Continue to Setup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
