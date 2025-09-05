import React, { useState, useEffect, memo, useMemo } from "react";
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
} from "./constants";
// Legacy dialogs removed - using only UnifiedActionDialog
import { UnifiedActionDialog } from "./UnifiedActionDialog";
import {
  getAvailableActionsForClient,
  normalizeDepartments,
  getPipelineCandidateById,
} from "../actions/pipelineActions";
import { formatDateEST } from "../../utils/dateUtils";
import {
  isTransitionRequiringDocuments,
  getTransitionRequirement,
  getFileRequirementsForTransition,
} from "./documentRequirements";
import { getSLAStatus, getSLAStatusColor, getSLAStatusIcon } from "./slaConfig";
import { calculateDepartmentTime } from "./utils";

interface DraggableClientCardProps {
  client: Client;
  onMoveClient: (
    clientId: string,
    newStatus: ClientStatus,
    skipBackendCall?: boolean
  ) => void;
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
  isDragging?: boolean;
  isSelected?: boolean;
  currentStage?: ClientStatus;
  enableCardClick?: boolean; // Controls whether clicking the card opens details
}

export const DraggableClientCard = memo(function DraggableClientCard({
  client,
  onMoveClient,
  onViewDetails,
  onActionComplete,
  onTransitionAction,
  onClientUpdate,
  currentUserRole,
  isDragging = false,
  isSelected = false,
  currentStage,
  enableCardClick = true,
}: DraggableClientCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [localPriority, setLocalPriority] = useState(client.priority);

  // Unified action dialog state
  const [unifiedActionDialogOpen, setUnifiedActionDialogOpen] = useState(false);
  const [selectedUnifiedAction, setSelectedUnifiedAction] =
    useState<string>("");
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  // Legacy handlers removed - using unified action system

  // Sync localPriority when client prop changes
  useEffect(() => {
    setLocalPriority(client.priority);
  }, [client.priority]);

  // TODO: Optimize - Move available actions loading to parent component to avoid N API calls
  // For now, disable individual API calls to reduce backend load
  useEffect(() => {
    // Temporarily disable individual API calls to fix performance issue
    // Each client card was making its own API call (3 clients = 3 API calls)
    // This should be moved to parent component and batched
    setAvailableActions([]); // Set empty for now
  }, [client.id, client.status]);

  // TODO: SLA calculations temporarily commented out for performance
  // Calculate SLA status for current stage
  // Memoized to prevent expensive recalculations on every render
  const slaStatus = useMemo(() => {
    // Temporarily return null to skip expensive SLA calculations
    return null;

    /* 
    // COMMENTED OUT - SLA CALCULATION CODE
    const startTime = performance.now();

    const departmentTime = calculateDepartmentTime(client);
    const currentStageData = departmentTime.find((dept) => dept.current);
    const result = currentStageData
      ? getSLAStatus(
          client.status, // Use client.status directly for consistency
          currentStageData.businessDays || currentStageData.days,
          true
        )
      : null;

    const calcTime = performance.now() - startTime;
    if (calcTime > 1) {
      // Only log if it takes more than 1ms
      console.log(
        `⚡ ClientCard[${
          client.name
        }]: SLA status calculated in ${calcTime.toFixed(2)}ms`
      );
    }

    return result;
    */
  }, [client.status, client.id, client.createdAt, client.lastUpdated]);

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

  const handleCardClick = (e: React.MouseEvent) => {
    // Only handle click if:
    // 1. Card click is enabled
    // 2. Not dragging
    // 3. Click target is not an interactive element
    // 4. No action dialog is open
    if (!enableCardClick || isDragging || unifiedActionDialogOpen) {
      return;
    }

    // Check if the click target or any parent is an interactive element
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest(
      'button, [role="button"], input, select, textarea, a, [data-no-card-click]'
    );

    if (isInteractiveElement) {
      return;
    }

    onViewDetails(client);
  };

  const handleActionClick = (action: string) => {
    // Use unified action system for all actions
    console.log(`🎯 Using unified action system for: ${action}`);
    setSelectedUnifiedAction(action);
    setUnifiedActionDialogOpen(true);
  };

  // Legacy handler removed - using unified action system

  // handleResumeCompletedSubmit removed - using unified action system

  /*
  // Legacy handlers - to be removed
  const handlePrioritySubmit = async (data: {
    priority: string;
    comment: string;
  }) => {
    console.log(
      "🔄 Setting priority for client:",
      client.id,
      "Priority:",
      data.priority
    );
    try {
      // First, update the client priority in the backend
      const result = await updateClientPriority(client.id, data.priority);

      if (result.success) {
        // Then complete the action
        const actionData = {
          comment: `Priority: ${data.priority}${
            data.comment ? ` - ${data.comment}` : ""
          }`,
          file: undefined,
        };

        // Complete the action first
        await onActionComplete(client.id, "RateCandidate", actionData);

        // Update local priority immediately for instant UI feedback
        setLocalPriority(
          data.priority as "exceptional" | "real-time" | "fresher" | "standard"
        );

        setPriorityDialogOpen(false);
      } else {
        console.error("Failed to update client priority:", result.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error in priority update process:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleAssignRecruiterSubmit = async (data: {
    recruiterId: number;
    comment: string;
  }) => {
    console.log(
      "🔄 Assigning recruiter for client:",
      client.id,
      "Recruiter ID:",
      data.recruiterId
    );

    try {
      // First, call the backend API to assign the recruiter
      const result = await assignRecruiterToClient(
        client.id,
        data.recruiterId,
        data.comment
      );

      if (result.success) {
        // Then complete the action
        const actionData = {
          comment: `Recruiter Assigned: ${data.recruiterId}${
            data.comment ? ` - ${data.comment}` : ""
          }`,
          file: undefined,
        };

        await onActionComplete(client.id, "AssignRecruiter", actionData);

        // Update the client's assignedRecruiterID and assignedTo locally
        // This will trigger a re-render and hide the AssignRecruiter action
        client.assignedRecruiterID = data.recruiterId;

        // Extract recruiter name from the success message
        // The message format is: "Recruiter {Name} assigned successfully"
        const recruiterNameMatch = result.message.match(
          /Recruiter (.+?) assigned successfully/
        );
        if (recruiterNameMatch && recruiterNameMatch[1]) {
          client.assignedTo = recruiterNameMatch[1];
        }

        setAssignRecruiterDialogOpen(false);
      } else {
        console.error("Failed to assign recruiter:", result.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error in recruiter assignment process:", error);
      // You might want to show an error message to the user here
    }
  };
  */

  const getAssignedPersonDisplay = () => {
    // For sales stage, show sales person; for other stages, show recruiter
    if (client.status === "sales") {
      // In sales stage, we want to show the sales person
      // The assignedTo field should contain sales person info for sales stage
      return client.assignedTo || "Unassigned";
    } else {
      // For marketing, resume, and other stages, show recruiter info
      // The assignedTo field should contain recruiter info for other stages
      return client.assignedTo || "Unassigned";
    }
  };

  const getStatusBadgeColor = (status: ClientStatus) => {
    switch (status) {
      case "sales":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "resume":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "marketing":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "placed":
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

  // Get required actions for the current stage
  let requiredActions = getRequiredActions(client.status, currentUserRole);
  let optionalActions: string[] = [];

  // Note: AssignRecruiter is now handled in constants.ts getRequiredActions()
  // No need to add it here to avoid duplication

  if (
    (client.status === "marketing" || client.status === "remarketing") &&
    ["marketing-manager", "admin"].includes(currentUserRole) &&
    client.assignedRecruiterID // Only show ChangeRecruiter if recruiter is already assigned
  ) {
    optionalActions = [...optionalActions, "ChangeRecruiter"];
  }

  // Progress calculation ONLY considers required actions (not optional ones)
  const completedActions = requiredActions.filter((action) => {
    // Special handling for AssignRecruiter: consider it completed if client has a recruiter
    if (action === "AssignRecruiter" && client.assignedRecruiterID) {
      return true; // Count as completed if recruiter is assigned
    }

    // Check if action is completed in departments structure
    const departments = normalizeDepartments(client.departments);

    return departments.some(
      (dept) =>
        dept &&
        dept.actions &&
        Array.isArray(dept.actions) &&
        dept.actions.some(
          (act) =>
            act && act.actionType === action && act.status === "completed"
        )
    );
  }).length;
  const totalActions = requiredActions.length;
  // Check if all required actions are completed (optional actions don't affect this)
  const allActionsCompleted =
    requiredActions.length === 0 ||
    requiredActions.every((action) => {
      // Special handling for AssignRecruiter: consider it completed if client has a recruiter
      if (action === "AssignRecruiter" && client.assignedRecruiterID) {
        return true; // Count as completed if recruiter is assigned
      }

      // Check if action is completed in departments structure
      const departments = normalizeDepartments(client.departments);

      return departments.some(
        (dept) =>
          dept &&
          dept.actions &&
          Array.isArray(dept.actions) &&
          dept.actions.some(
            (act) =>
              act && act.actionType === action && act.status === "completed"
          )
      );
    });

  const config = stageConfig[currentStage || client.status];

  // Debug logging for highlighting
  if (isSelected) {
    console.log("🎨 Highlighting debug:", {
      clientName: client.name,
      clientStatus: client.status,
      currentStage: currentStage,
      usedStage: currentStage || client.status,
      configColor: config.color,
      configBgColor: config.bgColor,
      ringColor: config.color.replace("bg-", "ring-"),
      bgColor: config.bgColor.replace("bg-", "bg-") + "/50",
    });
  }

  return (
    <Card
      className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md group relative ${
        isDragging ? "opacity-50 rotate-2" : ""
      } ${isHovered ? "scale-[1.02] shadow-lg" : ""} ${
        isSelected
          ? `ring-2 ${config.color.replace(
              "bg-",
              "ring-"
            )} ${config.bgColor.replace("bg-", "bg-")}/50`
          : ""
      } ${
        !canMoveClient(client, currentUserRole) &&
        currentUserRole !== "Admin" &&
        currentUserRole !== "Marketing_Manager"
          ? "border-orange-200 bg-orange-50/30"
          : ""
      }`}
      draggable={canMoveClient(client, currentUserRole)}
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      style={{ cursor: enableCardClick ? "pointer" : "default" }}
    >
      {/* Drag Handle */}
      {canMoveClient(client, currentUserRole) && (
        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
      )}

      {/* Can't Move Indicator */}
      {!canMoveClient(client, currentUserRole) &&
        currentUserRole !== "Admin" &&
        currentUserRole !== "Marketing_Manager" && (
          <div
            className="absolute left-1 top-1/2 transform -translate-y-1/2"
            title="Complete all actions to enable moving"
          >
            <Clock className="w-3 h-3 text-orange-500" />
          </div>
        )}

      <div className="flex items-start justify-between">
        <div className="flex-1 ml-2 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarFallback className="text-xs">
                {client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 break-words leading-tight">
                {client.name}
              </p>
            </div>
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
              {localPriority && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    localPriority === "exceptional"
                      ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                      : localPriority === "real-time"
                      ? "border-blue-300 text-blue-700 bg-blue-50"
                      : localPriority === "fresher"
                      ? "border-green-300 text-green-700 bg-green-50"
                      : "border-gray-300 text-gray-700 bg-gray-50"
                  }`}
                >
                  {localPriority === "exceptional"
                    ? "⭐ Exceptional"
                    : localPriority === "real-time"
                    ? "⚡ Real Time"
                    : localPriority === "fresher"
                    ? "🌱 Fresher"
                    : "Standard"}
                </Badge>
              )}
            </div>

            {/* TODO: SLA Status Indicator temporarily commented out */}
            {/* SLA Status Indicator - Only show for active pipeline stages */}
            {/* 
            {slaStatus &&
              slaStatus.status !== "completed" &&
              !["placed", "on-hold", "backed-out"].includes(client.status) && (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${getSLAStatusColor(
                    slaStatus.status
                  )}`}
                >
                  <span>{getSLAStatusIcon(slaStatus.status)}</span>
                  {slaStatus.status === "overdue"
                    ? `${slaStatus.daysOverdue} days overdue`
                    : slaStatus.status === "warning"
                    ? `${slaStatus.daysRemaining.toFixed(1)} days left`
                    : "On track"}
                </div>
              )}
            */}
          </div>

          <div className="mb-2">
            <p className="text-xs text-muted-foreground break-words leading-tight">
              {client.status === "sales" || client.status === "resume"
                ? "Sales Person"
                : "Recruiter"}
              :{" "}
              <span className="font-medium text-gray-700">
                {getAssignedPersonDisplay()}
              </span>
            </p>
          </div>

          {/* Progress Indicator - Only Required Actions */}
          {totalActions > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Required Actions Progress</span>
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
          <div
            className="space-y-1 mb-2"
            data-actions="true"
            data-ignore-card-click="true"
          >
            <div className="text-xs text-muted-foreground mb-1 font-medium">
              Required Actions{" "}
              {!allActionsCompleted ? "(click to complete)" : "(all completed)"}
              :
            </div>
            {requiredActions.map((action: string, index: number) => {
              // Helper function to check if an action is completed
              const isActionCompleted = (actionType: string): boolean => {
                if (
                  actionType === "AssignRecruiter" &&
                  client.assignedRecruiterID
                ) {
                  return true; // Consider AssignRecruiter completed if recruiter assigned
                }

                // Add safety checks for departments data structure
                const departments = normalizeDepartments(client.departments);

                const result = departments.some((dept) => {
                  if (!dept || !dept.actions) {
                    return false;
                  }

                  // Handle Entity Framework $values format
                  let actions = dept.actions;
                  if (
                    dept.actions &&
                    typeof dept.actions === "object" &&
                    (dept.actions as any).$values &&
                    Array.isArray((dept.actions as any).$values)
                  ) {
                    actions = (dept.actions as any).$values;
                  } else if (Array.isArray(dept.actions)) {
                    actions = dept.actions;
                  }

                  return actions.some(
                    (act) =>
                      act &&
                      act.actionType === actionType &&
                      act.status === "completed"
                  );
                });

                return result;
              };

              // Special handling for AssignRecruiter: consider it completed if client has a recruiter
              let isCompleted = isActionCompleted(action);
              if (action === "AssignRecruiter" && client.assignedRecruiterID) {
                isCompleted = true; // Auto-complete if recruiter is assigned
              }

              // Check if previous actions are completed (sequential enforcement)
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

          {/* Optional Actions Section */}
          {optionalActions.length > 0 && (
            <div
              className="space-y-1 mb-2"
              data-actions="true"
              data-ignore-card-click="true"
            >
              <div className="text-xs text-muted-foreground mb-1 font-medium">
                Optional Actions:
              </div>
              {optionalActions.map((action: string) => {
                const isCompleted = (() => {
                  // Add safety checks for departments data structure
                  const departments = normalizeDepartments(client.departments);

                  return departments.some(
                    (dept) =>
                      dept &&
                      dept.actions &&
                      Array.isArray(dept.actions) &&
                      dept.actions.some(
                        (act) =>
                          act &&
                          act.actionType === action &&
                          act.status === "completed"
                      )
                  );
                })();
                const actionDisplayName = action.includes("-")
                  ? action.split("-")[0]
                  : action;

                // Permission checks handled by unified backend system

                return (
                  <Button
                    key={action}
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-2 text-xs h-6 p-1 w-full justify-start ${
                      isCompleted
                        ? "opacity-75 bg-blue-50 hover:bg-blue-100"
                        : "hover:bg-purple-50 border border-dashed border-purple-200"
                    }`}
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isCompleted) {
                        handleActionClick(action);
                      }
                    }}
                    disabled={isCompleted}
                  >
                    <div
                      className={`w-3 h-3 rounded flex items-center justify-center ${
                        isCompleted ? "bg-blue-500" : "border border-gray-300"
                      }`}
                    >
                      {isCompleted && <Check className="w-2 h-2 text-white" />}
                    </div>
                    <span
                      className={`break-words leading-tight ${
                        isCompleted
                          ? "line-through text-blue-700"
                          : "text-purple-700"
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
          )}

          <div className="mt-2">
            <p className="text-xs text-muted-foreground break-words leading-tight">
              Updated:{" "}
              <span className="font-medium text-gray-700">
                {formatDateEST(client.lastUpdated)}
              </span>
            </p>
          </div>
        </div>

        {/* Fallback Actions Menu - Only show when all actions are completed */}
        {allActionsCompleted && (
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                        Move to {config.title}
                      </DropdownMenuItem>
                    );
                  }
                )}
              {canMoveClient(client, currentUserRole) &&
                getAvailableStages(client.status, currentUserRole).length >
                  0 && <DropdownMenuSeparator />}

              {/* Resume Confirmation Actions - Only show for Resume_Writer when all actions completed */}
              {currentUserRole === "Resume_Writer" &&
                client.status === "resume" &&
                allActionsCompleted && (
                  <>
                    <DropdownMenuItem
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleActionClick("Resume Draft Completed");
                      }}
                    >
                      <Check className="w-3 h-3 mr-2" />
                      Resume Draft Completed
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

              {currentUserRole === "Resume_Writer" &&
                client.status === "resume" &&
                allActionsCompleted && (
                  <>
                    <DropdownMenuItem
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleActionClick("Documents Uploaded");
                      }}
                    >
                      <Check className="w-3 h-3 mr-2" />
                      Documents Uploaded
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

              {/* View Details removed - click anywhere on card to view details */}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

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
          onSuccess={async (result?: any) => {
            console.log("🎯 UnifiedActionDialog onSuccess called with result:", result);
            console.log("🎯 Selected action was:", selectedUnifiedAction);
            console.log("🎯 API returned actionCompleted:", result?.actionCompleted);
            console.log("🎯 Client departments before update:", client.departments);
            
            // Debug all available actions in departments
            if (client.departments) {
              client.departments.forEach((dept: any, deptIndex: number) => {
                console.log(`🔍 Department ${deptIndex} (${dept.department}):`, dept);
                if (dept.actions && Array.isArray(dept.actions)) {
                  dept.actions.forEach((action: any, actionIndex: number) => {
                    console.log(`  Action ${actionIndex}: ${action.actionType} (status: ${action.status})`);
                  });
                }
              });
            }
            
            // Handle the unified backend response
            if (result && result.stageTransitioned && result.newStage) {
              // Backend automatically transitioned the client - move in frontend too
              console.log(
                `🚀 Backend transitioned client ${client.id} to ${result.newStage}`
              );
              console.log("🔄 Stage transition result:", result);

              // Use the backend's unified transition handling - skip backend call since it already happened
              onMoveClient(client.id, result.newStage as any, true);
            } else {
              // Regular action completion without transition
              // Fetch fresh client data from backend to ensure departments are up-to-date
              console.log("🔄 Fetching fresh client data after action completion...");
              try {
                const freshClientData = await getPipelineCandidateById(client.id);
                console.log("✅ Fresh client data received:", freshClientData);
                console.log("✅ Fresh client departments:", freshClientData.departments);
                
                // Debug fresh client departments
                if (freshClientData.departments) {
                  freshClientData.departments.forEach((dept: any, deptIndex: number) => {
                    console.log(`🔍 Fresh Department ${deptIndex} (${dept.department}):`, dept);
                    console.log(`🔍 Department actions property:`, dept.actions);
                    
                    // Handle Entity Framework serialization
                    let actions = dept.actions;
                    if (dept.actions && typeof dept.actions === "object" && dept.actions.$values) {
                      actions = dept.actions.$values;
                      console.log(`🔍 Using $values format:`, actions);
                    }
                    
                    if (actions && Array.isArray(actions)) {
                      actions.forEach((action: any, actionIndex: number) => {
                        console.log(`  Fresh Action ${actionIndex}: ${action.actionType} (status: ${action.status})`);
                      });
                    } else {
                      console.log(`❌ Actions is not an array:`, typeof actions, actions);
                    }
                  });
                } else {
                  console.log("❌ Fresh client data still has no departments!");
                }
                
                if (onClientUpdate) {
                  // Use fresh data from backend instead of manual updates
                  onClientUpdate(freshClientData);
                } else {
                  // Fallback to action completion callback
                  const completedActionType = result?.actionCompleted || selectedUnifiedAction;
                  await onActionComplete(client.id, completedActionType, {
                    comment: result?.message || "Action completed via unified system",
                  });
                }
              } catch (error) {
                console.error("❌ Error fetching fresh client data:", error);
                // Fallback to the original manual update approach
                if (onClientUpdate) {
                  // Create a deep copy of the client
                  const updatedClient = JSON.parse(JSON.stringify(client));

                  // Update the priority if provided
                  if (result?.additionalData?.updatedPriority) {
                    updatedClient.priority =
                      result.additionalData.updatedPriority;
                  }

                  // Find and update the specific action in departments
                  if (updatedClient.departments) {
                    const departments = normalizeDepartments(
                      updatedClient.departments
                    );
                    departments.forEach((dept: any) => {
                      if (dept && dept.actions) {
                        let actions = dept.actions;
                        // Handle Entity Framework $values format
                        if (
                          dept.actions &&
                          typeof dept.actions === "object" &&
                          (dept.actions as any).$values
                        ) {
                          actions = (dept.actions as any).$values;
                        } else if (Array.isArray(dept.actions)) {
                          actions = dept.actions;
                        }

                        // Find and update the specific action using API response
                        const completedActionType = result?.actionCompleted || selectedUnifiedAction;
                        console.log("🔍 Looking for action:", completedActionType, "in actions:", actions);
                        
                        const actionToUpdate = actions.find(
                          (act: any) =>
                            act && act.actionType === completedActionType
                        );

                        console.log("🔍 Found action to update:", actionToUpdate);

                        if (actionToUpdate) {
                          console.log("✅ Updating action status to completed");
                          actionToUpdate.status = "completed";
                          actionToUpdate.timestamp = new Date().toISOString();
                          actionToUpdate.performedBy = "System"; // Or get from user context
                          actionToUpdate.performedByRole = "system";
                        } else {
                          console.log("❌ Action not found in department actions");
                        }
                      }
                    });
                  }

                  // Update the client with modified data
                  onClientUpdate(updatedClient);
                } else {
                  // Fallback to local action completion if no onClientUpdate prop
                  const completedActionType = result?.actionCompleted || selectedUnifiedAction;
                  await onActionComplete(client.id, completedActionType, {
                    comment: result?.message || "Action completed via unified system",
                  });
                }
              }

              // Update local priority state for immediate UI feedback
              if (
                selectedUnifiedAction === "RateCandidate" &&
                result?.additionalData?.updatedPriority
              ) {
                setLocalPriority(result.additionalData.updatedPriority);
              }
            }

            // Reset dialog state
            setUnifiedActionDialogOpen(false);
            setSelectedUnifiedAction("");
          }}
        />
      )}
    </Card>
  );
});
