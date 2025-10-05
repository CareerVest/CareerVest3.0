import React from "react";
import { createPortal } from "react-dom";
import { Client, UserRole, ClientDocument } from "../../types/pipelines/pipeline";
import { calculateDepartmentTime } from "./utils";
import { getAssignedPerson } from "../actions/pipelineActions";
import { getSLAStatus, getSLAStatusIcon } from "./slaConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  X,
  Activity,
  RefreshCw,
  Target,
  Clock,
  Shield,
  Mail,
  TrendingUp,
  Award,
  Zap,
  Star,
  History as HistoryIcon,
  FileText,
  MessageSquare,
  ListTodo,
  Eye,
} from "lucide-react";
import { ClientDepartmentActions } from "./ClientDepartmentActions";
import { ClientDepartmentActionsCompact } from "./ClientDepartmentActionsCompact";
import { isClientBlocked, normalizeDepartments, usePipelineActions } from "../actions/pipelineActions";
import { ClientBlockDialog } from "./ClientBlockDialog";
import { RecruiterHistoryDialog } from "./RecruiterHistoryDialog";
import { PauseCircle, PlayCircle, UserCheck, UserX, Calendar, Loader2, AlertCircle } from "lucide-react";
import {
  getRecruiterHistory,
  getActiveRecruiter,
  getRecruiterTenureDays,
} from "../actions/pipelineActions";
import type { RecruiterAssignmentHistory } from "../../types/pipelines/recruiterHistory";
import { formatDateEST } from "../../utils/dateUtils";
import { Badge } from "@/components/ui/badge";

// Inline Documents Component
function DocumentsTabContent({ client, isActive }: { client: Client; isActive: boolean }) {
  const [allDocuments, setAllDocuments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const { getClientDocuments } = usePipelineActions();

  React.useEffect(() => {
    // Only load when tab becomes active and hasn't been loaded yet
    if (!isActive || hasLoaded) return;

    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);

      try {
        const clientId = parseInt(client.id, 10);
        if (isNaN(clientId)) {
          setError("Invalid client ID");
          setLoading(false);
          return;
        }

        const response = await getClientDocuments(clientId);

        if (response.success) {
          // Handle .NET $values wrapper
          const docs = (response.documents as any)?.$values || response.documents || [];
          setAllDocuments(Array.isArray(docs) ? docs : []);
        } else {
          setError(response.message || "Failed to load documents");
          setAllDocuments([]);
        }
      } catch (err: any) {
        console.error("Error fetching documents:", err);
        setError("Failed to load documents");
        setAllDocuments([]);
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    };

    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, client.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!Array.isArray(allDocuments) || allDocuments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No documents found</p>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocumentCategoryColor = (category?: string | null) => {
    switch (category?.toLowerCase()) {
      case "resume draft":
      case "final resume":
      case "resume":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "id proof":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "visa/work authorization":
        return "bg-green-100 text-green-700 border-green-200";
      case "certificate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "education document":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-600 mb-3 uppercase">
        All Documents ({Array.isArray(allDocuments) ? allDocuments.length : 0} total)
      </h3>
      {Array.isArray(allDocuments) && allDocuments.map((doc: any) => (
        <div
          key={doc.documentID}
          className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate mb-1">{doc.name}</p>

              {/* Document Category Badge */}
              {doc.documentCategory && (
                <div className="mb-2">
                  <Badge className={`text-xs px-2 py-0.5 border ${getDocumentCategoryColor(doc.documentCategory)}`}>
                    {doc.documentCategory}
                  </Badge>
                </div>
              )}

              {/* Stage and Action Info */}
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                {doc.stageName && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded capitalize">
                    {doc.stageName}
                  </span>
                )}
                {doc.actionLabel && (
                  <>
                    <span>·</span>
                    <span>{doc.actionLabel}</span>
                  </>
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{formatFileSize(doc.fileSize)}</span>
                <span>·</span>
                <span>{formatDateEST(doc.uploadedAt)}</span>
                <span>·</span>
                <span className="truncate">by {doc.uploadedBy}</span>
              </div>

              {/* Notes if available */}
              {doc.notes && (
                <p className="mt-2 text-xs text-gray-600 italic bg-gray-50 p-2 rounded border border-gray-200">
                  {doc.notes}
                </p>
              )}
            </div>

            {/* View Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs flex-shrink-0"
              onClick={() => window.open(doc.fileSharePointURL, "_blank")}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              View
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Inline Notes Component
function NotesTabContent({ client, isActive }: { client: Client; isActive: boolean }) {
  const [allNotes, setAllNotes] = React.useState<any[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    // Only load when tab becomes active and hasn't been loaded yet
    if (!isActive || loaded) return;

    // Aggregate all notes from all departments
    const notes: any[] = [];

    if (client.departments) {
      const normalizedDepartments = normalizeDepartments(client.departments);
      normalizedDepartments.forEach((dept: any) => {
        const actions = dept.actions?.$values || dept.actions || [];
        actions.forEach((action: any) => {
          if (action.notes && action.notes.trim()) {
            notes.push({
              note: action.notes,
              departmentName: dept.displayName,
              actionLabel: action.actionLabel,
              performedBy: action.performedBy,
              timestamp: action.timestamp,
            });
          }
        });
      });
    }

    setAllNotes(notes);
    setLoaded(true);
  }, [isActive, loaded, client]);

  if (allNotes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No notes found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-600 mb-3 uppercase">
        All Notes & Comments ({allNotes.length} total)
      </h3>
      {allNotes.map((item, index) => (
        <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
          <div className="flex items-start gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-700">
                  {item.departmentName}
                </span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-600">{item.actionLabel}</span>
              </div>
              <p className="text-sm text-gray-800 mb-2">{item.note}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>{item.performedBy}</span>
                <span>·</span>
                <Calendar className="w-3 h-3" />
                <span>{formatDateEST(item.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Inline Recruiter History Component
function RecruiterHistoryInline({ clientId, clientName, isActive }: { clientId: number; clientName: string; isActive: boolean }) {
  const [loading, setLoading] = React.useState(false);
  const [history, setHistory] = React.useState<RecruiterAssignmentHistory[]>([]);
  const [activeAssignment, setActiveAssignment] = React.useState<RecruiterAssignmentHistory | null>(null);
  const [tenureDays, setTenureDays] = React.useState<number>(0);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    // Only fetch when tab becomes active and hasn't been loaded yet
    if (!isActive || loaded) return;
    fetchData();
  }, [isActive, loaded, clientId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyResponse, activeResponse, tenureResponse] = await Promise.all([
        getRecruiterHistory(clientId),
        getActiveRecruiter(clientId),
        getRecruiterTenureDays(clientId),
      ]);

      if (historyResponse.success && historyResponse.data) {
        // Ensure data is an array
        const historyData = Array.isArray(historyResponse.data)
          ? historyResponse.data
          : [];
        setHistory(historyData);
      } else {
        setHistory([]);
      }

      if (activeResponse.success && activeResponse.data) {
        setActiveAssignment(activeResponse.data);
      } else {
        setActiveAssignment(null);
      }

      if (tenureResponse.success && tenureResponse.durationInBusinessDays !== undefined) {
        setTenureDays(tenureResponse.durationInBusinessDays);
      } else {
        setTenureDays(0);
      }
    } catch (error) {
      console.error("Error fetching recruiter history:", error);
      setHistory([]);
      setActiveAssignment(null);
      setTenureDays(0);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Active Assignment */}
      {activeAssignment && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-blue-900 text-sm">Current Recruiter</h3>
            <Badge className="bg-blue-600 text-white text-xs">Active</Badge>
          </div>
          <p className="text-base font-medium text-blue-900 mb-1">
            {activeAssignment.newRecruiterName}
          </p>
          <div className="flex items-center gap-3 text-xs text-blue-700">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDateEST(activeAssignment.assignedDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{tenureDays} business days</span>
            </div>
          </div>
        </div>
      )}

      {/* History Timeline */}
      <div>
        <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase">
          Assignment History ({Array.isArray(history) ? history.length : 0} total)
        </h3>

        {!Array.isArray(history) || history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <HistoryIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No assignment history found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((record) => (
              <div
                key={record.assignmentHistoryID}
                className={`p-3 rounded-lg border ${
                  record.isActive
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {record.eventType === "initial_assignment" ? (
                      <UserCheck className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <UserX className="h-3.5 w-3.5 text-orange-600" />
                    )}
                    <span className="text-xs font-medium text-gray-700">
                      {record.eventType === "initial_assignment" ? "Initial Assignment" : "Changed"}
                    </span>
                  </div>
                  {record.isActive && (
                    <Badge className="bg-blue-600 text-white text-xs">Active</Badge>
                  )}
                </div>

                {record.eventType === "recruiter_change" && record.previousRecruiterName && (
                  <p className="text-xs text-gray-600 mb-1">
                    From: <span className="line-through">{record.previousRecruiterName}</span>
                    {record.durationInBusinessDays !== null && (
                      <span className="text-gray-500"> ({record.durationInBusinessDays}d)</span>
                    )}
                  </p>
                )}

                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {record.newRecruiterName}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDateEST(record.assignedDate)}</span>
                  </div>
                  <span>by {record.assignedBy}</span>
                </div>

                {record.notes && (
                  <p className="mt-2 text-xs text-gray-600 italic bg-white p-2 rounded border border-gray-200">
                    {record.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ClientDetailsSidebarProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  currentUserRole: UserRole;
}

export function ClientDetailsSidebar({
  client,
  isOpen,
  onClose,
  onRefresh,
  currentUserRole,
}: ClientDetailsSidebarProps) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [blockedDays, setBlockedDays] = React.useState<number>(0);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = React.useState(false);
  const [isRecruiterHistoryOpen, setIsRecruiterHistoryOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"timeline" | "history" | "documents" | "notes">("timeline");
  const [isDataLoaded, setIsDataLoaded] = React.useState(false);
  const [enrichedClient, setEnrichedClient] = React.useState<Client | null>(null);

  // Use block status from client data (already included in API response)
  const clientIsBlocked = client?.isBlocked ?? false;

  // Reset data loaded state when client changes
  React.useEffect(() => {
    if (client) {
      setIsDataLoaded(false);
      setEnrichedClient(null);
    }
  }, [client?.id]);

  // Focus the sidebar when it opens to ensure proper scroll behavior
  React.useEffect(() => {
    if (isOpen && sidebarRef.current) {
      sidebarRef.current.focus();
    }
  }, [isOpen]);

  // Blocked days and client info are now loaded from stage journey API via callback
  const handleBlockedDaysLoad = (days: number) => {
    setBlockedDays(days);
    setIsDataLoaded(true);
  };

  // Handle enriched client data from stage journey
  const handleClientDataLoad = (clientData: any) => {
    if (client && clientData) {
      setEnrichedClient({
        ...client,
        assignedRecruiterName: clientData.assignedRecruiterName,
        assignedSalesPersonName: clientData.assignedSalesPersonName,
      });
    }
  };

  const handleBlockDialogSuccess = () => {
    // Refresh data - stage journey component will re-fetch and update blocked days
    onRefresh?.();
  };

  if (!client) return null;

  // Define role-based access levels for pipeline history
  // Full access: Admin, Sales_Executive, Resume_Writer (can see all departments)
  const canAccessSensitiveInfo = ["Admin", "Sales_Executive", "Resume_Writer"].includes(currentUserRole);
  
  // Limited access: Marketing_Manager (can see marketing departments only)
  // No access: Senior_Recruiter and other roles (restricted access message)
  const canAccessMarketingInfo = ["Admin", "Sales_Executive", "Resume_Writer", "Marketing_Manager"].includes(currentUserRole);
  
  // Filter departments based on user role
  const getFilteredDepartments = (departments: any[]) => {
    if (canAccessSensitiveInfo) {
      // Full access: Admin, Sales_Executive, Resume_Writer can see all departments
      return departments;
    } else if (currentUserRole === "Marketing_Manager") {
      // Limited access: Marketing Manager can only see marketing-related departments
      // Excludes sales and resume departments for privacy/security
      return departments.filter(dept =>
        dept && (
          dept.name === "Marketing" ||
          dept.name === "Remarketing" ||
          dept.name === "Placed" ||
          dept.name === "OnHold" ||
          dept.name === "BackedOut"
        )
      );
    }
    // No access: Senior_Recruiter and other roles get empty array (restricted message shown)
    return [];
  };

  // Helper functions for visual enhancements
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "exceptional": return <Star className="w-4 h-4 text-yellow-500" />;
      case "real-time": return <Zap className="w-4 h-4 text-blue-500" />;
      case "fresher": return <Award className="w-4 h-4 text-green-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sales": return "bg-blue-500";
      case "resume": return "bg-orange-500";
      case "marketing": return "bg-green-500";
      case "remarketing": return "bg-yellow-500";
      case "placed": return "bg-purple-500";
      case "backed-out": return "bg-red-500";
      case "on-hold": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const departmentTime = calculateDepartmentTime(client);

  // Calculate performance metrics
  const totalDays = departmentTime.reduce((sum, dept) => sum + dept.days, 0);
  const totalBusinessDays = departmentTime.reduce(
    (sum, dept) => sum + (dept.businessDays || 0),
    0
  );
  const avgDaysPerStage = totalDays / Math.max(departmentTime.length, 1);

  // Calculate efficiency score (lower is better)
  const efficiencyScore = Math.max(0, 100 - avgDaysPerStage * 5);

  // Get current stage SLA status (exclude terminal stages)
  const currentStageData = departmentTime.find((dept) => dept.current);
  const currentStageSLA =
    currentStageData &&
    !["placed", "on-hold", "backed-out"].includes(client.status)
      ? getSLAStatus(
          client.status,
          Math.max(0, (currentStageData.businessDays || currentStageData.days) - blockedDays),
          true
        )
      : null;

  // Don't show sidebar if not open
  if (!isOpen) return null;

  // Use portal to render sidebar outside normal DOM tree
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        isolation: "isolate",
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          isolation: "isolate",
          pointerEvents: "auto",
        }}
      />

      {/* Side Panel */}
      <div
        className="relative ml-auto w-full max-w-2xl h-full bg-white shadow-2xl transform transition-all duration-500 ease-out animate-in slide-in-from-right"
        style={{ isolation: "isolate" }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <div className="h-full flex flex-col animate-in fade-in-50 duration-500 delay-200">
          <div
            ref={sidebarRef}
            className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 animate-in fade-in duration-700"
            style={{
              isolation: "isolate",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              contain: "layout style paint",
              pointerEvents: "auto",
            }}
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div className="animate-in slide-in-from-bottom duration-600 delay-300">
              {/* Compact Header */}
              <div className="relative border-b border-gray-200 bg-white">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(client.status)}`}></div>

                <div className="flex items-center justify-between py-3 px-4 pl-6">
                  <div className="flex-1 min-w-0">
                    {/* Client Name and Email - Single Line */}
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">
                        {client.name}
                      </h2>
                      <span className="text-sm text-gray-500 truncate">{client.email}</span>
                    </div>

                    {/* Badges - Inline Small Pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {client.status.replace("-", " ")}
                      </div>

                      {client.priority && (
                        <div className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 flex items-center gap-1">
                          {getPriorityIcon(client.priority)}
                          <span className="capitalize">{client.priority}</span>
                        </div>
                      )}

                      {clientIsBlocked && (
                        <div className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 flex items-center gap-1">
                          <PauseCircle className="w-3 h-3" />
                          <span>Blocked</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {!["placed", "backed-out"].includes(client.status) &&
                      ["Admin", "Sales_Executive", "Resume_Writer", "Marketing_Manager"].includes(currentUserRole) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsBlockDialogOpen(true)}
                          className={`h-7 w-7 p-0 ${
                            clientIsBlocked
                              ? "bg-red-50 hover:bg-red-100 text-red-600"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                          }`}
                          title={clientIsBlocked ? "Unblock client" : "Block client"}
                        >
                          {clientIsBlocked ? (
                            <PlayCircle className="h-3.5 w-3.5" />
                          ) : (
                            <PauseCircle className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    {onRefresh && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRefresh}
                        className="h-7 w-7 p-0 bg-gray-50 hover:bg-gray-100 text-gray-600"
                        title="Refresh"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="h-7 w-7 p-0 bg-gray-50 hover:bg-gray-100 text-gray-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sticky Stats Bar */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="grid grid-cols-4 gap-4 px-4 py-3">
                  {/* Total Time */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500 uppercase">Time</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {totalBusinessDays}d
                    </span>
                  </div>

                  {/* Efficiency */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500 uppercase">Efficiency</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {efficiencyScore.toFixed(0)}%
                    </span>
                  </div>

                  {/* SLA Status */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={`w-2 h-2 rounded-full ${
                        currentStageSLA?.status === "overdue" ? "bg-red-500" :
                        currentStageSLA?.status === "warning" ? "bg-yellow-500" :
                        "bg-green-500"
                      }`}></div>
                      <span className="text-xs text-gray-500 uppercase">SLA</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {currentStageSLA
                        ? currentStageSLA.status === "overdue"
                          ? `${currentStageSLA.daysOverdue}d over`
                          : currentStageSLA.status === "warning"
                          ? `${currentStageSLA.daysRemaining.toFixed(1)}d left`
                          : "On track"
                        : "N/A"}
                    </span>
                  </div>

                  {/* Assigned To */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500 uppercase">
                        {client.status === "Sales" || client.status === "Resume" ? "Sales" : "Recruiter"}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {getAssignedPerson(enrichedClient || client, client.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 bg-white px-4">
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab("timeline")}
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "timeline"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <ListTodo className="w-4 h-4" />
                      <span>Timeline</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("documents")}
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "documents"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>Documents</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="px-3 py-3">
                {/* Timeline Tab */}
                {activeTab === "timeline" && (
                  <div>
                    {canAccessMarketingInfo ? (
                      <ClientDepartmentActionsCompact
                        client={client}
                        onBlockedDaysLoad={handleBlockedDaysLoad}
                        onClientDataLoad={handleClientDataLoad}
                      />
                    ) : (
                      <div className="text-center py-8 px-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Shield className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800 mb-2">
                          Restricted Access
                        </h3>
                        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Current Role: {currentUserRole.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* History Tab - Inline Recruiter History */}
                {activeTab === "history" && (
                  <div>
                    <RecruiterHistoryInline
                      clientId={parseInt(client.id, 10)}
                      clientName={client.name}
                      isActive={activeTab === "history"}
                    />
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === "documents" && (
                  <div>
                    <DocumentsTabContent
                      client={client}
                      isActive={activeTab === "documents"}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block Dialog */}
      <ClientBlockDialog
        client={client}
        isOpen={isBlockDialogOpen}
        onClose={() => setIsBlockDialogOpen(false)}
        onSuccess={handleBlockDialogSuccess}
      />

      {/* Recruiter History Dialog */}
      <RecruiterHistoryDialog
        clientId={parseInt(client.id, 10)}
        clientName={client.name}
        isOpen={isRecruiterHistoryOpen}
        onClose={() => setIsRecruiterHistoryOpen(false)}
      />
    </div>,
    document.body
  );
}