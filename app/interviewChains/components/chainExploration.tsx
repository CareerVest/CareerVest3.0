"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import type {
  Interview,
  InterviewChain,
} from "../../types/interviewChain/interviewChain";

interface ChainExplorationProps {
  chain: InterviewChain;
  open: boolean;
  onClose: () => void;
  onEndInterview: (
    chain: InterviewChain,
    isEditing: boolean,
    interview?: Interview
  ) => void;
  onAddNewInterview: (chain: InterviewChain) => void;
  onUpdateChainStatus: (chainId: string, newStatus: string) => void;
  onEditInterview: (interview: Interview) => void;
}

export default function ChainExploration({
  chain,
  open,
  onClose,
  onEndInterview,
  onAddNewInterview,
  onUpdateChainStatus,
  onEditInterview,
}: ChainExplorationProps) {
  const [expanded, setExpanded] = useState<string | false>(false);

  useEffect(() => {
    if (!open) {
      setExpanded(false);
    } else if (chain.interviews.length > 0) {
      // Auto-open the last interview accordion when the chain exploration opens
      const lastInterviewIndex = chain.interviews.length - 1;
      setExpanded(`interview-${lastInterviewIndex}`);
    }
  }, [open, chain.interviews.length]);

  // Scroll to the open accordion when it expands
  useEffect(() => {
    if (expanded) {
      // Use setTimeout to ensure the accordion content is rendered before scrolling
      setTimeout(() => {
        const accordionElement = document.querySelector(
          `[data-accordion="${expanded}"]`
        );
        if (accordionElement) {
          accordionElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }, 100);
    }
  }, [expanded]);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Successful":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Unsuccessful":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getOutcomeIcon = (outcome?: string | null) => {
    switch (outcome) {
      case "Next":
        return (
          <svg
            className="w-4 h-4 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        );
      case "Offer":
        return (
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "Rejected":
        return (
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime12Hour = (time: string | null) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    let hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? "PM" : "AM";
    hourNum = hourNum % 12 || 12;
    return `${hourNum}:${minutes} ${period}`;
  };

  const normalizeLinkedInUrl = (url: string | null | undefined): string => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  const handleEditInterviewDirectly = (interview: Interview) => {
    onEditInterview(interview);
  };

  const handleActionsClick = (interview: Interview) => {
    onEndInterview(chain, false, interview);
  };

  const isLastInterview = (index: number) => {
    return index === chain.interviews.length - 1;
  };

  const showInterviewActions = (index: number, interview: Interview) => {
    return (
      isLastInterview(index) &&
      interview.InterviewOutcome !== "Offer" &&
      interview.InterviewOutcome !== "Rejected"
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Modern Header with Prominent Status */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#682A53] to-[#8B3D6B] text-white">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-white/20 text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
          <div>
            <h2 className="text-lg font-bold">{chain.clientName}</h2>
            <p className="text-sm opacity-90 font-medium">{chain.position}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium opacity-90">
            {chain.interviews.length}{" "}
            {chain.interviews.length === 1 ? "interview" : "interviews"}
          </span>
          <Badge className="bg-white text-[#682A53] border-0 font-semibold px-3 py-1 text-sm">
            {chain.status}
          </Badge>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* End Client Info - Above Timeline */}
        <div className="text-center">
          <p className="text-lg font-semibold text-[#682A53]">
            End Client:{" "}
            <span className="text-gray-900">
              {chain.endClientName || "N/A"}
            </span>
          </p>
        </div>

        {/* Modern Interview Timeline */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-[#682A53] rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Interview Timeline
            </h3>
          </div>

          {chain.interviews.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-gray-500 font-medium">
                No interviews scheduled yet
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Add the first interview to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {chain.interviews.map((interview, index) => (
                <div key={index} className="relative">
                  {/* Timeline connector */}
                  {index < chain.interviews.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300"></div>
                  )}

                  <div className="flex items-start space-x-3">
                    {/* Timeline dot */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                        interview.InterviewOutcome === "Offer"
                          ? "bg-gradient-to-br from-green-500 to-green-600"
                          : interview.InterviewOutcome === "Rejected"
                          ? "bg-gradient-to-br from-red-500 to-red-600"
                          : interview.InterviewOutcome === "Next"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gradient-to-br from-gray-500 to-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Interview content */}
                    <div className="flex-1">
                      <Collapsible
                        data-accordion={`interview-${index}`}
                        open={expanded === `interview-${index}`}
                        onOpenChange={(isOpen: boolean) =>
                          setExpanded(isOpen ? `interview-${index}` : false)
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left h-auto p-4 hover:bg-gray-50 border-gray-200 shadow-sm"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-xl">
                                {getOutcomeIcon(interview.InterviewOutcome)}
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-gray-900">
                                  {interview.InterviewType || "Interview"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatDate(interview.InterviewDate)} •{" "}
                                  {formatTime12Hour(
                                    interview.InterviewStartTime
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={`${
                                  interview.InterviewStatus === "Scheduled"
                                    ? "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:text-blue-900"
                                    : interview.InterviewStatus === "Completed"
                                    ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900"
                                    : interview.InterviewStatus === "Cancelled"
                                    ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:text-red-900"
                                    : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:text-gray-900"
                                } border text-xs font-medium transition-colors cursor-pointer`}
                              >
                                {interview.InterviewStatus}
                              </Badge>
                              <Badge
                                className={`${
                                  interview.InterviewOutcome === "Offer"
                                    ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900"
                                    : interview.InterviewOutcome === "Rejected"
                                    ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:text-red-900"
                                    : interview.InterviewOutcome === "Next"
                                    ? "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:text-blue-900"
                                    : interview.InterviewOutcome ===
                                      "Pending Update"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-900"
                                    : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:text-gray-900"
                                } border text-xs font-medium transition-colors cursor-pointer`}
                              >
                                {interview.InterviewOutcome || "Pending"}
                              </Badge>
                              <svg
                                className={`w-4 h-4 transition-transform ${
                                  expanded === `interview-${index}`
                                    ? "rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-3">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                            {/* Compact Interview Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  Entry Date
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {formatDate(interview.InterviewDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  Interview Date
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {formatDate(interview.InterviewDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  Time
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {formatTime12Hour(
                                    interview.InterviewStartTime
                                  )}{" "}
                                  -{" "}
                                  {formatTime12Hour(interview.InterviewEndTime)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  Type
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {interview.InterviewType || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  Method
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {interview.InterviewMethod || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  Recruiter
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {chain.recruiterName || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Compact End Client Recruiter Information */}
                            <div className="border-t border-gray-200 pt-3">
                              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                End Client Recruiter Details
                              </h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-xs text-gray-500">Name</p>
                                  <p className="font-semibold text-gray-900">
                                    {chain.endClientRecruiterName || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Email</p>
                                  <p className="font-semibold text-gray-900">
                                    {chain.endClientRecruiterEmail || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Phone</p>
                                  <p className="font-semibold text-gray-900">
                                    {chain.endClientRecruiterPhone || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    LinkedIn
                                  </p>
                                  {chain.endClientRecruiterLinkedIn ? (
                                    <a
                                      href={normalizeLinkedInUrl(
                                        chain.endClientRecruiterLinkedIn
                                      )}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline font-semibold"
                                    >
                                      View Profile
                                    </a>
                                  ) : (
                                    <p className="font-semibold text-gray-900">
                                      N/A
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Compact Comments and Feedback */}
                            {(interview.Comments ||
                              interview.InterviewFeedback) && (
                              <div className="border-t border-gray-200 pt-3 space-y-2">
                                {interview.Comments && (
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">
                                      Comments
                                    </p>
                                    <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                                      {interview.Comments}
                                    </p>
                                  </div>
                                )}
                                {interview.InterviewFeedback && (
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium mb-1">
                                      Feedback
                                    </p>
                                    <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                                      {interview.InterviewFeedback}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Job Board Information */}
                            {(interview.JobBoardName || interview.JobBoardUrl) && (
                              <div className="border-t border-gray-200 pt-3">
                                <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                  Job Board Information
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  {interview.JobBoardName && (
                                    <div>
                                      <p className="text-xs text-gray-500">Name</p>
                                      <p className="font-semibold text-gray-900">
                                        {interview.JobBoardName}
                                      </p>
                                    </div>
                                  )}
                                  {interview.JobBoardUrl && (
                                    <div>
                                      <p className="text-xs text-gray-500">URL</p>
                                      <a
                                        href={interview.JobBoardUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline font-semibold text-sm truncate block"
                                      >
                                        View Posting
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-2 pt-2 border-t border-gray-200">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleEditInterviewDirectly(interview)
                                }
                                className="flex-1"
                              >
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit
                              </Button>
                              {showInterviewActions(index, interview) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActionsClick(interview)}
                                  className="flex-1"
                                >
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                  </svg>
                                  Action
                                </Button>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
