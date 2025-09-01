// Enhanced data types for Accounting module
export interface Transaction {
  id: string;
  studentName: string;
  studentEmail: string;
  amount: number;
  originalAmount?: number; // For adjustments
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
