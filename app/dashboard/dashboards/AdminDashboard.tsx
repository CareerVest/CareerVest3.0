import { KPICard } from "../components/KPICard";
import { DepartmentSection } from "../components/DepartmentSection";
import { RecruiterBandwidthTable } from "../components/RecruiterBandwidthTable";
import { MiniBarChart } from "../components/MiniBarChart";
import { SimpleLineChart } from "../components/SimpleLineChart";
import {
  Users,
  DollarSign,
  TrendingUp,
  Target,
  Briefcase,
  Award,
  FileText,
  Clock,
  UserCheck,
  UserX,
  Calendar,
  Zap,
  AlertCircle,
  CreditCard,
  PiggyBank,
  CircleDollarSign,
} from "lucide-react";
import {
  getExecutiveSummaryData,
  getSalesMetricsData,
  getResumeMetricsData,
  getMarketingMetricsData,
  getRevenueMetricsData,
  getDashboardAlerts,
} from "../utils/dashboardData";

export function AdminDashboard() {
  const executiveData = getExecutiveSummaryData();
  const salesData = getSalesMetricsData();
  const resumeData = getResumeMetricsData();
  const marketingData = getMarketingMetricsData();
  const revenueData = getRevenueMetricsData();
  const alerts = getDashboardAlerts("Admin");

  return (
    <div className="space-y-4">
      {/* Executive Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard
          title="Active Clients"
          value={executiveData.activeClients}
          icon={Users}
          color="purple"
          trend={{
            value: executiveData.trend?.activeClients || 0,
            isPositive: true,
            label: "vs last month",
          }}
        />
        <KPICard
          title="Revenue Collected"
          value={`$${(executiveData.monthlyRevenueCollected / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color="green"
          trend={{
            value: executiveData.trend?.revenue || 0,
            isPositive: true,
          }}
          subtitle="This Month"
        />
        <KPICard
          title="Revenue Pending"
          value={`$${(executiveData.monthlyRevenuePending / 1000).toFixed(0)}K`}
          icon={AlertCircle}
          color="amber"
          subtitle="This Month"
        />
        <KPICard
          title="Avg Placement Rate"
          value={`${executiveData.avgPlacementRate}%`}
          icon={Target}
          color="blue"
        />
        <KPICard
          title="Monthly Placements"
          value={executiveData.monthlyPlacements}
          icon={Briefcase}
          color="green"
          trend={{
            value: executiveData.trend?.placements || 0,
            isPositive: true,
          }}
        />
        <KPICard
          title="Total Placements"
          value={executiveData.totalPlacements.toLocaleString()}
          icon={Award}
          color="purple"
          subtitle="All Time"
        />
      </div>

      {/* Department Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Department */}
        <DepartmentSection
          title="Sales Department"
          icon={<Briefcase className="h-4 w-4 text-green-600" />}
          color="green"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-0.5">Enrolled This Month</p>
                <p className="text-xl font-bold text-green-700 font-mono">{salesData.enrolledThisMonth}</p>
              </div>
              <div className="p-2 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-0.5">Upfront Revenue</p>
                <p className="text-xl font-bold text-green-700 font-mono">
                  ${(salesData.revenueCollectedUpfront / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="p-2 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-0.5">Conversion Rate</p>
                <p className="text-xl font-bold text-green-700 font-mono">{salesData.conversionRate}%</p>
              </div>
              <div className="p-2 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-0.5">Avg Deal Size</p>
                <p className="text-xl font-bold text-green-700 font-mono">${salesData.avgDealSize}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Technology Distribution
              </h4>
              <MiniBarChart
                data={salesData.technologyDistribution.map((tech) => ({
                  label: tech.name,
                  value: tech.count,
                  color: "#10B981",
                }))}
                showValues
              />
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Pipeline by Stage
              </h4>
              <div className="grid grid-cols-4 gap-1">
                {salesData.pipelineByStage.map((stage) => (
                  <div key={stage.stage} className="p-2 bg-white rounded border border-green-200 text-center">
                    <p className="text-[10px] text-gray-500 mb-1">{stage.stage}</p>
                    <p className="text-lg font-bold text-gray-900 font-mono">{stage.count}</p>
                    <p className="text-[9px] text-gray-500">${(stage.value / 1000).toFixed(0)}K</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DepartmentSection>

        {/* Resume Department */}
        <DepartmentSection
          title="Resume Department"
          icon={<FileText className="h-4 w-4 text-blue-600" />}
          color="blue"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-white rounded border border-blue-200">
                <p className="text-xs text-gray-500 mb-0.5">In Process</p>
                <p className="text-xl font-bold text-blue-700 font-mono">{resumeData.inProcess}</p>
              </div>
              <div className="p-2 bg-white rounded border border-blue-200">
                <p className="text-xs text-gray-500 mb-0.5">Completed</p>
                <p className="text-xl font-bold text-blue-700 font-mono">{resumeData.completed}</p>
              </div>
              <div className="p-2 bg-white rounded border border-blue-200">
                <p className="text-xs text-gray-500 mb-0.5">In Verification</p>
                <p className="text-xl font-bold text-blue-700 font-mono">{resumeData.inVerification}</p>
              </div>
              <div className="p-2 bg-white rounded border border-red-200">
                <p className="text-xs text-gray-500 mb-0.5">Not Responding</p>
                <p className="text-xl font-bold text-red-700 font-mono">{resumeData.notResponding}</p>
              </div>
              <div className="p-2 bg-white rounded border border-red-200">
                <p className="text-xs text-gray-500 mb-0.5">Backed Out</p>
                <p className="text-xl font-bold text-red-700 font-mono">{resumeData.backedOut}</p>
              </div>
              <div className="p-2 bg-white rounded border border-blue-200">
                <p className="text-xs text-gray-500 mb-0.5">Avg Time</p>
                <p className="text-lg font-bold text-blue-700 font-mono">{resumeData.avgTimeInResume}d</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide flex items-center justify-between">
                <span>Daily Completion Trend</span>
                <span className="text-xs font-semibold text-blue-600">
                  {resumeData.completionRate}% completion rate
                </span>
              </h4>
              <SimpleLineChart
                data={resumeData.dailyCompletionTrend.map((d) => ({
                  label: new Date(d.date).getDate().toString(),
                  value: d.count,
                }))}
                color="#3B82F6"
                height={60}
                showDots
              />
            </div>
          </div>
        </DepartmentSection>

        {/* Marketing Department */}
        <DepartmentSection
          title="Marketing Department"
          icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
          color="purple"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-white rounded border border-purple-200">
                <p className="text-xs text-gray-500 mb-0.5">Total Recruiters</p>
                <p className="text-xl font-bold text-purple-700 font-mono">{marketingData.totalRecruiters}</p>
              </div>
              <div className="p-2 bg-white rounded border border-purple-200">
                <p className="text-xs text-gray-500 mb-0.5">Interviews Today</p>
                <p className="text-xl font-bold text-purple-700 font-mono">{marketingData.interviewsToday}</p>
              </div>
              <div className="p-2 bg-white rounded border border-purple-200">
                <p className="text-xs text-gray-500 mb-0.5">This Month</p>
                <p className="text-xl font-bold text-purple-700 font-mono">{marketingData.interviewsThisMonth}</p>
              </div>
              <div className="p-2 bg-white rounded border border-purple-200">
                <p className="text-xs text-gray-500 mb-0.5">Final Rounds</p>
                <p className="text-xl font-bold text-purple-700 font-mono">{marketingData.finalRoundsThisMonth}</p>
              </div>
              <div className="p-2 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-0.5">Placements</p>
                <p className="text-xl font-bold text-green-700 font-mono">{marketingData.placementsThisMonth}</p>
              </div>
              <div className="p-2 bg-white rounded border border-amber-200">
                <p className="text-xs text-gray-500 mb-0.5">On Hold</p>
                <p className="text-xl font-bold text-amber-700 font-mono">{marketingData.candidatesOnHold}</p>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-900">Top Performer</p>
              </div>
              <p className="text-lg font-bold text-amber-900">{marketingData.topPerformer.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-amber-700">
                  <span className="font-semibold">{marketingData.topPerformer.placementCount}</span> placements
                </span>
                <span className="text-xs text-amber-700">
                  <span className="font-semibold">{marketingData.topPerformer.successRate}%</span> success rate
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Placements by Technology
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {marketingData.placementsByTechnology.map((tech) => (
                  <div
                    key={tech.tech}
                    className="px-2 py-1 bg-purple-100 border border-purple-200 rounded text-xs"
                  >
                    <span className="font-semibold text-purple-900">{tech.tech}</span>
                    <span className="ml-1 text-purple-700">({tech.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DepartmentSection>

        {/* Revenue Department */}
        <DepartmentSection
          title="Revenue & Accounting"
          icon={<DollarSign className="h-4 w-4 text-green-600" />}
          color="green"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-0.5">Total Revenue</p>
                <p className="text-lg font-bold text-green-700 font-mono">
                  ${(revenueData.totalRevenue / 1000000).toFixed(2)}M
                </p>
              </div>
              <div className="p-2 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-0.5">Subscription</p>
                <p className="text-lg font-bold text-green-700 font-mono">
                  ${(revenueData.subscriptionRevenue / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="p-2 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-0.5">Placement</p>
                <p className="text-lg font-bold text-green-700 font-mono">
                  ${(revenueData.placementRevenue / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="p-2 bg-white rounded border border-amber-200">
                <p className="text-xs text-gray-500 mb-0.5">Outstanding</p>
                <p className="text-lg font-bold text-amber-700 font-mono">
                  ${(revenueData.outstandingBalance / 1000).toFixed(0)}K
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Revenue Trend (7 Months)
              </h4>
              <SimpleLineChart
                data={revenueData.revenueByMonth.map((m) => ({
                  label: m.month,
                  value: m.subscription + m.placement,
                }))}
                color="#10B981"
                height={60}
                showDots
              />
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Top 5 Paying Clients
              </h4>
              <div className="space-y-1">
                {revenueData.topPayingClients.map((client, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-1.5 bg-white rounded border border-green-200"
                  >
                    <span className="text-xs text-gray-700">{client.name}</span>
                    <span className="text-xs font-semibold text-green-700 font-mono">
                      ${client.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DepartmentSection>
      </div>

      {/* Recruiter Bandwidth Section */}
      <DepartmentSection
        title="Recruiter Bandwidth & Performance"
        icon={<Users className="h-4 w-4 text-purple-600" />}
        color="purple"
      >
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Real-time view of all recruiter assignments, workload, and performance metrics
            </p>
            <span className="text-xs text-purple-600 font-semibold">
              Avg Time to Placement: {marketingData.avgTimeToPlacement} days
            </span>
          </div>
          <RecruiterBandwidthTable data={marketingData.recruiterBandwidth} />
        </div>
      </DepartmentSection>

      {/* Alerts & Action Items */}
      {alerts.length > 0 && (
        <DepartmentSection
          title="Alerts & Action Required"
          icon={<AlertCircle className="h-4 w-4 text-red-600" />}
          color="amber"
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
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${bgColors[alert.type]}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`text-sm font-semibold ${textColors[alert.type]}`}>
                        {alert.title}
                      </h4>
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
