export interface SLAConfig {
  stage: string;
  maxDays: number;
  description: string;
  warningThreshold: number; // Days before deadline to show warning
  criticalThreshold: number; // Days after deadline to show critical
}

export const STAGE_SLA_CONFIG: SLAConfig[] = [
  {
    stage: "sales",
    maxDays: 1,
    description: "Move candidate to resume within 1 business day",
    warningThreshold: 0.5, // Warning at 12 hours remaining
    criticalThreshold: 0, // Critical immediately after deadline
  },
  {
    stage: "resume",
    maxDays: 2,
    description: "Complete resume process within 2 business days",
    warningThreshold: 1, // Warning at 1 day remaining
    criticalThreshold: 0, // Critical immediately after deadline
  },
  {
    stage: "marketing",
    maxDays: 180, // 6 months (approximately 180 business days)
    description: "Complete marketing process within 6 months",
    warningThreshold: 30, // Warning at 30 days remaining
    criticalThreshold: 0, // Critical immediately after deadline
  },
  {
    stage: "remarketing",
    maxDays: 2,
    description: "Process remarketing candidates within 2 business days",
    warningThreshold: 1, // Warning at 1 day remaining
    criticalThreshold: 0, // Critical immediately after deadline
  },
];

export const getSLAConfig = (stage: string): SLAConfig | undefined => {
  return STAGE_SLA_CONFIG.find((config) => config.stage === stage);
};

export const calculateBusinessDays = (
  startDate: Date,
  endDate: Date
): number => {
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

export const getSLAStatus = (
  stage: string,
  daysInStage: number,
  isCurrentStage: boolean = false
): {
  status: "on-track" | "warning" | "overdue" | "completed";
  daysRemaining: number;
  daysOverdue: number;
  percentageComplete: number;
} => {
  // Don't apply SLA to terminal stages
  if (stage === "placed" || stage === "on-hold" || stage === "backed-out") {
    return {
      status: "completed",
      daysRemaining: 0,
      daysOverdue: 0,
      percentageComplete: 100,
    };
  }

  const slaConfig = getSLAConfig(stage);

  if (!slaConfig || !isCurrentStage) {
    return {
      status: "completed",
      daysRemaining: 0,
      daysOverdue: 0,
      percentageComplete: 100,
    };
  }

  const daysRemaining = Math.max(0, slaConfig.maxDays - daysInStage);
  const daysOverdue = Math.max(0, daysInStage - slaConfig.maxDays);
  const percentageComplete = Math.min(
    100,
    (daysInStage / slaConfig.maxDays) * 100
  );

  let status: "on-track" | "warning" | "overdue" | "completed";

  if (daysOverdue > 0) {
    status = "overdue";
  } else if (daysRemaining <= slaConfig.warningThreshold) {
    status = "warning";
  } else {
    status = "on-track";
  }

  return {
    status,
    daysRemaining,
    daysOverdue,
    percentageComplete,
  };
};

export const getSLAStatusColor = (status: string): string => {
  switch (status) {
    case "on-track":
      return "text-green-600 bg-green-100 border-green-200";
    case "warning":
      return "text-yellow-600 bg-yellow-100 border-yellow-200";
    case "overdue":
      return "text-red-600 bg-red-100 border-red-200";
    case "completed":
      return "text-gray-600 bg-gray-100 border-gray-200";
    default:
      return "text-gray-600 bg-gray-100 border-gray-200";
  }
};

export const getSLAStatusIcon = (status: string): string => {
  switch (status) {
    case "on-track":
      return "✅";
    case "warning":
      return "⚠️";
    case "overdue":
      return "🚨";
    case "completed":
      return "✅";
    default:
      return "✅";
  }
};
