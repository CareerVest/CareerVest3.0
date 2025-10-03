"use client";

import React from "react";
import { Client } from "../../types/pipelines/pipeline";
import {
  BLOCK_REASONS,
  type ClientBlockHistory,
} from "../../types/pipelines/clientBlock";
import {
  blockClient,
  unblockClient,
  getActiveBlock,
  getBlockHistory,
} from "../actions/pipelineActions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PauseCircle,
  PlayCircle,
  AlertCircle,
  Clock,
  User,
  MessageSquare,
} from "lucide-react";

interface ClientBlockDialogProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ClientBlockDialog({
  client,
  isOpen,
  onClose,
  onSuccess,
}: ClientBlockDialogProps) {
  const [activeBlock, setActiveBlock] = React.useState<ClientBlockHistory | null>(null);
  const [blockHistory, setBlockHistory] = React.useState<ClientBlockHistory[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedReason, setSelectedReason] = React.useState<string>("");
  const [unblockComment, setUnblockComment] = React.useState("");
  const [error, setError] = React.useState<string>("");

  // Fetch block status and history when dialog opens
  React.useEffect(() => {
    const fetchBlockData = async () => {
      if (!isOpen) return;

      const clientId = parseInt(client.id, 10);
      if (isNaN(clientId)) {
        console.error("Invalid client ID:", client.id);
        return;
      }

      try {
        const [activeResponse, historyResponse] = await Promise.all([
          getActiveBlock(clientId),
          getBlockHistory(clientId),
        ]);

        if (activeResponse.success) {
          setActiveBlock(activeResponse.data);
        }

        if (historyResponse.success) {
          setBlockHistory(historyResponse.data);
        }
      } catch (err) {
        console.error("Error fetching block data:", err);
      }
    };

    fetchBlockData();
  }, [isOpen, client.id]);

  const handleBlock = async () => {
    if (!selectedReason) {
      setError("Please select a block reason");
      return;
    }

    const clientId = parseInt(client.id, 10);
    if (isNaN(clientId)) {
      setError("Invalid client ID");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await blockClient(clientId, {
        stageName: client.status,
        blockedReason: selectedReason,
      });

      if (response.success) {
        setActiveBlock(response.data || null);
        onSuccess?.();
        onClose();
      } else {
        setError(response.message || "Failed to block client");
      }
    } catch (err) {
      setError("An error occurred while blocking the client");
      console.error("Block error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!unblockComment || unblockComment.length < 10) {
      setError("Unblock comment must be at least 10 characters");
      return;
    }

    const clientId = parseInt(client.id, 10);
    if (isNaN(clientId)) {
      setError("Invalid client ID");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await unblockClient(clientId, {
        unblockComment,
      });

      if (response.success) {
        setActiveBlock(null);
        setUnblockComment("");
        onSuccess?.();
        onClose();
      } else {
        setError(response.message || "Failed to unblock client");
      }
    } catch (err) {
      setError("An error occurred while unblocking the client");
      console.error("Unblock error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isBlocked = activeBlock !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBlocked ? (
              <>
                <PauseCircle className="w-5 h-5 text-orange-600" />
                Client Blocked - Resume SLA
              </>
            ) : (
              <>
                <PauseCircle className="w-5 h-5 text-blue-600" />
                Block Client - Pause SLA
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isBlocked
              ? "This client is currently blocked. Unblock to resume SLA tracking."
              : "Block this client to pause SLA tracking until the issue is resolved."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Client Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{client.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Stage:</span>
                <Badge variant="outline" className="capitalize">
                  {client.status.replace("-", " ")}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority:</span>
                <Badge variant="outline" className="capitalize">
                  {client.priority || "Standard"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Active Block Info */}
          {isBlocked && activeBlock && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-900">
                  <AlertCircle className="w-4 h-4" />
                  Active Block
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason:</span>
                  <span className="font-medium text-orange-900">
                    {activeBlock.blockedReason}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stage:</span>
                  <Badge variant="outline" className="capitalize">
                    {activeBlock.stageName}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blocked Since:</span>
                  <span className="font-medium text-orange-900">
                    {formatDate(activeBlock.blockedDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blocked By:</span>
                  <span className="font-medium text-orange-900">
                    {activeBlock.blockedBy}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Block/Unblock Form */}
          {isBlocked ? (
            <div className="space-y-3">
              <Label htmlFor="unblock-comment" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Unblock Comment <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="unblock-comment"
                placeholder="Explain why you are unblocking this client (minimum 10 characters)..."
                value={unblockComment}
                onChange={(e) => setUnblockComment(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                {unblockComment.length}/10 characters minimum
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="block-reason" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Block Reason <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger id="block-reason">
                  <SelectValue placeholder="Select a reason for blocking..." />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                SLA tracking will be paused until the client is unblocked
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Block History */}
          {blockHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Block History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                  {blockHistory.map((block) => (
                    <div
                      key={block.blockHistoryID}
                      className="border-l-2 border-gray-300 pl-3 py-1 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{block.blockedReason}</span>
                        <Badge
                          variant={block.isActive ? "default" : "outline"}
                          className="text-xs"
                        >
                          {block.isActive ? "Active" : "Resolved"}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        Stage: {block.stageName}
                      </div>
                      <div className="text-muted-foreground">
                        Blocked: {formatDate(block.blockedDate)} by {block.blockedBy}
                      </div>
                      {block.unblockedDate && (
                        <div className="text-muted-foreground">
                          Unblocked: {formatDate(block.unblockedDate)} by{" "}
                          {block.unblockedBy}
                        </div>
                      )}
                      {block.unblockComment && (
                        <div className="text-muted-foreground italic">
                          "{block.unblockComment}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {isBlocked ? (
            <Button
              onClick={handleUnblock}
              disabled={isLoading || unblockComment.length < 10}
              className="bg-green-600 hover:bg-green-700"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              {isLoading ? "Unblocking..." : "Unblock & Resume SLA"}
            </Button>
          ) : (
            <Button
              onClick={handleBlock}
              disabled={isLoading || !selectedReason}
              variant="destructive"
            >
              <PauseCircle className="w-4 h-4 mr-2" />
              {isLoading ? "Blocking..." : "Block & Pause SLA"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
