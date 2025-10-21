/**
 * Comprehensive Dashboard Data Utilities
 *
 * This file contains dummy data for all role-based dashboards.
 * Data structure mirrors real backend responses for seamless integration.
 *
 * ⚠️ WORK IN PROGRESS - DUMMY DATA ONLY
 */

export interface ExecutiveSummaryMetrics {
  activeClients: number;
  monthlyRevenueCollected: number;
  monthlyRevenuePending: number;
  avgPlacementRate: number;
  monthlyPlacements: number;
  totalPlacements: number;
  trend?: {
    activeClients: number;
    revenue: number;
    placements: number;
  };
}

export interface SalesMetrics {
  enrolledThisMonth: number;
  revenueCollectedUpfront: number;
  conversionRate: number;
  avgDealSize: number;
  technologyDistribution: { name: string; count: number; percentage: number }[];
  pipelineByStage: { stage: string; count: number; value: number }[];
  topTechnologies: string[];
}

export interface ResumeMetrics {
  inProcess: number;
  completed: number;
  inVerification: number;
  notResponding: number;
  backedOut: number;
  avgTimeInResume: number; // in days
  completionRate: number;
  dailyCompletionTrend: { date: string; count: number }[];
}

export interface MarketingMetrics {
  totalRecruiters: number;
  interviewsToday: number;
  interviewsThisMonth: number;
  finalRoundsThisMonth: number;
  placementsThisMonth: number;
  topPerformer: {
    name: string;
    placementCount: number;
    successRate: number;
  };
  candidatesOnHold: number;
  candidateBackouts: number;
  recruiterBandwidth: RecruiterBandwidth[];
  placementsByTechnology: { tech: string; count: number }[];
  avgTimeToPlacement: number;
}

export interface RecruiterBandwidth {
  id: number;
  name: string;
  assignedCandidates: number;
  activeInterviews: number;
  finalRounds: number;
  placements: number;
  successRate: number;
  utilizationRate: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  subscriptionRevenue: number;
  placementRevenue: number;
  outstandingBalance: number;
  creditBalance: number;
  paymentSuccessRate: number;
  revenueByMonth: { month: string; subscription: number; placement: number }[];
  topPayingClients: { name: string; amount: number }[];
}

export interface SalesPersonalMetrics {
  myEnrolledCandidates: number;
  myRevenueCollected: number;
  myActiveClients: number;
  myAvgDealSize: number;
  myTechDistribution: { name: string; count: number }[];
  myClientsByStage: { stage: string; count: number; clients: any[] }[];
  myMonthlyTarget: number;
  myTargetProgress: number;
  myRecentClients: any[];
}

export interface MarketingPersonalMetrics {
  teamSize: number;
  teamInterviewsToday: number;
  teamInterviewsThisMonth: number;
  teamFinalRounds: number;
  teamPlacements: number;
  topRecruiter: {
    name: string;
    placements: number;
  };
  atRiskCandidates: any[];
  upcomingInterviews: any[];
}

export interface RecruiterPersonalMetrics {
  myAssignedCandidates: number;
  myInterviewsThisWeek: number;
  myPlacementsThisMonth: number;
  mySuccessRate: number;
  myCandidatesByStage: { stage: string; count: number; candidates: any[] }[];
  myTodayInterviews: any[];
  myUpcomingInterviews: any[];
  myRanking: number;
  totalRecruiters: number;
}

export interface ResumeWriterPersonalMetrics {
  myAssignedClients: number;
  myCompletedThisMonth: number;
  myInProgress: number;
  myAvgCompletionTime: number; // in days
  myCompletionRate: number;
  myPendingReview: number;
  myClientsByStatus: { status: string; count: number; clients: any[] }[];
  myRecentCompletions: any[];
  myQualityScore: number;
  myRanking: number;
  totalWriters: number;
  urgentTasks: any[];
}

export interface DashboardAlert {
  id: number;
  type: 'warning' | 'info' | 'success' | 'error';
  category: string;
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: string;
}

// ============================================================================
// DUMMY DATA GENERATORS
// ============================================================================

export const getExecutiveSummaryData = (): ExecutiveSummaryMetrics => ({
  activeClients: 247,
  monthlyRevenueCollected: 342500,
  monthlyRevenuePending: 87300,
  avgPlacementRate: 67.5,
  monthlyPlacements: 23,
  totalPlacements: 1847,
  trend: {
    activeClients: 12.3,
    revenue: 18.7,
    placements: 8.2,
  },
});

export const getSalesMetricsData = (): SalesMetrics => ({
  enrolledThisMonth: 34,
  revenueCollectedUpfront: 125000,
  conversionRate: 72.5,
  avgDealSize: 3676,
  technologyDistribution: [
    { name: 'Python', count: 52, percentage: 21.1 },
    { name: 'Java', count: 48, percentage: 19.4 },
    { name: 'JavaScript', count: 43, percentage: 17.4 },
    { name: 'React', count: 38, percentage: 15.4 },
    { name: 'AWS', count: 32, percentage: 13.0 },
    { name: '.NET', count: 22, percentage: 8.9 },
    { name: 'Others', count: 12, percentage: 4.9 },
  ],
  pipelineByStage: [
    { stage: 'Sales', count: 45, value: 165000 },
    { stage: 'Resume', count: 67, value: 246000 },
    { stage: 'Marketing', count: 89, value: 327000 },
    { stage: 'Placed', count: 46, value: 168000 },
  ],
  topTechnologies: ['Python', 'Java', 'JavaScript', 'React', 'AWS'],
});

export const getResumeMetricsData = (): ResumeMetrics => ({
  inProcess: 67,
  completed: 189,
  inVerification: 23,
  notResponding: 12,
  backedOut: 8,
  avgTimeInResume: 14.5,
  completionRate: 89.3,
  dailyCompletionTrend: [
    { date: '2025-10-15', count: 8 },
    { date: '2025-10-16', count: 12 },
    { date: '2025-10-17', count: 10 },
    { date: '2025-10-18', count: 15 },
    { date: '2025-10-19', count: 9 },
    { date: '2025-10-20', count: 14 },
    { date: '2025-10-21', count: 11 },
  ],
});

export const getMarketingMetricsData = (): MarketingMetrics => ({
  totalRecruiters: 8,
  interviewsToday: 12,
  interviewsThisMonth: 156,
  finalRoundsThisMonth: 34,
  placementsThisMonth: 23,
  topPerformer: {
    name: 'Sarah Johnson',
    placementCount: 7,
    successRate: 78.5,
  },
  candidatesOnHold: 18,
  candidateBackouts: 6,
  recruiterBandwidth: [
    {
      id: 1,
      name: 'Sarah Johnson',
      assignedCandidates: 32,
      activeInterviews: 18,
      finalRounds: 6,
      placements: 7,
      successRate: 78.5,
      utilizationRate: 92,
    },
    {
      id: 2,
      name: 'Michael Chen',
      assignedCandidates: 28,
      activeInterviews: 15,
      finalRounds: 4,
      placements: 5,
      successRate: 71.2,
      utilizationRate: 85,
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      assignedCandidates: 25,
      activeInterviews: 12,
      finalRounds: 5,
      placements: 4,
      successRate: 68.4,
      utilizationRate: 78,
    },
    {
      id: 4,
      name: 'David Kim',
      assignedCandidates: 30,
      activeInterviews: 16,
      finalRounds: 3,
      placements: 3,
      successRate: 65.8,
      utilizationRate: 88,
    },
    {
      id: 5,
      name: 'Amanda White',
      assignedCandidates: 22,
      activeInterviews: 10,
      finalRounds: 2,
      placements: 2,
      successRate: 63.2,
      utilizationRate: 72,
    },
    {
      id: 6,
      name: 'James Wilson',
      assignedCandidates: 27,
      activeInterviews: 14,
      finalRounds: 4,
      placements: 1,
      successRate: 58.9,
      utilizationRate: 82,
    },
    {
      id: 7,
      name: 'Lisa Thompson',
      assignedCandidates: 19,
      activeInterviews: 8,
      finalRounds: 1,
      placements: 1,
      successRate: 55.6,
      utilizationRate: 65,
    },
    {
      id: 8,
      name: 'Robert Martinez',
      assignedCandidates: 24,
      activeInterviews: 11,
      finalRounds: 2,
      placements: 0,
      successRate: 52.3,
      utilizationRate: 75,
    },
  ],
  placementsByTechnology: [
    { tech: 'Python', count: 8 },
    { tech: 'Java', count: 6 },
    { tech: 'React', count: 5 },
    { tech: 'AWS', count: 4 },
  ],
  avgTimeToPlacement: 45.3,
});

export const getRevenueMetricsData = (): RevenueMetrics => ({
  totalRevenue: 2847600,
  subscriptionRevenue: 1824500,
  placementRevenue: 1023100,
  outstandingBalance: 387200,
  creditBalance: 45800,
  paymentSuccessRate: 94.3,
  revenueByMonth: [
    { month: 'Apr', subscription: 145000, placement: 78000 },
    { month: 'May', subscription: 162000, placement: 85000 },
    { month: 'Jun', subscription: 158000, placement: 92000 },
    { month: 'Jul', subscription: 175000, placement: 88000 },
    { month: 'Aug', subscription: 183000, placement: 95000 },
    { month: 'Sep', subscription: 179000, placement: 102000 },
    { month: 'Oct', subscription: 192000, placement: 108000 },
  ],
  topPayingClients: [
    { name: 'TechCorp Solutions', amount: 45000 },
    { name: 'Digital Innovations Inc', amount: 38500 },
    { name: 'CloudTech Systems', amount: 32000 },
    { name: 'DataFlow Analytics', amount: 28900 },
    { name: 'AI Ventures LLC', amount: 25600 },
  ],
});

export const getSalesPersonalData = (salesPersonName: string): SalesPersonalMetrics => ({
  myEnrolledCandidates: 34,
  myRevenueCollected: 125000,
  myActiveClients: 42,
  myAvgDealSize: 3676,
  myTechDistribution: [
    { name: 'Python', count: 12 },
    { name: 'Java', count: 9 },
    { name: 'JavaScript', count: 8 },
    { name: 'React', count: 5 },
  ],
  myClientsByStage: [
    {
      stage: 'Sales',
      count: 8,
      clients: [
        { id: 1, name: 'John Doe', techStack: 'Python, AWS', enrollmentDate: '2025-10-15' },
        { id: 2, name: 'Jane Smith', techStack: 'Java, React', enrollmentDate: '2025-10-18' },
      ],
    },
    {
      stage: 'Resume',
      count: 12,
      clients: [
        { id: 3, name: 'Mike Johnson', techStack: 'JavaScript', enrollmentDate: '2025-10-10' },
      ],
    },
    {
      stage: 'Marketing',
      count: 15,
      clients: [],
    },
    {
      stage: 'Placed',
      count: 7,
      clients: [],
    },
  ],
  myMonthlyTarget: 150000,
  myTargetProgress: 83.3,
  myRecentClients: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      techStack: 'Python, AWS',
      stage: 'Sales',
      enrollmentDate: '2025-10-15',
      amount: 3500,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      techStack: 'Java, React',
      stage: 'Resume',
      enrollmentDate: '2025-10-18',
      amount: 4200,
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.j@example.com',
      techStack: 'JavaScript',
      stage: 'Marketing',
      enrollmentDate: '2025-10-10',
      amount: 3800,
    },
  ],
});

export const getMarketingPersonalData = (): MarketingPersonalMetrics => ({
  teamSize: 8,
  teamInterviewsToday: 12,
  teamInterviewsThisMonth: 156,
  teamFinalRounds: 34,
  teamPlacements: 23,
  topRecruiter: {
    name: 'Sarah Johnson',
    placements: 7,
  },
  atRiskCandidates: [
    {
      id: 1,
      name: 'Alex Turner',
      recruiter: 'David Kim',
      reason: 'No interviews in 14 days',
      daysInactive: 14,
      techStack: 'Python, AWS',
    },
    {
      id: 2,
      name: 'Maria Garcia',
      recruiter: 'Lisa Thompson',
      reason: '3 consecutive rejections',
      rejectionCount: 3,
      techStack: 'Java, Spring',
    },
    {
      id: 3,
      name: 'Chris Lee',
      recruiter: 'Robert Martinez',
      reason: 'No response to follow-ups',
      daysNoResponse: 7,
      techStack: 'React, Node.js',
    },
  ],
  upcomingInterviews: [
    {
      id: 1,
      candidateName: 'Sarah Mitchell',
      recruiterName: 'Sarah Johnson',
      company: 'TechCorp',
      scheduledTime: '2025-10-22T10:00:00',
      interviewType: 'Technical',
      round: 1,
    },
    {
      id: 2,
      candidateName: 'Daniel Brown',
      recruiterName: 'Michael Chen',
      company: 'DataFlow Inc',
      scheduledTime: '2025-10-22T14:00:00',
      interviewType: 'Final',
      round: 3,
    },
  ],
});

export const getRecruiterPersonalData = (recruiterName: string): RecruiterPersonalMetrics => ({
  myAssignedCandidates: 32,
  myInterviewsThisWeek: 8,
  myPlacementsThisMonth: 7,
  mySuccessRate: 78.5,
  myCandidatesByStage: [
    {
      stage: 'Active',
      count: 18,
      candidates: [
        { id: 1, name: 'John Doe', techStack: 'Python', lastActivity: '2025-10-20', status: 'Searching' },
        { id: 2, name: 'Jane Smith', techStack: 'Java', lastActivity: '2025-10-21', status: 'Searching' },
      ],
    },
    {
      stage: 'Interview Scheduled',
      count: 8,
      candidates: [
        { id: 3, name: 'Mike Wilson', techStack: 'React', interviewDate: '2025-10-22', company: 'TechCorp' },
      ],
    },
    {
      stage: 'Final Round',
      count: 4,
      candidates: [
        { id: 4, name: 'Sarah Lee', techStack: 'AWS', interviewDate: '2025-10-23', company: 'CloudSys' },
      ],
    },
    {
      stage: 'Placed',
      count: 2,
      candidates: [],
    },
  ],
  myTodayInterviews: [
    {
      id: 1,
      candidateName: 'John Doe',
      company: 'TechCorp Solutions',
      time: '10:00 AM',
      type: 'Technical',
      round: 1,
      meetingLink: 'https://zoom.us/j/123456789',
    },
    {
      id: 2,
      candidateName: 'Sarah Mitchell',
      company: 'Digital Innovations',
      time: '2:00 PM',
      type: 'HR',
      round: 1,
      meetingLink: 'https://teams.microsoft.com/l/meetup',
    },
  ],
  myUpcomingInterviews: [
    {
      id: 3,
      candidateName: 'Mike Wilson',
      company: 'CloudTech',
      date: '2025-10-22',
      time: '11:00 AM',
      type: 'Technical',
      round: 2,
    },
    {
      id: 4,
      candidateName: 'Emma Davis',
      company: 'DataFlow Analytics',
      date: '2025-10-23',
      time: '3:00 PM',
      type: 'Final',
      round: 3,
    },
  ],
  myRanking: 1,
  totalRecruiters: 8,
});

export const getDashboardAlerts = (role: string): DashboardAlert[] => {
  const alerts: DashboardAlert[] = [];

  if (role === 'Admin') {
    alerts.push(
      {
        id: 1,
        type: 'warning',
        category: 'payment',
        title: 'Overdue Payments',
        message: '12 clients have payments overdue by more than 7 days',
        actionUrl: '/accounting?status=overdue',
        createdAt: '2025-10-21T08:00:00',
      },
      {
        id: 2,
        type: 'info',
        category: 'resume',
        title: 'Candidates Not Responding',
        message: '8 candidates in resume stage have not responded in 5+ days',
        actionUrl: '/clients?stage=resume&status=not_responding',
        createdAt: '2025-10-21T09:30:00',
      },
      {
        id: 3,
        type: 'success',
        category: 'placement',
        title: 'Monthly Target Achieved',
        message: 'Congratulations! Placement target of 20 has been exceeded',
        createdAt: '2025-10-20T16:00:00',
      }
    );
  } else if (role === 'Sales_Executive') {
    alerts.push(
      {
        id: 1,
        type: 'info',
        category: 'follow_up',
        title: 'Follow-ups Due',
        message: '5 prospects need follow-up calls today',
        actionUrl: '/clients?status=follow_up_due',
        createdAt: '2025-10-21T08:00:00',
      },
      {
        id: 2,
        type: 'success',
        category: 'target',
        title: 'Target Progress',
        message: 'You are at 83% of your monthly revenue target',
        createdAt: '2025-10-21T07:00:00',
      }
    );
  } else if (role === 'Marketing_Manager') {
    alerts.push(
      {
        id: 1,
        type: 'warning',
        category: 'bandwidth',
        title: 'High Recruiter Utilization',
        message: '3 recruiters are at >90% capacity',
        actionUrl: '/dashboard#bandwidth',
        createdAt: '2025-10-21T10:00:00',
      },
      {
        id: 2,
        type: 'info',
        category: 'interview',
        title: 'Upcoming Interviews',
        message: '12 interviews scheduled for today across all recruiters',
        createdAt: '2025-10-21T07:00:00',
      }
    );
  } else if (role === 'Recruiter') {
    alerts.push(
      {
        id: 1,
        type: 'info',
        category: 'interview',
        title: "Today's Schedule",
        message: 'You have 2 interviews scheduled for today',
        actionUrl: '/dashboard#interviews',
        createdAt: '2025-10-21T07:00:00',
      },
      {
        id: 2,
        type: 'success',
        category: 'performance',
        title: 'Top Performer',
        message: 'You are ranked #1 among all recruiters this month!',
        createdAt: '2025-10-20T18:00:00',
      }
    );
  } else if (role === 'Resume_Writer') {
    alerts.push(
      {
        id: 1,
        type: 'warning',
        category: 'urgent',
        title: 'Urgent Resumes',
        message: '3 resumes are due within 24 hours',
        actionUrl: '/dashboard#urgent',
        createdAt: '2025-10-21T08:00:00',
      },
      {
        id: 2,
        type: 'info',
        category: 'review',
        title: 'Pending Reviews',
        message: '5 resumes are awaiting client feedback',
        actionUrl: '/dashboard#pending',
        createdAt: '2025-10-21T09:00:00',
      },
      {
        id: 3,
        type: 'success',
        category: 'performance',
        title: 'Quality Score',
        message: 'Your quality score is 94.5% - Excellent work!',
        createdAt: '2025-10-20T17:00:00',
      }
    );
  }

  return alerts;
};

export const getResumeWriterPersonalData = (writerName: string): ResumeWriterPersonalMetrics => ({
  myAssignedClients: 28,
  myCompletedThisMonth: 19,
  myInProgress: 9,
  myAvgCompletionTime: 5.2,
  myCompletionRate: 95.8,
  myPendingReview: 5,
  myClientsByStatus: [
    {
      status: 'New Assignment',
      count: 4,
      clients: [
        {
          id: 1,
          name: 'Alex Turner',
          techStack: 'Python, AWS',
          assignedDate: '2025-10-20',
          dueDate: '2025-10-25',
          priority: 'Normal',
        },
        {
          id: 2,
          name: 'Sarah Mitchell',
          techStack: 'Java, Spring Boot',
          assignedDate: '2025-10-21',
          dueDate: '2025-10-26',
          priority: 'High',
        },
      ],
    },
    {
      status: 'In Progress',
      count: 5,
      clients: [
        {
          id: 3,
          name: 'Mike Johnson',
          techStack: 'React, Node.js',
          assignedDate: '2025-10-18',
          dueDate: '2025-10-23',
          priority: 'Urgent',
          progress: 75,
        },
      ],
    },
    {
      status: 'Pending Review',
      count: 5,
      clients: [
        {
          id: 4,
          name: 'Emma Davis',
          techStack: 'DevOps, Kubernetes',
          completedDate: '2025-10-19',
          sentForReview: '2025-10-19',
        },
      ],
    },
    {
      status: 'Completed',
      count: 14,
      clients: [],
    },
  ],
  myRecentCompletions: [
    {
      id: 1,
      clientName: 'John Doe',
      techStack: 'Python, ML',
      completedDate: '2025-10-20',
      timeToComplete: 4.5,
      clientRating: 5,
      feedback: 'Excellent work!',
    },
    {
      id: 2,
      clientName: 'Jane Smith',
      techStack: 'JavaScript, React',
      completedDate: '2025-10-19',
      timeToComplete: 6.0,
      clientRating: 5,
      feedback: 'Very professional resume',
    },
    {
      id: 3,
      clientName: 'David Brown',
      techStack: 'Java, Microservices',
      completedDate: '2025-10-18',
      timeToComplete: 5.5,
      clientRating: 4,
      feedback: 'Good quality',
    },
  ],
  myQualityScore: 94.5,
  myRanking: 2,
  totalWriters: 5,
  urgentTasks: [
    {
      id: 1,
      clientName: 'Chris Lee',
      techStack: 'DevOps, AWS',
      dueDate: '2025-10-22',
      hoursRemaining: 18,
      priority: 'Urgent',
      progress: 60,
    },
    {
      id: 2,
      clientName: 'Maria Garcia',
      techStack: 'Data Science, Python',
      dueDate: '2025-10-22',
      hoursRemaining: 20,
      priority: 'Urgent',
      progress: 40,
    },
    {
      id: 3,
      clientName: 'Robert Martinez',
      techStack: '.NET, Azure',
      dueDate: '2025-10-23',
      hoursRemaining: 42,
      priority: 'High',
      progress: 25,
    },
  ],
});
