"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../sharedComponents/sidebar";
import { InactivityWarning } from "../sharedComponents/inactivityWarning";
import { useInactivity } from "../../hooks/useInactivityTimeout";
import { useAuth } from "../../contexts/authContext";
import permissions from "../utils/permissions";

export default function MarketingActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const [sidebarWidth, setSidebarWidth] = useState(80); // Default collapsed width
  const [userRole, setUserRole] = useState<string>("Admin"); // Default to Admin for demo
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Inactivity timeout hook
  const { isInactive, handleExtendSession } = useInactivity(30, 60); // 30 minutes timeout, 60 seconds countdown

  useEffect(() => {
    if (user) {
      setUserRole((user as any).role || "Admin");
    }
    // Set loading to false after initial render to prevent flash
    const timer = setTimeout(() => setIsLoading(false), 0);
    return () => clearTimeout(timer);
  }, [user]);

  // Show loading state to prevent sidebar flash
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div style={{ width: `${sidebarWidth}px` }} className="bg-white border-r border-gray-200" />
        <main className="flex-1">
          <div className="h-full bg-gray-50" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        permissions={permissions}
        userRole={userRole}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onWidthChange={setSidebarWidth}
      />
      <main
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="h-full overflow-auto">{children}</div>
      </main>

      <InactivityWarning
        isOpen={isInactive}
        onStayLoggedIn={handleExtendSession}
      />
    </div>
  );
}
