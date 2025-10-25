'use client';

import { useState, useEffect } from 'react';
import { ApifyCareerSitesParams } from '../../types/fetchSources';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ChipInput } from './ChipInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ApifyCareerSitesConfigProps {
  initialParams?: string; // JSON string
  onChange: (params: ApifyCareerSitesParams) => void;
}

export function ApifyCareerSitesConfig({ initialParams, onChange }: ApifyCareerSitesConfigProps) {
  const [urls, setUrls] = useState<string[]>(['']);
  const [maxItems, setMaxItems] = useState<number>(200);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(['FULL_TIME']);
  const [titleExclusions, setTitleExclusions] = useState<string[]>([]);

  useEffect(() => {
    if (initialParams) {
      try {
        // Handle both string and object formats
        const parsed = typeof initialParams === 'string' ? JSON.parse(initialParams) : initialParams;
        setUrls(parsed.urls || ['']);
        setMaxItems(parsed.limit || parsed.maxItems || 200);
        setTimeRange(parsed.timeRange || '7d');
        setEmploymentTypes(parsed.aiEmploymentTypeFilter || ['FULL_TIME']);
        setTitleExclusions(parsed.titleExclusionSearch || []);
      } catch (error) {
        console.error('Error parsing Career Sites parameters:', error);
      }
    }
  }, [initialParams]);

  useEffect(() => {
    // Notify parent of changes
    const params: ApifyCareerSitesParams = {
      urls: [], // URLs not required - will search across all companies
      maxItems,
      timeRange,
      aiEmploymentTypeFilter: employmentTypes,
      titleExclusionSearch: titleExclusions,
      proxyConfiguration: {
        useApifyProxy: true
      }
    };
    onChange(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxItems, timeRange, employmentTypes, titleExclusions]);

  const addUrl = () => {
    setUrls([...urls, '']);
  };

  const removeUrl = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls.length === 0 ? [''] : newUrls);
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Apify Career Sites Configuration</h4>
        <p className="text-xs text-gray-600 mb-3">
          Scrapes jobs from company career sites (105,000+ companies, 35 ATS platforms)
        </p>
      </div>

      {/* Time Range */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Time Range
        </label>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="h-8 text-xs border border-gray-300 rounded-md px-2 w-full"
        >
          <option value="1h">Past 1 hour</option>
          <option value="24h">Past 24 hours</option>
          <option value="7d">Past 7 days</option>
          <option value="30d">Past 30 days</option>
          <option value="6m">Past 6 months</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Only fetch jobs posted within this timeframe
        </p>
      </div>

      {/* Employment Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Employment Type
        </label>
        <div className="space-y-2">
          {[
            { value: 'FULL_TIME', label: 'Full-time' },
            { value: 'PART_TIME', label: 'Part-time' },
            { value: 'CONTRACTOR', label: 'Contractor' },
            { value: 'INTERN', label: 'Internship' }
          ].map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`employment-${type.value}`}
                checked={employmentTypes.includes(type.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setEmploymentTypes([...employmentTypes, type.value]);
                  } else {
                    setEmploymentTypes(employmentTypes.filter(t => t !== type.value));
                  }
                }}
              />
              <Label
                htmlFor={`employment-${type.value}`}
                className="text-xs font-normal cursor-pointer"
              >
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Job Title Exclusions */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Exclude Job Titles
        </label>
        <ChipInput
          values={titleExclusions}
          onChange={setTitleExclusions}
          placeholder="Type a title to exclude and press Tab or Enter"
        />
        <p className="text-xs text-gray-500 mt-1">
          E.g., VP, Director, Lead, Staff - jobs with these titles will be excluded
        </p>
      </div>

      {/* Max Items */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Max Jobs to Fetch
        </label>
        <Input
          type="number"
          min="1"
          max="10000"
          value={maxItems}
          onChange={(e) => setMaxItems(parseInt(e.target.value) || 200)}
          className="h-8 text-xs w-32"
        />
        <p className="text-xs text-gray-500 mt-1">
          Default: 200. Max recommended: 1000 per fetch.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800 font-semibold mb-1">Supported ATS Platforms:</p>
        <p className="text-xs text-blue-700">
          Greenhouse, Lever, Workday, BambooHR, SmartRecruiters, iCIMS, Taleo, JazzHR, and 27+ more
        </p>
      </div>
    </div>
  );
}
