"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/authContext";
import { useRouter } from "next/navigation";
import Sidebar from "../sharedComponents/sidebar";
import { InactivityWarning } from "../sharedComponents/inactivityWarning";
import { useInactivity } from "../../hooks/useInactivityTimeout";
import permissions from "../utils/permissions";

export default function AccountingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isInitialized, roles } = useAuth();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default
  const [sidebarWidth, setSidebarWidth] = useState(80); // Default collapsed width
  const [userRole, setUserRole] = useState("Admin"); // Default to Admin for demo

  // Inactivity timeout hook
  const { isInactive, handleExtendSession } = useInactivity(5, 60); // 5 minutes timeout, 60 seconds countdown

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check if user has accounting permissions
    if (isInitialized && isAuthenticated) {
      const hasAccountingAccess =
        roles.includes("Admin") || roles.includes("Accounting");
      if (!hasAccountingAccess) {
        router.push("/dashboard");
        return;
      }
    }
  }, [isAuthenticated, isInitialized, roles, router]);

  // Set user role based on roles array
  useEffect(() => {
    if (roles.length > 0) {
      if (roles.includes("Admin")) {
        setUserRole("Admin");
      } else if (roles.includes("Accounting")) {
        setUserRole("Accounting");
      } else if (roles.includes("Sales_Executive")) {
        setUserRole("Sales_Executive");
      } else if (roles.includes("Recruiter")) {
        setUserRole("Recruiter");
      } else {
        setUserRole("default");
      }
    }
  }, [roles]);

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-50vh w-full">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
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
