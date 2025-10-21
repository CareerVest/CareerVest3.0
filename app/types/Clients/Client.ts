export interface Client {
  clientID: number;
  clientName: string;
  enrollmentDate: Date | null;
  techStack: string | null;
  visaStatus: string | null;
  personalPhoneNumber: string | null;
  personalEmailAddress: string | null;
  linkedInURL: string | null;
  marketingStartDate: Date | null;
  marketingEndDate: Date | null;
  marketingEmailID: string | null;
  marketingEmailPassword: string | null;
  assignedRecruiterID: number | null;
  assignedRecruiterName: string | null;
  assignedSalesPersonID: number | null;
  assignedSalesPersonName: string | null;
  clientStatus: string;
  placedDate: Date | null;
  backedOutDate: Date | null;
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
  paymentDate: Date | null;
  originalAmount: number; // Total amount originally scheduled
  paidAmount: number; // Amount paid so far
  remainingAmount: number; // Outstanding balance
  dueDate: Date | null; // When payment is due
  paymentType: "Subscription" | "Placement";
  paymentStatus: string; // "Pending", "Paid", "Partially_Paid", "Cancelled"
  assignedTo: string | null;
  subscriptionPlanID: number | null;
  postPlacementPlanID: number | null;
  createdTS: Date | null;
  createdBy: string | null;
  updatedTS: Date | null;
  updatedBy: string | null;
}

export interface SubscriptionPlan {
  subscriptionPlanID: number;
  planName: string;
  serviceAgreementUrl: string | null;
  subscriptionPlanPaymentStartDate: Date | null;
  totalSubscriptionAmount: number | null;
  createdTS: Date | null;
  createdBy: string | null;
  updatedTS: Date | null;
  updatedBy: string | null;
}

export interface PostPlacementPlan {
  postPlacementPlanID: number;
  planName: string;
  promissoryNoteUrl: string | null;
  postPlacementPlanPaymentStartDate: Date | null;
  totalPostPlacementAmount: number | null;
  createdTS: Date | null;
  createdBy: string | null;
  updatedTS: Date | null;
  updatedBy: string | null;
}
