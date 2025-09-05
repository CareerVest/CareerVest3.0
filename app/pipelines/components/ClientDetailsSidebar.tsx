import React from "react";
import { createPortal } from "react-dom";
import { Client } from "../../types/pipelines/pipeline";
import { calculateDepartmentTime } from "./utils";
import { getAssignedPerson } from "../actions/pipelineActions";
import { formatDateEST } from "../../utils/dateUtils";
import { getSLAStatus, getSLAStatusColor, getSLAStatusIcon } from "./slaConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  X,
  Activity,
  RefreshCw,
  Timer,
  Target,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ClientDepartmentActions } from "./ClientDepartmentActions";

interface ClientDetailsSidebarProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function ClientDetailsSidebar({
  client,
  isOpen,
  onClose,
  onRefresh,
}: ClientDetailsSidebarProps) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // Focus the sidebar when it opens to ensure proper scroll behavior
  React.useEffect(() => {
    if (isOpen && sidebarRef.current) {
      sidebarRef.current.focus();
    }
  }, [isOpen]);

  if (!client) return null;

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
          currentStageData.businessDays || currentStageData.days,
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
                    {/* Assigned Person Information */}
                    {client.assignedTo && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">
                            {client.status === "sales" ||
                            client.status === "resume"
                              ? "Sales Person"
                              : "Recruiter"}
                          </span>
                          : {getAssignedPerson(client, client.status)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onRefresh && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRefresh}
                      className="h-8 w-8 p-0"
                      title="Refresh client data"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Compact Count Cards - Full Width */}
              <div className="flex items-stretch gap-1 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 flex-1 flex items-center justify-center gap-2">
                  <Timer className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  <div className="text-center min-w-0 flex-1">
                    <p className="text-xs text-blue-600 font-medium leading-tight">Time</p>
                    <p className="text-sm font-bold text-blue-900 leading-tight">
                      {totalBusinessDays}d
                        </p>
                      </div>
                    </div>

                <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 flex-1 flex items-center justify-center gap-2">
                  <Target className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <div className="text-center min-w-0 flex-1">
                    <p className="text-xs text-green-600 font-medium leading-tight">Efficiency</p>
                    <p className="text-sm font-bold text-green-900 leading-tight">
                          {efficiencyScore.toFixed(0)}%
                        </p>
                      </div>
                    </div>

                {currentStageSLA && (
                  <div className={`border-2 rounded-md px-3 py-2 flex-1 flex items-center justify-center gap-2 ${getSLAStatusColor(currentStageSLA.status)}`}>
                    <div className="text-sm flex-shrink-0">
                          {getSLAStatusIcon(currentStageSLA.status)}
                        </div>
                    <div className="text-center min-w-0 flex-1">
                      <p className="text-xs font-medium leading-tight">SLA</p>
                      <p className="text-sm font-bold leading-tight">
                            {currentStageSLA.status === "overdue"
                          ? `${currentStageSLA.daysOverdue}d`
                              : currentStageSLA.status === "warning"
                          ? `${currentStageSLA.daysRemaining.toFixed(1)}d`
                          : "OK"}
                          </p>
                        </div>
                      </div>
                )}
              </div>

              {/* Combined Department Actions & History */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Department Actions & History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClientDepartmentActions
                    client={client}
                    departments={client.departments || []}
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
