/**
 * Subscription Plan Templates
 * Used in both CreateClientForm and EditClientForm
 */

export interface PlanTemplate {
  monthlyAmount: number;
  durationMonths: number;
  percentageAfterJob: number;
  displayName: string;
}

export const PLAN_TEMPLATES: Record<string, PlanTemplate> = {
  Basic: {
    monthlyAmount: 500,
    durationMonths: 3,
    percentageAfterJob: 14,
    displayName: "Basic Plan",
  },
  Standard: {
    monthlyAmount: 750,
    durationMonths: 3,
    percentageAfterJob: 12,
    displayName: "Standard Plan",
  },
  Premium: {
    monthlyAmount: 1000,
    durationMonths: 3,
    percentageAfterJob: 10,
    displayName: "Premium Plan",
  },
};

/**
 * Generate plan name from template and custom values
 */
export const generatePlanName = (
  template: string,
  customMonthlyAmount?: number,
  customDurationMonths?: number,
  customPercentageAfterJob?: number
): string => {
  if (template && template !== "Custom") {
    const plan = PLAN_TEMPLATES[template as keyof typeof PLAN_TEMPLATES];
    if (plan) {
      return `${plan.displayName} - $${plan.monthlyAmount}/month for ${plan.durationMonths} months (${plan.percentageAfterJob}% after job)`;
    }
  } else if (template === "Custom" && customMonthlyAmount && customDurationMonths && customPercentageAfterJob) {
    return `Custom Plan - $${customMonthlyAmount}/month for ${customDurationMonths} months (${customPercentageAfterJob}% after job)`;
  }
  return "";
};

/**
 * Get plan details from template
 */
export const getPlanDetails = (
  template: string,
  customMonthlyAmount?: number,
  customDurationMonths?: number,
  customPercentageAfterJob?: number
): { monthlyAmount: number; durationMonths: number; percentageAfterJob: number } | null => {
  if (template && template !== "Custom") {
    const plan = PLAN_TEMPLATES[template as keyof typeof PLAN_TEMPLATES];
    if (plan) {
      return {
        monthlyAmount: plan.monthlyAmount,
        durationMonths: plan.durationMonths,
        percentageAfterJob: plan.percentageAfterJob,
      };
    }
  } else if (template === "Custom" && customMonthlyAmount && customDurationMonths && customPercentageAfterJob) {
    return {
      monthlyAmount: customMonthlyAmount,
      durationMonths: customDurationMonths,
      percentageAfterJob: customPercentageAfterJob,
    };
  }
  return null;
};
