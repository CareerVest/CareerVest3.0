import { KPICard } from "../components/KPICard";
import { DepartmentSection } from "../components/DepartmentSection";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Users,
  Award,
  Zap,
  Eye,
} from "lucide-react";
import { getResumeWriterPersonalData, getDashboardAlerts } from "../utils/dashboardData";

export function ResumeWriterDashboard() {
  const writerData = getResumeWriterPersonalData("Current Resume Writer");
  const alerts = getDashboardAlerts("Resume_Writer");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700 border-red-300";
      case "High":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "Normal":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* My Performance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          title="Assigned Clients"
          value={writerData.myAssignedClients}
          icon={Users}
          color="purple"
          subtitle="Total workload"
        />
        <KPICard
          title="Completed (Month)"
          value={writerData.myCompletedThisMonth}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="In Progress"
          value={writerData.myInProgress}
          icon={FileText}
          color="blue"
          subtitle="Active resumes"
        />
        <KPICard
          title="Avg Completion"
          value={`${writerData.myAvgCompletionTime}d`}
          icon={Clock}
          color="amber"
          subtitle="Days per resume"
        />
      </div>

      {/* Performance & Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-2 border-amber-300 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-200 rounded-full">
              <Award className="h-6 w-6 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-0.5">
                Your Ranking
              </p>
              <p className="text-3xl font-bold text-amber-900">
                #{writerData.myRanking} of {writerData.totalWriters}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                {writerData.myRanking === 1
                  ? "🏆 You are the top performer!"
                  : `${writerData.totalWriters - writerData.myRanking + 1} spot${
                      writerData.totalWriters - writerData.myRanking > 0 ? "s" : ""
                    } from #1`}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-green-50 via-green-100/50 to-green-50 border-2 border-green-300 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-200 rounded-full">
              <Star className="h-6 w-6 text-green-700" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-900 uppercase tracking-wide mb-0.5">
                Quality Score
              </p>
              <p className="text-3xl font-bold text-green-900">{writerData.myQualityScore}%</p>
              <p className="text-sm text-green-700 mt-1">
                Completion Rate: <span className="font-semibold">{writerData.myCompletionRate}%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Tasks */}
      {writerData.urgentTasks.length > 0 && (
        <DepartmentSection
          title="⚡ Urgent Tasks (Action Required)"
          icon={<Zap className="h-4 w-4 text-red-600" />}
          color="amber"
          collapsible={false}
        >
          <div className="space-y-2">
            {writerData.urgentTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-white rounded-lg border-2 border-red-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-lg">{task.clientName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.techStack}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-red-600" />
                        <span className="font-semibold text-red-700">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-gray-600">
                        {task.hoursRemaining} hours remaining
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-xs text-gray-500 mb-1">Progress</p>
                    <p className="text-2xl font-bold text-blue-700 font-mono">{task.progress}%</p>
                  </div>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DepartmentSection>
      )}

      {/* My Clients by Status */}
      <DepartmentSection
        title="My Clients by Status"
        icon={<FileText className="h-4 w-4 text-blue-600" />}
        color="blue"
      >
        <div className="grid grid-cols-4 gap-2 mb-4">
          {writerData.myClientsByStatus.map((status, index) => {
            const colors = ["#3B82F6", "#682A53", "#F59E0B", "#10B981"];
            const bgColors = ["bg-blue-50", "bg-purple-50", "bg-amber-50", "bg-green-50"];
            const borderColors = ["border-blue-200", "border-purple-200", "border-amber-200", "border-green-200"];

            return (
              <div
                key={status.status}
                className={`p-3 ${bgColors[index]} rounded-lg border ${borderColors[index]} text-center cursor-pointer hover:shadow-md transition-all`}
              >
                <p className="text-xs text-gray-600 mb-1">{status.status}</p>
                <p className="text-3xl font-bold font-mono" style={{ color: colors[index] }}>
                  {status.count}
                </p>
              </div>
            );
          })}
        </div>

        {/* Sample Clients - New Assignments */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            New Assignments ({writerData.myClientsByStatus[0].clients.length})
          </h4>
          <div className="space-y-2">
            {writerData.myClientsByStatus[0].clients.map((client: any) => (
              <div key={client.id} className="p-3 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{client.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(client.priority)}`}>
                        {client.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{client.techStack}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>Assigned: {new Date(client.assignedDate).toLocaleDateString()}</span>
                      <span className="font-medium">Due: {new Date(client.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors">
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Clients */}
        {writerData.myClientsByStatus[1].clients.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              In Progress ({writerData.myClientsByStatus[1].clients.length})
            </h4>
            <div className="space-y-2">
              {writerData.myClientsByStatus[1].clients.map((client: any) => (
                <div key={client.id} className="p-3 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{client.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(client.priority)}`}>
                          {client.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{client.techStack}</p>
                      <p className="text-xs text-gray-600">Due: {new Date(client.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-lg font-bold text-purple-700 font-mono">{client.progress}%</p>
                    </div>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${client.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="flex-1 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded hover:bg-purple-700 transition-colors">
                      Continue
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded hover:bg-gray-200 transition-colors">
                      <Eye className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DepartmentSection>

      {/* Recent Completions */}
      <DepartmentSection
        title="Recent Completions & Feedback"
        icon={<Star className="h-4 w-4 text-green-600" />}
        color="green"
      >
        <div className="space-y-2">
          {writerData.myRecentCompletions.map((completion: any) => (
            <div key={completion.id} className="p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{completion.clientName}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < completion.clientRating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{completion.techStack}</p>
                  {completion.feedback && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs italic text-green-800">"{completion.feedback}"</p>
                    </div>
                  )}
                </div>
                <div className="text-right ml-3">
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-xs font-medium text-gray-700">
                    {new Date(completion.completedDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">{completion.timeToComplete} days</p>
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
          icon={<AlertCircle className="h-4 w-4 text-blue-600" />}
          color="blue"
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
