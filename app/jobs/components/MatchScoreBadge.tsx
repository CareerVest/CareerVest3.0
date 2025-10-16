'use client';

interface MatchScoreBadgeProps {
  score: number;
}

export function MatchScoreBadge({ score }: MatchScoreBadgeProps) {
  const getScoreColor = () => {
    if (score >= 90) return 'bg-green-50 border-green-300 text-green-700';
    if (score >= 70) return 'bg-blue-50 border-blue-300 text-blue-700';
    if (score >= 50) return 'bg-amber-50 border-amber-300 text-amber-700';
    return 'bg-red-50 border-red-300 text-red-700';
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${getScoreColor()}`}
      >
        <span className="text-lg font-bold font-mono">{score}</span>
        <span className="text-[10px] font-semibold text-gray-600">/100</span>
      </div>
      <span className="text-[9px] font-medium text-gray-500">Match</span>
    </div>
  );
}
