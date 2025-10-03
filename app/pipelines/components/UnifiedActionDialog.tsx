"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApiWithLoading } from "@/lib/apiWithLoading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Upload,
  X,
  AlertTriangle,
  CheckCircle,
  Star,
  Zap,
  Leaf,
  Circle,
} from "lucide-react";
import {
  getActionRules,
  executePipelineAction,
  fetchRecruiters,
} from "../actions/pipelineActions";
import { showActionSuccess, showActionError, showRetryableError } from "@/lib/toastUtils";

interface UnifiedActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  actionType: string;
  currentStage: string;
  onSuccess: (result?: any) => void;
}

interface ActionRule {
  requiresComment: boolean;
  requiresDocuments: boolean;
  requiredDocumentTypes: string[];
  canChangeStage: boolean;
  targetStage?: string;
  requiresPriority: boolean;
  requiresAssignment: boolean;
  validationRules: Record<string, any>;
  allowedRoles: string[];
  restrictedRoles: string[];
}

interface FormData {
  notes: string;
  priority?: string;
  assignedToID?: number;
  mainFile?: File;
  additionalFiles: File[];
  additionalFileLabels: string[];
}

interface Recruiter {
  id: number;
  name: string;
  role: string;
}

export function UnifiedActionDialog({
  isOpen,
  onClose,
  clientId,
  actionType,
  currentStage,
  onSuccess,
}: UnifiedActionDialogProps) {
  const { apiCall } = useApiWithLoading();
  const priorityOptions = [
    {
      value: "exceptional",
      label: "Exceptional Candidate",
      description: "Top-tier talent with exceptional skills/experience",
      icon: Star,
      badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    {
      value: "real-time",
      label: "Real-Time Experience",
      description: "Candidates with current, relevant experience",
      icon: Zap,
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      value: "fresher",
      label: "Fresher",
      description: "New graduates or entry-level candidates",
      icon: Leaf,
      badgeColor: "bg-green-100 text-green-800 border-green-200",
    },
    {
      value: "standard",
      label: "Standard",
      description: "Regular candidates with standard qualifications",
      icon: Circle,
      badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
    },
  ];
  const [rules, setRules] = useState<ActionRule | null>(null);
  const [formData, setFormData] = useState<FormData>({
    notes: "",
    additionalFiles: [],
    additionalFileLabels: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);

  const hasLoadedRef = useRef(false);

  // Load action rules when dialog opens
  useEffect(() => {
    if (isOpen && actionType && currentStage && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadActionRules();
    }
  }, [isOpen, actionType, currentStage]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const loadActionRules = async () => {
    setIsLoading(true);
    setErrors([]);
    try {
      const actionRules = await apiCall(
        getActionRules(actionType, currentStage),
        { showLoading: true }
      );
      setRules(actionRules);

      // Pre-fill any default values
      if (actionRules.targetStage) {
        console.log(
          `ℹ️ Action ${actionType} will transition to ${actionRules.targetStage}`
        );
      }

      // Load recruiters if this action requires assignment
      if (actionRules.requiresAssignment || actionType === "AssignRecruiter") {
        await loadRecruiters();
      }
    } catch (error: any) {
      console.error("Failed to load action rules:", error);
      setErrors(["Failed to load action rules. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecruiters = async () => {
    setLoadingRecruiters(true);
    try {
      console.log("🔍 Loading recruiters for assignment...");
      const recruiterData = await apiCall(fetchRecruiters(), {
        showLoading: true,
      });

      // Filter to only show recruiters (not sales people or admins)
      const filteredRecruiters = recruiterData.filter(
        (emp) =>
          emp.role &&
          (emp.role.toLowerCase().includes("recruiter") ||
            emp.role.toLowerCase() === "marketing_manager" ||
            emp.role.toLowerCase() === "admin")
      );

      setRecruiters(filteredRecruiters);
      console.log("✅ Loaded recruiters:", filteredRecruiters);
    } catch (error: any) {
      console.error("Failed to load recruiters:", error);
      setErrors((prev) => [
        ...prev,
        "Failed to load recruiters. Please try again.",
      ]);
    } finally {
      setLoadingRecruiters(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!rules) {
      newErrors.push("Rules not loaded");
      setErrors(newErrors);
      return false;
    }

    // Check required comment
    if (rules.requiresComment && !formData.notes.trim()) {
      newErrors.push("Comment is required for this action");
    }

    // Check required documents
    if (
      rules.requiresDocuments &&
      !formData.mainFile &&
      formData.additionalFiles.length === 0
    ) {
      newErrors.push("At least one document is required for this action");
    }

    // Check required document types
    if (rules.requiredDocumentTypes.length > 0) {
      const missingTypes = rules.requiredDocumentTypes.filter((type) => {
        return !formData.additionalFileLabels.includes(type);
      });
      if (missingTypes.length > 0) {
        newErrors.push(
          `Missing required document types: ${missingTypes.join(", ")}`
        );
      }
    }

    // Check required priority
    if (rules.requiresPriority && !formData.priority) {
      newErrors.push("Priority is required for this action");
    }

    // Check required assignment
    if (rules.requiresAssignment && !formData.assignedToID) {
      newErrors.push("Assignment is required for this action");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Note: Removed frontend restriction for special states (backed-out, on-hold, placed)
    // The backend rules service now properly handles moves FROM these states
    // Let the backend determine what actions are allowed based on user role and rules

    setIsSubmitting(true);
    setErrors([]);
    setWarnings([]);

    try {
      const result = await apiCall(
        executePipelineAction({
          clientID: clientId,
          actionType: actionType,
          notes: formData.notes,
          priority: formData.priority,
          assignedToID: formData.assignedToID,
          mainFile: formData.mainFile,
          additionalFiles: formData.additionalFiles,
          additionalFileLabels: formData.additionalFileLabels,
        })
      );

      if (result.success) {
        console.log("✅ Action completed successfully:", result);

        // Show success toast notification
        showActionSuccess(
          actionType,
          undefined, // Could pass client name if available
          result.stageTransitioned,
          result.newStage
        );

        // Show warnings as info toasts if any
        if (result.warnings && result.warnings.length > 0) {
          setWarnings(result.warnings);
          result.warnings.forEach((warning: string) => {
            // Using info toast for warnings to not alarm the user
            setTimeout(() => {
              showActionError(actionType, [warning]);
            }, 500);
          });
        }

        // Check if the backend performed a stage transition
        if (result.stageTransitioned && result.newStage) {
          console.log(
            `🚀 Backend transitioned client from ${currentStage} to ${result.newStage}`
          );
        }

        // Close dialog and notify parent immediately for better UX
        onSuccess(result); // Pass the result to parent so it can handle stage changes
        onClose();
        resetForm();
        setIsSubmitting(false);
      } else {
        // Backend returned success: false with errors
        const errorMessages = result.errors || ["Action failed"];
        setErrors(errorMessages);
        showActionError(actionType, errorMessages);
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("Failed to execute action:", error);

      // Determine error type for better UX
      const errorMessage = error.message || "Failed to execute action";
      const isNetworkError =
        error.message?.toLowerCase().includes("network") ||
        error.message?.toLowerCase().includes("fetch") ||
        error.code === "ECONNABORTED";

      setErrors([errorMessage]);

      // Show retryable error for network issues
      if (isNetworkError) {
        showRetryableError("Network error occurred. Please check your connection.", () => {
          setIsSubmitting(false);
          handleSubmit(); // Retry the action
        });
      } else {
        showActionError(actionType, [errorMessage]);
      }

      setIsSubmitting(false); // Only reset on error
    }
  };

  const resetForm = () => {
    setFormData({
      notes: "",
      additionalFiles: [],
      additionalFileLabels: [],
    });
    setErrors([]);
    setWarnings([]);
    setRules(null);
    setRecruiters([]);
    setLoadingRecruiters(false);
    hasLoadedRef.current = false; // Reset the loading ref for next time dialog opens
  };

  const addFile = (file: File, label: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalFiles: [...prev.additionalFiles, file],
      additionalFileLabels: [...prev.additionalFileLabels, label],
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalFiles: prev.additionalFiles.filter((_, i) => i !== index),
      additionalFileLabels: prev.additionalFileLabels.filter(
        (_, i) => i !== index
      ),
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{actionType}</DialogTitle>
          <DialogDescription>
            Complete the {actionType} action for this client.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading action requirements...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Error Messages */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Warning Messages */}
            {warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {isSubmitting && errors.length === 0 && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  Action completed successfully!
                  {rules?.targetStage &&
                    ` Client will be automatically moved to ${rules.targetStage}.`}
                </AlertDescription>
              </Alert>
            )}

            {rules && (
              <>
                {/* Priority Selection */}
                {rules.requiresPriority && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium mb-1 block">
                      Select Priority Category{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {priorityOptions.map((option) => {
                        const IconCmp = option.icon;
                        const isSelected = formData.priority === option.value;
                        return (
                          <div
                            key={option.value}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                              isSelected
                                ? "border-[#682A53] bg-[#682A53]/5 shadow-lg"
                                : "border-gray-200 hover:border-[#682A53]/30"
                            }`}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                priority: option.value,
                              }))
                            }
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`p-2 rounded-full ${option.badgeColor}`}
                              >
                                <IconCmp className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-semibold text-gray-900">
                                    {option.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recruiter Assignment */}
                {rules.requiresAssignment && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium mb-1 block">
                      Select Recruiter <span className="text-red-500">*</span>
                    </Label>
                    {loadingRecruiters ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-gray-600">
                          Loading recruiters...
                        </span>
                      </div>
                    ) : (
                      <Select
                        value={formData.assignedToID?.toString() || ""}
                        onValueChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            assignedToID: value ? parseInt(value) : undefined,
                          }));
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a recruiter to assign..." />
                        </SelectTrigger>
                        <SelectContent>
                          {recruiters.map((recruiter) => (
                            <SelectItem
                              key={recruiter.id}
                              value={recruiter.id.toString()}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-medium">
                                  {recruiter.name}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                  {recruiter.role}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                          {recruiters.length === 0 && (
                            <SelectItem value="" disabled>
                              No recruiters available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    {formData.assignedToID && (
                      <p className="text-sm text-green-600">
                        Selected:{" "}
                        {
                          recruiters.find((r) => r.id === formData.assignedToID)
                            ?.name
                        }
                      </p>
                    )}
                  </div>
                )}

                {/* Required Document Types */}
                {rules.requiredDocumentTypes.length > 0 && (
                  <div className="space-y-4">
                    <Label>Required Documents</Label>
                    {rules.requiredDocumentTypes.map((docType, index) => {
                      const displayName = docType
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ");

                      return (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{displayName}</span>
                            {formData.additionalFileLabels.includes(
                              docType
                            ) && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Remove existing file of this type first
                                const existingIndex =
                                  formData.additionalFileLabels.indexOf(
                                    docType
                                  );
                                if (existingIndex >= 0) {
                                  removeFile(existingIndex);
                                }
                                addFile(file, docType);
                              }
                            }}
                            className="border-blue-300"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Comments/Notes - Moved to last before submit */}
                {(rules.requiresComment ||
                  actionType !== "AssignRecruiter") && (
                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      Notes{" "}
                      {rules.requiresComment && (
                        <span className="text-red-500">*</span>
                      )}
                      {rules.validationRules && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({rules.validationRules.minCommentLength || 0} -{" "}
                          {rules.validationRules.maxCommentLength || 500}{" "}
                          characters)
                        </span>
                      )}
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder={
                        rules.requiresComment
                          ? "Required comment for this action..."
                          : "Optional notes..."
                      }
                      value={formData.notes}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          notes: value,
                        }));
                      }}
                      className={`${
                        rules.requiresComment ? "border-blue-300" : ""
                      } ${
                        rules.validationRules &&
                        ((rules.validationRules.minCommentLength &&
                          formData.notes.length <
                            rules.validationRules.minCommentLength) ||
                          (rules.validationRules.maxCommentLength &&
                            formData.notes.length >
                              rules.validationRules.maxCommentLength))
                          ? "border-red-300"
                          : ""
                      }`}
                    />
                    {rules.validationRules && (
                      <div className="text-sm text-gray-500">
                        {formData.notes.length}/
                        {rules.validationRules.maxCommentLength || 500}{" "}
                        characters
                        {rules.validationRules.minCommentLength &&
                          formData.notes.length <
                            rules.validationRules.minCommentLength && (
                            <span className="text-red-500 ml-2">
                              (Minimum {rules.validationRules.minCommentLength}{" "}
                              characters required)
                            </span>
                          )}
                        {rules.validationRules.maxCommentLength &&
                          formData.notes.length >
                            rules.validationRules.maxCommentLength && (
                            <span className="text-red-500 ml-2">
                              (Maximum {rules.validationRules.maxCommentLength}{" "}
                              characters exceeded)
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting || !rules}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              (() => {
                const displayName = actionType
                  .split(/[-_]/)
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");
                return `Complete ${displayName}`;
              })()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
