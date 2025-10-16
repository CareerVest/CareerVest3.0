'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { ClientWithBatch } from '../types/jobs';

interface ClientSelectorProps {
  clients: ClientWithBatch[];
  selectedClientID: number | null;
  onClientChange: (clientID: number) => void;
}

export function ClientSelector({
  clients,
  selectedClientID,
  onClientChange,
}: ClientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const selectedClient = selectedClientID
    ? clients.find((c) => c.clientID === selectedClientID)
    : null;

  const filteredClients = clients.filter(
    (client) =>
      client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex items-center gap-3">
      <Select
        value={selectedClientID?.toString() || ''}
        onValueChange={(value) => {
          onClientChange(parseInt(value));
          setSearchTerm('');
        }}
      >
        <SelectTrigger className="w-[240px] h-7 text-xs border-gray-300 focus:ring-purple-500 bg-white">
          <SelectValue>
            {selectedClient && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-900">
                  {selectedClient.clientName}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-[10px] text-gray-600">
                  {selectedClient.clientRole}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent className="w-[240px]">
          <div className="p-1.5 border-b bg-white">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-7 text-xs border-gray-300"
            />
          </div>

          <div className="max-h-[240px] overflow-y-auto">
            {filteredClients.map((client) => (
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
                  {client.currentProgress && (
                    <div className="text-[10px] text-gray-500">
                      {client.currentProgress}
                    </div>
                  )}
                </div>
              </SelectItem>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-xs">
              No clients found
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
