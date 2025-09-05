"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { InterviewCard } from "./InterviewCard";
import type {
  MarketingInterview,
  StandupFilterState,
  MarketingClient,
  MarketingApplicationCount,
} from "../../types/MarketingActivity/Marketing";

interface StandupKanbanBoardProps {
  receivedClients: MarketingClient[];
  scheduledClients: MarketingClient[];
  receivedInterviews: (MarketingInterview & {
    clientName: string;
    recruiterName: string | null;
  })[];
  scheduledInterviews: (MarketingInterview & {
    clientName: string;
    recruiterName: string | null;
  })[];
  applicationClients: Record<string, MarketingApplicationCount>;
  filters: StandupFilterState;
  setFilters: (filters: StandupFilterState) => void;
  onInterviewClick: (interview: MarketingInterview) => void;
  applicationCounts: Record<string, MarketingApplicationCount>;
  todayStats: {
    received: {
      total: number;
      screening: number;
      technical: number;
      finalRound: number;
    };
    scheduled: {
      total: number;
      screening: number;
      technical: number;
      finalRound: number;
    };
  } | null;
  activeInterviewId: number | null;
}

export function StandupKanbanBoard({
  receivedClients,
  scheduledClients,
  receivedInterviews,
  scheduledInterviews,
  applicationClients,
  filters,
  setFilters,
  onInterviewClick,
  applicationCounts,
  todayStats,
  activeInterviewId,
}: StandupKanbanBoardProps) {

  const filterInterviews = (
    interviews: (MarketingInterview & {
      clientName: string;
      recruiterName: string | null;
    })[]
  ) => {
    return interviews.filter((interview) => {
      const matchesSearch =
        !filters.searchQuery ||
        filters.searchQuery
          .toLowerCase()
          .split(" ")
          .every((word) =>
            [
              interview.clientName?.toLowerCase() ?? "",
              interview.endClientName?.toLowerCase() ?? "",
              interview.technology?.toLowerCase() ?? "",
              interview.interviewStatus?.toLowerCase() ?? "",
              interview.recruiterName?.toLowerCase() ?? "",
              interview.interviewType?.toLowerCase() ?? "",
            ].some((field) => field.includes(word))
          );

      const matchesQuickFilters = filters.quickFilters.every((filter) => {
        switch (filter.toLowerCase()) {
          case "today":
            // In standup mode, API already returns only today's interviews, so skip this filter
            return true;
          case "scheduled":
            return interview.interviewStatus === "Scheduled";
          case "completed":
            return interview.interviewStatus === "Completed";
          case "screening":
            return interview.interviewType === "Screening";
          case "technical":
            return (
              interview.interviewType === "Technical" ||
              interview.interviewType === "Technical1" ||
              interview.interviewType === "Technical2" ||
              interview.interviewType === "Technical3" ||
              interview.interviewType === "Technical Round 1"
            );
          case "final round":
            return (
              interview.interviewType === "Final Discussion" ||
              interview.interviewType === "Final Round"
            );
          default:
            return true;
        }
      });

      return matchesSearch && matchesQuickFilters;
    });
  };

  const filteredReceivedInterviews = useMemo(() => {
    const filtered = filterInterviews(receivedInterviews);
    console.log(
      "Filtered received interviews:",
      filtered.length,
      "out of",
      receivedInterviews.length
    );
    return filtered;
  }, [receivedInterviews, filters]);

  const filteredScheduledInterviews = useMemo(() => {
    const filtered = filterInterviews(scheduledInterviews);
    console.log(
      "Filtered scheduled interviews:",
      filtered.length,
      "out of",
      scheduledInterviews.length
    );
    return filtered;
  }, [scheduledInterviews, filters]);

  // Show all interviews in standup mode - no pagination
  const displayReceivedInterviews = filteredReceivedInterviews;
  const displayScheduledInterviews = filteredScheduledInterviews;

  return (
    <div className="p-3 sm:p-6 bg-transparent w-full max-w-full box-border">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Received Interviews Column */}
        <Card className="bg-white shadow-md border border-gray-200">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-[#682A53]">
                Received Interviews
              </h3>
              <Badge className="bg-[#FDC500] text-[#682A53] text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 rounded-full">
                {todayStats?.received.total || 0}
              </Badge>
            </div>

            {/* Stats Cards */}
            {todayStats && (
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                <Card
                  className="flex-1 min-w-[60px] sm:min-w-[80px] p-1 sm:p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    !filters.quickFilters.includes("screening") &&
                    setFilters({
                      ...filters,
                      quickFilters: [...filters.quickFilters, "screening"],
                    })
                  }
                >
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-[#682A53]">
                      {todayStats.received.screening}
                    </div>
                    <div className="text-xs text-gray-600">Screening</div>
                  </div>
                </Card>

                <Card
                  className="flex-1 min-w-[60px] sm:min-w-[80px] p-1 sm:p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    !filters.quickFilters.includes("technical") &&
                    setFilters({
                      ...filters,
                      quickFilters: [...filters.quickFilters, "technical"],
                    })
                  }
                >
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-[#682A53]">
                      {todayStats.received.technical}
                    </div>
                    <div className="text-xs text-gray-600">Technical</div>
                  </div>
                </Card>

                <Card
                  className="flex-1 min-w-[60px] sm:min-w-[80px] p-1 sm:p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    !filters.quickFilters.includes("final round") &&
                    setFilters({
                      ...filters,
                      quickFilters: [...filters.quickFilters, "final round"],
                    })
                  }
                >
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-[#682A53]">
                      {todayStats.received.finalRound}
                    </div>
                    <div className="text-xs text-gray-600">Final</div>
                  </div>
                </Card>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            {filteredReceivedInterviews.length === 0 ? (
              <div className="text-center py-4 sm:py-8 text-gray-500 text-sm sm:text-base">
                No received interviews found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {displayReceivedInterviews.map((interview) => (
                  <InterviewCard
                    key={interview.interviewChainID}
                    interview={interview}
                    onInterviewClick={onInterviewClick}
                    activeInterviewId={activeInterviewId}
                    section="received"
                  />
                ))}
              </div>
            )}

          </CardContent>
        </Card>

        {/* Scheduled Interviews Column */}
        <Card className="bg-white shadow-md border border-gray-200">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-[#682A53]">
                Scheduled Interviews
              </h3>
              <Badge className="bg-[#FDC500] text-[#682A53] text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 rounded-full">
                {todayStats?.scheduled.total || 0}
              </Badge>
            </div>

            {/* Stats Cards */}
            {todayStats && (
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                <Card
                  className="flex-1 min-w-[60px] sm:min-w-[80px] p-1 sm:p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    !filters.quickFilters.includes("screening") &&
                    setFilters({
                      ...filters,
                      quickFilters: [...filters.quickFilters, "screening"],
                    })
                  }
                >
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-[#682A53]">
                      {todayStats.scheduled.screening}
                    </div>
                    <div className="text-xs text-gray-600">Screening</div>
                  </div>
                </Card>

                <Card
                  className="flex-1 min-w-[60px] sm:min-w-[80px] p-1 sm:p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    !filters.quickFilters.includes("technical") &&
                    setFilters({
                      ...filters,
                      quickFilters: [...filters.quickFilters, "technical"],
                    })
                  }
                >
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-[#682A53]">
                      {todayStats.scheduled.technical}
                    </div>
                    <div className="text-xs text-gray-600">Technical</div>
                  </div>
                </Card>

                <Card
                  className="flex-1 min-w-[60px] sm:min-w-[80px] p-1 sm:p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    !filters.quickFilters.includes("final round") &&
                    setFilters({
                      ...filters,
                      quickFilters: [...filters.quickFilters, "final round"],
                    })
                  }
                >
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-[#682A53]">
                      {todayStats.scheduled.finalRound}
                    </div>
                    <div className="text-xs text-gray-600">Final</div>
                  </div>
                </Card>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            {filteredScheduledInterviews.length === 0 ? (
              <div className="text-center py-4 sm:py-8 text-gray-500 text-sm sm:text-base">
                No scheduled interviews found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {displayScheduledInterviews.map((interview) => (
                  <InterviewCard
                    key={interview.interviewChainID}
                    interview={interview}
                    onInterviewClick={onInterviewClick}
                    activeInterviewId={activeInterviewId}
                    section="scheduled"
                  />
                ))}
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
