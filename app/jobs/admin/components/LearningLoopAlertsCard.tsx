'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLearningLoopAlerts } from '../../actions/jobsActions';

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

export function LearningLoopAlertsCard() {
  const [alerts, setAlerts] = useState<LearningLoopAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await getLearningLoopAlerts();
      setAlerts(data.slice(0, 5)); // Show top 5 alerts
    } catch (error) {
      console.error('Error loading learning loop alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600">Loading alerts...</div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
        <h3 className="text-lg font-bold text-[#682A53] mb-4">
          🤖 Learning Loop Alerts
        </h3>
        <div className="text-center py-8 text-gray-600">
          <div className="text-4xl mb-2">✅</div>
          <p>No configuration alerts at this time</p>
          <p className="text-sm mt-1">All clients have healthy skip patterns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#682A53]">
          🚨 Learning Loop Alerts ({alerts.length})
        </h3>
        <Link
          href="/jobs/admin/analytics"
          className="text-sm text-purple-600 hover:text-purple-800 font-semibold"
        >
          View All →
        </Link>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Clients with high skip rates requiring configuration review
      </p>

      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className={`border-l-4 p-4 rounded-r-lg ${
              alert.alertLevel === 'Critical'
                ? 'bg-red-50 border-red-500'
                : 'bg-yellow-50 border-yellow-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-900">
                  {alert.clientName}
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded ${
                      alert.alertLevel === 'Critical'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}
                  >
                    {alert.alertLevel}
                  </span>
                </h4>
                <p className="text-xs text-gray-700 mt-1">
                  {alert.skipReason.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-red-600">
                  {alert.skipPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">
                  {alert.skipCount}/{alert.totalProcessed}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
