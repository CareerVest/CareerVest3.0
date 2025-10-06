import { Client, ClientStatus, UserRole } from "../../types/pipelines/pipeline";
import { areAllActionsCompleted } from "./constants";

export const canMoveClient = (client: Client, userRole: UserRole): boolean => {
  // If client is blocked, no one can move them (except admins can unblock first)
  if (client.isBlocked) {
    return false;
  }

  switch (userRole) {
    case "Admin":
      // Admin can move clients regardless of action completion, but with restrictions for placed stage
      if (client.status === "Placed") {
        // From placed stage, admin can only move to remarketing
        return true; // Allow movement, but getAvailableStages will restrict destinations
      }
      return true;
    case "Marketing_Manager":
      // Marketing manager can move clients regardless of action completion, but NOT from sales or placed
      if (client.status === "Sales" || client.status === "Placed") {
        return false;
      }
      // Allow movement from marketing, remarketing, on-hold, and backed-out stages
      return client.status === "Marketing" || client.status === "Remarketing" || client.status === "OnHold" || client.status === "BackedOut";
    case "Sales_Executive":
      // Sales people can move clients from sales stage
      return client.status === "Sales";
    case "Resume_Writer":
      // Resume people can only move if all actions are completed
      if (!areAllActionsCompleted(client, client.status, userRole)) {
        return false;
      }
      return client.status === "Resume";
    case "Senior_Recruiter":
    case "Recruiter":
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
    "Sales",
    "Resume",
    "Marketing",
    "Placed",
    "BackedOut",
    "Remarketing",
    "OnHold",
  ];

  // Admin can move to any stage except current, but with restrictions for placed and completed stages
  if (userRole === "Admin") {
    if (currentStatus === "Placed") {
      // From placed stage, admin can only move to remarketing or completed
      return ["Remarketing"];
    }
    if (currentStatus === "BackedOut") {
      // From backed out stage, admin can only move to remarketing
      return ["Remarketing"];
    }
    return allStages.filter((stage) => stage !== currentStatus);
  }

  // Marketing Manager can only move clients from marketing to specific stages
  if (userRole === "Marketing_Manager") {
    if (currentStatus === "Marketing") {
      return ["Placed", "BackedOut", "OnHold"];
    }
    if (currentStatus === "Remarketing") {
      return ["Placed", "BackedOut", "OnHold"];
    }
    if (currentStatus === "BackedOut") {
      // From backed out stage, marketing manager can only move to remarketing
      return ["Remarketing"];
    }
    if (currentStatus === "OnHold") {
      // From on hold stage, marketing manager can move to remarketing, marketing, or backed out
      return ["Remarketing", "Marketing", "BackedOut"];
    }
    // For other stages, marketing manager has limited access
    return [];
  }

  // For placed stage, only admin can move clients (handled in switch statement)

  const moves: ClientStatus[] = [];

  switch (currentStatus) {
    case "Sales":
      if (userRole === "Sales_Executive") {
        // Sales people can only move to resume, backed-out, or on-hold
        moves.push("Resume", "BackedOut", "OnHold");
      }
      break;
    case "Resume":
      if (userRole === "Resume_Writer") {
        // Resume people can only move to marketing, backed-out, or on-hold
        moves.push("Marketing", "BackedOut", "OnHold");
      }
      break;
    case "Marketing":
      // Marketing Manager access handled above
      break;

    case "BackedOut":
      // Only admin/marketing-manager can move from backed-out
      break;
    case "OnHold":
      // Only admin/marketing-manager can move from on-hold
      break;
    case "Remarketing":
      // Marketing Manager access handled above
      break;
  }

  return moves;
};

export const calculateDepartmentTime = (
  client: Client
): {
  department: string;
  days: number;
  current: boolean;
  businessDays: number;
}[] => {
  const departmentHistory = client.departmentHistory || [];
  const currentDate = new Date();

  // If no history, calculate from current stage start date to current
  if (departmentHistory.length === 0) {
    // Use current stage start date, fallback to createdAt only if currentStage is not available
    const stageStartDate = client.currentStage?.startDate || client.createdAt;
    const startDate = new Date(stageStartDate);

    // Use Math.floor instead of Math.ceil to avoid rounding up partial days
    // Also normalize dates to start of day to avoid time zone issues
    const startOfStage = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const startOfCurrent = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const daysDiff = Math.floor(
      (startOfCurrent.getTime() - startOfStage.getTime()) / (1000 * 3600 * 24)
    );

    // Calculate business days
    const businessDays = calculateBusinessDays(startOfStage, startOfCurrent);

    return [
      {
        department: client.status
          .replace("-", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        days: Math.max(0, daysDiff), // Ensure we don't show negative days
        businessDays: Math.max(0, businessDays),
        current: true,
      },
    ];
  }

  return departmentHistory.map((history, index) => {
    const startDate = new Date(history.startDate);
    const endDate = history.endDate ? new Date(history.endDate) : currentDate;

    // Normalize dates to start of day to avoid time zone issues
    const startOfStart = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const startOfEnd = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    const daysDiff = Math.floor(
      (startOfEnd.getTime() - startOfStart.getTime()) / (1000 * 3600 * 24)
    );

    // Calculate business days
    const businessDays = calculateBusinessDays(startOfStart, startOfEnd);

    return {
      department: history.department
        .replace("-", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      days: Math.max(0, daysDiff), // Ensure we don't show negative days
      businessDays: Math.max(0, businessDays),
      current: !history.endDate,
    };
  });
};

// Helper function to calculate business days
const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
  let businessDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
};

export const shouldResetActions = (
  fromStage: ClientStatus,
  toStage: ClientStatus
): boolean => {
  // Define the normal forward progression
  const stageOrder = ["Sales", "Resume", "Marketing", "Placed"];

  const fromIndex = stageOrder.indexOf(fromStage);
  const toIndex = stageOrder.indexOf(toStage);

  // If moving backwards (to earlier stage), reset actions
  if (fromIndex > toIndex) {
    return true;
  }

  // Special cases: moving to special states doesn't reset actions
  if (
    toStage === "BackedOut" ||
    toStage === "OnHold" ||
    toStage === "Remarketing"
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
    case "Sales":
      return ["RateCandidate", "Upload Required Docs - Sales"];
    case "Resume":
      return [
        "Acknowledged",
        "Initial Call Done",
        "Resume Completed",
        "Upload Required Docs - Resume",
      ];
    case "Marketing":
      return ["Acknowledged-Marketing"];
    case "Remarketing":
      return ["Acknowledged-Remarketing", "AssignRecruiter"];
    default:
      return [];
  }
};
