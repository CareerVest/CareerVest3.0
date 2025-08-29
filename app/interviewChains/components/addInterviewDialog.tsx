"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import type {
  Interview,
  InterviewChain,
} from "../../types/interviewChain/interviewChain";
import { useInterviewForm } from "./hooks/useInterviewForm";

// Interview dropdowns data
const interviewDropdowns = {
  interviewTypes: [
    "Screening",
    "Technical Interview",
    "HR Round",
    "Behavioral round",
    "Final Round",
    "Assessment",
    "On-Demand Interview",
  ],
  interviewMethods: [
    "Video Call",
    "Phone Call",
    "In-person",
    "Microsoft Teams",
    "Google Meet",
    "WebEx",
    "Zoom",
    "Live Test",
    "Amazon Chime",
    "Asynchronous (Recorded)",
    "Other",
  ],
  interviewSupports: ["Yes", "No"],
};

type Step = 1 | 2 | 3 | 4;

const steps: { id: Step; title: string; description: string }[] = [
  { id: 1, title: "Basic Info", description: "Interview details and timing" },
  {
    id: 2,
    title: "Interview Details",
    description: "Type, method, and status",
  },
  { id: 3, title: "End Client Info", description: "Recruiter contact details" },
  { id: 4, title: "Review & Submit", description: "Final review and comments" },
];

interface AddInterviewDialogProps {
  chain: InterviewChain;
  open: boolean;
  onClose: () => void;
  onSubmit: (
    chainId: string,
    outcome: "AddNew",
    newInterview?: Partial<Interview> & {
      clientName?: string;
      position?: string;
      recruiterName?: string;
    }
  ) => void;
  selectedInterview?: Interview;
  isSubmitting?: boolean;
}

export default function AddInterviewDialog({
  chain,
  open,
  onClose,
  onSubmit,
  selectedInterview,
  isSubmitting = false,
}: AddInterviewDialogProps) {
  const {
    newInterview,
    errors,
    recruiters,
    clients,
    loading,
    handleInputChange,
    validateAndSubmit,
  } = useInterviewForm(chain, false, undefined, selectedInterview);

  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);

  useEffect(() => {
    if (open && !isFormInitialized) {
      // Initialize form fields
      handleInputChange("clientName", chain.clientName || "");
      handleInputChange("position", chain.position || "");
      handleInputChange("recruiterName", chain.recruiterName);
      handleInputChange("EndClientName", chain.endClientName || "");

      // Prefill recruiter details from selected interview if present (e.g., Rescheduled)
      if (selectedInterview) {
        handleInputChange(
          "EndClientRecruiterName",
          selectedInterview.EndClientRecruiterName || ""
        );
        handleInputChange(
          "EndClientRecruiterEmail",
          selectedInterview.EndClientRecruiterEmail || ""
        );
        handleInputChange(
          "EndClientRecruiterPhone",
          selectedInterview.EndClientRecruiterPhone || ""
        );
        handleInputChange(
          "EndClientRecruiterLinkedIn",
          selectedInterview.EndClientRecruiterLinkedIn || ""
        );
      } else {
        handleInputChange("EndClientRecruiterName", "");
        handleInputChange("EndClientRecruiterEmail", "");
        handleInputChange("EndClientRecruiterPhone", "");
        handleInputChange("EndClientRecruiterLinkedIn", "");
      }

      handleInputChange("ChainStatus", chain.status || "Active");
      handleInputChange("InterviewStatus", "Scheduled");
      handleInputChange("InterviewOutcome", "");
      handleInputChange("InterviewDate", "");
      handleInputChange("InterviewStartTime", "");
      handleInputChange("InterviewEndTime", "");
      handleInputChange("InterviewType", "");
      handleInputChange("InterviewMethod", "");
      handleInputChange("InterviewSupport", "");
      handleInputChange("Comments", "");

      // Set RecruiterID and ParentInterviewChainID if applicable
      if (chain.interviews.length > 0 || selectedInterview) {
        const interviewToUse =
          selectedInterview || chain.interviews[chain.interviews.length - 1];
        handleInputChange("RecruiterID", interviewToUse.RecruiterID || null);
        if (selectedInterview) {
          console.log(
            "Setting ParentInterviewChainID to:",
            selectedInterview.InterviewChainID
          );
          handleInputChange(
            "ParentInterviewChainID",
            selectedInterview.InterviewChainID
          );
        }
      }

      setIsFormInitialized(true);
      setCurrentStep(1);
    }
    if (!open) {
      setIsFormInitialized(false);
    }
  }, [open, chain, handleInputChange, isFormInitialized, selectedInterview]);

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        // Step 1 only contains read-only fields, so always valid
        return true;
      case 2:
        return !!(
          newInterview.InterviewDate && 
          newInterview.InterviewType &&
          newInterview.InterviewStartTime &&
          newInterview.InterviewEndTime &&
          newInterview.InterviewMethod
        );
      case 3:
        return !!(
          newInterview.EndClientRecruiterName &&
          newInterview.EndClientRecruiterEmail &&
          newInterview.EndClientName
        );
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recruiter Name - Read Only */}
              <div>
                <Label htmlFor="recruiterName">Recruiter Name</Label>
                <Input
                  id="recruiterName"
                  value={newInterview.recruiterName || ""}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>

              {/* Client Name - Read Only */}
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={newInterview.clientName || ""}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>

              {/* Technology - Read Only */}
              <div>
                <Label htmlFor="position">Technology</Label>
                <Input
                  id="position"
                  value={newInterview.position || ""}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Interview Date and Type in one line */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interviewDate">Interview Date *</Label>
                    <Input
                      id="interviewDate"
                      type="date"
                      value={
                        newInterview.InterviewDate
                          ? new Date(newInterview.InterviewDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange("InterviewDate", e.target.value)
                      }
                      disabled={isSubmitting || loading}
                    />
                    {errors.InterviewDate && (
                      <p className="text-sm text-red-600 mt-1">
                        Date is required
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="interviewType">Interview Type *</Label>
                    <Select
                      value={newInterview.InterviewType || ""}
                      onValueChange={(value) =>
                        handleInputChange("InterviewType", value)
                      }
                      disabled={isSubmitting || loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {interviewDropdowns.interviewTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.InterviewType && (
                      <p className="text-sm text-red-600 mt-1">
                        Interview Type is required
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Start Time and End Time in one line */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newInterview.InterviewStartTime || ""}
                      onChange={(e) =>
                        handleInputChange("InterviewStartTime", e.target.value)
                      }
                      disabled={isSubmitting || loading}
                    />
                    {errors.InterviewStartTime && (
                      <p className="text-sm text-red-600 mt-1">
                        Start time is required
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newInterview.InterviewEndTime || ""}
                      onChange={(e) =>
                        handleInputChange("InterviewEndTime", e.target.value)
                      }
                      disabled={isSubmitting || loading}
                    />
                    {errors.InterviewEndTime && (
                      <p className="text-sm text-red-600 mt-1">
                        End time is required
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Interview Method */}
              <div>
                <Label htmlFor="interviewMethod">Interview Method *</Label>
                <Select
                  value={newInterview.InterviewMethod || ""}
                  onValueChange={(value) =>
                    handleInputChange("InterviewMethod", value)
                  }
                  disabled={isSubmitting || loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewDropdowns.interviewMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.InterviewMethod && (
                  <p className="text-sm text-red-600 mt-1">
                    Interview Method is required
                  </p>
                )}
              </div>

              {/* Interview Status - Read Only */}
              <div>
                <Label htmlFor="interviewStatus">Interview Status</Label>
                <Input
                  id="interviewStatus"
                  value={newInterview.InterviewStatus || "Scheduled"}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>

              {/* Interview Outcome - Read Only */}
              <div>
                <Label htmlFor="interviewOutcome">Interview Outcome</Label>
                <Input
                  id="interviewOutcome"
                  value={newInterview.InterviewOutcome || ""}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>

              {/* Interview Support */}
              <div>
                <Label htmlFor="interviewSupport">Support</Label>
                <Select
                  value={newInterview.InterviewSupport || ""}
                  onValueChange={(value) =>
                    handleInputChange("InterviewSupport", value)
                  }
                  disabled={isSubmitting || loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Support" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewDropdowns.interviewSupports.map((support) => (
                      <SelectItem key={support} value={support}>
                        {support}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* End Client Name */}
              <div>
                <Label htmlFor="endClientName">End Client Name</Label>
                <Input
                  id="endClientName"
                  value={newInterview.EndClientName || ""}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>

              {/* End Client Recruiter Name */}
              <div>
                <Label htmlFor="endClientRecruiterName">
                  End Client Recruiter Name *
                </Label>
                <Input
                  id="endClientRecruiterName"
                  value={newInterview.EndClientRecruiterName || ""}
                  onChange={(e) =>
                    handleInputChange("EndClientRecruiterName", e.target.value)
                  }
                  disabled={isSubmitting || loading}
                />
                {errors.EndClientRecruiterName && (
                  <p className="text-sm text-red-600 mt-1">
                    Recruiter Name is required
                  </p>
                )}
              </div>

              {/* End Client Recruiter Email */}
              <div>
                <Label htmlFor="endClientRecruiterEmail">
                  End Client Recruiter Email *
                </Label>
                <Input
                  id="endClientRecruiterEmail"
                  type="email"
                  value={newInterview.EndClientRecruiterEmail || ""}
                  onChange={(e) =>
                    handleInputChange("EndClientRecruiterEmail", e.target.value)
                  }
                  disabled={isSubmitting || loading}
                />
                {errors.EndClientRecruiterEmail && (
                  <p className="text-sm text-red-600 mt-1">
                    Valid email is required
                  </p>
                )}
              </div>

              {/* End Client Recruiter Phone */}
              <div>
                <Label htmlFor="endClientRecruiterPhone">
                  End Client Recruiter Phone
                </Label>
                <Input
                  id="endClientRecruiterPhone"
                  value={newInterview.EndClientRecruiterPhone || ""}
                  onChange={(e) =>
                    handleInputChange("EndClientRecruiterPhone", e.target.value)
                  }
                  disabled={isSubmitting || loading}
                />
              </div>

              {/* End Client Recruiter LinkedIn */}
              <div>
                <Label htmlFor="endClientRecruiterLinkedIn">
                  End Client Recruiter LinkedIn
                </Label>
                <Input
                  id="endClientRecruiterLinkedIn"
                  value={newInterview.EndClientRecruiterLinkedIn || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "EndClientRecruiterLinkedIn",
                      e.target.value
                    )
                  }
                  disabled={isSubmitting || loading}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            {/* Review Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Review Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Date:</p>
                  <p className="font-medium">
                    {newInterview.InterviewDate
                      ? new Date(
                          newInterview.InterviewDate
                        ).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Time:</p>
                  <p className="font-medium">
                    {newInterview.InterviewStartTime &&
                    newInterview.InterviewEndTime
                      ? `${newInterview.InterviewStartTime} - ${newInterview.InterviewEndTime}`
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Type:</p>
                  <p className="font-medium">
                    {newInterview.InterviewType || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Method:</p>
                  <p className="font-medium">
                    {newInterview.InterviewMethod || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Recruiter:</p>
                  <p className="font-medium">
                    {newInterview.EndClientRecruiterName || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status:</p>
                  <p className="font-medium">
                    {newInterview.InterviewStatus || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={newInterview.Comments || ""}
                onChange={(e) => handleInputChange("Comments", e.target.value)}
                placeholder="Enter any additional comments"
                rows={3}
                disabled={isSubmitting || loading}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleAddSubmit = () => {
    if (isSubmitting || loading) return;

    validateAndSubmit("AddNew", (chainId, outcome, newInterview) => {
      const targetId = selectedInterview?.InterviewChainID
        ? selectedInterview.InterviewChainID.toString()
        : chainId;
      console.log("Submitting new interview with parent ID:", targetId);
      onSubmit(targetId, "AddNew", newInterview);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isSubmitting || loading ? undefined : onClose}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-2xl font-bold text-[#682A53]">
            Add New Interview
          </DialogTitle>
        </DialogHeader>

        {/* Header Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {chain.clientName} - {chain.position}
          </h3>
          {selectedInterview && (
            <p className="text-sm text-gray-600">
              Adding new interview after{" "}
              {selectedInterview.InterviewType || "previous"} interview
              {selectedInterview.InterviewDate
                ? ` scheduled on ${new Date(
                    selectedInterview.InterviewDate
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}`
                : ""}
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? "bg-[#682A53] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-900">
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      currentStep > step.id ? "bg-[#682A53]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting || loading}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!validateCurrentStep() || isSubmitting || loading}
                className="bg-[#682A53] hover:bg-[#682A53]/90 text-white flex items-center justify-center min-w-[80px]"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleAddSubmit}
                disabled={!validateCurrentStep() || isSubmitting || loading}
                className="bg-[#682A53] hover:bg-[#682A53]/90 text-white min-w-[160px]"
              >
                <span>
                  {isSubmitting || loading
                    ? "Adding Interview..."
                    : "Add Interview"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
