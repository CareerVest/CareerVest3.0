import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Eye,
  Edit,
  CheckCircle,
  FileText,
  DollarSign,
} from "lucide-react";

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  amount: number;
  paidDate: string;
  comment: string;
  recordedBy: string;
  recordedAt: string;
  type: "payment" | "adjustment";
}

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "paid" | "pending" | "partially_paid" | "cancelled";
  dueDate?: string;
  date: string;
  type: "subscription" | "placement";
  assignedTo?: string;
  transactions: PaymentTransaction[];
}

interface ModernPaymentTableProps {
  payments: Payment[];
  role?: "Admin" | "Sales_Executive";
  onView?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onMarkPaid?: (payment: Payment) => void;
  onRecordPayment?: (payment: Payment) => void;
  onViewAllClientPayments?: (payment: Payment) => void;
}

export function ModernPaymentTable({
  payments,
  role = "Admin",
  onView,
  onEdit,
  onMarkPaid,
  onRecordPayment,
  onViewAllClientPayments,
}: ModernPaymentTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const isAdmin = role === "Admin";

  const getStatusBadge = (status: Payment["status"], payment?: Payment) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
            ✓ Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
            ⏳ Pending
          </Badge>
        );
      case "partially_paid":
        const percentage = payment ? Math.round((payment.paidAmount / payment.originalAmount) * 100) : 0;
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
            ⚠️ Partial ({percentage}%)
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-50">
            ✕ Cancelled
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDueDateDisplay = (payment: Payment) => {
    if (payment.status === "paid") return "—";
    if (!payment.dueDate) return "—";

    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="text-red-600 font-medium">{Math.abs(diffDays)}d ago</span>
      );
    } else if (diffDays === 0) {
      return <span className="text-amber-600 font-medium">Today</span>;
    } else {
      return (
        <span className="text-gray-600">
          {diffDays}d
        </span>
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(payments.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {isAdmin && selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <span className="text-sm font-medium text-purple-900">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                selectedIds.forEach(id => {
                  const payment = payments.find(p => p.id === id);
                  if (payment) onMarkPaid?.(payment);
                });
              }}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark as Paid
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              {isAdmin && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === payments.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Client
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Paid/Remaining
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Due
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Type
              </TableHead>
              {isAdmin && (
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600 w-32">
                  Assigned
                </TableHead>
              )}
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-600 text-right w-40">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow
                key={payment.id}
                className="group hover:bg-gray-50 transition-colors cursor-pointer"
                onMouseEnter={() => setHoveredRow(payment.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onView?.(payment)}
              >
                {isAdmin && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(payment.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(payment.id, checked as boolean)
                      }
                    />
                  </TableCell>
                )}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div>
                    <div
                      className="text-sm font-medium text-[#682A53] underline cursor-pointer hover:text-[#7d3463]"
                      onClick={() => onViewAllClientPayments?.(payment)}
                    >
                      {payment.clientName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {payment.clientEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-mono">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(payment.paidAmount)}/{formatCurrency(payment.remainingAmount)}
                    </div>
                    {payment.paidAmount > 0 && payment.remainingAmount > 0 && (
                      <div className="text-xs text-gray-500">
                        {Math.round((payment.paidAmount / payment.originalAmount) * 100)}% paid
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(payment.status, payment)}</TableCell>
                <TableCell className="text-sm">
                  {getDueDateDisplay(payment)}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 capitalize">
                    {payment.type}
                  </span>
                </TableCell>
                {isAdmin && (
                  <TableCell className="w-32">
                    <span className="text-sm text-gray-600">
                      {payment.assignedTo || "—"}
                    </span>
                  </TableCell>
                )}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {isAdmin ? (
                      <div
                        className={`flex items-center gap-1 transition-opacity ${
                          hoveredRow === payment.id
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView?.(payment);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(payment);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {payment.status !== "paid" && payment.status !== "cancelled" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRecordPayment?.(payment);
                            }}
                            title="Record Payment"
                          >
                            <DollarSign className="h-4 w-4 text-purple-600" />
                          </Button>
                        )}
                        {payment.status !== "paid" && payment.status !== "cancelled" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkPaid?.(payment);
                            }}
                            title="Mark as Paid"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewAllClientPayments?.(payment);
                          }}
                          title="View All Client Payments"
                        >
                          <FileText className="h-4 w-4 text-blue-600" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView?.(payment);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Showing {payments.length} transactions
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            ← Previous
          </Button>
          <span className="text-sm text-gray-600">Page 1 of 1</span>
          <Button variant="outline" size="sm" disabled>
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
