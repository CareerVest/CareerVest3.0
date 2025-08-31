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
import { Input } from "@/components/ui/input";
import { Upload, FileText, X, AlertCircle } from "lucide-react";

interface ResumeCompletedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    comment: string;
    draftedResume: File;
    additionalDocuments?: File[];
  }) => void;
  clientName: string;
}

export function ResumeCompletedDialog({
  isOpen,
  onClose,
  onSubmit,
  clientName,
}: ResumeCompletedDialogProps) {
  const [comment, setComment] = useState("");
  const [draftedResume, setDraftedResume] = useState<File | null>(null);
  const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!draftedResume) {
      return; // Don't submit if drafted resume is not provided
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        comment,
        draftedResume,
        additionalDocuments:
          additionalDocuments.length > 0 ? additionalDocuments : undefined,
      });
      setComment("");
      setDraftedResume(null);
      setAdditionalDocuments([]);
    } catch (error) {
      console.error("Error submitting resume completed action:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDraftedResumeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setDraftedResume(selectedFile);
    }
  };

  const handleAdditionalDocumentsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(e.target.files || []);
    setAdditionalDocuments((prev) => [...prev, ...selectedFiles]);
  };

  const removeDraftedResume = () => {
    setDraftedResume(null);
  };

  const removeAdditionalDocument = (index: number) => {
    setAdditionalDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit = draftedResume !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px]"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Complete Resume Action</DialogTitle>
          <DialogDescription>
            Complete the resume action for client <strong>{clientName}</strong>.
            Upload the drafted resume (required) and any additional documents
            (optional).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          {/* Comments Section */}
          <div>
            <Label htmlFor="comment">Notes (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Add any notes about the resume completion..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1"
              rows={3}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Drafted Resume Section - Required */}
          <div>
            <Label htmlFor="draftedResume" className="flex items-center gap-2">
              Drafted Resume <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1">
              {!draftedResume ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    PDF, DOC, DOCX files only (Max 10MB)
                  </div>
                  <Input
                    id="draftedResume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleDraftedResumeChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("draftedResume")?.click();
                    }}
                  >
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {draftedResume.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(draftedResume.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDraftedResume();
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Documents Section - Optional */}
          <div>
            <Label htmlFor="additionalDocuments">
              Additional Documents (Optional)
            </Label>
            <div className="mt-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <div className="text-sm text-gray-600 mb-2">
                  Click to upload additional documents
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  PDF, DOC, DOCX, JPG, PNG files (Max 20MB each)
                </div>
                <Input
                  id="additionalDocuments"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleAdditionalDocumentsChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById("additionalDocuments")?.click();
                  }}
                >
                  Choose Files
                </Button>
              </div>
            </div>

            {/* Display uploaded additional documents */}
            {additionalDocuments.length > 0 && (
              <div className="mt-3 space-y-2">
                <Label className="text-sm font-medium">
                  Uploaded Additional Documents:
                </Label>
                {additionalDocuments.map((file, index) => (
                  <div key={index} className="border rounded-lg p-2 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAdditionalDocument(index);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit();
            }}
            disabled={isSubmitting || !canSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Completing..." : "Complete Resume Action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
