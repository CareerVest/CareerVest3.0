'use client';

import { useState } from 'react';
import { createManualBatch } from '../../actions/jobsActions';

interface ManualBatchCreationProps {
  clients: Array<{ clientID: number; clientName: string }>;
  onBatchCreated?: () => void;
}

export function ManualBatchCreation({ clients, onBatchCreated }: ManualBatchCreationProps) {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [batchSize, setBatchSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleCreateBatch = async () => {
    if (!selectedClient) {
      setMessage({ type: 'error', text: 'Please select a client' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await createManualBatch({
        clientID: selectedClient,
        batchSize: batchSize,
      });

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Batch created successfully! Batch ID: ${result.batchID}`,
        });
        if (onBatchCreated) {
          onBatchCreated();
        }
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to create batch' });
      }
    } catch (error: any) {
      console.error('Error creating batch:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create batch',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
      <h3 className="text-lg font-bold text-[#682A53] mb-4">
        ⚡ Manual Batch Creation
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Create a job batch on-demand for any client
      </p>

      <div className="space-y-4">
        {/* Client Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Client
          </label>
          <select
            value={selectedClient || ''}
            onChange={(e) => setSelectedClient(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">-- Select a client --</option>
            {clients.map((client) => (
              <option key={client.clientID} value={client.clientID}>
                {client.clientName}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Batch Size
          </label>
          <input
            type="number"
            min="10"
            max="100"
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Recommended: 50 jobs per batch</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreateBatch}
          disabled={loading || !selectedClient}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
            loading || !selectedClient
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#682A53] to-purple-600 hover:from-purple-600 hover:to-[#682A53]'
          }`}
        >
          {loading ? 'Creating...' : 'Create Batch'}
        </button>
      </div>
    </div>
  );
}
