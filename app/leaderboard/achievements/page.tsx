"use client";

import { useState } from "react";
import { useAuth } from "../../../contexts/authContext";
import { redirect } from "next/navigation";
import { Award, Lock, Sparkles, TrendingUp, Target, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPersonalStats, achievementDefinitions, AchievementType } from "../utils/leaderboardData";
import { AchievementBadge } from "../components/AchievementBadge";
import { ConfettiAnimation } from "../components/ConfettiAnimation";
import { ProgressRing } from "../components/ProgressRing";

export default function AchievementsPage() {
  const { roles } = useAuth();
  const [selectedRarity, setSelectedRarity] = useState<"All" | "Common" | "Rare" | "Epic" | "Legendary">("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Unlocked" | "Locked">("All");
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

  // Only allow admins for now
  if (!roles?.includes("Admin")) {
    redirect("/dashboard");
  }

  const personalStats = getPersonalStats();

  const filteredAchievements = personalStats.achievements.filter(achievement => {
    const rarityMatch = selectedRarity === "All" || achievement.rarity === selectedRarity;
    const statusMatch = selectedStatus === "All" ||
      (selectedStatus === "Unlocked" && achievement.isUnlocked) ||
      (selectedStatus === "Locked" && !achievement.isUnlocked);
    return rarityMatch && statusMatch;
  });

  const unlockedCount = personalStats.achievements.filter(a => a.isUnlocked).length;
  const totalCount = personalStats.achievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  const rarityStats = {
    Common: personalStats.achievements.filter(a => a.rarity === "Common" && a.isUnlocked).length,
    Rare: personalStats.achievements.filter(a => a.rarity === "Rare" && a.isUnlocked).length,
    Epic: personalStats.achievements.filter(a => a.rarity === "Epic" && a.isUnlocked).length,
    Legendary: personalStats.achievements.filter(a => a.rarity === "Legendary" && a.isUnlocked).length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ConfettiAnimation trigger={selectedAchievement !== null} onComplete={() => setSelectedAchievement(null)} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#682A53] mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leaderboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Achievements</h1>
                  <p className="text-sm text-gray-600">Track your progress and unlock new badges</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Total Points</p>
              <p className="text-4xl font-bold text-[#682A53]">{personalStats.totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-gradient-to-br from-[#682A53] to-[#8f3f72] rounded-xl p-6 text-white shadow-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            Overall Progress
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Completion Ring */}
            <div className="flex flex-col items-center justify-center">
              <ProgressRing
                progress={completionPercentage}
                size={160}
                strokeWidth={12}
                color="#FCD34D"
                backgroundColor="rgba(255,255,255,0.2)"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">{completionPercentage.toFixed(0)}%</div>
                  <div className="text-xs text-white/70">Complete</div>
                </div>
              </ProgressRing>
              <p className="text-sm text-white/80 mt-4">
                {unlockedCount} of {totalCount} achievements unlocked
              </p>
            </div>

            {/* Stats Breakdown */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-yellow-300" />
                    <p className="text-sm font-medium">Current Level</p>
                  </div>
                  <p className="text-3xl font-bold">{personalStats.level}</p>
                  <p className="text-xs text-white/70 mt-1">{personalStats.pointsToNextLevel} pts to next level</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-300" />
                    <p className="text-sm font-medium">Current Rank</p>
                  </div>
                  <p className="text-3xl font-bold">#{personalStats.currentRank}</p>
                  <p className="text-xs text-white/70 mt-1">of {personalStats.totalEmployees} employees</p>
                </div>
              </div>

              {/* Rarity Breakdown */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm font-medium mb-3">Achievements by Rarity</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-300">{rarityStats.Legendary}</div>
                    <div className="text-xs text-white/70">Legendary</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-300">{rarityStats.Epic}</div>
                    <div className="text-xs text-white/70">Epic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-300">{rarityStats.Rare}</div>
                    <div className="text-xs text-white/70">Rare</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-300">{rarityStats.Common}</div>
                    <div className="text-xs text-white/70">Common</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(["All", "Unlocked", "Locked"] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${selectedStatus === status
                      ? "bg-[#682A53] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* Rarity Filter */}
            {(["All", "Common", "Rare", "Epic", "Legendary"] as const).map(rarity => (
              <button
                key={rarity}
                onClick={() => setSelectedRarity(rarity)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${selectedRarity === rarity
                    ? "bg-[#682A53] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {rarity}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              All Achievements ({filteredAchievements.length})
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`
                  group relative p-4 rounded-xl border-2 transition-all duration-300
                  ${achievement.isUnlocked
                    ? "bg-white border-gray-200 hover:border-[#682A53] hover:shadow-lg cursor-pointer"
                    : "bg-gray-50 border-gray-200 opacity-60"
                  }
                `}
                onClick={() => achievement.isUnlocked && setSelectedAchievement(achievement.id)}
              >
                {/* Achievement Badge */}
                <div className="flex justify-center mb-3">
                  <AchievementBadge achievement={achievement} size="lg" />
                </div>

                {/* Achievement Info */}
                <div className="text-center">
                  <h3 className={`font-semibold text-sm mb-1 ${achievement.isUnlocked ? "text-gray-900" : "text-gray-500"}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-xs mb-2 ${achievement.isUnlocked ? "text-gray-600" : "text-gray-400"}`}>
                    {achievement.description}
                  </p>

                  {/* Rarity Badge */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      achievement.rarity === "Legendary" ? "bg-yellow-100 text-yellow-700" :
                      achievement.rarity === "Epic" ? "bg-purple-100 text-purple-700" :
                      achievement.rarity === "Rare" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {achievement.rarity}
                    </span>
                  </div>

                  {/* Points */}
                  <div className="flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-bold text-[#682A53]">{achievement.points} pts</span>
                  </div>

                  {/* Date Earned */}
                  {achievement.isUnlocked && achievement.dateEarned && (
                    <p className="text-xs text-gray-500 mt-2">
                      Earned {new Date(achievement.dateEarned).toLocaleDateString()}
                    </p>
                  )}

                  {/* Locked Indicator */}
                  {!achievement.isUnlocked && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-gray-400">
                      <Lock className="h-3 w-3" />
                      <span className="text-xs">Locked</span>
                    </div>
                  )}
                </div>

                {/* Hover Effect for Unlocked */}
                {achievement.isUnlocked && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#682A53]/5 to-[#8f3f72]/5 rounded-xl" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No achievements match your filters</p>
            </div>
          )}
        </div>

        {/* Next Achievements to Unlock */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Up Next
          </h2>
          <p className="text-sm text-white/80 mb-4">
            Here are some achievements you're close to unlocking. Keep pushing!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personalStats.achievements
              .filter(a => !a.isUnlocked)
              .slice(0, 3)
              .map((achievement) => (
                <div key={achievement.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{achievement.title}</p>
                      <p className="text-xs text-white/70">{achievement.points} points</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/80">{achievement.description}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
