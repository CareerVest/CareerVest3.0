import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  GripVertical,
  ArrowRight,
  Check,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Client,
  ClientStatus,
  UserRole,
  ActionType,
} from "../../types/pipelines/pipeline";
import { canMoveClient, getAvailableStages } from "./utils";
import {
  stageConfig,
  getRequiredActions,
  areAllActionsCompleted,
  isActionDisabled,
  requiresFileUpload,
  getFileUploadDescription,
  canPerformAction,
  getAvailableActionsForRole,
} from "./constants";
import { ActionDialog } from "./ActionDialog";

interface DraggableClientCardProps {
  client: Client;
  onMoveClient: (clientId: string, newStatus: ClientStatus) => void;
  onViewDetails: (client: Client) => void;
  onActionComplete: (
    clientId: string,
    action: string,
    data: { comment: string; file?: File }
  ) => void;
  currentUserRole: UserRole;
  isDragging?: boolean;
}

export function DraggableClientCard({
  client,
  onMoveClient,
  onViewDetails,
  onActionComplete,
  currentUserRole,
  isDragging = false,
}: DraggableClientCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");

  const handleDragStart = (e: React.DragEvent) => {
    // Check if client can be moved (all actions completed for non-admin users)
    console.log("Drag start:", {
      clientName: client.name,
      clientStatus: client.status,
      currentUserRole,
      canMove: canMoveClient(client, currentUserRole),
      completedActions: client.completedActions,
    });

    if (!canMoveClient(client, currentUserRole)) {
      console.log("Drag prevented - cannot move client");
      e.preventDefault();
      return;
    }

    console.log("Drag allowed - setting data");
    e.dataTransfer.setData("text/plain", client.id);
    e.dataTransfer.setData("application/json", JSON.stringify(client));
    e.dataTransfer.effectAllowed = "move";
  };

  const availableStages = getAvailableStages(client.status, currentUserRole);

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    setActionDialogOpen(true);
  };

  const handleActionSubmit = async (data: { comment: string; file?: File }) => {
    await onActionComplete(client.id, selectedAction, data);
    setActionDialogOpen(false);
    setSelectedAction("");
  };

  const getStatusBadgeColor = (status: ClientStatus) => {
    switch (status) {
      case "sales":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "resume":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "marketing":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "backed-out":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "remarketing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "on-hold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const requiredActions = getRequiredActions(client.status, currentUserRole);
  const completedActions = requiredActions.filter((action) =>
    client.completedActions.includes(action)
  ).length;
  const totalActions = requiredActions.length;
  const allActionsCompleted = areAllActionsCompleted(
    client,
    client.status,
    currentUserRole
  );

  return (
    <Card
      className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md group relative ${
        isDragging ? "opacity-50 rotate-2" : ""
      } ${isHovered ? "scale-[1.02] shadow-lg" : ""} ${
        !canMoveClient(client, currentUserRole) &&
        currentUserRole !== "admin" &&
        currentUserRole !== "marketing-manager"
          ? "border-orange-200 bg-orange-50/30"
          : ""
      }`}
      draggable={canMoveClient(client, currentUserRole)}
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(client)}
    >
      {/* Drag Handle */}
      {canMoveClient(client, currentUserRole) && (
        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
      )}

      {/* Can't Move Indicator */}
      {!canMoveClient(client, currentUserRole) &&
        currentUserRole !== "admin" &&
        currentUserRole !== "marketing-manager" && (
          <div
            className="absolute left-1 top-1/2 transform -translate-y-1/2"
            title="Complete all actions to enable moving"
          >
            <Clock className="w-3 h-3 text-orange-500" />
          </div>
        )}

      <div className="flex items-start justify-between">
        <div className="flex-1 ml-2">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">
                {client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate">{client.name}</span>
          </div>

          {/* Status Badge */}
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`text-xs ${getStatusBadgeColor(client.status)}`}
              >
                {client.status.replace("-", " ").toUpperCase()}
              </Badge>
              {client.priority && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    client.priority === "high"
                      ? "border-red-200 text-red-700"
                      : client.priority === "medium"
                      ? "border-yellow-200 text-yellow-700"
                      : "border-gray-200 text-gray-700"
                  }`}
                >
                  {client.priority}
                </Badge>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            Assigned to: {client.assignedTo}
          </p>

          {/* Progress Indicator */}
          {totalActions > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>
                  {completedActions}/{totalActions}
                </span>
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

          {/* Stage Actions Preview */}
          <div className="space-y-1 mb-2">
            <div className="text-xs text-muted-foreground mb-1 font-medium">
              Actions{" "}
              {!allActionsCompleted ? "(click to complete)" : "(all completed)"}
              :
            </div>
            {requiredActions.slice(0, 3).map((action: string) => {
              const isCompleted = client.completedActions.includes(action);
              const actionDisplayName = action.includes("-")
                ? action.split("-")[0]
                : action;

              // Check if user can perform this action based on role
              const canPerform = canPerformAction(
                actionDisplayName as ActionType,
                currentUserRole,
                client,
                client.status
              );

              // Check if action is disabled due to prerequisites
              const isDisabled = isActionDisabled(
                client,
                action,
                client.status,
                currentUserRole
              );

              return (
                <Button
                  key={action}
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-2 text-xs h-6 p-1 w-full justify-start ${
                    isCompleted
                      ? "opacity-75 bg-green-50 hover:bg-green-100"
                      : !canPerform || isDisabled
                      ? "opacity-50 bg-gray-50 cursor-not-allowed"
                      : "hover:bg-blue-50 border border-dashed border-blue-200"
                  }`}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (!isCompleted && canPerform && !isDisabled) {
                      handleActionClick(actionDisplayName);
                    }
                  }}
                  disabled={isCompleted || !canPerform || isDisabled}
                >
                  <div
                    className={`w-3 h-3 rounded flex items-center justify-center ${
                      isCompleted ? "bg-green-500" : "border border-gray-300"
                    }`}
                  >
                    {isCompleted && <Check className="w-2 h-2 text-white" />}
                  </div>
                  <span
                    className={`truncate ${
                      isCompleted
                        ? "line-through text-green-700"
                        : !canPerform || isDisabled
                        ? "text-gray-500"
                        : "text-blue-700"
                    }`}
                  >
                    {actionDisplayName
                      .replace("-", " ")
                      .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </Button>
              );
            })}
            {requiredActions.length > 3 && (
              <div className="text-xs text-muted-foreground pl-4">
                +{requiredActions.length - 3} more actions
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Updated: {client.lastUpdated}
          </p>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {canMoveClient(client, currentUserRole) &&
              availableStages.map((stage) => {
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
                    Move to {config.title}
                  </DropdownMenuItem>
                );
              })}
            {canMoveClient(client, currentUserRole) &&
              availableStages.length > 0 && <DropdownMenuSeparator />}
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
      </div>

      {/* Action Dialog */}
      {actionDialogOpen && (
        <ActionDialog
          isOpen={actionDialogOpen}
          onClose={() => {
            setActionDialogOpen(false);
            setSelectedAction("");
          }}
          onSubmit={handleActionSubmit}
          actionName={selectedAction
            .replace("-", " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase())}
          clientName={client.name}
          requiresFile={requiresFileUpload(selectedAction as ActionType)}
          fileDescription={getFileUploadDescription(
            selectedAction as ActionType
          )}
        />
      )}
    </Card>
  );
}
