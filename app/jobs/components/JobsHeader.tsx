'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ClientWithBatch } from '../types/jobs';
import { ClientSelector } from './ClientSelector';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface JobsHeaderProps {
  clients: ClientWithBatch[];
  selectedClientID: number | null;
  onClientChange: (clientID: number) => void;
  currentJobIndex: number;
  totalJobs: number;
  batchNumber: string;
  userRole?: string; // Add userRole to check if admin
}

export function JobsHeader({
  clients,
  selectedClientID,
  onClientChange,
  currentJobIndex,
  totalJobs,
  batchNumber,
  userRole = 'default',
}: JobsHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminView = pathname.includes('/admin');
  const isAdmin = userRole === 'Admin';

  const handleToggleView = () => {
    if (isAdminView) {
      router.push('/jobs');
    } else {
      router.push('/jobs/admin');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left side: Title + Batch info */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-[#682A53] whitespace-nowrap">
              {isAdminView ? 'Admin Console' : 'Jobs'}
            </h1>
            {!isAdminView && (
              <div className="text-xs text-gray-600 font-medium">
                Batch #{batchNumber}
              </div>
            )}
          </div>

          {/* Right side: Client Selector + Admin Toggle */}
          <div className="flex items-center gap-3">
            {!isAdminView && (
              <ClientSelector
                clients={clients}
                selectedClientID={selectedClientID}
                onClientChange={onClientChange}
              />
            )}
            {isAdmin && (
              <Button
                onClick={handleToggleView}
                size="sm"
                variant={isAdminView ? 'outline' : 'default'}
                className={`h-7 text-xs gap-1.5 ${
                  isAdminView
                    ? 'border-gray-300'
                    : 'bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white'
                }`}
              >
                <Settings className="h-3 w-3" />
                {isAdminView ? 'Job Queue' : 'Admin Console'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
