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

export const mockClients: Client[] = [
  // Sales Stage - Multiple clients
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    phone: "(555) 123-4567",
    status: "sales",
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-15",
    lastUpdated: "2024-01-20",
    priority: "exceptional",
    actions: {
      "initial-contact": true,
      "needs-assessment": false,
      qualification: false,
    },
    notes: "Interested in tech roles",
    completedActions: [],
    currentStage: {
      department: "sales",
      startDate: "2024-01-15",
    },
    daysInCurrentStage: 5,
    departmentHistory: [
      {
        department: "sales",
        startDate: "2024-01-15",
        endDate: undefined,
      },
    ],
    documents: [],
    assignments: [],
    actionHistory: [],
  },
  {
    id: "6",
    name: "Alex Rodriguez",
    email: "alex@example.com",
    phone: "(555) 111-2222",
    status: "sales",
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-16",
    lastUpdated: "2024-01-21",
    priority: "real-time",
    actions: {
      "initial-contact": false,
      "needs-assessment": false,
      qualification: false,
    },
    notes: "Potential client, waiting for callback",
    completedActions: [],
    currentStage: {
      department: "sales",
      startDate: "2024-01-16",
    },
    daysInCurrentStage: 5,
    documents: [],
    assignments: [],
    actionHistory: [],
  },
  {
    id: "7",
    name: "Maria Garcia",
    email: "maria@example.com",
    phone: "(555) 333-4444",
    status: "sales",
    assignedTo: "Tom Wilson",
    createdAt: "2024-01-18",
    lastUpdated: "2024-01-22",
    priority: "standard",
    actions: {
      "initial-contact": true,
      "needs-assessment": true,
      qualification: false,
    },
    notes: "Data scientist with 5 years experience",
    completedActions: [],
    currentStage: {
      department: "sales",
      startDate: "2024-01-18",
    },
    daysInCurrentStage: 4,
    documents: [],
    assignments: [],
    actionHistory: [],
  },
  {
    id: "8",
    name: "David Chen",
    email: "david@example.com",
    phone: "(555) 555-6666",
    status: "sales",
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-19",
    lastUpdated: "2024-01-23",
    priority: "standard",
    actions: {
      "initial-contact": true,
      "needs-assessment": false,
      qualification: false,
    },
    notes: "Looking for remote opportunities",
    completedActions: [],
    currentStage: {
      department: "sales",
      startDate: "2024-01-19",
    },
    daysInCurrentStage: 4,
    documents: [],
    assignments: [],
    actionHistory: [],
  },

  // Resume Stage - Multiple clients
  {
    id: "2",
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "(555) 234-5678",
    status: "resume",
    assignedTo: "Mike Wilson",
    createdAt: "2024-01-10",
    lastUpdated: "2024-01-22",
    priority: "standard",
    actions: {
      "initial-call": true,
      "resume-draft": true,
      "review-completed": true,
    },
    notes: "Marketing professional, 8 years experience",
    completedActions: [
      "Acknowledged-resume-writer-Resume",
      "Initial Call Done",
      "Resume Completed",
    ],
    currentStage: {
      department: "resume",
      startDate: "2024-01-10",
    },
    daysInCurrentStage: 12,
    departmentHistory: [
      {
        department: "sales",
        startDate: "2024-01-10",
        endDate: "2024-01-15",
      },
      {
        department: "resume",
        startDate: "2024-01-15",
        endDate: undefined,
      },
    ],
    documents: [
      {
        id: "emily-resume-1",
        name: "Emily_Davis_Resume.pdf",
        type: "application/pdf",
        uploadedAt: "2024-01-20T10:30:00Z",
        uploadedBy: "Resume Writer",
        fileSize: 245760,
        notes: "Updated resume with latest experience",
      },
    ],
    assignments: [],
    actionHistory: [
      {
        id: "emily-action-1",
        clientId: "2",
        actionType: "Acknowledged",
        performedBy: "Resume Writer",
        performedByRole: "resume-writer",
        timestamp: "2024-01-18T09:00:00Z",
        notes: "Client acknowledged for resume work",
      },
      {
        id: "emily-action-2",
        clientId: "2",
        actionType: "Initial Call Done",
        performedBy: "Resume Writer",
        performedByRole: "resume-writer",
        timestamp: "2024-01-19T14:30:00Z",
        notes: "Initial consultation completed",
      },
      {
        id: "emily-action-3",
        clientId: "2",
        actionType: "Resume Completed",
        performedBy: "Resume Writer",
        performedByRole: "resume-writer",
        timestamp: "2024-01-20T10:30:00Z",
        notes: "Resume updated and finalized",
        fileUploaded: true,
        fileName: "Emily_Davis_Resume.pdf",
      },
    ],
  },
  {
    id: "9",
    name: "Sarah Kim",
    email: "sarah@example.com",
    phone: "(555) 777-8888",
    status: "resume",
    assignedTo: "Mike Wilson",
    createdAt: "2024-01-12",
    lastUpdated: "2024-01-23",
    priority: "standard",
    actions: {
      "initial-call": false,
      "resume-draft": false,
      "review-completed": false,
    },
    notes: "Software engineer, needs resume update",
    completedActions: [],
    currentStage: {
      department: "resume",
      startDate: "2024-01-12",
    },
    daysInCurrentStage: 11,
    documents: [],
    assignments: [],
    actionHistory: [],
  },
  {
    id: "10",
    name: "James Lee",
    email: "james@example.com",
    phone: "(555) 999-0000",
    status: "resume",
    assignedTo: "Anna Rodriguez",
    createdAt: "2024-01-14",
    lastUpdated: "2024-01-24",
    priority: "standard",
    actions: {
      "initial-call": true,
      "resume-draft": false,
      "review-completed": false,
    },
    notes: "Product manager with startup experience",
    completedActions: [],
    currentStage: {
      department: "resume",
      startDate: "2024-01-14",
    },
    daysInCurrentStage: 10,
    documents: [],
    assignments: [],
    actionHistory: [],
  },

  // Marketing Stage - Multiple clients
  {
    id: "3",
    name: "Robert Brown",
    email: "robert@example.com",
    phone: "(555) 345-6789",
    status: "marketing",
    assignedTo: "Lisa Chen",
    createdAt: "2024-01-05",
    lastUpdated: "2024-01-21",
    priority: "standard",
    actions: {
      "campaign-setup": true,
      "outreach-started": true,
      "folstandard-up": false,
      "interview-scheduled": false,
    },
    notes: "Senior developer, actively looking",
    completedActions: [],
    currentStage: {
      department: "marketing",
      startDate: "2024-01-05",
    },
    daysInCurrentStage: 16,
    documents: [],
    assignments: [],
    actionHistory: [],
  },
  {
    id: "11",
    name: "Rachel Green",
    email: "rachel@example.com",
    phone: "(555) 123-9999",
    status: "marketing",
    assignedTo: "Chris Miller",

    createdAt: "2024-01-08",
    lastUpdated: "2024-01-22",
    priority: "standard",
    actions: {
      "campaign-setup": true,
      "outreach-started": false,
      "folstandard-up": false,
      "interview-scheduled": false,
    },
    notes: "UX designer with agency background",
    completedActions: [],
    currentStage: {
      department: "marketing",
      startDate: "2024-01-08",
    },
    daysInCurrentStage: 14,
    documents: [],
    assignments: [],
    actionHistory: [],
  },
  {
    id: "12",
    name: "Kevin Wong",
    email: "kevin@example.com",
    phone: "(555) 444-5555",
    status: "marketing",
    assignedTo: "Lisa Chen",

    createdAt: "2024-01-09",
    lastUpdated: "2024-01-23",
    priority: "standard",
    actions: {
      "campaign-setup": true,
      "outreach-started": true,
      "folstandard-up": true,
      "interview-scheduled": false,
    },
    notes: "DevOps engineer, looking for leadership role",
    completedActions: [],
    currentStage: {
      department: "marketing",
      startDate: "2024-01-09",
    },
    daysInCurrentStage: 14,
    documents: [],
    assignments: [],
    actionHistory: [],
  },

  // Placed
  {
    id: "4",
    name: "Jessica Taylor",
    email: "jessica@example.com",
    phone: "(555) 456-7890",
    status: "placed",
    assignedTo: "David Kim",
    createdAt: "2023-12-20",
    lastUpdated: "2024-01-18",
    priority: "standard",
    actions: { "placement-confirmed": true, "feedback-collected": true },
    notes: "Successfully placed at TechCorp",
    completedActions: [],
    currentStage: {
      department: "placed",
      startDate: "2023-12-20",
    },
    daysInCurrentStage: 29,
    documents: [],
    assignments: [],
    actionHistory: [],
  },
  {
    id: "13",
    name: "Amanda White",
    email: "amanda@example.com",
    phone: "(555) 666-7777",
    status: "placed",
    assignedTo: "David Kim",
    createdAt: "2023-12-15",
    lastUpdated: "2024-01-15",
    priority: "standard",
    actions: { "placement-confirmed": true, "feedback-collected": true },
    notes: "Placed at StartupXYZ as Senior Frontend Developer",
    completedActions: [],
    currentStage: {
      department: "placed",
      startDate: "2023-12-15",
    },
    daysInCurrentStage: 31,
    documents: [],
    assignments: [],
    actionHistory: [],
  },

  // Backed Out
  {
    id: "5",
    name: "Michael Johnson",
    email: "michael@example.com",
    phone: "(555) 567-8901",
    status: "backed-out",
    assignedTo: "Sarah Johnson",
    createdAt: "2024-01-12",
    lastUpdated: "2024-01-19",
    priority: "standard",
    actions: { "initial-contact": true, "folstandard-up": true },
    notes: "Changed mind about job search",
    completedActions: [],
    currentStage: {
      department: "backed-out",
      startDate: "2024-01-12",
    },
    daysInCurrentStage: 7,
    documents: [],
    assignments: [],
    actionHistory: [],
  },

  // On Hold
  {
    id: "14",
    name: "Brian Clark",
    email: "brian@example.com",
    phone: "(555) 888-9999",
    status: "on-hold",
    assignedTo: "Tom Wilson",
    createdAt: "2024-01-11",
    lastUpdated: "2024-01-20",
    priority: "standard",
    actions: { "initial-contact": true, "needs-assessment": true },
    notes: "Waiting for current project to finish",
    completedActions: [],
    currentStage: {
      department: "on-hold",
      startDate: "2024-01-11",
    },
    daysInCurrentStage: 9,
    documents: [],
    assignments: [],
    actionHistory: [],
  },

  // ReMarketing
  {
    id: "15",
    name: "Lisa Thompson",
    email: "lisa@example.com",
    phone: "(555) 111-3333",
    status: "remarketing",
    assignedTo: "Chris Miller",
    createdAt: "2023-12-01",
    lastUpdated: "2024-01-17",
    priority: "standard",
    actions: { "campaign-setup": true, "outreach-started": false },
    notes: "Previous placement fell through, restarting process",
    completedActions: [],
    currentStage: {
      department: "remarketing",
      startDate: "2023-12-01",
    },
    daysInCurrentStage: 47,
    documents: [],
    assignments: [],
    actionHistory: [],
  },
];

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
      return ["RateCandidate", "Upload Required Docs"];
    case "resume":
      return [
        `Acknowledged-${userRole}-Resume`,
        "Initial Call Done",
        "Resume Completed",
        "Upload Required Docs",
      ];
    case "marketing":
      if (userRole === "marketing-manager") {
        // Actions must be completed in sequence:
        // 1. Acknowledged-Marketing_Manager-Marketing (required first)
        // 2. AssignRecruiter (always required for action history)
        return [`Acknowledged-Marketing_Manager-Marketing`, "AssignRecruiter"];
      }
      // Senior recruiters and recruiters have no actions in marketing
      return [];
    case "remarketing":
      if (userRole === "marketing-manager") {
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
    if (action === "Upload Required Docs") {
      return !client.completedActions.includes("RateCandidate");
    }
  }

  // Marketing stage prerequisites
  if (department === "marketing") {
    if (action === "AssignRecruiter") {
      // AssignRecruiter requires Acknowledged-Marketing_Manager-Marketing to be completed first
      // If client already has a recruiter assigned, AssignRecruiter should be considered completed
      if (client.assignedRecruiterID) {
        return true; // Disable AssignRecruiter (mark as completed) if recruiter exists
      }
      return !client.completedActions.includes(
        `Acknowledged-Marketing_Manager-Marketing`
      );
    }
    if (action === "ChangeRecruiter") {
      // ChangeRecruiter requires Acknowledged-Marketing_Manager-Marketing to be completed first
      // AND client must have an assigned recruiter
      if (!client.assignedRecruiterID) {
        return true; // Disable ChangeRecruiter if no recruiter assigned
      }
      return !client.completedActions.includes(
        `Acknowledged-Marketing_Manager-Marketing`
      );
    }
    if (role === "senior-recruiter" && action === "Acknowledged") {
      return !client.completedActions.includes(
        `Acknowledged-Marketing_Manager-Marketing`
      );
    }
    if (role === "recruiter" && action === "Acknowledged") {
      return !client.completedActions.includes(
        `Acknowledged-Senior_Recruiter-Marketing`
      );
    }
  }

  if (
    department === "marketing" &&
    role === "senior-recruiter" &&
    action === "Acknowledged"
  ) {
    return !client.completedActions.includes(
      `Acknowledged-Marketing_Manager-Marketing`
    );
  }

  if (
    department === "marketing" &&
    role === "recruiter" &&
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
    if (role === "senior-recruiter" && action === "Acknowledged") {
      return !client.completedActions.includes(
        `Acknowledged-Marketing_Manager-Remarketing`
      );
    }
    if (role === "recruiter" && action === "Acknowledged") {
      return !client.completedActions.includes(
        `Acknowledged-Marketing_Manager-Remarketing`
      );
    }
  }

  if (
    department === "remarketing" &&
    role === "senior-recruiter" &&
    action === "Acknowledged"
  ) {
    return !client.completedActions.includes(
      `Acknowledged-Marketing_Manager-Remarketing`
    );
  }

  if (
    department === "remarketing" &&
    role === "recruiter" &&
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
    if (action === "Upload Required Docs") {
      prerequisites.push("RateCandidate");
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
      description:
        "Upload Drafted Resume (Required) and Additional Documents (Optional)",
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
    admin: 0,
    "marketing-manager": 1,
    "senior-recruiter": 2,
    recruiter: 3,
    "sales-executive": 4,
    "resume-writer": 5,
  };
};

// Check if user can access a specific stage/department based on their role
export const canAccessStageForRole = (
  userRole: UserRole,
  department: ClientStatus
): boolean => {
  // Admin can access all stages
  if (userRole === "admin") return true;

  // Marketing Manager can only access marketing and remarketing stages
  if (userRole === "marketing-manager") {
    return department === "marketing" || department === "remarketing";
  }

  // Sales Executive can only access sales stage
  if (userRole === "sales-executive") {
    return department === "sales";
  }

  // Resume Writer can only access resume stage
  if (userRole === "resume-writer") {
    return department === "resume";
  }

  // Senior Recruiter can access marketing and remarketing stages
  if (userRole === "senior-recruiter") {
    return department === "marketing" || department === "remarketing";
  }

  // Recruiter can access marketing and remarketing stages
  if (userRole === "recruiter") {
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
  // Admin can perform any action
  if (userRole === "admin") return true;

  // Check if user has access to this department/stage
  const canAccessStage = canAccessStageForRole(userRole, department);
  if (!canAccessStage) {
    return false; // User cannot perform actions in stages they can't access
  }

  // Check role-specific permissions
  switch (action) {
    case "Acknowledged":
      if (department === "marketing" || department === "remarketing") {
        // In marketing and remarketing, only Marketing Manager can acknowledge
        return userRole === "marketing-manager";
      }
      // For other departments, check if user has access
      return canAccessStageForRole(userRole, department);

    case "Initial Call Done":
    case "Resume Completed":
      // These actions can be performed by appropriate roles in resume stage
      if (department === "resume") {
        return ["resume-writer", "admin"].includes(userRole);
      }
      return false;

    case "AssignSeniorRecruiter":
    case "AssignRecruiter":
    case "ChangeRecruiter":
      // Only Marketing Managers and Admins can assign/change recruiters
      // But they must also have access to the stage
      if (!["marketing-manager", "admin"].includes(userRole)) {
        return false;
      }
      // Check if user has access to this stage
      return canAccessStageForRole(userRole, department);

    case "RateCandidate":
      // Sales executives and admins can rate candidates
      return ["sales-executive", "admin"].includes(userRole);

    case "Acknowledged-Remarketing":
      // Only Marketing Managers can acknowledge in remarketing
      if (department === "remarketing") {
        return userRole === "marketing-manager";
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
  // Sales to Resume transition requires "Upload Required Docs" action
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
    if (userRole === "marketing-manager") {
      return action === "Acknowledged";
    }
  }

  return false;
};
