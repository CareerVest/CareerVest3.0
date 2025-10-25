'use client';

import { useState, useEffect } from 'react';
import { getApplicationAnalytics } from '../../actions/jobsActions';

interface ApplicationChartProps {
  clientID: number;
}

interface DayAnalytics {
  date: string;
  applied: number;
  skipped: number;
  viewed: number;
}

export function ApplicationChart({ clientID }: ApplicationChartProps) {
  const [analytics, setAnalytics] = useState<DayAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getApplicationAnalytics(clientID, 30);
        // Ensure data is an array and map from backend PascalCase to camelCase
        if (Array.isArray(data)) {
          const mappedData = data.map((item: any) => ({
            date: item.Date || item.date,
            applied: item.Applied || item.applied || 0,
            skipped: item.Skipped || item.skipped || 0,
            viewed: item.Viewed || item.viewed || 0,
          }));
          setAnalytics(mappedData);
        } else {
          setAnalytics([]);
        }
      } catch (error) {
        console.error('Error loading application analytics:', error);
        setAnalytics([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [clientID]);

  // Calculate totals - safely handle empty or non-array data
  const totals = Array.isArray(analytics) && analytics.length > 0
    ? analytics.reduce(
        (acc, day) => ({
          applied: acc.applied + (day.applied || 0),
          skipped: acc.skipped + (day.skipped || 0),
          viewed: acc.viewed + (day.viewed || 0),
        }),
        { applied: 0, skipped: 0, viewed: 0 }
      )
    : { applied: 0, skipped: 0, viewed: 0 };

  const total = totals.applied + totals.skipped + totals.viewed;
  const appliedPercentage = total > 0 ? Math.round((totals.applied / total) * 100) : 0;
  const skippedPercentage = total > 0 ? Math.round((totals.skipped / total) * 100) : 0;
  const viewedPercentage = total > 0 ? Math.round((totals.viewed / total) * 100) : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Application Analytics (Last 30 Days)</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#682A53]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h2 className="text-sm font-bold text-gray-900 mb-3">Application Analytics (Last 30 Days)</h2>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">
            Applied
          </div>
          <div className="text-2xl font-bold text-green-700 mt-1">{totals.applied}</div>
          <div className="text-[9px] text-green-600 mt-0.5">{appliedPercentage}% of total</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">
            Skipped
          </div>
          <div className="text-2xl font-bold text-red-700 mt-1">{totals.skipped}</div>
          <div className="text-[9px] text-red-600 mt-0.5">{skippedPercentage}% of total</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
            Viewed
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{totals.viewed}</div>
          <div className="text-[9px] text-blue-600 mt-0.5">{viewedPercentage}% of total</div>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="bg-gray-50 rounded-lg p-3">
        {analytics.length > 0 ? (
          <>
            <div className="flex items-end justify-between gap-1 h-32">
              {analytics.map((day) => {
                const maxValue = Math.max(...analytics.map((d) => d.applied + d.skipped + d.viewed));
                const dayTotal = day.applied + day.skipped + day.viewed;
                const heightPercentage = maxValue > 0 ? (dayTotal / maxValue) * 100 : 0;

                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5">
                    {/* Bar */}
                    <div
                      className="w-full bg-gradient-to-t from-[#682A53] to-[#7d3463] rounded-t"
                      style={{ height: `${heightPercentage}%`, minHeight: dayTotal > 0 ? '4px' : '0' }}
                      title={`${day.date}: ${dayTotal} actions`}
                    />
                    {/* Date Label */}
                    <span className="text-[8px] text-gray-500 rotate-0">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-center text-[9px] text-gray-500 mt-2">
              Days of the month
            </div>
          </>
        ) : (
          <div className="text-center text-xs text-gray-500 py-8">
            No analytics data available
          </div>
        )}
      </div>
    </div>
  );
}
