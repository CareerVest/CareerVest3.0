"use client";

import { Achievement } from "../utils/leaderboardData";
import { Lock, Sparkles } from "lucide-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  onClick?: () => void;
}

export function AchievementBadge({ achievement, size = "md", showDetails = false, onClick }: AchievementBadgeProps) {
  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl"
  };

  const rarityColors = {
    Common: "from-gray-400 to-gray-500 border-gray-400",
    Rare: "from-blue-400 to-blue-600 border-blue-400",
    Epic: "from-purple-500 to-pink-600 border-purple-400",
    Legendary: "from-yellow-400 to-orange-500 border-yellow-400"
  };

  const rarityGlow = {
    Common: "shadow-gray-400/50",
    Rare: "shadow-blue-400/50",
    Epic: "shadow-purple-500/50",
    Legendary: "shadow-yellow-400/70"
  };

  return (
    <div
      className={`relative group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Badge Icon */}
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          border-2
          ${achievement.isUnlocked ? `bg-gradient-to-br ${achievement.color} ${rarityColors[achievement.rarity]}` : 'bg-gray-200 border-gray-300'}
          flex items-center justify-center
          transition-all duration-300
          ${achievement.isUnlocked ? `shadow-lg ${rarityGlow[achievement.rarity]} group-hover:shadow-xl group-hover:scale-110` : 'opacity-50'}
          relative
        `}
      >
        {achievement.isUnlocked ? (
          <span className="relative z-10">{achievement.icon}</span>
        ) : (
          <Lock className={`${size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'} text-gray-500`} />
        )}

        {/* Sparkle effect for legendary achievements */}
        {achievement.isUnlocked && achievement.rarity === "Legendary" && (
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-pulse" />
        )}
      </div>

      {/* Badge Details Tooltip */}
      {showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className="bg-gray-900 text-white rounded-lg p-3 shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{achievement.icon}</span>
              <span className="font-semibold text-sm">{achievement.title}</span>
            </div>
            <p className="text-xs text-gray-300 mb-2">{achievement.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded-full ${
                achievement.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                achievement.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-300' :
                achievement.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {achievement.rarity}
              </span>
              <span className="text-yellow-300">{achievement.points} pts</span>
            </div>
            {achievement.dateEarned && (
              <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
                Earned: {new Date(achievement.dateEarned).toLocaleDateString()}
              </div>
            )}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Date badge for unlocked achievements */}
      {achievement.isUnlocked && achievement.dateEarned && !showDetails && (
        <div className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 text-[8px] font-medium text-gray-600 shadow-sm">
          {new Date(achievement.dateEarned).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )}
    </div>
  );
}
