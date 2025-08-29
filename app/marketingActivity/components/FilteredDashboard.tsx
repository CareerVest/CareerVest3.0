"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { FilteredKanbanBoard } from "./FilteredKanbanBoard";
import { NonStandupFilterBar } from "./NonStandupFilterBar";
import { ApplicationCountsSidebar } from "./ApplicationCountsSidebar";
import { fetchFilteredDashboardData } from "../actions/marketingActivityActions";
import { useApiWithLoading } from "../../../lib/apiWithLoading";
import type {
  MarketingInterview,
  FilterState,
  MarketingClient,
  MarketingApplicationCount,
} from "../../types/MarketingActivity/Marketing";
import dayjs, { Dayjs } from "dayjs";

const buildQueryString = (filters: FilterState): string => {
  const parts: string[] = [];
  if (filters.status && filters.status !== "all")
    parts.push(`status:${filters.status}`);
  if (filters.type && filters.type !== "all")
    parts.push(`type:${filters.type}`);
  if (filters.dateRange[0] && filters.dateRange[1]) {
    const startDate = filters.dateRange[0].format("YYYY-MM-DD");
    const endDate = filters.dateRange[1].format("YYYY-MM-DD");
    parts.push(
      startDate === endDate ? startDate : `${startDate} to ${endDate}`
    );
  }
  return parts.length > 0 ? parts.join(" ") : "";
};

const transformClientListToMarketingClient = (
  client: any,
  clientCounts: Record<number, any> | null
): MarketingClient => {
  const interviews: MarketingInterview[] = Array.isArray(
    client.interviews?.$values
  )
    ? client.interviews.$values.map((i: any) => ({
        interviewChainID: i.interviewChainID ?? 0,
        interviewEntryDate: i.interviewEntryDate ?? "",
        recruiterID: i.recruiterID ?? null,
        recruiterName: i.recruiterName ?? null,
        interviewDate: i.interviewDate ?? null,
        interviewStartTime: i.interviewStartTime ?? null,
        interviewEndTime: i.interviewEndTime ?? null,
        clientID: i.clientID ?? null,
        clientName: i.clientName ?? null,
        interviewType: i.interviewType ?? null,
        interviewStatus: i.interviewStatus ?? null,
        interviewMethod: i.interviewMethod ?? null,
        interviewOutcome: i.interviewOutcome ?? null,
        interviewSupport: i.interviewSupport ?? null,
        interviewFeedback: i.interviewFeedback ?? null,
        comments: i.comments ?? null,
        endClientName: i.endClientName ?? null,
        technology: i.technology ?? null,
        chainStatus: i.chainStatus ?? null,
        rounds: i.rounds ?? 0,
        endClientRecruiterName: i.endClientRecruiterName ?? null,
        endClientRecruiterEmail: i.endClientRecruiterEmail ?? null,
        endClientRecruiterPhone: i.endClientRecruiterPhone ?? null,
        endClientRecruiterLinkedIn: i.endClientRecruiterLinkedIn ?? null,
      }))
    : [];
  return {
    clientID: client.clientID ?? 0,
    clientName: client.clientName || "Unknown Client",
    clientStatus: client.clientStatus || "",
    recruiterID: client.recruiterID ?? null,
    recruiterName: client.recruiterName ?? null,
    interviews,
    applicationCount:
      client.applicationCount ||
      (clientCounts && clientCounts[client.clientID]
        ? clientCounts[client.clientID]
        : null),
    screeningCount: client.screeningCount ?? 0,
    technicalCount: client.technicalCount ?? 0,
    finalRoundCount: client.finalRoundCount ?? 0,
  };
};

interface FilteredDashboardProps {
  standupMode: boolean;
  onStandupModeChange: (enabled: boolean) => void;
}

export default function FilteredDashboard({
  standupMode,
  onStandupModeChange,
}: FilteredDashboardProps) {
  const { apiCall } = useApiWithLoading();
  const [selectedInterview, setSelectedInterview] =
    useState<MarketingInterview | null>(null);
  const [activeInterviewId, setActiveInterviewId] = useState<number | null>(
    null
  );
  const [isAddingInterview, setIsAddingInterview] = useState(false);
  const [isApplicationCountsOpen, setIsApplicationCountsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    recruiter: "",
    dateRange: [null, null],
    status: "all",
    type: "all",
    searchQuery: "",
    quickFilters: [],
  });
  const [filteredClients, setFilteredClients] = useState<MarketingClient[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<
    (MarketingInterview & {
      clientName: string;
      recruiterName: string | null;
    })[]
  >([]);
  const [applicationClients, setApplicationClients] = useState<
    Record<string, MarketingApplicationCount>
  >({});
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => buildQueryString(filters), [filters]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        console.log("Fetching filtered dashboard data...");

        const response = await apiCall(
          fetchFilteredDashboardData(
            undefined,
            undefined,
            filters.status !== "all" ? filters.status : undefined,
            filters.type !== "all" ? filters.type : undefined,
            filters.dateRange,
            filters.searchQuery,
            filters.quickFilters
          ),
          { showLoading: true }
        );
        console.log("Filtered data response:", response);

        const filteredClientsList = Object.values(response.clients || {})
          .filter(
            (client: any) =>
              !!client && Array.isArray(client.interviews?.$values)
          )
          .map((client: any) => {
            const transformed = transformClientListToMarketingClient(
              client,
              null
            );
            console.log(
              "Filtered client transformed:",
              transformed.clientID,
              transformed.interviews.length
            );
            return transformed;
          });

        const filteredInterviewsList = filteredClientsList.flatMap((client) =>
          client.interviews.map((interview) => ({
            ...interview,
            clientName: client.clientName,
            recruiterName: client.recruiterName,
          }))
        );

        if (mounted) {
          console.log("Setting filteredClients:", filteredClientsList.length);
          console.log(
            "Setting filteredInterviews:",
            filteredInterviewsList.length
          );
          setFilteredClients(filteredClientsList);
          setFilteredInterviews(filteredInterviewsList);
          setApplicationClients({});
          setError(null);
        }
      } catch (err: any) {
        console.error("Failed to fetch filtered dashboard data:", err);
        if (mounted) {
          setError(
            err.message?.includes("Authentication required")
              ? "Authentication required. Please log in again."
              : err.response?.status === 400
              ? "Invalid filter parameters. Please adjust your filters and try again."
              : "Failed to load data. Please check your filters or try again later."
          );
          setFilteredClients([]);
          setFilteredInterviews([]);
          setApplicationClients({});
        }
              } finally {
          if (mounted) {
            console.log("Fetch complete");
          }
        }
    };

    const timer = setTimeout(loadData, 300);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [filters]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    console.log("Filters changed:", newFilters);
    setFilters(newFilters);
  }, []);

  const handleInterviewClick = (interview: MarketingInterview) => {
    setSelectedInterview(interview);
    setActiveInterviewId(interview.interviewChainID);
    setIsApplicationCountsOpen(false);
  };

  const handleCloseInterview = () => {
    setSelectedInterview(null);
    setActiveInterviewId(null);
    setIsAddingInterview(false);
  };

  const handleUpdateInterview = (updatedInterview: MarketingInterview) => {
    console.log("Updating interview:", updatedInterview);
    setSelectedInterview(null);
    setActiveInterviewId(null);
    const updateInterviews = (
      interviews: (MarketingInterview & {
        clientName: string;
        recruiterName: string | null;
      })[]
    ) =>
      interviews.map((i) =>
        i.interviewChainID === updatedInterview.interviewChainID
          ? {
              ...updatedInterview,
              clientName: i.clientName,
              recruiterName: i.recruiterName,
            }
          : i
      );
    setFilteredInterviews((prev) => updateInterviews(prev));
    setFilteredClients((prev) =>
      prev.map((client) => ({
        ...client,
        interviews: client.interviews.map((i) =>
          i.interviewChainID === updatedInterview.interviewChainID
            ? updatedInterview
            : i
        ),
      }))
    );
  };

  const handleAddInterview = (newInterview: MarketingInterview) => {
    console.log("Adding new interview:", newInterview);
    setIsAddingInterview(false);
    const updateClients = (prevClients: MarketingClient[]) => {
      const client = prevClients.find(
        (c) => c.clientID.toString() === newInterview.clientID?.toString()
      );
      if (client) {
        return prevClients.map((c) =>
          c.clientID.toString() === client.clientID.toString()
            ? {
                ...c,
                interviews: [...c.interviews, newInterview],
                screeningCount:
                  c.screeningCount +
                  (["Screening", "Other (Comment Needed)"].includes(
                    newInterview.interviewType || ""
                  )
                    ? 1
                    : 0),
                technicalCount:
                  c.technicalCount +
                  ([
                    "Technical",
                    "Technical1",
                    "Technical2",
                    "Technical3",
                    "Technical Round 1",
                  ].includes(newInterview.interviewType || "")
                    ? 1
                    : 0),
                finalRoundCount:
                  c.finalRoundCount +
                  (["Final Discussion", "Final Round"].includes(
                    newInterview.interviewType || ""
                  )
                    ? 1
                    : 0),
              }
            : c
        );
      }
      return [
        ...prevClients,
        {
          clientID: newInterview.clientID ?? 0,
          clientName: newInterview.clientName || "Unknown Client",
          clientStatus: "",
          recruiterID: newInterview.recruiterID ?? null,
          recruiterName: newInterview.recruiterName ?? null,
          interviews: [newInterview],
          applicationCount: null,
          screeningCount: ["Screening", "Other (Comment Needed)"].includes(
            newInterview.interviewType || ""
          )
            ? 1
            : 0,
          technicalCount: [
            "Technical",
            "Technical1",
            "Technical2",
            "Technical3",
            "Technical Round 1",
          ].includes(newInterview.interviewType || "")
            ? 1
            : 0,
          finalRoundCount: ["Final Discussion", "Final Round"].includes(
            newInterview.interviewType || ""
          )
            ? 1
            : 0,
        },
      ];
    };
    const newInterviewWithClient = {
      ...newInterview,
      clientName: newInterview.clientName || "Unknown Client",
      recruiterName: newInterview.recruiterName || null,
    };
    setFilteredInterviews((prev) => [...prev, newInterviewWithClient]);
    setFilteredClients(updateClients);
  };

  const handleOpenApplicationCounts = () => {
    setIsApplicationCountsOpen(true);
    setSelectedInterview(null);
    setActiveInterviewId(null);
    setIsAddingInterview(false);
  };

  const handleCloseApplicationCounts = () => {
    setIsApplicationCountsOpen(false);
  };

  const handleSubmitApplicationCounts = async (
    counts: Record<
      string,
      {
        totalManualApplications: number;
        totalEasyApplications: number;
        totalReceivedInterviews: number;
      }
    >
  ) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const updatedCounts: Record<string, MarketingApplicationCount> = {};
      for (const [clientId, count] of Object.entries(counts)) {
        updatedCounts[clientId] = {
          applicationCountID: 0,
          clientID: parseInt(clientId),
          clientName:
            filteredClients.find((c) => c.clientID.toString() === clientId)
              ?.clientName || "",
          recruiterID: null,
          date: today,
          totalManualApplications: count.totalManualApplications,
          totalEasyApplications: count.totalEasyApplications,
          totalReceivedInterviews: count.totalReceivedInterviews,
          createdTS: new Date().toISOString(),
          updatedTS: new Date().toISOString(),
          createdBy: "system",
          updatedBy: "system",
        };
      }
      setFilteredClients((prev) =>
        prev.map((client) => ({
          ...client,
          applicationCount:
            updatedCounts[client.clientID.toString()] ||
            client.applicationCount,
        }))
      );
      setApplicationClients((prev) => ({ ...prev, ...updatedCounts }));
      handleCloseApplicationCounts();
    } catch (err) {
      setError("Failed to submit application counts. Please try again.");
      console.error("❌ Error submitting application counts:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full box-border bg-transparent">
      <NonStandupFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        standupMode={standupMode}
        onOpenApplicationCounts={handleOpenApplicationCounts}
      />

      <div className="flex-grow w-full max-w-full px-0 sm:px-0">
        <FilteredKanbanBoard
          receivedClients={filteredClients}
          scheduledClients={[]}
          receivedInterviews={[]}
          scheduledInterviews={[]}
          applicationClients={applicationClients}
          filters={filters}
          setFilters={setFilters}
          onInterviewClick={handleInterviewClick}
          applicationCounts={applicationClients}
          activeInterviewId={activeInterviewId}
        />

        <Dialog
          open={isApplicationCountsOpen}
          onOpenChange={setIsApplicationCountsOpen}
        >
          <DialogContent className="max-w-[540px] w-full sm:w-[540px] p-0 border-l border-gray-200 bg-transparent">
            <div className="pt-2 w-full max-w-full">
              <ApplicationCountsSidebar
                isOpen={isApplicationCountsOpen}
                onClose={handleCloseApplicationCounts}
                clients={filteredClients}
                onSubmit={handleSubmitApplicationCounts}
                applicationCounts={applicationClients}
              />
            </div>
          </DialogContent>
        </Dialog>

        {error && (
          <Alert className="mb-4 bg-red-500 text-white">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
