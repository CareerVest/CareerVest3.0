"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../sharedComponents/sidebar";
import { InactivityWarning } from "../sharedComponents/inactivityWarning";
import { useInactivity } from "../../hooks/useInactivityTimeout";

// Mock permissions - you'll need to replace this with actual permissions from your auth context
const mockPermissions = {
  dashboard: {
    Admin: {
      viewDashboard: true,
    },
    User: {
      viewDashboard: true,
    },
  },
  clients: {
    Admin: {
      viewClientsMenu: true,
    },
    User: {
      viewClientsMenu: false,
    },
  },
  employees: {
    Admin: {
      viewEmployeesMenu: true,
    },
    User: {
      viewEmployeesMenu: false,
    },
  },
  interviewChains: {
    Admin: {
      viewInterviewChainsMenu: true,
    },
    User: {
      viewInterviewChainsMenu: true,
    },
  },
  interviews: {
    Admin: {
      viewInterviewsMenu: true,
    },
    User: {
      viewInterviewsMenu: true,
    },
  },
  supervisorsMenu: {
    Admin: {
      viewSupervisorsMenu: true,
    },
    User: {
      viewSupervisorsMenu: false,
    },
  },
  accounting: {
    Admin: {
      viewAccountingMenu: true,
    },
    User: {
      viewAccountingMenu: false,
    },
  },
  pipelines: {
    Admin: {
      viewPipelinesMenu: true,
    },
    User: {
      viewPipelinesMenu: false,
    },
  },
  settings: {
    Admin: {
      viewSettingsMenu: true,
    },
    User: {
      viewSettingsMenu: false,
    },
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState("Admin"); // Default to Admin for demo

  // Inactivity timeout hook
  const { isInactive, handleExtendSession } = useInactivity(5, 60); // 5 minutes timeout, 60 seconds countdown

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        permissions={mockPermissions}
        userRole={userRole}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-70"
        }`}
      >
        <div className="h-full">{children}</div>
      </main>

      <InactivityWarning
        isOpen={isInactive}
        onStayLoggedIn={handleExtendSession}
      />
    </div>
  );
}
