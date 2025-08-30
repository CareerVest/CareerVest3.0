"use client";

import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Link,
} from "@mui/material";
import type { ClientDetails } from "../../types/pipelines/pipeline";

interface PipelineMetricsProps {
  selectedClient: ClientDetails | null;
}

export default function PipelineMetrics({
  selectedClient,
}: PipelineMetricsProps) {
  const getStatusColor = (status: string) =>
    ({
      Active: "#388e3c",
      OnHold: "#f57c00",
      Completed: "#1976d2",
      Cancelled: "#d32f2f",
      "New Client Created": "#1976d2",
      "Resume Completed": "#f57c00",
    }[status] || "#757575");

  return (
    <Box>
      {selectedClient && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Client Details
          </Typography>
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {selectedClient.clientName}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Chip
                label={selectedClient.clientStatus}
                size="small"
                sx={{
                  mr: 1,
                  bgcolor: getStatusColor(selectedClient.clientStatus),
                  color: "white",
                }}
              />
              <Typography variant="caption">
                ID: {selectedClient.clientID}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Current Stage
            </Typography>
            <Typography variant="body2">
              {selectedClient.currentStage.department} (
              {selectedClient.daysInCurrentStage} days)
            </Typography>
            {selectedClient.currentStage.notes && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Notes:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {selectedClient.currentStage.notes}
                </Typography>
              </Box>
            )}
            {(selectedClient.currentStage.resumeChecklistUrl ||
              selectedClient.currentStage.coverLetterUrl ||
              selectedClient.currentStage.updatedResumeUrl ||
              selectedClient.currentStage.offerLetterUrl) && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Documents:
                </Typography>
                {selectedClient.currentStage.resumeChecklistUrl && (
                  <Link
                    href={selectedClient.currentStage.resumeChecklistUrl}
                    target="_blank"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    Resume Checklist:{" "}
                    {selectedClient.currentStage.resumeChecklistUrl
                      .split("/")
                      .pop()}
                  </Link>
                )}
                {selectedClient.currentStage.coverLetterUrl && (
                  <Link
                    href={selectedClient.currentStage.coverLetterUrl}
                    target="_blank"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    Cover Letter:{" "}
                    {selectedClient.currentStage.coverLetterUrl
                      .split("/")
                      .pop()}
                  </Link>
                )}
                {selectedClient.currentStage.updatedResumeUrl && (
                  <Link
                    href={selectedClient.currentStage.updatedResumeUrl}
                    target="_blank"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    Updated Resume:{" "}
                    {selectedClient.currentStage.updatedResumeUrl
                      .split("/")
                      .pop()}
                  </Link>
                )}
                {selectedClient.currentStage.offerLetterUrl && (
                  <Link
                    href={selectedClient.currentStage.offerLetterUrl}
                    target="_blank"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    Offer Letter:{" "}
                    {selectedClient.currentStage.offerLetterUrl
                      .split("/")
                      .pop()}
                  </Link>
                )}
              </Box>
            )}
          </Paper>

          {selectedClient.backedOutReason && (
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Backed Out Reason
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {selectedClient.backedOutReason}
              </Typography>
            </Paper>
          )}

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Pipeline History
          </Typography>
          {selectedClient.pipelineHistory.map((stage, idx) => (
            <Paper key={idx} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {stage.department}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {`${new Date(stage.startDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })} - ${
                  stage.endDate
                    ? new Date(stage.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "Current"
                }`}
              </Typography>
              {stage.notes && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Notes:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {stage.notes}
                  </Typography>
                </Box>
              )}
              {(stage.resumeChecklistUrl ||
                stage.coverLetterUrl ||
                stage.updatedResumeUrl ||
                stage.offerLetterUrl) && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Documents:
                  </Typography>
                  {stage.resumeChecklistUrl && (
                    <Link
                      href={stage.resumeChecklistUrl}
                      target="_blank"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      Resume Checklist:{" "}
                      {stage.resumeChecklistUrl.split("/").pop()}
                    </Link>
                  )}
                  {stage.coverLetterUrl && (
                    <Link
                      href={stage.coverLetterUrl}
                      target="_blank"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      Cover Letter: {stage.coverLetterUrl.split("/").pop()}
                    </Link>
                  )}
                  {stage.updatedResumeUrl && (
                    <Link
                      href={stage.updatedResumeUrl}
                      target="_blank"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      Updated Resume: {stage.updatedResumeUrl.split("/").pop()}
                    </Link>
                  )}
                  {stage.offerLetterUrl && (
                    <Link
                      href={stage.offerLetterUrl}
                      target="_blank"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      Offer Letter: {stage.offerLetterUrl.split("/").pop()}
                    </Link>
                  )}
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}
      {selectedClient &&
        selectedClient.actions &&
        selectedClient.actions.length > 0 && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Actions
            </Typography>
            <List dense>
              {selectedClient.actions.map((action, idx) => (
                <ListItem key={idx} sx={{ px: 0 }}>
                  <ListItemText
                    primary={action.actionType}
                    secondary={
                      <>
                        <Typography variant="body2">
                          {action.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {new Date(action.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            }
                          )}{" "}
                          at {new Date(action.timestamp).toLocaleTimeString()}{" "}
                          by {action.performedBy || "Unknown"}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
    </Box>
  );
}
