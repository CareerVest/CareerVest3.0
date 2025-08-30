"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Button,
  Select,
  MenuItem as SelectMenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import {
  MoreVert,
  ArrowForward,
  Search,
  Clear,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import type {
  ClientStatus,
  PipelineClient,
  PipelineDepartment,
  PipelineStage,
  Recruiter,
  ClientDetails,
} from "../../types/pipelines/pipeline";
import {
  fetchPipelineData,
  fetchClientDetails,
  updateClientStage,
  performClientAction,
} from "../actions/pipelinesActions";
import permissions from "../../utils/permissions";

// Styled VisuallyHiddenInput to handle file input
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

interface PipelinesBoardProps {
  userRole: string;
  userId: number;
  onClientSelect: (client: ClientDetails) => void;
}

export default function PipelinesBoard({
  userRole,
  userId,
  onClientSelect,
}: PipelinesBoardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));

  const [clients, setClients] = useState<PipelineClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<PipelineClient[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openUploadDialog, setOpenUploadDialog] = useState(false); // Resume Checklist dialog
  const [openMarketingUploadDialog, setOpenMarketingUploadDialog] =
    useState(false); // Cover Letter & Updated Resume dialog
  const [openCompletedUploadDialog, setOpenCompletedUploadDialog] =
    useState(false); // Offer Letter dialog
  const [openBackOutDialog, setOpenBackOutDialog] = useState(false); // Backed Out dialog
  const [openNotesDialog, setOpenNotesDialog] = useState(false); // Generic Notes dialog for transitions
  const [openInitialCallDialog, setOpenInitialCallDialog] = useState(false); // Initial Call Done dialog
  const [openCompleteResumeDialog, setOpenCompleteResumeDialog] =
    useState(false); // Complete Resume dialog
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [uploadStage, setUploadStage] = useState<PipelineDepartment | null>(
    null
  );
  const [targetDepartment, setTargetDepartment] =
    useState<PipelineDepartment | null>(null); // For notes dialog
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [coverLetterFileName, setCoverLetterFileName] = useState<string | null>(
    null
  );
  const [updatedResumeFile, setUpdatedResumeFile] = useState<File | null>(null);
  const [updatedResumeFileName, setUpdatedResumeFileName] = useState<
    string | null
  >(null);
  const [offerLetterFile, setOfferLetterFile] = useState<File | null>(null);
  const [offerLetterFileName, setOfferLetterFileName] = useState<string | null>(
    null
  );
  const [completeResumeFile, setCompleteResumeFile] = useState<File | null>(
    null
  ); // File for Complete Resume action
  const [completeResumeFileName, setCompleteResumeFileName] = useState<
    string | null
  >(null); // File name for Complete Resume action
  const [backOutReason, setBackOutReason] = useState("");
  const [backOutNotes, setBackOutNotes] = useState("");
  const [resumeNotes, setResumeNotes] = useState("");
  const [marketingNotes, setMarketingNotes] = useState("");
  const [completedNotes, setCompletedNotes] = useState("");
  const [transitionNotes, setTransitionNotes] = useState(""); // For generic notes dialog
  const [initialCallNotes, setInitialCallNotes] = useState(""); // Notes for Initial Call Done
  const [completeResumeNotes, setCompleteResumeNotes] = useState(""); // Notes for Complete Resume
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true); // For initial load
  const [stageTransitionLoading, setStageTransitionLoading] = useState(false); // For stage transitions
  const [performingAction, setPerformingAction] = useState(false); // Global flag to disable interactions during actions
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean;
  }>({}); // Per-button loading state
  const [dropdownLoading, setDropdownLoading] = useState<{
    [key: string]: boolean;
  }>({}); // Loading state for dropdowns
  const [actionCompleted, setActionCompleted] = useState<{
    [key: string]: boolean;
  }>({}); // Per-button completion state
  const [clientActionsCompleted, setClientActionsCompleted] = useState<{
    [key: number]: string[];
  }>({}); // Track completed actions per client
  const [clientDetailsLoading, setClientDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to track if initial fetch has been performed
  const hasFetchedInitialData = useRef(false);

  // Ref to store the latest fetch promise to prevent race conditions
  const fetchPromiseRef = useRef<Promise<void> | null>(null);

  // Debounced fetch function to batch updates
  const debouncedFetchPipelineData = useCallback(
    (supervisorId?: number) => {
      handleMenuClose();
      if (fetchPromiseRef.current) {
        // If a fetch is already in progress, wait for it to complete
        return fetchPromiseRef.current;
      }

      const fetchPromise = new Promise<void>(async (resolve, reject) => {
        try {
          setLoading(true);
          const response = await fetchPipelineData(
            searchQuery,
            undefined,
            undefined,
            userRole === "Senior_Recruiter" ? supervisorId ?? userId : undefined // Use supervisorId if provided, else userId
          );
          setClients(response.clients);
          setRecruiters(response.recruiters);
          // Filter clients based on role
          let filtered = response.clients;
          if (userRole === "Senior_Recruiter") {
            filtered = filtered.filter((client) =>
              client.completedActions.some(
                (action) =>
                  //action === `AssignSeniorRecruiter-${userId}` &&
                  client.currentStage.department === "Marketing"
              )
            );
          } else if (userRole === "Recruiter") {
            filtered = filtered.filter(
              (client) =>
                //client.recruiterId === userId &&
                client.currentStage.department === "Marketing"
            );
          }
          setFilteredClients(filtered);
          resolve();
        } catch (err: any) {
          setError(err.message);
          reject(err);
        } finally {
          setLoading(false);
          fetchPromiseRef.current = null; // Clear the ref after completion
        }
      });

      fetchPromiseRef.current = fetchPromise;
      return fetchPromise;
    },
    [searchQuery, userRole, userId]
  );

  // Fetch clients and recruiters on mount
  useEffect(() => {
    if (hasFetchedInitialData.current) {
      return; // Prevent multiple fetches in Strict Mode
    }
    hasFetchedInitialData.current = true;

    debouncedFetchPipelineData();
  }, [debouncedFetchPipelineData]);

  // Debounce search query to prevent excessive filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      let filtered = clients;
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        filtered = filtered.filter((c) =>
          [
            c.name,
            c.id.toString(),
            c.status,
            c.techStack,
            c.currentStage.department,
          ].some((field) => field.toLowerCase().includes(searchLower))
        );
      }
      // Apply role-based filtering after search
      if (userRole === "Senior_Recruiter") {
        filtered = filtered.filter((client) =>
          client.completedActions.some(
            (action) =>
              //action === `AssignSeniorRecruiter-${userId}` &&
              client.currentStage.department === "Marketing"
          )
        );
      } else if (userRole === "Recruiter") {
        filtered = filtered.filter(
          (client) =>
            //client.recruiterId === userId &&
            client.currentStage.department === "Marketing"
        );
      }
      setFilteredClients(filtered);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, clients, userRole, userId]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (performingAction || stageTransitionLoading) return; // Disable search input during actions or stage transitions
    setSearchQuery(event.target.value);
  };

  const handleAction = async (
    clientId: number,
    action: string,
    department: string,
    role: string,
    notes?: string,
    file?: File
  ) => {
    const actionKey = `${clientId}-${action}-${role}`; // Unique key for the action button
    try {
      // Set loading state for this specific action button and disable all interactions
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));
      setPerformingAction(true);

      // Use composite action type only for "Acknowledged" actions
      const actionType =
        action === "Acknowledged" ? `${action}-${role}-${department}` : action;
      const success = await performClientAction(clientId, {
        actionType: actionType,
        department: department,
        notes: notes,
        file: file,
      });

      if (success) {
        // If the action is an "Acknowledge" by a Senior Recruiter, fetch the updated client to get the AssignedRecruiterID
        if (
          action === "Acknowledged" &&
          role === "Senior_Recruiter" &&
          department === "Marketing"
        ) {
          const updatedClients = clients.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  completedActions: [
                    ...client.completedActions,
                    `Acknowledged-${role}-${department}`,
                  ],
                }
              : client
          );
          const updatedClient = updatedClients.find(
            (client) => client.id === clientId
          );
          if (updatedClient) {
            const assignedSeniorRecruiterId =
              getAssignedSeniorRecruiterId(updatedClient);
            if (assignedSeniorRecruiterId) {
              // Fetch updated pipeline data with the assigned Senior Recruiter as supervisorId
              await debouncedFetchPipelineData(assignedSeniorRecruiterId);
            } else {
              // Fallback fetch without supervisorId if assignedSeniorRecruiterId is not found
              await debouncedFetchPipelineData();
            }
          }
        } else {
          // For other actions, perform a regular fetch without supervisorId
          await debouncedFetchPipelineData();
        }

        console.log(`Action performed: ${actionType} for client ${clientId}`);
        if (action === "Resume Completed") {
          console.log(`Email sent to client ${clientId}: Resume completed`);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      // Clear loading state for this action button and re-enable interactions
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
      setPerformingAction(false);
    }
  };

  const handleAssignSeniorRecruiter = async (
    clientId: number,
    seniorRecruiterId: string | number
  ) => {
    if (performingAction || stageTransitionLoading) return;
    const parsedRecruiterId =
      typeof seniorRecruiterId === "string"
        ? parseInt(seniorRecruiterId, 10)
        : seniorRecruiterId;
    const actionKey = `${clientId}-AssignSeniorRecruiter`;
    try {
      setDropdownLoading((prev) => ({ ...prev, [actionKey]: true }));
      setPerformingAction(true);
      await performClientAction(clientId, {
        actionType: `AssignSeniorRecruiter-${parsedRecruiterId}`,
        department: "Marketing",
        recruiterId: parsedRecruiterId,
      });
      await debouncedFetchPipelineData(parsedRecruiterId);
      console.log(
        `Email sent: Senior Recruiter ${parsedRecruiterId} assigned to client ${clientId}`
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, [actionKey]: false }));
      setPerformingAction(false);
    }
  };

  const handleAssignRecruiter = async (
    clientId: number,
    recruiterId: string | number
  ) => {
    if (performingAction || stageTransitionLoading) return;
    const parsedRecruiterId =
      typeof recruiterId === "string" ? parseInt(recruiterId, 10) : recruiterId;
    const actionKey = `${clientId}-AssignRecruiter`;
    try {
      setDropdownLoading((prev) => ({ ...prev, [actionKey]: true }));
      setPerformingAction(true);
      await performClientAction(clientId, {
        actionType: "AssignRecruiter",
        department: "Marketing",
        recruiterId: parsedRecruiterId,
      });
      await debouncedFetchPipelineData();
      console.log(
        `Email sent: Recruiter ${parsedRecruiterId} assigned to client ${clientId}`
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDropdownLoading((prev) => ({ ...prev, [actionKey]: false }));
      setPerformingAction(false);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    clientId: number
  ) => {
    if (performingAction || stageTransitionLoading) return; // Disable menu opening during actions or stage transitions
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedClientId(clientId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClientId(null);
  };

  const handleMoveToStage = (
    clientId: number,
    department: PipelineDepartment
  ) => {
    if (performingAction || stageTransitionLoading) return; // Disable stage transitions during actions or stage transitions
    setSelectedClientId(clientId);
    setTargetDepartment(department);

    if (
      (userRole === "Sales_Executive" || userRole === "Admin") &&
      department === "Resume"
    ) {
      setUploadStage(department);
      setOpenUploadDialog(true);
    } else if (
      (userRole === "Resume_Writer" || userRole === "Admin") &&
      department === "Marketing"
    ) {
      setUploadStage(department);
      setOpenMarketingUploadDialog(true);
    } else if (
      (userRole === "Recruiter" ||
        userRole === "Senior_Recruiter" ||
        userRole === "Marketing_Manager" ||
        userRole === "Admin") &&
      department === "Completed" &&
      (clients.find((c) => c.id === clientId)?.currentStage.department ===
        "Marketing" ||
        clients.find((c) => c.id === clientId)?.currentStage.department ===
          "ReMarketing")
    ) {
      setUploadStage(department);
      setOpenCompletedUploadDialog(true);
    } else if (
      department === "Backed Out" &&
      (clients.find((c) => c.id === clientId)?.currentStage.department ===
        "Sales" ||
        clients.find((c) => c.id === clientId)?.currentStage.department ===
          "Resume" ||
        clients.find((c) => c.id === clientId)?.currentStage.department ===
          "Marketing")
    ) {
      setUploadStage(department);
      setOpenBackOutDialog(true);
    } else if (
      userRole === "Admin" ||
      (department === "OnHold" &&
        (clients.find((c) => c.id === clientId)?.currentStage.department ===
          "Sales" ||
          clients.find((c) => c.id === clientId)?.currentStage.department ===
            "Resume" ||
          clients.find((c) => c.id === clientId)?.currentStage.department ===
            "Marketing" ||
          clients.find((c) => c.id === clientId)?.currentStage.department ===
            "ReMarketing")) ||
      (department === "ReMarketing" &&
        (clients.find((c) => c.id === clientId)?.currentStage.department ===
          "Completed" ||
          clients.find((c) => c.id === clientId)?.currentStage.department ===
            "OnHold" ||
          clients.find((c) => c.id === clientId)?.currentStage.department ===
            "Backed Out")) ||
      ((department === "Marketing" || department === "Backed Out") &&
        clients.find((c) => c.id === clientId)?.currentStage.department ===
          "OnHold") ||
      (department === "Backed Out" &&
        clients.find((c) => c.id === clientId)?.currentStage.department ===
          "ReMarketing")
    ) {
      setUploadStage(department);
      setOpenNotesDialog(true);
    } else {
      onStageUpdate(clientId, {
        stageId: 0,
        clientId,
        department,
        startDate: new Date().toISOString(),
        endDate: null,
        createdTS: new Date().toISOString(),
        updatedTS: new Date().toISOString(),
      });
      handleMenuClose();
    }
  };

  const onStageUpdate = async (
    clientId: number,
    newStage: PipelineStage,
    backOutReason?: string,
    notes?: string,
    resumeFile?: File,
    coverLetterFile?: File,
    updatedResumeFile?: File,
    offerLetterFile?: File
  ) => {
    if (performingAction || stageTransitionLoading) return; // Disable stage updates during actions or stage transitions
    try {
      setStageTransitionLoading(true);
      await updateClientStage(
        clientId,
        {
          department: newStage.department,
          backedOutReason: backOutReason,
        },
        resumeFile,
        notes,
        coverLetterFile,
        updatedResumeFile,
        offerLetterFile
      );
      await debouncedFetchPipelineData();
      setOpenUploadDialog(false);
      setOpenMarketingUploadDialog(false);
      setOpenCompletedUploadDialog(false);
      setOpenBackOutDialog(false);
      setOpenNotesDialog(false);
      setResumeFile(null);
      setResumeFileName(null);
      setCoverLetterFile(null);
      setCoverLetterFileName(null);
      setUpdatedResumeFile(null);
      setUpdatedResumeFileName(null);
      setOfferLetterFile(null);
      setOfferLetterFileName(null);
      setUploadStage(null);
      setTargetDepartment(null);
      setBackOutReason("");
      setBackOutNotes("");
      setResumeNotes("");
      setMarketingNotes("");
      setCompletedNotes("");
      setTransitionNotes("");
      setSelectedClientId(null);
      console.log(
        `Email sent: Client ${clientId} moved to ${newStage.department}` +
          (backOutReason ? `, reason: ${backOutReason}` : "")
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStageTransitionLoading(false);
    }
  };

  const handleUploadDocuments = () => {
    if (performingAction || stageTransitionLoading) return; // Disable dialog actions during actions or stage transitions
    if (selectedClientId && uploadStage) {
      onStageUpdate(
        selectedClientId,
        {
          stageId: 0,
          clientId: selectedClientId,
          department: uploadStage,
          startDate: new Date().toISOString(),
          endDate: null,
          createdTS: new Date().toISOString(),
          updatedTS: new Date().toISOString(),
        },
        undefined,
        resumeNotes,
        resumeFile || undefined
      );
    }
  };

  const handleMarketingUploadDocuments = () => {
    if (performingAction || stageTransitionLoading) return; // Disable dialog actions during actions or stage transitions
    if (selectedClientId && uploadStage) {
      onStageUpdate(
        selectedClientId,
        {
          stageId: 0,
          clientId: selectedClientId,
          department: uploadStage,
          startDate: new Date().toISOString(),
          endDate: null,
          createdTS: new Date().toISOString(),
          updatedTS: new Date().toISOString(),
        },
        undefined,
        marketingNotes,
        undefined,
        coverLetterFile || undefined,
        updatedResumeFile || undefined
      );
    }
  };

  const handleCompletedUploadDocuments = () => {
    if (performingAction || stageTransitionLoading) return; // Disable dialog actions during actions or stage transitions
    if (selectedClientId && uploadStage) {
      onStageUpdate(
        selectedClientId,
        {
          stageId: 0,
          clientId: selectedClientId,
          department: uploadStage,
          startDate: new Date().toISOString(),
          endDate: null,
          createdTS: new Date().toISOString(),
          updatedTS: new Date().toISOString(),
        },
        undefined,
        completedNotes,
        undefined,
        undefined,
        undefined,
        offerLetterFile || undefined
      );
    }
  };

  const handleNotesSubmit = () => {
    if (performingAction || stageTransitionLoading) return; // Disable dialog actions during actions or stage transitions
    if (selectedClientId && uploadStage && targetDepartment) {
      onStageUpdate(
        selectedClientId,
        {
          stageId: 0,
          clientId: selectedClientId,
          department: targetDepartment,
          startDate: new Date().toISOString(),
          endDate: null,
          createdTS: new Date().toISOString(),
          updatedTS: new Date().toISOString(),
        },
        undefined,
        transitionNotes
      );
    }
  };

  const handleInitialCallSubmit = (clientId: number, department: string) => {
    if (performingAction || stageTransitionLoading) return; // Disable dialog actions during actions or stage transitions
    handleAction(
      clientId,
      "Initial Call Done",
      department,
      userRole,
      initialCallNotes
    );
    setOpenInitialCallDialog(false);
    setInitialCallNotes("");
    setSelectedClientId(null);
  };

  const handleCompleteResumeSubmit = (clientId: number, department: string) => {
    if (performingAction || stageTransitionLoading) return; // Disable dialog actions during actions or stage transitions
    handleAction(
      clientId,
      "Resume Completed",
      department,
      userRole,
      completeResumeNotes,
      completeResumeFile || undefined
    );
    setOpenCompleteResumeDialog(false);
    setCompleteResumeNotes("");
    setCompleteResumeFile(null);
    setCompleteResumeFileName(null);
    setSelectedClientId(null);
  };

  const handleResumeFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (performingAction || stageTransitionLoading) return; // Disable file input during actions or stage transitions
    const file = event.target.files ? event.target.files[0] : null;
    setResumeFile(file);
    setResumeFileName(file ? file.name : null);
  };

  const handleCoverLetterFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (performingAction || stageTransitionLoading) return; // Disable file input during actions or stage transitions
    const file = event.target.files ? event.target.files[0] : null;
    setCoverLetterFile(file);
    setCoverLetterFileName(file ? file.name : null);
  };

  const handleUpdatedResumeFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (performingAction || stageTransitionLoading) return; // Disable file input during actions or stage transitions
    const file = event.target.files ? event.target.files[0] : null;
    setUpdatedResumeFile(file);
    setUpdatedResumeFileName(file ? file.name : null);
  };

  const handleOfferLetterFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (performingAction || stageTransitionLoading) return; // Disable file input during actions or stage transitions
    const file = event.target.files ? event.target.files[0] : null;
    setOfferLetterFile(file);
    setOfferLetterFileName(file ? file.name : null);
  };

  const handleCompleteResumeFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (performingAction || stageTransitionLoading) return; // Disable file input during actions or stage transitions
    const file = event.target.files ? event.target.files[0] : null;
    setCompleteResumeFile(file);
    setCompleteResumeFileName(file ? file.name : null);
  };

  const handleBackOutSubmit = () => {
    if (performingAction || stageTransitionLoading) return; // Disable dialog actions during actions or stage transitions
    if (selectedClientId && uploadStage) {
      onStageUpdate(
        selectedClientId,
        {
          stageId: 0,
          clientId: selectedClientId,
          department: uploadStage,
          startDate: new Date().toISOString(),
          endDate: null,
          createdTS: new Date().toISOString(),
          updatedTS: new Date().toISOString(),
        },
        backOutReason,
        backOutNotes
      );
    }
  };

  const handleClientSelect = async (client: PipelineClient) => {
    if (performingAction || stageTransitionLoading) return; // Disable client selection during actions or stage transitions
    try {
      setClientDetailsLoading(true);
      const clientDetails = await fetchClientDetails(client.id);
      onClientSelect(clientDetails);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setClientDetailsLoading(false);
    }
  };

  const getStatusColor = (status: string) =>
    ({
      "Resume Preparation": "#f57c00",
      Marketing: "#388e3c",
      "Backed Out": "#d32f2f",
      Placed: "#673ab7",
      "In Sales": "#1976d2",
      "On Hold": "#808080",
      ReMarketing: "#FFD700",
      "New Client Created": "#1976d2",
    }[status] || "#757575");

  const getColumnColor = (dept: string) =>
    ({
      Sales: "rgba(25, 118, 210, 0.1)",
      Resume: "rgba(245, 124, 0, 0.1)",
      Marketing: "rgba(56, 142, 60, 0.1)",
      Completed: "rgba(103, 58, 183, 0.1)",
      BackedOut: "rgba(211, 47, 47, 0.1)",
      ReMarketing: "rgba(255, 215, 0, 0.1)", // Gold for ReMarketing
      OnHold: "rgba(128, 128, 128, 0.1)", // Gray for OnHold
    }[dept] || "rgba(117, 117, 117, 0.1)");

  const getDepartmentTextColor = (dept: string) =>
    ({
      Sales: "#1976d2",
      Resume: "#f57c00",
      Marketing: "#388e3c",
      Completed: "#673ab7",
      BackedOut: "#d32f2f",
      ReMarketing: "#FFD700", // Gold for ReMarketing
      OnHold: "#808080", // Gray for OnHold
    }[dept] || "#757575");

  const departments: PipelineDepartment[] = [
    "Sales",
    "Resume",
    "Marketing",
    "Completed",
    "Backed Out",
    "ReMarketing",
    "OnHold",
  ];
  const groupedClients = departments.map((dept) =>
    filteredClients.filter((c) => c.currentStage.department === dept)
  );

  // Define required actions for each department with sequence
  const getRequiredActions = (department: PipelineDepartment): string[] => {
    switch (department) {
      case "Resume":
        return [
          `Acknowledged-${userRole}-Resume`,
          "Initial Call Done",
          "Resume Completed",
        ];
      case "Marketing":
      case "ReMarketing":
        if (userRole === "Marketing_Manager") {
          return [`Acknowledged-Marketing_Manager-Marketing`];
        } else if (userRole === "Senior_Recruiter") {
          return [`Acknowledged-Senior_Recruiter-Marketing`];
        } else if (userRole === "Recruiter") {
          return [`Acknowledged-Recruiter-Marketing`];
        }
        return [];
      default:
        return [];
    }
  };

  // Check if all required actions are completed for a client
  const areAllActionsCompleted = (
    client: PipelineClient,
    department: PipelineDepartment
  ): boolean => {
    const requiredActions = getRequiredActions(department);
    return requiredActions.every((action) =>
      client.completedActions.includes(action)
    );
  };

  // Determine if an action is disabled based on its prerequisites
  const isActionDisabled = (
    client: PipelineClient,
    action: string,
    department: PipelineDepartment,
    role: string
  ): boolean => {
    const compositeAction =
      action === "Acknowledged" ? `${action}-${role}-${department}` : action;
    if (client.completedActions.includes(compositeAction)) {
      return true; // Action already completed
    }

    if (department === "Resume") {
      if (action === "Initial Call Done") {
        return !client.completedActions.includes(`Acknowledged-${role}-Resume`);
      }
      if (action === "Resume Completed") {
        return !client.completedActions.includes("Initial Call Done");
      }
    }

    if (
      department === "Marketing" &&
      role === "Senior_Recruiter" &&
      action === "Acknowledged"
    ) {
      return !client.completedActions.includes(
        `Acknowledged-Marketing_Manager-Marketing`
      );
    }

    if (
      department === "Marketing" &&
      role === "Recruiter" &&
      action === "Acknowledged"
    ) {
      return !client.completedActions.includes(
        `Acknowledged-Senior_Recruiter-Marketing`
      );
    }

    return false; // No prerequisites for other actions
  };

  // Check if a Senior Recruiter has been assigned
  const hasSeniorRecruiterAssigned = (client: PipelineClient): boolean => {
    return client.completedActions.some((action) =>
      action.startsWith("AssignSeniorRecruiter-")
    );
  };

  // Get the assigned Senior Recruiter ID from completedActions
  const getAssignedSeniorRecruiterId = (
    client: PipelineClient
  ): number | null => {
    const assignAction = client.completedActions.find((action) =>
      action.startsWith("AssignSeniorRecruiter-")
    );
    if (assignAction) {
      const recruiterId = parseInt(
        assignAction.replace("AssignSeniorRecruiter-", ""),
        10
      );
      return isNaN(recruiterId) ? null : recruiterId;
    }
    return null;
  };

  // Dynamically determine allowed stages based on the client's current stage, user role, and action completion
  const getAllowedStages = (
    currentDepartment: PipelineDepartment,
    client: PipelineClient
  ): PipelineDepartment[] => {
    const baseAllowedStages = (() => {
      if (userRole === "Admin" || userRole === "Marketing_Manager") {
        // Admins and Marketing Managers can move to any stage except the current one, no action completion required
        return departments.filter((dept) => dept !== currentDepartment);
      }

      switch (currentDepartment) {
        case "Sales":
          if (userRole === "Sales_Executive") {
            return ["Resume", "Backed Out", "OnHold"];
          }
          break;
        case "Resume":
          if (userRole === "Resume_Writer") {
            return ["Marketing", "Backed Out", "OnHold"];
          }
          break;
        case "Marketing":
          if (userRole === "Recruiter" || userRole === "Senior_Recruiter") {
            return ["Completed", "Backed Out", "OnHold"];
          }
          break;
        case "Completed":
          return ["ReMarketing"];
        case "OnHold":
          return ["ReMarketing", "Marketing", "Backed Out"];
        case "Backed Out":
          return ["ReMarketing"];
        case "ReMarketing":
          if (userRole === "Recruiter" || userRole === "Senior_Recruiter") {
            return ["Completed", "Backed Out", "OnHold"];
          }
          break;
        default:
          return [];
      }
      return [];
    })();

    // For roles other than Admin and Marketing_Manager, require all actions to be completed
    if (userRole !== "Admin" && userRole !== "Marketing_Manager") {
      const allActionsCompleted = areAllActionsCompleted(
        client,
        currentDepartment
      );
      return allActionsCompleted
        ? (baseAllowedStages as PipelineDepartment[])
        : [];
    }

    return baseAllowedStages as PipelineDepartment[];
  };

  const renderClientCard = (client: PipelineClient) => {
    const isAssigned =
      client.assignedSalesPersonId === userId || client.recruiterId === userId;
    const canAct =
      (userRole === "Sales_Executive" &&
        client.currentStage.department === "Sales" &&
        permissions.pipelines[userRole]?.performActions) ||
      (userRole === "Resume_Writer" &&
        client.currentStage.department === "Resume" &&
        permissions.pipelines[userRole]?.performActions) ||
      ((userRole === "Recruiter" || userRole === "Senior_Recruiter") &&
        (client.currentStage.department === "Marketing" ||
          client.currentStage.department === "ReMarketing") &&
        permissions.pipelines[userRole]?.performActions) ||
      (userRole === "Marketing_Manager" &&
        (client.currentStage.department === "Marketing" ||
          client.currentStage.department === "Completed" ||
          client.currentStage.department === "OnHold" ||
          client.currentStage.department === "Backed Out" ||
          client.currentStage.department === "ReMarketing") &&
        permissions.pipelines[userRole]?.performActions) ||
      (userRole === "Admin" && permissions.pipelines[userRole]?.performActions);
    const canMoveToBackedOut =
      (userRole === "Sales_Executive" &&
        client.currentStage.department === "Sales" &&
        permissions.pipelines[userRole]?.moveToBackedOut) ||
      (userRole === "Resume_Writer" &&
        client.currentStage.department === "Resume" &&
        permissions.pipelines[userRole]?.moveToBackedOut) ||
      ((userRole === "Recruiter" || userRole === "Senior_Recruiter") &&
        (client.currentStage.department === "Marketing" ||
          client.currentStage.department === "ReMarketing") &&
        permissions.pipelines[userRole]?.moveToBackedOut) ||
      (userRole === "Marketing_Manager" &&
        (client.currentStage.department === "Marketing" ||
          client.currentStage.department === "Completed" ||
          client.currentStage.department === "OnHold" ||
          client.currentStage.department === "ReMarketing") &&
        permissions.pipelines[userRole]?.moveToBackedOut) ||
      (userRole === "Admin" &&
        permissions.pipelines[userRole]?.moveToBackedOut);

    // Simplified view for Admin, Marketing_Manager, Sales_Executive, but allow action buttons for Marketing_Manager
    const isSimplifiedView = ["Admin", "Sales_Executive"].includes(userRole);
    const showActionButtons =
      userRole === "Marketing_Manager" || !isSimplifiedView;

    return (
      <Card
        key={client.id}
        sx={{
          flex: "0 0 auto", // Prevent card from growing
          width: "100%", // Take full width of the parent container
          maxWidth: isMobile ? "180px" : "230px", // Reduced max width to fit within department box
          height: "fit-content",
          cursor:
            performingAction || stageTransitionLoading
              ? "not-allowed"
              : "pointer",
          "&:hover": {
            boxShadow: performingAction || stageTransitionLoading ? 0 : 3,
          },
          position: "relative",
        }}
        onClick={() => handleClientSelect(client)}
      >
        <CardContent sx={{ p: 1, pb: "8px !important" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: isSimplifiedView ? "0.75rem" : "0.875rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {client.name}
              {isAssigned && isSimplifiedView && (
                <Chip
                  label="My Client"
                  size="small"
                  sx={{
                    ml: 1,
                    bgcolor: "#682A53",
                    color: "white",
                    fontSize: "0.6rem",
                  }}
                />
              )}
            </Typography>
            {canAct && (
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, client.id)}
                sx={{ p: isSimplifiedView ? 0.5 : 1 }}
                disabled={performingAction || stageTransitionLoading}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            )}
          </Box>
          {showActionButtons && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Chip
                  label={client.status}
                  size="small"
                  sx={{
                    mr: 1,
                    bgcolor: getStatusColor(client.status),
                    color: "white",
                    fontSize: "0.75rem",
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                  ID: {client.id}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: "block", fontSize: "0.75rem" }}
              >
                {client.daysInCurrentStage} days in{" "}
                {client.currentStage.department}
              </Typography>
              {client.currentStage.notes && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1, display: "block", fontSize: "0.75rem" }}
                >
                  Last Note: {client.currentStage.notes.split("\n").pop()}
                </Typography>
              )}
              {canAct && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 1,
                    flexWrap: "wrap", // Allow buttons to wrap if necessary
                    alignItems: "center",
                  }}
                >
                  {client.currentStage.department === "Resume" && (
                    <>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(
                            client.id,
                            "Acknowledged",
                            "Resume",
                            userRole
                          );
                        }}
                        sx={{ px: 1, py: 0.5, fontSize: "0.75rem" }}
                        disabled={
                          isActionDisabled(
                            client,
                            "Acknowledged",
                            "Resume",
                            userRole
                          ) ||
                          performingAction ||
                          stageTransitionLoading
                        }
                      >
                        {actionLoading[
                          `${client.id}-Acknowledged-${userRole}`
                        ] ? (
                          <>
                            <CircularProgress size={14} sx={{ mr: 1 }} />
                            Performing
                          </>
                        ) : client.completedActions.includes(
                            `Acknowledged-${userRole}-Resume`
                          ) ? (
                          "Acknowledged"
                        ) : (
                          "Acknowledge"
                        )}
                      </Button>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClientId(client.id);
                          setOpenInitialCallDialog(true);
                        }}
                        sx={{ px: 1, py: 0.5, fontSize: "0.75rem" }}
                        disabled={
                          isActionDisabled(
                            client,
                            "Initial Call Done",
                            "Resume",
                            userRole
                          ) ||
                          performingAction ||
                          stageTransitionLoading
                        }
                      >
                        {actionLoading[
                          `${client.id}-Initial Call Done-${userRole}`
                        ] ? (
                          <>
                            <CircularProgress size={14} sx={{ mr: 1 }} />
                            Performing
                          </>
                        ) : client.completedActions.includes(
                            "Initial Call Done"
                          ) ? (
                          "Call Done"
                        ) : (
                          "Call Completed"
                        )}
                      </Button>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClientId(client.id);
                          setOpenCompleteResumeDialog(true);
                        }}
                        sx={{ px: 1, py: 0.5, fontSize: "0.75rem" }}
                        disabled={
                          isActionDisabled(
                            client,
                            "Resume Completed",
                            "Resume",
                            userRole
                          ) ||
                          performingAction ||
                          stageTransitionLoading
                        }
                      >
                        {actionLoading[
                          `${client.id}-Resume Completed-${userRole}`
                        ] ? (
                          <>
                            <CircularProgress size={14} sx={{ mr: 1 }} />
                            Performing
                          </>
                        ) : client.completedActions.includes(
                            "Resume Completed"
                          ) ? (
                          "Resume Done"
                        ) : (
                          "Complete Resume"
                        )}
                      </Button>
                    </>
                  )}
                  {(client.currentStage.department === "Marketing" ||
                    client.currentStage.department === "ReMarketing") && (
                    <>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(
                            client.id,
                            "Acknowledged",
                            client.currentStage.department,
                            userRole
                          );
                        }}
                        sx={{ px: 1, py: 0.5, fontSize: "0.75rem" }}
                        disabled={
                          isActionDisabled(
                            client,
                            "Acknowledged",
                            client.currentStage.department,
                            userRole
                          ) ||
                          performingAction ||
                          stageTransitionLoading
                        }
                      >
                        {actionLoading[
                          `${client.id}-Acknowledged-${userRole}`
                        ] ? (
                          <>
                            <CircularProgress size={14} sx={{ mr: 1 }} />
                            Performing
                          </>
                        ) : client.completedActions.includes(
                            `Acknowledged-${userRole}-${client.currentStage.department}`
                          ) ? (
                          "Acknowledged"
                        ) : (
                          "Acknowledge"
                        )}
                      </Button>
                      {(userRole === "Marketing_Manager" ||
                        userRole === "Admin") &&
                        permissions.pipelines[userRole]?.assignRecruiter && (
                          <Select
                            size="small"
                            value={getAssignedSeniorRecruiterId(client) || ""}
                            onChange={(e: SelectChangeEvent<number>) => {
                              e.stopPropagation();
                              handleAssignSeniorRecruiter(
                                client.id,
                                e.target.value
                              );
                            }}
                            displayEmpty
                            sx={{
                              minWidth: 100, // Reduced to fit better
                              fontSize: "0.75rem",
                              height: "32px",
                            }}
                            disabled={
                              !permissions.pipelines[userRole]
                                ?.assignRecruiter ||
                              performingAction ||
                              stageTransitionLoading ||
                              actionLoading[
                                `${client.id}-AssignSeniorRecruiter`
                              ] ||
                              !client.completedActions.includes(
                                `Acknowledged-Marketing_Manager-Marketing`
                              )
                            }
                            inputProps={{
                              startAdornment: dropdownLoading[
                                `${client.id}-AssignSeniorRecruiter`
                              ] ? (
                                <CircularProgress size={14} sx={{ mr: 1 }} />
                              ) : null,
                            }}
                          >
                            <SelectMenuItem
                              value=""
                              sx={{ fontSize: "0.75rem" }}
                            >
                              Select Senior Recruiter
                            </SelectMenuItem>
                            {recruiters.map((recruiter) => (
                              <SelectMenuItem
                                key={recruiter.employeeId}
                                value={recruiter.employeeId}
                                sx={{ fontSize: "0.75rem" }}
                              >
                                {recruiter.fullName}
                              </SelectMenuItem>
                            ))}
                          </Select>
                        )}
                      {userRole === "Senior_Recruiter" &&
                        permissions.pipelines[userRole]?.assignRecruiter && (
                          <Select
                            size="small"
                            value={client.recruiterId || ""}
                            onChange={(e: SelectChangeEvent<number>) => {
                              e.stopPropagation();
                              handleAssignRecruiter(client.id, e.target.value);
                            }}
                            displayEmpty
                            sx={{
                              minWidth: 100, // Reduced to fit better
                              fontSize: "0.75rem",
                              height: "32px",
                            }}
                            disabled={
                              !permissions.pipelines[userRole]
                                ?.assignRecruiter ||
                              performingAction ||
                              stageTransitionLoading ||
                              actionLoading[`${client.id}-AssignRecruiter`] ||
                              !client.completedActions.includes(
                                `Acknowledged-Senior_Recruiter-Marketing`
                              ) ||
                              !hasSeniorRecruiterAssigned(client)
                            }
                            inputProps={{
                              startAdornment: dropdownLoading[
                                `${client.id}-AssignRecruiter`
                              ] ? (
                                <CircularProgress size={14} sx={{ mr: 1 }} />
                              ) : null,
                            }}
                          >
                            <SelectMenuItem
                              value=""
                              sx={{ fontSize: "0.75rem" }}
                            >
                              Select Recruiter
                            </SelectMenuItem>
                            {recruiters.map((recruiter) => (
                              <SelectMenuItem
                                key={recruiter.employeeId}
                                value={recruiter.employeeId}
                                sx={{ fontSize: "0.75rem" }}
                              >
                                {recruiter.fullName}
                              </SelectMenuItem>
                            ))}
                          </Select>
                        )}
                    </>
                  )}
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ color: "#682A53", fontWeight: 600 }}>
          {userRole === "Admin" || userRole === "Marketing_Manager"
            ? "Pipeline Dashboard"
            : "My Pipeline"}
        </Typography>
      </Box>
      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "white",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, ID, status, tech stack, or department..."
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={performingAction || stageTransitionLoading}
          InputProps={{
            startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} />,
            endAdornment: searchQuery ? (
              <IconButton
                size="small"
                onClick={() => setSearchQuery("")}
                disabled={performingAction || stageTransitionLoading}
              >
                <Clear fontSize="small" />
              </IconButton>
            ) : null,
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Paper>
      {userRole === "Admin" ||
      userRole === "Sales_Executive" ||
      userRole === "Marketing_Manager" ? (
        // For Admin, Marketing_Manager, Sales_Executive: All columns in a single row with non-scrollable client cards
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            overflowX: "auto",
            minWidth: `${departments.length * 250}px`,
            gap: 2,
            pb: 2,
            flexGrow: 1,
            "&::-webkit-scrollbar": {
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.grey[400],
              borderRadius: "4px",
            },
            pointerEvents:
              performingAction || stageTransitionLoading ? "none" : "auto",
          }}
        >
          {departments.map((dept, idx) => (
            <Box
              key={dept}
              sx={{
                flex: "0 0 auto",
                width: isMobile ? "200px" : "250px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  bgcolor: getColumnColor(dept),
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: getDepartmentTextColor(dept),
                      fontSize: isMobile ? "0.9rem" : "1rem",
                    }}
                  >
                    {dept}
                  </Typography>
                  <Chip label={groupedClients[idx].length} size="small" />
                </Box>
                <Box
                  sx={{
                    flexGrow: 1,
                    minHeight: "200px",
                    display: "flex",
                    flexDirection: "column", // Stack cards vertically
                    gap: 1.5,
                    overflow: "hidden", // Prevent any overflow
                    width: "100%", // Ensure the box takes full width of the parent
                    paddingBottom: 1,
                  }}
                >
                  {groupedClients[idx].map(renderClientCard)}
                  {groupedClients[idx].length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", mt: 2 }}
                    >
                      No clients in this stage
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      ) : (
        // For Senior_Recruiter, Recruiter, Resume_Writer: Show cards in a responsive horizontal row
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          <Grid item xs={12} sx={{ height: "100%" }}>
            <Paper
              sx={{
                p: 2,
                bgcolor: getColumnColor(
                  userRole === "Resume_Writer" ? "Resume" : "Marketing"
                ),
                borderRadius: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: getDepartmentTextColor(
                      userRole === "Resume_Writer" ? "Resume" : "Marketing"
                    ),
                  }}
                >
                  {userRole === "Resume_Writer"
                    ? "Resume Stage"
                    : "Marketing Stage"}
                </Typography>
                <Chip label={filteredClients.length} size="small" />
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                  minHeight: "200px",
                }}
              >
                {filteredClients.map(renderClientCard)}
                {filteredClients.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", mt: 2, width: "100%" }}
                  >
                    No clients in this stage
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem disabled>Move to stage:</MenuItem>
        {getAllowedStages(
          clients.find((c) => c.id === selectedClientId)?.currentStage
            .department || "Sales",
          clients.find((c) => c.id === selectedClientId)!
        ).map((dept) => (
          <MenuItem
            key={dept}
            onClick={() => handleMoveToStage(selectedClientId!, dept)}
            disabled={
              (dept === "Resume" &&
                !permissions.pipelines[userRole]?.moveToResume) ||
              (dept === "Marketing" &&
                !permissions.pipelines[userRole]?.moveToMarketing) ||
              (dept === "Completed" &&
                !permissions.pipelines[userRole]?.moveToCompleted) ||
              (dept === "Backed Out" &&
                !permissions.pipelines[userRole]?.moveToBackedOut) ||
              (dept === "ReMarketing" &&
                !permissions.pipelines[userRole]?.moveToRemarketing) ||
              (dept === "OnHold" &&
                !permissions.pipelines[userRole]?.moveToOnHold) ||
              performingAction ||
              stageTransitionLoading
            }
          >
            <ArrowForward
              fontSize="small"
              sx={{ mr: 1, color: getDepartmentTextColor(dept) }}
            />
            {dept}
          </MenuItem>
        ))}
      </Menu>
      {/* Dialog for Initial Call Done */}
      <Dialog
        open={openInitialCallDialog}
        onClose={() => setOpenInitialCallDialog(false)}
        disableEscapeKeyDown={performingAction || stageTransitionLoading}
      >
        <DialogTitle>Initial Call Done Notes</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Discussion Points (Required)"
                value={initialCallNotes}
                onChange={(e) => setInitialCallNotes(e.target.value)}
                multiline
                rows={4}
                sx={{ mt: 2 }}
                disabled={performingAction || stageTransitionLoading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenInitialCallDialog(false);
              setInitialCallNotes("");
              setSelectedClientId(null);
            }}
            disabled={performingAction || stageTransitionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleInitialCallSubmit(selectedClientId!, "Resume")}
            disabled={
              !initialCallNotes.trim() ||
              performingAction ||
              stageTransitionLoading
            }
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog for Complete Resume */}
      <Dialog
        open={openCompleteResumeDialog}
        onClose={() => setOpenCompleteResumeDialog(false)}
        disableEscapeKeyDown={performingAction || stageTransitionLoading}
      >
        <DialogTitle>Complete Resume</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ width: "100%" }}
                  disabled={performingAction || stageTransitionLoading}
                >
                  Upload Resume (Required)
                  <VisuallyHiddenInput
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCompleteResumeFileChange}
                  />
                </Button>
                {completeResumeFileName && (
                  <Typography variant="body2" color="textSecondary">
                    Selected: {completeResumeFileName}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                value={completeResumeNotes}
                onChange={(e) => setCompleteResumeNotes(e.target.value)}
                multiline
                rows={4}
                sx={{ mb: 2 }}
                disabled={performingAction || stageTransitionLoading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenCompleteResumeDialog(false);
              setCompleteResumeNotes("");
              setCompleteResumeFile(null);
              setCompleteResumeFileName(null);
              setSelectedClientId(null);
            }}
            disabled={performingAction || stageTransitionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              handleCompleteResumeSubmit(selectedClientId!, "Resume")
            }
            disabled={
              !completeResumeFile || performingAction || stageTransitionLoading
            }
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog for Upload Resume/Checklist */}
      <Dialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        disableEscapeKeyDown={performingAction || stageTransitionLoading}
      >
        <DialogTitle>Upload Resume/Checklist for Resume Stage</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ width: "100%" }}
                  disabled={performingAction || stageTransitionLoading}
                >
                  Upload Resume/Checklist (Required)
                  <VisuallyHiddenInput
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeFileChange}
                  />
                </Button>
                {resumeFileName && (
                  <Typography variant="body2" color="textSecondary">
                    Selected: {resumeFileName}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                value={resumeNotes}
                onChange={(e) => setResumeNotes(e.target.value)}
                multiline
                rows={4}
                sx={{ mb: 2 }}
                disabled={performingAction || stageTransitionLoading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenUploadDialog(false);
              setResumeFile(null);
              setResumeFileName(null);
              setResumeNotes("");
              setUploadStage(null);
              setSelectedClientId(null);
            }}
            disabled={performingAction || stageTransitionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadDocuments}
            disabled={!resumeFile || performingAction || stageTransitionLoading}
          >
            Upload and Move
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog for Upload Cover Letter and Updated Resume */}
      <Dialog
        open={openMarketingUploadDialog}
        onClose={() => setOpenMarketingUploadDialog(false)}
        disableEscapeKeyDown={performingAction || stageTransitionLoading}
      >
        <DialogTitle>
          Upload Cover Letter and Updated Resume for Marketing Stage
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ width: "100%" }}
                  disabled={performingAction || stageTransitionLoading}
                >
                  Upload Cover Letter (Required)
                  <VisuallyHiddenInput
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCoverLetterFileChange}
                  />
                </Button>
                {coverLetterFileName && (
                  <Typography variant="body2" color="textSecondary">
                    Selected: {coverLetterFileName}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ width: "100%" }}
                  disabled={performingAction || stageTransitionLoading}
                >
                  Upload Updated Resume (Required)
                  <VisuallyHiddenInput
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleUpdatedResumeFileChange}
                  />
                </Button>
                {updatedResumeFileName && (
                  <Typography variant="body2" color="textSecondary">
                    Selected: {updatedResumeFileName}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                value={marketingNotes}
                onChange={(e) => setMarketingNotes(e.target.value)}
                multiline
                rows={4}
                sx={{ mb: 2 }}
                disabled={performingAction || stageTransitionLoading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenMarketingUploadDialog(false);
              setCoverLetterFile(null);
              setCoverLetterFileName(null);
              setUpdatedResumeFile(null);
              setUpdatedResumeFileName(null);
              setMarketingNotes("");
              setUploadStage(null);
              setSelectedClientId(null);
            }}
            disabled={performingAction || stageTransitionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMarketingUploadDocuments}
            disabled={
              !coverLetterFile ||
              !updatedResumeFile ||
              performingAction ||
              stageTransitionLoading
            }
          >
            Upload and Move
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog for Upload Offer Letter */}
      <Dialog
        open={openCompletedUploadDialog}
        onClose={() => setOpenCompletedUploadDialog(false)}
        disableEscapeKeyDown={performingAction || stageTransitionLoading}
      >
        <DialogTitle>Upload Offer Letter for Completed Stage</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ width: "100%" }}
                  disabled={performingAction || stageTransitionLoading}
                >
                  Upload Offer Letter (Required)
                  <VisuallyHiddenInput
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleOfferLetterFileChange}
                  />
                </Button>
                {offerLetterFileName && (
                  <Typography variant="body2" color="textSecondary">
                    Selected: {offerLetterFileName}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Required)"
                value={completedNotes}
                onChange={(e) => setCompletedNotes(e.target.value)}
                multiline
                rows={4}
                sx={{ mb: 2 }}
                disabled={performingAction || stageTransitionLoading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenCompletedUploadDialog(false);
              setOfferLetterFile(null);
              setOfferLetterFileName(null);
              setCompletedNotes("");
              setUploadStage(null);
              setSelectedClientId(null);
            }}
            disabled={performingAction || stageTransitionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCompletedUploadDocuments}
            disabled={
              !offerLetterFile ||
              !completedNotes.trim() ||
              performingAction ||
              stageTransitionLoading
            }
          >
            Upload and Move
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog for Back Out */}
      <Dialog
        open={openBackOutDialog}
        onClose={() => setOpenBackOutDialog(false)}
        disableEscapeKeyDown={performingAction || stageTransitionLoading}
      >
        <DialogTitle>Back Out Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Backing Out (Required)"
                value={backOutReason}
                onChange={(e) => setBackOutReason(e.target.value)}
                multiline
                rows={4}
                sx={{ mb: 2 }}
                disabled={performingAction || stageTransitionLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Required)"
                value={backOutNotes}
                onChange={(e) => setBackOutNotes(e.target.value)}
                multiline
                rows={4}
                sx={{ mb: 2 }}
                disabled={performingAction || stageTransitionLoading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenBackOutDialog(false);
              setBackOutReason("");
              setBackOutNotes("");
              setUploadStage(null);
              setSelectedClientId(null);
            }}
            disabled={performingAction || stageTransitionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBackOutSubmit}
            disabled={
              !backOutReason.trim() ||
              !backOutNotes.trim() ||
              performingAction ||
              stageTransitionLoading
            }
          >
            Confirm Back Out
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog for Generic Notes */}
      <Dialog
        open={openNotesDialog}
        onClose={() => setOpenNotesDialog(false)}
        disableEscapeKeyDown={performingAction || stageTransitionLoading}
      >
        <DialogTitle>Notes for Moving to {targetDepartment}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Required)"
                value={transitionNotes}
                onChange={(e) => setTransitionNotes(e.target.value)}
                multiline
                rows={4}
                sx={{ mt: 2 }}
                disabled={performingAction || stageTransitionLoading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenNotesDialog(false);
              setTransitionNotes("");
              setUploadStage(null);
              setTargetDepartment(null);
              setSelectedClientId(null);
            }}
            disabled={performingAction || stageTransitionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleNotesSubmit}
            disabled={
              !transitionNotes.trim() ||
              performingAction ||
              stageTransitionLoading
            }
          >
            Submit and Move
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
