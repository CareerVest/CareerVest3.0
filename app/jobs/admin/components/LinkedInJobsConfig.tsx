'use client';

import { useState, useEffect } from 'react';
import { LinkedInJobsParams } from '../../types/fetchSources';
import { Input } from '@/components/ui/input';

interface LinkedInJobsConfigProps {
  initialParams?: string; // JSON string
  onChange: (params: LinkedInJobsParams) => void;
}

export function LinkedInJobsConfig({ initialParams, onChange }: LinkedInJobsConfigProps) {
  const [datePosted, setDatePosted] = useState<'pastDay' | 'pastWeek' | 'pastMonth' | 'any'>('pastWeek');
  const [maxItems, setMaxItems] = useState<number>(100);

  useEffect(() => {
    if (initialParams) {
      try {
        // Handle both string and object formats
        const parsed = typeof initialParams === 'string' ? JSON.parse(initialParams) : initialParams;
        setDatePosted(parsed.datePosted || 'pastWeek');
        setMaxItems(parsed.maxItems || 100);
      } catch (error) {
        console.error('Error parsing LinkedIn parameters:', error);
      }
    }
  }, [initialParams]);

  useEffect(() => {
    // Notify parent of changes
    // Note: keywords and location will be populated from Step 1 configuration
    const params: LinkedInJobsParams = {
      keywords: '', // Will be populated from config
      location: '', // Will be populated from config
      datePosted,
      maxItems
    };
    onChange(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datePosted, maxItems]);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-blue-900 mb-1">LinkedIn Jobs Scraper</h4>
        <p className="text-xs text-blue-700">
          Will use job titles and locations from Step 1
        </p>
      </div>

      {/* Date Posted */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Date Posted
        </label>
        <select
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value as any)}
          className="h-8 text-xs border border-gray-300 rounded-md px-2 w-full"
        >
          <option value="pastDay">Past 24 hours</option>
          <option value="pastWeek">Past Week</option>
          <option value="pastMonth">Past Month</option>
          <option value="any">Any Time</option>
        </select>
      </div>

      {/* Max Items */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Max Jobs to Fetch
        </label>
        <Input
          type="number"
          min="1"
          max="1000"
          value={maxItems}
          onChange={(e) => setMaxItems(parseInt(e.target.value) || 100)}
          className="h-8 text-xs w-32"
        />
        <p className="text-xs text-gray-500 mt-1">
          Default: 100. Max recommended: 500 per fetch.
        </p>
      </div>

    </div>
  );
}
