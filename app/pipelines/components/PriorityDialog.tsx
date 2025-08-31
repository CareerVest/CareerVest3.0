import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Zap, Leaf, Circle } from "lucide-react";

interface PriorityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { priority: string; comment: string }) => void;
  clientName: string;
  currentPriority?: string;
}

const priorityOptions = [
  {
    value: "exceptional",
    label: "Exceptional Candidate",
    description: "Top-tier talent with exceptional skills/experience",
    icon: Star,
    color: "border-yellow-300 text-yellow-700 bg-yellow-50",
    badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    value: "real-time",
    label: "Real-Time Experience",
    description: "Candidates with current, relevant experience",
    icon: Zap,
    color: "border-blue-300 text-blue-700 bg-blue-50",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    value: "fresher",
    label: "Fresher",
    description: "New graduates or entry-level candidates",
    icon: Leaf,
    color: "border-green-300 text-green-700 bg-green-50",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
  },
  {
    value: "standard",
    label: "Standard",
    description: "Regular candidates with standard qualifications",
    icon: Circle,
    color: "border-gray-300 text-gray-700 bg-gray-50",
    badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
  },
];

export function PriorityDialog({
  isOpen,
  onClose,
  onSubmit,
  clientName,
  currentPriority = "standard",
}: PriorityDialogProps) {
  const [selectedPriority, setSelectedPriority] = useState(currentPriority);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedPriority) {
      return; // Don't submit if no priority selected
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        priority: selectedPriority,
        comment,
      });
      setComment("");
    } catch (error) {
      console.error("Error setting priority:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrioritySelect = (priority: string) => {
    setSelectedPriority(priority);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[85vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-2xl font-bold text-[#682A53]">
            Rate Candidate
          </DialogTitle>
        </DialogHeader>

        {/* Header Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Client: {clientName}
          </h3>
          <p className="text-sm text-gray-600">
            Rate the candidate category to determine how they will be handled in
            the pipeline.
          </p>
        </div>

        <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
          {/* Priority Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Select Priority Category <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {priorityOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedPriority === option.value;

                return (
                  <div
                    key={option.value}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? "border-[#682A53] bg-[#682A53]/5 shadow-lg"
                        : "border-gray-200 hover:border-[#682A53]/30"
                    }`}
                    onClick={() => handlePrioritySelect(option.value)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${option.badgeColor}`}>
                        <Icon className="h-5 w-5" />
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

          {/* Comments Section */}
          <div>
            <Label htmlFor="comment" className="text-sm font-medium">
              Priority Notes (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Add any notes about why this priority was selected..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 min-h-[100px] resize-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <DialogFooter
          className="flex justify-between pt-6"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedPriority}
            className="bg-[#682A53] hover:bg-[#682A53]/90 text-white min-w-[140px]"
          >
            {isSubmitting ? "Rating Candidate..." : "Rate Candidate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
