interface SimpleLineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  showDots?: boolean;
}

export function SimpleLineChart({
  data,
  color = "#682A53",
  height = 80,
  showDots = false,
}: SimpleLineChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return { x, y, value: point.value, label: point.label };
  });

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const areaData = `${pathData} L 100 100 L 0 100 Z`;

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Area fill */}
        <path
          d={areaData}
          fill={color}
          fillOpacity="0.1"
          className="transition-all duration-300"
        />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Dots */}
        {showDots &&
          points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              fill={color}
              className="transition-all duration-300"
            >
              <title>
                {point.label}: {point.value}
              </title>
            </circle>
          ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-1">
        {data.map((point, index) => (
          <span key={index} className="text-[9px] text-gray-500">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
