"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../../contexts/authContext";
import { mapAzureRoleToAppRole } from "../../utils/roleMapping";
import { GlobalTimeFilter, TimePeriod } from "./GlobalTimeFilter";
import { GlassMetricCard } from "./GlassMetricCard";
import { CollapsibleSection } from "./CollapsibleSection";
import { SmartInsights } from "./SmartInsights";
import { ModernPaymentTable, Payment } from "./ModernPaymentTable";
import { PaymentSidebar } from "./PaymentSidebar";
import { ClientBalance } from "../utils/dummyPaymentData";
import { Input } from "../../../components/ui/input";
import {
  fetchPayments,
  fetchMetrics,
  fetchClientBalances,
  recordPayment,
  markPaymentAsPaid,
} from "../actions/accountingActions";
import type {
  PaymentDto,
  AccountingMetricsDto,
  ClientBalanceDto,
} from "../../types/accounting/accounting";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  addDays,
  subDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  addQuarters,
  subQuarters,
  startOfYear,
  endOfYear,
  subYears,
  isWithinInterval,
  format,
} from "date-fns";

// Helper to get date range for time period
const getDateRange = (period: TimePeriod, customStart?: Date, customEnd?: Date) => {
  const today = new Date();

  switch (period) {
    case "this_month":
      return { start: startOfMonth(today), end: endOfMonth(today) };
    case "next_month":
      return {
        start: startOfMonth(addMonths(today, 1)),
        end: endOfMonth(addMonths(today, 1)),
      };
    case "last_month":
      return {
        start: startOfMonth(subMonths(today, 1)),
        end: endOfMonth(subMonths(today, 1)),
      };
    case "this_quarter":
      return { start: startOfQuarter(today), end: endOfQuarter(today) };
    case "next_quarter":
      return {
        start: startOfQuarter(addQuarters(today, 1)),
        end: endOfQuarter(addQuarters(today, 1)),
      };
    case "last_quarter":
      return {
        start: startOfQuarter(subQuarters(today, 1)),
        end: endOfQuarter(subQuarters(today, 1)),
      };
    case "this_year":
      return { start: startOfYear(today), end: endOfYear(today) };
    case "last_year":
      return {
        start: startOfYear(subYears(today, 1)),
        end: endOfYear(subYears(today, 1)),
      };
    case "custom":
      return customStart && customEnd
        ? { start: customStart, end: customEnd }
        : { start: new Date(0), end: new Date() };
    case "all_time":
    default:
      return { start: new Date(0), end: new Date(2100, 0, 1) };
  }
};

export function NewAccountingHub() {
  const { roles } = useAuth();
  const userRole = mapAzureRoleToAppRole(roles) as "Admin" | "Sales_Executive";
  const isAdmin = userRole === "Admin";

  const [timePeriod, setTimePeriod] = useState<TimePeriod>("this_month");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<"view" | "edit" | "markPaid" | "recordPayment">("view");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Real data state
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [clientBalances, setClientBalances] = useState<ClientBalance[]>([]);
  const [metrics, setMetrics] = useState<AccountingMetricsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to map PaymentDto to Payment
  const mapPaymentDto = (p: PaymentDto): Payment => {
    const transactions = (p.transactions as any)?.$values || p.transactions || [];

    return {
      id: p.id.toString(),
      clientId: p.clientId.toString(),
      clientName: p.clientName,
      clientEmail: p.clientEmail,
      originalAmount: p.originalAmount,
      paidAmount: p.paidAmount,
      remainingAmount: p.remainingAmount,
      status: p.status,
      dueDate: p.dueDate || "",
      date: p.date,
      type: p.type,
      assignedTo: p.assignedTo || undefined,
      transactions: Array.isArray(transactions) ? transactions.map((t: any) => ({
        id: t.id,
        paymentId: t.paymentId.toString(),
        amount: t.amount,
        paidDate: t.paidDate,
        comment: t.comment || "",
        recordedBy: t.recordedBy,
        recordedAt: t.recordedAt,
        type: t.type,
      })) : [],
    };
  };

  // Helper function to map ClientBalanceDto to ClientBalance
  const mapClientBalanceDto = (b: ClientBalanceDto): ClientBalance => ({
    clientId: b.clientId,
    clientName: b.clientName,
    creditBalance: b.creditBalance,
    totalOutstanding: b.totalOutstanding,
    lastUpdated: b.lastUpdated,
  });

  // Fetch real data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build filters based on time period
        const filters = {
          timePeriod: timePeriod === "all_time" ? undefined : timePeriod,
          customStartDate: customStartDate?.toISOString(),
          customEndDate: customEndDate?.toISOString(),
          status: statusFilter === "all" ? undefined : statusFilter,
          searchQuery: searchQuery || undefined,
        };

        // Fetch payments, metrics, and client balances in parallel
        const [paymentsData, metricsData, balancesData] = await Promise.all([
          fetchPayments(filters),
          fetchMetrics(filters),
          fetchClientBalances(),
        ]);

        // Map PaymentDto to Payment (component format)
        const mappedPayments: Payment[] = paymentsData.map(mapPaymentDto);

        // Map ClientBalanceDto to ClientBalance
        const mappedBalances: ClientBalance[] = balancesData.map(mapClientBalanceDto);

        setAllPayments(mappedPayments);
        setClientBalances(mappedBalances);
        setMetrics(metricsData);
      } catch (err: any) {
        console.error("Error loading accounting data:", err);
        setError(err.message || "Failed to load accounting data");
        toast.error("Failed to load accounting data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timePeriod, customStartDate, customEndDate, statusFilter, searchQuery]);

  // Filter by time period
  const timeFilteredPayments = useMemo(() => {
    const { start, end } = getDateRange(timePeriod, customStartDate, customEndDate);

    return allPayments.filter((payment) => {
      const paymentDate = new Date(payment.date);
      return isWithinInterval(paymentDate, { start, end });
    });
  }, [allPayments, timePeriod, customStartDate, customEndDate]);

  // Calculate metrics from time-filtered data
  const totalRevenue = timeFilteredPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.paidAmount, 0);

  const pendingAmount = timeFilteredPayments
    .filter((p) => p.status === "pending" || p.status === "partially_paid")
    .reduce((sum, p) => sum + p.remainingAmount, 0);

  const totalClients = new Set(timeFilteredPayments.map((p) => p.clientName)).size;

  const pendingCount = timeFilteredPayments.filter((p) => p.status === "pending" || p.status === "partially_paid").length;

  // New metrics for partial payments and client credits
  const partialPaymentsCount = timeFilteredPayments.filter((p) => p.status === "partially_paid").length;
  const totalOutstanding = timeFilteredPayments
    .filter((p) => p.status !== "paid" && p.status !== "cancelled")
    .reduce((sum, p) => sum + p.remainingAmount, 0);

  const totalClientCredits = clientBalances.reduce((sum, cb) => sum + cb.creditBalance, 0);
  const clientsWithCredits = clientBalances.filter((cb) => cb.creditBalance > 0).length;

  // Further filter by search and status
  const filteredPayments = timeFilteredPayments.filter((payment) => {
    const matchesSearch =
      payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Smart insights
  const insights = [
    partialPaymentsCount > 0 && {
      id: "partial",
      type: "warning" as const,
      title: `${partialPaymentsCount} payments partially paid`,
      description: `${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(totalOutstanding)} total outstanding`,
      action: {
        label: "Review Partial",
        onClick: () => setStatusFilter("partially_paid"),
      },
    },
    clientsWithCredits > 0 && {
      id: "credits",
      type: "info" as const,
      title: `${clientsWithCredits} clients with credit balances`,
      description: `${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(totalClientCredits)} in credits`,
    },
    {
      id: "success",
      type: "success" as const,
      title: `${
        timeFilteredPayments.filter((p) => p.status === "paid").length
      } payments received`,
      description: "Collections on track",
    },
  ].filter(Boolean) as any[];

  const handleTimeFilterChange = (
    period: TimePeriod,
    startDate?: Date,
    endDate?: Date
  ) => {
    setTimePeriod(period);
    if (period === "custom") {
      setCustomStartDate(startDate);
      setCustomEndDate(endDate);
    }
  };

  const handleRefresh = async () => {
    try {
      setTimePeriod("this_month");
      setSearchQuery("");
      setStatusFilter("all");
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);

      // Reload data
      setLoading(true);
      const filters = {
        timePeriod: "this_month",
      };

      const [paymentsData, metricsData, balancesData] = await Promise.all([
        fetchPayments(filters),
        fetchMetrics(filters),
        fetchClientBalances(),
      ]);

      const mappedPayments: Payment[] = paymentsData.map(mapPaymentDto);
      const mappedBalances: ClientBalance[] = balancesData.map(mapClientBalanceDto);

      setAllPayments(mappedPayments);
      setClientBalances(mappedBalances);
      setMetrics(metricsData);

      toast.success("Filters reset and data refreshed");
    } catch (err: any) {
      console.error("Error refreshing data:", err);
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setSidebarMode("view");
    setSidebarOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setSidebarMode("edit");
    setSidebarOpen(true);
  };

  const handleMarkPaid = (payment: Payment) => {
    setSelectedPayment(payment);
    setSidebarMode("markPaid");
    setSidebarOpen(true);
  };

  const handleRecordPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setSidebarMode("recordPayment");
    setSidebarOpen(true);
  };

  const handleSavePayment = (payment: Payment) => {
    console.log("Save payment:", payment);
    // In real app, would call API here
  };

  const handleConfirmPayment = async (payment: Payment, comment: string) => {
    try {
      // Call API to mark payment as paid
      await markPaymentAsPaid(parseInt(payment.id), comment);

      toast.success("Payment marked as paid successfully");
      setSidebarOpen(false);

      // Reload data to get updated payment
      const filters = {
        timePeriod: timePeriod === "all_time" ? undefined : timePeriod,
        customStartDate: customStartDate?.toISOString(),
        customEndDate: customEndDate?.toISOString(),
        status: statusFilter === "all" ? undefined : statusFilter,
        searchQuery: searchQuery || undefined,
      };

      const [paymentsData, balancesData] = await Promise.all([
        fetchPayments(filters),
        fetchClientBalances(),
      ]);

      setAllPayments(paymentsData.map(mapPaymentDto));
      setClientBalances(balancesData.map(mapClientBalanceDto));
    } catch (err: any) {
      console.error("Error marking payment as paid:", err);
      toast.error(err.message || "Failed to mark payment as paid");
    }
  };

  const handleRecordPaymentSubmit = async (
    payment: Payment,
    amount: number,
    paidDate: string,
    comment: string
  ) => {
    try {
      // Call API to record payment
      await recordPayment(parseInt(payment.id), {
        amount,
        paidDate,
        comment,
      });

      toast.success("Payment recorded successfully");
      setSidebarOpen(false);

      // Reload data to get updated payment
      const filters = {
        timePeriod: timePeriod === "all_time" ? undefined : timePeriod,
        customStartDate: customStartDate?.toISOString(),
        customEndDate: customEndDate?.toISOString(),
        status: statusFilter === "all" ? undefined : statusFilter,
        searchQuery: searchQuery || undefined,
      };

      const [paymentsData, balancesData] = await Promise.all([
        fetchPayments(filters),
        fetchClientBalances(),
      ]);

      setAllPayments(paymentsData.map(mapPaymentDto));
      setClientBalances(balancesData.map(mapClientBalanceDto));
    } catch (err: any) {
      console.error("Error recording payment:", err);
      toast.error(err.message || "Failed to record payment");
    }
  };

  const handleReviewPending = () => {
    setStatusFilter("pending");
    toast.info("Showing pending payments");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDateRangeLabel = () => {
    const { start, end } = getDateRange(timePeriod, customStartDate, customEndDate);
    return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#682A53] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accounting data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load accounting data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-[#682A53]">
          Accounting Hub
        </h1>
      </div>

      {/* Global Time Filter */}
      <GlobalTimeFilter
        value={timePeriod}
        onChange={handleTimeFilterChange}
        dateRangeLabel={getDateRangeLabel()}
        onRefresh={handleRefresh}
      />

      {/* Metrics Section - Collapsible */}
      <CollapsibleSection title="Metrics" defaultExpanded={true}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <GlassMetricCard
            title="Revenue"
            value={formatCurrency(totalRevenue)}
            change="+15% ↑"
            changeType="increase"
            icon={DollarSign}
            sparklineData={[10, 20, 15, 25, 22, 30, 28]}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <GlassMetricCard
            title="Outstanding"
            value={formatCurrency(totalOutstanding)}
            change={`${partialPaymentsCount} partial`}
            changeType="decrease"
            icon={CreditCard}
            sparklineData={[15, 18, 20, 17, 19, 16, 14]}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
          <GlassMetricCard
            title="Client Credits"
            value={formatCurrency(totalClientCredits)}
            change={`${clientsWithCredits} clients`}
            changeType="increase"
            icon={TrendingUp}
            sparklineData={[5, 7, 6, 8, 9, 10, 12]}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
        </div>
      </CollapsibleSection>

      {/* Insights Section - Collapsible */}
      <CollapsibleSection title="Smart Insights" defaultExpanded={true}>
        <SmartInsights
          insights={insights}
          role={userRole}
          onReviewPending={handleReviewPending}
          payments={timeFilteredPayments}
          totalOutstanding={totalOutstanding}
          onViewOutstanding={() => setStatusFilter("partially_paid")}
        />
      </CollapsibleSection>

      {/* Filter Bar */}
      <div className="flex gap-4 items-center p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients, amounts, reference numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }}
        >
          Reset
        </Button>
      </div>

      {/* Payment Table */}
      <ModernPaymentTable
        payments={filteredPayments}
        role={userRole}
        onView={handleViewPayment}
        onEdit={handleEditPayment}
        onMarkPaid={handleMarkPaid}
        onRecordPayment={handleRecordPayment}
      />

      {/* Payment Sidebar */}
      <PaymentSidebar
        payment={selectedPayment}
        mode={sidebarMode}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSave={handleSavePayment}
        onMarkPaid={handleConfirmPayment}
        onRecordPayment={handleRecordPaymentSubmit}
        clientCreditBalance={selectedPayment ? clientBalances.find(cb => cb.clientId === selectedPayment.clientId)?.creditBalance || 0 : 0}
      />
    </div>
  );
}
