import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface GlassMetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease";
  icon: LucideIcon;
  sparklineData?: number[];
  iconColor?: string;
  iconBgColor?: string;
}

export function GlassMetricCard({
  title,
  value,
  change,
  changeType = "increase",
  icon: Icon,
  sparklineData = [],
  iconColor = "text-purple-600",
  iconBgColor = "bg-purple-100",
}: GlassMetricCardProps) {
  const chartData = sparklineData.map((value, index) => ({ value, index }));

  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/30 bg-white/70 backdrop-blur-lg shadow transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

      <div className="relative p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${iconBgColor}`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {title}
            </span>
          </div>
          {changeType === "increase" ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
        </div>

        {/* Value */}
        <div>
          <div className="text-2xl font-bold font-mono text-gray-900">
            {value}
          </div>
          {change && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-xs font-medium ${
                  changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}
              >
                {change}
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>

        {/* Sparkline */}
        {sparklineData.length > 0 && (
          <div className="h-8 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#682A53"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
