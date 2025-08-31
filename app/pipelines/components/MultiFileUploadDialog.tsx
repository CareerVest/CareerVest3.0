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
import { Upload, FileText, X, AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface FileUpload {
  id: string;
  file: File;
  label: string;
  required: boolean;
}

interface MultiFileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    comments: string;
    files: FileUpload[];
  }) => void;
  title: string;
  description: string;
  fileRequirements: Array<{
    id: string;
    label: string;
    required: boolean;
    description?: string;
  }>;
  clientName: string;
  requiresComments?: boolean;
}

export function MultiFileUploadDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  fileRequirements,
  clientName,
  requiresComments = true,
}: MultiFileUploadDialogProps) {
  const [comments, setComments] = useState("");
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    requirementId: string,
    label: string,
    required: boolean
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFileUploads((prev) => {
        const existing = prev.find((f) => f.id === requirementId);
        if (existing) {
          return prev.map((f) =>
            f.id === requirementId ? { ...f, file: selectedFile } : f
          );
        } else {
          return [...prev, { id: requirementId, file: selectedFile, label, required }];
        }
      });
    }
  };

  const removeFile = (requirementId: string) => {
    setFileUploads((prev) => prev.filter((f) => f.id !== requirementId));
  };

  const handleSubmit = async () => {
    // Check if all required files are uploaded
    const requiredFiles = fileRequirements.filter((req) => req.required);
    const uploadedRequiredFiles = fileUploads.filter((f) => f.required);
    
    if (uploadedRequiredFiles.length < requiredFiles.length) {
      return; // Don't submit if required files are missing
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        comments,
        files: fileUploads,
      });
      setComments("");
      setFileUploads([]);
    } catch (error) {
      console.error("Error submitting files:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = fileRequirements
    .filter((req) => req.required)
    .every((req) => fileUploads.some((f) => f.id === req.id)) &&
    (!requiresComments || comments.trim().length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description} <strong>{clientName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please upload all required documents to proceed.
            </AlertDescription>
          </Alert>

          {/* File Uploads */}
          <div className="space-y-4">
            {fileRequirements.map((requirement) => {
              const uploadedFile = fileUploads.find((f) => f.id === requirement.id);
              
              return (
                <div key={requirement.id}>
                  <Label className="text-sm font-medium">
                    {requirement.label} {requirement.required && <span className="text-red-500">*</span>}
                  </Label>
                  {requirement.description && (
                    <p className="text-xs text-gray-500 mt-1">{requirement.description}</p>
                  )}
                  <div className="mt-1">
                    {!uploadedFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <div className="text-sm text-gray-600 mb-2">
                          Click to upload or drag and drop
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          PDF, DOC, DOCX files only
                        </div>
                        <Input
                          id={`file-${requirement.id}`}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => 
                            handleFileChange(e, requirement.id, requirement.label, requirement.required)
                          }
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById(`file-${requirement.id}`)?.click();
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
                              {uploadedFile.file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({(uploadedFile.file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(requirement.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comments */}
          <div>
            <Label htmlFor="comments" className="text-sm font-medium">
              Comments {requiresComments && <span className="text-red-500">*</span>}
              {!requiresComments && " (Optional)"}
            </Label>
            <Textarea
              id="comments"
              placeholder={requiresComments ? "Add required notes about this transition..." : "Add any notes about this action..."}
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
            {isSubmitting ? "Processing..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
