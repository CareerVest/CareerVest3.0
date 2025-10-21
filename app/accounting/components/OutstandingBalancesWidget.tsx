import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Payment } from "./ModernPaymentTable";

interface OutstandingBalancesWidgetProps {
  payments: Payment[];
  onFilterTable?: () => void;
}

export function OutstandingBalancesWidget({
  payments,
  onFilterTable,
}: OutstandingBalancesWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get payments with outstanding balances
  const outstandingPayments = payments.filter(
    (p) => p.remainingAmount > 0 && p.status !== "cancelled"
  );

  const totalOutstanding = outstandingPayments.reduce(
    (sum, p) => sum + p.remainingAmount,
    0
  );

  const overdueOutstanding = outstandingPayments
    .filter((p) => {
      if (!p.dueDate || p.status === "paid" || p.status === "cancelled") return false;
      const dueDate = new Date(p.dueDate);
      const today = new Date();
      return dueDate < today;
    })
    .reduce((sum, p) => sum + p.remainingAmount, 0);

  // Group by client
  const clientGroups = outstandingPayments.reduce((acc, payment) => {
    if (!acc[payment.clientName]) {
      acc[payment.clientName] = {
        clientName: payment.clientName,
        totalRemaining: 0,
        paymentCount: 0,
      };
    }
    acc[payment.clientName].totalRemaining += payment.remainingAmount;
    acc[payment.clientName].paymentCount += 1;
    return acc;
  }, {} as Record<string, { clientName: string; totalRemaining: number; paymentCount: number }>);

  const clientSummaries = Object.values(clientGroups).sort(
    (a, b) => b.totalRemaining - a.totalRemaining
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (outstandingPayments.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50/50 to-transparent overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-amber-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 bg-amber-500 rounded-full"></div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Outstanding Balances
            </h3>
            <p className="text-sm text-gray-600">
              {outstandingPayments.length} payment
              {outstandingPayments.length !== 1 ? "s" : ""} with outstanding
              balances
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Total Outstanding</p>
              <p className="text-xl font-bold font-mono text-amber-600">
                {formatCurrency(totalOutstanding)}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Overdue Outstanding</p>
              <p className="text-xl font-bold font-mono text-red-600">
                {formatCurrency(overdueOutstanding)}
              </p>
            </div>
          </div>

          {/* Client Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              By Client:
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {clientSummaries.slice(0, 5).map((client) => (
                <div
                  key={client.clientName}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-amber-300 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {client.clientName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {client.paymentCount} payment
                      {client.paymentCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-sm font-bold font-mono text-amber-700">
                    {formatCurrency(client.totalRemaining)}
                  </p>
                </div>
              ))}
              {clientSummaries.length > 5 && (
                <p className="text-xs text-gray-500 text-center py-1">
                  ... and {clientSummaries.length - 5} more
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onFilterTable}
              className="flex-1"
            >
              View All Details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
