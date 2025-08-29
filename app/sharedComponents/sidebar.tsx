"use client";

import React, { useState, useEffect } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { cn } from "../../lib/utils";
import {
  Gauge,
  Building2,
  Users,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users as InterviewIcon,
  GitBranch as InterviewChainIcon,
  BarChart3 as OrganizationChart,
  DollarSign,
  GitPullRequest,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../contexts/authContext";

interface SidebarProps {
  permissions: any;
  userRole: string;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: Gauge,
    path: "/",
    permissionKey: "viewDashboard",
    module: "dashboard",
  },
  {
    title: "Clients",
    icon: Building2,
    path: "/clients",
    permissionKey: "viewClientsMenu",
    module: "clients",
  },
  {
    title: "Employees",
    icon: Users,
    path: "/employees",
    permissionKey: "viewEmployeesMenu",
    module: "employees",
  },
  {
    title: "Marketing Activity",
    icon: TrendingUp,
    path: "/marketingActivity",
    permissionKey: "viewInterviewChainsMenu",
    module: "interviewChains",
  },
  {
    title: "Interviews",
    icon: InterviewIcon,
    path: "/interviews",
    permissionKey: "viewInterviewsMenu",
    module: "interviews",
  },
  {
    title: "Interview Chains",
    icon: InterviewChainIcon,
    path: "/interviewChains",
    permissionKey: "viewInterviewChainsMenu",
    module: "interviewChains",
  },
  {
    title: "Team Hierarchy",
    icon: OrganizationChart,
    path: "/supervisors",
    permissionKey: "viewSupervisorsMenu",
    module: "supervisorsMenu",
  },
  {
    title: "Accounting",
    icon: DollarSign,
    path: "/accounting",
    permissionKey: "viewAccountingMenu",
    module: "accounting",
  },
  {
    title: "Pipelines",
    icon: GitPullRequest,
    path: "/pipelines",
    permissionKey: "viewPipelinesMenu",
    module: "pipelines",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
    permissionKey: "viewSettingsMenu",
    module: "settings",
  },
];

export default function Sidebar({
  permissions,
  userRole,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user && !userData) {
      setUserData(user);
    }
  }, [user, userData]);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    router.push("/login");
  };

  if (!mounted) return null;

  return (
    <>
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-[#682A53] text-white transition-all duration-300 ease-in-out z-50",
          isCollapsed ? "w-20" : "w-70"
        )}
      >
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && (
            <h1 className="text-xl font-semibold text-white">CareerVest</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-white/10"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="px-4 py-6">
          <div className="flex items-center mb-6">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src="" />
              <AvatarFallback>
                {userData?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && userData && (
              <div>
                <p className="text-sm font-medium text-white">
                  {userData.name || "User"}
                </p>
                <p className="text-xs text-white/70">
                  {userData.email || userData.username || "No email"}
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const module = item.module as keyof typeof permissions;
              let hasPermission = false;

              if (
                !hasPermission &&
                module in permissions &&
                permissions[module]
              ) {
                const permissionType = permissions[module];
                const permissionKey =
                  item.permissionKey as keyof (typeof permissionType)[string];
                hasPermission =
                  permissionType[userRole]?.[permissionKey] === true;
              } else if (!(module in permissions)) {
                hasPermission = false;
              }

              if (hasPermission) {
                const isActive = pathname === item.path;
                return (
                  <li key={item.title}>
                    <Link
                      href={item.path}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#FDC500]/20 text-[#FDC500]"
                          : "text-white hover:bg-white/10"
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <span
                        className={cn(
                          "mr-3",
                          isActive ? "text-[#FDC500]" : "text-white"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                      </span>
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </li>
                );
              }
              return null;
            })}
            <li className="mt-auto">
              <Button
                variant="ghost"
                onClick={handleLogoutClick}
                className="w-full justify-start text-white hover:bg-white/10"
                title={isCollapsed ? "Logout" : undefined}
              >
                <LogOut className="h-5 w-5 mr-3" />
                {!isCollapsed && <span>Logout</span>}
              </Button>
            </li>
          </ul>
        </nav>
      </div>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to logout?</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
