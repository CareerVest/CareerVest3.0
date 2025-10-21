import { AlertTriangle, Clock, CheckCircle, TrendingUp, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Payment } from "./ModernPaymentTable";

interface Insight {
  id: string;
  type: "danger" | "warning" | "success" | "info";
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SmartInsightsProps {
  insights: Insight[];
  role?: "Admin" | "Sales_Executive";
  onReviewPending?: () => void;
  payments?: Payment[];
  totalOutstanding?: number;
  onViewOutstanding?: () => void;
}

export function SmartInsights({
  insights,
  role = "Admin",
  onReviewPending,
  payments = [],
  totalOutstanding = 0,
  onViewOutstanding,
}: SmartInsightsProps) {
  const getInsightConfig = (type: Insight["type"]) => {
    switch (type) {
      case "danger":
        return {
          icon: AlertTriangle,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          iconBg: "bg-red-100",
          titleColor: "text-red-900",
          descColor: "text-red-700",
          buttonColor: "text-red-600 hover:text-red-800",
        };
      case "warning":
        return {
          icon: Clock,
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          iconColor: "text-amber-600",
          iconBg: "bg-amber-100",
          titleColor: "text-amber-900",
          descColor: "text-amber-700",
          buttonColor: "text-amber-600 hover:text-amber-800",
        };
      case "success":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          iconColor: "text-green-600",
          iconBg: "bg-green-100",
          titleColor: "text-green-900",
          descColor: "text-green-700",
          buttonColor: "text-green-600 hover:text-green-800",
        };
      default:
        return {
          icon: TrendingUp,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
          titleColor: "text-blue-900",
          descColor: "text-blue-700",
          buttonColor: "text-blue-600 hover:text-blue-800",
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get outstanding balances data
  const outstandingPayments = payments.filter(
    (p) => p.remainingAmount > 0 && p.status !== "cancelled"
  );

  const overdueOutstanding = payments
    .filter((p) => {
      if (!p.dueDate || p.status === "paid" || p.status === "cancelled") return false;
      const dueDate = new Date(p.dueDate);
      const today = new Date();
      return dueDate < today;
    })
    .reduce((sum, p) => sum + p.remainingAmount, 0);

  // Group by client for outstanding
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

  // Limit insights to 3, add outstanding as 4th
  const displayInsights = insights.slice(0, 3);

  if (insights.length === 0 && totalOutstanding === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        <CheckCircle className="h-6 w-6 mx-auto mb-1 text-gray-400" />
        <p className="text-xs">All caught up! No insights at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Insights Boxes */}
      {displayInsights.map((insight) => {
        const config = getInsightConfig(insight.type);
        const Icon = config.icon;

        return (
          <div
            key={insight.id}
            className={`flex flex-col p-2.5 rounded-md border ${config.bgColor} ${config.borderColor} transition-all duration-200 hover:shadow`}
          >
            {/* Icon and Title */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <div
                className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md ${config.iconBg}`}
              >
                <Icon className={`w-3 h-3 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-xs font-semibold ${config.titleColor} leading-tight`}>
                  {insight.title}
                </h4>
              </div>
            </div>

            {/* Description */}
            {insight.description && (
              <p className={`text-xs ${config.descColor} mb-1.5`}>
                {insight.description}
              </p>
            )}

            {/* Action Button */}
            {insight.action && role === "Admin" && (
              <Button
                onClick={insight.action.onClick}
                size="sm"
                variant="ghost"
                className={`w-full justify-center ${config.buttonColor} hover:bg-white/50 h-7 text-xs`}
              >
                {insight.action.label}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        );
      })}

      {/* Outstanding Balances Box */}
      {totalOutstanding > 0 && (
        <div className="flex flex-col p-2.5 rounded-md border bg-purple-50 border-purple-200 transition-all duration-200 hover:shadow">
          {/* Icon and Title */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-purple-100">
              <DollarSign className="w-3 h-3 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-purple-900 leading-tight">
                Outstanding Balances
              </h4>
            </div>
          </div>

          {/* Outstanding Details */}
          <div className="space-y-0.5 mb-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-700">Total:</span>
              <span className="text-xs font-bold text-purple-900">
                {formatCurrency(totalOutstanding)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-700">Payments:</span>
              <span className="text-xs font-medium text-purple-900">
                {outstandingPayments.length}
              </span>
            </div>
            {overdueOutstanding > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-red-700">Overdue:</span>
                <span className="text-xs font-medium text-red-700">
                  {formatCurrency(overdueOutstanding)}
                </span>
              </div>
            )}
            {clientSummaries.length > 0 && (
              <div className="pt-0.5 border-t border-purple-200 mt-0.5">
                <p className="text-xs text-purple-700 mb-0.5">Top clients:</p>
                <div className="space-y-0.5">
                  {clientSummaries.slice(0, 2).map((client) => (
                    <div key={client.clientName} className="flex justify-between items-center">
                      <span className="text-xs text-purple-800 truncate flex-1">
                        {client.clientName}
                      </span>
                      <span className="text-xs font-medium text-purple-900 ml-2">
                        {formatCurrency(client.totalRemaining)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          {role === "Admin" && onViewOutstanding && (
            <Button
              onClick={onViewOutstanding}
              size="sm"
              variant="ghost"
              className="w-full justify-center text-purple-600 hover:text-purple-800 hover:bg-white/50 h-7 text-xs"
            >
              View Details
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
