'use client';

import { Job } from '../types/jobs';
import { MatchScoreBadge } from './MatchScoreBadge';
import { FreshnessBadge } from './FreshnessBadge';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  onSkip: () => void;
  onView: () => void;
  onApply: () => void;
  onOptimizeResume: () => void;
}

export function JobCard({ job, onSkip, onView, onApply, onOptimizeResume }: JobCardProps) {
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  const formatSalary = () => {
    if (!job.salaryMin || !job.salaryMax) return 'Salary not specified';
    return `$${(job.salaryMin / 1000).toFixed(0)}K - $${(
      job.salaryMax / 1000
    ).toFixed(0)}K/year`;
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-md border border-purple-100 rounded-2xl shadow-xl overflow-hidden">
      {/* COMPACT HEADER SECTION */}
      <div className="bg-gradient-to-r from-purple-50/60 via-pink-50/40 to-purple-50/60 border-b border-purple-100 px-6 py-4">
        <div className="grid grid-cols-[1fr_auto] gap-6">
          {/* Left side: Title and Details */}
          <div className="space-y-2">
            {/* Job Title */}
            <h1 className="text-2xl font-bold text-[#682A53] leading-tight">
              {job.title}
            </h1>

            {/* Company */}
            <div className="text-base font-semibold text-gray-900">
              {job.company}
            </div>

            {/* Location */}
            <div className="text-sm text-gray-700">
              {job.location}
              {job.isRemote && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Remote
                </span>
              )}
            </div>

            {/* Salary */}
            <div className="text-sm font-bold text-green-600">
              {formatSalary()}
            </div>

            {/* Other Details with Freshness Badge */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{formatTimeAgo(job.postingDate)}</span>
              <span>•</span>
              <span>{job.jobType}</span>
              <span>•</span>
              <span>{job.jobLevel}</span>
              {job.applicantCount && (
                <>
                  <span>•</span>
                  <span>{job.applicantCount} applicants</span>
                </>
              )}
              {job.freshnessStatus && (
                <>
                  <span>•</span>
                  <FreshnessBadge status={job.freshnessStatus} />
                </>
              )}
            </div>
          </div>

          {/* Right side: Match Score and Action Buttons */}
          <div className="flex flex-col items-end gap-3">
            {/* Match Score at top */}
            <MatchScoreBadge score={job.matchScore} />

            {/* Action Buttons in a column */}
            <div className="flex flex-col gap-2">
              {/* Primary Actions Row */}
              <div className="flex gap-2">
                <button
                  onClick={onSkip}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all whitespace-nowrap"
                >
                  Skip Job
                </button>
                <button
                  onClick={onView}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] rounded-lg transition-all whitespace-nowrap"
                >
                  View
                </button>
                <button
                  onClick={onApply}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg transition-all whitespace-nowrap"
                >
                  Apply
                </button>
              </div>

              {/* Resume Optimization Button */}
              <button
                onClick={onOptimizeResume}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Optimize Resume
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* JOB DESCRIPTION SECTION - Directly attached */}
      <div className="px-6 py-4 max-h-[calc(100vh-280px)] overflow-y-auto">
        <div
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(104, 42, 83, 0.05);
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(104, 42, 83, 0.2);
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(104, 42, 83, 0.3);
        }
      `}</style>
    </div>
  );
}
