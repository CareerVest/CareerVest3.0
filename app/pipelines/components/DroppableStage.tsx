import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Client, ClientStatus, UserRole } from "../../types/pipelines/pipeline";
import { stageConfig } from "./constants";
import { DraggableClientCard } from "./DraggableClientCard";
import { canMoveClient, getAvailableStages } from "./utils";

interface DroppableStageProps {
  status: ClientStatus;
  clients: Client[];
  onMoveClient: (clientId: string, newStatus: ClientStatus) => void;
  onViewDetails: (client: Client) => void;
  onActionComplete: (
    clientId: string,
    action: string,
    data: { comment: string; file?: File }
  ) => void;
  currentUserRole: UserRole;
  isMainStage?: boolean;
}

export function DroppableStage({
  status,
  clients,
  onMoveClient,
  onViewDetails,
  onActionComplete,
  currentUserRole,
  isMainStage = false,
}: DroppableStageProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const config = stageConfig[status];
  const Icon = config.icon;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const clientId = e.dataTransfer.getData("text/plain");
    const clientData = JSON.parse(
      e.dataTransfer.getData("application/json")
    ) as Client;

    // Debug logging
    console.log("Drop attempt:", {
      clientId,
      clientName: clientData.name,
      fromStatus: clientData.status,
      toStatus: status,
      currentUserRole,
      canMove: canMoveClient(clientData, currentUserRole),
      availableStages: getAvailableStages(clientData.status, currentUserRole),
      isAvailable: getAvailableStages(
        clientData.status,
        currentUserRole
      ).includes(status),
    });

    // Check if the user can move this client and if the move is valid
    const availableStages = getAvailableStages(
      clientData.status,
      currentUserRole
    );
    if (
      canMoveClient(clientData, currentUserRole) &&
      clientData.status !== status &&
      availableStages.includes(status)
    ) {
      console.log(
        "Moving client:",
        clientId,
        "from",
        clientData.status,
        "to",
        status
      );
      onMoveClient(clientId, status);
    } else {
      console.log("Move blocked:", {
        canMove: canMoveClient(clientData, currentUserRole),
        differentStatus: clientData.status !== status,
        available: availableStages.includes(status),
      });
    }
  };

  const getBorderColor = () => {
    if (isDragOver) {
      return `border-2 ${config.borderColor} bg-opacity-20 ${config.bgColor}`;
    }
    return "border border-border";
  };

  return (
    <Card
      className={`h-full transition-all duration-200 ${getBorderColor()}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className={`pb-3 ${config.bgColor} ${config.darkBgColor}`}>
        <CardTitle
          className={`flex items-center gap-2 ${config.textColor} ${config.darkTextColor}`}
        >
          <div className={`w-3 h-3 rounded-full ${config.color}`} />
          <Icon className="w-4 h-4" />
          <span className="truncate">{config.title}</span>
          <Badge variant="secondary" className="ml-auto">
            {clients.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        {isMainStage ? (
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                {clients.length === 0 ? (
                  <div className="text-center py-8">
                    <div
                      className={`w-12 h-12 rounded-full ${config.bgColor} ${config.darkBgColor} mx-auto mb-3 flex items-center justify-center`}
                    >
                      <Icon
                        className={`w-6 h-6 ${config.textColor} ${config.darkTextColor}`}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No clients in this stage
                    </p>
                    {isDragOver && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Drop client here
                      </p>
                    )}
                  </div>
                ) : (
                  clients.map((client) => (
                    <DraggableClientCard
                      key={client.id}
                      client={client}
                      onMoveClient={onMoveClient}
                      onViewDetails={onViewDetails}
                      onActionComplete={onActionComplete}
                      currentUserRole={currentUserRole}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {clients.length === 0 ? (
                  <div className="text-center py-4">
                    <Icon
                      className={`w-8 h-8 ${config.textColor} ${config.darkTextColor} mx-auto mb-2`}
                    />
                    <p className="text-xs text-muted-foreground">No clients</p>
                    {isDragOver && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Drop here
                      </p>
                    )}
                  </div>
                ) : (
                  clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onViewDetails(client)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className={`w-2 h-2 rounded-full ${config.color}`}
                        />
                        <span className="text-sm truncate">{client.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs ml-2">
                        {client.lastUpdated}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
