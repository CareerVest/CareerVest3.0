export interface Client {
  clientID: number;
  clientName: string;
  enrollmentDate: Date | string | null; // Allow string for form inputs
  techStack: string | null;
  visaStatus: string | null;
  personalPhoneNumber: string | null;
  personalEmailAddress: string | null;
  linkedInURL: string | null;
  marketingStartDate: Date | string | null; // Allow string for form inputs
  marketingEndDate: Date | string | null; // Allow string for form inputs
  marketingEmailID: string | null;
  marketingEmailPassword: string | null;
  assignedRecruiterID: number | null;
  assignedRecruiterName: string | null;
  assignedSalesPersonID: number | null;
  assignedSalesPersonName: string | null;
  clientStatus: string;
  placedDate: Date | string | null; // Allow string for form inputs
  backedOutDate: Date | string | null; // Allow string for form inputs
  backedOutReason: string | null;
  subscriptionPlanID: number | null;
  subscriptionPlan: SubscriptionPlan | null;
  totalDue: number;
  totalPaid: number;
  postPlacementPlanID: number | null;
  postPlacementPlan: PostPlacementPlan | null;
  paymentSchedules: PaymentSchedule[];
  serviceAgreementUrl: string | null;
  promissoryNoteUrl: string | null;
}

export interface PaymentSchedule {
  paymentScheduleID: number;
  clientID: number;
  paymentDate: Date | string | null; // Allow string for form inputs
  originalAmount: number; // Total amount originally scheduled
  paidAmount: number; // Amount paid so far
  remainingAmount: number; // Outstanding balance
  dueDate: Date | string | null; // Allow string for form inputs
  paymentType: "Subscription" | "Placement";
  paymentStatus: string; // "Pending", "Paid", "Partially_Paid", "Cancelled"
  assignedTo: string | null;
  subscriptionPlanID: number | null;
  postPlacementPlanID: number | null;
  createdTS: Date | string | null; // Allow string for form inputs
  createdBy: string | null;
  updatedTS: Date | string | null; // Allow string for form inputs
  updatedBy: string | null;
}

export interface SubscriptionPlan {
  subscriptionPlanID: number;
  planName: string;
  serviceAgreementUrl: string | null;
  subscriptionPlanPaymentStartDate: Date | string | null; // Allow string for form inputs
  totalSubscriptionAmount: number | null;
  createdTS: Date | string | null; // Allow string for form inputs
  createdBy: string | null;
  updatedTS: Date | string | null; // Allow string for form inputs
  updatedBy: string | null;
}

export interface PostPlacementPlan {
  postPlacementPlanID: number;
  planName: string;
  promissoryNoteUrl: string | null;
  postPlacementPlanPaymentStartDate: Date | string | null; // Allow string for form inputs
  totalPostPlacementAmount: number | null;
  createdTS: Date | string | null; // Allow string for form inputs
  createdBy: string | null;
  updatedTS: Date | string | null; // Allow string for form inputs
  updatedBy: string | null;
}
