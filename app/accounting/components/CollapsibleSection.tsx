import { useState, ReactNode, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean; // Allow external control
  onToggle?: (isExpanded: boolean) => void;
}

export function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
  expanded,
  onToggle,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Allow external control of expanded state
  useEffect(() => {
    if (expanded !== undefined) {
      setIsExpanded(expanded);
    }
  }, [expanded]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          {title}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="h-8 px-2 text-xs"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Hide
            </>
          ) : (
            <>
              <ChevronRight className="h-4 w-4 mr-1" />
              Show
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
