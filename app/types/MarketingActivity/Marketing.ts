import { Dayjs } from "dayjs";

// @/app/types/MarketingActivity/Marketing.ts

export interface MarketingRecruiter {
  id: string;
  name: string;
}

export interface MarketingClient {
  clientID: number;
  clientName: string;
  clientStatus: string;
  recruiterID: number | null;
  recruiterName: string | null;
  interviews: MarketingInterview[];
  applicationCount: MarketingApplicationCount | null;
  screeningCount: number;
  technicalCount: number;
  finalRoundCount: number;
}

export interface MarketingInterview {
  interviewChainID: number;
  interviewEntryDate: string;
  recruiterID: number | null;
  recruiterName: string | null;
  interviewDate: string | null;
  interviewStartTime: string | null;
  interviewEndTime: string | null;
  clientID: number | null;
  clientName: string | null;
  interviewType: string | null;
  interviewStatus: string | null;
  interviewMethod: string | null;
  interviewOutcome: string | null;
  interviewSupport: string | null;
  interviewFeedback: string | null;
  comments: string | null;
  endClientName: string | null;
  technology: string | null;
  chainStatus: string | null;
  rounds: number;
  endClientRecruiterName: string | null;
  endClientRecruiterEmail: string | null;
  endClientRecruiterPhone: string | null;
  endClientRecruiterLinkedIn: string | null;
}

export interface MarketingApplicationCount {
  applicationCountID: number;
  clientID: number;
  clientName: string | null;
  recruiterID: number | null;
  date: string | null;
  totalManualApplications: number;
  totalEasyApplications: number;
  totalReceivedInterviews: number;
  createdTS: string | null;
  updatedTS: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface InterviewSummaryWithClients {
  total: number;
  screening: number;
  technical: number;
  finalRound: number;
  clients: { [key: number]: MarketingClient };
}

export interface StandupDashboard {
  applicationCounts: {
    clientCounts: { [key: number]: MarketingApplicationCount } | null;
  };
  todaysReceivedInterviews: InterviewSummaryWithClients;
  todaysScheduledInterviews: InterviewSummaryWithClients;
}

export interface FilteredDashboard {
  clients: { [key: number]: MarketingClient };
}

export interface FilterState {
  recruiter: string;
  dateRange: [Dayjs | null, Dayjs | null];
  status: string;
  type: string;
  searchQuery: string;
  quickFilters: string[];
}

export interface StandupFilterState {
  selectedDate: Dayjs | null;
  searchQuery: string;
  quickFilters: string[];
}
