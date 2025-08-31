import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, LayoutGrid, X, AlertTriangle } from "lucide-react";
import {
  Client,
  ClientStatus,
  UserRole,
  ActionType,
} from "../../types/pipelines/pipeline";
import { mainStages, specialStates } from "./constants";
import {
  canMoveClient,
  getAvailableStages,
  shouldResetActions,
  getActionsToReset,
} from "./utils";
import { DroppableStage } from "./DroppableStage";
import { DepartmentCounts } from "./DepartmentCounts";
import { MultiFileUploadDialog, FileUpload } from "./MultiFileUploadDialog";
import { formatDateEST, getCurrentDateEST } from "../../utils/dateUtils";
import {
  isTransitionRequiringDocuments,
  getTransitionRequirement,
  getFileRequirementsForTransition,
  canUserPerformTransition,
} from "./documentRequirements";
import {
  fetchPipelineCandidates,
  movePipelineCandidate,
  completePipelineAction,
  completeTransitionAction,
} from "../actions/pipelineActions";

interface PipelineProps {
  currentUserRole: UserRole;
  onClientSelect?: (client: Client) => void;
  isSidebarOpen?: boolean;
}

export function Pipeline({
  currentUserRole,
  onClientSelect,
  isSidebarOpen = false,
}: PipelineProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ClientStatus | "all">("all");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [multiFileDialog, setMultiFileDialog] = useState<{
    isOpen: boolean;
    client: Client | null;
    fromStage: ClientStatus | null;
    toStage: ClientStatus | null;
  }>({
    isOpen: false,
    client: null,
    fromStage: null,
    toStage: null,
  });

  // Fetch pipeline candidates on component mount
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        setError(null);
        const candidates = await fetchPipelineCandidates();
        setClients(candidates);
        console.log("✅ Loaded pipeline candidates:", candidates.length);
      } catch (err: any) {
        console.error("❌ Error loading pipeline candidates:", err);
        setError(err.message || "Failed to load pipeline candidates");
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, []);

  const getClientsForStatus = (status: ClientStatus) => {
    let filteredClients = clients.filter((client) => client.status === status);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredClients = filteredClients.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.assignedTo.toLowerCase().includes(query) ||
          client.notes.toLowerCase().includes(query)
      );
    }

    return filteredClients;
  };

  const moveClient = async (clientId: string, newStatus: ClientStatus) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    // Check if this transition requires documents
    if (isTransitionRequiringDocuments(client.status, newStatus)) {
      // Check if user can perform this transition
      if (
        !canUserPerformTransition(client.status, newStatus, currentUserRole)
      ) {
        console.log("❌ User cannot perform this transition");
        return;
      }

      // Open the multi-file upload dialog for the transition
      setMultiFileDialog({
        isOpen: true,
        client: client,
        fromStage: client.status,
        toStage: newStatus,
      });
      return;
    }

    try {
      // Call the API to move the client
      await movePipelineCandidate(clientId, newStatus, currentUserRole);

      // Check if we need to reset actions (moving backwards)
      const needsActionReset = shouldResetActions(client.status, newStatus);
      const actionsToReset = needsActionReset
        ? getActionsToReset(client.status, newStatus)
        : [];

      // Update local state
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId
            ? {
                ...client,
                status: newStatus,
                lastUpdated: getCurrentDateEST(),
                // Reset completed actions if moving backwards
                completedActions: needsActionReset
                  ? client.completedActions.filter(
                      (action) => !actionsToReset.includes(action)
                    )
                  : client.completedActions,
              }
            : client
        )
      );

      if (needsActionReset) {
        console.log(
          "🔄 Reset actions for client moving backwards:",
          actionsToReset
        );
      }

      console.log("✅ Moved client", clientId, "to", newStatus);
    } catch (err: any) {
      console.error("❌ Error moving client:", err);
      // You might want to show a toast notification here
    }
  };

  const handleMultiFileUpload = async (data: {
    comments: string;
    files: FileUpload[];
  }) => {
    if (
      !multiFileDialog.client ||
      !multiFileDialog.fromStage ||
      !multiFileDialog.toStage
    )
      return;

    const transitionRequirement = getTransitionRequirement(
      multiFileDialog.fromStage,
      multiFileDialog.toStage
    );

    if (!transitionRequirement) return;

    try {
      // First complete the required action with multiple files
      await completeTransitionAction(
        multiFileDialog.client.id,
        transitionRequirement.actionName,
        currentUserRole,
        {
          comment: data.comments,
          files: data.files,
        }
      );

      // Move the client to the new stage
      await movePipelineCandidate(
        multiFileDialog.client.id,
        multiFileDialog.toStage,
        currentUserRole
      );

      // Check if we need to reset actions (moving backwards)
      const needsActionReset = shouldResetActions(
        multiFileDialog.client!.status,
        multiFileDialog.toStage!
      );
      const actionsToReset = needsActionReset
        ? getActionsToReset(
            multiFileDialog.client!.status,
            multiFileDialog.toStage!
          )
        : [];

      // Update local state
      setClients((prev) =>
        prev.map((client) =>
          client.id === multiFileDialog.client!.id
            ? {
                ...client,
                status: multiFileDialog.toStage!,
                lastUpdated: getCurrentDateEST(),
                completedActions: needsActionReset
                  ? [transitionRequirement.actionName] // Only keep the transition action
                  : [
                      ...client.completedActions,
                      transitionRequirement.actionName,
                    ],
                notes:
                  client.notes +
                  `\n${formatDateEST(new Date())} - ${
                    transitionRequirement.actionName
                  }: ${data.comments}`,
                // Add documents to tracking
                documents: [
                  ...client.documents,
                  ...data.files.map((fileUpload, index) => ({
                    id: `${client.id}-${fileUpload.id}-${Date.now()}-${index}`,
                    name: fileUpload.file.name,
                    type: fileUpload.file.type || "application/octet-stream",
                    uploadedAt: getCurrentDateEST(),
                    uploadedBy: "Current User",
                    fileSize: fileUpload.file.size,
                    notes: fileUpload.label,
                  })),
                ],
                // Add action to history
                actionHistory: [
                  ...client.actionHistory,
                  {
                    id: `${client.id}-${Date.now()}`,
                    clientId: client.id,
                    actionType: transitionRequirement.actionName as ActionType,
                    performedBy: "Current User",
                    performedByRole: currentUserRole,
                    timestamp: getCurrentDateEST(),
                    comment: data.comments,
                    attachments: data.files.map((f) => f.file.name),
                  },
                ],
              }
            : client
        )
      );

      if (needsActionReset) {
        console.log(
          "🔄 Reset actions for client moving backwards via transition:",
          actionsToReset
        );
      }

      // Close the dialog
      setMultiFileDialog({
        isOpen: false,
        client: null,
        fromStage: null,
        toStage: null,
      });

      console.log(
        "✅ Completed transition for client",
        multiFileDialog.client.id,
        "from",
        multiFileDialog.fromStage,
        "to",
        multiFileDialog.toStage
      );
    } catch (err: any) {
      console.error("❌ Error completing transition:", err);
    }
  };

  const handleActionComplete = async (
    clientId: string,
    action: string,
    data: { comment: string; file?: File; additionalFiles?: File[] }
  ) => {
    try {
      console.log("🔄 Completing action:", action, "for client:", clientId);
      // Call the API to complete the action
      await completePipelineAction(
        clientId,
        action as ActionType,
        currentUserRole,
        data
      );

      // Update local state
      console.log("🔄 Adding action to completedActions:", action);
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId
            ? {
                ...client,
                completedActions: [...client.completedActions, action],
                lastUpdated: getCurrentDateEST(),
                // Update priority if this is a RateCandidate action
                priority:
                  action === "RateCandidate" &&
                  data.comment.includes("Priority: ")
                    ? (() => {
                        const priorityMatch =
                          data.comment.match(/Priority: (\w+)/);
                        if (priorityMatch) {
                          const newPriority = priorityMatch[1].toLowerCase();
                          console.log(
                            "🔄 Updating client priority to:",
                            newPriority
                          );
                          return newPriority as
                            | "exceptional"
                            | "real-time"
                            | "fresher"
                            | "standard";
                        }
                        return client.priority;
                      })()
                    : client.priority,
                notes:
                  client.notes +
                  `\n${new Date().toLocaleDateString()} - ${action}: ${
                    data.comment
                  }${data.file ? ` (File: ${data.file.name})` : ""}${
                    data.additionalFiles && data.additionalFiles.length > 0
                      ? ` (+${data.additionalFiles.length} additional files)`
                      : ""
                  }`,
                // Add document to tracking if file was uploaded
                documents: [
                  ...client.documents,
                  ...(data.file
                    ? [
                        {
                          id: `${clientId}-${Date.now()}`,
                          name: data.file.name,
                          type: data.file.type || "application/octet-stream",
                          uploadedAt: getCurrentDateEST(),
                          uploadedBy: "Current User", // In real app, get from auth context
                          fileSize: data.file.size,
                          notes: data.comment,
                        },
                      ]
                    : []),
                  ...(data.additionalFiles
                    ? data.additionalFiles.map((file, index) => ({
                        id: `${clientId}-additional-${Date.now()}-${index}`,
                        name: file.name,
                        type: file.type || "application/octet-stream",
                        uploadedAt: getCurrentDateEST(),
                        uploadedBy: "Current User", // In real app, get from auth context
                        fileSize: file.size,
                        notes: `${data.comment} - Additional Document ${
                          index + 1
                        }`,
                      }))
                    : []),
                ],
                // Add action to history
                actionHistory: [
                  ...client.actionHistory,
                  {
                    id: `${clientId}-${Date.now()}`,
                    clientId: clientId,
                    actionType: action as ActionType,
                    performedBy: "Current User", // In real app, get from auth context
                    performedByRole: currentUserRole,
                    timestamp: getCurrentDateEST(),
                    comment: data.comment,
                    attachments: [
                      ...(data.file ? [data.file.name] : []),
                      ...(data.additionalFiles
                        ? data.additionalFiles.map((f) => f.name)
                        : []),
                    ],
                  },
                ],
              }
            : client
        )
      );

      console.log("✅ Completed action", action, "for client", clientId);
    } catch (err: any) {
      console.error("❌ Error completing action:", err);
      // You might want to show a toast notification here
    }
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClientId(client.id);
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const getTotalClients = () => clients.length;
  const getActiveClients = () =>
    clients.filter((c) => !["backed-out", "completed"].includes(c.status))
      .length;

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading pipeline candidates...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-red-600 mb-2">
            Failed to load pipeline candidates
          </p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Department Counts */}
      <DepartmentCounts
        clients={clients.filter((client) => {
          if (!searchQuery) return true;
          const query = searchQuery.toLowerCase();
          return (
            client.name.toLowerCase().includes(query) ||
            client.email.toLowerCase().includes(query) ||
            client.assignedTo.toLowerCase().includes(query) ||
            client.notes.toLowerCase().includes(query)
          );
        })}
        onClientSelect={handleViewDetails}
        currentUserRole={currentUserRole}
        onMoveClient={moveClient}
        onActionComplete={handleActionComplete}
        selectedClientId={selectedClientId}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Pipeline Content - 4 Main Departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStages.map((status) => (
          <div key={status}>
            <DroppableStage
              status={status}
              clients={getClientsForStatus(status)}
              onMoveClient={moveClient}
              onViewDetails={handleViewDetails}
              onActionComplete={handleActionComplete}
              onTransitionAction={(client, fromStage, toStage) => {
                setMultiFileDialog({
                  isOpen: true,
                  client: client,
                  fromStage: fromStage,
                  toStage: toStage,
                });
              }}
              currentUserRole={currentUserRole}
              isMainStage={true}
              selectedClientId={selectedClientId}
            />
          </div>
        ))}
      </div>

      {/* Multi-File Upload Dialog */}
      {multiFileDialog.client &&
        multiFileDialog.fromStage &&
        multiFileDialog.toStage && (
          <MultiFileUploadDialog
            isOpen={multiFileDialog.isOpen}
            onClose={() =>
              setMultiFileDialog({
                isOpen: false,
                client: null,
                fromStage: null,
                toStage: null,
              })
            }
            onSubmit={handleMultiFileUpload}
            title={
              getTransitionRequirement(
                multiFileDialog.fromStage,
                multiFileDialog.toStage
              )?.title || "Complete Transition"
            }
            description={
              getTransitionRequirement(
                multiFileDialog.fromStage,
                multiFileDialog.toStage
              )?.description ||
              "Complete the required documents for this transition"
            }
            fileRequirements={getFileRequirementsForTransition(
              multiFileDialog.fromStage,
              multiFileDialog.toStage
            )}
            clientName={multiFileDialog.client.name}
            requiresComments={
              getTransitionRequirement(
                multiFileDialog.fromStage,
                multiFileDialog.toStage
              )?.requiresComments ?? true
            }
          />
        )}
    </div>
  );
}
