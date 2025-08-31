import React from "react";
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

interface SpecialStateClientActionsProps {
  client: Client;
  currentUserRole: UserRole;
  onMoveClient: (clientId: string, newStatus: ClientStatus) => void;
  onActionComplete: (
    clientId: string,
    action: string,
    data: { comment: string; file?: File; additionalFiles?: File[] }
  ) => void;
}

export function SpecialStateClientActions({
  client,
  currentUserRole,
  onMoveClient,
  onActionComplete,
}: SpecialStateClientActionsProps) {
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

    if (availableStages.includes("remarketing")) {
      actions.push({
        id: "move-to-remarketing",
        label: "Move to ReMarketing",
        icon: RotateCcw,
        color: "bg-yellow-500 hover:bg-yellow-600",
        action: () => onMoveClient(client.id, "remarketing"),
      });
    }

    if (availableStages.includes("on-hold")) {
      actions.push({
        id: "move-to-on-hold",
        label: "Move to On Hold",
        icon: Pause,
        color: "bg-gray-500 hover:bg-gray-600",
        action: () => onMoveClient(client.id, "on-hold"),
      });
    }

    if (availableStages.includes("sales")) {
      actions.push({
        id: "move-to-sales",
        label: "Restart in Sales",
        icon: ArrowRight,
        color: "bg-blue-500 hover:bg-blue-600",
        action: () => onMoveClient(client.id, "sales"),
      });
    }

    if (availableStages.includes("resume")) {
      actions.push({
        id: "move-to-resume",
        label: "Restart in Resume",
        icon: ArrowRight,
        color: "bg-orange-500 hover:bg-orange-600",
        action: () => onMoveClient(client.id, "resume"),
      });
    }

    if (availableStages.includes("marketing")) {
      actions.push({
        id: "move-to-marketing",
        label: "Resume in Marketing",
        icon: Play,
        color: "bg-green-500 hover:bg-green-600",
        action: () => onMoveClient(client.id, "marketing"),
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
  );
}
