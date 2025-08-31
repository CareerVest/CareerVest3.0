import React from "react";
import { Client, UserRole } from "../../types/pipelines/pipeline";
import { calculateDepartmentTime } from "./utils";
import { formatDateEST } from "../../utils/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { User, X, CheckCircle2, Clock, Check, TrendingUp } from "lucide-react";
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="relative ml-auto w-full max-w-2xl h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {client.name}
                </h2>
                <p className="text-sm text-gray-500">{client.email}</p>
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

          {/* Status Badge */}
          <div className="mb-6">
            <Badge variant="secondary" className="text-sm px-3 py-1 capitalize">
              {client.status.replace("-", " ")}
            </Badge>
            {client.priority && (
              <Badge
                variant="outline"
                className="ml-2 text-sm px-3 py-1 capitalize"
              >
                {client.priority}
              </Badge>
            )}
          </div>

          {/* Stage Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Stage Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                      <span
                        className={`text-xs ${
                          client.actions[action.key]
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {client.actions[action.key] ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Time */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Department Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departmentTime.map((dept, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {dept.department}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">
                        {dept.days} days
                      </span>
                      {dept.current && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Documents</CardTitle>
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
              <CardTitle className="text-lg">Action History</CardTitle>
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
  );
}
