// app/types/employees/employeeList.ts
export interface EmployeeList {
  EmployeeID: number;
  FirstName: string; // Use PascalCase for consistency in TypeScript, but handle lowercase from backend
  LastName: string; // Use PascalCase for consistency in TypeScript, but handle lowercase from backend
  PersonalEmailAddress: string;
  CompanyEmailAddress: string | null;
  PersonalPhoneNumber: string | null;
  PersonalPhoneCountryCode: string | null;
  JoinedDate: string; // ISO date string, e.g., "2023-01-15T00:00:00"
  Status: string; // e.g., "Active" or "Inactive"
  TerminatedDate: string | null; // ISO date string or null
  Role: string;
  SupervisorID: number | null;
  SupervisorName: string | null;
  CompanyComments: string | null;
  id: number; // For DataGrid row ID
}
