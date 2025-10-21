export interface ClientList {
  clientID: number;
  clientName: string;
  enrollmentDate: string | null;
  techStack: string | null;
  clientStatus: string | null;
  assignedSalesPersonID: number | null;
  assignedSalesPersonName: string | null;
  assignedRecruiterID: number | null;
  assignedRecruiterName: string | null;
}
