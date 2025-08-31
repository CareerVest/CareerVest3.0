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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SalesToResumeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    comments: string;
    resumeChecklist: File;
    resume: File;
  }) => void;
  clientName: string;
}

export function SalesToResumeDialog({
  isOpen,
  onClose,
  onSubmit,
  clientName,
}: SalesToResumeDialogProps) {
  const [comments, setComments] = useState("");
  const [resumeChecklist, setResumeChecklist] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!resumeChecklist || !resume) {
      return; // Don't submit if required files are missing
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        comments,
        resumeChecklist,
        resume,
      });
      setComments("");
      setResumeChecklist(null);
      setResume(null);
    } catch (error) {
      console.error("Error submitting sales to resume transition:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "checklist" | "resume"
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (fileType === "checklist") {
        setResumeChecklist(selectedFile);
      } else {
        setResume(selectedFile);
      }
    }
  };

  const removeFile = (fileType: "checklist" | "resume") => {
    if (fileType === "checklist") {
      setResumeChecklist(null);
    } else {
      setResume(null);
    }
  };

  const isFormValid = resumeChecklist && resume;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px]"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Move Client to Resume Stage</DialogTitle>
          <DialogDescription>
            Complete the required documents to move{" "}
            <strong>{clientName}</strong> from Sales to Resume stage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The following documents are required to move this client to the
              Resume stage.
            </AlertDescription>
          </Alert>

          {/* Resume Checklist Upload */}
          <div>
            <Label htmlFor="resumeChecklist" className="text-sm font-medium">
              Resume Checklist <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1">
              {!resumeChecklist ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    PDF, DOC, DOCX files only
                  </div>
                  <Input
                    id="resumeChecklist"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, "checklist")}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("resumeChecklist")?.click();
                    }}
                  >
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {resumeChecklist.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(resumeChecklist.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile("checklist")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resume Upload */}
          <div>
            <Label htmlFor="resume" className="text-sm font-medium">
              Resume Document <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1">
              {!resume ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    PDF, DOC, DOCX files only
                  </div>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, "resume")}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("resume")?.click();
                    }}
                  >
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">{resume.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(resume.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile("resume")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div>
            <Label htmlFor="comments" className="text-sm font-medium">
              Comments (Optional)
            </Label>
            <Textarea
              id="comments"
              placeholder="Add any notes about this transition..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-1"
              rows={3}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Moving..." : "Move to Resume"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
