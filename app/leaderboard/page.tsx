"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/authContext";
import { redirect } from "next/navigation";
import {
  Trophy,
  TrendingUp,
  Users,
  Award,
  Filter,
  Download,
  RefreshCw,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import {
  getSalesLeaderboard,
  getRecruiterLeaderboard,
  getResumeWriterLeaderboard,
  getOverallLeaderboard,
  getPersonalStats,
  TimePeriod,
  LeaderboardCategory
} from "./utils/leaderboardData";
import { LeaderboardCard } from "./components/LeaderboardCard";
import { MotivationalQuote } from "./components/MotivationalQuote";
import { AchievementBadge } from "./components/AchievementBadge";
import { ProgressRing } from "./components/ProgressRing";
import { AnnouncementBanner } from "./components/AnnouncementBanner";
import { ConfettiAnimation } from "./components/ConfettiAnimation";

export default function LeaderboardPage() {
  const { roles } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>("Overall");
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("Monthly");
  const [showConfetti, setShowConfetti] = useState(false);

  // Only allow admins for now
  if (!roles?.includes("Admin")) {
    redirect("/dashboard");
  }

  const getLeaderboardData = () => {
    switch (selectedCategory) {
      case "Sales":
        return getSalesLeaderboard(selectedPeriod);
      case "Recruiter":
        return getRecruiterLeaderboard(selectedPeriod);
      case "ResumeWriter":
        return getResumeWriterLeaderboard(selectedPeriod);
      default:
        return getOverallLeaderboard(selectedPeriod);
    }
  };

  const personalStats = getPersonalStats();
  const leaderboardData = getLeaderboardData();

  const categories: { value: LeaderboardCategory; label: string; icon: any; color: string }[] = [
    { value: "Overall", label: "Overall", icon: Trophy, color: "text-[#682A53]" },
    { value: "Sales", label: "Sales", icon: TrendingUp, color: "text-green-600" },
    { value: "Recruiter", label: "Recruiters", icon: Users, color: "text-blue-600" },
    { value: "ResumeWriter", label: "Resume Writers", icon: Award, color: "text-purple-600" }
  ];

  const periods: TimePeriod[] = ["Daily", "Weekly", "Monthly", "Quarterly", "AllTime"];

  const handleRefresh = () => {
    // In real app, would trigger data refresh
  };

  const handleCelebrate = () => {
    setShowConfetti(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ConfettiAnimation trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
                <p className="text-sm text-gray-600">Track performance, celebrate wins, achieve greatness</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCelebrate}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all flex items-center gap-2 text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Sparkles className="h-4 w-4" />
              🎉 Celebrate!
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* WIP Banner */}
        <div className="p-3 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                🚧 Work In Progress - Wireframe Preview
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                This leaderboard displays dummy data for demonstration purposes. In production, rankings will be calculated in real-time based on actual performance metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <AnnouncementBanner />

        {/* Motivational Quote */}
        <MotivationalQuote />

        {/* Personal Stats Card */}
        <div className="bg-gradient-to-br from-[#682A53] to-[#8f3f72] rounded-xl p-6 text-white shadow-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            Your Performance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rank & Level */}
            <div>
              <div className="mb-4">
                <p className="text-sm text-white/70 mb-1">Current Rank</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">#{personalStats.currentRank}</span>
                  <span className="text-white/70">of {personalStats.totalEmployees}</span>
                </div>
                <p className="text-xs text-white/60 mt-1">{personalStats.role}</p>
              </div>

              <div>
                <p className="text-sm text-white/70 mb-2">Level Progress</p>
                <ProgressRing
                  progress={(personalStats.totalPoints / (personalStats.totalPoints + personalStats.pointsToNextLevel)) * 100}
                  size={100}
                  strokeWidth={8}
                  color="#FCD34D"
                  backgroundColor="rgba(255,255,255,0.2)"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold">{personalStats.level}</div>
                    <div className="text-xs text-white/70">Level</div>
                  </div>
                </ProgressRing>
                <p className="text-xs text-white/70 mt-2">
                  {personalStats.pointsToNextLevel} points to Level {personalStats.level + 1}
                </p>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="md:col-span-2">
              <p className="text-sm text-white/70 mb-3">Recent Achievements</p>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {personalStats.achievements
                  .filter(a => a.isUnlocked)
                  .slice(0, 10)
                  .map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      size="md"
                      showDetails
                    />
                  ))}
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Recent Wins 🎉</p>
                <ul className="space-y-1">
                  {personalStats.recentWins.map((win, idx) => (
                    <li key={idx} className="text-xs text-white/80 flex items-start gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Category:</span>
            </div>

            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedCategory === category.value
                      ? 'bg-[#682A53] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${selectedCategory === category.value ? 'text-white' : category.color}`} />
                    {category.label}
                  </div>
                </button>
              );
            })}

            <div className="h-6 w-px bg-gray-300" />

            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Period:</span>
            </div>

            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${selectedPeriod === period
                    ? 'bg-[#682A53] text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {period === "AllTime" ? "All Time" : period}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 3 Podium */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">🏆 Top Performers</h2>
                <span className="text-xs text-gray-500">
                  Updated {leaderboardData.lastUpdated.toLocaleTimeString()}
                </span>
              </div>

              {/* Podium Display */}
              <div className="mb-6">
                {leaderboardData.topThree.map((ranking) => (
                  <LeaderboardCard
                    key={ranking.employeeId}
                    ranking={ranking}
                    isTopThree
                    showBadges
                  />
                ))}
              </div>

              {/* Rest of Rankings */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  All Rankings
                </h3>
                {leaderboardData.rankings.slice(3).map((ranking) => (
                  <LeaderboardCard
                    key={ranking.employeeId}
                    ranking={ranking}
                    showBadges={false}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#682A53]" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 font-medium mb-1">Most Improved</p>
                  <p className="text-lg font-bold text-green-900">Emily Rodriguez</p>
                  <p className="text-xs text-green-600">↑ 4 positions this month</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-700 font-medium mb-1">Longest Streak</p>
                  <p className="text-lg font-bold text-purple-900">Olivia Martinez</p>
                  <p className="text-xs text-purple-600">🔥 20 consecutive days</p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">New Achievement</p>
                  <p className="text-lg font-bold text-blue-900">Amanda Foster</p>
                  <p className="text-xs text-blue-600">🎯 Placement Master unlocked</p>
                </div>
              </div>
            </div>

            {/* Upcoming Targets */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-[#682A53]" />
                Your Targets
              </h3>
              <div className="space-y-3">
                {personalStats.targets.map((target, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-700">{target.targetType}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        target.status === "Exceeded" ? "bg-green-100 text-green-700" :
                        target.status === "OnTrack" ? "bg-blue-100 text-blue-700" :
                        target.status === "AtRisk" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {target.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            target.progress >= 100 ? "bg-green-500" :
                            target.progress >= 75 ? "bg-blue-500" :
                            target.progress >= 50 ? "bg-amber-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(target.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{target.currentValue} / {target.targetValue} {target.unit}</span>
                      <span>{target.daysRemaining} days left</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Progress */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Achievement Progress
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Achievements Unlocked</span>
                  <span className="text-lg font-bold">
                    {personalStats.achievements.filter(a => a.isUnlocked).length} / {personalStats.achievements.length}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="h-3 bg-white rounded-full transition-all duration-1000"
                    style={{
                      width: `${(personalStats.achievements.filter(a => a.isUnlocked).length / personalStats.achievements.length) * 100}%`
                    }}
                  />
                </div>
                <p className="text-xs text-white/80 mt-2">
                  Keep going! {personalStats.achievements.filter(a => !a.isUnlocked).length} more achievements to unlock
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
