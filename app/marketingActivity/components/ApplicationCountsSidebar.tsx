"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import type {
  MarketingClient,
  MarketingApplicationCount,
} from "../../types/MarketingActivity/Marketing";

interface ApplicationCounts {
  totalManualApplications: number;
  totalEasyApplications: number;
  totalReceivedInterviews: number;
}

interface ApplicationCountsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  clients: MarketingClient[];
  onSubmit: (counts: Record<string, ApplicationCounts>) => void;
  applicationCounts?: Record<string, MarketingApplicationCount>;
}

export function ApplicationCountsSidebar({
  isOpen,
  onClose,
  clients,
  onSubmit,
  applicationCounts = {},
}: ApplicationCountsSidebarProps) {
  const [applicationCountsState, setApplicationCountsState] = useState<
    Record<string, ApplicationCounts>
  >({});

  useEffect(() => {
    if (isOpen) {
      const initialCounts: Record<string, ApplicationCounts> = {};
      clients.forEach((client) => {
        const existingCount = applicationCounts[client.clientID.toString()];
        initialCounts[client.clientID.toString()] = {
          totalManualApplications: existingCount?.totalManualApplications || 0,
          totalEasyApplications: existingCount?.totalEasyApplications || 0,
          totalReceivedInterviews: existingCount?.totalReceivedInterviews || 0,
        };
      });
      setApplicationCountsState(initialCounts);
    }
  }, [isOpen, clients, applicationCounts]);

  const handleInputChange = (
    clientId: string,
    field: keyof ApplicationCounts,
    value: string
  ) => {
    const numValue = Number.parseInt(value, 10) || 0;
    setApplicationCountsState((prev) => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        [field]: numValue,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(applicationCountsState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-h-[70vh] overflow-auto pr-4 p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#682A53] mb-2">
          Enter Daily Application Counts
        </h2>
        <p className="text-sm text-gray-600">
          Please enter the number of applications and interviews received for
          each client today.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {clients.map((client) => (
          <Card key={client.clientID} className="border border-[#682A53]/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#682A53]">
                {client.clientName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`manual-${client.clientID}`}>
                    Manual Applications
                  </Label>
                  <Input
                    id={`manual-${client.clientID}`}
                    type="number"
                    min="0"
                    value={
                      applicationCountsState[client.clientID.toString()]
                        ?.totalManualApplications || ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        client.clientID.toString(),
                        "totalManualApplications",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`easy-${client.clientID}`}>
                    Easy Applications
                  </Label>
                  <Input
                    id={`easy-${client.clientID}`}
                    type="number"
                    min="0"
                    value={
                      applicationCountsState[client.clientID.toString()]
                        ?.totalEasyApplications || ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        client.clientID.toString(),
                        "totalEasyApplications",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`interviews-${client.clientID}`}>
                    Received Interviews
                  </Label>
                  <Input
                    id={`interviews-${client.clientID}`}
                    type="number"
                    min="0"
                    value={
                      applicationCountsState[client.clientID.toString()]
                        ?.totalReceivedInterviews || ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        client.clientID.toString(),
                        "totalReceivedInterviews",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-[#682A53]/20 text-[#682A53] hover:bg-[#682A53] hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#FDC500] text-[#682A53] hover:bg-[#682A53] hover:text-white"
        >
          Submit Application Counts
        </Button>
      </div>
    </form>
  );
}
