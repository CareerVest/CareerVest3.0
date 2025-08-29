"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../sharedComponents/sidebar";
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

  useEffect(() => {
    if (user) {
      setUserRole((user as any).role || "Admin");
    }
  }, [user]);

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
    </div>
  );
}
