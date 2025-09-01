import {
  User,
  FileText,
  Target,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Pause,
} from "lucide-react";
import {
  Client,
  ClientStatus,
  ActionType,
  FileRequirement,
  UserRole,
} from "../../types/pipelines/pipeline";

export const stageConfig = {
  sales: {
    title: "Sales",
    icon: User,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    darkBgColor: "dark:bg-blue-950",
    darkBorderColor: "dark:border-blue-800",
    darkTextColor: "dark:text-blue-300",
  },
  resume: {
    title: "Resume",
    icon: FileText,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    darkBgColor: "dark:bg-orange-950",
    darkBorderColor: "dark:border-orange-800",
    darkTextColor: "dark:text-orange-300",
  },
  marketing: {
    title: "Marketing",
    icon: Target,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    darkBgColor: "dark:bg-green-950",
    darkBorderColor: "dark:border-green-800",
    darkTextColor: "dark:text-green-300",
  },
  placed: {
    title: "Placed",
    icon: CheckCircle2,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    darkBgColor: "dark:bg-purple-950",
    darkBorderColor: "dark:border-purple-800",
    darkTextColor: "dark:text-purple-300",
  },
  "backed-out": {
    title: "Backed Out",
    icon: AlertTriangle,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    darkBgColor: "dark:bg-red-950",
    darkBorderColor: "dark:border-red-800",
    darkTextColor: "dark:text-red-300",
  },
  remarketing: {
    title: "ReMarketing",
    icon: RotateCcw,
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    darkBgColor: "dark:bg-yellow-950",
    darkBorderColor: "dark:border-yellow-800",
    darkTextColor: "dark:text-yellow-300",
  },
  "on-hold": {
    title: "On Hold",
    icon: Pause,
    color: "bg-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-700",
    darkBgColor: "dark:bg-gray-950",
    darkBorderColor: "dark:border-gray-800",
    darkTextColor: "dark:text-gray-300",
  },
};

export const mainStages: ClientStatus[] = [
  "sales",
  "resume",
  "marketing",
  "remarketing",
];
export const specialStates: ClientStatus[] = [
  "placed",
  "backed-out",
  "on-hold",
];

// Action configuration for each stage
export const getRequiredActions = (
  department: ClientStatus,
  userRole: string
): string[] => {
  switch (department) {
    case "sales":
      return ["RateCandidate", "Upload Required Docs - Sales"];
    case "resume":
      return [
        `Acknowledged-${userRole}-Resume`,
        "Initial Call Done",
        "Resume Completed",
        "Upload Required Docs - Resume",
      ];
    case "marketing":
      const userRoleLower = userRole.toLowerCase();
      if (userRoleLower === "admin") {
        // Admin can perform all actions
        return [`Acknowledged-Admin-Marketing`, "AssignRecruiter"];
      }
      if (
        userRoleLower === "marketing_manager" ||
        userRoleLower === "marketing-manager"
      ) {
        // Actions must be completed in sequence:
        // 1. Acknowledged-Marketing_Manager-Marketing (required first)
        // 2. AssignRecruiter (always required for action history)
        return [`Acknowledged-Marketing_Manager-Marketing`, "AssignRecruiter"];
      }
      // Senior recruiters and recruiters can view marketing stage but have limited actions
      if (
        userRoleLower === "senior_recruiter" ||
        userRoleLower === "senior-recruiter" ||
        userRoleLower === "recruiter"
      ) {
        // They can see the stage but only Marketing Manager can perform actions
        return [];
      }
      return [];
    case "remarketing":
      if (userRole === "Marketing_Manager") {
        // Actions must be completed in sequence:
        // 1. Acknowledged-Marketing_Manager-Remarketing (required first)
        // 2. AssignRecruiter (always required for action history)
        return [
          `Acknowledged-Marketing_Manager-Remarketing`,
          "AssignRecruiter",
        ];
      }
      // Senior recruiters and recruiters have no actions in remarketing
      return [];
    default:
      return [];
  }
};

// Check if all required actions are completed for a client
export const areAllActionsCompleted = (
  client: Client,
  department: ClientStatus,
  userRole: string
): boolean => {
  const requiredActions = getRequiredActions(department, userRole);
  return requiredActions.every((action) =>
    client.completedActions.includes(action)
  );
};

// Determine if an action is disabled based on its prerequisites
export const isActionDisabled = (
  client: Client,
  action: string,
  department: ClientStatus,
  role: string
): boolean => {
  const compositeAction =
    action === "Acknowledged" ? `${action}-${role}-${department}` : action;
  if (client.completedActions.includes(compositeAction)) {
    return true; // Action already completed
  }

  if (department === "resume") {
    if (action === "Initial Call Done") {
      return !client.completedActions.includes(`Acknowledged-${role}-Resume`);
    }
    if (action === "Resume Completed") {
      return !client.completedActions.includes("Initial Call Done");
    }
  }

  if (department === "sales") {
    if (action === "Upload Required Docs - Sales") {
      return !client.completedActions.includes("RateCandidate");
    }
  }

  if (department === "resume") {
    if (action === "Upload Required Docs - Resume") {
      // Upload Required Docs - Resume requires all other resume actions to be completed first
      const requiredActions = [
        `Acknowledged-${role}-Resume`,
        "Initial Call Done",
        "Resume Completed",
      ];
      return !requiredActions.every((action) =>
        client.completedActions.includes(action)
      );
    }
  }

  // Marketing stage prerequisites
  if (department === "marketing") {
    if (action === "AssignRecruiter") {
      // AssignRecruiter requires acknowledgment to be completed first
      // If client already has a recruiter assigned, AssignRecruiter should be considered completed
      if (client.assignedRecruiterID) {
        return true; // Disable AssignRecruiter (mark as completed) if recruiter exists
      }

      // Check for acknowledgment from any role that can acknowledge in marketing
      const hasAcknowledgment = client.completedActions.some(
        (completedAction) =>
          completedAction.startsWith("Acknowledged-") &&
          completedAction.endsWith("-Marketing")
      );

      return !hasAcknowledgment;
    }
    if (action === "ChangeRecruiter") {
      // ChangeRecruiter requires acknowledgment to be completed first
      // AND client must have an assigned recruiter
      if (!client.assignedRecruiterID) {
        return true; // Disable ChangeRecruiter if no recruiter assigned
      }

      // Check for acknowledgment from any role that can acknowledge in marketing
      const hasAcknowledgment = client.completedActions.some(
        (completedAction) =>
          completedAction.startsWith("Acknowledged-") &&
          completedAction.endsWith("-Marketing")
      );

      return !hasAcknowledgment;
    }
    if (role === "Senior_Recruiter" && action === "Acknowledged") {
      // Senior Recruiter acknowledgment requires Marketing Manager acknowledgment first
      const hasMarketingManagerAcknowledgment = client.completedActions.some(
        (completedAction) =>
          completedAction.startsWith("Acknowledged-") &&
          (completedAction.includes("Marketing_Manager") ||
            completedAction.includes("marketing-manager")) &&
          completedAction.endsWith("-Marketing")
      );
      return !hasMarketingManagerAcknowledgment;
    }
    if (role === "Recruiter" && action === "Acknowledged") {
      // Recruiter acknowledgment requires Senior Recruiter acknowledgment first
      const hasSeniorRecruiterAcknowledgment = client.completedActions.some(
        (completedAction) =>
          completedAction.startsWith("Acknowledged-") &&
          (completedAction.includes("Senior_Recruiter") ||
            completedAction.includes("senior-recruiter")) &&
          completedAction.endsWith("-Marketing")
      );
      return !hasSeniorRecruiterAcknowledgment;
    }
  }

  if (
    department === "marketing" &&
    role === "Senior_Recruiter" &&
    action === "Acknowledged"
  ) {
    return !client.completedActions.includes(
      `Acknowledged-Marketing_Manager-Marketing`
    );
  }

  if (
    department === "marketing" &&
    role === "Recruiter" &&
    action === "Acknowledged"
  ) {
    return !client.completedActions.includes(
      `Acknowledged-Senior_Recruiter-Marketing`
    );
  }

  // Remarketing stage prerequisites
  if (department === "remarketing") {
    if (action === "AssignRecruiter") {
      // AssignRecruiter requires Acknowledged-Marketing_Manager-Remarketing to be completed first
      // If client already has a recruiter assigned, AssignRecruiter should be considered completed
      if (client.assignedRecruiterID) {
        return true; // Disable AssignRecruiter (mark as completed) if recruiter exists
      }
      return !client.completedActions.includes(
        `Acknowledged-Marketing_Manager-Remarketing`
      );
    }
    if (action === "ChangeRecruiter") {
      // ChangeRecruiter requires Acknowledged-Marketing_Manager-Remarketing to be completed first
      // AND client must have an assigned recruiter
      if (!client.assignedRecruiterID) {
        return true; // Disable ChangeRecruiter if no recruiter assigned
      }
      return !client.completedActions.includes(
        `Acknowledged-Marketing_Manager-Remarketing`
      );
    }
    if (role === "Senior_Recruiter" && action === "Acknowledged") {
      return !client.completedActions.includes(
        `Acknowledged-Marketing_Manager-Remarketing`
      );
    }
    if (role === "Recruiter" && action === "Acknowledged") {
      return !client.completedActions.includes(
        `Acknowledged-Marketing_Manager-Remarketing`
      );
    }
  }

  if (
    department === "remarketing" &&
    role === "Senior_Recruiter" &&
    action === "Acknowledged"
  ) {
    return !client.completedActions.includes(
      `Acknowledged-Marketing_Manager-Remarketing`
    );
  }

  if (
    department === "remarketing" &&
    role === "Recruiter" &&
    action === "Acknowledged"
  ) {
    return !client.completedActions.includes(
      `Acknowledged-Senior_Recruiter-Remarketing`
    );
  }

  return false; // No prerequisites for other actions
};

// Get prerequisite information for an action
export const getActionPrerequisites = (
  action: string,
  department: ClientStatus,
  role: string
): string[] => {
  const prerequisites: string[] = [];

  if (department === "marketing") {
    if (action === "AssignRecruiter") {
      prerequisites.push("Acknowledged-Marketing_Manager-Marketing");
    }
    if (action === "ChangeRecruiter") {
      prerequisites.push("Acknowledged-Marketing_Manager-Marketing");
    }
  }

  if (department === "remarketing") {
    if (action === "AssignRecruiter") {
      prerequisites.push("Acknowledged-Marketing_Manager-Remarketing");
    }
    if (action === "ChangeRecruiter") {
      prerequisites.push("Acknowledged-Marketing_Manager-Remarketing");
    }
  }

  if (department === "resume") {
    if (action === "Initial Call Done") {
      prerequisites.push(`Acknowledged-${role}-Resume`);
    }
    if (action === "Resume Completed") {
      prerequisites.push("Initial Call Done");
    }
  }

  if (department === "sales") {
    if (action === "Upload Required Docs - Sales") {
      prerequisites.push("RateCandidate");
    }
  }

  if (department === "resume") {
    if (action === "Upload Required Docs - Resume") {
      prerequisites.push(`Acknowledged-${role}-Resume`);
      prerequisites.push("Initial Call Done");
      prerequisites.push("Resume Completed");
    }
  }

  return prerequisites;
};

// File upload requirements for stage transitions
export const getFileRequirements = (
  action: ActionType
): FileRequirement | null => {
  const requirements: Record<ActionType, FileRequirement> = {
    Acknowledged: {
      action: "Acknowledged",
      fileType: "",
      description: "",
      required: false,
    },
    "Initial Call Done": {
      action: "Initial Call Done",
      fileType: "",
      description: "",
      required: false,
    },
    "Resume Completed": {
      action: "Resume Completed",
      fileType: "pdf,doc,docx",
      description: "Upload Resume Draft (Required)",
      required: true,
    },
    AssignSeniorRecruiter: {
      action: "AssignSeniorRecruiter",
      fileType: "",
      description: "",
      required: false,
    },
    AssignRecruiter: {
      action: "AssignRecruiter",
      fileType: "",
      description: "",
      required: false,
    },
    "Acknowledged-Remarketing": {
      action: "Acknowledged-Remarketing",
      fileType: "",
      description: "",
      required: false,
    },
    RateCandidate: {
      action: "RateCandidate",
      fileType: "",
      description: "",
      required: false,
    },
    ChangeRecruiter: {
      action: "ChangeRecruiter",
      fileType: "",
      description: "",
      required: false,
    },
    "Upload Required Docs - Sales": {
      action: "Upload Required Docs - Sales",
      fileType: "pdf,doc,docx,jpg,png",
      description: "Upload required documents for Sales to Resume transition",
      required: true,
    },
    "Upload Required Docs - Resume": {
      action: "Upload Required Docs - Resume",
      fileType: "pdf,doc,docx,jpg,png",
      description:
        "Upload required documents for Resume to Marketing transition",
      required: true,
    },
  };

  return requirements[action] || null;
};

// Check if action requires file upload
export const requiresFileUpload = (action: ActionType): boolean => {
  const requirement = getFileRequirements(action);
  return requirement?.required || false;
};

// Get file upload description for action
export const getFileUploadDescription = (action: ActionType): string => {
  const requirement = getFileRequirements(action);
  return requirement?.description || "Upload a file";
};

// Role hierarchy for action completion
export const getRoleHierarchy = (): Record<UserRole, number> => {
  return {
    Admin: 0,
    Marketing_Manager: 1,
    Senior_Recruiter: 2,
    Recruiter: 3,
    Sales_Executive: 4,
    Resume_Writer: 5,
  };
};

// Check if user can access a specific stage/department based on their role
export const canAccessStageForRole = (
  userRole: UserRole,
  department: ClientStatus
): boolean => {
  const userRoleLower = userRole.toLowerCase();

  // Admin can access all stages
  if (userRoleLower === "admin") return true;

  // Marketing Manager can only access marketing and remarketing stages
  if (
    userRoleLower === "marketing_manager" ||
    userRoleLower === "marketing-manager"
  ) {
    return department === "marketing" || department === "remarketing";
  }

  // Sales Executive can only access sales stage
  if (
    userRoleLower === "sales_executive" ||
    userRoleLower === "sales-executive"
  ) {
    return department === "sales";
  }

  // Resume Writer can only access resume stage
  if (userRoleLower === "resume_writer" || userRoleLower === "resume-writer") {
    return department === "resume";
  }

  // Senior Recruiter can access marketing and remarketing stages
  if (
    userRoleLower === "senior_recruiter" ||
    userRoleLower === "senior-recruiter"
  ) {
    return department === "marketing" || department === "remarketing";
  }

  // Recruiter can access marketing and remarketing stages
  if (userRoleLower === "recruiter") {
    return department === "marketing" || department === "remarketing";
  }

  return false;
};

// Check if user can perform action based on role hierarchy
export const canPerformAction = (
  action: ActionType,
  userRole: UserRole,
  client: Client,
  department: ClientStatus
): boolean => {
  const userRoleLower = userRole.toLowerCase();

  // Admin can perform any action
  if (userRoleLower === "admin") return true;

  // Check if user has access to this department/stage
  const canAccessStage = canAccessStageForRole(userRole, department);
  if (!canAccessStage) {
    return false; // User cannot perform actions in stages they can't access
  }

  // Check role-specific permissions
  switch (action) {
    case "Acknowledged":
      if (department === "marketing" || department === "remarketing") {
        // In marketing and remarketing, only Marketing Manager and Admin can acknowledge
        return (
          userRoleLower === "marketing_manager" ||
          userRoleLower === "marketing-manager" ||
          userRoleLower === "admin"
        );
      }
      // For other departments, check if user has access
      return canAccessStageForRole(userRole, department);

    case "Initial Call Done":
    case "Resume Completed":
      // These actions can be performed by appropriate roles in resume stage
      if (department === "resume") {
        return ["Resume_Writer", "Admin"].includes(userRole);
      }
      return false;

    case "AssignSeniorRecruiter":
    case "AssignRecruiter":
    case "ChangeRecruiter":
      // Only Marketing Managers and Admins can assign/change recruiters
      // But they must also have access to the stage
      if (
        !["marketing_manager", "marketing-manager", "admin"].includes(
          userRoleLower
        )
      ) {
        return false;
      }
      // Check if user has access to this stage
      return canAccessStageForRole(userRole, department);

    case "RateCandidate":
      // Sales executives and admins can rate candidates
      return ["sales_executive", "sales-executive", "admin"].includes(
        userRoleLower
      );

    case "Acknowledged-Remarketing":
      // Only Marketing Managers can acknowledge in remarketing
      if (department === "remarketing") {
        return (
          userRoleLower === "marketing_manager" ||
          userRoleLower === "marketing-manager"
        );
      }
      return false;

    case "Upload Required Docs - Sales":
      // Sales executives and admins can upload documents in sales stage
      if (department === "sales") {
        return ["sales_executive", "sales-executive", "admin"].includes(
          userRoleLower
        );
      }
      return false;

    case "Upload Required Docs - Resume":
      // Resume writers and admins can upload documents in resume stage
      if (department === "resume") {
        return ["resume_writer", "resume-writer", "admin"].includes(
          userRoleLower
        );
      }
      return false;

    default:
      // For other actions, check if user has access to the stage
      return canAccessStageForRole(userRole, department);
  }
};

// Get available actions for a user role in a specific department
export const getAvailableActionsForRole = (
  userRole: UserRole,
  department: ClientStatus,
  client: Client
): ActionType[] => {
  // First check if user can access this stage
  if (!canAccessStageForRole(userRole, department)) {
    return []; // User cannot access this stage, so no actions available
  }

  const allActions: ActionType[] = [
    "Acknowledged",
    "Initial Call Done",
    "Resume Completed",
    "AssignSeniorRecruiter",
    "AssignRecruiter",
    "Acknowledged-Remarketing",
    "RateCandidate",
    "ChangeRecruiter",
  ];

  return allActions.filter((action) =>
    canPerformAction(action, userRole, client, department)
  );
};

// Check if action is required for stage transition
export const isActionRequiredForTransition = (
  action: ActionType,
  fromStage: ClientStatus,
  toStage: ClientStatus,
  userRole: UserRole
): boolean => {
  // Sales to Resume transition requires "Upload Required Docs - Sales" action
  if (fromStage === "sales" && toStage === "resume") {
    return false; // This is handled by the transition system, not individual actions
  }

  // Resume stage requires all actions to be completed
  if (fromStage === "resume" && toStage === "marketing") {
    return ["Acknowledged", "Initial Call Done", "Resume Completed"].includes(
      action
    );
  }

  // Marketing stage requires acknowledgment only from Marketing Manager
  if (fromStage === "marketing" && toStage === "placed") {
    const userRoleLower = userRole.toLowerCase();
    if (
      userRoleLower === "marketing_manager" ||
      userRoleLower === "marketing-manager" ||
      userRoleLower === "admin"
    ) {
      return action === "Acknowledged";
    }
  }

  return false;
};
