'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '../components/AdminHeader';
import {
  getSystemSkipAnalytics,
  getLearningLoopAlerts,
  getClientSkipAnalytics,
  getAdminClientCards
} from '../../actions/jobsActions';
import { ClientCardData } from '../../types/admin';

interface SkipAnalytics {
  clientID: number;
  clientName: string;
  totalSkips: number;
  totalProcessed: number;
  overallSkipRate: number;
  skipReasonCounts: Record<string, number>;
  skipReasonPercentages: Record<string, number>;
}

interface SystemSkipAnalytics {
  totalSkips: number;
  totalProcessed: number;
  overallSkipRate: number;
  skipReasonCounts: Record<string, number>;
  skipReasonPercentages: Record<string, number>;
  clientBreakdown: SkipAnalytics[];
}

interface LearningLoopAlert {
  clientID: number;
  clientName: string;
  skipReason: string;
  skipCount: number;
  totalProcessed: number;
  skipPercentage: number;
  alertLevel: 'Warning' | 'Critical';
  recommendation: string;
  detectedTS: string;
}

export default function SkipAnalyticsPage() {
  const [systemAnalytics, setSystemAnalytics] = useState<SystemSkipAnalytics | null>(null);
  const [alerts, setAlerts] = useState<LearningLoopAlert[]>([]);
  const [selectedClientFilter, setSelectedClientFilter] = useState<number | 'all'>('all');
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [clientAnalytics, setClientAnalytics] = useState<SkipAnalytics | null>(null);
  const [clientCards, setClientCards] = useState<ClientCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientAnalytics(selectedClient);
    }
  }, [selectedClient]);

  const loadAnalytics = async () => {
    try {
      const [systemData, alertsData, clients] = await Promise.all([
        getSystemSkipAnalytics(),
        getLearningLoopAlerts(),
        getAdminClientCards(),
      ]);

      setSystemAnalytics(systemData);
      setAlerts(alertsData);
      setClientCards(clients);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClientAnalytics = async (clientId: number) => {
    try {
      const data = await getClientSkipAnalytics(clientId);
      setClientAnalytics(data);
    } catch (error) {
      console.error('Error loading client analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-8">
        <AdminHeader selectedClientID={selectedClientFilter} onClientChange={setSelectedClientFilter} clients={clientCards} />
        <div className="flex items-center justify-center py-20">
          <div className="text-xl text-gray-600">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-8">
      <AdminHeader selectedClientID={selectedClientFilter} onClientChange={setSelectedClientFilter} clients={clientCards} />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
          <h1 className="text-3xl font-bold text-[#682A53] mb-2">
            Skip Analytics & Learning Loop
          </h1>
          <p className="text-gray-600">
            Analyze skip patterns and identify configuration optimization opportunities
          </p>
        </div>

        {/* System-Wide Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="text-sm text-gray-600 mb-2">Total Actions</div>
            <div className="text-3xl font-bold text-[#682A53]">
              {systemAnalytics?.totalProcessed.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="text-sm text-gray-600 mb-2">Total Skips</div>
            <div className="text-3xl font-bold text-orange-600">
              {systemAnalytics?.totalSkips.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
            <div className="text-sm text-gray-600 mb-2">Overall Skip Rate</div>
            <div className="text-3xl font-bold text-red-600">
              {systemAnalytics?.overallSkipRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Learning Loop Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
            <h2 className="text-2xl font-bold text-[#682A53] mb-4">
              🚨 Learning Loop Alerts ({alerts.length})
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Clients with high skip rates (&gt;50%) for specific reasons require configuration review
            </p>

            <div className="space-y-4">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`border-l-4 p-4 rounded-r-lg ${
                    alert.alertLevel === 'Critical'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {alert.clientName}
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                            alert.alertLevel === 'Critical'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}
                        >
                          {alert.alertLevel}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-700 mt-1">
                        Skip Reason: <strong>{alert.skipReason.replace(/_/g, ' ')}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        {alert.skipPercentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {alert.skipCount} / {alert.totalProcessed} jobs
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <strong>💡 Recommendation:</strong> {alert.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skip Reason Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
          <h2 className="text-2xl font-bold text-[#682A53] mb-4">
            System-Wide Skip Reason Breakdown
          </h2>

          <div className="space-y-4">
            {Object.entries(systemAnalytics?.skipReasonPercentages || {})
              .sort(([, a], [, b]) => b - a)
              .map(([reason, percentage]) => {
                const count = systemAnalytics?.skipReasonCounts[reason] || 0;
                return (
                  <div key={reason}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {reason.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        {percentage.toFixed(1)}% ({count.toLocaleString()})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#682A53] to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Per-Client Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
          <h2 className="text-2xl font-bold text-[#682A53] mb-4">Per-Client Skip Rates</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">
                    Client
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">
                    Total Processed
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">
                    Total Skips
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">
                    Skip Rate
                  </th>
                  <th className="text-center p-3 text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {systemAnalytics?.clientBreakdown
                  .sort((a, b) => b.overallSkipRate - a.overallSkipRate)
                  .map((client) => (
                    <tr
                      key={client.clientID}
                      className="border-b border-gray-100 hover:bg-purple-50 transition-colors"
                    >
                      <td className="p-3 text-sm font-medium text-gray-900">
                        {client.clientName}
                      </td>
                      <td className="p-3 text-sm text-right text-gray-700">
                        {client.totalProcessed.toLocaleString()}
                      </td>
                      <td className="p-3 text-sm text-right text-gray-700">
                        {client.totalSkips.toLocaleString()}
                      </td>
                      <td className="p-3 text-sm text-right">
                        <span
                          className={`font-bold ${
                            client.overallSkipRate > 70
                              ? 'text-red-600'
                              : client.overallSkipRate > 50
                              ? 'text-orange-600'
                              : 'text-gray-700'
                          }`}
                        >
                          {client.overallSkipRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedClient(client.clientID)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-[#682A53] to-purple-600 hover:from-purple-600 hover:to-[#682A53] rounded-lg transition-all"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Detail Modal */}
        {selectedClient && clientAnalytics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-[#682A53] text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{clientAnalytics.clientName}</h3>
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      setClientAnalytics(null);
                    }}
                    className="text-white hover:text-gray-200 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-purple-100 mt-2">Skip Analytics Breakdown</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Processed</div>
                    <div className="text-2xl font-bold text-[#682A53]">
                      {clientAnalytics.totalProcessed}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Skips</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {clientAnalytics.totalSkips}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Skip Rate</div>
                    <div className="text-2xl font-bold text-red-600">
                      {clientAnalytics.overallSkipRate.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Reason Breakdown */}
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-4">
                    Skip Reason Breakdown
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(clientAnalytics.skipReasonPercentages)
                      .sort(([, a], [, b]) => b - a)
                      .map(([reason, percentage]) => {
                        const count = clientAnalytics.skipReasonCounts[reason] || 0;
                        return (
                          <div key={reason}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                {reason.replace(/_/g, ' ')}
                              </span>
                              <span className="text-sm text-gray-600">
                                {percentage.toFixed(1)}% ({count})
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-red-600 h-2.5 rounded-full"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
