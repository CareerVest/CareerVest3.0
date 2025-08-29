"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { StatCard } from "./statCard";
import { ActivityTimeline } from "../sharedComponents/activityTimeline";
import {
  Search,
  Bell,
  TrendingUp,
  Users,
  Building2,
  Zap,
  Gauge,
  Users as PeopleIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/authContext";
import { useRouter } from "next/navigation";

const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Revenue",
      data: [30, 45, 57, 51, 54, 68],
      fill: false,
      borderColor: "#682A53",
      tension: 0.1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: { type: "category" as const },
    y: { type: "linear" as const, beginAtZero: true },
  },
};

export default function Dashboard() {
  const { isAuthenticated, isInitialized, login, roles } = useAuth();
  const router = useRouter();
  const isAdmin = roles.includes("Admin");
  const [activeTab, setActiveTab] = useState(
    isAdmin ? "overview" : "interview-chains"
  );
  const [error, setError] = useState<string | null>(null);

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
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err: any) {
        console.error("Error in initializeDashboard:", err);
        setError(err.message || "Failed to load dashboard data.");
        if (err.message.includes("token") || err.message.includes("login")) {
          router.push("/login");
        }
      }
    };

    initializeDashboard();
  }, [isAuthenticated, isInitialized, login, router]);

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-50vh w-full">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
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

  return (
    <div className="p-4 sm:p-6 w-full max-w-full overflow-x-hidden box-border ml-0">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <div>
            <h1 className="text-3xl font-semibold text-[#682A53]">Dashboard</h1>
          </div>
          <div className="flex gap-2 items-center max-w-full sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search..." className="pl-10 w-full" />
            </div>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {isAdmin && (
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Overview
            </TabsTrigger>
          )}
          <TabsTrigger
            value="interview-chains"
            className="flex items-center gap-2"
          >
            <PeopleIcon className="h-4 w-4" />
            Interview Chains
          </TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="overview" className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Clients"
                value="2,543"
                icon={<Building2 className="h-5 w-5" />}
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Active Employees"
                value="1,243"
                icon={<Users className="h-5 w-5" />}
                trend={{ value: 8, isPositive: true }}
              />
              <StatCard
                title="Revenue Growth"
                value="$45,678"
                icon={<TrendingUp className="h-5 w-5" />}
                trend={{ value: 15, isPositive: true }}
              />
              <StatCard
                title="Active Projects"
                value="89"
                icon={<Zap className="h-5 w-5" />}
                trend={{ value: 5, isPositive: false }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#682A53]">
                      Revenue Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full bg-muted rounded flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Chart placeholder - Chart.js integration needed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <ActivityTimeline />
              </div>
            </div>
          </TabsContent>
        )}

        <TabsContent value="interview-chains" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Interview Chains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Interview chains functionality will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
