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
import { Job } from '../types/jobs';

interface ApplyConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onConfirm: (didApply: boolean, comments: string) => void;
}

export function ApplyConfirmationModal({
  open,
  onOpenChange,
  job,
  onConfirm,
}: ApplyConfirmationModalProps) {
  const [didApply, setDidApply] = useState<string>('yes');
  const [comments, setComments] = useState('');

  const handleSubmit = () => {
    onConfirm(didApply === 'yes', comments);
    // Reset form
    setDidApply('yes');
    setComments('');
  };

  if (!job) return null;

  const formatSalary = () => {
    if (!job.salaryMin || !job.salaryMax) return 'Salary not specified';
    return `$${(job.salaryMin / 1000).toFixed(0)}K - $${(
      job.salaryMax / 1000
    ).toFixed(0)}K`;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      // Prevent closing the dialog - user must click Confirm
      if (open === false) return;
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[480px] [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-[#682A53]">
            Application Tracking
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-600">
            Did you successfully apply to this job?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Job Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
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
          <div className="space-y-2">
            <RadioGroup
              value={didApply}
              onValueChange={setDidApply}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 p-2 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                <RadioGroupItem value="yes" id="yes" className="text-green-600" />
                <Label
                  htmlFor="yes"
                  className="flex-1 cursor-pointer font-medium text-gray-900 text-sm"
                >
                  Yes, I submitted the application
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-2 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                <RadioGroupItem value="no" id="no" className="text-red-600" />
                <Label
                  htmlFor="no"
                  className="flex-1 cursor-pointer font-medium text-gray-900 text-sm"
                >
                  No, I didn&apos;t apply
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Comments */}
          <div className="space-y-1.5">
            <Label htmlFor="comments" className="text-xs font-semibold text-gray-700">
              Application Notes (Optional)
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g., Application submitted with customized resume for this role."
              rows={3}
              className="resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-xs"
            />
            <p className="text-[10px] text-gray-500">
              These notes will help track your applications
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-center">
          <Button
            onClick={handleSubmit}
            size="sm"
            className="bg-gradient-to-r from-[#682A53] to-[#7d3463] hover:from-[#7d3463] hover:to-[#682A53] text-white text-xs h-8 w-full"
          >
            Confirm & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
