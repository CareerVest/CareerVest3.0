"use client";

import { useState, useEffect } from "react";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import StandupDashboard from "./components/StandupDashboard";
import FilteredDashboard from "./components/FilteredDashboard";
import { useAuth } from "../../contexts/authContext";
import { useRouter } from "next/navigation";

export default function MarketingActivityPage() {
  const [standupMode, setStandupMode] = useState(true);
  const { isAuthenticated, isInitialized, user, login, roles } = useAuth();
  const router = useRouter();

  const userRole =
    roles.length > 0
      ? roles.includes("Admin")
        ? "Admin"
        : roles.includes("Sales_Executive")
        ? "Sales_Executive"
        : roles.includes("Senior_Recruiter")
        ? "Senior_Recruiter"
        : roles.includes("Recruiter")
        ? "Recruiter"
        : roles.includes("Resume_Writer")
        ? "Resume_Writer"
        : roles.includes("Marketing_Manager")
        ? "Marketing_Manager"
        : "default"
      : "default";

  useEffect(() => {
    if (!isInitialized) return;

    console.log("🔹 Auth State on Load:", {
      isAuthenticated,
      isInitialized,
      user,
      roles,
      userRole,
    });

    const checkAuthAndLoad = async () => {
      if (!isAuthenticated) {
        console.log(
          "❌ User Not Authenticated, Attempting Silent Re-authentication..."
        );
        try {
          const loginSuccess = await login();
          if (!loginSuccess) {
            console.log(
              "❌ Silent Re-authentication failed, Redirecting to /login..."
            );
            router.push("/login");
            return;
          }
        } catch (error) {
          console.error("❌ Re-authentication error:", error);
          router.push("/login");
          return;
        }
      }
    };

    checkAuthAndLoad();
  }, [isAuthenticated, isInitialized, router, login, roles]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-50vh w-full">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full max-w-full min-h-screen box-border flex flex-col">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 w-full max-w-full px-0 sm:px-4 gap-4 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#682A53]">
            Marketing Activity
          </h1>
          <div className="flex items-center space-x-2">
            <Switch
              id="standup-mode"
              checked={standupMode}
              onCheckedChange={setStandupMode}
              className="data-[state=checked]:bg-[#682A53] data-[state=unchecked]:bg-gray-200"
            />
            <Label
              htmlFor="standup-mode"
              className="text-[#682A53] whitespace-nowrap cursor-pointer text-sm sm:text-base"
            >
              Standup Mode
            </Label>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {standupMode ? (
        <StandupDashboard
          standupMode={standupMode}
          onStandupModeChange={setStandupMode}
        />
      ) : (
        <FilteredDashboard
          standupMode={standupMode}
          onStandupModeChange={setStandupMode}
        />
      )}
    </div>
  );
}
