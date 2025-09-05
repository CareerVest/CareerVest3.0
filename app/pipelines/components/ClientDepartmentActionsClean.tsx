import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Check,
  Clock,
  FileText,
  MessageSquare,
  Calendar,
  User,
  Eye,
  CheckCircle2,
} from "lucide-react";
import {
  Client,
  ActionHistory as ActionHistoryType,
  ClientDocument,
} from "../../types/pipelines/pipeline";
import { formatDateEST } from "../../utils/dateUtils";
import { normalizeDepartments } from "../actions/pipelineActions";

interface Department {
  name: string;
  displayName: string;
  actions: ActionWithDocuments[] | { $values: ActionWithDocuments[] } | any;
}

interface ActionWithDocuments {
  actionType: string;
  actionLabel: string;
  status: string;
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  notes?: string;
  documents: ClientDocument[] | { $values: ClientDocument[] } | any;
}

interface ClientDepartmentActionsProps {
  client: Client;
  departments?: Department[];
}

export function ClientDepartmentActions({
  client,
  departments = [],
}: ClientDepartmentActionsProps) {
  // Normalize departments data to handle Entity Framework serialization
  const normalizedDepartments = normalizeDepartments(departments);

  // Helper function to normalize department actions
  const normalizeDepartmentActions = (
    department: Department
  ): ActionWithDocuments[] => {
    if (!department.actions) return [];

    // Handle Entity Framework serialization for actions
    if (
      department.actions &&
      typeof department.actions === "object" &&
      department.actions.$values &&
      Array.isArray(department.actions.$values)
    ) {
      return department.actions.$values;
    }

    // Handle regular array format
    if (Array.isArray(department.actions)) {
      return department.actions;
    }

    console.warn(
      "Unexpected actions format for department:",
      department.name,
      department.actions
    );
    return [];
  };

  // Helper function to normalize action documents
  const normalizeActionDocuments = (documents: any): ClientDocument[] => {
    if (!documents) return [];

    // Handle Entity Framework serialization for documents
    if (
      documents &&
      typeof documents === "object" &&
      documents.$values &&
      Array.isArray(documents.$values)
    ) {
      return documents.$values;
    }

    // Handle regular array format
    if (Array.isArray(documents)) {
      return documents;
    }

    console.warn("Unexpected documents format:", documents);
    return [];
  };

  const getDepartmentColor = (departmentName: string) => {
    switch (departmentName) {
      case "sales":
        return "bg-blue-50 border-blue-200";
      case "resume":
        return "bg-orange-50 border-orange-200";
      case "marketing":
        return "bg-green-50 border-green-200";
      case "remarketing":
        return "bg-purple-50 border-purple-200";
      case "placed":
        return "bg-emerald-50 border-emerald-200";
      case "on-hold":
        return "bg-yellow-50 border-yellow-200";
      case "backed-out":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {normalizedDepartments.map((department) => {
        const departmentActions = normalizeDepartmentActions(department);
        const completedActions = departmentActions.filter(
          (action) => action.status === "completed"
        );
        const pendingActions = departmentActions.filter(
          (action) => action.status !== "completed"
        );

        return (
          <Card
            key={department.name}
            className={`${getDepartmentColor(department.name)} border-2`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      department.name === client.status
                        ? "bg-green-500 animate-pulse"
                        : "bg-gray-400"
                    }`}
                  />
                  <div>
                    <CardTitle className="text-lg">
                      {department.displayName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {completedActions.length} of {departmentActions.length}{" "}
                      actions completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      completedActions.length > 0 ? "default" : "secondary"
                    }
                  >
                    {department.name === client.status
                      ? "Current"
                      : completedActions.length > 0
                      ? "Completed"
                      : "Not Started"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (completedActions.length /
                              departmentActions.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(
                        (completedActions.length / departmentActions.length) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Department Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

                <div className="space-y-6">
                  {departmentActions.map((action, index) => {
                    const normalizedDocuments = normalizeActionDocuments(
                      action.documents
                    );

                    return (
                      <div
                        key={action.actionType}
                        className="relative flex gap-4"
                      >
                        {/* Timeline dot */}
                        <div
                          className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                            action.status === "completed"
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {action.status === "completed" ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>

                        {/* Action content */}
                        <div className="flex-1 min-w-0">
                          <div className="bg-white rounded-lg border p-4 shadow-sm">
                            {/* Action Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">
                                  {action.actionLabel}
                                </h4>
                                <Badge
                                  variant={
                                    action.status === "completed"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {action.status === "completed"
                                    ? "Completed"
                                    : "Pending"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                {formatDateEST(action.timestamp)}
                              </div>
                            </div>

                            {/* Action Details */}
                            <div className="space-y-3">
                              {/* Performed By */}
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">by</span>
                                <span className="font-medium">
                                  {action.performedBy}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {action.performedByRole}
                                </Badge>
                              </div>

                              {/* Comments/Notes */}
                              {action.notes && (
                                <div className="bg-gray-50 rounded p-3">
                                  <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-700 mb-1">
                                        Notes & Comments
                                      </p>
                                      <p className="text-sm text-gray-800">
                                        {action.notes}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Documents */}
                              {normalizedDocuments.length > 0 && (
                                <div className="bg-blue-50 rounded p-3">
                                  <div className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-blue-700 mb-2">
                                        Documents ({normalizedDocuments.length})
                                      </p>
                                      <div className="space-y-2">
                                        {normalizedDocuments.map((doc) => (
                                          <div
                                            key={doc.documentID}
                                            className="flex items-center justify-between bg-white rounded p-2"
                                          >
                                            <div className="flex items-center gap-2">
                                              <FileText className="w-4 h-4 text-gray-400" />
                                              <span className="text-sm font-medium">
                                                {doc.name}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                              <span>
                                                {(doc.fileSize / 1024).toFixed(
                                                  1
                                                )}{" "}
                                                KB
                                              </span>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={() =>
                                                  window.open(
                                                    doc.fileSharePointURL,
                                                    "_blank"
                                                  )
                                                }
                                              >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Department Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{completedActions.length} completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{pendingActions.length} pending</span>
                    </div>
                  </div>
                  <div className="text-gray-500">
                    {Math.round(
                      (completedActions.length / departmentActions.length) * 100
                    )}
                    % complete
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {normalizedDepartments.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No department actions found for this client
          </p>
        </div>
      )}
    </div>
  );
}
