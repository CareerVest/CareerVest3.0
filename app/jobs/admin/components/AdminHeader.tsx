'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { dummyClientConfigurations } from '../../data/dummyAdminData';
import { Settings } from 'lucide-react';

interface AdminHeaderProps {
  selectedClientID: number | 'all';
  onClientChange: (clientID: number | 'all') => void;
}

export function AdminHeader({
  selectedClientID,
  onClientChange,
}: AdminHeaderProps) {
  const router = useRouter();
  const selectedClient =
    selectedClientID !== 'all'
      ? dummyClientConfigurations.find((c) => c.clientID === selectedClientID)
      : null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Client Filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-700">Client:</span>
            <Select
              value={selectedClientID.toString()}
              onValueChange={(value) =>
                onClientChange(value === 'all' ? 'all' : parseInt(value))
              }
            >
              <SelectTrigger className="w-[280px] h-7 text-xs border-gray-300 focus:ring-purple-500 bg-white">
                <SelectValue>
                  {selectedClientID === 'all' ? (
                    <span className="font-semibold text-gray-900">All Clients</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900">
                        {selectedClient?.clientName}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-[10px] text-gray-600">
                        {selectedClient?.clientRole}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>

              <SelectContent className="w-[280px]">
                {/* All Clients Option */}
                <SelectItem value="all" className="text-xs py-1.5">
                  <span className="font-semibold">All Clients</span>
                </SelectItem>

                {/* Individual Clients */}
                {dummyClientConfigurations.map((client) => (
                  <SelectItem
                    key={client.clientID}
                    value={client.clientID.toString()}
                    className="cursor-pointer hover:bg-gray-50 transition-colors text-xs py-1.5"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="font-semibold text-gray-900 text-xs">
                        {client.clientName}
                      </div>
                      <div className="text-[10px] text-gray-600">
                        {client.clientRole}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Right: Toggle to Jobs */}
          <Button
            onClick={() => router.push('/jobs')}
            size="sm"
            className="h-7 text-xs gap-1.5 bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white"
          >
            <Settings className="h-3 w-3" />
            Jobs
          </Button>
        </div>
      </div>
    </div>
  );
}
