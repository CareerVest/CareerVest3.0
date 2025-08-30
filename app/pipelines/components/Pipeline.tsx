import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, LayoutGrid, X } from "lucide-react";
import {
  Client,
  ClientStatus,
  UserRole,
  ActionType,
} from "../../types/pipelines/pipeline";
import { mockClients, mainStages, specialStates } from "./constants";
import { DroppableStage } from "./DroppableStage";
import { PipelineStats } from "./PipelineStats";

interface PipelineProps {
  currentUserRole: UserRole;
  onClientSelect?: (client: Client) => void;
}

export function Pipeline({ currentUserRole, onClientSelect }: PipelineProps) {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ClientStatus | "all">("all");

  const getClientsForStatus = (status: ClientStatus) => {
    let filteredClients = clients.filter((client) => client.status === status);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredClients = filteredClients.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.assignedTo.toLowerCase().includes(query) ||
          client.notes.toLowerCase().includes(query)
      );
    }

    return filteredClients;
  };

  const moveClient = (clientId: string, newStatus: ClientStatus) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === clientId
          ? {
              ...client,
              status: newStatus,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : client
      )
    );
  };

  const handleActionComplete = (
    clientId: string,
    action: string,
    data: { comment: string; file?: File }
  ) => {
    // Update client with completed action, document tracking, and action history
    setClients((prev) =>
      prev.map((client) =>
        client.id === clientId
          ? {
              ...client,
              completedActions: [...client.completedActions, action],
              lastUpdated: new Date().toISOString().split("T")[0],
              notes:
                client.notes +
                `\n${new Date().toLocaleDateString()} - ${action}: ${
                  data.comment
                }${data.file ? ` (File: ${data.file.name})` : ""}`,
              // Add document to tracking if file was uploaded
              documents: data.file
                ? [
                    ...client.documents,
                    {
                      id: `${clientId}-${Date.now()}`,
                      name: data.file.name,
                      type: data.file.type || "application/octet-stream",
                      uploadedAt: new Date().toISOString(),
                      uploadedBy: "Current User", // In real app, get from auth context
                      fileSize: data.file.size,
                      notes: data.comment,
                    },
                  ]
                : client.documents,
              // Add action to history
              actionHistory: [
                ...client.actionHistory,
                {
                  id: `${clientId}-${Date.now()}`,
                  clientId: clientId,
                  actionType: action as ActionType,
                  performedBy: "Current User", // In real app, get from auth context
                  performedByRole: currentUserRole,
                  timestamp: new Date().toISOString(),
                  notes: data.comment,
                  fileUploaded: !!data.file,
                  fileName: data.file?.name,
                },
              ],
            }
          : client
      )
    );

    // Here you would also send the data to your backend
    console.log("Action completed:", { clientId, action, data });
  };

  const handleViewDetails = (client: Client) => {
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const getTotalClients = () => clients.length;
  const getActiveClients = () =>
    clients.filter((c) => !["backed-out", "completed"].includes(c.status))
      .length;

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <PipelineStats clients={clients} />

      {/* Pipeline Content */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Stages - Takes up most of the space */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mainStages.map((status) => (
              <div key={status}>
                <DroppableStage
                  status={status}
                  clients={getClientsForStatus(status)}
                  onMoveClient={moveClient}
                  onViewDetails={handleViewDetails}
                  onActionComplete={handleActionComplete}
                  currentUserRole={currentUserRole}
                  isMainStage={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Special States - Fixed width sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <h3>Special States</h3>
              <Badge variant="outline" className="text-xs">
                {specialStates.reduce(
                  (acc, status) => acc + getClientsForStatus(status).length,
                  0
                )}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {specialStates.map((status) => (
                <div key={status} className="h-48">
                  <DroppableStage
                    status={status}
                    clients={getClientsForStatus(status)}
                    onMoveClient={moveClient}
                    onViewDetails={handleViewDetails}
                    onActionComplete={handleActionComplete}
                    currentUserRole={currentUserRole}
                    isMainStage={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
