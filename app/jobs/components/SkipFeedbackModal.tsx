'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Label } from '../../../components/ui/label';
import { Job, SkipReason, SKIP_REASONS } from '../types/jobs';

interface SkipFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onConfirm: (skipReason: SkipReason, customReason: string) => void;
}

export function SkipFeedbackModal({
  open,
  onOpenChange,
  job,
  onConfirm,
}: SkipFeedbackModalProps) {
  const [skipReason, setSkipReason] = useState<SkipReason>('Not_Relevant');
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = () => {
    onConfirm(skipReason, customReason);
    // Reset form
    setSkipReason('Not_Relevant');
    setCustomReason('');
  };

  const handleCancel = () => {
    setSkipReason('Not_Relevant');
    setCustomReason('');
    onOpenChange(false);
  };

  if (!job) return null;

  const formatSalary = () => {
    if (!job.salaryMin || !job.salaryMax) return 'Salary not specified';
    return `$${(job.salaryMin / 1000).toFixed(0)}K - $${(
      job.salaryMax / 1000
    ).toFixed(0)}K`;
  };

  const isOtherSelected = skipReason === 'Other';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-red-600">
            Skip Job Feedback
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-600">
            Why are you skipping this job? This helps us improve future
            recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Job Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h3 className="font-bold text-gray-900 text-sm mb-1">
              {job.title}
            </h3>
            <div className="text-xs text-gray-700 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{job.company}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{formatSalary()}</span>
                <span>•</span>
                <span>{job.location}</span>
              </div>
            </div>
          </div>

          {/* Radio Selection */}
          <div className="space-y-1.5">
            <RadioGroup
              value={skipReason}
              onValueChange={(value) => setSkipReason(value as SkipReason)}
              className="space-y-1.5"
            >
              {SKIP_REASONS.map((reason) => (
                <div
                  key={reason.value}
                  className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <RadioGroupItem
                    value={reason.value}
                    id={reason.value}
                    className="text-[#682A53]"
                  />
                  <Label
                    htmlFor={reason.value}
                    className="flex-1 cursor-pointer text-gray-900 text-xs"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Notes */}
          <div className="space-y-1.5">
            <Label
              htmlFor="customReason"
              className="text-xs font-semibold text-gray-700"
            >
              Additional Notes {isOtherSelected && '(Required)'}
            </Label>
            <Textarea
              id="customReason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder={
                isOtherSelected
                  ? 'Please provide specific details...'
                  : 'Any additional context (optional)'
              }
              rows={3}
              className="resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            size="sm"
            className="border-gray-300 text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isOtherSelected && !customReason.trim()}
            size="sm"
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs h-8"
          >
            Skip This Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
