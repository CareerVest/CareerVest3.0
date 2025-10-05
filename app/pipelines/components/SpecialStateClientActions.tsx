import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Pause,
  MoreHorizontal,
} from "lucide-react";
import { Client, ClientStatus, UserRole } from "../../types/pipelines/pipeline";
import { stageConfig } from "./constants";
import { canMoveClient, getAvailableStages } from "./utils";
import { UnifiedActionDialog } from "./UnifiedActionDialog";

interface SpecialStateClientActionsProps {
  client: Client;
  currentUserRole: UserRole;
  onMoveClient: (clientId: string, newStatus: ClientStatus, skipBackendCall?: boolean) => void;
  onActionComplete: (
    clientId: string,
    action: string,
    data: { comment: string; file?: File; additionalFiles?: File[] }
  ) => void;
  onDialogClose?: () => void;
}

export function SpecialStateClientActions({
  client,
  currentUserRole,
  onMoveClient,
  onActionComplete,
  onDialogClose,
}: SpecialStateClientActionsProps) {
  const [unifiedActionDialogOpen, setUnifiedActionDialogOpen] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState<string>("");
  
  const config = stageConfig[client.status];

  // Define available actions for each special state
  const getAvailableActions = (status: ClientStatus, userRole: UserRole) => {
    // Check if user can move this client
    if (!canMoveClient(client, userRole)) {
      return [];
    }

    // Get available stages from the permission system
    const availableStages = getAvailableStages(client.status, userRole);

    // Build actions based on available stages
    const actions = [];

    if (availableStages.includes("Remarketing")) {
      actions.push({
        id: "move-to-remarketing",
        label: "Move to ReMarketing",
        icon: RotateCcw,
        color: "bg-yellow-500 hover:bg-yellow-600",
        actionType: "Move to remarketing",
        action: () => {
          setSelectedActionType("Move to remarketing");
          setUnifiedActionDialogOpen(true);
        },
      });
    }

    if (availableStages.includes("OnHold")) {
      actions.push({
        id: "move-to-on-hold",
        label: "Move to On Hold",
        icon: Pause,
        color: "bg-gray-500 hover:bg-gray-600",
        actionType: "Move to on-hold",
        action: () => {
          setSelectedActionType("Move to on-hold");
          setUnifiedActionDialogOpen(true);
        },
      });
    }

    if (availableStages.includes("Sales")) {
      actions.push({
        id: "move-to-sales",
        label: "Restart in Sales",
        icon: ArrowRight,
        color: "bg-blue-500 hover:bg-blue-600",
        actionType: "Move to sales",
        action: () => {
          setSelectedActionType("Move to sales");
          setUnifiedActionDialogOpen(true);
        },
      });
    }

    if (availableStages.includes("Resume")) {
      actions.push({
        id: "move-to-resume",
        label: "Restart in Resume",
        icon: ArrowRight,
        color: "bg-orange-500 hover:bg-orange-600",
        actionType: "Move to resume",
        action: () => {
          setSelectedActionType("Move to resume");
          setUnifiedActionDialogOpen(true);
        },
      });
    }

    if (availableStages.includes("Marketing")) {
      actions.push({
        id: "move-to-marketing",
        label: "Resume in Marketing",
        icon: Play,
        color: "bg-green-500 hover:bg-green-600",
        actionType: "Move to marketing",
        action: () => {
          setSelectedActionType("Move to marketing");
          setUnifiedActionDialogOpen(true);
        },
      });
    }

    return actions;
  };

  const availableActions = getAvailableActions(client.status, currentUserRole);

  if (availableActions.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-xs text-muted-foreground">
          No actions available for your role
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.color}`} />
          <span className="text-xs font-medium text-muted-foreground">
            Actions:
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {availableActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                size="sm"
                variant="outline"
                className={`text-xs h-6 px-2 ${action.color} text-white border-0 hover:opacity-90`}
                onClick={action.action}
              >
                <Icon className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Unified Action Dialog */}
      {unifiedActionDialogOpen && (
        <UnifiedActionDialog
          isOpen={unifiedActionDialogOpen}
          onClose={() => {
            setUnifiedActionDialogOpen(false);
            setSelectedActionType("");
          }}
          clientId={parseInt(client.id)}
          actionType={selectedActionType}
          currentStage={client.status}
          onSuccess={async (result?: any) => {
            console.log("🎯 UnifiedActionDialog onSuccess called with result:", result);

            // Check if this is a stage transition
            const isStageTransition = selectedActionType.startsWith("Move to ");

            if (isStageTransition && result?.stageTransitioned && result?.newStage) {
              console.log("🔄 SpecialStateClientActions: Stage transition detected, calling onMoveClient...");

              // For stage transitions, use onMoveClient which handles the state properly
              // Skip backend call since UnifiedActionDialog already handled it
              onMoveClient(client.id, result.newStage, true);

              // Close the parent dialog (special state dialog) after successful transition
              if (onDialogClose) {
                console.log("🚪 Closing special state dialog after successful transition");
                onDialogClose();
              }
            } else {
              // For regular actions, call onActionComplete to update local state
              if (onActionComplete) {
                await onActionComplete(client.id, selectedActionType, {
                  comment: result?.notes || "Action completed",
                });
              }
            }

            // Reset dialog state
            setUnifiedActionDialogOpen(false);
            setSelectedActionType("");
          }}
        />
      )}
    </>
  );
}
