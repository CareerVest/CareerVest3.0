"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type {
  Interview,
  InterviewChain,
} from "../../types/interviewChain/interviewChain";
import InterviewChainSearch from "./interviewChainSearch";
import { useRouter, useSearchParams } from "next/navigation";

interface InterviewChainHubProps {
  chains: InterviewChain[];
  onEndInterview: (
    chain: InterviewChain,
    isEditing: boolean,
    interview?: Interview
  ) => void;
  onAddNewInterview: (chain: InterviewChain) => void;
  onViewChain: (chain: InterviewChain) => void;
  onCreateNewChain: () => void;
}

export default function InterviewChainHub({
  chains,
  onEndInterview,
  onAddNewInterview,
  onViewChain,
  onCreateNewChain,
}: InterviewChainHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize search text from URL params
  const [searchText, setSearchText] = useState(() => {
    return searchParams.get("search") || "";
  });
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [displayedChains, setDisplayedChains] = useState<InterviewChain[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 20;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update URL when search text changes
  const updateSearchParams = useCallback(
    (newSearchText: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newSearchText.trim()) {
        params.set("search", newSearchText);
      } else {
        params.delete("search");
      }
      router.replace(`/interviewChains?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Handle search text change with immediate response
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchText(value);

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Update URL immediately for better responsiveness
      updateSearchParams(value);
    },
    [updateSearchParams]
  );

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  // Reset all filters and search
  const resetAllFilters = useCallback(() => {
    setSearchText("");
    setStatusFilter("All");
    // Clear URL params
    const params = new URLSearchParams();
    router.replace(`/interviewChains`);
  }, [router]);

  // Remove duplicates from chains array to prevent duplicate key errors
  const uniqueChains = chains.filter(
    (chain, index, self) => index === self.findIndex((c) => c.id === chain.id)
  );

  // Filter chains based on search and status with deduplication
  const filteredChains = uniqueChains
    .filter((chain) => {
      const searchTerms = searchText
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const matchesStatus =
        statusFilter === "All" ||
        chain.status?.toLowerCase() === statusFilter.toLowerCase();

      // Debug: Log status matching for troubleshooting
      if (statusFilter !== "All") {
        console.log(
          `Chain ${chain.id}: status="${chain.status}", filter="${statusFilter}", matches=${matchesStatus}`
        );
      }

      if (!searchTerms.length) return matchesStatus;

      // Create a comprehensive searchable string for better matching
      const searchableString = [
        chain.endClientName || "",
        chain.endClientRecruiterName || "",
        chain.endClientRecruiterEmail || "",
        chain.endClientRecruiterPhone || "",
        chain.endClientRecruiterLinkedIn || "",
        chain.clientName || "",
        chain.recruiterName || "",
        chain.position || "",
        chain.latestInterviewStatus || "",
        chain.latestInterviewType || "",
        // Include interview data for comprehensive search
        ...chain.interviews.flatMap((interview) => [
          interview.EndClientName || "",
          interview.EndClientRecruiterName || "",
          interview.EndClientRecruiterEmail || "",
          interview.EndClientRecruiterPhone || "",
          interview.EndClientRecruiterLinkedIn || "",
          interview.Position || "",
          interview.InterviewType || "",
          interview.InterviewSupport || "",
          interview.InterviewFeedback || "",
          interview.Comments || "",
          interview.CreatedBy || "",
          interview.UpdatedBy || "",
        ]),
      ]
        .join(" ")
        .toLowerCase();

      // Check if all search terms are found in the searchable string
      const matchesSearch = searchTerms.every((term) =>
        searchableString.includes(term)
      );

      // Debug: Log search matching for troubleshooting
      if (searchTerms.length > 0) {
        console.log(
          `Chain ${
            chain.id
          }: searchTerms="${searchTerms}", searchableString="${searchableString.substring(
            0,
            100
          )}...", matchesSearch=${matchesSearch}`
        );
      }

      return matchesSearch && matchesStatus;
    })
    // Remove duplicates based on chain ID
    .filter(
      (chain, index, self) => index === self.findIndex((c) => c.id === chain.id)
    );

  // Debug logging
  console.log("InterviewChainHub - chains prop:", chains);
  console.log("InterviewChainHub - chains length:", chains?.length);
  console.log("InterviewChainHub - searchText:", searchText);
  console.log("InterviewChainHub - statusFilter:", statusFilter);
  console.log(
    "InterviewChainHub - filteredChains length:",
    filteredChains?.length
  );
  console.log(
    "InterviewChainHub - displayedChains length:",
    displayedChains?.length
  );

  // Debug: Log unique status values to see what's in the data
  const uniqueStatuses = Array.from(
    new Set(uniqueChains.map((chain) => chain.status))
  );
  console.log("InterviewChainHub - unique statuses in data:", uniqueStatuses);

  // Debug: Log detailed status breakdown
  const statusBreakdown = uniqueChains.reduce((acc, chain) => {
    const status = chain.status || "null";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log("InterviewChainHub - status breakdown:", statusBreakdown);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(0);
    setDisplayedChains([]);
    setHasMore(true);
  }, [searchText, statusFilter]);

  // Load more items
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newItems = filteredChains.slice(startIndex, endIndex);

      setDisplayedChains((prev) => [...prev, ...newItems]);
      setCurrentPage((prev) => prev + 1);
      setHasMore(endIndex < filteredChains.length);
      setIsLoading(false);
    }, 300);
  }, [currentPage, filteredChains, isLoading, hasMore]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoading]);

  // Initial load - trigger when filteredChains changes or when displayedChains is empty
  useEffect(() => {
    if (
      filteredChains.length > 0 &&
      displayedChains.length === 0 &&
      !isLoading
    ) {
      loadMore();
    }
  }, [filteredChains, displayedChains.length, loadMore, isLoading]);

  // Force reload when search is cleared to ensure cards are visible
  useEffect(() => {
    if (
      searchText === "" &&
      filteredChains.length > 0 &&
      displayedChains.length === 0
    ) {
      loadMore();
    }
  }, [searchText, filteredChains.length, displayedChains.length, loadMore]);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Successful":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Unsuccessful":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Calculate statistics - Use filtered chains when search is active, otherwise use total chains
  const chainsToCount = searchText.trim() ? filteredChains : chains;
  const totalChains = chainsToCount.length;
  const activeChains = chainsToCount.filter(
    (chain) => chain.status?.toLowerCase() === "active"
  ).length;
  const successfulChains = chainsToCount.filter(
    (chain) => chain.status?.toLowerCase() === "successful"
  ).length;
  const unsuccessfulChains = chainsToCount.filter(
    (chain) => chain.status?.toLowerCase() === "unsuccessful"
  ).length;

  // Also check for other possible status variations
  const allSuccessfulChains = chainsToCount.filter(
    (chain) =>
      chain.status?.toLowerCase() === "successful" ||
      chain.status?.toLowerCase() === "success" ||
      chain.status === "Successful" ||
      chain.status === "SUCCESSFUL"
  ).length;

  // Debug: Log statistics calculation
  console.log("InterviewChainHub - Statistics calculation:");
  console.log("  Search active:", !!searchText.trim());
  console.log(
    "  Chains to count:",
    searchText.trim() ? "filteredChains" : "total chains"
  );
  console.log("  Total chains:", totalChains);
  console.log("  Active chains:", activeChains);
  console.log("  Successful chains:", successfulChains);
  console.log(
    "  All successful chains (including variations):",
    allSuccessfulChains
  );
  console.log("  Unsuccessful chains:", unsuccessfulChains);
  const totalInterviews = chainsToCount.reduce(
    (sum, chain) => sum + chain.interviews.length,
    0
  );
  const avgInterviewsPerChain =
    totalChains > 0 ? (totalInterviews / totalChains).toFixed(1) : "0";

  return (
    <div className="w-full box-border space-y-6">
      <InterviewChainSearch
        searchText={searchText}
        setSearchText={handleSearchChange}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        totalChains={filteredChains.length}
        resetAllFilters={resetAllFilters}
      />

      {/* Dashboard Overview - Moved below search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className={`bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 cursor-pointer transition-all duration-200 hover:scale-105 hover:from-blue-200 hover:to-blue-300 ${
            statusFilter === "All" ? "ring-2 ring-blue-400 ring-offset-2" : ""
          }`}
          onClick={() => handleStatusFilterChange("All")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Total Chains</p>
                <p className="text-2xl font-bold">{totalChains}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-r from-green-100 to-green-200 text-green-800 cursor-pointer transition-all duration-200 hover:scale-105 hover:from-green-200 hover:to-green-300 ${
            statusFilter === "Active"
              ? "ring-2 ring-green-400 ring-offset-2"
              : ""
          }`}
          onClick={() => handleStatusFilterChange("Active")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Active</p>
                <p className="text-2xl font-bold">{activeChains}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 cursor-pointer transition-all duration-200 hover:scale-105 hover:from-emerald-200 hover:to-emerald-300 ${
            statusFilter === "Successful"
              ? "ring-2 ring-emerald-400 ring-offset-2"
              : ""
          }`}
          onClick={() => handleStatusFilterChange("Successful")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Successful</p>
                <p className="text-2xl font-bold">{allSuccessfulChains}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-r from-red-100 to-red-200 text-red-800 cursor-pointer transition-all duration-200 hover:scale-105 hover:from-red-200 hover:to-red-300 ${
            statusFilter === "Unsuccessful"
              ? "ring-2 ring-red-400 ring-offset-2"
              : ""
          }`}
          onClick={() => handleStatusFilterChange("Unsuccessful")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Unsuccessful</p>
                <p className="text-2xl font-bold">{unsuccessfulChains}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-[#682A53] rounded-full"></div>
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {displayedChains.length}
            </span>{" "}
            of {filteredChains.length} interview chains
            {statusFilter !== "All" && (
              <span className="text-gray-500">
                {" "}
                (filtered by {statusFilter})
              </span>
            )}
            {searchText && (
              <span className="text-gray-500"> matching "{searchText}"</span>
            )}
          </p>
        </div>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(displayedChains.length > 0 ? displayedChains : filteredChains).map(
          (chain, index) => {
            return (
              <Card
                key={`${chain.id}-${index}`}
                onClick={() => onViewChain(chain)}
                className="rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-gray-200 hover:border-[#682A53]/30"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-semibold text-[#682A53] flex-grow overflow-hidden text-ellipsis whitespace-nowrap pr-2">
                      {chain.endClientName || "Unnamed Client"}
                    </h3>
                    <Badge
                      className={`${getStatusColor(
                        chain.status
                      )} font-bold text-xs h-6 px-2`}
                    >
                      {chain.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Client:</span>{" "}
                      {chain.clientName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Recruiter:</span>{" "}
                      {chain.recruiterName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Position:</span>{" "}
                      {chain.position || "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(chain.updatedAt)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {chain.rounds} interview{chain.rounds !== 1 ? "s" : ""}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>

      {/* Loading Indicator */}
      {hasMore && (
        <div ref={loadingRef} className="flex justify-center items-center py-8">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#682A53]"></div>
              <span className="text-sm text-gray-600">
                Loading more chains...
              </span>
            </div>
          ) : (
            <div className="h-4"></div> // Invisible element for intersection observer
          )}
        </div>
      )}

      {/* End of Results */}
      {!hasMore && displayedChains.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="text-sm text-gray-500">
            {displayedChains.length === totalChains
              ? "All chains loaded"
              : "No more chains to load"}
          </div>
        </div>
      )}

      {/* Empty State */}
      {displayedChains.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">
            No interview chains found
          </p>
          <p className="text-sm text-gray-500 text-center">
            {searchText || statusFilter !== "All"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first interview chain"}
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        onClick={onCreateNewChain}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-[#682A53] to-[#8B5A96] hover:from-[#8B5A96] hover:to-[#682A53] shadow-xl hover:shadow-2xl transition-all duration-300 text-white border-0 group flex items-center justify-center"
        size="lg"
        style={{
          borderRadius: "50%",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderRadius = "24px";
          e.currentTarget.style.width = "192px";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderRadius = "50%";
          e.currentTarget.style.width = "64px";
        }}
      >
        {/* Plus Icon - Always visible */}
        <svg
          className="w-7 h-7 group-hover:hidden flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>

        {/* Text - Visible on hover */}
        <span className="hidden group-hover:block text-sm font-medium whitespace-nowrap ml-2">
          Add Interview
        </span>
      </Button>
    </div>
  );
}
