"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/authContext";
import { useRouter } from "next/navigation";
import { WIPBanner } from "./components/WIPBanner";
import { RoleSelector } from "./components/RoleSelector";
import { AdminDashboard } from "./dashboards/AdminDashboard";
import { SalesDashboard } from "./dashboards/SalesDashboard";
import { MarketingDashboard } from "./dashboards/MarketingDashboard";
import { RecruiterDashboard } from "./dashboards/RecruiterDashboard";
import { ResumeWriterDashboard } from "./dashboards/ResumeWriterDashboard";
import { AnnouncementBanner } from "../leaderboard/components/AnnouncementBanner";
import { ComingSoon } from "./components/ComingSoon";
import Spinner from "../../components/ui/spinner";

export default function Dashboard() {
  const { isAuthenticated, isInitialized, login, roles } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine actual user role
  const actualUserRole = roles.includes("Admin")
    ? "Admin"
    : roles.includes("Sales_Executive")
    ? "Sales_Executive"
    : roles.includes("Marketing_Manager")
    ? "Marketing_Manager"
    : roles.includes("Senior_Recruiter")
    ? "Senior_Recruiter"
    : roles.includes("Recruiter")
    ? "Recruiter"
    : roles.includes("Resume_Writer")
    ? "Resume_Writer"
    : null;

  // For admins, allow switching between role views
  const [viewingRole, setViewingRole] = useState<string>(actualUserRole || "Admin");

  // Update viewing role when actual role changes
  useEffect(() => {
    if (actualUserRole) {
      setViewingRole(actualUserRole);
    }
  }, [actualUserRole]);

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!isInitialized) return;

      if (!isAuthenticated) {
        const loginSuccess = await login();
        if (!loginSuccess) {
          setError("Please log in to view the dashboard.");
          router.push("/login");
          return;
        }
      }

      try {
        // Simulate loading dashboard data
        await new Promise((resolve) => setTimeout(resolve, 800));
        setLoading(false);
      } catch (err: any) {
        console.error("Error in initializeDashboard:", err);
        setError(err.message || "Failed to load dashboard data.");
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [isAuthenticated, isInitialized, login, router]);

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner variant="ripple" size="xl" text="Loading your dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 w-full">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!actualUserRole) {
    return (
      <div className="p-6 w-full">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-900">Access Denied</p>
          <p className="text-xs text-red-700 mt-1">
            You do not have a valid role assigned. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    // Only show actual dashboards for Admin role
    if (actualUserRole === "Admin") {
      switch (viewingRole) {
        case "Admin":
          return <AdminDashboard />;
        case "Sales_Executive":
          return <SalesDashboard />;
        case "Marketing_Manager":
          return <MarketingDashboard />;
        case "Senior_Recruiter":
          return <RecruiterDashboard />;
        case "Recruiter":
          return <RecruiterDashboard />;
        case "Resume_Writer":
          return <ResumeWriterDashboard />;
        default:
          return <AdminDashboard />;
      }
    }

    // For all other roles, show Coming Soon page
    return <ComingSoon />;
  };

  const getDashboardTitle = () => {
    const titles = {
      Admin: "Admin Command Center",
      Sales_Executive: "Sales Performance Hub",
      Marketing_Manager: "Marketing & Recruiter Hub",
      Senior_Recruiter: "Senior Recruiter Dashboard",
      Recruiter: "My Candidate Dashboard",
      Resume_Writer: "Resume Writer Dashboard",
    };
    return titles[viewingRole as keyof typeof titles] || "Dashboard";
  };

  const getDashboardSubtitle = () => {
    const subtitles = {
      Admin: "Complete business oversight with real-time metrics across all departments",
      Sales_Executive: "Track your sales performance, pipeline, and revenue targets",
      Marketing_Manager: "Monitor recruiter performance, interviews, and placement metrics",
      Senior_Recruiter: "Manage your team, monitor performance, and track success metrics",
      Recruiter: "Manage your candidates, interviews, and track your success",
      Resume_Writer: "Manage resume assignments, track quality, and deliver excellence",
    };
    return subtitles[viewingRole as keyof typeof subtitles] || "";
  };

  return (
    <div className={actualUserRole === "Admin" ? "p-4 sm:p-6 w-full max-w-full overflow-x-hidden box-border" : ""}>
      {/* Only show header, banners, and selectors for Admin */}
      {actualUserRole === "Admin" && (
        <>
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex flex-col gap-3">
              {/* Title Row */}
              <div>
                <h1 className="text-2xl font-bold text-[#682A53]">{getDashboardTitle()}</h1>
                <p className="text-xs text-gray-600 mt-0.5">{getDashboardSubtitle()}</p>
              </div>

              {/* Admin Role Selector */}
              <RoleSelector currentRole={viewingRole} onRoleChange={setViewingRole} />
            </div>
          </div>

          {/* WIP Banner */}
          <WIPBanner />

          {/* Announcement Banner */}
          <AnnouncementBanner />
        </>
      )}

      {/* Dashboard Content */}
      {renderDashboard()}
    </div>
  );
}
