"use client";

import { useState, useCallback } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Card, CardContent } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import dayjs, { Dayjs } from "dayjs";
import type {
  FilterState,
  MarketingRecruiter,
  MarketingClient,
} from "../../types/MarketingActivity/Marketing";

interface NonStandupFilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  standupMode: boolean;
  onOpenApplicationCounts: () => void;
  recruiters?: MarketingRecruiter[] | undefined | null;
  clients?: MarketingClient[];
}

export function NonStandupFilterBar({
  filters,
  onFiltersChange,
  standupMode,
  onOpenApplicationCounts,
  recruiters,
  clients,
}: NonStandupFilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.searchQuery || "");
  const [error, setError] = useState<string | null>(null);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchInput(value);
      onFiltersChange({
        ...filters,
        searchQuery: value,
      });
      setError(null);
    },
    [filters, onFiltersChange]
  );

  const handleStartDateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const newStart = value ? dayjs(value) : null;
      const newDateRange: [Dayjs | null, Dayjs | null] = [
        newStart,
        filters.dateRange[1],
      ];
      if (
        newStart &&
        filters.dateRange[1] &&
        newStart.isAfter(filters.dateRange[1])
      ) {
        setError("Start date cannot be after end date.");
        return;
      }
      onFiltersChange({
        ...filters,
        dateRange: newDateRange,
      });
      setError(null);
    },
    [filters, onFiltersChange]
  );

  const handleEndDateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const newEnd = value ? dayjs(value) : null;
      const newDateRange: [Dayjs | null, Dayjs | null] = [
        filters.dateRange[0],
        newEnd,
      ];
      if (
        newEnd &&
        filters.dateRange[0] &&
        newEnd.isBefore(filters.dateRange[0])
      ) {
        setError("End date cannot be before start date.");
        return;
      }
      onFiltersChange({
        ...filters,
        dateRange: newDateRange,
      });
      setError(null);
    },
    [filters, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    const newFilters: FilterState = {
      recruiter: "",
      dateRange: [null, null],
      status: "all",
      type: "all",
      searchQuery: "",
      quickFilters: [],
    };
    onFiltersChange(newFilters);
    setSearchInput("");
    setError(null);
  }, [onFiltersChange]);

  return (
    <div className="mb-4">
      <Card className="mb-4 border border-gray-200 bg-transparent">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search interviews..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="w-full"
                  aria-label="Search interviews"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-[#682A53] text-xs sm:text-sm">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={filters.dateRange[0]?.format("YYYY-MM-DD") || ""}
                  onChange={handleStartDateChange}
                  className="w-full"
                  aria-label="Start date"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[#682A53] text-xs sm:text-sm">
                  End Date
                </Label>
                <Input
                  type="date"
                  value={filters.dateRange[1]?.format("YYYY-MM-DD") || ""}
                  onChange={handleEndDateChange}
                  className="w-full"
                  aria-label="End date"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="whitespace-nowrap text-xs sm:text-sm"
                aria-label="Clear filters"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
