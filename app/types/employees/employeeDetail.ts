export interface EmployeeDetail {
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
    SupervisorName: string | null;
    CreatedTS: string | null;
    UpdatedTS: string | null;
  }
