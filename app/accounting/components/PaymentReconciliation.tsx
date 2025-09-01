import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  FileText,
  Calculator,
} from "lucide-react";
import { Transaction } from "../../types/accounting/accounting";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

interface PaymentReconciliationProps {
  transactions: Transaction[];
}

// Mock reconciliation data
const mockReconciliationData = [
  {
    id: "1",
    transactionId: "TXN001",
    studentName: "John Smith",
    expectedAmount: 2500,
    actualAmount: 2500,
    status: "reconciled",
    date: "2024-02-15",
    paymentMethod: "Credit Card",
    referenceNumber: "REF001",
    notes: "Payment matches expected amount",
  },
  {
    id: "2",
    transactionId: "TXN002",
    studentName: "Sarah Johnson",
    expectedAmount: 15000,
    actualAmount: 14800,
    status: "discrepancy",
    date: "2024-02-14",
    paymentMethod: "Bank Transfer",
    referenceNumber: "REF002",
    notes: "Payment short by $200",
  },
  {
    id: "3",
    transactionId: "TXN003",
    studentName: "Mike Davis",
    expectedAmount: 2500,
    actualAmount: 2500,
    status: "reconciled",
    date: "2024-02-13",
    paymentMethod: "Credit Card",
    referenceNumber: "REF003",
    notes: "Payment matches expected amount",
  },
  {
    id: "4",
    transactionId: "TXN004",
    studentName: "Emily Wilson",
    expectedAmount: 12000,
    actualAmount: 12000,
    status: "reconciled",
    date: "2024-02-12",
    paymentMethod: "Bank Transfer",
    referenceNumber: "REF004",
    notes: "Payment matches expected amount",
  },
  {
    id: "5",
    transactionId: "TXN005",
    studentName: "David Brown",
    expectedAmount: 2500,
    actualAmount: 2600,
    status: "discrepancy",
    date: "2024-02-11",
    paymentMethod: "Credit Card",
    referenceNumber: "REF005",
    notes: "Payment over by $100",
  },
];

export function PaymentReconciliation({
  transactions,
}: PaymentReconciliationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reconciled":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Reconciled
          </Badge>
        );
      case "discrepancy":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Discrepancy
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredReconciliationData = mockReconciliationData.filter((item) => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate reconciliation metrics
  const totalReconciled = mockReconciliationData.filter(
    (item) => item.status === "reconciled"
  ).length;
  const totalDiscrepancies = mockReconciliationData.filter(
    (item) => item.status === "discrepancy"
  ).length;
  const totalExpected = mockReconciliationData.reduce(
    (sum, item) => sum + item.expectedAmount,
    0
  );
  const totalActual = mockReconciliationData.reduce(
    (sum, item) => sum + item.actualAmount,
    0
  );
  const totalVariance = totalActual - totalExpected;

  const reconciliationRate =
    (totalReconciled / mockReconciliationData.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[#682A53]">
            Payment Reconciliation
          </h2>
          <p className="text-muted-foreground">
            Reconcile payments and identify discrepancies
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Bank Statement
          </Button>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Reconciliation
          </Button>
        </div>
      </div>

      {/* Reconciliation Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reconciliation Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reconciliationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalReconciled} of {mockReconciliationData.length} reconciled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expected
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpected)}
            </div>
            <p className="text-xs text-muted-foreground">Expected payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Received
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalActual)}
            </div>
            <p className="text-xs text-muted-foreground">
              Actual payments received
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalVariance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(Math.abs(totalVariance))}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalVariance >= 0 ? "Overpayment" : "Underpayment"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>
            Find specific reconciliation entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search reconciliation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Status</option>
              <option value="reconciled">Reconciled</option>
              <option value="discrepancy">Discrepancy</option>
              <option value="pending">Pending</option>
            </select>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reconciliation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Reconciliation</CardTitle>
          <CardDescription>
            {filteredReconciliationData.length} entry(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Expected Amount</TableHead>
                <TableHead>Actual Amount</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReconciliationData.map((item) => {
                const variance = item.actualAmount - item.expectedAmount;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.transactionId}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.referenceNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.studentName}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.paymentMethod}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.expectedAmount)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.actualAmount)}
                    </TableCell>
                    <TableCell>
                      <div
                        className={`font-medium ${
                          variance >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {variance >= 0 ? "+" : ""}
                        {formatCurrency(variance)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {variance >= 0 ? "Overpayment" : "Underpayment"}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Reconciliation
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Notes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Reconciled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Discrepancy Summary */}
      {totalDiscrepancies > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Discrepancy Summary</CardTitle>
            <CardDescription>
              Summary of payment discrepancies requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReconciliationData
                .filter((item) => item.status === "discrepancy")
                .map((item) => {
                  const variance = item.actualAmount - item.expectedAmount;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{item.studentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.transactionId}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.notes}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          Expected: {formatCurrency(item.expectedAmount)}
                        </div>
                        <div className="font-medium">
                          Actual: {formatCurrency(item.actualAmount)}
                        </div>
                        <div
                          className={`font-medium ${
                            variance >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          Variance: {variance >= 0 ? "+" : ""}
                          {formatCurrency(variance)}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
