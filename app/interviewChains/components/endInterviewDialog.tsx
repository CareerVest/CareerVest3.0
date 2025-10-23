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
import { X, Check, ThumbsUp, XCircle, Clock, RotateCcw } from "lucide-react";
import { endInterviewChain } from "../actions/interviewChainActions";
import type {
  Interview,
  InterviewChain,
  InterviewChainEnd,
} from "../../types/interviewChain/interviewChain";

interface EndInterviewDialogProps {
  chain: InterviewChain;
  open: boolean;
  onClose: () => void;
  onSubmit: (
    chainId: string,
    outcome:
      | "Next"
      | "Rejected"
      | "Offer"
      | "AddNew"
      | "Edit"
      | "Pending Update"
      | "Rescheduled",
    newInterview?: Partial<Interview> & {
      clientName?: string;
      position?: string;
      recruiterName?: string;
    }
  ) => void;
  onOpenAddInterview: () => void;
  selectedInterview?: Interview;
  isSubmitting?: boolean;
}

export default function EndInterviewDialog({
  chain,
  open,
  onClose,
  onSubmit,
  onOpenAddInterview,
  selectedInterview,
  isSubmitting = false,
}: EndInterviewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "Pending Update" | "Rejected" | "Offer" | "Rescheduled" | null
  >(null);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState(false);

  const rejectionReasons = [
    "No Visa Sponsorship",
    "Position Closed",
    "Candidate Poor Performance",
    "Selected Another Candidate",
    "Compensation Mismatch",
    "Location Constraint",
    "Culture Fit Concerns",
    "Scheduling/Availability Issues",
    "Client Withdrew",
    "Candidate Withdrew",
  ];

  const interviewToEnd =
    selectedInterview || chain.interviews[chain.interviews.length - 1];

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedAction(null);
      setComment("");
      setCommentError(false);
      setRejectionReason("");
      setRejectionError(false);
    }
  }, [open]);

  const handleActionSelect = (
    action: "Pending Update" | "Rejected" | "Offer" | "Rescheduled"
  ) => {
    setSelectedAction(action);
    setComment(""); // Reset comment when selecting a new action
    setCommentError(false); // Reset comment error
    setRejectionReason("");
    setRejectionError(false);
  };

  const handleEndSubmit = async (
    outcome: "Next" | "Pending Update" | "Rejected" | "Offer" | "Rescheduled"
  ) => {
    if (isSubmitting || loading) return;

    // For "Next", no comment is required
    if (outcome === "Next") {
      setLoading(true);
      try {
        onOpenAddInterview();
      } catch (error) {
        console.error("Failed to proceed to next round:", error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // For comment-required actions
    const requiresComment = outcome === "Pending Update" || outcome === "Offer";
    if (requiresComment && !comment.trim()) {
      setCommentError(true);
      return;
    }
    if (outcome === "Rejected" && !rejectionReason) {
      setRejectionError(true);
      return;
    }

    setLoading(true);
    try {
      const payload: InterviewChainEnd = {
        interviewChainID: interviewToEnd.InterviewChainID,
        interviewOutcome: outcome,
        interviewFeedback: null,
        comments:
          outcome === "Rejected"
            ? rejectionReason
            : requiresComment
            ? comment.trim()
            : null,
      };

      console.log("Ending interview with payload:", payload);
      await endInterviewChain(interviewToEnd.InterviewChainID, payload);
      onSubmit(interviewToEnd.InterviewChainID.toString(), outcome, {
        EndClientRecruiterName: interviewToEnd.EndClientRecruiterName,
        EndClientRecruiterEmail: interviewToEnd.EndClientRecruiterEmail,
        EndClientRecruiterPhone: interviewToEnd.EndClientRecruiterPhone,
        EndClientRecruiterLinkedIn: interviewToEnd.EndClientRecruiterLinkedIn,
      });
      setSelectedAction(null);
      setComment("");
      setCommentError(false);
      setRejectionReason("");
      setRejectionError(false);
      onClose();
    } catch (error) {
      console.error("Failed to end interview:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelComment = () => {
    setSelectedAction(null);
    setComment("");
    setCommentError(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isSubmitting || loading ? undefined : onClose}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-2xl font-bold text-[#682A53]">
            End Interview
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {chain.clientName} - {chain.position}
            </h3>
            {interviewToEnd && (
              <p className="text-sm text-gray-600">
                Ending {interviewToEnd.Position || interviewToEnd.InterviewType}{" "}
                interview scheduled for{" "}
                {interviewToEnd.InterviewDate
                  ? new Date(interviewToEnd.InterviewDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      }
                    )
                  : "N/A"}
              </p>
            )}
          </div>

          {/* Action Selection */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              What was the outcome of this interview?
            </h4>

            {!selectedAction ? (
              <div className="space-y-3">
                {/* Pending Update */}
                <Button
                  variant="outline"
                  onClick={() => handleActionSelect("Pending Update")}
                  disabled={isSubmitting || loading}
                  className="w-full justify-start py-3 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:text-orange-900 text-orange-800"
                >
                  <Clock className="w-5 h-5 mr-3 text-orange-600" />
                  {loading ? "Setting Pending Update" : "Pending Update"}
                </Button>

                {/* Rescheduled */}
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isSubmitting || loading) return;
                    // Defer status update; signal parent to open Add dialog with pending Rescheduled flow
                    onSubmit(
                      interviewToEnd.InterviewChainID.toString(),
                      "Rescheduled",
                      {
                        EndClientRecruiterName:
                          interviewToEnd.EndClientRecruiterName,
                        EndClientRecruiterEmail:
                          interviewToEnd.EndClientRecruiterEmail,
                        EndClientRecruiterPhone:
                          interviewToEnd.EndClientRecruiterPhone,
                        EndClientRecruiterLinkedIn:
                          interviewToEnd.EndClientRecruiterLinkedIn,
                      }
                    );
                  }}
                  disabled={isSubmitting || loading}
                  className="w-full justify-start py-3 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-900 text-blue-800"
                >
                  <RotateCcw className="w-5 h-5 mr-3 text-blue-600" />
                  Rescheduled
                </Button>

                {/* Next Round */}
                <Button
                  variant="outline"
                  onClick={() => handleEndSubmit("Next")}
                  disabled={isSubmitting || loading}
                  className="w-full justify-start py-3 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-900 text-green-800"
                >
                  <Check className="w-5 h-5 mr-3 text-green-600" />
                  {loading
                    ? "Proceeding to Next Round"
                    : "Proceed to Next Round"}
                </Button>

                {/* Extend Offer */}
                <Button
                  variant="outline"
                  onClick={() => handleActionSelect("Offer")}
                  disabled={isSubmitting || loading}
                  className="w-full justify-start py-3 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 text-emerald-800"
                >
                  <ThumbsUp className="w-5 h-5 mr-3 text-emerald-600" />
                  Extend Offer
                </Button>

                {/* Reject Candidate */}
                <Button
                  variant="outline"
                  onClick={() => handleActionSelect("Rejected")}
                  disabled={isSubmitting || loading}
                  className="w-full justify-start py-3 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-900 text-red-800"
                >
                  <XCircle className="w-5 h-5 mr-3 text-red-600" />
                  Reject Candidate
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h5 className="text-md font-medium text-gray-900">
                  {selectedAction === "Rejected"
                    ? "Select a rejection reason:"
                    : `Please provide a comment for ${selectedAction}:`}
                </h5>

                {selectedAction === "Rejected" ? (
                  <div className="space-y-2">
                    <Select
                      value={rejectionReason}
                      onValueChange={(value) => {
                        setRejectionReason(value);
                        setRejectionError(false);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Reason" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {rejectionReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {rejectionError && (
                      <p className="text-sm text-red-600">Reason is required</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="comment">Comment *</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value);
                        setCommentError(false); // Clear error on change
                      }}
                      placeholder="Enter your comment"
                      rows={4}
                      className={commentError ? "border-red-500" : ""}
                    />
                    {commentError && (
                      <p className="text-sm text-red-600">
                        Comment is required
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEndSubmit(selectedAction)}
                    disabled={isSubmitting || loading}
                    className="flex-1"
                  >
                    {isSubmitting || loading ? "Submitting..." : "Submit"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelComment}
                    disabled={isSubmitting || loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex justify-end p-6 pt-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || loading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
