interface MiniBarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showValues?: boolean;
}

export function MiniBarChart({ data, height = 120, showValues = false }: MiniBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-2">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        const color = item.color || "#682A53";

        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">{item.label}</span>
              {showValues && (
                <span className="text-xs font-semibold text-gray-900">{item.value}</span>
              )}
            </div>
            <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
