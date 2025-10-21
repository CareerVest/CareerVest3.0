import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Payment } from "./ModernPaymentTable";
import { toast } from "sonner";
import { getClientPayments } from "../actions/accountingActions";
import Spinner from "../../../components/ui/spinner";

type SidebarMode = "view" | "edit" | "markPaid" | "recordPayment" | "viewAllClientPayments";

interface PaymentSidebarProps {
  payment: Payment | null;
  mode: SidebarMode;
  open: boolean;
  onClose: () => void;
  onSave?: (payment: Payment) => void;
  onMarkPaid?: (payment: Payment, comment: string) => void;
  onRecordPayment?: (payment: Payment, amount: number, paidDate: string, comment: string) => void;
  clientCreditBalance?: number;
}

export function PaymentSidebar({
  payment,
  mode,
  open,
  onClose,
  onSave,
  onMarkPaid,
  onRecordPayment,
  clientCreditBalance = 0,
}: PaymentSidebarProps) {
  const [formData, setFormData] = useState<Payment | null>(null);
  const [comment, setComment] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [allClientPayments, setAllClientPayments] = useState<Payment[]>([]);
  const [loadingAllPayments, setLoadingAllPayments] = useState(false);

  useEffect(() => {
    if (payment) {
      setFormData({ ...payment });
      // Initialize payment amount to remaining amount for recordPayment mode
      if (mode === "recordPayment") {
        setPaymentAmount(payment.remainingAmount.toString());
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setComment("");
      }
      // Fetch all client payments for viewAllClientPayments mode
      if (mode === "viewAllClientPayments") {
        const fetchAllPayments = async () => {
          setLoadingAllPayments(true);
          try {
            const paymentsDto = await getClientPayments(Number(payment.clientId));
            // Map PaymentDto to Payment
            const mappedPayments: Payment[] = paymentsDto.map((p: any) => {
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
            });
            setAllClientPayments(mappedPayments);
          } catch (error) {
            console.error("Error fetching all client payments:", error);
            toast.error("Failed to load all client payments");
          } finally {
            setLoadingAllPayments(false);
          }
        };
        fetchAllPayments();
      }
    }
  }, [payment, mode]);

  // Handle Escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!formData) return null;

  const handleSave = () => {
    if (!formData.clientName || !formData.clientEmail || !formData.originalAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSave?.(formData);
    toast.success("Payment updated successfully");
    onClose();
  };

  const handleMarkPaid = () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    onMarkPaid?.(formData, comment);
    toast.success(`Payment marked as paid for ${formData.clientName}`);
    setComment("");
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            ✓ Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200">
            ⏳ Pending
          </Badge>
        );
      case "partially_paid":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
            ⚠️ Partial
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-50 text-gray-500 border-gray-200">
            ✕ Cancelled
          </Badge>
        );
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "view":
        return "Payment Details";
      case "edit":
        return "Edit Payment";
      case "markPaid":
        return "Mark as Paid";
      case "recordPayment":
        return "Record Payment";
      case "viewAllClientPayments":
        return "All Client Payments";
    }
  };

  const handleRecordPayment = () => {
    const amount = parseFloat(paymentAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (!paymentDate) {
      toast.error("Please select a payment date");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    onRecordPayment?.(formData!, amount, paymentDate, comment);

    if (amount > formData!.remainingAmount) {
      toast.success(`Payment recorded. $${(amount - formData!.remainingAmount).toFixed(2)} added to client credit balance.`);
    } else if (amount === formData!.remainingAmount) {
      toast.success("Payment recorded and marked as paid");
    } else {
      toast.success("Partial payment recorded");
    }

    setPaymentAmount("");
    setPaymentDate("");
    setComment("");
    onClose();
  };

  if (!formData || !open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop - covers entire screen like interview chains */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
        onClick={onClose}
      />

      {/* Side Panel - slides from right */}
      <div
        className="relative ml-auto w-full max-w-xl h-full bg-white shadow-2xl z-50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-[#682A53] rounded-full"></div>
            <h2 className="text-base font-semibold text-[#682A53]">{getTitle()}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content - Compact scroll */}
        <div className="flex-1 p-4 overflow-y-auto">
          {mode === "view" && (
            <div className="space-y-3">
              {/* Client Information */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Client Information
                </h3>
                <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Client Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formData.clientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formData.clientEmail}
                    </p>
                  </div>
                  {formData.assignedTo && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Assigned To</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.assignedTo}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Payment Information
                </h3>
                <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Original Amount</p>
                    <p className="text-lg font-bold font-mono text-gray-900">
                      {formatCurrency(formData.originalAmount)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Paid</p>
                      <p className="text-lg font-bold font-mono text-green-600">
                        {formatCurrency(formData.paidAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Remaining</p>
                      <p className="text-lg font-bold font-mono text-amber-600">
                        {formatCurrency(formData.remainingAmount)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Status</p>
                    <div>{getStatusBadge(formData.status)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Payment Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {formData.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(formData.date)}
                    </p>
                  </div>
                  {formData.dueDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Due Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(formData.dueDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment History */}
              {formData.transactions && formData.transactions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Payment History ({formData.transactions.length} transaction{formData.transactions.length !== 1 ? 's' : ''})
                  </h3>
                  <div className="space-y-2">
                    {formData.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-4 bg-white rounded-md border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(transaction.amount)} paid
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.paidDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })} at {new Date(transaction.recordedAt).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <span className="text-green-600 text-lg">✓</span>
                        </div>
                        {transaction.comment && (
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            "{transaction.comment}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Recorded by: {transaction.recordedBy}
                        </p>
                      </div>
                    ))}
                  </div>

                  {formData.remainingAmount > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm font-medium text-amber-800">
                        ⏳ {formatCurrency(formData.remainingAmount)} still outstanding
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Reference */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Reference
                </h3>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-500 mb-0.5">Payment ID</p>
                  <p className="text-base font-mono text-gray-900">
                    #{formData.id}
                  </p>
                </div>
              </div>
            </div>
          )}

          {mode === "edit" && (
            <div className="space-y-3">
              {/* Client Information */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Client Information
                </h3>
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">
                      Client Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      value={formData.assignedTo || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, assignedTo: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Payment Details
                </h3>
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="originalAmount">
                      Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="originalAmount"
                      type="number"
                      value={formData.originalAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalAmount: parseFloat(e.target.value) || 0,
                          remainingAmount: parseFloat(e.target.value) || 0 - formData.paidAmount,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: Payment["status"]) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Payment Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: Payment["type"]) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="placement">Placement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Payment Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === "recordPayment" && (
            <div className="space-y-3">
              {/* Client Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Client Information
                </h3>
                <div className="p-3 bg-gray-50 rounded-md space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Client</p>
                    <p className="text-sm font-medium text-gray-900">{formData.clientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{formData.clientEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{formData.type}</p>
                  </div>
                  {formData.dueDate && (
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(formData.dueDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Payment Summary
                </h3>
                <div className="p-4 bg-purple-50 rounded-md border border-purple-200 space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Original Amount:</p>
                    <p className="text-sm font-bold font-mono text-gray-900">{formatCurrency(formData.originalAmount)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Already Paid:</p>
                    <p className="text-sm font-bold font-mono text-green-600">{formatCurrency(formData.paidAmount)}</p>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-purple-300">
                    <p className="text-sm font-semibold text-gray-900">Remaining:</p>
                    <p className="text-lg font-bold font-mono text-purple-700">{formatCurrency(formData.remainingAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">
                  Payment Amount <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-7"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Payment Date */}
              <div className="space-y-2">
                <Label htmlFor="paymentDate">
                  Payment Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="paymentComment">
                  Comment / Notes <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="paymentComment"
                  placeholder="Enter payment details, transaction ID, check number, or any relevant notes..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Info message */}
              {paymentAmount && parseFloat(paymentAmount) > formData.remainingAmount && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    ℹ️ Payment amount exceeds remaining balance. ${(parseFloat(paymentAmount) - formData.remainingAmount).toFixed(2)} will be added to client's credit balance.
                  </p>
                </div>
              )}

              {clientCreditBalance > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    💰 Client has a credit balance of {formatCurrency(clientCreditBalance)}
                  </p>
                </div>
              )}
            </div>
          )}

          {mode === "markPaid" && (
            <div className="space-y-3">
              {/* Payment Summary */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-md border border-green-200">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formData.clientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-xl font-bold font-mono text-[#682A53]">
                      {formatCurrency(formData.originalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {formData.type}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comment Field */}
              <div className="space-y-2">
                <Label htmlFor="comment">
                  Comment / Notes <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Enter payment confirmation details, transaction ID, or any relevant notes..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  This comment will be saved with the payment record.
                </p>
              </div>
            </div>
          )}

          {mode === "viewAllClientPayments" && (
            <div className="space-y-3">
              {loadingAllPayments ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner variant="ripple" size="md" />
                </div>
              ) : (
                <>
                  {/* Client Overview */}
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-md border border-purple-200">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Client Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-600">Name</p>
                        <p className="text-sm font-semibold text-gray-900">{formData.clientName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="text-sm text-gray-900">{formData.clientEmail}</p>
                      </div>
                      {formData.assignedTo && (
                        <div>
                          <p className="text-xs text-gray-600">Assigned Salesperson</p>
                          <p className="text-sm font-medium text-gray-900">{formData.assignedTo}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-green-50 rounded-md border border-green-200">
                      <p className="text-xs text-gray-600">Total Revenue</p>
                      <p className="text-sm font-bold text-green-700 font-mono">
                        {formatCurrency(allClientPayments.reduce((sum, p) => sum + p.paidAmount, 0))}
                      </p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-md border border-amber-200">
                      <p className="text-xs text-gray-600">Outstanding</p>
                      <p className="text-sm font-bold text-amber-700 font-mono">
                        {formatCurrency(allClientPayments.reduce((sum, p) => sum + p.remainingAmount, 0))}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-xs text-gray-600">Total Payments</p>
                      <p className="text-sm font-bold text-blue-700">
                        {allClientPayments.length}
                      </p>
                    </div>
                  </div>

                  {/* Subscription Payments */}
                  {allClientPayments.some(p => p.type === "subscription") && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Subscription Payments ({allClientPayments.filter(p => p.type === "subscription").length})
                      </h3>
                      <div className="space-y-2">
                        {allClientPayments
                          .filter(p => p.type === "subscription")
                          .map((payment) => (
                            <div key={payment.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getStatusBadge(payment.status)}
                                    <span className="text-xs text-gray-500">
                                      Due: {payment.dueDate ? formatDate(payment.dueDate) : "N/A"}
                                    </span>
                                  </div>
                                  <p className="text-sm font-mono font-semibold text-gray-900">
                                    {formatCurrency(payment.originalAmount)}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-gray-500">Paid</p>
                                  <p className="font-medium text-green-600">{formatCurrency(payment.paidAmount)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Remaining</p>
                                  <p className="font-medium text-amber-600">{formatCurrency(payment.remainingAmount)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Placement Payments */}
                  {allClientPayments.some(p => p.type === "placement") && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Post-Placement Payments ({allClientPayments.filter(p => p.type === "placement").length})
                      </h3>
                      <div className="space-y-2">
                        {allClientPayments
                          .filter(p => p.type === "placement")
                          .map((payment) => (
                            <div key={payment.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getStatusBadge(payment.status)}
                                    <span className="text-xs text-gray-500">
                                      Due: {payment.dueDate ? formatDate(payment.dueDate) : "N/A"}
                                    </span>
                                  </div>
                                  <p className="text-sm font-mono font-semibold text-gray-900">
                                    {formatCurrency(payment.originalAmount)}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-gray-500">Paid</p>
                                  <p className="font-medium text-green-600">{formatCurrency(payment.paidAmount)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Remaining</p>
                                  <p className="font-medium text-amber-600">{formatCurrency(payment.remainingAmount)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer - Compact */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white flex items-center justify-end gap-2">
          {mode === "viewAllClientPayments" ? (
            <Button onClick={onClose} className="bg-[#682A53] hover:bg-[#7d3463]">
              Close
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          {mode === "edit" && (
            <Button
              onClick={handleSave}
              className="bg-[#682A53] hover:bg-[#7d3463]"
            >
              Save Changes
            </Button>
          )}
          {mode === "recordPayment" && (
            <Button
              onClick={handleRecordPayment}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Record Payment
            </Button>
          )}
          {mode === "markPaid" && (
            <Button
              onClick={handleMarkPaid}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Payment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
