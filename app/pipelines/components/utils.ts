import { Client, ClientStatus, UserRole } from "../../types/pipelines/pipeline";
import { areAllActionsCompleted } from "./constants";

export const canMoveClient = (client: Client, userRole: UserRole): boolean => {
  switch (userRole) {
    case "admin":
      // Admin can move clients regardless of action completion, but with restrictions for placed stage
      if (client.status === "placed") {
        // From placed stage, admin can only move to remarketing
        return true; // Allow movement, but getAvailableStages will restrict destinations
      }
      return true;
    case "marketing-manager":
      // Marketing manager can move clients regardless of action completion, but NOT from sales or placed
      if (client.status === "sales" || client.status === "placed") {
        return false;
      }
      // Only allow movement from marketing and remarketing stages
      return client.status === "marketing" || client.status === "remarketing";
    case "sales-executive":
      // Sales people can move clients from sales stage
      return client.status === "sales";
    case "resume-writer":
      // Resume people can only move if all actions are completed
      if (!areAllActionsCompleted(client, client.status, userRole)) {
        return false;
      }
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
    "placed",
    "backed-out",
    "remarketing",
    "on-hold",
  ];

  // Admin can move to any stage except current, but with restrictions for placed stage
  if (userRole === "admin") {
    if (currentStatus === "placed") {
      // From placed stage, admin can only move to remarketing
      return ["remarketing"];
    }
    return allStages.filter((stage) => stage !== currentStatus);
  }

  // Marketing Manager can only move clients from marketing to specific stages
  if (userRole === "marketing-manager") {
    if (currentStatus === "marketing") {
      return ["placed", "backed-out", "on-hold"];
    }
    if (currentStatus === "remarketing") {
      return ["placed", "backed-out", "on-hold"];
    }
    // For other stages, marketing manager has limited access
    return [];
  }

  // For placed stage, only admin can move clients
  if (currentStatus === "placed") {
    return [];
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
      // Marketing Manager access handled above
      break;
    case "placed":
      // Only admin can move from placed, and only to remarketing
      if (userRole === "admin") {
        moves.push("remarketing");
      }
      break;
    case "backed-out":
      // Only admin/marketing-manager can move from backed-out
      break;
    case "on-hold":
      // Only admin/marketing-manager can move from on-hold
      break;
    case "remarketing":
      // Marketing Manager access handled above
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

export const shouldResetActions = (
  fromStage: ClientStatus,
  toStage: ClientStatus
): boolean => {
  // Define the normal forward progression
  const stageOrder = ["sales", "resume", "marketing", "placed"];

  const fromIndex = stageOrder.indexOf(fromStage);
  const toIndex = stageOrder.indexOf(toStage);

  // If moving backwards (to earlier stage), reset actions
  if (fromIndex > toIndex) {
    return true;
  }

  // Special cases: moving to special states doesn't reset actions
  if (
    toStage === "backed-out" ||
    toStage === "on-hold" ||
    toStage === "remarketing"
  ) {
    return false;
  }

  return false;
};

export const getActionsToReset = (
  fromStage: ClientStatus,
  toStage: ClientStatus
): string[] => {
  if (!shouldResetActions(fromStage, toStage)) {
    return [];
  }

  // Return actions that should be reset based on the target stage
  switch (toStage) {
    case "sales":
      return ["RateCandidate", "Upload Required Docs"];
    case "resume":
      return [
        "Acknowledged-Resume_Writer-Resume",
        "Initial Call Done",
        "Resume Completed",
        "Upload Required Docs",
      ];
    case "marketing":
      return ["Acknowledged-Marketing_Manager-Marketing"];
    case "remarketing":
      return ["Acknowledged-Marketing_Manager-Remarketing", "AssignRecruiter"];
    default:
      return [];
  }
};
