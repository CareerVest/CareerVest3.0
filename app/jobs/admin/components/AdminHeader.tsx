'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Settings, Plus, ArrowLeft } from 'lucide-react';

interface AdminHeaderProps {
  onAddClient: () => void;
  configuredCount: number;
  selectedClient?: {
    clientID: number;
    clientName: string;
  } | null;
  onBack?: () => void;
}

export function AdminHeader({
  onAddClient,
  configuredCount,
  selectedClient,
  onBack,
}: AdminHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Title and Client Info */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900">Admin Console</h1>
              {!selectedClient && (
                <span className="text-xs text-gray-500">
                  ({configuredCount} {configuredCount === 1 ? 'client' : 'clients'})
                </span>
              )}
            </div>
            {selectedClient && (
              <div className="flex items-center gap-2 mt-1">
                <Button
                  onClick={onBack}
                  size="sm"
                  className="h-6 px-2 text-xs gap-1 bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Clients
                </Button>
                <span className="text-xs text-gray-400">•</span>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{selectedClient.clientName}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions - Only show on grid view, not on client detail view */}
          {!selectedClient && (
            <div className="flex items-center gap-2">
              <Button
                onClick={onAddClient}
                size="sm"
                className="h-8 text-xs gap-1.5 bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white"
              >
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
              <Button
                onClick={() => router.push('/jobs')}
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5"
              >
                <Settings className="h-3 w-3" />
                Job Portal
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
