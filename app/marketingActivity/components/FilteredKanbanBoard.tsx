"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "../../../components/ui/button";
import { InterviewCard } from "./InterviewCard";
import InfiniteScroll from "react-infinite-scroll-component";
import type {
  MarketingInterview,
  FilterState,
  MarketingClient,
  MarketingApplicationCount,
} from "../../types/MarketingActivity/Marketing";
import dayjs from "dayjs";

interface FilteredKanbanBoardProps {
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
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onInterviewClick: (interview: MarketingInterview) => void;
  applicationCounts: Record<string, MarketingApplicationCount>;
  activeInterviewId: number | null;
}

export function FilteredKanbanBoard({
  receivedClients,
  scheduledClients,
  receivedInterviews,
  scheduledInterviews,
  applicationClients,
  filters,
  setFilters,
  onInterviewClick,
  applicationCounts,
  activeInterviewId,
}: FilteredKanbanBoardProps) {
  const [sortBy, setSortBy] = useState<"date" | "client" | null>(null);
  const [filteredPage, setFilteredPage] = useState(1);
  const pageSize = 12;

  const allInterviews = useMemo(() => {
    // Use receivedClients as the primary data source (like the old working code)
    return receivedClients.flatMap((client) =>
      client.interviews.map((interview) => ({
        ...interview,
        clientName: client.clientName,
        recruiterName: client.recruiterName,
      }))
    );
  }, [receivedClients]);

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
            return (
              interview.interviewDate &&
              new Date(interview.interviewDate).toISOString().split("T")[0] ===
                dayjs().format("YYYY-MM-DD")
            );
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

  const filteredInterviewsByClient = useMemo(
    () => filterInterviews(allInterviews),
    [allInterviews, filters]
  );

  const sortedInterviews = useMemo(() => {
    let sorted = [...filteredInterviewsByClient];

    if (sortBy === "client") {
      sorted.sort((a, b) =>
        (a.clientName || "").localeCompare(b.clientName || "")
      );
    } else if (sortBy === "date") {
      sorted.sort((a, b) => {
        const dateA = a.interviewDate ? new Date(a.interviewDate).getTime() : 0;
        const dateB = b.interviewDate ? new Date(b.interviewDate).getTime() : 0;
        return dateB - dateA; // Most recent first
      });
    }

    return sorted;
  }, [filteredInterviewsByClient, sortBy]);

  const paginatedInterviews = sortedInterviews.slice(
    0,
    filteredPage * pageSize
  );

  // Debug logging
  console.log("FilteredKanbanBoard render:", {
    filteredPage,
    pageSize,
    paginatedCount: paginatedInterviews.length,
    totalCount: sortedInterviews.length,
    hasMore: paginatedInterviews.length < sortedInterviews.length,
  });

  const loadMoreNonStandup = useCallback(() => {
    setFilteredPage((prev) => prev + 1);
  }, []);

  // Load more function for infinite scroll
  const fetchMoreData = () => {
    if (paginatedInterviews.length >= sortedInterviews.length) return;
    loadMoreNonStandup();
  };

  const handleSortBy = (sortType: "date" | "client") => {
    setSortBy(sortBy === sortType ? null : sortType);
    setFilteredPage(1); // Reset pagination when sorting changes
  };

  return (
    <div className="p-3 sm:p-6 bg-transparent w-full min-h-screen">
      {/* Sort Options */}
      <div className="flex justify-start mb-3 sm:mb-4 gap-2 flex-wrap">
        <div className="flex border border-[#682A53] rounded-lg overflow-hidden">
          <Button
            onClick={() => handleSortBy("client")}
            className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm border-0 rounded-none ${
              sortBy === "client"
                ? "bg-[#FDC500] text-[#682A53]"
                : "bg-white text-[#682A53] hover:bg-[#682A53] hover:text-white"
            }`}
          >
            Sort by Client
          </Button>
          <Button
            onClick={() => handleSortBy("date")}
            className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm border-0 rounded-none ${
              sortBy === "date"
                ? "bg-[#FDC500] text-[#682A53]"
                : "bg-white text-[#682A53] hover:bg-[#682A53] hover:text-white"
            }`}
          >
            Sort by Date
          </Button>
        </div>
      </div>

      {/* Interviews Grid */}
      {paginatedInterviews.length === 0 ? (
        <div className="text-center py-8 sm:py-16 text-gray-500 text-sm sm:text-base">
          No interviews found for the current filters.
        </div>
      ) : (
        <InfiniteScroll
          dataLength={paginatedInterviews.length}
          next={fetchMoreData}
          hasMore={paginatedInterviews.length < sortedInterviews.length}
          loader={
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#682A53] mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">
                Loading more interviews...
              </p>
            </div>
          }
          scrollableTarget="scrollableDiv"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
            {paginatedInterviews.map((interview) => (
              <InterviewCard
                key={interview.interviewChainID}
                interview={interview}
                onInterviewClick={onInterviewClick}
                activeInterviewId={activeInterviewId}
                section="filtered"
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}
