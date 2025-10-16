import { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";
import { format } from "date-fns";
import { cn } from "../../../lib/utils";

export type TimePeriod =
  | "this_month"
  | "next_month"
  | "last_month"
  | "this_quarter"
  | "next_quarter"
  | "last_quarter"
  | "this_year"
  | "last_year"
  | "all_time"
  | "custom";

interface GlobalTimeFilterProps {
  value: TimePeriod;
  onChange: (period: TimePeriod, startDate?: Date, endDate?: Date) => void;
  dateRangeLabel?: string;
  onRefresh?: () => void;
}

export function GlobalTimeFilter({
  value,
  onChange,
  dateRangeLabel,
  onRefresh,
}: GlobalTimeFilterProps) {
  const [customStart, setCustomStart] = useState<Date>();
  const [customEnd, setCustomEnd] = useState<Date>();
  const [isCustomPopoverOpen, setIsCustomPopoverOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handlePeriodChange = (newValue: TimePeriod) => {
    if (newValue === "custom") {
      setInternalValue("custom");
      // Don't automatically open popover, let user click on date fields
    } else {
      setIsCustomPopoverOpen(false);
      setInternalValue(newValue);
      onChange(newValue);
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setCustomStart(date);
    if (date && customEnd) {
      onChange("custom", date, customEnd);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setCustomEnd(date);
    if (customStart && date) {
      onChange("custom", customStart, date);
    }
  };

  const getDisplayValue = () => {
    if (internalValue === "custom" && customStart && customEnd) {
      return `${format(customStart, "MMM d")} - ${format(customEnd, "MMM d, yyyy")}`;
    }
    return internalValue.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50/50 to-transparent rounded-lg border border-purple-100">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-purple-600" />
        <span className="text-sm font-semibold text-gray-700">Period:</span>
      </div>

      <div className="flex items-center gap-3">
        <Select value={internalValue} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[200px] border-purple-200 focus:ring-purple-500">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="next_month">Next Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <div className="h-px bg-gray-200 my-1" />
            <SelectItem value="this_quarter">This Quarter</SelectItem>
            <SelectItem value="next_quarter">Next Quarter</SelectItem>
            <SelectItem value="last_quarter">Last Quarter</SelectItem>
            <div className="h-px bg-gray-200 my-1" />
            <SelectItem value="this_year">This Year</SelectItem>
            <SelectItem value="last_year">Last Year</SelectItem>
            <div className="h-px bg-gray-200 my-1" />
            <SelectItem value="all_time">All Time</SelectItem>
            <SelectItem value="custom">Custom Range...</SelectItem>
          </SelectContent>
        </Select>

        {/* Show read-only date range for preset periods */}
        {dateRangeLabel && internalValue !== "custom" && (
          <span className="text-sm text-gray-600">{dateRangeLabel}</span>
        )}

        {/* Show editable date pickers for custom range */}
        {internalValue === "custom" && (
          <div className="flex items-center gap-2">
            {/* Start Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !customStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customStart ? format(customStart, "MMM d, yyyy") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customStart}
                  onSelect={handleStartDateSelect}
                  initialFocus
                  captionLayout="dropdown"
                  fromYear={2020}
                  toYear={2030}
                />
              </PopoverContent>
            </Popover>

            <span className="text-gray-500">→</span>

            {/* End Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !customEnd && "text-muted-foreground"
                  )}
                  disabled={!customStart}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customEnd ? format(customEnd, "MMM d, yyyy") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customEnd}
                  onSelect={handleEndDateSelect}
                  disabled={(date) => (customStart ? date < customStart : false)}
                  initialFocus
                  captionLayout="dropdown"
                  fromYear={2020}
                  toYear={2030}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="ml-auto"
        onClick={onRefresh}
      >
        🔄 Refresh
      </Button>
    </div>
  );
}
