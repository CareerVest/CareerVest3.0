export interface Employee {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  PersonalEmailAddress: string;
  CompanyEmailAddress: string | null;
  PersonalPhoneNumber: string | null;
  PersonalPhoneCountryCode: string | null;
  JoinedDate: string | null;
  Status: string;
  TerminatedDate: string | null;
  EmployeeReferenceID: string;
  CompanyComments: string;
  Role: string;
  SupervisorID: number | null;
}
