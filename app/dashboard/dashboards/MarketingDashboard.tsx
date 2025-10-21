import { KPICard } from "../components/KPICard";
import { DepartmentSection } from "../components/DepartmentSection";
import { RecruiterBandwidthTable } from "../components/RecruiterBandwidthTable";
import {
  Users,
  Calendar,
  Target,
  Award,
  AlertTriangle,
  TrendingUp,
  Clock,
  UserCheck,
} from "lucide-react";
import { getMarketingPersonalData, getMarketingMetricsData, getDashboardAlerts } from "../utils/dashboardData";

export function MarketingDashboard() {
  const personalData = getMarketingPersonalData();
  const metricsData = getMarketingMetricsData();
  const alerts = getDashboardAlerts("Marketing_Manager");

  return (
    <div className="space-y-4">
      {/* Team Performance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPICard
          title="Team Size"
          value={personalData.teamSize}
          icon={Users}
          color="purple"
          subtitle="Active Recruiters"
        />
        <KPICard
          title="Interviews Today"
          value={personalData.teamInterviewsToday}
          icon={Calendar}
          color="blue"
        />
        <KPICard
          title="Interviews (Month)"
          value={personalData.teamInterviewsThisMonth}
          icon={TrendingUp}
          color="purple"
        />
        <KPICard
          title="Final Rounds"
          value={personalData.teamFinalRounds}
          icon={Target}
          color="amber"
          subtitle="This Month"
        />
        <KPICard
          title="Placements"
          value={personalData.teamPlacements}
          icon={Award}
          color="green"
          subtitle="This Month"
        />
      </div>

      {/* Top Performer Highlight */}
      <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-2 border-amber-300 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-200 rounded-full">
            <Award className="h-6 w-6 text-amber-700" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-0.5">
              🏆 Top Performer This Month
            </p>
            <p className="text-2xl font-bold text-amber-900">{personalData.topRecruiter.name}</p>
            <p className="text-sm text-amber-700 mt-1">
              <span className="font-semibold">{personalData.topRecruiter.placements} placements</span> • Leading the team!
            </p>
          </div>
        </div>
      </div>

      {/* Recruiter Performance & Bandwidth */}
      <DepartmentSection
        title="Recruiter Performance & Bandwidth"
        icon={<Users className="h-4 w-4 text-purple-600" />}
        color="purple"
        collapsible={false}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600">
              Real-time view of all recruiter assignments, workload, and performance metrics
            </p>
            <span className="text-xs text-purple-600 font-semibold">
              Avg Time to Placement: {metricsData.avgTimeToPlacement} days
            </span>
          </div>

          <RecruiterBandwidthTable data={metricsData.recruiterBandwidth} />

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
              <p className="text-xs text-gray-600 mb-0.5">Optimal Capacity</p>
              <p className="text-xl font-bold text-green-700 font-mono">
                {metricsData.recruiterBandwidth.filter((r) => r.utilizationRate < 75).length}
              </p>
              <p className="text-[10px] text-gray-500">&lt;75% utilization</p>
            </div>
            <div className="p-2 bg-amber-50 border border-amber-200 rounded text-center">
              <p className="text-xs text-gray-600 mb-0.5">High Capacity</p>
              <p className="text-xl font-bold text-amber-700 font-mono">
                {metricsData.recruiterBandwidth.filter((r) => r.utilizationRate >= 75 && r.utilizationRate < 90).length}
              </p>
              <p className="text-[10px] text-gray-500">75-89% utilization</p>
            </div>
            <div className="p-2 bg-red-50 border border-red-200 rounded text-center">
              <p className="text-xs text-gray-600 mb-0.5">Overloaded</p>
              <p className="text-xl font-bold text-red-700 font-mono">
                {metricsData.recruiterBandwidth.filter((r) => r.utilizationRate >= 90).length}
              </p>
              <p className="text-[10px] text-gray-500">≥90% utilization</p>
            </div>
          </div>
        </div>
      </DepartmentSection>

      {/* At-Risk Candidates */}
      <DepartmentSection
        title="At-Risk Candidates (Requires Attention)"
        icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
        color="amber"
      >
        <div className="space-y-2">
          {personalData.atRiskCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="p-3 bg-white rounded-lg border border-amber-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{candidate.name}</span>
                    <span className="px-2 py-0.5 bg-purple-100 border border-purple-200 rounded text-xs text-purple-700">
                      {candidate.techStack}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Recruiter: <span className="font-medium">{candidate.recruiter}</span>
                  </p>
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-xs font-semibold text-amber-900">{candidate.reason}</p>
                    {candidate.daysInactive && (
                      <p className="text-xs text-amber-700 mt-0.5">
                        {candidate.daysInactive} days without activity
                      </p>
                    )}
                    {candidate.rejectionCount && (
                      <p className="text-xs text-amber-700 mt-0.5">
                        {candidate.rejectionCount} consecutive rejections
                      </p>
                    )}
                    {candidate.daysNoResponse && (
                      <p className="text-xs text-amber-700 mt-0.5">
                        {candidate.daysNoResponse} days no response
                      </p>
                    )}
                  </div>
                </div>
                <button className="ml-3 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded hover:bg-purple-700 transition-colors">
                  Take Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </DepartmentSection>

      {/* Upcoming Interviews */}
      <DepartmentSection
        title="Upcoming Team Interviews"
        icon={<Calendar className="h-4 w-4 text-blue-600" />}
        color="blue"
      >
        <div className="space-y-2">
          {personalData.upcomingInterviews.map((interview) => (
            <div
              key={interview.id}
              className="p-3 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{interview.candidateName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        interview.interviewType === "Final"
                          ? "bg-amber-100 text-amber-700"
                          : interview.interviewType === "Technical"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {interview.interviewType} - Round {interview.round}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Company: <span className="font-medium">{interview.company}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Recruiter: <span className="font-medium">{interview.recruiterName}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-blue-700">
                    {new Date(interview.scheduledTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(interview.scheduledTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DepartmentSection>

      {/* Alerts */}
      {alerts.length > 0 && (
        <DepartmentSection
          title="My Alerts"
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
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
