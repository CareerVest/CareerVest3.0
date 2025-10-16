// ================================================================================
// ACCOUNTING MODULE - TYPE DEFINITIONS
// Backend API Integration Types
// ================================================================================

// Payment/PaymentSchedule Types
export interface PaymentDto {
  id: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "paid" | "pending" | "partially_paid" | "cancelled";
  dueDate: string | null;
  date: string;
  type: "subscription" | "placement";
  assignedTo: string | null;
  transactions: PaymentTransactionDto[];
}

export interface PaymentTransactionDto {
  id: string;
  paymentId: number;
  amount: number;
  paidDate: string;
  comment: string | null;
  recordedBy: string;
  recordedAt: string;
  type: "payment" | "adjustment";
}

// Metrics Types
export interface AccountingMetricsDto {
  totalRevenue: number;
  totalOutstanding: number;
  totalClientCredits: number;
  pendingCount: number;
  partialPaymentsCount: number;
  clientsWithCredits: number;
}

// Client Balance Types
export interface ClientBalanceDto {
  clientId: string;
  clientName: string;
  creditBalance: number;
  totalOutstanding: number;
  lastUpdated: string;
}

// Request/Filter Types
export interface AccountingFilterDto {
  timePeriod?: string; // "this_month", "last_month", "this_quarter", etc.
  customStartDate?: string;
  customEndDate?: string;
  status?: string; // "all", "paid", "pending", "partially_paid", "cancelled"
  searchQuery?: string;
}

export interface RecordPaymentRequestDto {
  amount: number;
  paidDate: string;
  comment?: string;
  externalTransactionID?: string;
}

// ================================================================================
// LEGACY UI TYPES (for backwards compatibility with existing components)
// ================================================================================

export interface Transaction {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  originalAmount?: number;
  type: "subscription" | "placement";
  status:
    | "paid"
    | "pending"
    | "overdue"
    | "blocked"
    | "adjusted"
    | "transferred"
    | "refunded"
    | "partial";
  date: string;
  dueDate?: string;
  description: string;
  paymentMethod?: string;
  referenceNumber?: string;
  createdBy?: string;
  lastModified?: string;
  auditTrail?: AuditEntry[];
  reminders?: number;
  isRecurring?: boolean;
  recurringSchedule?: "monthly" | "quarterly" | "annually";
  tags?: string[];
  priority?: "low" | "medium" | "high";
}

export interface AuditEntry {
  id: string;
  action: string;
  timestamp: string;
  userId: string;
  userName: string;
  details: string;
  oldValue?: any;
  newValue?: any;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  enrollmentDate: string;
  course?: string;
  status: "active" | "completed" | "inactive" | "suspended";
  totalPaid: number;
  totalOwed: number;
  placementStatus: "not_placed" | "placed" | "seeking";
  placementCompany?: string;
  placementSalary?: number;
  riskLevel?: "low" | "medium" | "high";
  paymentHistory?: PaymentHistoryEntry[];
  lastPaymentDate?: string;
  nextPaymentDue?: string;
  communicationPreferences?: {
    email: boolean;
    sms: boolean;
    reminders: boolean;
  };
  tags?: string[];
  notes?: string;
}

export interface PaymentHistoryEntry {
  date: string;
  amount: number;
  status: string;
  method?: string;
}

export interface Notification {
  id: string;
  type: "payment" | "overdue" | "reminder" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
}

export interface AccountingMetrics {
  totalRevenue: number;
  pendingAmount: number;
  totalClients: number;
  activeClients: number;
  overdueTransactions: number;
  upcomingDueDates: number;
  monthlyRevenue: number;
  averagePaymentTime: number;
  collectionRate: number;
}

export interface ChartData {
  month: string;
  subscription: number;
  placement: number;
}

export interface PaymentTypeData {
  name: string;
  value: number;
  color: string;
}
