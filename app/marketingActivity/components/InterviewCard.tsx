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
  const cardRef = useRef<HTMLDivElement>(null);
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

  return (
    <>
      <Card
        ref={cardRef}
        onClick={handleCardClick}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
          activeInterviewId === interview.interviewChainID
            ? "border-[#682A53] bg-[#FDC500]/10"
            : "border-gray-200"
        } hover:border-[#682A53] hover:bg-[#FDC500]/5`}
        aria-label={`Interview card for ${interview.interviewType} - ${interview.clientName}`}
      >
        <CardContent className="p-2 sm:p-3">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-start justify-between gap-1">
              <Badge className="bg-[#FDC500] text-[#682A53] text-xs font-medium rounded-lg">
                {interview.interviewType || "Unknown"}
              </Badge>
              {interview.interviewStatus === "Completed" && (
                <Badge className="bg-red-500 text-white text-xs rounded-lg">
                  Completed
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-[#682A53] truncate">
                {interview.clientName || "Unknown Client"}
              </p>
              {interview.endClientName && (
                <p className="text-xs text-gray-600 truncate">
                  End Client: {interview.endClientName}
                </p>
              )}
              {interview.technology && (
                <p className="text-xs text-gray-600 truncate">
                  Tech: {interview.technology}
                </p>
              )}
            </div>

            <div className="space-y-1">
              {interview.interviewDate && (
                <p className="text-xs text-gray-500">
                  Date: {dayjs(interview.interviewDate).format("MMM DD, YYYY")}
                </p>
              )}
              {interview.interviewStartTime && interview.interviewEndTime && (
                <p className="text-xs text-gray-500">
                  Time: {interview.interviewStartTime} -{" "}
                  {interview.interviewEndTime}
                </p>
              )}
              {interview.recruiterName && (
                <p className="text-xs text-gray-500 truncate">
                  Recruiter: {interview.recruiterName}
                </p>
              )}
            </div>

            {interview.comments && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {interview.comments}
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
