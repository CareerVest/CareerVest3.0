"use client";

import { useState, useEffect } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Search, X } from "lucide-react";

interface InterviewChainSearchProps {
  searchText: string;
  setSearchText: (text: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  totalChains: number;
  resetAllFilters: () => void;
}

export default function InterviewChainSearch({
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
  totalChains,
  resetAllFilters,
}: InterviewChainSearchProps) {
  const [searchTerm, setSearchTerm] = useState(searchText);

  // Update local state when props change
  useEffect(() => {
    setSearchTerm(searchText);
  }, [searchText]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSearchText(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchText("");
  };

  const handleResetAll = () => {
    setSearchTerm("");
    resetAllFilters();
  };

  return (
    <div className="space-y-4 mb-6 pt-2 px-1">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Input
            placeholder="Search interview chains..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 z-10"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
        {(searchTerm || statusFilter !== "All") && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            className="whitespace-nowrap"
          >
            Reset All
          </Button>
        )}
      </div>
      {statusFilter !== "All" && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Filtered by:</span>
          <span className="px-2 py-1 bg-gray-100 rounded-md font-medium">
            {statusFilter}
          </span>
        </div>
      )}
    </div>
  );
}
