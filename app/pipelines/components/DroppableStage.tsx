import React, { useState, memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Client, ClientStatus, UserRole } from "../../types/pipelines/pipeline";
import { stageConfig } from "./constants";
import { DraggableClientCard } from "./DraggableClientCard";
import { canMoveClient, getAvailableStages } from "./utils";
import { formatDateEST } from "../../utils/dateUtils";
import { getSLAStatus } from "./slaConfig";
import { calculateDepartmentTime } from "./utils";

interface DroppableStageProps {
  status: ClientStatus;
  clients: Client[];
  onMoveClient: (clientId: string, newStatus: ClientStatus) => void;
  onViewDetails: (client: Client) => void;
  onActionComplete: (
    clientId: string,
    action: string,
    data: { comment: string; file?: File; additionalFiles?: File[] }
  ) => void;
  onTransitionAction?: (
    client: Client,
    fromStage: ClientStatus,
    toStage: ClientStatus
  ) => void;
  onClientUpdate?: (updatedClient: Client) => void;
  currentUserRole: UserRole;
  isMainStage?: boolean;
  selectedClientId?: string | null;
}

export const DroppableStage = memo(function DroppableStage({
  status,
  clients,
  onMoveClient,
  onViewDetails,
  onActionComplete,
  onTransitionAction,
  onClientUpdate,
  currentUserRole,
  isMainStage = false,
  selectedClientId = null,
}: DroppableStageProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const config = stageConfig[status];
  const Icon = config.icon;

  // Calculate SLA violations for this stage (exclude terminal stages)
  // Memoized to prevent expensive recalculations on every render
  const slaViolations = useMemo(() => {
    // TODO: SLA calculations temporarily commented out for performance
    console.log(
      `⚡ DroppableStage[${status}]: SLA calculations temporarily disabled`
    );
    return 0;

    /* 
    // COMMENTED OUT - SLA CALCULATION CODE
    const startTime = performance.now();

    const violations = clients.filter((client) => {
      // Don't apply SLA to terminal stages
      if (["placed", "on-hold", "backed-out"].includes(client.status)) {
        return false;
      }

      const departmentTime = calculateDepartmentTime(client);
      const currentStageData = departmentTime.find((dept) => dept.current);
      if (!currentStageData) return false;

      const slaStatus = getSLAStatus(
        client.status,
        currentStageData.businessDays || currentStageData.days,
        true
      );

      return slaStatus && slaStatus.status === "overdue";
    }).length;

    const calcTime = performance.now() - startTime;
    console.log(
      `⚡ DroppableStage[${status}]: SLA violations calculated for ${
        clients.length
      } clients in ${calcTime.toFixed(2)}ms`
    );

    return violations;
    */
  }, [clients, status]);

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
      className={`h-full transition-all duration-200 ${getBorderColor()} ${
        slaViolations > 0 ? "border-red-300 bg-red-50/20" : ""
      }`}
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
          <div className="ml-auto flex items-center gap-2">
            {slaViolations > 0 && (
              <Badge variant="destructive" className="text-xs">
                🚨 {slaViolations}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {clients.length}
            </Badge>
          </div>
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
                      onTransitionAction={onTransitionAction}
                      onClientUpdate={onClientUpdate}
                      currentUserRole={currentUserRole}
                      isSelected={selectedClientId === client.id}
                      currentStage={status}
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
                      className="flex flex-col p-2 bg-muted/30 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onViewDetails(client)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${config.color}`}
                        />
                        <span className="text-sm font-medium text-gray-900 break-words leading-tight">
                          {client.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Updated:
                        </span>
                        <span className="text-xs text-gray-700 font-medium break-words leading-tight">
                          {formatDateEST(client.lastUpdated)}
                        </span>
                      </div>
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
});
