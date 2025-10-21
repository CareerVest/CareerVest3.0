import { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
  color?: "purple" | "green" | "blue" | "amber" | "red" | "gray";
  onClick?: () => void;
  subtitle?: string;
  loading?: boolean;
}

const colorClasses = {
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-100 text-green-600",
    text: "text-green-700",
    border: "border-green-200",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-100 text-amber-600",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-600",
    text: "text-red-700",
    border: "border-red-200",
  },
  gray: {
    bg: "bg-gray-50",
    icon: "bg-gray-100 text-gray-600",
    text: "text-gray-700",
    border: "border-gray-200",
  },
};

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  color = "purple",
  onClick,
  subtitle,
  loading = false,
}: KPICardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`relative p-3 bg-white rounded-lg border ${colors.border} hover:shadow-md transition-all duration-200 ${
        onClick ? "cursor-pointer hover:scale-[1.02]" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`p-1.5 rounded-md ${colors.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <div className="flex items-center gap-0.5">
            {trend.isPositive !== undefined ? (
              trend.isPositive ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )
            ) : (
              <Minus className="h-3 w-3 text-gray-400" />
            )}
            <span
              className={`text-xs font-semibold ${
                trend.isPositive !== undefined
                  ? trend.isPositive
                    ? "text-green-600"
                    : "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {title}
        </p>
        {loading ? (
          <div className="h-7 bg-gray-200 animate-pulse rounded w-24"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-900 font-mono">{value}</p>
        )}
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {trend?.label && (
        <p className="text-xs text-gray-500 mt-2">{trend.label}</p>
      )}
    </div>
  );
}
