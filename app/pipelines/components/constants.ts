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
import { normalizeDepartments } from "../actions/pipelineActions";

export const stageConfig = {
  Sales: {
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
  Resume: {
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
  Marketing: {
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
  Placed: {
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
  completed: {
    title: "Completed",
    icon: CheckCircle2,
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    darkBgColor: "dark:bg-emerald-950",
    darkBorderColor: "dark:border-emerald-800",
    darkTextColor: "dark:text-emerald-300",
  },
  BackedOut: {
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
  Remarketing: {
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
  OnHold: {
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
  "Sales",
  "Resume",
  "Marketing",
  "Remarketing",
];
export const specialStates: ClientStatus[] = [
  "Placed",
  "BackedOut",
  "OnHold",
];

// Action configuration for each stage
export const getRequiredActions = (
  department: ClientStatus,
  userRole: string
): string[] => {
  switch (department) {
    case "Sales":
      const salesUserRoleLower = userRole.toLowerCase();
      if (salesUserRoleLower === "admin") {
        // Admin can perform all sales actions
        return ["RateCandidate", "Upload Required Docs - Sales"];
      }
      if (salesUserRoleLower === "sales_executive") {
        // Sales executives can perform all sales actions
        return ["RateCandidate", "Upload Required Docs - Sales"];
      }
      // Resume writers and other roles cannot see sales actions
      return [];
    case "Resume":
      const resumeUserRoleLower = userRole.toLowerCase();
      if (resumeUserRoleLower === "admin") {
        // Admin can perform all resume actions
        return [
          "Acknowledged",
          "Initial Call Done",
          "Resume Completed",
          "Resume Confirmed by Client",
          "Upload Required Docs - Resume",
        ];
      }
      if (resumeUserRoleLower === "resume_writer") {
        // Resume writers can perform all resume actions
        return [
          "Acknowledged",
          "Initial Call Done",
          "Resume Completed",
          "Resume Confirmed by Client",
          "Upload Required Docs - Resume",
        ];
      }
      // Sales executives and other roles cannot see resume actions
      return [];
    case "Marketing":
      const userRoleLower = userRole.toLowerCase();
      if (userRoleLower === "admin") {
        // Admin can perform all actions
        return ["Acknowledged-Marketing", "AssignRecruiter", "ChangeRecruiter"];
      }
      if (
        userRoleLower === "marketing_manager" ||
        userRoleLower === "marketing-manager"
      ) {
        // Actions must be completed in sequence:
        // 1. Acknowledged-Marketing (required first)
        // 2. AssignRecruiter (always required for action history)
        // 3. ChangeRecruiter (optional - doesn't block progression)
        return ["Acknowledged-Marketing", "AssignRecruiter", "ChangeRecruiter"];
      }
      // Senior recruiters and recruiters can acknowledge in marketing stage
      if (
        userRoleLower === "senior_recruiter" ||
        userRoleLower === "senior-recruiter"
      ) {
        return ["Acknowledged-Marketing"];
      }
      if (userRoleLower === "recruiter") {
        return ["Recruiter-Checklist-Completed"];
      }
      return [];
    case "Remarketing":
      if (userRole === "Marketing_Manager") {
        // Actions must be completed in sequence:
        // 1. Acknowledged-Marketing_Manager-Remarketing (required first)
        // 2. AssignRecruiter (always required for action history)
        return ["Acknowledged-Remarketing", "AssignRecruiter"];
      }
      // Senior recruiters and recruiters have no actions in remarketing
      return [];
    default:
      return [];
  }
};

// Check if an action is optional (doesn't block stage progression)
export const isOptionalAction = (action: string): boolean => {
  const optionalActions: string[] = ["ChangeRecruiter"];
  return optionalActions.includes(action);
};

// Check if all required actions are completed for a client
export const areAllActionsCompleted = (
  client: Client,
  department: ClientStatus,
  userRole: string
): boolean => {
  const requiredActions = getRequiredActions(department, userRole);
  // Only check non-optional actions for completion
  return requiredActions
    .filter((action) => !isOptionalAction(action))
    .every((action) => {
      // Check if action is completed in departments structure
      return (
        client.departments?.some((dept) => {
          // Handle Entity Framework serialization and ensure actions is an array
          const actions = normalizeDepartmentActions(dept);
          return actions.some(
            (act) => act.actionType === action && act.status === "completed"
          );
        }) ?? false
      );
    });
};

// Helper function to normalize department actions (handle Entity Framework serialization)
const normalizeDepartmentActions = (dept: any): any[] => {
  if (!dept.actions) return [];

  // Handle Entity Framework serialization for actions
  if (
    dept.actions &&
    typeof dept.actions === "object" &&
    dept.actions.$values &&
    Array.isArray(dept.actions.$values)
  ) {
    return dept.actions.$values;
  }

  // Handle regular array format
  if (Array.isArray(dept.actions)) {
    return dept.actions;
  }

  return [];
};

// Determine if an action is disabled based on its prerequisites
export const isActionDisabled = (
  client: Client,
  action: string,
  department: ClientStatus,
  role: string
): boolean => {
  // Helper function to check if an action is completed in departments structure
  const isActionCompleted = (actionType: string, dept?: string): boolean => {
    const departments = normalizeDepartments(client.departments);

    return departments.some((d) => {
      if (!d || !d.name || (dept && d.name !== dept)) return false;

      const actions = normalizeDepartmentActions(d);
      return actions.some(
        (act) =>
          act && act.actionType === actionType && act.status === "completed"
      );
    });
  };

  // Helper function to check if any acknowledgment is completed for a department
  const hasAcknowledgment = (dept: ClientStatus): boolean => {
    const departments = normalizeDepartments(client.departments);

    return departments.some((d) => {
      if (!d || d.name !== dept) return false;

      const actions = normalizeDepartmentActions(d);
      return actions.some(
        (act) =>
          act &&
          act.actionType.startsWith("Acknowledged") &&
          act.status === "completed"
      );
    });
  };

  const compositeAction =
    action === "Acknowledged" ? `${action}-${role}-${department}` : action;

  if (isActionCompleted(compositeAction)) {
    return true; // Action already completed
  }

  if (department === "Resume") {
    if (action === "Initial Call Done") {
      return !isActionCompleted("Acknowledged", "Resume");
    }
    if (action === "Resume Completed") {
      return !isActionCompleted("Initial Call Done", "Resume");
    }
  }

  if (department === "Sales") {
    if (action === "Upload Required Docs - Sales") {
      return !isActionCompleted("RateCandidate", "Sales");
    }
  }

  if (department === "Resume") {
    if (action === "Upload Required Docs - Resume") {
      // Upload Required Docs - Resume requires all other resume actions to be completed first
      const requiredActions = [
        "Acknowledged",
        "Initial Call Done",
        "Resume Completed",
      ];
      return !requiredActions.every((action) =>
        isActionCompleted(action, "Resume")
      );
    }
  }

  // Marketing stage prerequisites
  if (department === "Marketing") {
    if (action === "AssignRecruiter") {
      // AssignRecruiter requires acknowledgment to be completed first
      // If client already has a recruiter assigned, AssignRecruiter should be considered completed
      if (client.assignedRecruiterID) {
        return true; // Disable AssignRecruiter (mark as completed) if recruiter exists
      }

      return !hasAcknowledgment("Marketing");
    }
    if (action === "ChangeRecruiter") {
      // ChangeRecruiter requires acknowledgment to be completed first
      // AND client must have an assigned recruiter
      if (!client.assignedRecruiterID) {
        return true; // Disable ChangeRecruiter if no recruiter assigned
      }

      return !hasAcknowledgment("Marketing");
    }
    if (role === "Senior_Recruiter" && action === "Acknowledged") {
      // Senior Recruiter acknowledgment requires Marketing Manager acknowledgment first
      return !isActionCompleted(
        "Acknowledged-Marketing_Manager-Marketing",
        "marketing"
      );
    }
    if (role === "Recruiter" && action === "Acknowledged") {
      // Recruiter acknowledgment requires Senior Recruiter acknowledgment first
      return !isActionCompleted(
        "Acknowledged-Senior_Recruiter-Marketing",
        "marketing"
      );
    }
  }

  if (
    department === "Marketing" &&
    role === "Senior_Recruiter" &&
    action === "Acknowledged"
  ) {
    return !isActionCompleted(
      "Acknowledged-Marketing_Manager-Marketing",
      "marketing"
    );
  }

  if (
    department === "Marketing" &&
    role === "Recruiter" &&
    action === "Acknowledged"
  ) {
    return !isActionCompleted(
      "Acknowledged-Senior_Recruiter-Marketing",
      "marketing"
    );
  }

  // Remarketing stage prerequisites
  if (department === "Remarketing") {
    if (action === "AssignRecruiter") {
      // AssignRecruiter requires Acknowledged-Marketing_Manager-Remarketing to be completed first
      // If client already has a recruiter assigned, AssignRecruiter should be considered completed
      if (client.assignedRecruiterID) {
        return true; // Disable AssignRecruiter (mark as completed) if recruiter exists
      }
      return !hasAcknowledgment("Remarketing");
    }
    if (action === "ChangeRecruiter") {
      // ChangeRecruiter requires Acknowledged-Marketing_Manager-Remarketing to be completed first
      // AND client must have an assigned recruiter
      if (!client.assignedRecruiterID) {
        return true; // Disable ChangeRecruiter if no recruiter assigned
      }
      return !hasAcknowledgment("Remarketing");
    }
    if (role === "Senior_Recruiter" && action === "Acknowledged") {
      return !isActionCompleted(
        "Acknowledged-Marketing_Manager-Remarketing",
        "remarketing"
      );
    }
    if (role === "Recruiter" && action === "Acknowledged") {
      return !isActionCompleted(
        "Acknowledged-Senior_Recruiter-Remarketing",
        "remarketing"
      );
    }
  }

  if (
    department === "Remarketing" &&
    role === "Senior_Recruiter" &&
    action === "Acknowledged"
  ) {
    return !isActionCompleted(
      "Acknowledged-Marketing_Manager-Remarketing",
      "remarketing"
    );
  }

  if (
    department === "Remarketing" &&
    role === "Recruiter" &&
    action === "Acknowledged"
  ) {
    return !isActionCompleted(
      "Acknowledged-Senior_Recruiter-Remarketing",
      "remarketing"
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

  if (department === "Marketing") {
    if (action === "AssignRecruiter") {
      prerequisites.push("Acknowledged-Marketing_Manager-Marketing");
    }
    if (action === "ChangeRecruiter") {
      prerequisites.push("Acknowledged-Marketing_Manager-Marketing");
    }
  }

  if (department === "Remarketing") {
    if (action === "AssignRecruiter") {
      prerequisites.push("Acknowledged-Marketing_Manager-Remarketing");
    }
    if (action === "ChangeRecruiter") {
      prerequisites.push("Acknowledged-Marketing_Manager-Remarketing");
    }
  }

  if (department === "Resume") {
    if (action === "Initial Call Done") {
      prerequisites.push("Acknowledged");
    }
    if (action === "Resume Completed") {
      prerequisites.push("Initial Call Done");
    }
  }

  if (department === "Sales") {
    if (action === "Upload Required Docs - Sales") {
      prerequisites.push("RateCandidate");
    }
  }

  if (department === "Resume") {
    if (action === "Upload Required Docs - Resume") {
      prerequisites.push("Acknowledged");
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
    return department === "Marketing" || department === "Remarketing";
  }

  // Sales Executive can only access sales stage
  if (
    userRoleLower === "sales_executive" ||
    userRoleLower === "sales-executive"
  ) {
    return department === "Sales";
  }

  // Resume Writer can only access resume stage
  if (userRoleLower === "resume_writer" || userRoleLower === "resume-writer") {
    return department === "Resume";
  }

  // Senior Recruiter can access marketing and remarketing stages
  if (
    userRoleLower === "senior_recruiter" ||
    userRoleLower === "senior-recruiter"
  ) {
    return department === "Marketing" || department === "Remarketing";
  }

  // Recruiter can access marketing and remarketing stages
  if (userRoleLower === "recruiter") {
    return department === "Marketing" || department === "Remarketing";
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
      if (department === "Marketing" || department === "Remarketing") {
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
      if (department === "Resume") {
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
      if (department === "Remarketing") {
        return (
          userRoleLower === "marketing_manager" ||
          userRoleLower === "marketing-manager"
        );
      }
      return false;

    case "Upload Required Docs - Sales":
      // Sales executives and admins can upload documents in sales stage
      if (department === "Sales") {
        return ["sales_executive", "sales-executive", "admin"].includes(
          userRoleLower
        );
      }
      return false;

    case "Upload Required Docs - Resume":
      // Resume writers and admins can upload documents in resume stage
      if (department === "Resume") {
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
  if (fromStage === "Sales" && toStage === "Resume") {
    return false; // This is handled by the transition system, not individual actions
  }

  // Resume stage requires all actions to be completed
  if (fromStage === "Resume" && toStage === "Marketing") {
    return ["Acknowledged", "Initial Call Done", "Resume Completed"].includes(
      action
    );
  }

  // Marketing stage requires acknowledgment only from Marketing Manager
  if (fromStage === "Marketing" && toStage === "Placed") {
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
