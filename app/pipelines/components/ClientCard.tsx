import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Client, ClientStatus, UserRole } from "../../types/pipelines/pipeline";
import { canMoveClient } from "./utils";
import { getRequiredActions } from "./constants";

interface ClientCardProps {
  client: Client;
  onMoveClient: (clientId: string, newStatus: ClientStatus) => void;
  onViewDetails: (client: Client) => void;
  currentUserRole: UserRole;
}

export function ClientCard({
  client,
  onMoveClient,
  onViewDetails,
  currentUserRole,
}: ClientCardProps) {
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback>
                {client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm truncate">{client.name}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Assigned to: {client.assignedTo}
          </p>

          {/* Stage Actions */}
          <div className="space-y-1">
            {getRequiredActions(client.status, currentUserRole).map(
              (action: string) => {
                const isCompleted = client.completedActions.includes(action);
                const actionDisplayName = action.includes("-")
                  ? action.split("-")[0]
                  : action;

                return (
                  <div key={action} className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={
                        isCompleted ? "line-through text-muted-foreground" : ""
                      }
                    >
                      {actionDisplayName
                        .replace("-", " ")
                        .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </div>
                );
              }
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Updated: {client.lastUpdated}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canMoveClient(client, currentUserRole) && (
              <>
                {client.status === "sales" && (
                  <DropdownMenuItem
                    onClick={() => onMoveClient(client.id, "resume")}
                  >
                    Move to Resume
                  </DropdownMenuItem>
                )}
                {client.status === "resume" && (
                  <DropdownMenuItem
                    onClick={() => onMoveClient(client.id, "marketing")}
                  >
                    Move to Marketing
                  </DropdownMenuItem>
                )}
                {client.status === "marketing" && (
                  <DropdownMenuItem
                    onClick={() => onMoveClient(client.id, "completed")}
                  >
                    Move to Completed
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onMoveClient(client.id, "on-hold")}
                >
                  Put On Hold
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onMoveClient(client.id, "backed-out")}
                >
                  Mark as Backed Out
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => onViewDetails(client)}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
