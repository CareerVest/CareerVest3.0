import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, ReactNode } from "react";

interface DepartmentSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  color?: "purple" | "green" | "blue" | "amber";
  defaultExpanded?: boolean;
  collapsible?: boolean;
}

const colorClasses = {
  purple: "border-purple-200 bg-purple-50/30",
  green: "border-green-200 bg-green-50/30",
  blue: "border-blue-200 bg-blue-50/30",
  amber: "border-amber-200 bg-amber-50/30",
};

export function DepartmentSection({
  title,
  icon,
  children,
  color = "purple",
  defaultExpanded = true,
  collapsible = true,
}: DepartmentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border rounded-lg overflow-hidden ${colorClasses[color]}`}>
      <div
        className={`flex items-center justify-between px-4 py-2 bg-white border-b ${
          collapsible ? "cursor-pointer hover:bg-gray-50" : ""
        }`}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            {title}
          </h3>
        </div>
        {collapsible && (
          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}
      </div>
      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  );
}
