'use client';

import { useState } from 'react';
import { JobCard } from '../components/JobCard';
import { Job } from '../types/jobs';
import { searchJobs } from '../actions/jobsActions';

// HIDDEN FEATURE: Not linked in navigation yet
// To enable: Add link to navigation when ready

interface JobSearchFilters {
  clientID?: number;
  title?: string;
  company?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote?: boolean;
  jobLevel?: string;
  freshnessStatus?: string;
  pageNumber: number;
  pageSize: number;
}

interface SearchResponse {
  jobs: Job[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export default function JobSearchPage() {
  const [filters, setFilters] = useState<JobSearchFilters>({
    pageNumber: 1,
    pageSize: 50,
  });
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchJobs(filters);
      setResults({
        jobs: data.jobs,
        totalCount: data.totalCount,
        pageNumber: data.currentPage,
        pageSize: filters.pageSize,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200 mb-8">
          <h1 className="text-3xl font-bold text-[#682A53] mb-2">
            🔍 Job Search On-Demand
          </h1>
          <p className="text-gray-600">
            Search and explore job inventory with advanced filters
          </p>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Beta Feature:</strong> This is a Phase 3 feature currently hidden from
              regular users. Only accessible via direct URL.
            </p>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200 mb-8">
          <h2 className="text-xl font-bold text-[#682A53] mb-4">Search Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer"
                value={filters.title || ''}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                placeholder="e.g. Google"
                value={filters.company || ''}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                placeholder="e.g. New York"
                value={filters.location || ''}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Salary ($)
              </label>
              <input
                type="number"
                placeholder="e.g. 80000"
                value={filters.salaryMin || ''}
                onChange={(e) =>
                  setFilters({ ...filters, salaryMin: Number(e.target.value) || undefined })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Salary ($)
              </label>
              <input
                type="number"
                placeholder="e.g. 150000"
                value={filters.salaryMax || ''}
                onChange={(e) =>
                  setFilters({ ...filters, salaryMax: Number(e.target.value) || undefined })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Freshness Status
              </label>
              <select
                value={filters.freshnessStatus || ''}
                onChange={(e) => setFilters({ ...filters, freshnessStatus: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All</option>
                <option value="Live">Live (0-1 days)</option>
                <option value="Current">Current (1-7 days)</option>
                <option value="Week_Old">Week Old (7-14 days)</option>
                <option value="Stale">Stale (14-30 days)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Level</label>
              <input
                type="text"
                placeholder="e.g. Senior, Mid"
                value={filters.jobLevel || ''}
                onChange={(e) => setFilters({ ...filters, jobLevel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.isRemote || false}
                  onChange={(e) => setFilters({ ...filters, isRemote: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Remote Only</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#682A53] to-purple-600 hover:from-purple-600 hover:to-[#682A53]'
              }`}
            >
              {loading ? 'Searching...' : 'Search Jobs'}
            </button>
            <button
              onClick={() => {
                setFilters({ pageNumber: 1, pageSize: 50 });
                setResults(null);
              }}
              className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Search Results */}
        {results && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#682A53]">
                  Search Results ({results.totalCount} jobs found)
                </h2>
                <div className="text-sm text-gray-600">
                  Page {results.pageNumber} of {results.totalPages}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {results.jobs.map((job) => (
                <JobCard
                  key={job.jobID}
                  job={job}
                  onSkip={() => {}}
                  onView={() => window.open(job.sourceURL, '_blank')}
                  onApply={() => window.open(job.sourceURL, '_blank')}
                />
              ))}
            </div>

            {/* Pagination */}
            {results.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setFilters({ ...filters, pageNumber: filters.pageNumber - 1 })}
                  disabled={filters.pageNumber === 1}
                  className="px-4 py-2 rounded-lg font-semibold text-white bg-[#682A53] hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {filters.pageNumber} of {results.totalPages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, pageNumber: filters.pageNumber + 1 })}
                  disabled={filters.pageNumber === results.totalPages}
                  className="px-4 py-2 rounded-lg font-semibold text-white bg-[#682A53] hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {results && results.jobs.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-purple-200 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
