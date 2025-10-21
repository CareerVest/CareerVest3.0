"use client";

import { EmployeeRanking } from "../utils/leaderboardData";
import { TrendingUp, TrendingDown, Minus, Medal, Crown, Trophy, Flame } from "lucide-react";
import { AchievementBadge } from "./AchievementBadge";
import { achievementDefinitions } from "../utils/leaderboardData";

interface LeaderboardCardProps {
  ranking: EmployeeRanking;
  isTopThree?: boolean;
  showBadges?: boolean;
  onClick?: () => void;
}

export function LeaderboardCard({ ranking, isTopThree = false, showBadges = true, onClick }: LeaderboardCardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Trophy className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-400/50";
      case 2:
        return "bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg shadow-gray-400/50";
      case 3:
        return "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-400/50";
      default:
        return "bg-white text-gray-900 border border-gray-200";
    }
  };

  const getTrendIcon = () => {
    switch (ranking.trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendText = () => {
    if (!ranking.previousRank) return null;
    const change = ranking.previousRank - ranking.rank;
    if (change > 0) return `+${change}`;
    if (change < 0) return change.toString();
    return "—";
  };

  const getTrendColor = () => {
    switch (ranking.trend) {
      case "up":
        return "text-green-600 bg-green-50 border-green-200";
      case "down":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div
      className={`
        relative rounded-lg p-4 transition-all duration-300
        ${getRankColor(ranking.rank)}
        ${isTopThree ? 'scale-105 mb-4' : 'hover:shadow-md mb-2'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          {isTopThree ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold mb-1">
                {ranking.rank}
              </div>
              {getRankIcon(ranking.rank)}
            </div>
          ) : (
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
              ${ranking.rank <= 5 ? 'bg-[#682A53] text-white' : 'bg-gray-100 text-gray-600'}
            `}>
              {ranking.rank}
            </div>
          )}
        </div>

        {/* Employee Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-lg truncate ${isTopThree ? 'text-white' : 'text-gray-900'}`}>
              {ranking.employeeName}
            </h3>
            {ranking.streak > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 rounded-full">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className={`text-xs font-semibold ${isTopThree ? 'text-orange-200' : 'text-orange-600'}`}>
                  {ranking.streak} day streak
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm ${isTopThree ? 'text-white/80' : 'text-gray-600'}`}>
              {ranking.role.replace(/_/g, ' ')}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${isTopThree ? 'bg-white/20 text-white' : 'bg-[#682A53]/10 text-[#682A53]'}`}>
              Level {ranking.level}
            </span>
          </div>

          {/* Score Metric */}
          <div className="mt-2">
            <p className={`text-2xl font-bold ${isTopThree ? 'text-white' : 'text-[#682A53]'}`}>
              {ranking.metric}
            </p>
            <div className="w-full bg-white/20 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${isTopThree ? 'bg-white/40' : 'bg-[#682A53]'}`}
                style={{ width: `${ranking.progressToNextLevel}%` }}
              />
            </div>
            <p className={`text-xs mt-1 ${isTopThree ? 'text-white/70' : 'text-gray-500'}`}>
              {ranking.progressToNextLevel}% to Level {ranking.level + 1}
            </p>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className={`px-3 py-1 rounded-full border flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-semibold">{getTrendText()}</span>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      {showBadges && ranking.badges.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
          <span className={`text-xs font-medium ${isTopThree ? 'text-white/80' : 'text-gray-600'}`}>
            Badges:
          </span>
          <div className="flex gap-1">
            {ranking.badges.slice(0, 5).map((badgeType, idx) => {
              const achievement = {
                id: `badge-${idx}`,
                ...achievementDefinitions[badgeType],
                isUnlocked: true,
                dateEarned: new Date()
              };
              return (
                <AchievementBadge
                  key={idx}
                  achievement={achievement}
                  size="sm"
                  showDetails
                />
              );
            })}
            {ranking.badges.length > 5 && (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                +{ranking.badges.length - 5}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
