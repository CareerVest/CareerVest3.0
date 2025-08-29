"use client";

import React, { useState } from "react";
import Sidebar from "../sharedComponents/sidebar";
import { InactivityWarning } from "../sharedComponents/inactivityWarning";
import { useInactivity } from "../../hooks/useInactivityTimeout";
import permissions from "../utils/permissions";

export default function EmployeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const [sidebarWidth, setSidebarWidth] = useState(80); // Default collapsed width
  const [userRole, setUserRole] = useState("Admin"); // Default to Admin for demo

  // Inactivity timeout hook
  const { isInactive, handleExtendSession } = useInactivity(5, 60); // 5 minutes timeout, 60 seconds countdown

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        permissions={permissions}
        userRole={userRole}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onWidthChange={setSidebarWidth}
      />
      <main
        className="flex-1 overflow-auto transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
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
