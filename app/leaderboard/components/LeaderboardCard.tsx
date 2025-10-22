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
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-500" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-gray-800 border-2 border-yellow-400/40 shadow-sm";
      case 2:
        return "bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100 text-gray-800 border-2 border-gray-400/40 shadow-sm";
      case 3:
        return "bg-gradient-to-br from-orange-50 via-amber-100 to-orange-100 text-gray-800 border-2 border-amber-400/40 shadow-sm";
      default:
        return "bg-white text-gray-900 border border-gray-200";
    }
  };

  const getTrendIcon = () => {
    switch (ranking.trend) {
      case "up":
        return <TrendingUp className="h-3.5 w-3.5 text-green-600" />;
      case "down":
        return <TrendingDown className="h-3.5 w-3.5 text-red-600" />;
      default:
        return <Minus className="h-3.5 w-3.5 text-gray-400" />;
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
        return "text-green-700 bg-green-50 border-green-300";
      case "down":
        return "text-red-700 bg-red-50 border-red-300";
      default:
        return "text-gray-600 bg-gray-50 border-gray-300";
    }
  };

  return (
    <div
      className={`
        relative rounded-lg p-3 transition-all duration-300
        ${getRankColor(ranking.rank)}
        ${isTopThree ? 'mb-2' : 'hover:shadow-md mb-2'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          {isTopThree ? (
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mb-1 ${
                ranking.rank === 1 ? 'bg-yellow-200/50 text-yellow-800' :
                ranking.rank === 2 ? 'bg-gray-200/50 text-gray-700' :
                'bg-amber-200/50 text-amber-800'
              }`}>
                {ranking.rank}
              </div>
              {getRankIcon(ranking.rank)}
            </div>
          ) : (
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${ranking.rank <= 5 ? 'bg-[#8B6B9E] text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              {ranking.rank}
            </div>
          )}
        </div>

        {/* Employee Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-base truncate text-gray-900">
              {ranking.employeeName}
            </h3>
            {ranking.streak > 0 && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 rounded-full border border-orange-300">
                <Flame className="h-3 w-3 text-orange-600" />
                <span className="text-[10px] font-semibold text-orange-700">
                  {ranking.streak}d
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-gray-600">
              {ranking.role.replace(/_/g, ' ')}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#8B6B9E]/10 text-[#8B6B9E] border border-[#8B6B9E]/20">
              Lv {ranking.level}
            </span>
          </div>

          {/* Score Metric */}
          <div>
            <p className="text-lg font-bold text-[#8B6B9E]">
              {ranking.metric}
            </p>
            <div className="w-full bg-gray-200/60 rounded-full h-1.5 mt-1">
              <div
                className="h-1.5 rounded-full bg-[#8B6B9E]"
                style={{ width: `${ranking.progressToNextLevel}%` }}
              />
            </div>
            <p className="text-[10px] mt-0.5 text-gray-500">
              {ranking.progressToNextLevel}% to Level {ranking.level + 1}
            </p>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className={`px-2 py-1 rounded-full border flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-xs font-semibold">{getTrendText()}</span>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      {showBadges && ranking.badges.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center gap-2">
          <span className="text-[10px] font-medium text-gray-600">
            Badges:
          </span>
          <div className="flex gap-1">
            {ranking.badges.slice(0, 4).map((badgeType, idx) => {
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
            {ranking.badges.length > 4 && (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-600 border border-gray-300">
                +{ranking.badges.length - 4}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
