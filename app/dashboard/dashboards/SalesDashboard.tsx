import { KPICard } from "../components/KPICard";
import { DepartmentSection } from "../components/DepartmentSection";
import { MiniBarChart } from "../components/MiniBarChart";
import {
  Users,
  DollarSign,
  TrendingUp,
  Target,
  Briefcase,
  CheckCircle2,
  FileText,
  Phone,
  Calendar,
} from "lucide-react";
import { getSalesPersonalData, getDashboardAlerts } from "../utils/dashboardData";

export function SalesDashboard() {
  const salesData = getSalesPersonalData("Current Sales Executive");
  const alerts = getDashboardAlerts("Sales_Executive");

  return (
    <div className="space-y-4">
      {/* My Performance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          title="My Enrolled"
          value={salesData.myEnrolledCandidates}
          icon={Users}
          color="green"
          subtitle="This Month"
        />
        <KPICard
          title="My Revenue"
          value={`$${(salesData.myRevenueCollected / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color="green"
          subtitle="This Month"
        />
        <KPICard
          title="My Active Clients"
          value={salesData.myActiveClients}
          icon={Briefcase}
          color="purple"
        />
        <KPICard
          title="Avg Deal Size"
          value={`$${salesData.myAvgDealSize}`}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Monthly Target Progress */}
      <DepartmentSection
        title="Monthly Target Progress"
        icon={<Target className="h-4 w-4 text-green-600" />}
        color="green"
        collapsible={false}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Target</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">
                ${salesData.myMonthlyTarget.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Achieved</p>
              <p className="text-2xl font-bold text-green-700 font-mono">
                ${salesData.myRevenueCollected.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Progress</p>
              <p className="text-2xl font-bold text-purple-700 font-mono">
                {salesData.myTargetProgress.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Remaining</p>
              <p className="text-2xl font-bold text-amber-700 font-mono">
                ${(salesData.myMonthlyTarget - salesData.myRevenueCollected).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="relative w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(salesData.myTargetProgress, 100)}%` }}
            >
              {salesData.myTargetProgress >= 50 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                  {salesData.myTargetProgress.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          {salesData.myTargetProgress >= 100 && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-xs font-semibold text-green-700">
                🎉 Congratulations! You've exceeded your monthly target!
              </p>
            </div>
          )}
        </div>
      </DepartmentSection>

      {/* My Pipeline */}
      <DepartmentSection
        title="My Client Pipeline"
        icon={<Briefcase className="h-4 w-4 text-purple-600" />}
        color="purple"
      >
        <div className="grid grid-cols-4 gap-2 mb-4">
          {salesData.myClientsByStage.map((stage) => (
            <div
              key={stage.stage}
              className="p-3 bg-white rounded-lg border border-purple-200 text-center cursor-pointer hover:shadow-md transition-all"
            >
              <p className="text-xs text-gray-500 mb-1">{stage.stage}</p>
              <p className="text-3xl font-bold text-purple-700 font-mono">{stage.count}</p>
              <p className="text-xs text-gray-600 mt-1">Clients</p>
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Pipeline Health
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {salesData.myClientsByStage.map((stage, index) => {
              const total = salesData.myClientsByStage.reduce((sum, s) => sum + s.count, 0);
              const percentage = ((stage.count / total) * 100).toFixed(1);
              const colors = ["#10B981", "#3B82F6", "#682A53", "#F59E0B"];

              return (
                <div key={stage.stage} className="text-center">
                  <div className="relative w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[index],
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-0.5">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </DepartmentSection>

      {/* My Technology Distribution */}
      <DepartmentSection
        title="My Technology Distribution"
        icon={<FileText className="h-4 w-4 text-blue-600" />}
        color="blue"
      >
        <MiniBarChart
          data={salesData.myTechDistribution.map((tech) => ({
            label: tech.name,
            value: tech.count,
            color: "#3B82F6",
          }))}
          showValues
        />
      </DepartmentSection>

      {/* My Recent Clients */}
      <DepartmentSection
        title="My Recent Clients"
        icon={<Calendar className="h-4 w-4 text-purple-600" />}
        color="purple"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-purple-200 bg-purple-50">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Client Name</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Email</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Tech Stack</th>
                <th className="text-center py-2 px-2 font-semibold text-gray-700">Stage</th>
                <th className="text-center py-2 px-2 font-semibold text-gray-700">Enrolled</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Amount</th>
                <th className="text-center py-2 px-2 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {salesData.myRecentClients.map((client) => {
                const stageColors = {
                  Sales: "bg-green-100 text-green-700",
                  Resume: "bg-blue-100 text-blue-700",
                  Marketing: "bg-purple-100 text-purple-700",
                  Placed: "bg-amber-100 text-amber-700",
                };

                return (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                    <td className="py-2 px-2">
                      <span className="font-medium text-gray-900">{client.name}</span>
                    </td>
                    <td className="py-2 px-2 text-gray-600">{client.email}</td>
                    <td className="py-2 px-2">
                      <span className="text-gray-700">{client.techStack}</span>
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          stageColors[client.stage as keyof typeof stageColors]
                        }`}
                      >
                        {client.stage}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center text-gray-600">
                      {new Date(client.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className="font-semibold text-green-700 font-mono">
                        ${client.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="p-1 hover:bg-purple-100 rounded transition-colors"
                          title="View Client"
                        >
                          <FileText className="h-3 w-3 text-purple-600" />
                        </button>
                        <button
                          className="p-1 hover:bg-green-100 rounded transition-colors"
                          title="Call Client"
                        >
                          <Phone className="h-3 w-3 text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DepartmentSection>

      {/* Quick Actions & Alerts */}
      {alerts.length > 0 && (
        <DepartmentSection
          title="My Alerts & Action Items"
          icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
          color="green"
        >
          <div className="space-y-2">
            {alerts.map((alert) => {
              const bgColors = {
                warning: "bg-amber-50 border-amber-200",
                info: "bg-blue-50 border-blue-200",
                success: "bg-green-50 border-green-200",
                error: "bg-red-50 border-red-200",
              };

              const textColors = {
                warning: "text-amber-900",
                info: "text-blue-900",
                success: "text-green-900",
                error: "text-red-900",
              };

              return (
                <div key={alert.id} className={`p-3 rounded-lg border ${bgColors[alert.type]}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`text-sm font-semibold ${textColors[alert.type]}`}>{alert.title}</h4>
                      <p className="text-xs text-gray-700 mt-0.5">{alert.message}</p>
                    </div>
                    {alert.actionUrl && (
                      <button className="text-xs font-semibold text-purple-600 hover:text-purple-800 whitespace-nowrap ml-2">
                        View →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DepartmentSection>
      )}
    </div>
  );
}
