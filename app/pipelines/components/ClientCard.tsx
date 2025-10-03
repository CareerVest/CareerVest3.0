import React, { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  ArrowRight,
  Check,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Client,
  ClientStatus,
  UserRole,
} from "../../types/pipelines/pipeline";
import { canMoveClient, getAvailableStages } from "./utils";
import {
  stageConfig,
  getRequiredActions,
  areAllActionsCompleted,
} from "./constants";
import { UnifiedActionDialog } from "./UnifiedActionDialog";
import { normalizeDepartments, isClientBlocked, getActiveBlock } from "../actions/pipelineActions";
import { formatDateEST } from "../../utils/dateUtils";
import { ClientBlockDialog } from "./ClientBlockDialog";

interface ClientCardProps {
  client: Client;
  onMoveClient: (clientId: string, newStatus: ClientStatus) => void;
  onViewDetails: (client: Client) => void;
  onActionComplete?: (
    clientId: string,
    action: string,
    data: { comment: string; file?: File; additionalFiles?: File[] }
  ) => void;
  onClientUpdate?: (updatedClient: Client) => void;
  currentUserRole: UserRole;
  isSelected?: boolean;
}

export function ClientCard({
  client,
  onMoveClient,
  onViewDetails,
  onActionComplete,
  onClientUpdate,
  currentUserRole,
  isSelected = false,
}: ClientCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [unifiedActionDialogOpen, setUnifiedActionDialogOpen] = useState(false);
  const [selectedUnifiedAction, setSelectedUnifiedAction] = useState<string>("");
  const [clientIsBlocked, setClientIsBlocked] = useState(client.isBlocked || false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  // Update block status when client prop changes
  useEffect(() => {
    setClientIsBlocked(client.isBlocked || false);
  }, [client.isBlocked]);

  // Get required actions for the current stage
  const requiredActions = useMemo(() => {
    return getRequiredActions(client.status, currentUserRole);
  }, [client.status, currentUserRole]);

  // Check if all required actions are completed
  const allActionsCompleted = areAllActionsCompleted(
    client,
    client.status,
    currentUserRole
  );

  // Count completed actions
  const { completedActions, totalActions } = useMemo(() => {
    const completed = requiredActions.filter((action: string) => {
      if (action === "AssignRecruiter" && client.assignedRecruiterID) {
        return true;
      }
      const departments = normalizeDepartments(client.departments);
      return departments.some((dept) => {
        if (!dept || !dept.actions) return false;
        let actions = dept.actions;
        if (
          dept.actions &&
          typeof dept.actions === "object" &&
          (dept.actions as any).$values &&
          Array.isArray((dept.actions as any).$values)
        ) {
          actions = (dept.actions as any).$values;
        }
        return actions.some(
          (act) =>
            act &&
            act.actionType === action &&
            act.status === "completed"
        );
      });
    });
    return {
      completedActions: completed.length,
      totalActions: requiredActions.length,
    };
  }, [client, requiredActions]);

  // Helper function to check if an action is completed
  const isActionCompleted = (actionType: string): boolean => {
    if (actionType === "AssignRecruiter" && client.assignedRecruiterID) {
      return true;
    }
    const departments = normalizeDepartments(client.departments);
    return departments.some((dept) => {
      if (!dept || !dept.actions) return false;
      let actions = dept.actions;
      if (
        dept.actions &&
        typeof dept.actions === "object" &&
        (dept.actions as any).$values &&
        Array.isArray((dept.actions as any).$values)
      ) {
        actions = (dept.actions as any).$values;
      }
      return actions.some(
        (act) =>
          act &&
          act.actionType === actionType &&
          act.status === "completed"
      );
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Check if click target is interactive element
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest(
      'button, [role="button"], input, select, textarea, a, [data-no-card-click]'
    );
    if (isInteractiveElement || unifiedActionDialogOpen) {
      return;
    }
    onViewDetails(client);
  };

  const handleActionClick = (action: string) => {
    setSelectedUnifiedAction(action);
    setUnifiedActionDialogOpen(true);
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case "exceptional":
        return "bg-red-100 text-red-800 border-red-300";
      case "real-time":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "fresher":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "standard":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <>
      <Card
        className={`group cursor-pointer transition-all hover:shadow-md ${
          isSelected ? "ring-2 ring-blue-500" : ""
        } ${isHovered ? "shadow-lg" : ""} ${clientIsBlocked ? "ring-2 ring-red-400" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <div className="p-3 relative">
          {/* Block Status Ribbon - Top Right Corner */}
          {!["placed", "backed-out"].includes(client.status) &&
            ["Admin", "Sales_Executive", "Resume_Writer", "Marketing_Manager"].includes(currentUserRole) && (
              <div className="absolute top-0 right-0 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBlockDialogOpen(true);
                  }}
                  className={`h-7 px-2 rounded-tl-none rounded-br-none flex items-center gap-1 transition-all ${
                    clientIsBlocked
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  title={clientIsBlocked ? "Client is blocked - Click to unblock" : "Block client and pause SLA"}
                  data-no-card-click="true"
                >
                  {clientIsBlocked ? (
                    <>
                      <PlayCircle className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Blocked</span>
                    </>
                  ) : (
                    <>
                      <PauseCircle className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Block</span>
                    </>
                  )}
                </Button>
              </div>
            )}

          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                  {client.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{client.name}</h4>
                {client.priority && (
                  <Badge
                    variant="outline"
                    className={`text-xs px-1 py-0 mt-1 ${getPriorityColor(client.priority)}`}
                  >
                    {client.priority}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Person */}
          <div className="mb-2">
            <p className="text-xs text-muted-foreground break-words leading-tight">
              {client.status === "sales" || client.status === "resume"
                ? "Sales Person"
                : "Recruiter"}
              : <span className="font-medium text-gray-700">{client.assignedTo || "Unassigned"}</span>
            </p>
          </div>

          {/* Progress Bar */}
          {totalActions > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Required Actions Progress</span>
                <span>{completedActions}/{totalActions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedActions / totalActions) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Required Actions */}
          <div
            className="space-y-1 mb-2"
            data-actions="true"
            data-ignore-card-click="true"
          >
            <div className="text-xs text-muted-foreground mb-1 font-medium">
              Required Actions{" "}
              {!allActionsCompleted ? "(click to complete)" : "(all completed)"}:
            </div>
            {requiredActions.map((action: string, index: number) => {
              const isCompleted = isActionCompleted(action);
              const previousActionsCompleted = requiredActions
                .slice(0, index)
                .every((prevAction) => isActionCompleted(prevAction));
              const isDisabled = isCompleted || !previousActionsCompleted;
              const disabledReason = isCompleted
                ? "Action already completed"
                : !previousActionsCompleted
                ? "Complete previous actions first"
                : "";

              const actionDisplayName = action.includes("-")
                ? action.split("-")[0]
                : action;

              return (
                <Button
                  key={action}
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-2 text-xs h-6 p-1 w-full justify-start ${
                    isCompleted
                      ? "opacity-75 bg-green-50 hover:bg-green-100"
                      : !previousActionsCompleted
                      ? "opacity-50 bg-gray-50 cursor-not-allowed"
                      : "hover:bg-blue-50 border border-dashed border-blue-200"
                  }`}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isDisabled) {
                      handleActionClick(action);
                    }
                  }}
                  disabled={isDisabled}
                  title={disabledReason}
                  data-no-card-click="true"
                >
                  <div
                    className={`w-3 h-3 rounded flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500"
                        : !previousActionsCompleted
                        ? "border border-gray-200 bg-gray-100"
                        : "border border-gray-300"
                    }`}
                  >
                    {isCompleted && <Check className="w-2 h-2 text-white" />}
                  </div>
                  <span
                    className={`break-words leading-tight ${
                      isCompleted
                        ? "line-through text-green-700"
                        : !previousActionsCompleted
                        ? "text-gray-400"
                        : "text-blue-700"
                    }`}
                  >
                    {actionDisplayName === "RateCandidate"
                      ? "Rate Candidate"
                      : actionDisplayName
                          .replace("-", " ")
                          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Last Updated */}
          <div className="mt-2">
            <p className="text-xs text-muted-foreground break-words leading-tight">
              Updated:{" "}
              <span className="font-medium text-gray-700">
                {formatDateEST(client.lastUpdated)}
              </span>
            </p>
          </div>

          {/* Actions Menu - Only show when all actions are completed */}
          {allActionsCompleted && (
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                  data-no-card-click="true"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                {canMoveClient(client, currentUserRole) &&
                  getAvailableStages(client.status, currentUserRole).map(
                    (stage) => {
                      const config = stageConfig[stage];
                      return (
                        <DropdownMenuItem
                          key={stage}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onMoveClient(client.id, stage);
                          }}
                        >
                          <ArrowRight className="w-3 h-3 mr-2" />
                          Move to {config?.title || stage}
                        </DropdownMenuItem>
                      );
                    }
                  )}

                {/* Always show View Details */}
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onViewDetails(client);
                  }}
                >
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </Card>

      {/* Unified Action Dialog */}
      {unifiedActionDialogOpen && (
        <UnifiedActionDialog
          isOpen={unifiedActionDialogOpen}
          onClose={() => {
            setUnifiedActionDialogOpen(false);
            setSelectedUnifiedAction("");
          }}
          clientId={parseInt(client.id)}
          actionType={selectedUnifiedAction}
          currentStage={client.status}
          onSuccess={(result?: any) => {
            console.log("🎯 UnifiedActionDialog onSuccess called with result:", result);

            // Call the onActionComplete callback if provided
            if (onActionComplete) {
              onActionComplete(client.id, selectedUnifiedAction, {
                comment: result?.notes || "",
                file: result?.file,
                additionalFiles: result?.additionalFiles,
              });
            }

            // Update client if callback provided
            if (onClientUpdate && result?.client) {
              onClientUpdate(result.client);
            }

            // Note: Stage transitions should only happen via manual "Move to..." selection
            // Remove automatic stage transitions after action completion
            // if (result?.stageTransitioned && result?.newStage) {
            //   onMoveClient(client.id, result.newStage);
            // }

            setUnifiedActionDialogOpen(false);
            setSelectedUnifiedAction("");
          }}
        />
      )}

      {/* Block Dialog */}
      <ClientBlockDialog
        client={client}
        isOpen={isBlockDialogOpen}
        onClose={() => setIsBlockDialogOpen(false)}
        onSuccess={async () => {
          // Fetch updated client data after block/unblock
          const clientId = parseInt(client.id, 10);
          if (!isNaN(clientId)) {
            try {
              const [blockResponse, activeBlockResponse] = await Promise.all([
                isClientBlocked(clientId),
                getActiveBlock(clientId),
              ]);

              if (blockResponse.success) {
                // Update local state immediately
                setClientIsBlocked(blockResponse.isBlocked);

                // Update parent with new block data
                if (onClientUpdate) {
                  onClientUpdate({
                    ...client,
                    isBlocked: blockResponse.isBlocked,
                    blockedReason: activeBlockResponse.data?.blockedReason || null,
                    blockedStageName: activeBlockResponse.data?.stageName || null,
                  });
                }
              }
            } catch (error) {
              console.error("Error refreshing block status:", error);
            }
          }
        }}
      />
    </>
  );
}