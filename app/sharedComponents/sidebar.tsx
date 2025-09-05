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
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../contexts/authContext";
import Image from "next/image";

interface SidebarProps {
  permissions: any;
  userRole: string;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  onWidthChange?: (width: number) => void;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: Gauge,
    path: "/dashboard",
    permissionKey: "viewDashboard",
    module: "dashboard",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Clients",
    icon: Building2,
    path: "/clients",
    permissionKey: "viewClientsMenu",
    module: "clients",
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Employees",
    icon: Users,
    path: "/employees",
    permissionKey: "viewEmployeesMenu",
    module: "employees",
    color: "from-purple-500 to-violet-500",
  },
  {
    title: "Marketing Activity",
    icon: TrendingUp,
    path: "/marketingActivity",
    permissionKey: "viewInterviewChainsMenu",
    module: "interviewChains",
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Interviews",
    icon: InterviewIcon,
    path: "/interviews",
    permissionKey: "viewInterviewsMenu",
    module: "interviews",
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "Interview Chains",
    icon: InterviewChainIcon,
    path: "/interviewChains",
    permissionKey: "viewInterviewChainsMenu",
    module: "interviewChains",
    color: "from-indigo-500 to-blue-500",
  },
  {
    title: "Pipelines",
    icon: GitPullRequest,
    path: "/pipelines",
    permissionKey: "viewPipelinesMenu",
    module: "pipelines",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Team Hierarchy",
    icon: OrganizationChart,
    path: "/supervisors",
    permissionKey: "viewSupervisorsMenu",
    module: "supervisorsMenu",
    color: "from-slate-500 to-gray-500",
  },
  {
    title: "Accounting",
    icon: DollarSign,
    path: "/accounting",
    permissionKey: "viewAccountingMenu",
    module: "accounting",
    color: "from-yellow-500 to-amber-500",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
    permissionKey: "viewSettingsMenu",
    module: "settings",
    color: "from-gray-500 to-slate-500",
  },
];

export default function Sidebar({
  permissions,
  userRole,
  isCollapsed,
  setIsCollapsed,
  onWidthChange,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState(-1);

  useEffect(() => {
    setMounted(true);
    if (user && !userData) {
      setUserData(user);
    }
  }, [user, userData]);

  // Find active item index for animations
  useEffect(() => {
    const activeIndex = menuItems.findIndex(item => pathname === item.path);
    setActiveItemIndex(activeIndex);
  }, [pathname]);

  // Notify parent of width changes
  useEffect(() => {
    const effectiveWidth = isCollapsed && !isHovered ? 80 : 280;
    onWidthChange?.(effectiveWidth);
  }, [isCollapsed, isHovered, onWidthChange]);

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
          "fixed left-0 top-0 h-full text-white transition-all duration-500 ease-out z-50 overflow-hidden backdrop-blur-sm",
          "border-r border-white/10 shadow-2xl",
          isCollapsed && !isHovered ? "w-20" : "w-70"
        )}
        style={{
          background: `linear-gradient(135deg, 
            rgba(104, 42, 83, 0.95) 0%, 
            rgba(120, 55, 95, 0.95) 25%,
            rgba(135, 70, 110, 0.95) 50%,
            rgba(120, 55, 95, 0.95) 75%,
            rgba(104, 42, 83, 0.95) 100%),
            radial-gradient(circle at top right, rgba(255, 193, 5, 0.15) 0%, transparent 50%),
            radial-gradient(circle at bottom left, rgba(255, 193, 5, 0.1) 0%, transparent 50%)`,
        }}
        onMouseEnter={() => isCollapsed && setIsHovered(true)}
        onMouseLeave={() => {
          isCollapsed && setIsHovered(false);
          setHoveredItem(null);
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl animate-pulse" style={{background: 'rgba(255, 193, 5, 0.2)'}} />
          <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full blur-2xl animate-pulse delay-1000" style={{background: 'rgba(104, 42, 83, 0.3)'}} />
        </div>

        {/* Header Section */}
        <div className="relative z-10 flex items-center justify-between p-4 min-h-[72px] border-b border-white/10">
          <div className="flex items-center flex-1">
            {/* Always show logo, even when collapsed */}
            <div className="flex items-center space-x-3">
              <div className="relative group cursor-pointer" onClick={() => isCollapsed && setIsCollapsed(false)}>
                <div className="absolute inset-0 rounded-lg blur group-hover:blur-sm transition-all duration-300" style={{background: 'linear-gradient(to right, rgba(255, 193, 5, 0.2), rgba(255, 193, 5, 0.15))'}} />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-1.5 border border-white/20 group-hover:scale-110 transition-all duration-300">
                  <Image
                    src="/careerVest-logo.jpeg"
                    alt="CareerVest"
                    width={28}
                    height={28}
                    className="rounded-md object-contain"
                  />
                </div>
              </div>
              
              {(!isCollapsed || isHovered) && (
                <div className="animate-in slide-in-from-left duration-300 delay-100">
                  <h1 className="text-xl font-bold text-white drop-shadow-sm">
                    CareerVest
                  </h1>
                </div>
              )}
            </div>
          </div>
          {(!isCollapsed || isHovered) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 flex-shrink-0 group animate-in slide-in-from-right duration-300"
            >
              <div className="relative">
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              </div>
            </Button>
          )}
        </div>

        {/* User Profile Section */}
        <div className="relative z-10 px-4 py-6 border-b border-white/10">
          <div className="flex items-center mb-6 min-h-[60px] group">
            <div className="relative">
              <Avatar className="h-12 w-12 mr-4 flex-shrink-0 ring-2 ring-white/20 transition-all duration-300 group-hover:ring-white/40 group-hover:scale-105">
                <AvatarImage src="" />
                <AvatarFallback className="text-white font-semibold" style={{background: 'linear-gradient(to bottom right, rgb(104, 42, 83), rgb(120, 55, 95))'}}>
                  {userData?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 min-w-0">
              {(!isCollapsed || isHovered) && userData && (
                <div className="transition-all duration-300 animate-in slide-in-from-right delay-100">
                  <p className="text-sm font-semibold text-white truncate mb-1">
                    {userData.name || "User"}
                  </p>
                  <p className="text-xs truncate mb-1" style={{color: 'rgb(255, 193, 5)'}}>
                    {userRole.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {userData.email || userData.username || "No email"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="relative z-10 flex-1 px-2 py-4">
          {/* Active Item Background Slider */}
          {activeItemIndex >= 0 && (
            <div
              className="absolute left-2 h-12 rounded-xl transition-all duration-500 ease-out backdrop-blur-sm border border-white/10"
              style={{
                transform: `translateY(${activeItemIndex * 48 + 4}px)`,
                width: isCollapsed && !isHovered ? '48px' : '256px',
                background: isCollapsed && !isHovered 
                  ? 'linear-gradient(to right, rgba(255, 193, 5, 1), rgba(255, 193, 5, 0.8))'
                  : 'linear-gradient(to right, rgba(255, 193, 5, 1), rgba(255, 193, 5, 0.7))',
              }}
            />
          )}
          
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
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
                const isHoveredItem = hoveredItem === item.title;
                
                return (
                  <li 
                    key={item.title}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="animate-in slide-in-from-left duration-300"
                  >
                    <Link
                      href={item.path}
                      className={cn(
                        "relative flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 min-h-[48px] group overflow-hidden",
                        "hover:scale-105 hover:shadow-lg",
                        isActive
                          ? "text-white shadow-lg"
                          : "text-white/80 hover:text-white"
                      )}
                      title={isCollapsed && !isHovered ? item.title : undefined}
                      onMouseEnter={() => setHoveredItem(item.title)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      {/* Icon with Animation */}
                      <span
                        className={cn(
                          "relative mr-4 flex-shrink-0 transition-all duration-300 z-10",
                          isActive ? "text-white" : "text-white/70",
                          isHoveredItem && "scale-110 rotate-12"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        
                        {/* Active Icon Glow */}
                        {isActive && (
                          <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-full blur-md opacity-30 animate-pulse`} />
                        )}
                      </span>

                      {/* Text with Stagger Animation */}
                      <span
                        className={cn(
                          "transition-all duration-300 font-medium relative z-10",
                          !isCollapsed || isHovered
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-2"
                        )}
                      >
                        {item.title}
                      </span>

                      {/* Hover Effect Gradient */}
                      <div 
                        className={cn(
                          "absolute inset-0 transition-all duration-300 rounded-xl",
                          isHoveredItem ? "opacity-100" : "opacity-0"
                        )}
                        style={{
                          background: 'linear-gradient(to right, rgba(255, 193, 5, 1), rgba(255, 193, 5, 0.7))',
                          zIndex: 0
                        }}
                      />

                      {/* Active Item Right Border */}
                      {isActive && (
                        <div className="absolute right-0 top-2 bottom-2 w-1 bg-gradient-to-b from-white to-white/50 rounded-l-full" />
                      )}

                      {/* Ripple Effect on Click */}
                      <div className="absolute inset-0 rounded-xl overflow-hidden">
                        <div className="absolute inset-0 transform scale-0 bg-white/20 rounded-xl transition-transform duration-300 group-active:scale-100" />
                      </div>
                    </Link>
                  </li>
                );
              }
              return null;
            })}

            {/* Logout Button */}
            <li className="mt-8 pt-4 border-t border-white/10 animate-in slide-in-from-bottom duration-300 delay-500">
              <Button
                variant="ghost"
                onClick={handleLogoutClick}
                className="w-full justify-start text-white/80 hover:text-red-400 hover:bg-red-500/10 min-h-[48px] transition-all duration-300 group hover:scale-105"
                title={isCollapsed && !isHovered ? "Logout" : undefined}
              >
                <LogOut className="h-5 w-5 mr-4 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                <span
                  className={cn(
                    "transition-all duration-300 font-medium",
                    !isCollapsed || isHovered ? "opacity-100" : "opacity-0"
                  )}
                >
                  Logout
                </span>
              </Button>
            </li>
          </ul>
        </nav>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Logout</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-300">Are you sure you want to logout?</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setLogoutDialogOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}