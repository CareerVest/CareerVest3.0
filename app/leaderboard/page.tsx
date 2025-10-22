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
  Zap,
  Grid3x3,
  Gamepad2
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

type ViewMode = "compact" | "gaming";

export default function LeaderboardPage() {
  const { roles } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>("Overall");
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("Monthly");
  const [showConfetti, setShowConfetti] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("compact");

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

  // Gaming mode colors
  const isGaming = viewMode === "gaming";

  return (
    <div className={`min-h-screen ${isGaming ? 'bg-[#0a0a1a]' : 'bg-gray-50'}`}>
      <ConfettiAnimation trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Fixed header section */}
      <div className={`sticky top-0 z-40 shadow-sm ${isGaming ? 'bg-[#1a1a2e] border-b border-[#16213e]' : 'bg-white border-b border-gray-200'}`}>
        <div className="p-4 sm:p-6 w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg shadow-md ${isGaming ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-yellow-400/40'}`}>
                <Trophy className={`h-6 w-6 ${isGaming ? 'text-white' : 'text-yellow-700'}`} />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isGaming ? 'text-white' : 'text-gray-900'}`}>Leaderboard</h1>
                <p className={`text-xs ${isGaming ? 'text-gray-400' : 'text-gray-600'}`}>Track performance & celebrate wins</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className={`flex items-center gap-1 p-1 rounded-lg ${isGaming ? 'bg-[#0f0f23]' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setViewMode("compact")}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-all ${
                    viewMode === "compact"
                      ? isGaming ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50' : 'bg-white text-gray-900 shadow-sm'
                      : isGaming ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3x3 className="h-3.5 w-3.5" />
                  Compact
                </button>
                <button
                  onClick={() => setViewMode("gaming")}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-all ${
                    viewMode === "gaming"
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
                      : isGaming ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Gamepad2 className="h-3.5 w-3.5" />
                  Gaming
                </button>
              </div>

              <button
                onClick={handleCelebrate}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm ${
                  isGaming
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-600/50'
                    : 'bg-gradient-to-r from-[#8B6B9E] to-[#9D7FB3] text-white hover:shadow-md border border-[#8B6B9E]/30'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                🎉 Celebrate!
              </button>
              <button
                onClick={handleRefresh}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
                  isGaming
                    ? 'bg-[#0f0f23] border border-[#16213e] text-gray-400 hover:text-white hover:border-purple-600'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters in compact row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.value;
                return (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                      ${isSelected
                        ? isGaming
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-[#8B6B9E] text-white shadow-sm border border-[#8B6B9E]/30'
                        : isGaming
                          ? 'bg-[#0f0f23] text-gray-400 hover:text-white border border-[#16213e] hover:border-purple-600'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }
                    `}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : isGaming ? 'text-gray-500' : category.color}`} />
                    {category.label}
                  </button>
                );
              })}
            </div>

            <div className={`h-6 w-px ${isGaming ? 'bg-[#16213e]' : 'bg-gray-300'}`} />

            {/* Period Filter */}
            <div className="flex items-center gap-1.5">
              {periods.map((period) => {
                const isSelected = selectedPeriod === period;
                return (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`
                      px-2.5 py-1 rounded-md text-xs font-medium transition-all
                      ${isSelected
                        ? isGaming
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-[#8B6B9E] text-white'
                        : isGaming
                          ? 'bg-[#0f0f23] text-gray-400 hover:text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {period === "AllTime" ? "All Time" : period}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main content - full width, compact spacing */}
      <div className="p-4 sm:p-6 w-full space-y-4">
        {/* Announcements */}
        <AnnouncementBanner />

        {/* Main grid - 2 columns with proper gap */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left column - Leaderboard (3/4 width) */}
          <div className="lg:col-span-3 space-y-4 overflow-hidden">
            {/* Top 3 Podium */}
            <div className={`rounded-lg p-4 shadow-sm ${
              isGaming
                ? 'bg-[#1a1a2e] border border-[#16213e]'
                : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-lg font-bold flex items-center gap-2 ${isGaming ? 'text-white' : 'text-gray-900'}`}>
                  <Trophy className={`h-5 w-5 ${isGaming ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  Top Performers
                </h2>
                <span className={`text-xs ${isGaming ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedCategory} • {selectedPeriod}
                </span>
              </div>

              <div className="space-y-2 px-1">
                {leaderboardData.topThree.map((ranking) => (
                  <LeaderboardCard
                    key={ranking.employeeId}
                    ranking={ranking}
                    isTopThree
                    showBadges
                  />
                ))}
              </div>
            </div>

            {/* Rest of Rankings */}
            <div className={`rounded-lg p-4 shadow-sm ${
              isGaming
                ? 'bg-[#1a1a2e] border border-[#16213e]'
                : 'bg-white border border-gray-200'
            }`}>
              <h3 className={`text-sm font-semibold mb-3 ${isGaming ? 'text-gray-300' : 'text-gray-700'}`}>All Rankings</h3>
              <div className="space-y-2 px-1">
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

          {/* Right sidebar - Stats (1/4 width) */}
          <div className="space-y-4 overflow-hidden">
            {/* Personal Stats Compact */}
            <div className={`rounded-lg p-3 text-white shadow-sm overflow-hidden ${
              isGaming
                ? 'bg-gradient-to-br from-purple-900 to-pink-900 border border-purple-700/30'
                : 'bg-gradient-to-br from-[#8B6B9E] to-[#9D7FB3]'
            }`}>
              <h3 className="text-xs font-bold mb-2">Your Performance</h3>

              <div className="text-center mb-2">
                <p className="text-[10px] text-white/70 mb-1">Current Rank</p>
                <p className={`text-2xl font-bold ${isGaming ? 'text-yellow-400' : 'text-white'}`}>#{personalStats.currentRank}</p>
                <p className="text-[10px] text-white/60">of {personalStats.totalEmployees}</p>
              </div>

              <div className="flex justify-center mb-2">
                <ProgressRing
                  progress={(personalStats.totalPoints / (personalStats.totalPoints + personalStats.pointsToNextLevel)) * 100}
                  size={60}
                  strokeWidth={5}
                  color={isGaming ? "#a855f7" : "#FCD34D"}
                  backgroundColor="rgba(255,255,255,0.2)"
                >
                  <div className="text-center">
                    <div className={`text-lg font-bold ${isGaming ? 'text-purple-400' : 'text-white'}`}>{personalStats.level}</div>
                    <div className="text-[7px] text-white/70">Level</div>
                  </div>
                </ProgressRing>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {personalStats.achievements
                  .filter(a => a.isUnlocked)
                  .slice(0, 6)
                  .map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      size="sm"
                      showDetails
                    />
                  ))}
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded p-2">
                <p className="text-xs font-medium mb-1">Recent Wins 🎉</p>
                <ul className="space-y-0.5">
                  {personalStats.recentWins.slice(0, 3).map((win, idx) => (
                    <li key={idx} className="text-[10px] text-white/80">• {win}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`rounded-lg p-2.5 shadow-sm overflow-hidden ${
              isGaming
                ? 'bg-[#1a1a2e] border border-[#16213e]'
                : 'bg-white border border-gray-200'
            }`}>
              <h3 className={`text-[10px] font-semibold mb-2 ${isGaming ? 'text-gray-300' : 'text-gray-900'}`}>Quick Stats</h3>
              <div className="space-y-2">
                <div className={`p-2 rounded ${
                  isGaming
                    ? 'bg-green-900/20 border border-green-700/30'
                    : 'bg-green-50/50 border border-green-200'
                }`}>
                  <p className={`text-[9px] font-medium mb-0.5 ${isGaming ? 'text-green-400' : 'text-green-700'}`}>Most Improved</p>
                  <p className={`text-xs font-bold ${isGaming ? 'text-green-300' : 'text-green-800'}`}>Emily Rodriguez</p>
                  <p className={`text-[9px] ${isGaming ? 'text-green-500' : 'text-green-600'}`}>↑ 4 positions</p>
                </div>

                <div className={`p-2 rounded ${
                  isGaming
                    ? 'bg-purple-900/20 border border-purple-700/30'
                    : 'bg-purple-50/50 border border-purple-200'
                }`}>
                  <p className={`text-[9px] font-medium mb-0.5 ${isGaming ? 'text-purple-400' : 'text-purple-700'}`}>Longest Streak</p>
                  <p className={`text-xs font-bold ${isGaming ? 'text-purple-300' : 'text-purple-800'}`}>Olivia Martinez</p>
                  <p className={`text-[9px] ${isGaming ? 'text-purple-500' : 'text-purple-600'}`}>🔥 20 days</p>
                </div>
              </div>
            </div>

            {/* Targets */}
            <div className={`rounded-lg p-3 shadow-sm overflow-hidden ${
              isGaming
                ? 'bg-[#1a1a2e] border border-[#16213e]'
                : 'bg-white border border-gray-200'
            }`}>
              <h3 className={`text-xs font-semibold mb-2 ${isGaming ? 'text-gray-300' : 'text-gray-900'}`}>Your Targets</h3>
              <div className="space-y-2">
                {personalStats.targets.slice(0, 2).map((target, idx) => (
                  <div key={idx} className={`p-2 rounded ${isGaming ? 'bg-[#0f0f23]' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-[10px] font-medium ${isGaming ? 'text-gray-400' : 'text-gray-700'}`}>{target.targetType}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        target.status === "Exceeded"
                          ? isGaming ? "bg-green-900/30 text-green-400 border border-green-700/30" : "bg-green-100 text-green-700"
                          : isGaming ? "bg-blue-900/30 text-blue-400 border border-blue-700/30" : "bg-blue-100 text-blue-700"
                      }`}>
                        {target.status}
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-1.5 mb-1 ${isGaming ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-1.5 rounded-full ${
                          target.progress >= 100
                            ? isGaming ? "bg-green-500" : "bg-green-500"
                            : isGaming ? "bg-blue-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min(target.progress, 100)}%` }}
                      />
                    </div>
                    <p className={`text-[9px] ${isGaming ? 'text-gray-500' : 'text-gray-600'}`}>
                      {target.currentValue}/{target.targetValue} {target.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Quote */}
            <MotivationalQuote />
          </div>
        </div>
      </div>
    </div>
  );
}
