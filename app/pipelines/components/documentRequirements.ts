import { ClientStatus, UserRole } from "../../types/pipelines/pipeline";

export interface DocumentRequirement {
  id: string;
  label: string;
  required: boolean;
  description?: string;
  fileTypes?: string[];
  maxSize?: number; // in MB
}

export interface TransitionRequirement {
  fromStage: ClientStatus;
  toStage: ClientStatus;
  actionName: string;
  title: string;
  description: string;
  documents: DocumentRequirement[];
  allowedRoles?: UserRole[];
  requiresComments?: boolean;
}

// Define all department transition requirements
export const TRANSITION_REQUIREMENTS: TransitionRequirement[] = [
  {
    fromStage: "Sales",
    toStage: "Resume",
    actionName: "Upload Required Docs - Sales",
    title: "Upload Required Documents for Resume Stage",
    description:
      "Complete the required documents to move from Sales to Resume stage",
    documents: [
      {
        id: "resume-checklist",
        label: "Resume Checklist",
        required: true,
        description: "Upload the completed resume checklist document",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
      {
        id: "resume-document",
        label: "Resume Document",
        required: true,
        description: "Upload the candidate's resume document",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
      {
        id: "additional-docs",
        label: "Additional Documents",
        required: false,
        description: "Upload any additional supporting documents",
        fileTypes: ["pdf", "doc", "docx", "jpg", "png"],
        maxSize: 20,
      },
    ],
    requiresComments: true,
  },
  {
    fromStage: "Resume",
    toStage: "Marketing",
    actionName: "Upload Required Docs - Resume",
    title: "Upload Required Documents for Marketing Stage",
    description:
      "Complete the required documents to move from Resume to Marketing stage",
    documents: [
      {
        id: "final-resume",
        label: "Final Resume",
        required: true,
        description: "Upload the final approved resume document",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
      {
        id: "cover-letter",
        label: "Cover Letter",
        required: true,
        description: "Upload the cover letter document",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
      {
        id: "resume-checklist",
        label: "Resume Checklist",
        required: true,
        description: "Upload the completed resume checklist document",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
      {
        id: "additional-docs",
        label: "Additional Documents",
        required: false,
        description: "Upload any additional supporting documents",
        fileTypes: ["pdf", "doc", "docx", "jpg", "png"],
        maxSize: 20,
      },
    ],
    allowedRoles: ["Resume_Writer", "Admin"],
    requiresComments: true,
  },
  {
    fromStage: "Remarketing",
    toStage: "Placed",
    actionName: "RemarketingToPlacedTransition",
    title: "Move Client to Placed Stage",
    description:
      "Complete the required documents to move from ReMarketing to Placed stage",
    documents: [
      {
        id: "offer-letter",
        label: "Offer Letter",
        required: true,
        description: "Upload the offer letter from the client",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
      {
        id: "placement-confirmation",
        label: "Placement Confirmation",
        required: false,
        description: "Upload placement confirmation document (optional)",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
    ],
    allowedRoles: ["Marketing_Manager", "Admin"],
    requiresComments: true,
  },
  {
    fromStage: "Marketing",
    toStage: "Placed",
    actionName: "MarketingToPlacedTransition",
    title: "Move Client to Placed Stage",
    description:
      "Complete the required documents to move from Marketing to Placed stage",
    documents: [
      {
        id: "placement-confirmation",
        label: "Placement Confirmation",
        required: true,
        description: "Upload placement confirmation document",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
      {
        id: "offer-letter",
        label: "Offer Letter",
        required: true,
        description: "Upload the offer letter from the client",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
      {
        id: "contract-details",
        label: "Contract Details",
        required: false,
        description: "Upload contract or agreement details",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 15,
      },
    ],
    allowedRoles: ["Marketing_Manager", "Admin"],
    requiresComments: true,
  },
  {
    fromStage: "Marketing",
    toStage: "BackedOut",
    actionName: "MarketingToBackedOutTransition",
    title: "Move Client to Backed Out Stage",
    description:
      "Complete the required documents to move from Marketing to Backed Out stage",
    documents: [
      {
        id: "backout-reason",
        label: "Backout Reason Document",
        required: false,
        description: "Upload document explaining the backout reason (optional)",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 5,
      },
      {
        id: "communication-log",
        label: "Communication Log",
        required: false,
        description: "Upload communication history with the candidate",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
    ],
    requiresComments: true,
  },
  {
    fromStage: "Resume",
    toStage: "BackedOut",
    actionName: "ResumeToBackedOutTransition",
    title: "Move Client to Backed Out Stage",
    description:
      "Complete the required documents to move from Resume to Backed Out stage",
    documents: [
      {
        id: "backout-reason",
        label: "Backout Reason Document",
        required: false,
        description: "Upload document explaining the backout reason (optional)",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 5,
      },
      {
        id: "resume-feedback",
        label: "Resume Feedback",
        required: false,
        description: "Upload any feedback about the resume process",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 5,
      },
    ],
    requiresComments: true,
  },

  {
    fromStage: "Sales",
    toStage: "BackedOut",
    actionName: "SalesToBackedOutTransition",
    title: "Move Client to Backed Out Stage",
    description:
      "Complete the required documents to move from Sales to Backed Out stage",
    documents: [
      {
        id: "backout-reason",
        label: "Backout Reason Document",
        required: false,
        description: "Upload document explaining the backout reason (optional)",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 5,
      },
      {
        id: "qualification-notes",
        label: "Qualification Notes",
        required: false,
        description: "Upload qualification assessment notes",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 5,
      },
    ],
    requiresComments: true,
  },
  {
    fromStage: "Sales",
    toStage: "Placed",
    actionName: "SalesToPlacedTransition",
    title: "Move Client to Placed Stage",
    description:
      "Complete the required documents to move from Sales to Placed stage",
    documents: [
      {
        id: "offer-letter",
        label: "Offer Letter",
        required: true,
        description: "Upload the offer letter from the client",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
      {
        id: "placement-confirmation",
        label: "Placement Confirmation",
        required: false,
        description: "Upload placement confirmation document (optional)",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
    ],
    allowedRoles: ["Sales_Executive", "Admin"],
    requiresComments: true,
  },
  {
    fromStage: "Resume",
    toStage: "Placed",
    actionName: "ResumeToPlacedTransition",
    title: "Move Client to Placed Stage",
    description:
      "Complete the required documents to move from Resume to Placed stage",
    documents: [
      {
        id: "offer-letter",
        label: "Offer Letter",
        required: true,
        description: "Upload the offer letter from the client",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
      {
        id: "placement-confirmation",
        label: "Placement Confirmation",
        required: false,
        description: "Upload placement confirmation document (optional)",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
    ],
    allowedRoles: ["Resume_Writer", "Admin"],
    requiresComments: true,
  },
  {
    fromStage: "OnHold",
    toStage: "Placed",
    actionName: "OnHoldToPlacedTransition",
    title: "Move Client to Placed Stage",
    description:
      "Complete the required documents to move from On Hold to Placed stage",
    documents: [
      {
        id: "offer-letter",
        label: "Offer Letter",
        required: true,
        description: "Upload the offer letter from the client",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
      {
        id: "placement-confirmation",
        label: "Placement Confirmation",
        required: false,
        description: "Upload placement confirmation document (optional)",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
    ],
    allowedRoles: ["Admin"],
    requiresComments: true,
  },
  {
    fromStage: "BackedOut",
    toStage: "Placed",
    actionName: "BackedOutToPlacedTransition",
    title: "Move Client to Placed Stage",
    description:
      "Complete the required documents to move from Backed Out to Placed stage",
    documents: [
      {
        id: "offer-letter",
        label: "Offer Letter",
        required: true,
        description: "Upload the offer letter from the client",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
      {
        id: "placement-confirmation",
        label: "Placement Confirmation",
        required: false,
        description: "Upload placement confirmation document (optional)",
        fileTypes: ["pdf", "doc", "docx"],
        maxSize: 10,
      },
    ],
    allowedRoles: ["Admin"],
    requiresComments: true,
  },
];

// Helper functions to work with transition requirements
export const getTransitionRequirement = (
  fromStage: ClientStatus,
  toStage: ClientStatus
): TransitionRequirement | null => {
  return (
    TRANSITION_REQUIREMENTS.find(
      (req) => req.fromStage === fromStage && req.toStage === toStage
    ) || null
  );
};

export const isTransitionRequiringDocuments = (
  fromStage: ClientStatus,
  toStage: ClientStatus,
  completedActions?: string[]
): boolean => {
  const requirement = getTransitionRequirement(fromStage, toStage);
  if (!requirement) return false;

  // If completedActions is provided, check if the required action is already completed
  if (completedActions && completedActions.includes(requirement.actionName)) {
    return false; // Documents already uploaded via completed action
  }

  return true;
};

export const getRequiredDocumentsForTransition = (
  fromStage: ClientStatus,
  toStage: ClientStatus
): DocumentRequirement[] => {
  const requirement = getTransitionRequirement(fromStage, toStage);
  return requirement?.documents || [];
};

export const canUserPerformTransition = (
  fromStage: ClientStatus,
  toStage: ClientStatus,
  userRole: UserRole
): boolean => {
  const requirement = getTransitionRequirement(fromStage, toStage);
  if (!requirement) return true; // No specific requirements

  if (requirement.allowedRoles && requirement.allowedRoles.length > 0) {
    return requirement.allowedRoles.includes(userRole);
  }

  return true;
};

export const getTransitionActionName = (
  fromStage: ClientStatus,
  toStage: ClientStatus
): string | null => {
  const requirement = getTransitionRequirement(fromStage, toStage);
  return requirement?.actionName || null;
};

// Convert to the format expected by MultiFileUploadDialog
export const getFileRequirementsForTransition = (
  fromStage: ClientStatus,
  toStage: ClientStatus
): Array<{
  id: string;
  label: string;
  required: boolean;
  description?: string;
}> => {
  const documents = getRequiredDocumentsForTransition(fromStage, toStage);
  return documents.map((doc) => ({
    id: doc.id,
    label: doc.label,
    required: doc.required,
    description: doc.description,
  }));
};
