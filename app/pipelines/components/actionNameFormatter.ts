/**
 * Utility functions to format action names and field labels for better UX
 */

/**
 * Convert technical action names to user-friendly display names
 */
export function formatActionName(actionType: string): string {
  // Handle special action name mappings
  const actionNameMap: Record<string, string> = {
    // Department-specific acknowledgments
    "Acknowledged": "Acknowledge Client",
    "Acknowledged-Marketing": "Acknowledge for Marketing",
    "Acknowledged-Remarketing": "Acknowledge for Remarketing",

    // Sales actions
    "RateCandidate": "Rate Candidate Priority",
    "Upload Required Docs - Sales": "Upload Sales Documents",

    // Resume actions
    "Initial Call Done": "Complete Initial Call",
    "Resume Completed": "Mark Resume as Completed",
    "Upload Required Docs - Resume": "Upload Resume Documents",

    // Marketing actions
    "AssignRecruiter": "Assign Recruiter",
    "ChangeRecruiter": "Change Recruiter",
    "Recruiter-Checklist-Completed": "Complete Recruiter Checklist",

    // Stage transitions - lowercase variants
    "Move to sales": "Move to Sales",
    "Move to resume": "Move to Resume",
    "Move to marketing": "Move to Marketing",
    "Move to placed": "Move to Placed",
    "Move to remarketing": "Move to Remarketing",
    "Move to on-hold": "Place On Hold",
    "Move to backed-out": "Move to Backed Out",

    // Stage transitions - PascalCase variants
    "Move to Sales": "Move to Sales",
    "Move to Resume": "Move to Resume",
    "Move to Marketing": "Move to Marketing",
    "Move to Placed": "Move to Placed",
    "Move to Remarketing": "Move to Remarketing",
    "Move to OnHold": "Place On Hold",
    "Move to BackedOut": "Move to Backed Out",

    // Special transition actions
    "MarketingToPlacedTransition": "Place Client (from Marketing)",
    "RemarketingToPlacedTransition": "Place Client (from Remarketing)",
    "SalesToPlacedTransition": "Place Client (from Sales)",
    "ResumeToPlacedTransition": "Place Client (from Resume)",
    "OnHoldToPlacedTransition": "Place Client (from On Hold)",
    "BackedOutToPlacedTransition": "Place Client (from Backed Out)",
    "MarketingToBackedOutTransition": "Mark as Backed Out (from Marketing)",
    "ResumeToBackedOutTransition": "Mark as Backed Out (from Resume)",
    "SalesToBackedOutTransition": "Mark as Backed Out (from Sales)",
  };

  // Return mapped name if it exists
  if (actionNameMap[actionType]) {
    return actionNameMap[actionType];
  }

  // If not in map, try to format it nicely
  // Handle "Move to X" pattern
  if (actionType.startsWith("Move to ")) {
    const destination = actionType.replace("Move to ", "");
    // Capitalize and format the destination
    const formatted = formatStageName(destination);
    return `Move to ${formatted}`;
  }

  // Default: convert camelCase/PascalCase to Title Case with spaces
  // RateCandidate -> Rate Candidate
  // AssignRecruiter -> Assign Recruiter
  const withSpaces = actionType.replace(/([A-Z])/g, ' $1').trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

/**
 * Format stage names for display
 */
export function formatStageName(stage: string): string {
  const stageMap: Record<string, string> = {
    "sales": "Sales",
    "Sales": "Sales",
    "resume": "Resume",
    "Resume": "Resume",
    "marketing": "Marketing",
    "Marketing": "Marketing",
    "placed": "Placed",
    "Placed": "Placed",
    "remarketing": "Remarketing",
    "Remarketing": "Remarketing",
    "on-hold": "On Hold",
    "OnHold": "On Hold",
    "backed-out": "Backed Out",
    "BackedOut": "Backed Out",
  };

  return stageMap[stage] || stage;
}

/**
 * Get action description for dialog subtitle
 */
export function getActionDescription(actionType: string, currentStage?: string): string {
  // Special descriptions for specific actions
  const descriptionMap: Record<string, string> = {
    "Acknowledged": "Acknowledge that you have received and reviewed this client",
    "Acknowledged-Marketing": "Acknowledge client for active marketing and recruiter assignment",
    "Acknowledged-Remarketing": "Acknowledge client for remarketing with new strategy",
    "RateCandidate": "Set the priority level for this candidate based on their qualifications",
    "Upload Required Docs - Sales": "Upload all required documents to proceed to resume stage",
    "Initial Call Done": "Mark the initial consultation call as completed",
    "Resume Completed": "Mark the resume as completed and ready for marketing",
    "Upload Required Docs - Resume": "Upload final resume and supporting documents",
    "AssignRecruiter": "Assign a recruiter to actively market this client",
    "ChangeRecruiter": "Change the assigned recruiter for this client",
    "Recruiter-Checklist-Completed": "Complete the marketing checklist after your initial call with the candidate",
  };

  // Check for exact match
  if (descriptionMap[actionType]) {
    return descriptionMap[actionType];
  }

  // Handle "Move to X" pattern
  if (actionType.startsWith("Move to ")) {
    const destination = actionType.replace("Move to ", "");
    const formatted = formatStageName(destination);

    // Special messages for different destinations
    if (destination.toLowerCase().includes("placed")) {
      return "Mark this client as successfully placed with employment details";
    } else if (destination.toLowerCase().includes("backed") || destination.toLowerCase().includes("backedout")) {
      return "Mark this client as backed out with reason for withdrawal";
    } else if (destination.toLowerCase().includes("hold")) {
      return "Place this client on hold temporarily";
    } else if (destination.toLowerCase().includes("remarketing")) {
      return "Move client to remarketing with updated strategy";
    } else {
      return `Move this client to ${formatted} stage`;
    }
  }

  // Handle special transition actions
  if (actionType.includes("ToPlaced")) {
    return "Mark this client as successfully placed with employment details";
  }
  if (actionType.includes("ToBackedOut")) {
    return "Mark this client as backed out with reason for withdrawal";
  }

  // Default generic description
  return `Complete the ${formatActionName(actionType)} action for this client`;
}

/**
 * Format field labels for better readability
 */
export function formatFieldLabel(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    "notes": "Comments / Notes",
    "priority": "Priority Category",
    "assignedToID": "Assigned Recruiter",
    "mainFile": "Main Document",
    "additionalFiles": "Additional Documents",
    "comment": "Comments",
  };

  return fieldMap[fieldName] || fieldName;
}
