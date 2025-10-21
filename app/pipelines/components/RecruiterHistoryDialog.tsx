import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCheck, UserX, Clock, Calendar, History as HistoryIcon } from "lucide-react";
import {
  getRecruiterHistory,
  getActiveRecruiter,
  getRecruiterTenureDays,
} from "../actions/pipelineActions";
import type {
  RecruiterAssignmentHistory,
} from "../../types/pipelines/recruiterHistory";
import { formatDateEST } from "../../utils/dateUtils";

interface RecruiterHistoryDialogProps {
  clientId: number;
  clientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RecruiterHistoryDialog({
  clientId,
  clientName,
  isOpen,
  onClose,
}: RecruiterHistoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RecruiterAssignmentHistory[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<RecruiterAssignmentHistory | null>(null);
  const [tenureDays, setTenureDays] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, clientId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyResponse, activeResponse, tenureResponse] = await Promise.all([
        getRecruiterHistory(clientId),
        getActiveRecruiter(clientId),
        getRecruiterTenureDays(clientId),
      ]);

      if (historyResponse.success) {
        setHistory(historyResponse.data);
      }

      if (activeResponse.success && activeResponse.data) {
        setActiveAssignment(activeResponse.data);
      }

      if (tenureResponse.success) {
        setTenureDays(tenureResponse.durationInBusinessDays);
      }
    } catch (error) {
      console.error("Error fetching recruiter history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    return eventType === "initial_assignment" ? (
      <UserCheck className="h-4 w-4 text-green-600" />
    ) : (
      <UserX className="h-4 w-4 text-orange-600" />
    );
  };

  const getEventBadgeColor = (eventType: string) => {
    return eventType === "initial_assignment"
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-orange-100 text-orange-800 border-orange-300";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Recruiter Assignment History
          </DialogTitle>
          <DialogDescription>
            Complete timeline of recruiter assignments for {clientName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Active Assignment */}
            {activeAssignment && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Current Recruiter</h3>
                      <Badge className="bg-blue-600 text-white">Active</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-lg font-medium text-blue-900">
                        {activeAssignment.newRecruiterName}
                      </p>
                      <div className="flex items-center gap-4 text-blue-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Assigned: {formatDateEST(activeAssignment.assignedDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Tenure: {tenureDays} business days</span>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600">
                        Assigned by {activeAssignment.assignedBy} ({activeAssignment.assignedByRole})
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* History Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <HistoryIcon className="h-4 w-4" />
                Assignment Timeline ({history.length} total)
              </h3>

              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <HistoryIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No recruiter assignment history found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((record, index) => (
                    <Card
                      key={record.assignmentHistoryID}
                      className={`p-4 ${
                        record.isActive
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">{getEventIcon(record.eventType)}</div>
                          <div className="flex-1 space-y-2">
                            {/* Event Type Badge */}
                            <Badge
                              variant="outline"
                              className={`text-xs ${getEventBadgeColor(record.eventType)}`}
                            >
                              {record.eventType === "initial_assignment"
                                ? "Initial Assignment"
                                : "Recruiter Changed"}
                            </Badge>

                            {/* Assignment Details */}
                            {record.eventType === "recruiter_change" && record.previousRecruiterName && (
                              <div className="text-sm">
                                <p className="text-gray-600">
                                  From:{" "}
                                  <span className="font-medium text-gray-900 line-through">
                                    {record.previousRecruiterName}
                                  </span>
                                </p>
                                {record.durationInBusinessDays !== null && (
                                  <p className="text-xs text-gray-500">
                                    Worked for {record.durationInBusinessDays} business days
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="text-sm">
                              <p className="text-gray-600">
                                {record.eventType === "initial_assignment" ? "Assigned to" : "To"}:{" "}
                                <span className="font-semibold text-gray-900">
                                  {record.newRecruiterName}
                                </span>
                              </p>
                            </div>

                            {/* Timeline Info */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDateEST(record.assignedDate)}</span>
                              </div>
                              {record.unassignedDate && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Ended: {formatDateEST(record.unassignedDate)}</span>
                                </div>
                              )}
                            </div>

                            {/* Stage and Who Assigned */}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <Badge variant="outline" className="text-xs">
                                {record.stageName}
                              </Badge>
                              <span>
                                by {record.assignedBy} ({record.assignedByRole})
                              </span>
                            </div>

                            {/* Notes */}
                            {record.notes && (
                              <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                <p className="text-xs text-gray-600 italic">{record.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Active Badge */}
                        {record.isActive && (
                          <Badge className="bg-blue-600 text-white text-xs">Active</Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
