import { KPICard } from "../components/KPICard";
import { DepartmentSection } from "../components/DepartmentSection";
import {
  Users,
  Calendar,
  Trophy,
  TrendingUp,
  Clock,
  Video,
  Award,
  Target,
} from "lucide-react";
import { getRecruiterPersonalData, getDashboardAlerts } from "../utils/dashboardData";

export function RecruiterDashboard() {
  const recruiterData = getRecruiterPersonalData("Current Recruiter");
  const alerts = getDashboardAlerts("Recruiter");

  return (
    <div className="space-y-4">
      {/* My Performance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          title="My Candidates"
          value={recruiterData.myAssignedCandidates}
          icon={Users}
          color="purple"
          subtitle="Assigned to me"
        />
        <KPICard
          title="Interviews (Week)"
          value={recruiterData.myInterviewsThisWeek}
          icon={Calendar}
          color="blue"
        />
        <KPICard
          title="My Placements"
          value={recruiterData.myPlacementsThisMonth}
          icon={Trophy}
          color="green"
          subtitle="This Month"
        />
        <KPICard
          title="Success Rate"
          value={`${recruiterData.mySuccessRate}%`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Ranking Badge */}
      <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-2 border-amber-300 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-200 rounded-full">
            <Award className="h-8 w-8 text-amber-700" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-0.5">
              Your Ranking
            </p>
            <p className="text-3xl font-bold text-amber-900">
              #{recruiterData.myRanking} of {recruiterData.totalRecruiters}
            </p>
            <p className="text-sm text-amber-700 mt-1">
              {recruiterData.myRanking === 1
                ? "🏆 You are the top performer! Keep up the amazing work!"
                : `${recruiterData.totalRecruiters - recruiterData.myRanking + 1} spot${
                    recruiterData.totalRecruiters - recruiterData.myRanking + 1 > 1 ? "s" : ""
                  } away from #1`}
            </p>
          </div>
        </div>
      </div>

      {/* Today's Interviews */}
      <DepartmentSection
        title="Today's Interview Schedule"
        icon={<Calendar className="h-4 w-4 text-blue-600" />}
        color="blue"
        collapsible={false}
      >
        {recruiterData.myTodayInterviews.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No interviews scheduled for today</p>
            <p className="text-xs text-gray-500 mt-1">Enjoy a lighter workload!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recruiterData.myTodayInterviews.map((interview) => (
              <div
                key={interview.id}
                className="p-3 bg-white rounded-lg border-2 border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-lg">{interview.candidateName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          interview.type === "Final"
                            ? "bg-amber-100 text-amber-700"
                            : interview.type === "Technical"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {interview.type} - Round {interview.round}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{interview.company}</span>
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">{interview.time}</span>
                      </div>
                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
                        >
                          <Video className="h-3 w-3" />
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DepartmentSection>

      {/* My Candidates by Stage */}
      <DepartmentSection
        title="My Candidates by Stage"
        icon={<Users className="h-4 w-4 text-purple-600" />}
        color="purple"
      >
        <div className="grid grid-cols-4 gap-2 mb-4">
          {recruiterData.myCandidatesByStage.map((stage, index) => {
            const colors = ["#3B82F6", "#682A53", "#F59E0B", "#10B981"];
            const bgColors = ["bg-blue-50", "bg-purple-50", "bg-amber-50", "bg-green-50"];
            const borderColors = ["border-blue-200", "border-purple-200", "border-amber-200", "border-green-200"];

            return (
              <div
                key={stage.stage}
                className={`p-3 ${bgColors[index]} rounded-lg border ${borderColors[index]} text-center cursor-pointer hover:shadow-md transition-all`}
              >
                <p className="text-xs text-gray-600 mb-1">{stage.stage}</p>
                <p className="text-3xl font-bold font-mono" style={{ color: colors[index] }}>
                  {stage.count}
                </p>
              </div>
            );
          })}
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Sample Candidates ({recruiterData.myCandidatesByStage[0].stage})
          </h4>
          <div className="space-y-2">
            {recruiterData.myCandidatesByStage[0].candidates.slice(0, 3).map((candidate) => (
              <div key={candidate.id} className="p-2 bg-white rounded border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{candidate.name}</p>
                    <p className="text-xs text-gray-600">{candidate.techStack}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Last Activity</p>
                    <p className="text-xs font-medium text-gray-700">
                      {new Date(candidate.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DepartmentSection>

      {/* Upcoming Interviews */}
      <DepartmentSection
        title="My Upcoming Interviews"
        icon={<Calendar className="h-4 w-4 text-blue-600" />}
        color="blue"
      >
        <div className="space-y-2">
          {recruiterData.myUpcomingInterviews.map((interview) => (
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
                        interview.type === "Final"
                          ? "bg-amber-100 text-amber-700"
                          : interview.type === "Technical"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {interview.type} - Round {interview.round}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Company: <span className="font-medium">{interview.company}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-700">{interview.time}</p>
                  <p className="text-xs text-gray-500">{new Date(interview.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DepartmentSection>

      {/* Alerts */}
      {alerts.length > 0 && (
        <DepartmentSection
          title="My Notifications"
          icon={<Target className="h-4 w-4 text-purple-600" />}
          color="purple"
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
