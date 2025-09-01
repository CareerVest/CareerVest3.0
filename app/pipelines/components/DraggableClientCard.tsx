import React, { useState, useEffect } from "react";
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
  getActionPrerequisites,
} from "./constants";
import { ActionDialog } from "./ActionDialog";
import { ResumeCompletedDialog } from "./ResumeCompletedDialog";
import { PriorityDialog } from "./PriorityDialog";
import { AssignRecruiterDialog } from "./AssignRecruiterDialog";
import {
  assignRecruiterToClient,
  updateClientPriority,
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
  currentUserRole: UserRole;
  isDragging?: boolean;
  isSelected?: boolean;
  currentStage?: ClientStatus;
}

export function DraggableClientCard({
  client,
  onMoveClient,
  onViewDetails,
  onActionComplete,
  onTransitionAction,
  currentUserRole,
  isDragging = false,
  isSelected = false,
  currentStage,
}: DraggableClientCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [resumeCompletedDialogOpen, setResumeCompletedDialogOpen] =
    useState(false);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [assignRecruiterDialogOpen, setAssignRecruiterDialogOpen] =
    useState(false);
  const [selectedRecruiterAction, setSelectedRecruiterAction] =
    useState<string>("");
  const [localPriority, setLocalPriority] = useState(client.priority);

  // Sync localPriority when client prop changes
  useEffect(() => {
    setLocalPriority(client.priority);
  }, [client.priority]);

  // Calculate SLA status for current stage
  const departmentTime = calculateDepartmentTime(client);
  const currentStageData = departmentTime.find((dept) => dept.current);
  const slaStatus = currentStageData
    ? getSLAStatus(
        client.status, // Use client.status directly for consistency
        currentStageData.businessDays || currentStageData.days,
        true
      )
    : null;

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

  const handleActionClick = (action: string) => {
    // Check if user can perform this action in this stage
    const canPerform = canPerformAction(
      action as ActionType,
      currentUserRole,
      client,
      client.status
    );

    if (!canPerform) {
      console.log(
        `🚫 Action ${action} blocked for ${currentUserRole} in ${client.status} stage`
      );
      return; // Don't allow action if user doesn't have permission
    }

    // Check if this is a transition action
    if (action.startsWith("Upload Required Docs") && onTransitionAction) {
      // This is a transition action, handle it differently
      const nextStage = client.status === "sales" ? "resume" : "marketing";
      onTransitionAction(client, client.status, nextStage);
      return;
    }

    // Check if this is the Resume Completed action
    if (action === "Resume Completed") {
      setResumeCompletedDialogOpen(true);
      return;
    }

    // Check if this is the Rate Candidate action
    if (action === "RateCandidate") {
      setPriorityDialogOpen(true);
      return;
    }

    // Check if this is the Assign Recruiter action
    if (action === "AssignRecruiter") {
      setSelectedRecruiterAction("AssignRecruiter");
      setAssignRecruiterDialogOpen(true);
      return;
    }

    // Check if this is the Change Recruiter action
    if (action === "ChangeRecruiter") {
      setSelectedRecruiterAction("ChangeRecruiter");
      setAssignRecruiterDialogOpen(true);
      return;
    }

    setSelectedAction(action);
    setActionDialogOpen(true);
  };

  const handleActionSubmit = async (data: { comment: string; file?: File }) => {
    console.log(
      "🔄 Submitting action:",
      selectedAction,
      "for client:",
      client.id
    );
    await onActionComplete(client.id, selectedAction, data);
    setActionDialogOpen(false);
    setSelectedAction("");
  };

  const handleResumeCompletedSubmit = async (data: {
    comment: string;
    draftedResume: File;
  }) => {
    console.log("🔄 Submitting Resume Completed action for client:", client.id);
    // Convert to the format expected by onActionComplete
    const actionData = {
      comment: data.comment,
      file: data.draftedResume, // Use drafted resume as the main file
    };
    await onActionComplete(client.id, "Resume Completed", actionData);
    setResumeCompletedDialogOpen(false);
  };

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
        const recruiterNameMatch = result.message.match(/Recruiter (.+?) assigned successfully/);
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

  const getAssignedPersonDisplay = () => {
    // Debug logging to see what data we have
    console.log("🔍 Client assignment debug:", {
      status: client.status,
      assignedTo: client.assignedTo,
      priority: localPriority,
      clientId: client.id,
    });

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

  // Add ChangeRecruiter as an optional action ONLY for marketing clients WITH assigned recruiters
  console.log("🔍 Client data for ChangeRecruiter check:", {
    id: client.id,
    name: client.name,
    status: client.status,
    assignedRecruiterID: client.assignedRecruiterID,
    assignedRecruiterIDType: typeof client.assignedRecruiterID,
    hasAccess: ["marketing-manager", "admin"].includes(currentUserRole),
    isMarketingStage:
      client.status === "marketing" || client.status === "remarketing",
  });

  if (
    (client.status === "marketing" || client.status === "remarketing") &&
    ["marketing-manager", "admin"].includes(currentUserRole) &&
    client.assignedRecruiterID // Only show ChangeRecruiter if recruiter is already assigned
  ) {
    console.log(
      "✅ Adding ChangeRecruiter action for marketing client WITH assigned recruiter"
    );
    optionalActions = [...optionalActions, "ChangeRecruiter"];
  }

  console.log("🔍 Required actions before filtering:", requiredActions);
  console.log("🔍 Optional actions:", optionalActions);

  // Filter required actions based on stage access permissions
  requiredActions = requiredActions.filter((action) => {
    const canPerform = canPerformAction(
      action as ActionType,
      currentUserRole,
      client,
      client.status
    );

    if (!canPerform) {
      console.log(
        `🚫 Required action ${action} blocked for ${currentUserRole} in ${client.status} stage`
      );
    } else {
      console.log(
        `✅ Required action ${action} allowed for ${currentUserRole} in ${client.status} stage`
      );
    }

    return canPerform;
  });

  // Filter optional actions based on stage access permissions
  optionalActions = optionalActions.filter((action) => {
    const canPerform = canPerformAction(
      action as ActionType,
      currentUserRole,
      client,
      client.status
    );

    if (!canPerform) {
      console.log(
        `🚫 Optional action ${action} blocked for ${currentUserRole} in ${client.status} stage`
      );
    } else {
      console.log(
        `✅ Optional action ${action} allowed for ${currentUserRole} in ${client.status} stage`
      );
    }

    return canPerform;
  });

  console.log("🔍 Required actions after filtering:", requiredActions);
  console.log("🔍 Optional actions after filtering:", optionalActions);

  // Progress calculation ONLY considers required actions (not optional ones)
  const completedActions = requiredActions.filter((action) => {
    // Special handling for AssignRecruiter: consider it completed if client has a recruiter
    if (action === "AssignRecruiter" && client.assignedRecruiterID) {
      return true; // Count as completed if recruiter is assigned
    }
    return client.completedActions.includes(action);
  }).length;
  const totalActions = requiredActions.length;
  // Check if all required actions are completed (optional actions don't affect this)
  const allActionsCompleted =
    requiredActions.length === 0 ||
    requiredActions.every((action) => client.completedActions.includes(action));

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
              <span className="text-sm font-medium text-gray-900 break-words leading-tight">
                {client.name}
              </span>
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

            {/* SLA Status Indicator - Only show for active pipeline stages */}
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
          </div>

          <div className="mb-2">
            <p className="text-xs text-muted-foreground break-words leading-tight">
              {client.status === "sales" ? "Sales Person" : "Recruiter"}:{" "}
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
          <div className="space-y-1 mb-2">
            <div className="text-xs text-muted-foreground mb-1 font-medium">
              Required Actions{" "}
              {!allActionsCompleted ? "(click to complete)" : "(all completed)"}
              :
            </div>
            {requiredActions.map((action: string) => {
              // Special handling for AssignRecruiter: consider it completed if client has a recruiter
              let isCompleted = client.completedActions.includes(action);
              if (action === "AssignRecruiter" && client.assignedRecruiterID) {
                isCompleted = true; // Auto-complete if recruiter is assigned
              }

              const actionDisplayName = action.includes("-")
                ? action.split("-")[0]
                : action;

              // Check if user can perform this action based on role
              const canPerform = canPerformAction(
                action as ActionType,
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

              // Get prerequisite information for disabled actions
              const prerequisites = isDisabled
                ? getActionPrerequisites(action, client.status, currentUserRole)
                : [];

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
                      handleActionClick(action);
                    }
                  }}
                  disabled={isCompleted || !canPerform || isDisabled}
                  title={
                    isDisabled && prerequisites.length > 0
                      ? `Complete these actions first: ${prerequisites.join(
                          ", "
                        )}`
                      : ""
                  }
                >
                  <div
                    className={`w-3 h-3 rounded flex items-center justify-center ${
                      isCompleted ? "bg-green-500" : "border border-gray-300"
                    }`}
                  >
                    {isCompleted && <Check className="w-2 h-2 text-white" />}
                  </div>
                  <span
                    className={`break-words leading-tight ${
                      isCompleted
                        ? "line-through text-green-700"
                        : !canPerform || isDisabled
                        ? "text-gray-500"
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
            <div className="space-y-1 mb-2">
              <div className="text-xs text-muted-foreground mb-1 font-medium">
                Optional Actions:
              </div>
              {optionalActions.map((action: string) => {
                const isCompleted = client.completedActions.includes(action);
                const actionDisplayName = action.includes("-")
                  ? action.split("-")[0]
                  : action;

                // Check if user can perform this action based on role
                const canPerform = canPerformAction(
                  action as ActionType,
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
                        ? "opacity-75 bg-blue-50 hover:bg-blue-100"
                        : !canPerform || isDisabled
                        ? "opacity-50 bg-gray-50 cursor-not-allowed"
                        : "hover:bg-purple-50 border border-dashed border-purple-200"
                    }`}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (!isCompleted && canPerform && !isDisabled) {
                        handleActionClick(action);
                      }
                    }}
                    disabled={isCompleted || !canPerform || isDisabled}
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
                          : !canPerform || isDisabled
                          ? "text-gray-500"
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
              getAvailableStages(client.status, currentUserRole).length > 0 && (
                <DropdownMenuSeparator />
              )}
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
          requiresComments={
            selectedAction === "Initial Call Done" ||
            selectedAction === "Resume Completed"
          }
        />
      )}

      {/* Resume Completed Dialog */}
      {resumeCompletedDialogOpen && (
        <ResumeCompletedDialog
          isOpen={resumeCompletedDialogOpen}
          onClose={() => setResumeCompletedDialogOpen(false)}
          onSubmit={handleResumeCompletedSubmit}
          clientName={client.name}
        />
      )}

      {/* Priority Dialog */}
      {priorityDialogOpen && (
        <PriorityDialog
          isOpen={priorityDialogOpen}
          onClose={() => setPriorityDialogOpen(false)}
          onSubmit={handlePrioritySubmit}
          clientName={client.name}
          currentPriority={localPriority}
        />
      )}

      {/* Assign Recruiter Dialog */}
      {assignRecruiterDialogOpen && (
        <AssignRecruiterDialog
          isOpen={assignRecruiterDialogOpen}
          onClose={() => setAssignRecruiterDialogOpen(false)}
          onSubmit={handleAssignRecruiterSubmit}
          clientName={client.name}
          currentRecruiterId={client.assignedRecruiterID}
          isChangeRecruiter={selectedRecruiterAction === "ChangeRecruiter"}
        />
      )}
    </Card>
  );
}
