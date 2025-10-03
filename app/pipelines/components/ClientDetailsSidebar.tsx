import React from "react";
import { createPortal } from "react-dom";
import { Client, UserRole } from "../../types/pipelines/pipeline";
import { calculateDepartmentTime } from "./utils";
import { getAssignedPerson, getBlockHistory } from "../actions/pipelineActions";
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
} from "lucide-react";
import { ClientDepartmentActions } from "./ClientDepartmentActions";
import { calculateBlockedDays, isClientBlocked } from "../actions/pipelineActions";
import { ClientBlockDialog } from "./ClientBlockDialog";
import { PauseCircle, PlayCircle } from "lucide-react";

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
  const [clientIsBlocked, setClientIsBlocked] = React.useState(false);

  // Focus the sidebar when it opens to ensure proper scroll behavior
  React.useEffect(() => {
    if (isOpen && sidebarRef.current) {
      sidebarRef.current.focus();
    }
  }, [isOpen]);

  // Fetch block history and calculate blocked days for current stage
  React.useEffect(() => {
    const fetchBlockedDays = async () => {
      if (!client) return;

      const clientId = parseInt(client.id, 10);
      if (isNaN(clientId)) return;

      try {
        const [historyResponse, blockedResponse] = await Promise.all([
          getBlockHistory(clientId),
          isClientBlocked(clientId),
        ]);

        if (historyResponse.success && historyResponse.data) {
          const blocked = calculateBlockedDays(historyResponse.data, client.status);
          setBlockedDays(blocked);
        }

        if (blockedResponse.success) {
          setClientIsBlocked(blockedResponse.isBlocked);
        }
      } catch (error) {
        console.error("Error fetching block history:", error);
        setBlockedDays(0);
      }
    };

    if (isOpen && client) {
      fetchBlockedDays();
    }
  }, [isOpen, client]);

  const handleBlockDialogSuccess = () => {
    // Refresh block data after block/unblock
    const fetchBlockData = async () => {
      if (!client) return;

      const clientId = parseInt(client.id, 10);
      if (isNaN(clientId)) return;

      try {
        const [historyResponse, blockedResponse] = await Promise.all([
          getBlockHistory(clientId),
          isClientBlocked(clientId),
        ]);

        if (historyResponse.success && historyResponse.data) {
          const blocked = calculateBlockedDays(historyResponse.data, client.status);
          setBlockedDays(blocked);
        }

        if (blockedResponse.success) {
          setClientIsBlocked(blockedResponse.isBlocked);
        }
      } catch (error) {
        console.error("Error refreshing block data:", error);
      }
    };

    fetchBlockData();
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
          dept.name === "marketing" || 
          dept.name === "remarketing" || 
          dept.name === "placed" || 
          dept.name === "on-hold" || 
          dept.name === "backed-out"
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
        className="relative ml-auto w-full max-w-3xl h-full bg-white shadow-2xl transform transition-all duration-500 ease-out animate-in slide-in-from-right"
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
            <div className="p-4 animate-in slide-in-from-bottom duration-600 delay-300">
              {/* Beautiful Header with Integrated Metrics */}
              <div className="relative mb-6">
                <div className={`${getStatusColor(client.status)} p-5 rounded-2xl text-white relative overflow-hidden`}>
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-3 -translate-x-3"></div>
                  
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-white mb-1 truncate">
                          {client.name}
                        </h2>
                        <div className="flex items-center gap-2 mb-3">
                          <Mail className="w-4 h-4 text-white/80" />
                          <p className="text-white/90 text-sm truncate">{client.email}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/30">
                            <span className="text-white text-xs font-medium capitalize">
                              {client.status.replace("-", " ")}
                            </span>
                          </div>

                          {client.priority && (
                            <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/30 flex items-center gap-1.5">
                              {getPriorityIcon(client.priority)}
                              <span className="text-white text-xs font-medium capitalize">
                                {client.priority}
                              </span>
                            </div>
                          )}

                          {clientIsBlocked && (
                            <div className="bg-red-500/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-red-300 flex items-center gap-1.5">
                              <PauseCircle className="w-3 h-3 text-white" />
                              <span className="text-white text-xs font-medium">
                                Blocked - SLA Paused
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Assigned Person */}
                        {client.assignedTo && (
                          <div className="flex items-center gap-2 mb-3">
                            <User className="w-3.5 h-3.5 text-white/80" />
                            <span className="text-white/90 text-sm">
                              <span className="font-medium">
                                {client.status === "sales" ||
                                client.status === "resume"
                                  ? "Sales Person"
                                  : "Recruiter"}
                              </span>
                              : {getAssignedPerson(client, client.status)}
                            </span>
                          </div>
                        )}
                        
                        {/* Integrated Performance Metrics */}
                        <div className="flex items-center gap-4 pt-2">
                          {/* Total Time */}
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                              <Clock className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-white/70 uppercase tracking-wide">Time</p>
                              <p className="text-sm font-bold text-white">
                                {totalBusinessDays}<span className="text-xs ml-0.5">d</span>
                              </p>
                            </div>
                          </div>
                          
                          {/* Efficiency */}
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-white/70 uppercase tracking-wide">Efficiency</p>
                              <p className="text-sm font-bold text-white">
                                {efficiencyScore.toFixed(0)}<span className="text-xs ml-0.5">%</span>
                              </p>
                            </div>
                          </div>
                          
                          {/* SLA Status */}
                          {currentStageSLA && (
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 backdrop-blur-sm rounded-lg flex items-center justify-center ${
                                currentStageSLA.status === "overdue" ? "bg-red-400/30" :
                                currentStageSLA.status === "warning" ? "bg-amber-400/30" :
                                "bg-emerald-400/30"
                              }`}>
                                <div className="text-white text-sm">
                                  {getSLAStatusIcon(currentStageSLA.status)}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-white/70 uppercase tracking-wide">SLA</p>
                                <p className="text-sm font-bold text-white">
                                  {currentStageSLA.status === "overdue"
                                    ? `${currentStageSLA.daysOverdue}d over`
                                    : currentStageSLA.status === "warning"
                                    ? `${currentStageSLA.daysRemaining.toFixed(1)}d left`
                                    : "On track"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      {/* Block/Unblock Button - only for non-terminal stages */}
                      {!["placed", "backed-out"].includes(client.status) &&
                        ["Admin", "Sales_Executive", "Resume_Writer", "Marketing_Manager"].includes(currentUserRole) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsBlockDialogOpen(true)}
                            className={`h-8 w-8 p-0 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white transition-all duration-200 ${
                              clientIsBlocked
                                ? "bg-red-500/30"
                                : "bg-white/20"
                            }`}
                            title={clientIsBlocked ? "Client is blocked - Click to unblock" : "Block client and pause SLA"}
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
                          className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white transition-all duration-200"
                          title="Refresh client data"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white transition-all duration-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Department Actions */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Department Progress</h3>
                      <p className="text-white/80 text-sm font-normal mt-0.5">
                        Track actions across pipeline stages
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  {canAccessMarketingInfo ? (
                    <div className="relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-6 translate-x-6 opacity-30"></div>
                      <div className="relative">
                        <ClientDepartmentActions
                          client={client}
                          departments={getFilteredDepartments(client.departments || [])}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl opacity-50"></div>
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800 mb-2">
                          Restricted Access
                        </h3>
                        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Current Role: {currentUserRole.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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
    </div>,
    document.body
  );
}