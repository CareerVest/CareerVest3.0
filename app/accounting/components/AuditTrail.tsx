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
  Calendar,
  User,
  Clock,
  Eye,
  History,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  DollarSign,
} from "lucide-react";
import {
  Transaction,
  Client,
  AuditEntry,
} from "../../types/accounting/accounting";

interface AuditTrailProps {
  transactions: Transaction[];
  clients: Client[];
}

// Mock audit data
const mockAuditEntries: AuditEntry[] = [
  {
    id: "1",
    action: "Transaction Created",
    timestamp: "2024-02-15T10:30:00Z",
    userId: "user1",
    userName: "John Admin",
    details: "Created new subscription transaction for John Smith",
    newValue: { amount: 2500, type: "subscription" },
  },
  {
    id: "2",
    action: "Transaction Updated",
    timestamp: "2024-02-15T09:15:00Z",
    userId: "user2",
    userName: "Sarah Manager",
    details: "Updated payment status from pending to paid",
    oldValue: { status: "pending" },
    newValue: { status: "paid" },
  },
  {
    id: "3",
    action: "Client Added",
    timestamp: "2024-02-14T16:45:00Z",
    userId: "user1",
    userName: "John Admin",
    details: "Added new client Emily Wilson",
    newValue: { name: "Emily Wilson", email: "emily@email.com" },
  },
  {
    id: "4",
    action: "Transaction Deleted",
    timestamp: "2024-02-14T14:20:00Z",
    userId: "user3",
    userName: "Mike Recruiter",
    details: "Deleted duplicate transaction",
    oldValue: { id: "txn_123", amount: 1500 },
  },
  {
    id: "5",
    action: "Payment Processed",
    timestamp: "2024-02-14T11:30:00Z",
    userId: "user2",
    userName: "Sarah Manager",
    details: "Processed payment for placement fee",
    newValue: { amount: 15000, method: "bank_transfer" },
  },
  {
    id: "6",
    action: "Client Status Changed",
    timestamp: "2024-02-13T15:10:00Z",
    userId: "user1",
    userName: "John Admin",
    details: "Changed client status from active to completed",
    oldValue: { status: "active" },
    newValue: { status: "completed" },
  },
  {
    id: "7",
    action: "Refund Issued",
    timestamp: "2024-02-13T13:25:00Z",
    userId: "user2",
    userName: "Sarah Manager",
    details: "Issued refund for overpayment",
    oldValue: { amount: 2500 },
    newValue: { amount: 2000, refund: 500 },
  },
  {
    id: "8",
    action: "Bulk Import",
    timestamp: "2024-02-12T10:00:00Z",
    userId: "user1",
    userName: "John Admin",
    details: "Imported 25 new transactions from CSV",
    newValue: { count: 25, source: "csv_import" },
  },
];

export function AuditTrail({ transactions, clients }: AuditTrailProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case "transaction created":
      case "client added":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Created
          </Badge>
        );
      case "transaction updated":
      case "client status changed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Updated
          </Badge>
        );
      case "transaction deleted":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Deleted
          </Badge>
        );
      case "payment processed":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Payment
          </Badge>
        );
      case "refund issued":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Refund
          </Badge>
        );
      case "bulk import":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
            Import
          </Badge>
        );
      default:
        return <Badge>{action}</Badge>;
    }
  };

  const filteredAuditEntries = mockAuditEntries.filter((entry) => {
    const matchesSearch =
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction =
      actionFilter === "all" ||
      entry.action.toLowerCase().includes(actionFilter.toLowerCase());

    const matchesUser = userFilter === "all" || entry.userName === userFilter;

    const matchesDate = dateFilter === "all" || true; // Simplified date filtering

    return matchesSearch && matchesAction && matchesUser && matchesDate;
  });

  const uniqueUsers = Array.from(
    new Set(mockAuditEntries.map((entry) => entry.userName))
  );
  const uniqueActions = Array.from(
    new Set(mockAuditEntries.map((entry) => entry.action))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[#682A53]">Audit Trail</h2>
          <p className="text-muted-foreground">
            Track all system changes and activities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Log
          </Button>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            View Full History
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAuditEntries.length}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers.length}</div>
            <p className="text-xs text-muted-foreground">Made changes today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Changes
            </CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                mockAuditEntries.filter((entry) => {
                  const hoursAgo =
                    (new Date().getTime() -
                      new Date(entry.timestamp).getTime()) /
                    (1000 * 60 * 60);
                  return hoursAgo < 24;
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <p className="text-xs text-muted-foreground">No critical issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Find specific audit entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            {filteredAuditEntries.length} entry(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Time Ago</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuditEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getActionBadge(entry.action)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{entry.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="text-sm">{entry.details}</p>
                      {entry.oldValue && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Old:</span>{" "}
                          {JSON.stringify(entry.oldValue)}
                        </p>
                      )}
                      {entry.newValue && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">New:</span>{" "}
                          {JSON.stringify(entry.newValue)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatTimeAgo(entry.timestamp)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
