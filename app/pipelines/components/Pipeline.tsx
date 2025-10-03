import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, LayoutGrid, X, AlertTriangle } from "lucide-react";
import { useApiWithLoading } from "@/lib/apiWithLoading";
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
import { Stage } from "./Stage";
import { DepartmentCounts } from "./DepartmentCounts";
import { UnifiedActionDialog } from "./UnifiedActionDialog";
import { getCurrentDateEST } from "../../utils/dateUtils";
import {
  isTransitionRequiringDocuments,
  canUserPerformTransition,
} from "./documentRequirements";
import {
  fetchPipelineCandidates,
} from "../actions/pipelineActions";
import { getClient } from "../../clients/actions/clientActions";
import { showSuccess, showError, showInfo } from "@/lib/toastUtils";

interface PipelineProps {
  currentUserRole: UserRole;
  onClientSelect?: (client: Client) => void;
  isSidebarOpen?: boolean;
  onClientUpdate?: (updatedClient: Client) => void;
}

export function Pipeline({
  currentUserRole,
  onClientSelect,
  isSidebarOpen = false,
  onClientUpdate,
}: PipelineProps) {
  const { apiCall } = useApiWithLoading();
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ClientStatus | "all">("all");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Unified action dialog state for stage transitions
  const [unifiedActionDialog, setUnifiedActionDialog] = useState<{
    isOpen: boolean;
    clientId: string | null;
    actionType: string;
    currentStage: ClientStatus | null;
  }>({
    isOpen: false,
    clientId: null,
    actionType: "",
    currentStage: null,
  });

  const hasLoadedRef = useRef(false);

  // Function to refresh pipeline data
  const refreshPipelineData = async () => {
    try {
      setError(null);
      console.log("🔄 Refreshing pipeline candidates...");

      const candidates = await apiCall(fetchPipelineCandidates(), {
        showLoading: false, // Don't show loading spinner on refresh
      });

      console.log(
        `✅ Refreshed ${candidates.length} candidates`
      );

      setClients(candidates);

      // Show subtle success notification
      showInfo("Pipeline refreshed", `${candidates.length} clients loaded`);

      // Debug: Show status distribution for admin access issue investigation
      const statusCounts = candidates.reduce(
        (acc: Record<string, number>, client) => {
          acc[client.status] = (acc[client.status] || 0) + 1;
          return acc;
        },
        {}
      );
      console.log("🔍 Client status distribution after refresh:", statusCounts);
    } catch (err: any) {
      console.error("❌ Error refreshing pipeline candidates:", err);
      const errorMsg = err.message || "Failed to refresh pipeline candidates";
      setError(errorMsg);
      showError("Failed to refresh pipeline", errorMsg);
    }
  };

  // Function to update individual client in the clients array
  const updateClientInState = (updatedClient: Client) => {
    console.log("🔄 Pipeline updating client in state:", updatedClient.id);
    setClients((prev) => 
      prev.map((client) => 
        client.id === updatedClient.id ? updatedClient : client
      )
    );
    // Also notify parent component
    if (onClientUpdate) {
      onClientUpdate(updatedClient);
    }
  };

  // Fetch pipeline candidates on component mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadCandidates = async () => {
      try {
        setError(null);
        const startTime = performance.now();
        console.log("🔍 Loading pipeline candidates...");

        const candidates = await apiCall(fetchPipelineCandidates(), {
          showLoading: true,
        });

        const loadTime = performance.now() - startTime;
        console.log(
          `✅ Loaded ${candidates.length} candidates in ${loadTime.toFixed(
            2
          )}ms`
        );

        // Debug departments data
        console.log("🔍 Sample candidate departments:", candidates[0]?.departments);
        candidates.forEach((candidate, index) => {
          if (index < 3) { // Only log first 3 for brevity
            console.log(`🔍 Candidate ${index} (${candidate.name}) departments:`, candidate.departments);
          }
        });

        // Add timing for React state update and re-renders
        const renderStartTime = performance.now();
        setClients(candidates);

        // Use setTimeout to measure time after state update and re-render
        setTimeout(() => {
          const renderTime = performance.now() - renderStartTime;
          console.log(
            `🎨 React rendering completed in ${renderTime.toFixed(2)}ms`
          );
        }, 0);

        // Debug: Show status distribution for admin access issue investigation
        const statusCounts = candidates.reduce(
          (acc: Record<string, number>, client) => {
            acc[client.status] = (acc[client.status] || 0) + 1;
            return acc;
          },
          {}
        );
        console.log("🔍 Client status distribution:", statusCounts);
      } catch (err: any) {
        console.error("❌ Error loading pipeline candidates:", err);
        setError(err.message || "Failed to load pipeline candidates");
      }
    };

    loadCandidates();
  }, []);

  // Memoized searchable strings for each client to improve performance
  // Defer creation until actually needed for search to improve initial load time
  const clientsWithSearchText = useMemo(() => {
    const startTime = performance.now();

    // Only create search text if there's actually a search query
    if (!searchQuery || searchQuery.trim().length < 2) {
      console.log(
        `⚡ clientsWithSearchText: Skipped (no search query) in ${(
          performance.now() - startTime
        ).toFixed(2)}ms`
      );
      return clients;
    }

    const result = clients.map((client) => ({
      ...client,
      searchText:
        `${client.name} ${client.email} ${client.assignedTo} ${client.notes}`.toLowerCase(),
    }));

    console.log(
      `⚡ clientsWithSearchText: Processed ${clients.length} clients in ${(
        performance.now() - startTime
      ).toFixed(2)}ms`
    );
    return result;
  }, [clients, searchQuery]);

  // Memoized filtered clients to avoid recalculating on every render
  const filteredClients = useMemo(() => {
    const startTime = performance.now();
    let result = clientsWithSearchText;

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((client) => client.status === filterStatus);
    }

    // Apply search filter with optimized single string search
    // Only search if query is 2+ characters to improve performance
    if (searchQuery && searchQuery.trim().length >= 2) {
      const query = searchQuery.toLowerCase();
      result = result.filter((client) => {
        // Prioritize name matches for better UX (names are most commonly searched)
        if (client.name.toLowerCase().includes(query)) {
          return true;
        }
        // Use searchText if available, otherwise fallback to individual field searches
        if ((client as any).searchText) {
          return (client as any).searchText.includes(query);
        }
        // Fallback for when searchText is not available
        return (
          client.email.toLowerCase().includes(query) ||
          client.assignedTo.toLowerCase().includes(query) ||
          client.notes.toLowerCase().includes(query)
        );
      });
    }

    console.log(
      `⚡ filteredClients: Processed ${result.length}/${
        clientsWithSearchText.length
      } clients in ${(performance.now() - startTime).toFixed(2)}ms`
    );
    return result;
  }, [clientsWithSearchText, filterStatus, searchQuery]);

  const getClientsForStatus = useCallback(
    (status: ClientStatus) => {
      // Use memoized filtered clients instead of re-filtering
      return filteredClients.filter((client) => client.status === status);
    },
    [filteredClients]
  );

  const moveClient = async (
    clientId: string,
    newStatus: ClientStatus,
    skipBackendCall: boolean = false
  ) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    // If skipBackendCall is true, it means the backend already handled the transition
    // and we just need to update the frontend state
    if (skipBackendCall) {
      console.log(
        `🔄 Updating frontend state for client ${clientId} to ${newStatus} (backend already handled transition)`
      );

      // Update local state directly since backend already handled the transition
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId
            ? {
                ...client,
                status: newStatus,
                lastUpdated: getCurrentDateEST(),
              }
            : client
        )
      );
      return;
    }

    // Use unified action dialog for all stage transitions
    const actionType = `Move to ${newStatus}`;
    
    // Check if user can perform this transition
    if (
      isTransitionRequiringDocuments(
        client.status,
        newStatus,
        client.completedActions
      ) &&
      !canUserPerformTransition(client.status, newStatus, currentUserRole)
    ) {
      console.log("❌ User cannot perform this transition");
      return;
    }

    // Open the unified action dialog for the transition
    setUnifiedActionDialog({
      isOpen: true,
      clientId: clientId,
      actionType: actionType,
      currentStage: client.status,
    });
    return;
  };


  const handleActionComplete = async (
    clientId: string,
    action: string,
    data: { comment: string; file?: File; additionalFiles?: File[] }
  ) => {
    try {
      console.log(
        "🔄 Pipeline.handleActionComplete called with:",
        { clientId, action, data }
      );

      // Check if this is a stage transition action (Move to X)
      const isStageTransition = action.startsWith("Move to ");
      
      if (isStageTransition) {
        console.log("🔄 Stage transition detected - skipping local state update to avoid conflicts");
        console.log("🔄 Only refreshing data to get backend changes...");
        
        // For stage transitions, just refresh data - don't update local state
        await refreshPipelineData();
        return;
      }

      const client = clients.find((c) => c.id === clientId);
      console.log("🔄 Client before update:", client);
      console.log("🔄 Client departments before update:", client?.departments);

      // Only update local state here for non-transition actions.
      console.log("🔄 Adding action to completedActions:", action);
      console.log(
        "🔄 Before update - client completedActions:",
        clients.find((c) => c.id === clientId)?.completedActions
      );

      setClients((prev) => {
        const updatedClients = prev.map((client) =>
          client.id === clientId
            ? {
                ...client,
                // Update departments structure to mark action as completed
                departments: client.departments?.map(dept => 
                  dept.name === client.status 
                    ? {
                        ...dept,
                        actions: dept.actions.map(act => 
                          act.actionType === action 
                            ? { ...act, status: "completed", completedAt: getCurrentDateEST() }
                            : act
                        )
                      }
                    : dept
                ) || [],
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
                // Documents are managed by backend departments structure
                // Action history is managed by backend departments structure
              }
            : client
        );

        // Notify parent component about the client update
        if (onClientUpdate) {
          const updatedClient = updatedClients.find((c) => c.id === clientId);
          if (updatedClient) {
            onClientUpdate(updatedClient);
          }
        }

        // Log the updated client after state change
        const updatedClient = updatedClients.find((c) => c.id === clientId);
        console.log("🔄 Client after update:", updatedClient);
        console.log("🔄 Client departments after update:", updatedClient?.departments);

        return updatedClients;
      });

      console.log(
        "✅ Local state updated for action",
        action,
        "for client",
        clientId
      );
      console.log(
        "🔄 Updated client completedActions:",
        clients.find((c) => c.id === clientId)?.completedActions
      );

      // Note: Individual client refresh is now handled in DraggableClientCard
      // This general refresh is kept as a backup for any edge cases
      console.log("🔄 Refreshing general pipeline data after action completion...");
      await refreshPipelineData();
      
    } catch (err: any) {
      console.error("❌ Error completing action:", err);
      // You might want to show a toast notification here
    }
  };

  const handleViewDetails = async (client: Client) => {
    console.log("🔍 handleViewDetails called for client:", {
      id: client.id,
      name: client.name,
      status: client.status,
      currentUserRole,
    });

    setSelectedClientId(client.id);

    // Fetch detailed client data for the sidebar
    try {
      console.log("🔍 Fetching detailed client data for ID:", client.id);
      const detailedClient = await getClient(Number(client.id));
      console.log("🔍 Detailed client data received:", detailedClient);

      if (detailedClient && onClientSelect) {
        // Convert ClientDetail to Client format for the sidebar
        const enrichedClient: Client = {
          ...client,
          // Add any additional fields that might be missing
          phone: detailedClient.personalPhoneNumber || client.phone,
          email: detailedClient.personalEmailAddress || client.email,
          // Add any other fields that the sidebar might need
        };
        console.log("🔍 Enriched client data:", enrichedClient);
        onClientSelect(enrichedClient);
      } else if (onClientSelect) {
        // Fallback to original client data if detailed fetch fails
        console.log("🔍 Using fallback client data");
        onClientSelect(client);
      }
    } catch (error) {
      console.error("❌ Failed to fetch detailed client data:", error);
      // Fallback to original client data
      if (onClientSelect) {
        console.log("🔍 Using fallback client data due to error");
        onClientSelect(client);
      }
    }
  };

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Memoized client counts to avoid recalculating
  const clientCounts = useMemo(() => {
    const startTime = performance.now();

    const result = {
      total: clients.length,
      active: clients.filter(
        (c) => !["backed-out", "placed"].includes(c.status)
      ).length,
      filtered: filteredClients.length, // Add filtered count for better UX
    };

    console.log(
      `⚡ clientCounts: Calculated in ${(performance.now() - startTime).toFixed(
        2
      )}ms`
    );
    return result;
  }, [clients, filteredClients.length]);

  const getTotalClients = useCallback(
    () => clientCounts.total,
    [clientCounts.total]
  );
  const getActiveClients = useCallback(
    () => clientCounts.active,
    [clientCounts.active]
  );

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
      <div className="flex gap-3 items-center">
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
        {/* Search Results Counter */}
        {searchQuery && searchQuery.trim().length >= 2 && (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {clientCounts.filtered} results
          </div>
        )}
      </div>

      {/* Department Counts */}
      <DepartmentCounts
        clients={filteredClients}
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
            <Stage
              status={status}
              clients={getClientsForStatus(status)}
              onMoveClient={moveClient}
              onViewDetails={handleViewDetails}
              onActionComplete={handleActionComplete}
              onClientUpdate={updateClientInState}
              currentUserRole={currentUserRole}
              isMainStage={true}
              selectedClientId={selectedClientId}
            />
          </div>
        ))}
      </div>


      {/* Unified Action Dialog for Stage Transitions */}
      {unifiedActionDialog.isOpen && (
        <UnifiedActionDialog
          isOpen={unifiedActionDialog.isOpen}
          onClose={() =>
            setUnifiedActionDialog({
              isOpen: false,
              clientId: null,
              actionType: "",
              currentStage: null,
            })
          }
          clientId={parseInt(unifiedActionDialog.clientId!)}
          actionType={unifiedActionDialog.actionType}
          currentStage={unifiedActionDialog.currentStage!}
          onSuccess={async (result?: any) => {
            console.log("🎯 UnifiedActionDialog stage transition success:", result);
            
            // Check if stage was transitioned
            if (result?.stageTransitioned && result?.newStage) {
              const clientId = unifiedActionDialog.clientId;
              console.log(`🔄 Processing stage transition for client ${clientId} to ${result.newStage}`);
              
              // Log client status before refresh
              const clientBefore = clients.find(c => c.id === clientId);
              console.log(`📊 Client ${clientId} status before refresh: ${clientBefore?.status}`);
              
              // Refresh pipeline data to get the updated state from backend
              await refreshPipelineData();
              
              // Log client status after refresh
              const clientAfter = clients.find(c => c.id === clientId);
              console.log(`📊 Client ${clientId} status after refresh: ${clientAfter?.status}`);
              
              console.log(`✅ Stage transition complete: Client moved to ${result.newStage}`);
            }

            // Close the dialog
            setUnifiedActionDialog({
              isOpen: false,
              clientId: null,
              actionType: "",
              currentStage: null,
            });
          }}
        />
      )}
    </div>
  );
}
