"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../sharedComponents/sidebar";
import { useAuth } from "../../contexts/authContext";

export default function MarketingActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [permissions, setPermissions] = useState<any>({});
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    if (user) {
      setUserRole((user as any).role || "user");
      // Set default permissions for marketing activity
      setPermissions({
        interviewChains: {
          user: {
            viewInterviewChainsMenu: true,
          },
          admin: {
            viewInterviewChainsMenu: true,
          },
        },
      });
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        permissions={permissions}
        userRole={userRole}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-20" : "ml-70"
        }`}
      >
        <div className="h-full overflow-auto">{children}</div>
      </main>
    </div>
  );
}
