import { memo, useRef, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import type { MarketingInterview } from "../../types/MarketingActivity/Marketing";
import dayjs from "dayjs";

interface InterviewCardProps {
  interview: MarketingInterview & {
    clientName: string;
    recruiterName: string | null;
  };
  onInterviewClick: (interview: MarketingInterview) => void;
  activeInterviewId: number | null;
  section: "received" | "scheduled" | "filtered";
}

export const InterviewCard = memo(function InterviewCard({
  interview,
  onInterviewClick,
  activeInterviewId,
  section,
}: InterviewCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isUrgent = () => {
    if (!interview.interviewStartTime) return false;
    const now = dayjs();
    const startTime = dayjs(
      `${interview.interviewDate} ${interview.interviewStartTime}`
    );
    const diff = startTime.diff(now, "minute");
    return diff > 0 && diff <= 60;
  };

  const formatTime = (time: string | null) => {
    if (!time) return "N/A";
    return dayjs(`2023-01-01 ${time}`).format("h:mm A");
  };

  const handleCardClick = () => {
    setIsDialogOpen(true);
    onInterviewClick(interview);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  // Check if interviewOutcome is "Pending Update"
  const isPendingUpdate = interview.interviewOutcome === "Pending Update";

  // Check if this is standup mode
  const isStandupMode = section === "received" || section === "scheduled";

  return (
    <>
      <Card
        onClick={handleCardClick}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
          isUrgent()
            ? "border-red-500 bg-red-50"
            : activeInterviewId === interview.interviewChainID
            ? "border-[#682A53] bg-[#FDC500]/10"
            : isPendingUpdate
            ? "border-red-300 bg-red-50"
            : "border-gray-200"
        } hover:border-[#682A53] hover:bg-[#FDC500]/5`}
        aria-label={`Interview card for ${interview.interviewType} - ${interview.clientName}`}
      >
        <CardContent
          className={`${isStandupMode ? "p-3 sm:p-4" : "p-2 sm:p-3"}`}
        >
          <div
            className={`${
              isStandupMode
                ? "space-y-1.5"
                : "space-y-1"
            }`}
          >
            {/* Header with badges */}
            <div className="flex items-start justify-between gap-1">
              <Badge className="bg-[#FDC500] text-[#682A53] text-[10px] px-1.5 py-0.5 font-medium rounded">
                {interview.interviewType || "Unknown"}
              </Badge>
              {isUrgent() && (
                <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                  Urgent
                </Badge>
              )}
            </div>

            {/* Client Information */}
            <div className={`${isStandupMode ? "space-y-1" : "space-y-0.5"}`}>
              <p className={`${isStandupMode ? "text-xs" : "text-[11px]"} font-semibold text-[#682A53] break-words`}>
                <span className="font-bold">Client:</span> {interview.clientName || "Unknown Client"}
              </p>
              {interview.recruiterName && (
                <p className={`${isStandupMode ? "text-[10px]" : "text-[10px]"} text-gray-600 break-words`}>
                  <span className="font-bold">Recruiter:</span> {interview.recruiterName}
                </p>
              )}
              {interview.endClientName && (
                <p className={`${isStandupMode ? "text-[10px]" : "text-[10px]"} text-gray-600 break-words`}>
                  <span className="font-bold">End Client:</span> {interview.endClientName}
                </p>
              )}
              {interview.technology && (
                <p className={`${isStandupMode ? "text-[10px]" : "text-[10px]"} text-gray-600 break-words`}>
                  <span className="font-bold">Technology:</span> {interview.technology}
                </p>
              )}
            </div>

            {/* Interview Details */}
            <div className={`${isStandupMode ? "space-y-0.5" : "space-y-0.5"}`}>
              {interview.interviewStatus && (
                <p className={`${isStandupMode ? "text-[10px]" : "text-[10px]"} text-gray-600 break-words`}>
                  <span className="font-bold">Status:</span> {interview.interviewStatus}
                </p>
              )}
              {interview.interviewOutcome && (
                <p className={`${isStandupMode ? "text-[10px]" : "text-[10px]"} text-gray-600 break-words`}>
                  <span className="font-bold">Outcome:</span> {interview.interviewOutcome}
                </p>
              )}
              {interview.interviewEntryDate && (
                <p className={`${isStandupMode ? "text-[10px]" : "text-[10px]"} text-gray-600 break-words`}>
                  <span className="font-bold">Entry Date:</span>{" "}
                  {dayjs(interview.interviewEntryDate).format("M/D/YYYY")}
                </p>
              )}
              {interview.interviewDate && (
                <p className={`${isStandupMode ? "text-[10px]" : "text-[10px]"} text-gray-600 break-words`}>
                  <span className="font-bold">Date:</span>{" "}
                  {dayjs(interview.interviewDate).format("M/D/YYYY")}
                </p>
              )}
              {interview.interviewStartTime && interview.interviewEndTime && (
                <p className={`${isStandupMode ? "text-[10px]" : "text-[10px]"} text-gray-600 break-words`}>
                  <span className="font-bold">Time:</span>{" "}
                  {formatTime(interview.interviewStartTime)} - {formatTime(interview.interviewEndTime)}
                </p>
              )}
            </div>

            {/* Comments */}
            {interview.comments && (
              <p className={`${isStandupMode ? "text-[10px]" : "text-[10px]"} text-gray-600 break-words`}>
                <span className="font-bold">Comments:</span> {interview.comments}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#682A53] mb-2">
                  Interview Details
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div>
                    <span className="font-medium">Client:</span>{" "}
                    {interview.clientName || "Unknown"}
                  </div>
                  {interview.endClientName && (
                    <div>
                      <span className="font-medium">End Client:</span>{" "}
                      {interview.endClientName}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    {interview.interviewType || "Unknown"}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    {interview.interviewStatus || "Unknown"}
                  </div>
                  {interview.technology && (
                    <div>
                      <span className="font-medium">Technology:</span>{" "}
                      {interview.technology}
                    </div>
                  )}
                  {interview.interviewDate && (
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {dayjs(interview.interviewDate).format("MMM DD, YYYY")}
                    </div>
                  )}
                  {interview.interviewStartTime &&
                    interview.interviewEndTime && (
                      <div>
                        <span className="font-medium">Time:</span>{" "}
                        {interview.interviewStartTime} -{" "}
                        {interview.interviewEndTime}
                      </div>
                    )}
                  {interview.recruiterName && (
                    <div>
                      <span className="font-medium">Recruiter:</span>{" "}
                      {interview.recruiterName}
                    </div>
                  )}
                  {interview.interviewMethod && (
                    <div>
                      <span className="font-medium">Method:</span>{" "}
                      {interview.interviewMethod}
                    </div>
                  )}
                  {interview.interviewOutcome && (
                    <div>
                      <span className="font-medium">Outcome:</span>{" "}
                      {interview.interviewOutcome}
                    </div>
                  )}
                  {interview.chainStatus && (
                    <div>
                      <span className="font-medium">Chain Status:</span>{" "}
                      {interview.chainStatus}
                    </div>
                  )}
                  {interview.rounds > 0 && (
                    <div>
                      <span className="font-medium">Rounds:</span>{" "}
                      {interview.rounds}
                    </div>
                  )}
                </div>
              </div>

              {(interview.endClientRecruiterName ||
                interview.endClientRecruiterEmail ||
                interview.endClientRecruiterPhone ||
                interview.endClientRecruiterLinkedIn) && (
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#682A53] mb-2">
                    End Client Recruiter
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    {interview.endClientRecruiterName && (
                      <div>
                        <span className="font-medium">Name:</span>{" "}
                        {interview.endClientRecruiterName}
                      </div>
                    )}
                    {interview.endClientRecruiterEmail && (
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {interview.endClientRecruiterEmail}
                      </div>
                    )}
                    {interview.endClientRecruiterPhone && (
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        {interview.endClientRecruiterPhone}
                      </div>
                    )}
                    {interview.endClientRecruiterLinkedIn && (
                      <div>
                        <span className="font-medium">LinkedIn:</span>{" "}
                        {interview.endClientRecruiterLinkedIn}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {interview.interviewSupport && (
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#682A53] mb-2">
                  Support
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {interview.interviewSupport}
                </p>
              </div>
            )}

            {interview.interviewFeedback && (
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#682A53] mb-2">
                  Feedback
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {interview.interviewFeedback}
                </p>
              </div>
            )}

            {interview.comments && (
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#682A53] mb-2">
                  Comments
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {interview.comments}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
