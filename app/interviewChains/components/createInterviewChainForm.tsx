"use client";

import React, { useState, useEffect, useRef } from "react";
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
  interviewSupports: ["Yes", "No"],
};

interface CreateInterviewChainFormProps {
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
  isSubmitting?: boolean;
}

type Step = 1 | 2 | 3 | 4;

export default function CreateInterviewChainForm({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateInterviewChainFormProps) {
  const dummyChain: InterviewChain = {
    id: "new",
    endClientName: "",
    endClientRecruiterName: null,
    endClientRecruiterEmail: null,
    endClientRecruiterPhone: null,
    endClientRecruiterLinkedIn: null,
    clientName: "",
    recruiterName: "",
    position: "",
    status: "Active",
    interviews: [],
    rounds: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    latestInterview: null,
    latestInterviewDate: null,
    latestInterviewStatus: null,
    latestInterviewType: null,
  };

  const {
    newInterview,
    errors,
    setErrors,
    recruiters,
    clients,
    loading,
    handleInputChange,
    handleAutocompleteChange,
    validateAndSubmit,
  } = useInterviewForm(dummyChain, false, undefined);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const prevOpenRef = useRef(open);

  const steps = [
    { id: 1, title: "Basic Info", description: "Recruiter & Client" },
    { id: 2, title: "Interview Details", description: "Schedule & Type" },
    { id: 3, title: "End Client Info", description: "Contact Details" },
    { id: 4, title: "Review & Submit", description: "Final Check" },
  ];

  useEffect(() => {
    if (open && !prevOpenRef.current && !isFormInitialized) {
      // Reset form fields
      handleInputChange("clientName", "");
      handleInputChange("recruiterName", "");
      handleInputChange("position", "");
      handleInputChange("ChainStatus", "Active");
      handleInputChange("InterviewStatus", "Scheduled");
      handleInputChange("InterviewOutcome", "");
      handleInputChange("RecruiterID", null);
      handleInputChange("ClientID", null);
      handleInputChange("EndClientName", "");
      handleInputChange("EndClientRecruiterName", "");
      handleInputChange("EndClientRecruiterEmail", "");
      handleInputChange("EndClientRecruiterPhone", "");
      handleInputChange("EndClientRecruiterLinkedIn", "");
      handleInputChange("InterviewDate", "");
      handleInputChange("InterviewStartTime", "");
      handleInputChange("InterviewEndTime", "");
      handleInputChange("InterviewMethod", "");
      handleInputChange("InterviewType", "");
      handleInputChange("InterviewSupport", "");
      handleInputChange("Comments", "");
      handleInputChange("JobBoardName", "");
      handleInputChange("JobBoardUrl", "");

      // Reset validation errors
      setErrors({
        InterviewMethod: false,
        InterviewType: false,
        InterviewDate: false,
        InterviewStartTime: false,
        InterviewEndTime: false,
        ClientID: false,
        RecruiterID: false,
        position: false,
        chainStatus: false,
        interviewStatus: false,
        EndClientName: false,
        EndClientRecruiterName: false,
        EndClientRecruiterEmail: false,
        EndClientRecruiterPhone: false,
        EndClientRecruiterLinkedIn: false,
        JobBoardName: false,
        JobBoardUrl: false,
      });

      setCurrentStep(1);
      setIsFormInitialized(true);
    }
    if (!open && prevOpenRef.current) {
      setIsFormInitialized(false);
      setCurrentStep(1);
      // Reset validation errors when closing
      setErrors({
        InterviewMethod: false,
        InterviewType: false,
        InterviewDate: false,
        InterviewStartTime: false,
        InterviewEndTime: false,
        ClientID: false,
        RecruiterID: false,
        position: false,
        chainStatus: false,
        interviewStatus: false,
        EndClientName: false,
        EndClientRecruiterName: false,
        EndClientRecruiterEmail: false,
        EndClientRecruiterPhone: false,
        EndClientRecruiterLinkedIn: false,
        JobBoardName: false,
        JobBoardUrl: false,
      });
    }
    prevOpenRef.current = open;
  }, [open, isFormInitialized, handleInputChange, setErrors]);

  const handleCreateSubmit = () => {
    if (isSubmitting || loading) return;

    validateAndSubmit("AddNew", (chainId, outcome, newInterview) => {
      onSubmit(chainId, "AddNew", newInterview);
    });
  };

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
          newInterview.RecruiterID &&
          newInterview.ClientID &&
          newInterview.position
        );
      case 2:
        return !!(
          newInterview.InterviewDate &&
          newInterview.InterviewStartTime &&
          newInterview.InterviewEndTime &&
          newInterview.InterviewType &&
          newInterview.InterviewMethod
        );
      case 3:
        return !!(
          newInterview.EndClientName &&
          newInterview.EndClientRecruiterName &&
          newInterview.EndClientRecruiterEmail &&
          newInterview.JobBoardName &&
          newInterview.JobBoardUrl
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
          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Basic Information
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Select the recruiter, client, and technology for this interview
                chain.
              </p>
            </div>

            {/* Recruiter Name */}
            <div className="field-container">
              <Label htmlFor="recruiterId" className="text-sm font-medium text-gray-700">Recruiter Name *</Label>
              <Select
                value={newInterview.RecruiterID?.toString() || ""}
                onValueChange={(value) =>
                  handleAutocompleteChange("RecruiterID", value)
                }
                disabled={isSubmitting || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Recruiter" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {recruiters.map((recruiter) => (
                    <SelectItem
                      key={recruiter.employeeID}
                      value={recruiter.employeeID.toString()}
                    >
                      {`${recruiter.firstName} ${recruiter.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.RecruiterID && (
                <p className="text-sm text-red-500 mt-1">
                  Recruiter is required
                </p>
              )}
            </div>

            {/* Client Name */}
            <div className="field-container">
              <Label htmlFor="clientId" className="text-sm font-medium text-gray-700">Client Name *</Label>
              <Select
                value={newInterview.ClientID?.toString() || ""}
                onValueChange={(value) =>
                  handleAutocompleteChange("ClientID", value)
                }
                disabled={isSubmitting || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {clients.map((client) => (
                    <SelectItem
                      key={client.clientID}
                      value={client.clientID.toString()}
                    >
                      {client.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ClientID && (
                <p className="text-sm text-red-500 mt-1">Client is required</p>
              )}
            </div>

            {/* Technology */}
            <div className="field-container">
              <Label htmlFor="position" className="text-sm font-medium text-gray-700">Technology *</Label>
              <Input
                id="position"
                value={newInterview.position || ""}
                onChange={(e) => handleInputChange("position", e.target.value)}
                placeholder="Enter technology/position"
                disabled={isSubmitting || loading}
              />
              {errors.position && (
                <p className="text-sm text-red-500 mt-1">
                  Technology is required
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Interview Details
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Schedule the interview and select the type and method.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interview Date */}
              <div className="field-container">
                <Label htmlFor="interviewDate" className="text-sm font-medium text-gray-700">Interview Date *</Label>
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
                  <p className="text-sm text-red-500 mt-1">Date is required</p>
                )}
              </div>

              {/* Interview Type */}
              <div className="field-container">
                <Label htmlFor="interviewType" className="text-sm font-medium text-gray-700">Interview Type *</Label>
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
                  <p className="text-sm text-red-500 mt-1">
                    Interview Type is required
                  </p>
                )}
              </div>

              {/* Start Time */}
              <div className="field-container">
                <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">Start Time *</Label>
                <TimePicker
                  id="startTime"
                  value={newInterview.InterviewStartTime || ""}
                  onChange={(value) =>
                    handleInputChange("InterviewStartTime", value)
                  }
                  disabled={isSubmitting || loading}
                />
                {errors.InterviewStartTime && (
                  <p className="text-sm text-red-500 mt-1">
                    Start time is required
                  </p>
                )}
              </div>

              {/* End Time */}
              <div className="field-container">
                <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">End Time *</Label>
                <TimePicker
                  id="endTime"
                  value={newInterview.InterviewEndTime || ""}
                  onChange={(value) =>
                    handleInputChange("InterviewEndTime", value)
                  }
                  disabled={isSubmitting || loading}
                />
                {errors.InterviewEndTime && (
                  <p className="text-sm text-red-500 mt-1">
                    End time is required
                  </p>
                )}
              </div>
            </div>

            {/* Interview Method */}
            <div className="field-container">
              <Label htmlFor="interviewMethod" className="text-sm font-medium text-gray-700">Interview Method *</Label>
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
                <p className="text-sm text-red-500 mt-1">
                  Interview Method is required
                </p>
              )}
            </div>

            {/* Interview Support */}
            <div className="field-container">
              <Label htmlFor="interviewSupport" className="text-sm font-medium text-gray-700">Support</Label>
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
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                End Client Information
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Provide the end client and recruiter contact details.
              </p>
            </div>

            {/* End Client Name */}
            <div className="field-container">
              <Label htmlFor="endClientName" className="text-sm font-medium text-gray-700">End Client Name *</Label>
              <Input
                id="endClientName"
                value={newInterview.EndClientName || ""}
                onChange={(e) =>
                  handleInputChange("EndClientName", e.target.value)
                }
                placeholder="Enter end client name"
                disabled={isSubmitting || loading}
              />
              {errors.EndClientName && (
                <p className="text-sm text-red-500 mt-1">
                  End Client Name is required
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* End Client Recruiter Name */}
              <div className="field-container">
                <Label htmlFor="endClientRecruiterName" className="text-sm font-medium text-gray-700">
                  End Client Recruiter Name *
                </Label>
                <Input
                  id="endClientRecruiterName"
                  value={newInterview.EndClientRecruiterName || ""}
                  onChange={(e) =>
                    handleInputChange("EndClientRecruiterName", e.target.value)
                  }
                  placeholder="Enter recruiter name"
                  disabled={isSubmitting || loading}
                />
                {errors.EndClientRecruiterName && (
                  <p className="text-sm text-red-500 mt-1">
                    Recruiter Name is required
                  </p>
                )}
              </div>

              {/* End Client Recruiter Email */}
              <div className="field-container">
                <Label htmlFor="endClientRecruiterEmail" className="text-sm font-medium text-gray-700">
                  End Client Recruiter Email *
                </Label>
                <Input
                  id="endClientRecruiterEmail"
                  type="email"
                  value={newInterview.EndClientRecruiterEmail || ""}
                  onChange={(e) =>
                    handleInputChange("EndClientRecruiterEmail", e.target.value)
                  }
                  placeholder="Enter email address"
                  disabled={isSubmitting || loading}
                />
                {errors.EndClientRecruiterEmail && (
                  <p className="text-sm text-red-500 mt-1">
                    Valid email is required
                  </p>
                )}
              </div>

              {/* End Client Recruiter Phone */}
              <div className="field-container">
                <Label htmlFor="endClientRecruiterPhone" className="text-sm font-medium text-gray-700">
                  End Client Recruiter Phone
                </Label>
                <Input
                  id="endClientRecruiterPhone"
                  value={newInterview.EndClientRecruiterPhone || ""}
                  onChange={(e) =>
                    handleInputChange("EndClientRecruiterPhone", e.target.value)
                  }
                  placeholder="Enter phone number"
                  disabled={isSubmitting || loading}
                />
                {errors.EndClientRecruiterPhone && (
                  <p className="text-sm text-red-500 mt-1">
                    Phone number is required
                  </p>
                )}
              </div>

              {/* End Client Recruiter LinkedIn */}
              <div className="field-container">
                <Label htmlFor="endClientRecruiterLinkedIn" className="text-sm font-medium text-gray-700">
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
                  placeholder="Enter LinkedIn URL"
                  disabled={isSubmitting || loading}
                />
                {errors.EndClientRecruiterLinkedIn && (
                  <p className="text-sm text-red-500 mt-1">
                    LinkedIn URL is required
                  </p>
                )}
              </div>
            </div>

            {/* Job Board Name and URL - Same Line */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Board Name */}
              <div className="field-container">
                <Label htmlFor="jobBoardName" className="text-sm font-medium text-gray-700">Job Board Name *</Label>
                <Input
                  id="jobBoardName"
                  value={newInterview.JobBoardName || ""}
                  onChange={(e) =>
                    handleInputChange("JobBoardName", e.target.value)
                  }
                  placeholder="Enter job board name"
                  disabled={isSubmitting || loading}
                />
                {errors.JobBoardName && (
                  <p className="text-sm text-red-500 mt-1">
                    Job Board Name is required
                  </p>
                )}
              </div>

              {/* Job Board URL */}
              <div className="field-container">
                <Label htmlFor="jobBoardUrl" className="text-sm font-medium text-gray-700">Job Board URL *</Label>
                <Input
                  id="jobBoardUrl"
                  type="url"
                  value={newInterview.JobBoardUrl || ""}
                  onChange={(e) =>
                    handleInputChange("JobBoardUrl", e.target.value)
                  }
                  placeholder="https://example.com/job-posting"
                  disabled={isSubmitting || loading}
                />
                {errors.JobBoardUrl && (
                  <p className="text-sm text-red-500 mt-1">
                    Job Board URL is required
                  </p>
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="field-container">
              <Label htmlFor="comments" className="text-sm font-medium text-gray-700">Comments</Label>
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

      case 4:
        return (
          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Review & Submit
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Please review all the information before creating the interview
                chain.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Basic Info Review */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Recruiter:</span>
                    <span className="ml-2 font-medium">
                      {
                        recruiters.find(
                          (r) =>
                            r.employeeID.toString() ===
                            newInterview.RecruiterID?.toString()
                        )?.firstName
                      }{" "}
                      {
                        recruiters.find(
                          (r) =>
                            r.employeeID.toString() ===
                            newInterview.RecruiterID?.toString()
                        )?.lastName
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <span className="ml-2 font-medium">
                      {
                        clients.find(
                          (c) =>
                            c.clientID.toString() ===
                            newInterview.ClientID?.toString()
                        )?.clientName
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Technology:</span>
                    <span className="ml-2 font-medium">
                      {newInterview.position}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interview Details Review */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Interview Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">
                      {newInterview.InterviewDate
                        ? new Date(
                            newInterview.InterviewDate + "T12:00:00"
                          ).toLocaleDateString()
                        : "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <span className="ml-2 font-medium">
                      {newInterview.InterviewStartTime} -{" "}
                      {newInterview.InterviewEndTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">
                      {newInterview.InterviewType}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Method:</span>
                    <span className="ml-2 font-medium">
                      {newInterview.InterviewMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* End Client Review */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  End Client Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">End Client:</span>
                    <span className="ml-2 font-medium">
                      {newInterview.EndClientName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Recruiter:</span>
                    <span className="ml-2 font-medium">
                      {newInterview.EndClientRecruiterName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">
                      {newInterview.EndClientRecruiterEmail}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">
                      {newInterview.EndClientRecruiterPhone || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Job Board:</span>
                    <span className="ml-2 font-medium">
                      {newInterview.JobBoardName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Job URL:</span>
                    <span className="ml-2 font-medium text-blue-600 truncate">
                      {newInterview.JobBoardUrl}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comments Review */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Comments</h4>
                <p className="text-sm text-gray-700">
                  {newInterview.Comments || "No comments added"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isSubmitting || loading ? undefined : onClose}
    >
      <DialogContent className="max-w-full sm:max-w-2xl lg:max-w-4xl max-h-[90vh] mx-2 sm:mx-4 lg:mx-auto overflow-y-auto client-form p-4 sm:p-6">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-[#682A53]">
            Create New Interview Chain
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-4">
          <div className="flex items-start">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 ${
                      currentStep >= step.id
                        ? "bg-[#682A53] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-1 sm:mt-2 text-center px-1">
                    <div className="text-[10px] sm:text-xs font-medium text-gray-900 whitespace-nowrap">
                      {step.title}
                    </div>
                    <div className="hidden sm:block text-[10px] text-gray-500 whitespace-nowrap">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 self-start mt-4 sm:mt-5 ${
                      currentStep > step.id ? "bg-[#682A53]" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] sm:min-h-[350px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting || loading}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>

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
                onClick={handleCreateSubmit}
                disabled={!validateCurrentStep() || isSubmitting || loading}
                className="bg-[#682A53] hover:bg-[#682A53]/90 text-white min-w-[160px]"
              >
                <span>
                  {isSubmitting || loading
                    ? "Creating Interview Chain..."
                    : "Create Interview Chain"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
