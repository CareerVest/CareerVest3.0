import { Client, ClientStatus, UserRole } from "../../types/pipelines/pipeline";
import { areAllActionsCompleted } from "./constants";

export const canMoveClient = (client: Client, userRole: UserRole): boolean => {
  // Check if all actions for current stage are completed (except for admin)
  if (userRole !== "admin" && userRole !== "marketing-manager") {
    if (!areAllActionsCompleted(client, client.status, userRole)) {
      return false;
    }
  }

  switch (userRole) {
    case "admin":
    case "marketing-manager":
      return true;
    case "sales-executive":
      return client.status === "sales";
    case "resume-writer":
      return client.status === "resume";
    case "senior-recruiter":
    case "recruiter":
      // Senior recruiters and recruiters have no access to marketing stage
      return false;
    default:
      return false;
  }
};

export const getAvailableStages = (
  currentStatus: ClientStatus,
  userRole: UserRole
): ClientStatus[] => {
  const allStages: ClientStatus[] = [
    "sales",
    "resume",
    "marketing",
    "completed",
    "backed-out",
    "remarketing",
    "on-hold",
  ];

  // Admin can move to any stage except current
  if (userRole === "admin" || userRole === "marketing-manager") {
    return allStages.filter((stage) => stage !== currentStatus);
  }

  const moves: ClientStatus[] = [];

  switch (currentStatus) {
    case "sales":
      if (userRole === "sales-executive") {
        // Sales people can only move to resume, backed-out, or on-hold
        moves.push("resume", "backed-out", "on-hold");
      }
      break;
    case "resume":
      if (userRole === "resume-writer") {
        // Resume people can only move to marketing, backed-out, or on-hold
        moves.push("marketing", "backed-out", "on-hold");
      }
      break;
    case "marketing":
      // Only Marketing Manager can move clients in marketing stage
      if (userRole === "marketing-manager") {
        moves.push("completed", "backed-out", "remarketing", "on-hold");
      }
      break;
    case "completed":
      // Only admin/marketing-manager can move from completed
      break;
    case "backed-out":
      // Only admin/marketing-manager can move from backed-out
      break;
    case "on-hold":
      // Only admin/marketing-manager can move from on-hold
      break;
    case "remarketing":
      // Only Marketing Manager can move clients in remarketing stage
      if (userRole === "marketing-manager") {
        moves.push("completed", "backed-out", "on-hold");
      }
      break;
  }

  return moves;
};

export const calculateDepartmentTime = (
  client: Client
): { department: string; days: number; current: boolean }[] => {
  const departmentHistory = client.departmentHistory || [];
  const currentDate = new Date();

  // If no history, calculate from creation date to current
  if (departmentHistory.length === 0) {
    const createdDate = new Date(client.createdAt);
    const daysDiff = Math.ceil(
      (currentDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24)
    );
    return [
      {
        department: client.status
          .replace("-", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        days: daysDiff,
        current: true,
      },
    ];
  }

  return departmentHistory.map((history, index) => {
    const startDate = new Date(history.startDate);
    const endDate = history.endDate ? new Date(history.endDate) : currentDate;
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );

    return {
      department: history.department
        .replace("-", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      days: daysDiff,
      current: !history.endDate,
    };
  });
};
