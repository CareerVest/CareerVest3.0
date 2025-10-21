interface PermissionSection {
  view: boolean;
  edit: boolean | { [key: string]: boolean };
}

interface DashboardPermissions {
  viewDashboard: boolean;
  [key: string]: boolean | PermissionSection;
}

interface ClientPermissions {
  viewClientsMenu: boolean;
  basicInfo: PermissionSection;
  marketingInfo: PermissionSection;
  subscriptionInfo: PermissionSection;
  postPlacementInfo: PermissionSection;
  addClient: boolean;
  viewClient: boolean;
  editClient: boolean;
  deleteClient: boolean;
  [key: string]: boolean | PermissionSection;
}

interface EmployeePermissions {
  viewEmployeesMenu: boolean;
  basicInfo: PermissionSection;
  addEmployee: boolean;
  viewEmployee: boolean;
  editEmployee: boolean;
  deleteEmployee: boolean;
  [key: string]: boolean | PermissionSection;
}

interface InterviewPermissions {
  viewInterviewsMenu: boolean;
  basicInfo: PermissionSection;
  addInterview: boolean;
  viewInterview: boolean;
  editInterview: boolean;
  deleteInterview: boolean;
  [key: string]: boolean | PermissionSection;
}

interface InterviewChainPermissions {
  viewInterviewChainsMenu: boolean;
  basicInfo: PermissionSection;
  addInterviewChain: boolean;
  viewInterviewChain: boolean;
  editInterviewChain: boolean;
  deleteInterviewChain: boolean;
  [key: string]: boolean | PermissionSection;
}

interface PipelinePermissions {
  viewPipelinesMenu: boolean;
  viewDashboard: boolean;
  addClientToPipeline: boolean;
  moveToResume: boolean;
  moveToMarketing: boolean;
  moveToCompleted: boolean;
  moveToBackedOut: boolean;
  moveToRemarketing: boolean;
  moveToOnHold: boolean;
  performActions: boolean;
  assignRecruiter: boolean;
  [key: string]: boolean | PermissionSection;
}

interface SettingsPermissions {
  viewSettingsMenu: boolean;
  edit: boolean;
  [key: string]: boolean | PermissionSection;
}

interface JobsPermissions {
  viewJobsMenu: boolean;
  viewBatches: boolean;
  applyToJobs: boolean;
  skipJobs: boolean;
  viewJobDetails: boolean;
  switchClients: boolean;
  [key: string]: boolean | PermissionSection;
}

export interface AppPermissions {
  dashboard: Record<string, DashboardPermissions>;
  clients: Record<string, ClientPermissions>;
  employees: Record<string, EmployeePermissions>;
  interviews: Record<string, InterviewPermissions>;
  interviewChains: Record<string, InterviewChainPermissions>;
  pipelines: Record<string, PipelinePermissions>;
  jobs?: Record<string, JobsPermissions>;
  accounting?: Record<string, any>;
  supervisorsMenu?: Record<string, any>;
  leaderboard?: Record<string, any>;
  settings: Record<string, SettingsPermissions>;
}

const permissions: AppPermissions = {
  dashboard: {
    Admin: {
      viewDashboard: true,
    },
    Senior_Recruiter: {
      viewDashboard: true,
    },
    Sales_Executive: {
      viewDashboard: true,
    },
    Recruiter: {
      viewDashboard: true,
    },
    Resume_Writer: {
      viewDashboard: true,
    },
    Marketing_Manager: {
      viewDashboard: true,
    },
    default: {
      viewDashboard: true,
    },
  },
  clients: {
    Admin: {
      viewClientsMenu: true,
      basicInfo: { view: true, edit: true },
      marketingInfo: { view: true, edit: true },
      subscriptionInfo: { view: true, edit: true },
      postPlacementInfo: { view: true, edit: true },
      addClient: true,
      viewClient: true,
      editClient: true,
      deleteClient: true,
    },
    Senior_Recruiter: {
      viewClientsMenu: true,
      basicInfo: { view: true, edit: false },
      marketingInfo: {
        view: true,
        edit: {
          marketingStartDate: true,
          marketingEndDate: true,
          marketingEmailID: true,
          marketingEmailPassword: true,
          assignedRecruiterID: true,
          clientStatus: false,
          placedDate: false,
          backedOutDate: false,
          backedOutReason: false,
        },
      },
      subscriptionInfo: { view: false, edit: false },
      postPlacementInfo: { view: false, edit: false },
      addClient: false,
      viewClient: true,
      editClient: true,
      deleteClient: false,
    },
    Sales_Executive: {
      viewClientsMenu: true,
      basicInfo: { view: true, edit: true },
      marketingInfo: { view: true, edit: true },
      subscriptionInfo: { view: true, edit: true },
      postPlacementInfo: { view: false, edit: false },
      addClient: true,
      viewClient: true,
      editClient: true,
      deleteClient: false,
    },
    Recruiter: {
      viewClientsMenu: false,
      basicInfo: { view: true, edit: false },
      marketingInfo: { view: false, edit: false },
      subscriptionInfo: { view: false, edit: false },
      postPlacementInfo: { view: false, edit: false },
      addClient: false,
      viewClient: true,
      editClient: false,
      deleteClient: false,
    },
    Resume_Writer: {
      viewClientsMenu: false,
      basicInfo: { view: true, edit: false },
      marketingInfo: { view: false, edit: false },
      subscriptionInfo: { view: false, edit: false },
      postPlacementInfo: { view: false, edit: false },
      addClient: false,
      viewClient: true,
      editClient: false,
      deleteClient: false,
    },
    Marketing_Manager: {
      viewClientsMenu: true,
      basicInfo: { view: true, edit: true },
      marketingInfo: {
        view: true,
        edit: {
          marketingStartDate: true,
          marketingEndDate: true,
          marketingEmailID: true,
          marketingEmailPassword: true,
          assignedRecruiterID: true,
          clientStatus: true,
          placedDate: true,
          backedOutDate: true,
          backedOutReason: true,
        },
      },
      subscriptionInfo: { view: false, edit: false },
      postPlacementInfo: { view: false, edit: false },
      addClient: false,
      viewClient: true,
      editClient: true,
      deleteClient: false,
    },
    default: {
      viewClientsMenu: true,
      basicInfo: { view: true, edit: false },
      marketingInfo: { view: false, edit: false },
      subscriptionInfo: { view: false, edit: false },
      postPlacementInfo: { view: false, edit: false },
      addClient: false,
      viewClient: true,
      editClient: false,
      deleteClient: false,
    },
  },
  employees: {
    Admin: {
      viewEmployeesMenu: true,
      basicInfo: { view: true, edit: true },
      addEmployee: true,
      viewEmployee: true,
      editEmployee: true,
      deleteEmployee: true,
    },
    Senior_Recruiter: {
      viewEmployeesMenu: false,
      basicInfo: { view: true, edit: { self: true } },
      addEmployee: false,
      viewEmployee: true,
      editEmployee: false,
      deleteEmployee: false,
    },
    Sales_Executive: {
      viewEmployeesMenu: false,
      basicInfo: { view: true, edit: { self: true } },
      addEmployee: false,
      viewEmployee: true,
      editEmployee: false,
      deleteEmployee: false,
    },
    Recruiter: {
      viewEmployeesMenu: false,
      basicInfo: { view: true, edit: { self: true } },
      addEmployee: false,
      viewEmployee: true,
      editEmployee: false,
      deleteEmployee: false,
    },
    Resume_Writer: {
      viewEmployeesMenu: false,
      basicInfo: { view: true, edit: { self: true } },
      addEmployee: false,
      viewEmployee: true,
      editEmployee: false,
      deleteEmployee: false,
    },
    Marketing_Manager: {
      viewEmployeesMenu: true,
      basicInfo: { view: true, edit: false },
      addEmployee: false,
      viewEmployee: true,
      editEmployee: false,
      deleteEmployee: false,
    },
    default: {
      viewEmployeesMenu: false,
      basicInfo: { view: false, edit: false },
      addEmployee: false,
      viewEmployee: false,
      editEmployee: false,
      deleteEmployee: false,
    },
  },
  interviews: {
    Admin: {
      viewInterviewsMenu: false,
      basicInfo: { view: true, edit: true },
      addInterview: true,
      viewInterview: true,
      editInterview: true,
      deleteInterview: true,
    },
    Recruiter: {
      viewInterviewsMenu: false,
      basicInfo: { view: false, edit: false },
      addInterview: false,
      viewInterview: false,
      editInterview: false,
      deleteInterview: false,
    },
    Senior_Recruiter: {
      viewInterviewsMenu: false,
      basicInfo: { view: false, edit: false },
      addInterview: false,
      viewInterview: false,
      editInterview: false,
      deleteInterview: false,
    },
    Sales_Executive: {
      viewInterviewsMenu: false,
      basicInfo: { view: false, edit: false },
      addInterview: false,
      viewInterview: false,
      editInterview: false,
      deleteInterview: false,
    },
    Resume_Writer: {
      viewInterviewsMenu: false,
      basicInfo: { view: false, edit: false },
      addInterview: false,
      viewInterview: false,
      editInterview: false,
      deleteInterview: false,
    },
    Marketing_Manager: {
      viewInterviewsMenu: false,
      basicInfo: { view: true, edit: true },
      addInterview: true,
      viewInterview: true,
      editInterview: true,
      deleteInterview: true,
    },
    default: {
      viewInterviewsMenu: false,
      basicInfo: { view: false, edit: false },
      addInterview: false,
      viewInterview: false,
      editInterview: false,
      deleteInterview: false,
    },
  },
  interviewChains: {
    Admin: {
      viewInterviewChainsMenu: true,
      basicInfo: { view: true, edit: true },
      addInterviewChain: true,
      viewInterviewChain: true,
      editInterviewChain: true,
      deleteInterviewChain: true,
    },
    Recruiter: {
      viewInterviewChainsMenu: true,
      basicInfo: { view: true, edit: true },
      addInterviewChain: true,
      viewInterviewChain: true,
      editInterviewChain: false,
      deleteInterviewChain: true,
    },
    Senior_Recruiter: {
      viewInterviewChainsMenu: true,
      basicInfo: { view: true, edit: true },
      addInterviewChain: false,
      viewInterviewChain: true,
      editInterviewChain: false,
      deleteInterviewChain: false,
    },
    Sales_Executive: {
      viewInterviewChainsMenu: true,
      basicInfo: { view: true, edit: true },
      addInterviewChain: true,
      viewInterviewChain: true,
      editInterviewChain: false,
      deleteInterviewChain: true,
    },
    Resume_Writer: {
      viewInterviewChainsMenu: true,
      basicInfo: { view: true, edit: false },
      addInterviewChain: false,
      viewInterviewChain: true,
      editInterviewChain: false,
      deleteInterviewChain: false,
    },
    Marketing_Manager: {
      viewInterviewChainsMenu: true,
      basicInfo: { view: true, edit: true },
      addInterviewChain: true,
      viewInterviewChain: true,
      editInterviewChain: true,
      deleteInterviewChain: true,
    },
    default: {
      viewInterviewChainsMenu: true,
      basicInfo: { view: false, edit: false },
      addInterviewChain: false,
      viewInterviewChain: true,
      editInterviewChain: false,
      deleteInterviewChain: false,
    },
  },
  pipelines: {
    Admin: {
      viewPipelinesMenu: true,
      viewDashboard: true,
      addClientToPipeline: true,
      moveToResume: true,
      moveToMarketing: true,
      moveToCompleted: true,
      moveToBackedOut: true,
      moveToRemarketing: true,
      moveToOnHold: true,
      performActions: true,
      assignRecruiter: true,
      blockClient: true, // All stages
      unblockClient: true, // All stages
    },
    Sales_Executive: {
      viewPipelinesMenu: true,
      viewDashboard: true,
      addClientToPipeline: true,
      moveToResume: true,
      moveToMarketing: false,
      moveToCompleted: false,
      moveToBackedOut: true,
      moveToRemarketing: false,
      moveToOnHold: true,
      performActions: true,
      assignRecruiter: false,
      blockClient: true, // Only Sales stage, only assigned clients (backend validates)
      unblockClient: true, // Only Sales stage, only assigned clients (backend validates)
    },
    Resume_Writer: {
      viewPipelinesMenu: true,
      viewDashboard: true,
      addClientToPipeline: false,
      moveToResume: false,
      moveToMarketing: true,
      moveToCompleted: false,
      moveToBackedOut: true,
      moveToRemarketing: false,
      moveToOnHold: true,
      performActions: true,
      assignRecruiter: false,
      blockClient: true, // Only Resume stage (backend validates)
      unblockClient: true, // Only Resume stage (backend validates)
    },
    Recruiter: {
      viewPipelinesMenu: true,
      viewDashboard: true,
      addClientToPipeline: false,
      moveToResume: false,
      moveToMarketing: false,
      moveToCompleted: true,
      moveToBackedOut: true,
      moveToRemarketing: false,
      moveToOnHold: true,
      performActions: true,
      assignRecruiter: true,
      blockClient: false, // Cannot block/unblock
      unblockClient: false, // Cannot block/unblock
    },
    Senior_Recruiter: {
      viewPipelinesMenu: true,
      viewDashboard: true,
      addClientToPipeline: false,
      moveToResume: false,
      moveToMarketing: false,
      moveToCompleted: true,
      moveToBackedOut: true,
      moveToRemarketing: false,
      moveToOnHold: true,
      performActions: true,
      assignRecruiter: true,
      blockClient: true, // Only Marketing/Remarketing stages (backend validates)
      unblockClient: true, // Only Marketing/Remarketing stages (backend validates)
    },
    Marketing_Manager: {
      viewPipelinesMenu: true,
      viewDashboard: true,
      addClientToPipeline: false,
      moveToResume: false,
      moveToMarketing: false,
      moveToCompleted: true,
      moveToBackedOut: true,
      moveToRemarketing: true,
      moveToOnHold: true,
      performActions: true,
      assignRecruiter: true,
      blockClient: true, // All stages except Sales and Resume (backend validates)
      unblockClient: true, // All stages except Sales and Resume (backend validates)
    },
    default: {
      viewPipelinesMenu: true,
      viewDashboard: false,
      addClientToPipeline: false,
      moveToResume: false,
      moveToMarketing: false,
      moveToCompleted: false,
      moveToBackedOut: false,
      moveToRemarketing: false,
      moveToOnHold: false,
      performActions: false,
      assignRecruiter: false,
      blockClient: false,
      unblockClient: false,
    },
  },
  jobs: {
    Admin: {
      viewJobsMenu: false,
      viewBatches: false,
      applyToJobs: false,
      skipJobs: false,
      viewJobDetails: false,
      switchClients: false,
    },
    Marketing_Manager: {
      viewJobsMenu: false,
      viewBatches: false,
      applyToJobs: false,
      skipJobs: false,
      viewJobDetails: false,
      switchClients: false,
    },
    Senior_Recruiter: {
      viewJobsMenu: false,
      viewBatches: false,
      applyToJobs: false,
      skipJobs: false,
      viewJobDetails: false,
      switchClients: false,
    },
    Recruiter: {
      viewJobsMenu: false,
      viewBatches: false,
      applyToJobs: false,
      skipJobs: false,
      viewJobDetails: false,
      switchClients: false,
    },
    Sales_Executive: {
      viewJobsMenu: false,
      viewBatches: false,
      applyToJobs: false,
      skipJobs: false,
      viewJobDetails: false,
      switchClients: false,
    },
    Resume_Writer: {
      viewJobsMenu: false,
      viewBatches: false,
      applyToJobs: false,
      skipJobs: false,
      viewJobDetails: false,
      switchClients: false,
    },
    default: {
      viewJobsMenu: false,
      viewBatches: false,
      applyToJobs: false,
      skipJobs: false,
      viewJobDetails: false,
      switchClients: false,
    },
  },
  accounting: {
    Admin: {
      viewAccountingMenu: true,
      edit: true,
      viewDashboard: true,
      viewTransactions: true,
      viewStudents: true,
      viewReports: true,
      viewAudit: true,
      addTransaction: true,
      editTransaction: true,
      deleteTransaction: true,
      addStudent: true,
      editStudent: true,
      deleteStudent: true,
      runReconciliation: true,
      exportReports: true,
    },
    Marketing_Manager: {
      viewAccountingMenu: false,
      edit: false,
    },
    default: {
      viewAccountingMenu: false,
      edit: false,
    },
  },
  supervisorsMenu: {
    Admin: {
      viewSupervisorsMenu: false,
    },
    Marketing_Manager: {
      viewSupervisorsMenu: false,
    },
    default: {
      viewSupervisorsMenu: false,
    },
  },
  leaderboard: {
    Admin: {
      viewLeaderboardMenu: true,
    },
    Marketing_Manager: {
      viewLeaderboardMenu: false,
    },
    Sales_Executive: {
      viewLeaderboardMenu: false,
    },
    Recruiter: {
      viewLeaderboardMenu: false,
    },
    Resume_Writer: {
      viewLeaderboardMenu: false,
    },
    default: {
      viewLeaderboardMenu: false,
    },
  },
  settings: {
    Admin: {
      viewSettingsMenu: false,
      edit: true,
    },
    Marketing_Manager: {
      viewSettingsMenu: false,
      edit: false,
    },
    default: {
      viewSettingsMenu: false,
      edit: false,
    },
  },
};

export default permissions;
