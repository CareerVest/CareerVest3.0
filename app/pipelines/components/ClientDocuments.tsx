import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Calendar, User } from "lucide-react";
import { ClientDocument } from "../../types/pipelines/pipeline";

interface ClientDocumentsProps {
  documents: ClientDocument[];
  clientName: string;
}

export function ClientDocuments({
  documents,
  clientName,
}: ClientDocumentsProps) {
  // Debug logging to see what's being received
  console.log("🔍 ClientDocuments received documents:", {
    documents,
    type: typeof documents,
    isArray: Array.isArray(documents),
    clientName,
  });

  // Ensure documents is always an array
  const safeDocuments = Array.isArray(documents) ? documents : [];
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileTypeIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("doc")) return "📝";
    if (type.includes("image")) return "🖼️";
    return "📎";
  };

  const handleDownload = (document: ClientDocument) => {
    // In a real app, this would download the actual file
    console.log("Downloading document:", document.name);
  };

  const handleView = (document: ClientDocument) => {
    // In a real app, this would open the document in a viewer
    console.log("Viewing document:", document.name);
  };

  if (safeDocuments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">
              Documents will appear here when uploaded during action completion
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents ({safeDocuments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {safeDocuments.map((document) => (
            <div
              key={document.id}
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl">
                    {getFileTypeIcon(document.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {document.name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(document.fileSize)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(document.uploadedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {document.uploadedBy}
                      </div>
                    </div>

                    {document.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {document.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(document)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(document)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
