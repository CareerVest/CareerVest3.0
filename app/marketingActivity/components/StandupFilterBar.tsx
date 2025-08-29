"use client";

import { useState, useCallback } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Card, CardContent } from "../../../components/ui/card";
import dayjs, { Dayjs } from "dayjs";
import type {
  StandupFilterState,
  MarketingRecruiter,
  MarketingClient,
} from "../../types/MarketingActivity/Marketing";

interface StandupFilterBarProps {
  filters: StandupFilterState;
  onFiltersChange: (filters: StandupFilterState) => void;
  standupMode: boolean;
  onOpenApplicationCounts: () => void;
  recruiters?: MarketingRecruiter[] | undefined | null;
  clients?: MarketingClient[];
}

export function StandupFilterBar({
  filters,
  onFiltersChange,
  standupMode,
  onOpenApplicationCounts,
  recruiters,
  clients,
}: StandupFilterBarProps) {
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

  const handleDateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const newDate = value ? dayjs(value) : null;
      onFiltersChange({
        ...filters,
        selectedDate: newDate,
      });
      setError(null);
    },
    [filters, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    const newFilters: StandupFilterState = {
      selectedDate: dayjs(),
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
            <div className="flex-1">
              <Input
                type="date"
                value={filters.selectedDate?.format("YYYY-MM-DD") || ""}
                onChange={handleDateChange}
                className="w-full"
                aria-label="Select date"
              />
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
