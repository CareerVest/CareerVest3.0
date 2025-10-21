import { Employee } from "../../types/employees/employee";
import { EmployeeDetail } from "../../types/employees/employeeDetail";
import { EmployeeList } from "../../types/employees/employeeList";
import { Recruiter } from "../../types/employees/recruiter";
import axiosInstance from "../../../lib/axiosInstance";
import { useApiWithLoading } from "../../../lib/apiWithLoading";

const normalizeEmployeeData = (employee: EmployeeDetail): Employee => {
  return {
    EmployeeID: employee.EmployeeID || 0,
    FirstName: employee.FirstName?.trim() || "",
    LastName: employee.LastName?.trim() || "",
    PersonalEmailAddress: employee.PersonalEmailAddress?.trim() || "",
    CompanyEmailAddress: employee.CompanyEmailAddress?.trim() || "",
    PersonalPhoneNumber: employee.PersonalPhoneNumber?.trim() || "",
    PersonalPhoneCountryCode: employee.PersonalPhoneCountryCode?.trim() || "",
    JoinedDate: employee.JoinedDate
      ? new Date(employee.JoinedDate).toISOString()
      : null,
    Status: employee.Status || "Active",
    TerminatedDate: employee.TerminatedDate
      ? new Date(employee.TerminatedDate).toISOString()
      : null,
    Role: employee.Role?.trim() || "",
    SupervisorID: employee.SupervisorID || null,
    EmployeeReferenceID: employee.EmployeeReferenceID?.trim() || "",
    CompanyComments: employee.CompanyComments?.trim() || "",
  };
};

// Hook to use employee actions with loading
export const useEmployeeActions = () => {
  const { apiCall } = useApiWithLoading();

  const fetchEmployees = async (): Promise<EmployeeList[]> => {
    return apiCall(
      (async () => {
        const response = await axiosInstance.get("/api/v1/employees");
        let employees: any[] = [];
        if (Array.isArray(response.data)) {
          employees = response.data;
        } else if (response.data && response.data.$values) {
          employees = response.data.$values;
        } else if (
          response.data &&
          typeof response.data === "object" &&
          response.data.employeeID
        ) {
          employees = [response.data];
        } else {
          employees = [];
        }

        const mappedEmployees = employees
          .filter((item: any) => {
            const hasValidId =
              (item.EmployeeID != null &&
                typeof item.EmployeeID === "number") ||
              (item.employeeID != null && typeof item.employeeID === "number");
            return hasValidId;
          })
          .map((item: any) => {
            const employeeId = item.EmployeeID || item.employeeID;
            return {
              EmployeeID: employeeId,
              FirstName: item.FirstName || item.firstName || "",
              LastName: item.LastName || item.lastName || "",
              PersonalEmailAddress:
                item.PersonalEmailAddress || item.personalEmailAddress || "",
              CompanyEmailAddress:
                item.CompanyEmailAddress || item.companyEmailAddress || "",
              PersonalPhoneNumber:
                item.PersonalPhoneNumber || item.personalPhoneNumber || "",
              PersonalPhoneCountryCode:
                item.PersonalPhoneCountryCode ||
                item.personalPhoneCountryCode ||
                "",
              JoinedDate:
                item.JoinedDate || item.joinedDate
                  ? new Date(item.JoinedDate || item.joinedDate).toISOString()
                  : null,
              Status: item.Status || item.status || "",
              TerminatedDate:
                item.TerminatedDate || item.terminatedDate
                  ? new Date(
                      item.TerminatedDate || item.terminatedDate
                    ).toISOString()
                  : null,
              Role: item.Role || item.role || "",
              SupervisorID: item.SupervisorID || item.supervisorID || null,
              SupervisorName: item.SupervisorName || item.supervisorName || "",
              CompanyComments:
                item.CompanyComments || item.companyComments || "",
              id: employeeId,
            } as EmployeeList;
          });

        return mappedEmployees;
      })(),
      { showLoading: true }
    );
  };

  const getEmployee = async (id: number): Promise<EmployeeDetail | null> => {
    return apiCall(
      (async () => {
        const response = await axiosInstance.get(`/api/v1/employees/${id}`);
        const employeeData = response.data;
        console.log("🔹 Raw Employee Data:", employeeData);

        return {
          EmployeeID: employeeData.EmployeeID || employeeData.employeeID,
          FirstName: employeeData.FirstName || employeeData.firstName || "",
          LastName: employeeData.LastName || employeeData.lastName || "",
          PersonalEmailAddress:
            employeeData.PersonalEmailAddress ||
            employeeData.personalEmailAddress ||
            "",
          CompanyEmailAddress:
            employeeData.CompanyEmailAddress ||
            employeeData.companyEmailAddress ||
            "",
          PersonalPhoneNumber:
            employeeData.PersonalPhoneNumber ||
            employeeData.personalPhoneNumber ||
            "",
          PersonalPhoneCountryCode:
            employeeData.PersonalPhoneCountryCode ||
            employeeData.personalPhoneCountryCode ||
            "",
          JoinedDate:
            employeeData.JoinedDate || employeeData.joinedDate
              ? new Date(
                  employeeData.JoinedDate || employeeData.joinedDate
                ).toISOString()
              : null,
          Status: employeeData.Status || employeeData.status || "",
          TerminatedDate:
            employeeData.TerminatedDate || employeeData.terminatedDate
              ? new Date(
                  employeeData.TerminatedDate || employeeData.terminatedDate
                ).toISOString()
              : null,
          EmployeeReferenceID:
            employeeData.EmployeeReferenceID ||
            employeeData.employeeReferenceID ||
            "",
          CompanyComments:
            employeeData.CompanyComments || employeeData.companyComments || "",
          Role: employeeData.Role || employeeData.role || "",
          SupervisorID:
            employeeData.SupervisorID || employeeData.supervisorID || null,
          SupervisorName:
            employeeData.SupervisorName || employeeData.supervisorName || "",
          CreatedTS: employeeData.CreatedTS
            ? new Date(employeeData.CreatedTS).toISOString()
            : null,
          UpdatedTS: employeeData.UpdatedTS
            ? new Date(employeeData.UpdatedTS).toISOString()
            : null,
        };
      })(),
      { showLoading: true }
    );
  };

  const createEmployee = async (
    employeeData: EmployeeDetail
  ): Promise<boolean> => {
    return apiCall(
      (async () => {
        const normalizedData = normalizeEmployeeData(employeeData);
        const response = await axiosInstance.post(
          "/api/v1/employees",
          normalizedData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          console.log("✅ Employee Created Successfully");
          return true;
        } else {
          throw new Error(
            `Unexpected response status: ${response.status} - ${JSON.stringify(
              response.data
            )}`
          );
        }
      })(),
      { showLoading: true }
    );
  };

  const updateEmployee = async (
    id: number,
    employeeData: EmployeeDetail
  ): Promise<boolean> => {
    return apiCall(
      (async () => {
        const normalizedData = normalizeEmployeeData(employeeData);
        const response = await axiosInstance.put(
          `/api/v1/employees/${id}`,
          normalizedData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 204) {
          console.log("✅ Employee Updated Successfully");
          return true;
        } else {
          throw new Error(
            `Unexpected response status: ${response.status} - ${JSON.stringify(
              response.data
            )}`
          );
        }
      })(),
      { showLoading: true }
    );
  };

  const inactivateEmployee = async (id: number): Promise<boolean> => {
    return apiCall(
      (async () => {
        const response = await axiosInstance.put(
          `/api/v1/employees/${id}/inactivate`,
          {}
        );
        if (response.status === 204) {
          console.log("✅ Employee marked as inactive successfully");
          return true;
        } else {
          throw new Error(
            `Unexpected response status: ${response.status} - ${JSON.stringify(
              response.data
            )}`
          );
        }
      })(),
      { showLoading: true }
    );
  };

  return {
    fetchEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    inactivateEmployee,
  };
};

// Legacy functions for backward compatibility (without loading)
export const fetchEmployees = async (): Promise<EmployeeList[]> => {
  const response = await axiosInstance.get("/api/v1/employees");
  let employees: any[] = [];
  if (Array.isArray(response.data)) {
    employees = response.data;
  } else if (response.data && response.data.$values) {
    employees = response.data.$values;
  } else if (
    response.data &&
    typeof response.data === "object" &&
    response.data.employeeID
  ) {
    employees = [response.data];
  } else {
    employees = [];
  }

  console.log("🔹 Raw Employees from Backend:", employees);

  const mappedEmployees = employees
    .filter((item: any) => {
      const hasValidId =
        (item.EmployeeID != null && typeof item.EmployeeID === "number") ||
        (item.employeeID != null && typeof item.employeeID === "number");
      console.log("🔹 Filtering Employee:", item, "Valid ID:", hasValidId);
      return hasValidId;
    })
    .map((item: any) => {
      const employeeId = item.EmployeeID || item.employeeID;
      return {
        EmployeeID: employeeId,
        FirstName: item.FirstName || item.firstName || "",
        LastName: item.LastName || item.lastName || "",
        PersonalEmailAddress:
          item.PersonalEmailAddress || item.personalEmailAddress || "",
        CompanyEmailAddress:
          item.CompanyEmailAddress || item.companyEmailAddress || "",
        PersonalPhoneNumber:
          item.PersonalPhoneNumber || item.personalPhoneNumber || "",
        PersonalPhoneCountryCode:
          item.PersonalPhoneCountryCode || item.personalPhoneCountryCode || "",
        JoinedDate:
          item.JoinedDate || item.joinedDate
            ? new Date(item.JoinedDate || item.joinedDate).toISOString()
            : null,
        Status: item.Status || item.status || "",
        TerminatedDate:
          item.TerminatedDate || item.terminatedDate
            ? new Date(item.TerminatedDate || item.terminatedDate).toISOString()
            : null,
        Role: item.Role || item.role || "",
        SupervisorID: item.SupervisorID || item.supervisorID || null,
        SupervisorName: item.SupervisorName || item.supervisorName || "",
        CompanyComments: item.CompanyComments || item.companyComments || "",
        id: employeeId,
      } as EmployeeList;
    });

  console.log("✅ Extracted Employees Array:", mappedEmployees);
  return mappedEmployees;
};

export const getEmployee = async (
  id: number
): Promise<EmployeeDetail | null> => {
  const response = await axiosInstance.get(`/api/v1/employees/${id}`);
  const employeeData = response.data;

  return {
    EmployeeID: employeeData.EmployeeID || employeeData.employeeID,
    FirstName: employeeData.FirstName || employeeData.firstName || "",
    LastName: employeeData.LastName || employeeData.lastName || "",
    PersonalEmailAddress:
      employeeData.PersonalEmailAddress ||
      employeeData.personalEmailAddress ||
      "",
    CompanyEmailAddress:
      employeeData.CompanyEmailAddress ||
      employeeData.companyEmailAddress ||
      "",
    PersonalPhoneNumber:
      employeeData.PersonalPhoneNumber ||
      employeeData.personalPhoneNumber ||
      "",
    PersonalPhoneCountryCode:
      employeeData.PersonalPhoneCountryCode ||
      employeeData.personalPhoneCountryCode ||
      "",
    JoinedDate:
      employeeData.JoinedDate || employeeData.joinedDate
        ? new Date(
            employeeData.JoinedDate || employeeData.joinedDate
          ).toISOString()
        : null,
    Status: employeeData.Status || employeeData.status || "",
    TerminatedDate:
      employeeData.TerminatedDate || employeeData.terminatedDate
        ? new Date(
            employeeData.TerminatedDate || employeeData.terminatedDate
          ).toISOString()
        : null,
    EmployeeReferenceID:
      employeeData.EmployeeReferenceID ||
      employeeData.employeeReferenceID ||
      "",
    CompanyComments:
      employeeData.CompanyComments || employeeData.companyComments || "",
    Role: employeeData.Role || employeeData.role || "",
    SupervisorID:
      employeeData.SupervisorID || employeeData.supervisorID || null,
    SupervisorName:
      employeeData.SupervisorName || employeeData.supervisorName || "",
    CreatedTS: employeeData.CreatedTS
      ? new Date(employeeData.CreatedTS).toISOString()
      : null,
    UpdatedTS: employeeData.UpdatedTS
      ? new Date(employeeData.UpdatedTS).toISOString()
      : null,
  };
};

export const createEmployee = async (
  employeeData: EmployeeDetail
): Promise<boolean> => {
  const normalizedData = normalizeEmployeeData(employeeData);
  const response = await axiosInstance.post(
    "/api/v1/employees",
    normalizedData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.status === 200) {
    return true;
  } else {
    throw new Error(
      `Unexpected response status: ${response.status} - ${JSON.stringify(
        response.data
      )}`
    );
  }
};

export const updateEmployee = async (
  id: number,
  employeeData: EmployeeDetail
): Promise<boolean> => {
  const normalizedData = normalizeEmployeeData(employeeData);
  const response = await axiosInstance.put(
    `/api/v1/employees/${id}`,
    normalizedData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.status === 204) {
    return true;
  } else {
    throw new Error(
      `Unexpected response status: ${response.status} - ${JSON.stringify(
        response.data
      )}`
    );
  }
};

export const inactivateEmployee = async (id: number): Promise<boolean> => {
  const response = await axiosInstance.put(
    `/api/v1/employees/${id}/inactivate`,
    {}
  );
  if (response.status === 204) {
    return true;
  } else {
    throw new Error(
      `Unexpected response status: ${response.status} - ${JSON.stringify(
        response.data
      )}`
    );
  }
};

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
