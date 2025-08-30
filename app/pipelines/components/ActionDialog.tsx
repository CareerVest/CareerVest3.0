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
import { Upload, FileText, X } from "lucide-react";

interface ActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { comment: string; file?: File }) => void;
  actionName: string;
  clientName: string;
  requiresFile?: boolean;
  fileType?: string;
  fileDescription?: string;
}

export function ActionDialog({
  isOpen,
  onClose,
  onSubmit,
  actionName,
  clientName,
  requiresFile = false,
  fileType = "pdf,doc,docx",
  fileDescription = "Upload a file",
}: ActionDialogProps) {
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (requiresFile && !file) {
      return; // Don't submit if file is required but not provided
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        comment,
        file: file || undefined,
      });
      setComment("");
      setFile(null);
    } catch (error) {
      console.error("Error submitting action:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[500px]"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Complete Action: {actionName}</DialogTitle>
          <DialogDescription>
            Complete the action for client <strong>{clientName}</strong>.
            {requiresFile && " A file upload is required for this action."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <div>
            <Label htmlFor="comment">Notes (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Add any notes about this action..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1"
              rows={3}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {requiresFile && (
            <div>
              <Label htmlFor="file">{fileDescription}</Label>
              <div className="mt-1">
                {!file ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <div className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {fileType.toUpperCase()} files only
                    </div>
                    <Input
                      id="file"
                      type="file"
                      accept={fileType}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById("file")?.click();
                      }}
                    >
                      Choose File
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-lg p-3 bg-gray-50">
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
                          removeFile();
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
          )}
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
            disabled={isSubmitting || (requiresFile && !file)}
          >
            {isSubmitting ? "Completing..." : "Complete Action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
