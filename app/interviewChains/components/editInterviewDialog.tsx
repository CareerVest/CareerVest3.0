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
import { TimePicker } from "../../../components/ui/time-picker";
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
  interviewStatuses: [
    "Scheduled",
    "Pending Confirmation",
    "Rescheduled",
    "Candidate No Show",
    "Client No Show",
    "Postponed",
    "Completed",
    "Cancelled",
    "Other",
  ],
  interviewOutcomes: [
    "Next",
    "Offer",
    "Rejected",
    "Pending Update",
    "Withdrawn",
    "No Decision",
  ],
  interviewSupports: ["Yes", "No"],
};

const convert12HourTo24HourLocal = (
  time: string | null | undefined
): string => {
  if (!time || typeof time !== "string" || time.trim() === "") return "";
  const [timePart, period] = time.split(" ");
  if (!timePart || !period) return time || "";
  const [hoursStr, minutesStr] = timePart.split(":");
  let hours = Number(hoursStr);
  let minutes = Number(minutesStr);

  if (isNaN(hours) || isNaN(minutes)) return time || "";

  const periodUpper = period.toUpperCase();
  if (periodUpper === "PM" && hours !== 12) {
    hours += 12;
  } else if (periodUpper === "AM" && hours === 12) {
    hours = 0;
  }

  const date = new Date();
  date.setHours(hours, minutes);
  const localHours = date.getHours();
  const localMinutes = date.getMinutes();
  return `${localHours.toString().padStart(2, "0")}:${localMinutes
    .toString()
    .padStart(2, "0")}`;
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

interface EditInterviewDialogProps {
  chain: InterviewChain;
  open: boolean;
  onClose: () => void;
  onSubmit: (
    chainId: string,
    outcome: "Edit",
    newInterview?: Partial<Interview> & {
      clientName?: string;
      position?: string;
      recruiterName?: string;
    }
  ) => void;
  interviewToEdit: Interview;
  isSubmitting?: boolean;
}

export default function EditInterviewDialog({
  chain,
  open,
  onClose,
  onSubmit,
  interviewToEdit,
  isSubmitting = false,
}: EditInterviewDialogProps) {
  const {
    newInterview,
    setNewInterview,
    errors,
    loading,
    handleInputChange,
    validateAndSubmit,
  } = useInterviewForm(chain, true, interviewToEdit);

  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);

  useEffect(() => {
    if (open && !isFormInitialized && interviewToEdit) {
      console.log(
        "EditInterviewDialog: Initializing with interviewToEdit:",
        interviewToEdit
      );

      setNewInterview({
        InterviewChainID: interviewToEdit.InterviewChainID,
        ParentInterviewChainID: interviewToEdit.ParentInterviewChainID ?? null,
        EndClientName:
          interviewToEdit.EndClientName || chain.endClientName || "",
        EndClientRecruiterName:
          interviewToEdit.EndClientRecruiterName ||
          chain.endClientRecruiterName ||
          "",
        EndClientRecruiterEmail:
          interviewToEdit.EndClientRecruiterEmail ||
          chain.endClientRecruiterEmail ||
          "",
        EndClientRecruiterPhone:
          interviewToEdit.EndClientRecruiterPhone ||
          chain.endClientRecruiterPhone ||
          "",
        EndClientRecruiterLinkedIn:
          interviewToEdit.EndClientRecruiterLinkedIn ||
          chain.endClientRecruiterLinkedIn ||
          "",
        Position: interviewToEdit.Position || chain.position || "",
        ChainStatus: interviewToEdit.ChainStatus || chain.status || "Active",
        InterviewDate: interviewToEdit.InterviewDate
          ? new Date(interviewToEdit.InterviewDate)
          : null,
        InterviewStartTime: convert12HourTo24HourLocal(
          interviewToEdit.InterviewStartTime
        ),
        InterviewEndTime: convert12HourTo24HourLocal(
          interviewToEdit.InterviewEndTime
        ),
        InterviewMethod: interviewToEdit.InterviewMethod || "",
        InterviewType: interviewToEdit.InterviewType || "",
        InterviewStatus: interviewToEdit.InterviewStatus || "Scheduled",
        InterviewOutcome: interviewToEdit.InterviewOutcome || "",
        InterviewSupport: interviewToEdit.InterviewSupport || "",
        Comments: interviewToEdit.Comments || "",
        RecruiterID: interviewToEdit.RecruiterID || null,
        ClientID: null,
        clientName: chain.clientName || "",
        position: chain.position || "",
        recruiterName: chain.recruiterName || "",
        JobBoardName: interviewToEdit.JobBoardName || chain.jobBoardName || "",
        JobBoardUrl: interviewToEdit.JobBoardUrl || chain.jobBoardUrl || "",
      });
      console.log(
        "EditInterviewDialog: State after setNewInterview:",
        newInterview
      );
      setIsFormInitialized(true);
      setCurrentStep(1);
    }
    if (!open) {
      setIsFormInitialized(false);
    }
  }, [open, interviewToEdit, chain, setNewInterview, isFormInitialized]);

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
        return !!(
          newInterview.InterviewDate && newInterview.InterviewStartTime
        );
      case 2:
        return !!(newInterview.InterviewMethod && newInterview.InterviewType);
      case 3:
        return !!(
          newInterview.EndClientRecruiterName &&
          newInterview.EndClientRecruiterEmail
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

              {/* Technology */}
              <div>
                <Label htmlFor="position">Technology</Label>
                <Input
                  id="position"
                  value={newInterview.Position || ""}
                  onChange={(e) =>
                    handleInputChange("Position", e.target.value)
                  }
                  disabled={isSubmitting || loading}
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
                    <Label htmlFor="interviewType">Interview Type</Label>
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
                  </div>
                </div>
              </div>

              {/* Start Time and End Time in one line */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <TimePicker
                      id="startTime"
                      value={newInterview.InterviewStartTime || ""}
                      onChange={(value) =>
                        handleInputChange("InterviewStartTime", value)
                      }
                      disabled={isSubmitting || loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <TimePicker
                      id="endTime"
                      value={newInterview.InterviewEndTime || ""}
                      onChange={(value) =>
                        handleInputChange("InterviewEndTime", value)
                      }
                      disabled={isSubmitting || loading}
                    />
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

              {/* Interview Status */}
              <div>
                <Label htmlFor="interviewStatus">Interview Status</Label>
                <Select
                  value={newInterview.InterviewStatus || "Scheduled"}
                  onValueChange={(value) =>
                    handleInputChange("InterviewStatus", value)
                  }
                  disabled={isSubmitting || loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewDropdowns.interviewStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Interview Outcome */}
              <div>
                <Label htmlFor="interviewOutcome">Interview Outcome</Label>
                <Select
                  value={newInterview.InterviewOutcome || ""}
                  onValueChange={(value) =>
                    handleInputChange("InterviewOutcome", value)
                  }
                  disabled={isSubmitting || loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewDropdowns.interviewOutcomes.map((outcome) => (
                      <SelectItem key={outcome} value={outcome}>
                        {outcome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {/* End Client Name - Read Only */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Date:</p>
                  <p className="font-medium">
                    {newInterview.InterviewDate
                      ? new Date(
                          newInterview.InterviewDate + "T12:00:00"
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
                  <p className="text-gray-600">Status:</p>
                  <p className="font-medium">
                    {newInterview.InterviewStatus || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Outcome:</p>
                  <p className="font-medium">
                    {newInterview.InterviewOutcome || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Technology:</p>
                  <p className="font-medium">
                    {newInterview.Position || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Support:</p>
                  <p className="font-medium">
                    {newInterview.InterviewSupport || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Recruiter:</p>
                  <p className="font-medium">
                    {newInterview.EndClientRecruiterName || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Recruiter Email:</p>
                  <p className="font-medium">
                    {newInterview.EndClientRecruiterEmail || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Recruiter Phone:</p>
                  <p className="font-medium">
                    {newInterview.EndClientRecruiterPhone || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Recruiter LinkedIn:</p>
                  <p className="font-medium">
                    {newInterview.EndClientRecruiterLinkedIn || "Not set"}
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

            {/* Job Board Name */}
            <div>
              <Label htmlFor="jobBoardName">Job Board Name</Label>
              <Input
                id="jobBoardName"
                value={newInterview.JobBoardName || ""}
                onChange={(e) => handleInputChange("JobBoardName", e.target.value)}
                placeholder="Enter job board name"
                disabled={isSubmitting || loading}
              />
            </div>

            {/* Job Board URL */}
            <div>
              <Label htmlFor="jobBoardUrl">Job Board URL</Label>
              <Input
                id="jobBoardUrl"
                type="url"
                value={newInterview.JobBoardUrl || ""}
                onChange={(e) => handleInputChange("JobBoardUrl", e.target.value)}
                placeholder="https://example.com/job-posting"
                disabled={isSubmitting || loading}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleEditSubmit = () => {
    if (isSubmitting || loading) return;

    validateAndSubmit("Edit", (chainId, outcome, newInterview) => {
      onSubmit(chainId, "Edit", newInterview);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isSubmitting || loading ? undefined : onClose}
    >
      <DialogContent className="max-w-full sm:max-w-2xl lg:max-w-4xl max-h-[95vh] mx-2 sm:mx-4 lg:mx-auto overflow-y-auto client-form">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-2xl font-bold text-[#682A53]">
            Edit Interview
          </DialogTitle>
        </DialogHeader>

        {/* Header Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {chain.clientName} - {chain.position}
          </h3>
          <p className="text-sm text-gray-600">
            Editing {interviewToEdit.Position || interviewToEdit.InterviewType}{" "}
            interview scheduled for{" "}
            {interviewToEdit.InterviewDate
              ? new Date(interviewToEdit.InterviewDate + "T12:00:00").toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }
                )
              : "N/A"}
          </p>
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
                onClick={handleEditSubmit}
                disabled={!validateCurrentStep() || isSubmitting || loading}
                className="bg-[#682A53] hover:bg-[#682A53]/90 text-white min-w-[160px]"
              >
                <span>
                  {isSubmitting || loading
                    ? "Saving Changes..."
                    : "Save Changes"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
