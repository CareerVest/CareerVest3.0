import React, { useState } from "react";
import { Client, UserRole } from "../../types/pipelines/pipeline";
import { calculateDepartmentTime } from "./utils";
import { formatDateEST } from "../../utils/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Clock,
  Check,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientDocuments } from "./ClientDocuments";
import { ActionHistory } from "./ActionHistory";

interface ClientDetailsProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (client: Client) => void;
  currentUserRole: UserRole;
}

export function ClientDetails({
  client,
  isOpen,
  onClose,
  onUpdate,
  currentUserRole,
}: ClientDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Client | null>(null);

  React.useEffect(() => {
    if (client) {
      setEditedClient({ ...client });
    }
  }, [client]);

  if (!client || !editedClient) return null;

  const canEdit =
    ["admin", "marketing-manager"].includes(currentUserRole) ||
    (currentUserRole === "sales-executive" && client.status === "sales") ||
    (currentUserRole === "resume-writer" && client.status === "resume") ||
    (["senior-recruiter", "recruiter"].includes(currentUserRole) &&
      client.status === "marketing");

  const handleSave = () => {
    onUpdate(editedClient);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedClient({ ...client });
    setIsEditing(false);
  };

  const toggleAction = (actionKey: string) => {
    setEditedClient((prev) =>
      prev
        ? {
            ...prev,
            actions: {
              ...prev.actions,
              [actionKey]: !prev.actions[actionKey],
            },
          }
        : null
    );
  };

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
          { key: "initial-call", label: "Initial Call" },
          { key: "resume-draft", label: "Resume Draft" },
          { key: "review-completed", label: "Review Completed" },
        ];
      case "marketing":
        return [
          { key: "campaign-setup", label: "Campaign Setup" },
          { key: "outreach-started", label: "Outreach Started" },
          { key: "follow-up", label: "Follow-up" },
          { key: "interview-scheduled", label: "Interview Scheduled" },
        ];
      case "completed":
        return [
          { key: "placement-confirmed", label: "Placement Confirmed" },
          { key: "feedback-collected", label: "Feedback Collected" },
        ];
      default:
        return [];
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      sales: "bg-blue-500",
      resume: "bg-yellow-500",
      marketing: "bg-purple-500",
      completed: "bg-green-500",
      "backed-out": "bg-red-500",
      remarketing: "bg-orange-500",
      "on-hold": "bg-gray-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <p className="mt-1">{client.name}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        client.status
                      )}`}
                    />
                    <Badge variant="secondary">
                      {client.status.replace("-", " ").toUpperCase()}
                    </Badge>
                    {client.priority && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          client.priority === "high"
                            ? "border-red-200 text-red-700"
                            : client.priority === "medium"
                            ? "border-yellow-200 text-yellow-700"
                            : "border-gray-200 text-gray-700"
                        }`}
                      >
                        {client.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{client.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Assigned to: {client.assignedTo}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Created: {formatDateEST(client.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage Actions */}
          {getStageActions(client.status).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Stage Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStageActions(client.status).map((action) => (
                    <div
                      key={action.key}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center ${
                            client.actions[action.key]
                              ? "bg-green-500"
                              : "border border-gray-300"
                          }`}
                        >
                          {client.actions[action.key] && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span
                          className={`${
                            client.actions[action.key]
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {action.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Department Time Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Department Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {calculateDepartmentTime(client).map((dept, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(
                          dept.department.toLowerCase().replace(" ", "-")
                        )}`}
                      />
                      <span
                        className={`${
                          dept.current ? "font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {dept.department}
                      </span>
                      {dept.current && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm ${
                          dept.current ? "font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {dept.days} {dept.days === 1 ? "day" : "days"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {client.notes || "No notes added yet."}
              </p>
            </CardContent>
          </Card>

          {/* Documents */}
          <ClientDocuments
            documents={client.documents}
            clientName={client.name}
          />

          {/* Action History */}
          <ActionHistory
            actions={client.actionHistory}
            clientName={client.name}
          />

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Created: {formatDateEST(client.createdAt)}</div>
                <div>Last Updated: {formatDateEST(client.lastUpdated)}</div>
                <div>
                  Current Stage: {client.status.replace("-", " ").toUpperCase()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
