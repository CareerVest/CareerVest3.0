import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  Clock,
  FileText,
  MessageSquare,
  Calendar,
  User,
  Eye,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import {
  Client,
  ClientDocument,
} from "../../types/pipelines/pipeline";
import { formatDateEST } from "../../utils/dateUtils";
import { usePipelineActions } from "../actions/pipelineActions";
import type { StageVisit } from "../../types/pipelines/stageJourney";

interface ClientDepartmentActionsCompactProps {
  client: Client;
  onBlockedDaysLoad?: (blockedDays: number) => void;
  onClientDataLoad?: (clientData: any) => void;
}

export function ClientDepartmentActionsCompact({
  client,
  onBlockedDaysLoad,
  onClientDataLoad,
}: ClientDepartmentActionsCompactProps) {
  const [stageJourney, setStageJourney] = useState<StageVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({});
  const { getClientStageJourney } = usePipelineActions();

  // Helper function to normalize $values wrapper from .NET serialization
  const normalizeArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && '$values' in data) {
      return Array.isArray(data.$values) ? data.$values : [];
    }
    return [];
  };

  // Fetch stage journey on mount
  useEffect(() => {
    const fetchJourney = async () => {
      try {
        setLoading(true);
        const clientId = parseInt(client.id, 10);
        if (isNaN(clientId)) {
          setError("Invalid client ID");
          return;
        }

        const response = await getClientStageJourney(clientId);
        if (response.success) {
          // Pass blocked days to parent if callback provided
          if (onBlockedDaysLoad && response.client?.blockedDaysInCurrentStage !== undefined) {
            onBlockedDaysLoad(response.client.blockedDaysInCurrentStage);
          }

          // Pass client data to parent if callback provided
          if (onClientDataLoad && response.client) {
            onClientDataLoad(response.client);
          }

          // Normalize data - handle $values wrapper from .NET serialization
          const journeyData = normalizeArray(response.data);

          if (journeyData.length > 0) {
            // Normalize actions array for each visit
            const normalizedJourney = journeyData.map((visit: any) => ({
              ...visit,
              actions: normalizeArray(visit.actions)
            }));

            console.log('📊 Normalized stage journey:', normalizedJourney);
            setStageJourney(normalizedJourney);

            // Auto-expand current stage
            const currentStage = normalizedJourney.find(s => s.isCurrentStage);
            if (currentStage) {
              setExpandedStages({ [currentStage.visitNumber]: true });
            }
          } else {
            setStageJourney([]);
            setError("No stage journey data available");
          }
        } else {
          setError(response.message || "Failed to load stage journey");
        }
      } catch (err: any) {
        setError(err.message || "Error loading stage journey");
      } finally {
        setLoading(false);
      }
    };

    fetchJourney();
  }, [client.id]);

  const toggleStage = (visitNumber: number) => {
    setExpandedStages((prev) => ({
      ...prev,
      [visitNumber]: !prev[visitNumber],
    }));
  };

  const getStageIcon = (isCurrent: boolean) => {
    return isCurrent ? "●" : "○";
  };

  const getStatusColor = (stageName: string) => {
    switch (stageName.toLowerCase()) {
      case "sales": return "text-blue-600";
      case "resume": return "text-orange-600";
      case "marketing": return "text-green-600";
      case "remarketing": return "text-purple-600";
      case "placed": return "text-emerald-600";
      case "backed-out": return "text-red-600";
      case "on-hold": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const formatDuration = (days: number, businessDays: number) => {
    return `${businessDays}bd (${days}d)`;
  };

  const formatDateRange = (startDate: string, endDate: string | null) => {
    const start = formatDateEST(startDate).split(",")[0];
    const end = endDate ? formatDateEST(endDate).split(",")[0] : "Present";
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="w-5 h-5 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading journey...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-500">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {stageJourney.map((visit) => {
        const isExpanded = expandedStages[visit.visitNumber] || false;
        const hasMultipleVisits = stageJourney.filter(v => v.stageName === visit.stageName).length > 1;

        return (
          <div key={`${visit.stageName}-${visit.visitNumber}`} className="border-b border-gray-100 last:border-0">
            {/* Compact Stage Row */}
            <button
              onClick={() => toggleStage(visit.visitNumber)}
              className="w-full py-3 px-2 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                {/* Left: Icon, Chevron, Name, Visit Number */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={`text-sm font-medium ${getStatusColor(visit.stageName)}`}>
                    {getStageIcon(visit.isCurrentStage)}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {visit.stageDisplayName}
                  </span>
                  {hasMultipleVisits && (
                    <Badge variant="outline" className="text-xs h-5 px-1.5">
                      #{visit.visitNumber}
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">
                    ({visit.actionsCompleted}/{visit.totalActions})
                  </span>
                </div>

                {/* Right: Duration + Current Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {formatDuration(visit.durationDays, visit.durationBusinessDays)}
                  </span>
                  {visit.isCurrentStage && (
                    <Badge className="bg-green-100 text-green-700 text-xs border-green-300">
                      Current
                    </Badge>
                  )}
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-3 pb-3 space-y-2 bg-gray-50/50 border-l-2 border-gray-200 ml-2">
                {/* Date Range */}
                <div className="flex items-center gap-2 text-xs text-gray-600 px-2 pt-2">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formatDateRange(visit.startDate, visit.endDate)}</span>
                </div>

                {/* Assigned Person */}
                {visit.assignedPersonName && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 px-2">
                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{visit.assignedPersonName}</span>
                    {visit.assignedPersonRole && (
                      <Badge variant="outline" className="text-xs h-5 px-1.5">
                        {visit.assignedPersonRole}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions List */}
                {visit.actions && visit.actions.length > 0 && (
                  <div className="space-y-2 px-2">
                    <div className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      Actions Performed:
                    </div>
                    {visit.actions.map((action, idx) => (
                      <div
                        key={`${action.actionType}-${idx}`}
                        className="bg-white rounded border border-gray-200 overflow-hidden"
                      >
                        {/* Action Header */}
                        <div className="flex items-center gap-2 py-1.5 px-2 text-xs">
                          <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                          <span className="font-medium text-gray-900 flex-1">{action.actionLabel}</span>
                          {action.performedBy && (
                            <span className="text-gray-500 text-xs">{action.performedBy}</span>
                          )}
                          <span className="text-gray-400 text-xs">
                            {formatDateEST(action.timestamp).split(",")[0]}
                          </span>
                        </div>

                        {/* Action Notes/Comment */}
                        {action.notes && (
                          <div className="px-2 pb-1.5 text-xs">
                            <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1 flex items-start gap-1.5">
                              <MessageSquare className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-amber-900 font-medium text-[10px] uppercase tracking-wide block mb-0.5">Comment:</span>
                                <span className="text-gray-700">{action.notes}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* No Actions Message */}
                {(!visit.actions || visit.actions.length === 0) && (
                  <div className="px-2 py-2 text-xs text-gray-500 italic">
                    No actions recorded for this stage visit
                  </div>
                )}

                {/* Transition Info with Notes */}
                {visit.endedReason && (
                  <div className="mx-2 mt-2 bg-blue-50 border border-blue-200 rounded overflow-hidden">
                    {/* Transition Header */}
                    <div className="px-2 py-1.5 text-xs border-b border-blue-200 bg-blue-100/50">
                      <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                        <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-[8px]">→</span>
                        </div>
                        <span>Stage Transition</span>
                      </div>
                    </div>

                    {/* Transition Details */}
                    <div className="px-2 py-1.5 text-xs space-y-1">
                      <div className="text-gray-700">
                        <span className="font-medium">To:</span> {visit.endedReason.replace('Moved to ', '')}
                      </div>
                      {visit.transitionedBy && (
                        <div className="text-gray-600">
                          <span className="font-medium">By:</span> {visit.transitionedBy}
                        </div>
                      )}

                      {/* Transition Notes/Comment */}
                      {visit.notes && (
                        <div className="mt-2 bg-blue-100 border border-blue-300 rounded px-2 py-1">
                          <div className="flex items-start gap-1.5">
                            <MessageSquare className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="text-blue-900 font-medium text-[10px] uppercase tracking-wide block mb-0.5">Transition Comment:</span>
                              <span className="text-gray-700">{visit.notes}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {stageJourney.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No stage journey found</p>
        </div>
      )}
    </div>
  );
}
