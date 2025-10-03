import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClientCard } from "./ClientCard";
import { Client, ClientStatus, UserRole } from "../../types/pipelines/pipeline";
import { stageConfig } from "./constants";

interface StageProps {
  status: ClientStatus;
  clients: Client[];
  onMoveClient: (clientId: string, newStatus: ClientStatus) => void;
  onViewDetails: (client: Client) => void;
  onActionComplete: (
    clientId: string,
    action: string,
    data: { comment: string; file?: File; additionalFiles?: File[] }
  ) => void;
  onClientUpdate: (client: Client) => void;
  currentUserRole: UserRole;
  isMainStage: boolean;
  selectedClientId: string | null;
}

export function Stage({
  status,
  clients,
  onMoveClient,
  onViewDetails,
  onActionComplete,
  onClientUpdate,
  currentUserRole,
  isMainStage,
  selectedClientId,
}: StageProps) {
  const config = stageConfig[status];
  const Icon = config.icon;

  // For now, no SLA violations calculation (performance optimization)
  const slaViolations = 0;

  return (
    <Card
      className={`h-full transition-all duration-200 ${config.borderColor} ${
        slaViolations > 0 ? "border-red-300 bg-red-50/20" : ""
      }`}
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
                  </div>
                ) : (
                  clients.map((client) => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      onMoveClient={onMoveClient}
                      onViewDetails={onViewDetails}
                      onActionComplete={onActionComplete}
                      onClientUpdate={onClientUpdate}
                      currentUserRole={currentUserRole}
                      isSelected={selectedClientId === client.id}
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
                          {new Date(client.lastUpdated).toLocaleDateString()}
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
}