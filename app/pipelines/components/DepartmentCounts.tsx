import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  User,
  FileText,
  Target,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Pause,
} from "lucide-react";
import { Client, ClientStatus, UserRole } from "../../types/pipelines/pipeline";
import { stageConfig } from "./constants";
import { formatDateEST } from "../../utils/dateUtils";
import { SpecialStateClientActions } from "./SpecialStateClientActions";

interface DepartmentCountsProps {
  clients: Client[];
  onClientSelect: (client: Client) => void;
  currentUserRole: UserRole;
  onMoveClient: (clientId: string, newStatus: ClientStatus) => void;
  onActionComplete: (
    clientId: string,
    action: string,
    data: { comment: string; file?: File; additionalFiles?: File[] }
  ) => void;
  selectedClientId?: string | null;
}

interface DepartmentData {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  textColor: string;
  clients: Client[];
}

export function DepartmentCounts({
  clients,
  onClientSelect,
  currentUserRole,
  onMoveClient,
  onActionComplete,
  selectedClientId = null,
}: DepartmentCountsProps) {
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Group clients by department
  const departments: Record<ClientStatus, DepartmentData> = {
    sales: {
      title: "Sales",
      icon: User,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      clients: clients.filter((c) => c.status === "sales"),
    },
    resume: {
      title: "Resume",
      icon: FileText,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      clients: clients.filter((c) => c.status === "resume"),
    },
    marketing: {
      title: "Marketing",
      icon: Target,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      clients: clients.filter((c) => c.status === "marketing"),
    },
    remarketing: {
      title: "ReMarketing",
      icon: RotateCcw,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      clients: clients.filter((c) => c.status === "remarketing"),
    },
    placed: {
      title: "Placed",
      icon: CheckCircle2,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      clients: clients.filter((c) => c.status === "placed"),
    },
    "backed-out": {
      title: "Backed Out",
      icon: AlertTriangle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      clients: clients.filter((c) => c.status === "backed-out"),
    },
    "on-hold": {
      title: "On Hold",
      icon: Pause,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      clients: clients.filter((c) => c.status === "on-hold"),
    },
  };

  // Define which departments are clickable (only special states)
  const clickableDepartments: ClientStatus[] = [
    "placed",
    "backed-out",
    "on-hold",
  ];

  const handleDepartmentClick = (department: DepartmentData) => {
    setSelectedDepartment(department);
    setIsDialogOpen(true);
  };

  const handleClientClick = (client: Client) => {
    onClientSelect(client);
    // Don't close the dialog - let the sidebar open alongside it
    // The dialog will stay open so users can see other clients
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-3">
        {Object.entries(departments).map(([key, dept]) => {
          const Icon = dept.icon;
          const isClickable = clickableDepartments.includes(
            key as ClientStatus
          );

          return (
            <Card
              key={key}
              className={`${
                isClickable
                  ? "cursor-pointer hover:shadow-md hover:scale-105"
                  : "cursor-default"
              } transition-all duration-200 ${dept.bgColor} h-16`}
              onClick={
                isClickable ? () => handleDepartmentClick(dept) : undefined
              }
            >
              <CardContent className="p-3 h-full">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${dept.color}`} />
                    <Icon className={`w-3 h-3 ${dept.textColor}`} />
                    <span className={`text-sm font-medium ${dept.textColor}`}>
                      {dept.title}
                    </span>
                  </div>
                  <Badge
                    className={`${
                      dept.clients.length === 0
                        ? "bg-gray-400 text-gray-600"
                        : "bg-yellow-500 text-yellow-900"
                    } text-xs px-2 py-1 font-bold`}
                  >
                    {dept.clients.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Client List Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="flex items-center gap-2">
              {selectedDepartment && (
                <>
                  <div
                    className={`w-4 h-4 rounded-full ${selectedDepartment.color}`}
                  />
                  <selectedDepartment.icon
                    className={`w-5 h-5 ${selectedDepartment.textColor}`}
                  />
                  <span>{selectedDepartment.title}</span>
                  <Badge variant="secondary">
                    {selectedDepartment.clients.length}
                  </Badge>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {selectedDepartment?.clients.length === 0 ? (
                <div className="text-center py-8">
                  <selectedDepartment.icon
                    className={`w-12 h-12 ${selectedDepartment.textColor} mx-auto mb-3`}
                  />
                  <p className="text-muted-foreground">
                    No clients in {selectedDepartment.title}
                  </p>
                </div>
              ) : (
                selectedDepartment?.clients.map((client, index) => (
                  <div
                    key={client.id}
                    className={`border-2 rounded-lg hover:border-gray-400 transition-all duration-200 mb-4 last:mb-0 shadow-md bg-white ${
                      selectedClientId === client.id
                        ? `${selectedDepartment.color.replace(
                            "bg-",
                            "border-"
                          )} ${selectedDepartment.bgColor}/50`
                        : "border-gray-300"
                    }`}
                  >
                    {/* Client Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleClientClick(client)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className={`w-3 h-3 rounded-full ${selectedDepartment.color}`}
                            />
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {client.name}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {client.email}
                            </p>
                            {client.assignedTo && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-medium">Assigned:</span>{" "}
                                {client.assignedTo}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-muted-foreground">
                            Updated
                          </p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatDateEST(client.lastUpdated)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Show actions for special states */}
                    {clickableDepartments.includes(client.status) && (
                      <div className="p-3 bg-gray-100 border-t-2 border-gray-300">
                        <SpecialStateClientActions
                          client={client}
                          currentUserRole={currentUserRole}
                          onMoveClient={onMoveClient}
                          onActionComplete={onActionComplete}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
