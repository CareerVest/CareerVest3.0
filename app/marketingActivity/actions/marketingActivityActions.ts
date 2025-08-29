import axiosInstance from "../../../lib/axiosInstance";
import type {
  MarketingClient,
  MarketingApplicationCount,
  StandupDashboard,
  FilteredDashboard,
} from "../../types/MarketingActivity/Marketing";

interface DashboardParams {
  recruiterId?: number;
  date?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  quickFilters?: string[];
}

// Fetch Standup Mode dashboard data
export const fetchStandupDashboardData = async (
  recruiterId?: number,
  date?: string
): Promise<StandupDashboard> => {
  try {
    const params: DashboardParams = {};
    if (recruiterId) params.recruiterId = recruiterId;
    if (date) params.date = date;

    const response = await axiosInstance.get(
      "/api/v1/marketing/dashboard/standup",
      { params }
    );

    const data: StandupDashboard = response.data;
    console.log("🔹 Raw Standup Dashboard Data:", data);
    return data;
  } catch (error: any) {
    console.error("Error fetching standup dashboard data:", error);
    throw new Error(
      `Failed to fetch standup dashboard data: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// Fetch Filtered Mode dashboard data
export const fetchFilteredDashboardData = async (
  recruiterId?: number,
  date?: string,
  status?: string,
  type?: string,
  dateRange?: [Date | null, Date | null],
  searchQuery?: string,
  quickFilters?: string[]
): Promise<FilteredDashboard> => {
  try {
    const params: DashboardParams = {};
    if (recruiterId) params.recruiterId = recruiterId;
    if (date) params.date = date;
    else params.date = new Date().toISOString().split("T")[0];
    if (status) params.status = status;
    if (type) params.type = type;
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.startDate = dateRange[0].toISOString().split("T")[0];
      params.endDate = dateRange[1].toISOString().split("T")[0];
    }
    if (searchQuery) params.searchQuery = searchQuery;
    if (quickFilters && quickFilters.length > 0) {
      params.quickFilters = quickFilters;
    }

    const response = await axiosInstance.get(
      "/api/v1/marketing/dashboard/filtered",
      { params }
    );

    const data: FilteredDashboard = response.data;
    console.log("🔹 Raw Filtered Dashboard Data:", data);
    return data;
  } catch (error: any) {
    console.error("Error fetching filtered dashboard data:", error);
    throw new Error(
      `Failed to fetch filtered dashboard data: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};
