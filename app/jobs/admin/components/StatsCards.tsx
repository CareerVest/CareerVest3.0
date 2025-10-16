'use client';

import { AdminStats } from '../../types/admin';
import { dummyClientCards, dummyJobFetchRuns, dummyAdminBatches } from '../../data/dummyAdminData';

interface StatsCardsProps {
  stats: AdminStats;
  selectedClientID: number | 'all';
}

export function StatsCards({ stats, selectedClientID }: StatsCardsProps) {
  // Filter stats based on selected client
  const filteredStats =
    selectedClientID === 'all'
      ? stats
      : (() => {
          const clientCard = dummyClientCards.find(
            (c) => c.clientID === selectedClientID
          );
          const clientRuns = dummyJobFetchRuns.filter(
            (r) => r.clientID === selectedClientID
          );
          const clientBatches = dummyAdminBatches.filter(
            (b) => b.clientID === selectedClientID && b.batchStatus === 'Active'
          );

          const jobsToday = clientRuns
            .filter((r) => {
              const runDate = new Date(r.timestamp);
              const today = new Date();
              return runDate.toDateString() === today.toDateString();
            })
            .reduce((sum, r) => sum + r.jobsFetched, 0);

          return {
            totalJobsToday: jobsToday,
            totalJobsWeek: clientRuns.reduce((sum, r) => sum + r.jobsFetched, 0),
            activeBatches: clientBatches.length,
            totalApplicationsToday: clientCard?.applicationsToday || 0,
            totalApplicationsWeek: clientCard?.applicationsToday || 0,
            successRate: stats.successRate,
            apifyStatus: stats.apifyStatus,
          };
        })();

  const cards = [
    {
      title: 'Jobs Today',
      value: filteredStats.totalJobsToday,
      subtitle: `${filteredStats.totalJobsWeek} this week`,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50/60 via-blue-50/40 to-blue-50/60',
    },
    {
      title: 'Active Batches',
      value: filteredStats.activeBatches,
      subtitle: 'Currently processing',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50/60 via-purple-50/40 to-purple-50/60',
    },
    {
      title: 'Applications Today',
      value: filteredStats.totalApplicationsToday,
      subtitle: `${filteredStats.totalApplicationsWeek} this week`,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50/60 via-green-50/40 to-green-50/60',
    },
    {
      title: 'Success Rate',
      value: `${filteredStats.successRate}%`,
      subtitle: 'Application rate',
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50/60 via-amber-50/40 to-amber-50/60',
    },
    {
      title: 'Apify Status',
      value: filteredStats.apifyStatus,
      subtitle: 'Job fetching service',
      gradient:
        filteredStats.apifyStatus === 'Active'
          ? 'from-emerald-500 to-emerald-600'
          : 'from-red-500 to-red-600',
      bgGradient:
        filteredStats.apifyStatus === 'Active'
          ? 'from-emerald-50/60 via-emerald-50/40 to-emerald-50/60'
          : 'from-red-50/60 via-red-50/40 to-red-50/60',
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 mb-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${card.bgGradient} backdrop-blur-md border border-purple-100 rounded-xl shadow-sm p-3`}
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
              {card.title}
            </span>
            <div
              className={`text-2xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent mt-1`}
            >
              {card.value}
            </div>
            <span className="text-[9px] text-gray-500 mt-0.5">{card.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
