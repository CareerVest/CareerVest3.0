import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  User,
  FileText,
  CheckCircle2,
  Calendar,
  Eye,
} from "lucide-react";
import { ActionHistory as ActionHistoryType } from "../../types/pipelines/pipeline";

interface ActionHistoryProps {
  actions: ActionHistoryType[];
  clientName: string;
}

export function ActionHistory({ actions, clientName }: ActionHistoryProps) {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "Acknowledged":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "Initial Call Done":
        return <Clock className="h-4 w-4 text-green-500" />;
      case "Resume Completed":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "AssignSeniorRecruiter":
      case "AssignRecruiter":
        return <User className="h-4 w-4 text-orange-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "marketing-manager":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "senior-recruiter":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "recruiter":
        return "bg-green-100 text-green-800 border-green-200";
      case "sales-executive":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resume-writer":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Action History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No actions performed yet</p>
            <p className="text-sm">
              Action history will appear here when actions are completed
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Action History ({actions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
            .map((action) => (
              <div
                key={action.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {getActionIcon(action.actionType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">
                          {action.actionType}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getRoleBadgeColor(
                            action.performedByRole
                          )}`}
                        >
                          {action.performedByRole.replace("-", " ")}
                        </Badge>
                        {action.fileUploaded && (
                          <Badge variant="secondary" className="text-xs">
                            File Uploaded
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {action.performedBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(action.timestamp)}
                        </div>
                      </div>

                      {action.notes && (
                        <p className="text-sm text-gray-700 mb-2">
                          {action.notes}
                        </p>
                      )}

                      {action.fileUploaded && action.fileName && (
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                          <FileText className="h-3 w-3" />
                          <span>{action.fileName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      title="View details"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
