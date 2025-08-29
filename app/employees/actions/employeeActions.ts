import axiosInstance from "../../../lib/axiosInstance";
import { Recruiter } from "../../types/employees/recruiter";

interface RecruitersResponse {
  $id: string;
  $values: Recruiter[];
}

interface SalesPersonsResponse {
  $id: string;
  $values: Recruiter[];
}

export async function getRecruiters(): Promise<RecruitersResponse> {
  try {
    const response = await axiosInstance.get("/api/v1/employees/recruiters");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching recruiters:", error);
    throw new Error(
      `Failed to fetch recruiters: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

export async function getSalesPersons(): Promise<SalesPersonsResponse> {
  try {
    const response = await axiosInstance.get("/api/v1/employees/salespersons");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching sales persons:", error);
    throw new Error(
      `Failed to fetch sales persons: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}
