"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { StandupKanbanBoard } from "./StandupKanbanBoard";
import { StandupFilterBar } from "./StandupFilterBar";
import { ApplicationCountsSidebar } from "./ApplicationCountsSidebar";
import { fetchStandupDashboardData } from "../actions/marketingActivityActions";
import { useApiWithLoading } from "../../../lib/apiWithLoading";
import type {
  MarketingInterview,
  StandupFilterState,
  MarketingClient,
  MarketingApplicationCount,
} from "../../types/MarketingActivity/Marketing";
import dayjs, { Dayjs } from "dayjs";

const buildQueryString = (filters: StandupFilterState): string => {
  const parts: string[] = [];
  if (filters.selectedDate) {
    parts.push(filters.selectedDate.format("YYYY-MM-DD"));
  }
  if (filters.searchQuery) parts.push(filters.searchQuery);
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

const transformApplicationCountToClient = (
  clientId: number,
  appCount: any
): MarketingApplicationCount => ({
  applicationCountID: appCount.applicationCountID ?? 0,
  clientID: clientId,
  clientName: appCount.clientName || "Unknown Client",
  recruiterID: appCount.recruiterID ?? null,
  date: appCount.date || new Date().toISOString().split("T")[0],
  totalManualApplications: appCount.totalManualApplications ?? 0,
  totalEasyApplications: appCount.totalEasyApplications ?? 0,
  totalReceivedInterviews: appCount.totalReceivedInterviews ?? 0,
  createdTS: appCount.createdTS || new Date().toISOString(),
  updatedTS: appCount.updatedTS || null,
  createdBy: appCount.createdBy || null,
  updatedBy: appCount.updatedBy || null,
});

interface StandupDashboardProps {
  standupMode: boolean;
  onStandupModeChange: (enabled: boolean) => void;
}

export default function StandupDashboard({
  standupMode,
  onStandupModeChange,
}: StandupDashboardProps) {
  const { apiCall } = useApiWithLoading();
  const [selectedInterview, setSelectedInterview] =
    useState<MarketingInterview | null>(null);
  const [activeInterviewId, setActiveInterviewId] = useState<number | null>(
    null
  );
  const [isAddingInterview, setIsAddingInterview] = useState(false);
  const [isApplicationCountsOpen, setIsApplicationCountsOpen] = useState(false);
  const [filters, setFilters] = useState<StandupFilterState>({
    selectedDate: dayjs(),
    searchQuery: "",
    quickFilters: [],
  });
  const [receivedClients, setReceivedClients] = useState<MarketingClient[]>([]);
  const [scheduledClients, setScheduledClients] = useState<MarketingClient[]>(
    []
  );
  const [receivedInterviews, setReceivedInterviews] = useState<
    (MarketingInterview & {
      clientName: string;
      recruiterName: string | null;
    })[]
  >([]);
  const [scheduledInterviews, setScheduledInterviews] = useState<
    (MarketingInterview & {
      clientName: string;
      recruiterName: string | null;
    })[]
  >([]);
  const [applicationClients, setApplicationClients] = useState<
    Record<string, MarketingApplicationCount>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [todayStats, setTodayStats] = useState<{
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
  } | null>(null);

  const query = useMemo(() => buildQueryString(filters), [filters]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        console.log("Fetching dashboard data...");

        const response = await apiCall(
          fetchStandupDashboardData(
            undefined,
            filters.selectedDate?.format("YYYY-MM-DD")
          ),
          { showLoading: true }
        );
        console.log("Standup data response:", response);
        console.log(
          "Selected date:",
          filters.selectedDate?.format("YYYY-MM-DD")
        );
        console.log(
          "Today's received interviews clients:",
          Object.keys(response.todaysReceivedInterviews?.clients || {})
        );
        console.log(
          "Today's scheduled interviews clients:",
          Object.keys(response.todaysScheduledInterviews?.clients || {})
        );

        const clientCounts = response.applicationCounts?.clientCounts || null;

        const receivedClientsList = Object.values(
          response.todaysReceivedInterviews?.clients || {}
        )
          .filter(
            (client: any) =>
              !!client && Array.isArray(client.interviews?.$values)
          )
          .map((client: any) => {
            const transformed = transformClientListToMarketingClient(
              client,
              clientCounts
            );
            console.log(
              "Received client transformed:",
              transformed.clientID,
              transformed.interviews.length
            );
            return transformed;
          });

        const scheduledClientsList = Object.values(
          response.todaysScheduledInterviews?.clients || {}
        )
          .filter(
            (client: any) =>
              !!client && Array.isArray(client.interviews?.$values)
          )
          .map((client: any) => {
            const transformed = transformClientListToMarketingClient(
              client,
              clientCounts
            );
            console.log(
              "Scheduled client transformed:",
              transformed.clientID,
              transformed.interviews.length
            );
            return transformed;
          });

        const receivedInterviewsList = receivedClientsList.flatMap((client) =>
          client.interviews.map((interview) => ({
            ...interview,
            clientName: client.clientName,
            recruiterName: client.recruiterName,
          }))
        );

        const scheduledInterviewsList = scheduledClientsList.flatMap((client) =>
          client.interviews.map((interview) => ({
            ...interview,
            clientName: client.clientName,
            recruiterName: client.recruiterName,
          }))
        );

        const applicationClientsList = clientCounts
          ? Object.entries(clientCounts).reduce((acc, [clientId, appCount]) => {
              acc[clientId] = transformApplicationCountToClient(
                parseInt(clientId),
                appCount
              );
              return acc;
            }, {} as Record<string, MarketingApplicationCount>)
          : {};

        if (mounted) {
          console.log("Setting receivedClients:", receivedClientsList.length);
          console.log("Setting scheduledClients:", scheduledClientsList.length);
          console.log(
            "Setting receivedInterviews:",
            receivedInterviewsList.length
          );
          console.log(
            "Setting scheduledInterviews:",
            scheduledInterviewsList.length
          );
          setReceivedClients(receivedClientsList);
          setScheduledClients(scheduledClientsList);
          setReceivedInterviews(receivedInterviewsList);
          setScheduledInterviews(scheduledInterviewsList);
          setApplicationClients(applicationClientsList);
          setTodayStats({
            received: {
              total: response.todaysReceivedInterviews?.total || 0,
              screening: response.todaysReceivedInterviews?.screening || 0,
              technical: response.todaysReceivedInterviews?.technical || 0,
              finalRound: response.todaysReceivedInterviews?.finalRound || 0,
            },
            scheduled: {
              total: response.todaysScheduledInterviews?.total || 0,
              screening: response.todaysScheduledInterviews?.screening || 0,
              technical: response.todaysScheduledInterviews?.technical || 0,
              finalRound: response.todaysScheduledInterviews?.finalRound || 0,
            },
          });
          setError(null);
        }
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        if (mounted) {
          setError(
            err.message?.includes("Authentication required")
              ? "Authentication required. Please log in again."
              : err.response?.status === 400
              ? "Invalid filter parameters. Please adjust your filters and try again."
              : "Failed to load data. Please check your filters or try again later."
          );
          setReceivedClients([]);
          setScheduledClients([]);
          setReceivedInterviews([]);
          setScheduledInterviews([]);
          setApplicationClients({});
          setTodayStats(null);
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
  }, [filters.selectedDate, filters.quickFilters]);

  const handleFiltersChange = useCallback((newFilters: StandupFilterState) => {
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
    setReceivedInterviews((prev) => updateInterviews(prev));
    setScheduledInterviews((prev) => updateInterviews(prev));
    setReceivedClients((prev) =>
      prev.map((client) => ({
        ...client,
        interviews: client.interviews.map((i) =>
          i.interviewChainID === updatedInterview.interviewChainID
            ? updatedInterview
            : i
        ),
      }))
    );
    setScheduledClients((prev) =>
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
    setReceivedInterviews((prev) => [...prev, newInterviewWithClient]);
    setScheduledInterviews((prev) => [...prev, newInterviewWithClient]);
    setReceivedClients(updateClients);
    setScheduledClients(updateClients);
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
      const today =
        filters.selectedDate?.format("YYYY-MM-DD") ||
        new Date().toISOString().split("T")[0];
      const updatedCounts: Record<string, MarketingApplicationCount> = {};
      for (const [clientId, count] of Object.entries(counts)) {
        updatedCounts[clientId] = {
          applicationCountID: 0,
          clientID: parseInt(clientId),
          clientName:
            receivedClients.find((c) => c.clientID.toString() === clientId)
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
      setReceivedClients((prev) =>
        prev.map((client) => ({
          ...client,
          applicationCount:
            updatedCounts[client.clientID.toString()] ||
            client.applicationCount,
        }))
      );
      setScheduledClients((prev) =>
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
      <StandupFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        standupMode={standupMode}
        onOpenApplicationCounts={handleOpenApplicationCounts}
      />

      <div className="flex-grow w-full max-w-full px-0 sm:px-0">
        <StandupKanbanBoard
          receivedClients={receivedClients}
          scheduledClients={scheduledClients}
          receivedInterviews={receivedInterviews}
          scheduledInterviews={scheduledInterviews}
          applicationClients={applicationClients}
          filters={filters}
          setFilters={setFilters}
          onInterviewClick={handleInterviewClick}
          applicationCounts={applicationClients}
          todayStats={todayStats}
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
                clients={receivedClients.concat(scheduledClients)}
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
