/**
 * Maps Azure AD roles to application roles
 * Azure AD roles come from the JWT token in the 'roles' claim
 */

export const mapAzureRoleToAppRole = (azureRoles: string[]): string => {
  // If no roles, return default
  if (!azureRoles || azureRoles.length === 0) {
    return "default";
  }

  // Azure AD role names should match your app role names
  // Common mappings:
  const roleMap: Record<string, string> = {
    "Admin": "Admin",
    "Senior_Recruiter": "Senior_Recruiter",
    "Sales_Executive": "Sales_Executive",
    "Recruiter": "Recruiter",
    "Resume_Writer": "Resume_Writer",
    "Marketing_Manager": "Marketing_Manager",
    "Accounting": "Accounting",
    // Handle variations
    "admin": "Admin",
    "senior_recruiter": "Senior_Recruiter",
    "sales_executive": "Sales_Executive",
    "recruiter": "Recruiter",
    "resume_writer": "Resume_Writer",
    "marketing_manager": "Marketing_Manager",
    "accounting": "Accounting",
  };

  // Take the first role and map it
  const azureRole = azureRoles[0];
  const mappedRole = roleMap[azureRole];

  if (mappedRole) {
    console.log(`🔹 Role mapped: ${azureRole} → ${mappedRole}`);
    return mappedRole;
  }

  // If no mapping found, return the original role or default
  console.warn(`⚠️ No mapping found for Azure AD role: ${azureRole}`);
  return azureRole || "default";
};
