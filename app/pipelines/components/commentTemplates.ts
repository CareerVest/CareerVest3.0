import { ClientStatus } from "../../types/pipelines/pipeline";

// Template variable definition
export interface TemplateVariable {
  key: string;
  label: string;
  type?: "text" | "date" | "number";
  required: boolean;
  placeholder?: string;
}

// Template definition
export interface CommentTemplate {
  id: string;
  label: string;
  template: string;
  variables?: TemplateVariable[];
  category?: string;
}

// Simplified templates organized by action type
export const COMMENT_TEMPLATES: Record<string, CommentTemplate[]> = {
  // Sales Department Actions
  "RateCandidate": [
    {
      id: "rate-exceptional",
      label: "Exceptional Candidate",
      template: "Exceptional candidate with strong background and high placement potential.",
      category: "Positive",
    },
    {
      id: "rate-standard",
      label: "Standard Qualified",
      template: "Standard qualified candidate. Good fit for available positions.",
      category: "Positive",
    },
    {
      id: "rate-discussion",
      label: "Needs Discussion",
      template: "Candidate shows potential but needs discussion on expectations and alignment.",
      category: "Neutral",
    },
  ],

  "Upload Required Docs - Sales": [
    {
      id: "docs-complete",
      label: "Documents Complete",
      template: "All required documents uploaded and verified. Ready to proceed to next stage.",
      category: "Positive",
    },
    {
      id: "docs-pending",
      label: "Pending Documents",
      template: "Documents uploaded. Awaiting additional items from client.",
      category: "Neutral",
    },
  ],

  // Resume Department Actions
  "Acknowledged": [
    {
      id: "ack-ready",
      label: "Client Ready",
      template: "Client acknowledged and ready to begin resume preparation process.",
      category: "Positive",
    },
    {
      id: "ack-scheduled",
      label: "Call Scheduled",
      template: "Client acknowledged. Initial consultation call scheduled.",
      category: "Positive",
    },
  ],

  "Initial Call Done": [
    {
      id: "call-completed",
      label: "Call Completed",
      template: "Initial call completed successfully. Gathered necessary information for resume preparation.",
      category: "Positive",
    },
    {
      id: "call-followup",
      label: "Follow-up Needed",
      template: "Initial call completed. Additional information needed from client before proceeding.",
      category: "Neutral",
    },
  ],

  "Resume Completed": [
    {
      id: "resume-approved",
      label: "Resume Approved",
      template: "Resume completed and approved by client. Ready for marketing.",
      category: "Positive",
    },
    {
      id: "resume-revised",
      label: "Resume Finalized",
      template: "Resume finalized after client feedback. Approved and ready for marketing.",
      category: "Positive",
    },
  ],

  "Upload Required Docs - Resume": [
    {
      id: "resume-docs-complete",
      label: "Documents Uploaded",
      template: "All required documents uploaded and ready for marketing team.",
      category: "Positive",
    },
  ],

  // Marketing Department Actions
  "Acknowledged-Marketing": [
    {
      id: "marketing-ack",
      label: "Marketing Acknowledged",
      template: "Client acknowledged by marketing team. Beginning active marketing campaign.",
      category: "Positive",
    },
    {
      id: "marketing-strategy",
      label: "Strategy Planned",
      template: "Marketing acknowledged. Targeted strategy planned based on client profile.",
      category: "Positive",
    },
  ],

  "AssignRecruiter": [
    {
      id: "recruiter-assigned",
      label: "Recruiter Assigned",
      template: "Recruiter assigned and actively marketing candidate profile.",
      category: "Positive",
    },
  ],

  "Recruiter-Checklist-Completed": [
    {
      id: "checklist-done",
      label: "Checklist Completed",
      template: "Recruiter checklist completed. All items verified and documented.",
      category: "Positive",
    },
  ],

  "ChangeRecruiter": [
    {
      id: "recruiter-changed",
      label: "Recruiter Changed",
      template: "Recruiter reassigned to better match client profile and needs.",
      category: "Neutral",
    },
  ],

  // Remarketing Actions
  "Acknowledged-Remarketing": [
    {
      id: "remarketing-ack",
      label: "New Strategy",
      template: "Remarketing acknowledged. Adjusted strategy based on market feedback.",
      category: "Positive",
    },
    {
      id: "remarketing-expanded",
      label: "Expanded Search",
      template: "Remarketing with expanded search criteria and broader targeting.",
      category: "Positive",
    },
  ],

  // Stage Transitions - BACKED OUT
  "Move to BackedOut": [
    {
      id: "backedout-accepted",
      label: "Accepted Offer Elsewhere",
      template: "Client accepted position elsewhere. Client expressed gratitude for our services.",
      category: "Negative",
    },
    {
      id: "backedout-unresponsive",
      label: "Client Unresponsive",
      template: "Client became unresponsive after multiple follow-up attempts.",
      category: "Negative",
    },
    {
      id: "backedout-personal",
      label: "Personal Reasons",
      template: "Client withdrew due to personal/family reasons.",
      category: "Negative",
    },
    {
      id: "backedout-expectations",
      label: "Expectations Misalignment",
      template: "Client backed out due to misalignment on expectations.",
      category: "Negative",
    },
  ],

  // Stage Transitions - ON HOLD
  "Move to OnHold": [
    {
      id: "onhold-requested",
      label: "Client Requested Hold",
      template: "Client requested temporary pause. Will resume when ready.",
      category: "Neutral",
    },
    {
      id: "onhold-temporary",
      label: "Temporary Hold",
      template: "Temporarily on hold due to client circumstances. Maintaining contact.",
      category: "Neutral",
    },
  ],

  // Stage Transitions - PLACED
  "Move to Placed": [
    {
      id: "placed-direct",
      label: "Direct Hire Placement",
      template: "Client successfully placed in direct hire position. Client satisfied with outcome.",
      category: "Positive",
    },
    {
      id: "placed-contract",
      label: "Contract Placement",
      template: "Client successfully placed in contract position.",
      category: "Positive",
    },
  ],

  // Stage Transitions - REMARKETING
  "Move to Remarketing": [
    {
      id: "to-remarketing-adjust",
      label: "Strategy Adjustment Needed",
      template: "Moving to remarketing to adjust strategy and approach for better results.",
      category: "Neutral",
    },
    {
      id: "to-remarketing-market",
      label: "Market Conditions",
      template: "Moving to remarketing due to market conditions. Will pivot approach.",
      category: "Neutral",
    },
  ],

  // Stage Transitions - TO RESUME
  "Move to Resume": [
    {
      id: "to-resume-ready",
      label: "Ready for Resume",
      template: "Client qualified and ready for resume preparation stage.",
      category: "Positive",
    },
    {
      id: "to-resume-complete",
      label: "Sales Complete",
      template: "All sales stage requirements completed. Moving to resume preparation.",
      category: "Positive",
    },
  ],

  // Stage Transitions - TO MARKETING
  "Move to Marketing": [
    {
      id: "to-marketing-ready",
      label: "Ready for Marketing",
      template: "Resume completed and client ready for active marketing.",
      category: "Positive",
    },
    {
      id: "to-marketing-strong",
      label: "Strong Profile",
      template: "Strong candidate profile ready for marketing campaign.",
      category: "Positive",
    },
  ],

  // Post-Placement Actions
  "Placement Success": [
    {
      id: "placement-success",
      label: "Placement Confirmed",
      template: "Placement confirmed and successful. Client satisfied with position.",
      category: "Positive",
    },
  ],

  "Client Placement Success": [
    {
      id: "client-placement",
      label: "Client Placed Successfully",
      template: "Client placed successfully and started new position.",
      category: "Positive",
    },
  ],

  // Block/Unblock Actions
  "BlockClient": [
    {
      id: "block-issue",
      label: "Issue Blocking Progress",
      template: "Client blocked due to issue requiring resolution.",
      category: "Neutral",
    },
    {
      id: "block-waiting",
      label: "Waiting on Client",
      template: "Client blocked while waiting on required information or action.",
      category: "Neutral",
    },
  ],

  "UnblockClient": [
    {
      id: "unblock-resolved",
      label: "Issue Resolved",
      template: "Issue resolved. Client unblocked and resuming normal process.",
      category: "Positive",
    },
  ],
};

// Helper function to get templates for a specific action
export const getTemplatesForAction = (actionType: string): CommentTemplate[] => {
  return COMMENT_TEMPLATES[actionType] || [];
};

// Helper function to get template by ID
export const getTemplateById = (actionType: string, templateId: string): CommentTemplate | undefined => {
  const templates = COMMENT_TEMPLATES[actionType] || [];
  return templates.find(t => t.id === templateId);
};

// Helper function to process template with variables
export const processTemplate = (template: string, values: Record<string, string>): string => {
  let processed = template;
  Object.keys(values).forEach(key => {
    const placeholder = `{{${key}}}`;
    processed = processed.replace(new RegExp(placeholder, 'g'), values[key] || '');
  });
  return processed;
};

// Industry-specific dictionary for spell check
export const INDUSTRY_DICTIONARY = [
  // Job-related terms
  "remarketing",
  "upskilling",
  "reskilling",
  "onboarding",
  "offboarding",
  "ats",
  "applicant",

  // Common job titles and roles
  "recruiter",
  "backend",
  "frontend",
  "fullstack",
  "devops",
  "scrum",
  "agile",
  "salesforce",

  // Technical terms
  "linkedin",
  "github",
  "stackoverflow",
  "aws",
  "azure",
  "kubernetes",

  // Common abbreviations
  "cv",
  "kpi",
  "roi",
  "api",
  "saas",
  "b2b",
  "b2c",

  // Process terms
  "pre-screening",
  "post-interview",
  "follow-up",
  "followup",
  "touchpoint",
  "outreach",

  // Certifications
  "pmp",
  "cissp",
  "ccna",
  "mba",
  "cpa",

  // Company/industry
  "startups",
  "fintech",
  "healthtech",
  "edtech",
  "biotech",

  // Work arrangements
  "remote",
  "hybrid",
  "onsite",
  "freelance",
  "w2",
  "1099",
];
