"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../sharedComponents/sidebar";
import { InactivityWarning } from "../sharedComponents/inactivityWarning";
import { useInactivity } from "../../hooks/useInactivityTimeout";
import permissions from "../utils/permissions";
import { useAuth } from "../../contexts/authContext";
import { mapAzureRoleToAppRole } from "../utils/roleMapping";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { roles } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const [sidebarWidth, setSidebarWidth] = useState(80); // Default collapsed width
  const [userRole, setUserRole] = useState("default");
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Extract role from Azure AD
  useEffect(() => {
    if (roles && roles.length > 0) {
      const mappedRole = mapAzureRoleToAppRole(roles);
      setUserRole(mappedRole);
    }
  }, [roles]);

  // Inactivity timeout hook
  const { isInactive, handleExtendSession } = useInactivity(30, 60); // 30 minutes timeout, 60 seconds countdown

  // Prevent sidebar flash on reload
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 0);
    return () => clearTimeout(timer);
  }, []);

  // Show loading state to prevent sidebar flash
  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div style={{ width: `${sidebarWidth}px` }} className="bg-white border-r border-gray-200" />
        <main className="flex-1">
          <div className="h-full bg-background" />
        </main>
      </div>
    );
  }

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
