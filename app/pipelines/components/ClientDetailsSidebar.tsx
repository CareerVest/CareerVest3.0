import React from "react";
import { createPortal } from "react-dom";
import { Client, UserRole } from "../../types/pipelines/pipeline";
import { calculateDepartmentTime } from "./utils";
import { formatDateEST } from "../../utils/dateUtils";
import {
  getSLAStatus,
  getSLAStatusColor,
  getSLAStatusIcon,
  getSLAConfig,
  STAGE_SLA_CONFIG,
} from "./slaConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  User,
  X,
  CheckCircle2,
  Clock,
  Check,
  TrendingUp,
  Calendar,
  FileText,
  Users,
  Target,
  AlertCircle,
  ArrowRight,
  Timer,
  BarChart3,
  Activity,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { ClientDocuments } from "./ClientDocuments";
import { ActionHistory } from "./ActionHistory";

interface ClientDetailsSidebarProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRole;
}

export function ClientDetailsSidebar({
  client,
  isOpen,
  onClose,
  currentUserRole,
}: ClientDetailsSidebarProps) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // Focus the sidebar when it opens to ensure proper scroll behavior
  React.useEffect(() => {
    if (isOpen && sidebarRef.current) {
      sidebarRef.current.focus();
    }
  }, [isOpen]);

  if (!client) return null;

  const getStageActions = (status: string) => {
    switch (status) {
      case "sales":
        return [
          { key: "initial-contact", label: "Initial Contact" },
          { key: "needs-assessment", label: "Needs Assessment" },
          { key: "qualification", label: "Qualification" },
        ];
      case "resume":
        return [
          { key: "acknowledgment", label: "Acknowledgment" },
          { key: "initial-call", label: "Initial Call Done" },
          { key: "resume-completed", label: "Resume Completed" },
          { key: "review-completed", label: "Review Completed" },
        ];
      case "marketing":
        return [
          { key: "acknowledgment", label: "Acknowledgment" },
          { key: "assign-senior-recruiter", label: "Assign Senior Recruiter" },
        ];
      default:
        return [];
    }
  };

  const stageActions = getStageActions(client.status);
  const departmentTime = calculateDepartmentTime(client);

  // Calculate performance metrics
  const totalDays = departmentTime.reduce((sum, dept) => sum + dept.days, 0);
  const totalBusinessDays = departmentTime.reduce(
    (sum, dept) => sum + (dept.businessDays || 0),
    0
  );
  const avgDaysPerStage = totalDays / Math.max(departmentTime.length, 1);
  const completedActions = Object.values(client.actions || {}).filter(
    Boolean
  ).length;
  const totalActions = Object.keys(client.actions || {}).length;
  const actionCompletionRate =
    totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

  // Get current stage SLA status (exclude terminal stages)
  const currentStageData = departmentTime.find((dept) => dept.current);
  const currentStageSLA =
    currentStageData &&
    !["placed", "on-hold", "backed-out"].includes(client.status)
      ? getSLAStatus(
          client.status,
          currentStageData.businessDays || currentStageData.days,
          true
        )
      : null;

  // Identify bottlenecks (stages with longest time)
  const bottleneckStage = departmentTime.reduce((max, current) =>
    current.days > max.days ? current : max
  );

  // Calculate efficiency score (lower is better)
  const efficiencyScore = Math.max(0, 100 - avgDaysPerStage * 5);

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
        // Prevent clicks from bubbling up to dialog
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        // Prevent mouse events from bubbling
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        // Prevent mouse events from bubbling
        e.stopPropagation();
      }}
    >
      {/* Backdrop - Only for sidebar, doesn't affect dialog */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity pointer-events-auto"
        onClick={(e) => {
          // Only close sidebar, don't affect dialog
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }}
        onMouseDown={(e) => {
          // Prevent mouse events from bubbling
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          // Prevent mouse events from bubbling
          e.stopPropagation();
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
        className="relative ml-auto w-full max-w-3xl h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out"
        style={{ isolation: "isolate" }}
        onClick={(e) => {
          // Prevent clicks from bubbling up to dialog
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseDown={(e) => {
          // Prevent mouse events from bubbling
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          // Prevent mouse events from bubbling
          e.stopPropagation();
        }}
        onPointerDown={(e) => {
          // Prevent pointer events from bubbling
          e.stopPropagation();
        }}
        onPointerUp={(e) => {
          // Prevent pointer events from bubbling
          e.stopPropagation();
        }}
      >
        <div className="h-full flex flex-col">
          <div
            ref={sidebarRef}
            className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            style={{
              isolation: "isolate",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              contain: "layout style paint",
              pointerEvents: "auto",
            }}
            tabIndex={-1}
            onClick={(e) => {
              // Prevent clicks from bubbling up to dialog
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseDown={(e) => {
              // Prevent mouse events from bubbling up
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              // Prevent mouse events from bubbling up
              e.stopPropagation();
            }}
            onWheel={(e) => {
              // Prevent wheel events from bubbling up to parent dialogs
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchMove={(e) => {
              // Prevent touch events from bubbling up
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              // Prevent touch events from bubbling up
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              // Prevent touch events from bubbling up
              e.stopPropagation();
            }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {client.name}
                    </h2>
                    <p className="text-sm text-gray-500">{client.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-1 capitalize"
                      >
                        {client.status.replace("-", " ")}
                      </Badge>
                      {client.priority && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-1 capitalize"
                        >
                          {client.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Performance Overview Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Timer className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Total Time
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {totalBusinessDays} days
                        </p>
                        <p className="text-xs text-blue-600">
                          ({totalDays} calendar)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">
                          Efficiency
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {efficiencyScore.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SLA Status Card */}
                {currentStageSLA && (
                  <Card
                    className={`border-2 ${getSLAStatusColor(
                      currentStageSLA.status
                    )}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getSLAStatusIcon(currentStageSLA.status)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">SLA Status</p>
                          <p className="text-lg font-bold">
                            {currentStageSLA.status === "overdue"
                              ? `${currentStageSLA.daysOverdue} days overdue`
                              : currentStageSLA.status === "warning"
                              ? `${currentStageSLA.daysRemaining.toFixed(
                                  1
                                )} days left`
                              : "On Track"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Client Journey Timeline */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Client Journey Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentTime.map((dept, index) => {
                      const slaConfig = getSLAConfig(dept.department);
                      const slaStatus =
                        dept.current &&
                        !["placed", "on-hold", "backed-out"].includes(
                          client.status
                        )
                          ? getSLAStatus(
                              dept.department,
                              dept.businessDays || dept.days,
                              true
                            )
                          : null;

                      return (
                        <div key={index} className="relative">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                dept.current
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {dept.current ? (
                                <Activity className="w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium text-gray-900 capitalize">
                                    {dept.department}
                                  </span>
                                  {slaConfig && (
                                    <p className="text-xs text-gray-500">
                                      SLA: {slaConfig.maxDays} business days
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="text-sm text-gray-500">
                                    {dept.businessDays || dept.days} days
                                  </span>
                                  {slaStatus &&
                                    slaStatus.status !== "completed" && (
                                      <div
                                        className={`text-xs px-2 py-1 rounded-full mt-1 ${getSLAStatusColor(
                                          slaStatus.status
                                        )}`}
                                      >
                                        {slaStatus.status === "overdue"
                                          ? `${slaStatus.daysOverdue} overdue`
                                          : slaStatus.status === "warning"
                                          ? `${slaStatus.daysRemaining.toFixed(
                                              1
                                            )} left`
                                          : "On track"}
                                      </div>
                                    )}
                                </div>
                              </div>
                              <div className="mt-1">
                                <Progress
                                  value={dept.current ? 50 : 100}
                                  className="h-2"
                                />
                              </div>
                            </div>
                            {index < departmentTime.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* SLA Overview */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    SLA Deadlines & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {STAGE_SLA_CONFIG.map((sla) => {
                      const stageData = departmentTime.find(
                        (dept) =>
                          dept.department.toLowerCase().replace(" ", "-") ===
                          sla.stage
                      );
                      const isCurrentStage = stageData?.current || false;
                      const daysInStage = stageData
                        ? stageData.businessDays || stageData.days
                        : 0;
                      const slaStatus = getSLAStatus(
                        sla.stage,
                        daysInStage,
                        isCurrentStage
                      );

                      // Skip SLA display for terminal stages
                      if (
                        ["placed", "on-hold", "backed-out"].includes(
                          client.status
                        )
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={sla.stage}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                                slaStatus.status === "overdue"
                                  ? "bg-red-100 text-red-600"
                                  : slaStatus.status === "warning"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {getSLAStatusIcon(slaStatus.status)}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 capitalize">
                                {sla.stage.replace("-", " ")}
                              </span>
                              <p className="text-xs text-gray-500">
                                {sla.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {sla.maxDays} business days
                            </div>
                            {isCurrentStage && (
                              <div
                                className={`text-xs px-2 py-1 rounded-full mt-1 ${getSLAStatusColor(
                                  slaStatus.status
                                )}`}
                              >
                                {slaStatus.status === "overdue"
                                  ? `${slaStatus.daysOverdue} overdue`
                                  : slaStatus.status === "warning"
                                  ? `${slaStatus.daysRemaining.toFixed(1)} left`
                                  : "On track"}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Bottleneck Analysis */}
              {bottleneckStage &&
                bottleneckStage.days > avgDaysPerStage * 1.5 && (
                  <Card className="mb-6 border-orange-200 bg-orange-50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                        <AlertTriangle className="w-5 h-5" />
                        Bottleneck Identified
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 p-3 bg-orange-100 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">
                            {bottleneckStage.department} stage is taking longer
                            than average
                          </p>
                          <p className="text-xs text-orange-600">
                            {bottleneckStage.days} days vs{" "}
                            {avgDaysPerStage.toFixed(1)} days average
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Action Progress */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Action Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Overall Completion
                      </span>
                      <span className="text-sm text-gray-500">
                        {completedActions}/{totalActions} actions
                      </span>
                    </div>
                    <Progress value={actionCompletionRate} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">
                      {actionCompletionRate.toFixed(0)}% complete
                    </p>
                  </div>

                  <div className="space-y-3">
                    {stageActions.map((action) => (
                      <div
                        key={action.key}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {action.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {client.actions[action.key] ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <Check className="w-4 h-4" />
                              <span className="text-xs font-medium">
                                Completed
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs">Pending</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Department Performance */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Department Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentTime.map((dept, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              dept.current
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {dept.current ? (
                              <Zap className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {dept.department}
                            </span>
                            {dept.current && (
                              <p className="text-xs text-blue-600">
                                Current Stage
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            {dept.businessDays || dept.days}
                          </span>
                          <p className="text-xs text-gray-500">
                            {dept.businessDays !== dept.days
                              ? `${dept.businessDays} business`
                              : ""}{" "}
                            days
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents & Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClientDocuments
                    documents={client.documents || []}
                    clientName={client.name}
                  />
                </CardContent>
              </Card>

              {/* Action History */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Action History & Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ActionHistory
                    actions={client.actionHistory || []}
                    clientName={client.name}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
