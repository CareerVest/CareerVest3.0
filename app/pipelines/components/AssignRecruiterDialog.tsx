import React, { useState, useEffect, useRef } from "react";
import { fetchRecruiters } from "../actions/pipelineActions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Users } from "lucide-react";

interface Recruiter {
  id?: number;
  name?: string;
  role?: string;
  // API response properties (PascalCase)
  EmployeeID?: number;
  FirstName?: string;
  LastName?: string;
  Role?: string;
  // API response properties (camelCase)
  employeeID?: number;
  firstName?: string;
  lastName?: string;
}

interface AssignRecruiterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { recruiterId: number; comment: string }) => Promise<void>;
  clientName: string;
  currentRecruiterId?: number | null;
  isChangeRecruiter?: boolean;
}

// Recruiters will be fetched from API

export function AssignRecruiterDialog({
  isOpen,
  onClose,
  onSubmit,
  clientName,
  currentRecruiterId,
  isChangeRecruiter = false,
}: AssignRecruiterDialogProps) {
  const [selectedRecruiterId, setSelectedRecruiterId] =
    useState<string>("none");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [isLoadingRecruiters, setIsLoadingRecruiters] = useState(false);

  const hasLoadedRef = useRef(false);

  // Fetch recruiters when dialog opens
  useEffect(() => {
    if (isOpen && recruiters.length === 0 && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchRecruitersData();
    }
  }, [isOpen]);

  // Reset hasLoadedRef when dialog closes
  useEffect(() => {
    if (!isOpen) {
      hasLoadedRef.current = false;
    }
  }, [isOpen]);

  // Set initial recruiter if already assigned
  useEffect(() => {
    if (currentRecruiterId && currentRecruiterId > 0 && recruiters.length > 0) {
      // Only set the recruiter after recruiters are loaded
      setSelectedRecruiterId(currentRecruiterId.toString());
    } else if (!currentRecruiterId || currentRecruiterId <= 0) {
      setSelectedRecruiterId("none");
    }
  }, [currentRecruiterId, isOpen, recruiters]);

  const fetchRecruitersData = async () => {
    setIsLoadingRecruiters(true);
    try {
      const data = await fetchRecruiters();
      setRecruiters(data);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    } finally {
      setIsLoadingRecruiters(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !selectedRecruiterId ||
      selectedRecruiterId === "loading" ||
      selectedRecruiterId === "no-recruiters" ||
      selectedRecruiterId === "none" ||
      selectedRecruiterId === "0"
    ) {
      return; // Don't submit if no valid recruiter selected
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        recruiterId: parseInt(selectedRecruiterId),
        comment,
      });
      setComment("");
      setSelectedRecruiterId("none");
    } catch (error) {
      console.error("Error assigning recruiter:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecruiterChange = (value: string) => {
    setSelectedRecruiterId(value);
  };

  const canSubmit =
    selectedRecruiterId !== "" &&
    selectedRecruiterId !== "loading" &&
    selectedRecruiterId !== "no-recruiters" &&
    selectedRecruiterId !== "none" &&
    selectedRecruiterId !== "0";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-2xl font-bold text-[#682A53] flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isChangeRecruiter ? "Change Recruiter" : "Assign Recruiter"}
          </DialogTitle>
        </DialogHeader>

        {/* Header Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Client: {clientName}
          </h3>
          <p className="text-sm text-gray-600">
            {isChangeRecruiter
              ? "Change the recruiter assigned to this client. The new recruiter will take over management of the client's progress."
              : "Assign a recruiter to help manage the client's progress through the pipeline."}
          </p>
          {currentRecruiterId && currentRecruiterId > 0 ? (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Current Recruiter:</strong>{" "}
                {recruiters.find((r) => r.id === currentRecruiterId)?.name ||
                  `ID: ${currentRecruiterId}`}
              </p>
            </div>
          ) : (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>No Recruiter Assigned:</strong> This client doesn't have
                a recruiter assigned yet.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          {/* Recruiter Selection */}
          <div>
            <Label htmlFor="recruiter" className="text-sm font-medium">
              Select Recruiter <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedRecruiterId}
              onValueChange={handleRecruiterChange}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a recruiter..." />
              </SelectTrigger>
              <SelectContent>
                {(!currentRecruiterId || currentRecruiterId <= 0) && (
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">
                        Select a recruiter...
                      </span>
                    </div>
                  </SelectItem>
                )}
                {isLoadingRecruiters ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <span>Loading recruiters...</span>
                    </div>
                  </SelectItem>
                ) : recruiters.length > 0 ? (
                  recruiters
                    .map((recruiter) => {
                      // Add null checks and fallbacks
                      const recruiterId =
                        recruiter?.id ||
                        recruiter?.employeeID ||
                        recruiter?.EmployeeID ||
                        0;
                      const recruiterName =
                        recruiter?.name ||
                        `${
                          recruiter?.firstName || recruiter?.FirstName || ""
                        } ${
                          recruiter?.lastName || recruiter?.LastName || ""
                        }`.trim() ||
                        "Unknown";
                      const recruiterRole =
                        recruiter?.role || recruiter?.Role || "Employee";

                      if (!recruiterId) {
                        return null;
                      }

                      return (
                        <SelectItem
                          key={recruiterId}
                          value={recruiterId.toString()}
                        >
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{recruiterName}</span>
                            <span className="text-xs text-gray-500">
                              ({recruiterRole})
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })
                    .filter(Boolean) // Remove null items
                ) : (
                  <SelectItem value="no-recruiters" disabled>
                    <div className="flex items-center gap-2">
                      <span>No recruiters available</span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Comments Section */}
          <div>
            <Label htmlFor="comment" className="text-sm font-medium">
              Assignment Notes (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Add any notes about this assignment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 min-h-[100px] resize-none"
            />
          </div>
        </div>

        <DialogFooter
          className="flex justify-between pt-6"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmit}
            className="bg-[#682A53] hover:bg-[#682A53]/90 text-white min-w-[160px]"
          >
            {isSubmitting
              ? isChangeRecruiter
                ? "Changing..."
                : "Assigning..."
              : isChangeRecruiter
              ? "Change Recruiter"
              : "Assign Recruiter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
