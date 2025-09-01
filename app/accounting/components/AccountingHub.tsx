import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Dashboard } from "./Dashboard";
import { TransactionManagement } from "./TransactionManagement";
import { EnhancedTransactionManagement } from "./EnhancedTransactionManagement";
import { StudentManagement } from "./StudentManagement";
import { ReportsAnalytics } from "./ReportsAnalytics";
import { AuditTrail } from "./AuditTrail";
import { PaymentReconciliation } from "./PaymentReconciliation";
import { ClientCommunication } from "./ClientCommunication";
import { Toaster } from "../../../components/ui/sonner";
import { toast } from "sonner";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  BarChart3,
  DollarSign,
  TrendingUp,
  Calculator,
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle,
  Settings,
  Download,
  Upload,
  Zap,
  History,
  Target,
  Shield,
  Plus,
  MessageSquare,
} from "lucide-react";
import {
  Transaction,
  Client,
  Notification,
  AccountingMetrics,
} from "../../types/accounting/accounting";

// Mock data
const initialTransactions: Transaction[] = [
  {
    id: "1",
    studentName: "John Smith",
    studentEmail: "john@email.com",
    amount: 2500,
    type: "subscription",
    status: "paid",
    date: "2024-01-15",
    description: "Monthly subscription fee - January",
    paymentMethod: "Credit Card",
    referenceNumber: "TXN001",
  },
  {
    id: "2",
    studentName: "Sarah Johnson",
    studentEmail: "sarah@email.com",
    amount: 15000,
    type: "placement",
    status: "paid",
    date: "2024-01-20",
    description: "Placement fee - Tech Corp",
    paymentMethod: "Bank Transfer",
    referenceNumber: "PLC001",
  },
  {
    id: "3",
    studentName: "Mike Davis",
    studentEmail: "mike@email.com",
    amount: 2500,
    type: "subscription",
    status: "pending",
    date: "2024-02-01",
    dueDate: "2024-02-15",
    description: "Monthly subscription fee - February",
  },
  {
    id: "4",
    studentName: "Emily Wilson",
    studentEmail: "emily@email.com",
    amount: 12000,
    type: "placement",
    status: "pending",
    date: "2024-02-10",
    dueDate: "2024-02-25",
    description: "Placement fee - StartupXYZ",
  },
  {
    id: "5",
    studentName: "David Brown",
    studentEmail: "david@email.com",
    amount: 2500,
    type: "subscription",
    status: "overdue",
    date: "2024-01-01",
    dueDate: "2024-01-15",
    description: "Monthly subscription fee - January",
  },
];

const initialClients: Client[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@email.com",
    phone: "+1-555-0123",
    address: "123 Main St, New York, NY",
    enrollmentDate: "2024-01-01",
    course: "Full Stack Development",
    status: "active",
    totalPaid: 5000,
    totalOwed: 2500,
    placementStatus: "seeking",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@email.com",
    phone: "+1-555-0124",
    address: "456 Oak Ave, Los Angeles, CA",
    enrollmentDate: "2023-12-01",
    course: "Data Science",
    status: "completed",
    totalPaid: 20000,
    totalOwed: 0,
    placementStatus: "placed",
    placementCompany: "Tech Corp",
    placementSalary: 85000,
  },
  {
    id: "3",
    name: "Mike Davis",
    email: "mike@email.com",
    phone: "+1-555-0125",
    address: "789 Pine St, Chicago, IL",
    enrollmentDate: "2024-01-15",
    course: "UI/UX Design",
    status: "active",
    totalPaid: 3000,
    totalOwed: 2500,
    placementStatus: "not_placed",
  },
  {
    id: "4",
    name: "Emily Wilson",
    email: "emily@email.com",
    phone: "+1-555-0126",
    address: "321 Elm St, Boston, MA",
    enrollmentDate: "2023-11-01",
    course: "Full Stack Development",
    status: "completed",
    totalPaid: 15000,
    totalOwed: 12000,
    placementStatus: "seeking",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david@email.com",
    phone: "+1-555-0127",
    address: "654 Maple Dr, Seattle, WA",
    enrollmentDate: "2024-02-01",
    course: "DevOps Engineering",
    status: "active",
    totalPaid: 1000,
    totalOwed: 4500,
    placementStatus: "not_placed",
  },
];

export function AccountingHub() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );
  const [realtimeUpdates, setRealtimeUpdates] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate key metrics for overview
  const totalRevenue = transactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === "pending" || t.status === "overdue")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalClients = clients.length;
  const activeClients = clients.filter((s) => s.status === "active").length;
  const overdueTransactions = transactions.filter(
    (t) => t.status === "overdue"
  ).length;
  const upcomingDueDates = transactions.filter((t) => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    const threeDaysFromNow = new Date(
      today.getTime() + 3 * 24 * 60 * 60 * 1000
    );
    return (
      dueDate >= today && dueDate <= threeDaysFromNow && t.status === "pending"
    );
  }).length;

  const handleAddTransaction = (newTransaction: Omit<Transaction, "id">) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [transaction, ...prev]);
    toast.success("Transaction added successfully");
  };

  const handleUpdateTransaction = (
    id: string,
    updatedTransaction: Partial<Transaction>
  ) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedTransaction } : t))
    );
    toast.success("Transaction updated successfully");
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast.success("Transaction deleted successfully");
  };

  const handleAddClient = (newClient: Omit<Client, "id">) => {
    const client: Client = {
      ...newClient,
      id: Date.now().toString(),
    };
    setClients((prev) => [client, ...prev]);
    toast.success("Client added successfully");
  };

  const handleUpdateClient = (id: string, updatedClient: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedClient } : c))
    );
    toast.success("Client updated successfully");
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast.success("Client deleted successfully");
  };

  const handleBulkAction = (action: string, transactionIds: string[]) => {
    switch (action) {
      case "mark_paid":
        setTransactions((prev) =>
          prev.map((t) =>
            transactionIds.includes(t.id)
              ? { ...t, status: "paid" as const }
              : t
          )
        );
        toast.success(`${transactionIds.length} transactions marked as paid`);
        break;
      case "send_reminder":
        toast.success(`Reminders sent to ${transactionIds.length} clients`);
        break;
      case "export":
        toast.success(`Exported ${transactionIds.length} transactions`);
        break;
      default:
        break;
    }
    setSelectedTransactions([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-[#682A53]">
            Accounting Hub
          </h1>
          <p className="text-muted-foreground">
            Comprehensive financial management and reporting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-600" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingDueDates} payments due soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">
              of {totalClients} total clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTransactions}</div>
            <p className="text-xs text-muted-foreground">
              transactions overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="enhanced-transactions"
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Enhanced
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit
          </TabsTrigger>
          <TabsTrigger
            value="communication"
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Communication
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Dashboard
            transactions={transactions}
            onViewAllTransactions={() => setActiveTab("transactions")}
          />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionManagement
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            selectedTransactions={selectedTransactions}
            onSelectionChange={setSelectedTransactions}
            onBulkAction={handleBulkAction}
          />
        </TabsContent>

        <TabsContent value="enhanced-transactions" className="space-y-4">
          <EnhancedTransactionManagement
            transactions={transactions}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <StudentManagement
            clients={clients}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsAnalytics transactions={transactions} clients={clients} />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <AuditTrail transactions={transactions} clients={clients} />
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <ClientCommunication transactions={transactions} clients={clients} />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
